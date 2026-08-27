import { requestClient } from '#/api/request';

export interface OperationLogItem {
  id: number;
  admin_id?: number;
  operator?: string;
  operator_name?: string;
  module: string;
  action?: string;
  operation?: string;
  method?: string;
  request_path?: string;
  ip?: string;
  ip_location?: string;
  user_agent?: string;
  params?: any;
  result?: any;
  status_code?: number;
  created_at?: string;
}

export interface OperationLogQueryParams {
  page?: number;
  limit?: number;
  pageNum?: number;
  pageSize?: number;
  module?: string;
}

/**
 * 分页获取操作日志列表
 */
export async function getOperationLogsApi(params?: OperationLogQueryParams) {
  return requestClient.get<{
    items: OperationLogItem[];
    count?: number;
    total?: number;
    page: number;
    limit?: number;
    pageSize?: number;
    totalPages?: number;
  }>('/admin/operation-logs/', {
    params,
  });
}
