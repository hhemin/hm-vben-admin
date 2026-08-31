import { requestClient } from '#/api/request';

/**
 * 前台普通用户数据模型（对应后端 UserOut 契约）
 */
export interface UserItem {
  id: number;
  phone: string;
  username?: string;
  email?: string;
  idCard?: string;
  gender?: number; // 0=未知, 1=男, 2=女
  address?: string;
  avatar?: string;
  isActive?: boolean;
  roles?: string[];
  createdTime?: string;
  updatedTime?: string;
}

export interface UserQueryParams {
  page?: number;
  pageSize?: number;
  pageNum?: number;
  limit?: number;
  phone?: string;
  username?: string;
}

export interface UserCreatePayload {
  phone: string;
  password: string;
  username?: string | null;
  email?: string | null;
  idCard?: string | null;
  gender?: number | null;
  address?: string | null;
  avatar?: string | null;
}

export interface UserUpdatePayload {
  phone?: string | null;
  password?: string | null;
  username?: string | null;
  email?: string | null;
  idCard?: string | null;
  gender?: number | null;
  address?: string | null;
  avatar?: string | null;
  isActive?: boolean | null;
}

export interface UserBatchImportPayload {
  users: UserCreatePayload[];
}

/**
 * 分页及条件检索用户列表
 */
export async function getUsersApi(params?: UserQueryParams) {
  return requestClient.get<{
    items: UserItem[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>('/admin/users/', {
    params,
  });
}

/**
 * 创建新用户
 */
export async function createUserApi(data: UserCreatePayload) {
  return requestClient.post<UserItem>('/admin/users/', data);
}

/**
 * 获取指定用户详情
 */
export async function getUserByIdApi(userId: number | string) {
  return requestClient.get<UserItem>(`/admin/users/${userId}`);
}

/**
 * 更新指定用户信息
 */
export async function updateUserApi(
  userId: number | string,
  data: UserUpdatePayload,
) {
  return requestClient.put<UserItem>(`/admin/users/${userId}`, data);
}

/**
 * 删除用户
 */
export async function deleteUserApi(userId: number | string) {
  return requestClient.delete(`/admin/users/${userId}`);
}

/**
 * 批量导入用户
 */
export async function batchCreateUsersApi(users: UserCreatePayload[]) {
  return requestClient.post('/admin/users/batch', { users });
}

/**
 * 获取当前登录管理员个人信息
 */
export async function getAdminInfoApi() {
  return requestClient.get<UserItem>('/admin/users/info');
}

/**
 * 更新当前登录管理员个人信息
 */
export async function updateMeApi(data: Partial<UserItem>) {
  return requestClient.put<UserItem>('/admin/users/info', data);
}
