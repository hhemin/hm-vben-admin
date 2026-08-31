import { requestClient } from '#/api/request';

/**
 * 后台人员数据模型（对应后端 AdminUserOut 契约）
 */
export interface AdminUserItem {
  id: number;
  phone: string;
  employeeNo: string;
  roles?: string[];
  avatar?: string | null;
  remark?: string | null;
  category?: string | null;
  status: number; // 1=启用, 0=禁用
  createdTime?: string;
  updatedTime?: string;
}

export interface AdminUserQueryParams {
  page?: number;
  pageSize?: number;
  pageNum?: number;
  limit?: number;
  phone?: string;
  employeeNo?: string;
  status?: number;
}

export interface AdminUserCreatePayload {
  phone: string;
  password: string;
  employeeNo: string;
  roles?: string[];
  avatar?: string | null;
  remark?: string | null;
  category?: string | null;
  status?: number | null;
}

export interface AdminUserUpdatePayload {
  phone?: string | null;
  password?: string | null;
  employeeNo?: string | null;
  roles?: string[];
  avatar?: string | null;
  remark?: string | null;
  category?: string | null;
  status?: number | null;
}

/**
 * 分页及条件检索后台人员列表
 */
export async function getAdminUsersApi(params?: AdminUserQueryParams) {
  return requestClient.get<{
    items: AdminUserItem[];
    count: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>('/admin/admin-users/', {
    params,
  });
}

/**
 * 创建后台人员
 */
export async function createAdminUserApi(data: AdminUserCreatePayload) {
  return requestClient.post<AdminUserItem>('/admin/admin-users/', data);
}

/**
 * 获取指定后台人员详情
 */
export async function getAdminUserByIdApi(adminId: number | string) {
  return requestClient.get<AdminUserItem>(`/admin/admin-users/${adminId}`);
}

/**
 * 更新后台人员信息
 */
export async function updateAdminUserApi(
  adminId: number | string,
  data: AdminUserUpdatePayload,
) {
  return requestClient.put<AdminUserItem>(`/admin/admin-users/${adminId}`, data);
}

/**
 * 删除后台人员
 */
export async function deleteAdminUserApi(adminId: number | string) {
  return requestClient.delete(`/admin/admin-users/${adminId}`);
}
