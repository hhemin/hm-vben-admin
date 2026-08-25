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
   * 重新认证逻辑
   */
  async function doReAuthenticate() {
    console.warn('Access token or refresh token is invalid or expired. ');
    const accessStore = useAccessStore();
    const authStore = useAuthStore();
    accessStore.setAccessToken(null);
    if (
      preferences.app.loginExpiredMode === 'modal' &&
      accessStore.isAccessChecked
    ) {
      accessStore.setLoginExpired(true);
    } else {
      await authStore.logout();
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

  // 请求头及 Loading 拦截
  client.addRequestInterceptor({
    fulfilled: async (config) => {
      const accessStore = useAccessStore();

      config.headers.Authorization = formatToken(accessStore.accessToken);
      config.headers['Accept-Language'] = preferences.app.locale;

      // 支持配置 loading / screen_loading 参数
      if ((config as any).loading || (config as any).screen_loading) {
        startLoading({
          target: (config as any).loadingTarget,
          text: (config as any).loadingText,
        });
      }

      return config;
    },
    rejected: async (error) => {
      endLoading();
      return Promise.reject(error);
    },
  });

  // 处理返回的响应数据格式
  client.addResponseInterceptor(
    defaultResponseInterceptor({
      codeField: 'code',
      dataField: 'data',
      successCode: 200,
    }),
  );

  // token过期的处理
  client.addResponseInterceptor(
    authenticateResponseInterceptor({
      client,
      doReAuthenticate,
      doRefreshToken,
      enableRefreshToken: preferences.app.enableRefreshToken,
      formatToken,
    }),
  );

  // 响应结束关闭 Loading
  client.addResponseInterceptor({
    fulfilled: async (response) => {
      if (
        (response.config as any)?.loading ||
        (response.config as any)?.screen_loading
      ) {
        endLoading();
      }
      return response;
    },
    rejected: async (error) => {
      if (
        (error?.config as any)?.loading ||
        (error?.config as any)?.screen_loading
      ) {
        endLoading();
      }
      return Promise.reject(error);
    },
  });

  // 通用的错误处理,如果没有进入上面的错误处理逻辑，就会进入这里
  client.addResponseInterceptor(
    errorMessageResponseInterceptor((msg: string, error) => {
      // 这里可以根据业务进行定制,你可以拿到 error 内的信息进行定制化处理，根据不同的 code 做不同的提示，而不是直接使用 message.error 提示 msg
      const responseData = error?.response?.data ?? {};
      const errorMessage =
        responseData?.msg ??
        responseData?.message ??
        responseData?.error ??
        responseData?.detail ??
        '';
      // 如果没有错误信息，则会根据状态码进行提示
      ElMessage.error(errorMessage || msg);
    }),
  );

  return client;
}

export const requestClient = createRequestClient(apiURL, {
  responseReturn: 'data',
});

export const baseRequestClient = new RequestClient({ baseURL: apiURL });
