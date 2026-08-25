import { requestClient } from '#/api/request';

export interface AdminUserItem {
  id: number;
  phone: string;
  employee_no: string;
  roles?: string[];
  avatar?: string;
  remark?: string;
  category?: string;
  status: number; // 1=启用, 0=禁用
  created_at?: string;
  updated_at?: string;
}

export interface AdminUserQueryParams {
  page?: number;
  pageSize?: number;
  pageNum?: number;
  limit?: number;
  phone?: string;
  employee_no?: string;
  status?: number;
}

export interface AdminUserCreatePayload {
  phone: string;
  employee_no: string;
  password: string;
  roles?: string[];
  avatar?: string;
  remark?: string;
  category?: string;
  status?: number;
}

export interface AdminUserUpdatePayload {
  phone?: string;
  employee_no?: string;
  password?: string;
  roles?: string[];
  avatar?: string;
  remark?: string;
  category?: string;
  status?: number;
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
