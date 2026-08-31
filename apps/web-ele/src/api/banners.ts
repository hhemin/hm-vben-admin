import { requestClient } from '#/api/request';

/**
 * 广告轮播图数据模型（对应后端 BannerOut 契约）
 */
export interface BannerItem {
  id: number;
  title?: string | null;
  imageUrl: string;
  targetUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
  createdBy?: number | null;
  createdTime?: string;
  updatedTime?: string;
}

export interface BannerQueryParams {
  pageNum?: number;
  pageSize?: number;
  page?: number;
  limit?: number;
}

export interface BannerCreatePayload {
  imageUrl: string;
  title?: string | null;
  targetUrl?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface BannerUpdatePayload {
  imageUrl?: string | null;
  title?: string | null;
  targetUrl?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
}

/**
 * [管理后台] 获取所有轮播图列表（含停用）
 */
export async function getAdminBannersApi(params?: BannerQueryParams) {
  return requestClient.get<{
    items: BannerItem[];
    count: number;
    page?: number;
    pageSize?: number;
  }>('/admin/banners/', {
    params,
  });
}

/**
 * [管理后台] 新建广告轮播图
 */
export async function createAdminBannerApi(data: BannerCreatePayload) {
  return requestClient.post<BannerItem>('/admin/banners/', data);
}

/**
 * [管理后台] 编辑轮播图
 */
export async function updateAdminBannerApi(
  bannerId: number | string,
  data: BannerUpdatePayload,
) {
  return requestClient.put<BannerItem>(`/admin/banners/${bannerId}`, data);
}

/**
 * [管理后台] 删除轮播图
 */
export async function deleteAdminBannerApi(bannerId: number | string) {
  return requestClient.delete(`/admin/banners/${bannerId}`);
}
