import { requestClient } from '#/api/request';

export interface AdminProfileUpdateParams {
  phone?: string | null;
  avatar?: string | null;
  remark?: string | null;
  category?: string | null;
}

export interface AdminChangePasswordParams {
  oldPassword: string;
  newPassword: string;
  confirmPassword?: string | null;
}

/**
 * 获取当前登录管理员/教师个人信息
 */
export async function getUserInfoApi() {
  return requestClient.get<any>('/admin/me');
}

/**
 * 修改当前登录用户个人资料
 */
export async function updateAdminProfileApi(data: AdminProfileUpdateParams) {
  return requestClient.put<any>('/admin/profile', data);
}

/**
 * 修改当前登录用户密码
 */
export async function changeAdminPasswordApi(data: AdminChangePasswordParams) {
  return requestClient.post<any>('/admin/change-password', data);
}

