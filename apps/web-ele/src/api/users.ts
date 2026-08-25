import { requestClient } from '#/api/request';

export interface UserItem {
  address?: string;
  avatar?: string;
  created_at?: string;
  email?: string;
  id: number;
  phone: string;
  roles?: string[];
  status?: number;
  updated_at?: string;
  username: string;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  phone?: string;
  role?: string;
  username?: string;
}

/**
 * 获取用户列表
 */
export async function getUsersApi(params?: UserQueryParams) {
  return requestClient.get<UserItem[]>('/admin/users', {
    params,
  });
}


/**
 * 获取指定用户信息
 */
export async function getUserByIdApi(id: number | string) {
  return requestClient.get<UserItem>(`/admin/users/${id}`);
}

/**
 * 更新指定用户信息
 */
export async function updateUserApi(id: number | string, data: Partial<UserItem>) {
  return requestClient.put<UserItem>(`/admin/users/${id}`, data);
}

/**
 * 更新当前登录用户信息
 */
export async function updateMeApi(data: Partial<UserItem>) {
  return requestClient.put<UserItem>('/admin/users/info', data);
}

/**
 * 删除用户
 */
export async function deleteUserApi(id: number | string) {
  return requestClient.delete(`/admin/users/${id}`);
}

/**
 * 注册/新增用户
 */
export async function registerUserApi(data: Partial<UserItem>) {
  return requestClient.post<UserItem>('/admin/users', data);
}
