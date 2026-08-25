import type { Recordable, UserInfo } from '@vben/types';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { LOGIN_PATH } from '@vben/constants';
import { preferences } from '@vben/preferences';
import { resetAllStores, useAccessStore, useUserStore } from '@vben/stores';

import { ElNotification } from 'element-plus';
import { defineStore } from 'pinia';

import { getUserInfoApi, loginApi, logoutApi } from '#/api';
import { $t } from '#/locales';

export const useAuthStore = defineStore('auth', () => {
  const accessStore = useAccessStore();
  const userStore = useUserStore();
  const router = useRouter();

  const loginLoading = ref(false);

  /**
   * 异步处理登录操作
   * Asynchronously handle the login process
   * @param params 登录表单数据
   */
  async function authLogin(
    params: Recordable<any>,
    onSuccess?: () => Promise<void> | void,
  ) {
    // 异步处理用户登录操作并获取 accessToken
    let userInfo: null | UserInfo = null;
    try {
      loginLoading.value = true;
      const res = await loginApi(params);
      const token = res.access_token || res.accessToken;

      // 如果成功获取到 accessToken
      if (token) {
        // 将 accessToken 存储到 accessStore 中
        accessStore.setAccessToken(token);

        // 如果后端登录返回了 roles，直接写入 accessCodes / roles
        if (res.roles && Array.isArray(res.roles)) {
          accessStore.setAccessCodes(res.roles);
        }

        // 获取详细用户信息
        try {
          const fetchUserInfoResult = await fetchUserInfo();
          userInfo = fetchUserInfoResult;
        } catch {
          // 如果 /admin/users/info 暂时不可用，用登录返回的信息做兜底
          userInfo = {
            avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
            desc: '',
            homePath: preferences.app.defaultHomePath,
            realName: res.phone || 'Admin',
            roles: res.roles || ['admin'],
            token,
            userId: String(res.admin_id || 1),
            username: res.phone || 'Admin',
          } as UserInfo;
          userStore.setUserInfo(userInfo);
        }

        if (accessStore.loginExpired) {
          accessStore.setLoginExpired(false);
        } else {
          onSuccess
            ? await onSuccess?.()
            : await router.push(
                userInfo?.homePath || preferences.app.defaultHomePath,
              );
        }

        if (userInfo?.realName || userInfo?.username) {
          ElNotification({
            message: `${$t('authentication.loginSuccessDesc')}:${userInfo?.realName || userInfo?.username}`,
            title: $t('authentication.loginSuccess'),
            type: 'success',
          });
        }
      }
    } finally {
      loginLoading.value = false;
    }

    return {
      userInfo,
    };
  }

  async function logout(redirect: boolean = true) {
    try {
      await logoutApi();
    } catch {
      // 不做任何处理
    }
    resetAllStores();
    accessStore.setLoginExpired(false);

    // 回登录页带上当前路由地址
    await router.replace({
      path: LOGIN_PATH,
      query: redirect
        ? {
            redirect: encodeURIComponent(router.currentRoute.value.fullPath),
          }
        : {},
    });
  }

  async function fetchUserInfo() {
    const rawUserInfo: any = await getUserInfoApi();
    const userInfo: UserInfo = {
      avatar:
        rawUserInfo?.avatar ||
        'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
      desc: rawUserInfo?.remark || '',
      homePath: preferences.app.defaultHomePath,
      realName: rawUserInfo?.employee_no || rawUserInfo?.phone || 'Admin',
      roles: rawUserInfo?.roles || ['admin'],
      token: accessStore.accessToken || '',
      userId: String(rawUserInfo?.id || rawUserInfo?.admin_id || ''),
      username: rawUserInfo?.phone || '',
      ...rawUserInfo,
    };
    userStore.setUserInfo(userInfo);
    if (userInfo.roles && userInfo.roles.length > 0) {
      accessStore.setAccessCodes(userInfo.roles);
    }
    return userInfo;
  }

  function $reset() {
    loginLoading.value = false;
  }

  return {
    $reset,
    authLogin,
    fetchUserInfo,
    loginLoading,
    logout,
  };
});
