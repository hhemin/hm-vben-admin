/**
 * 该文件可自行根据业务逻辑进行调整
 */
import type { RequestClientOptions } from '@vben/request';

import { useAppConfig } from '@vben/hooks';
import { preferences } from '@vben/preferences';
import {
  authenticateResponseInterceptor,
  defaultResponseInterceptor,
  errorMessageResponseInterceptor,
  RequestClient,
} from '@vben/request';
import { useAccessStore } from '@vben/stores';

import { ElLoading, ElMessage } from 'element-plus';

import { useAuthStore } from '#/store';

import { refreshTokenApi } from './core';

const { apiURL } = useAppConfig(import.meta.env, import.meta.env.PROD);

// 全局 Loading 管理
let loadingCount = 0;
let loadingInstance: ReturnType<typeof ElLoading.service> | null = null;

export function startLoading(options?: {
  target?: HTMLElement | string;
  text?: string;
  background?: string;
}) {
  loadingCount++;
  if (loadingCount === 1) {
    loadingInstance = ElLoading.service({
      fullscreen: !options?.target,
      target: options?.target,
      text: options?.text || '数据加载中...',
      background: options?.background || 'rgba(0, 0, 0, 0.35)',
    });
  }
}

export function endLoading() {
  if (loadingCount > 0) {
    loadingCount--;
  }
  if (loadingCount === 0 && loadingInstance) {
    setTimeout(() => {
      if (loadingCount === 0 && loadingInstance) {
        loadingInstance.close();
        loadingInstance = null;
      }
    }, 200);
  }
}

function createRequestClient(baseURL: string, options?: RequestClientOptions) {
  const client = new RequestClient({
    ...options,
    baseURL,
  });

  /**
   * 重新认证逻辑（防重/单例锁，防止并发 401 接口多次触发跳转登录页）
   */
  let isReAuthenticating = false;

  async function doReAuthenticate() {
    if (isReAuthenticating) {
      return;
    }
    isReAuthenticating = true;
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    try {
      if (
        preferences.app.loginExpiredMode === 'modal' &&
        accessStore.isAccessChecked
      ) {
        accessStore.setLoginExpired(true);
      } else {
        await authStore.logout();
      }
    } finally {
      // 保持防重锁，防止跳转/重定向期间后续并发接口重复触发 logout
      setTimeout(() => {
        isReAuthenticating = false;
      }, 3000);
    }
  }

  /**
   * 刷新token逻辑
   */
  async function doRefreshToken() {
    const accessStore = useAccessStore();
    const resp = await refreshTokenApi();
    const newToken = resp.data;
    accessStore.setAccessToken(newToken);
    return newToken;
  }

  function formatToken(token: null | string) {
    return token ? `Bearer ${token}` : null;
  }

  // 1. 请求头及 Loading 开启拦截器
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;

      // 支持配置 loading / screen_loading 参数
      if ((config as any)?.loading || (config as any)?.screen_loading) {
        startLoading({
          target: (config as any)?.loadingTarget,
          text: (config as any)?.loadingText,
        });
      }

      return config;
    },
    rejected: async (error) => {
      endLoading();
      return Promise.reject(error);
    },
  });

  // 2. 响应拦截器：关闭 Loading（在任何数据解构前执行，保证拿到的是完整的 AxiosResponse）
  client.addResponseInterceptor({
    fulfilled: async (response) => {
      if (
        (response as any)?.config?.loading ||
        (response as any)?.config?.screen_loading
      ) {
        endLoading();
      }
      return response;
    },
    rejected: async (error) => {
      if (
        (error as any)?.config?.loading ||
        (error as any)?.config?.screen_loading
      ) {
        endLoading();
      }
      return Promise.reject(error);
    },
  });

  // 3. 响应拦截器：HTTP 401 刷新 token 处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 4. 响应拦截器：业务 code 401 (如 {"code":401,"msg":"token已过期","data":null}) token过期处理
  client.addResponseInterceptor({
    fulfilled: async (response) => {
      const responseData = response?.data;
      if (responseData?.code === 401) {
        await doReAuthenticate();
      }
      return response;
    },
    rejected: async (error) => {
      const responseData = error?.response?.data;
      const status = error?.response?.status;
      const code = responseData?.code;

      if (code === 401 || status === 401) {
        await doReAuthenticate();
      }
      return Promise.reject(error);
    },
  });

  // 5. 响应拦截器：处理返回的响应数据格式（解包 data，检验 successCode）
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: (code: any) => code === 200 || code === 0 || code === '200',
    }),
  );

  // 6. 响应拦截器：通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      const responseData = error?.response?.data ?? {};
      const status = error?.response?.status;
      const code = responseData?.code;

      // 若为 401 token 过期或正在重定向登录中，忽略弹窗提示，防止多个并发接口触发多次 Toast
      if (code === 401 || status === 401 || isReAuthenticating) {
        return;
      }

      const errorMessage =
        responseData?.msg ??
        responseData?.message ??
        responseData?.error ??
        responseData?.detail ??
        '';
      ElMessage.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
