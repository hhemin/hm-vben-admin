import { requestClient } from '#/api/request';

/**
 * 操作日志响应数据项（对齐后端 OperationLogOut 契约）
 */
export interface OperationLogItem {
  id: number;
  operatorType: number; // 操作人类型（0=系统自动, 1=管理员, 2=普通用户）
  operatorId?: number | null; // 操作人ID
  operatorName?: string | null; // 操作人姓名/手机号快照
  module: string; // 业务模块（如：课程管理、用户管理、系统认证）
  action: string; // 具体动作（如：创建课程、禁用用户、修改密码）
  targetTable?: string | null; // 操作的目标表名（如：courses, users, admin_users）
  targetId?: number | null; // 目标记录主键 ID
  detail?: string | null; // 变更详情快照（JSON 字符串）
  ip?: string | null; // 操作人客户端 IP 地址
  createdTime: string; // 创建时间（标准格式 YYYY-MM-DD HH:mm:ss）
}

/**
 * 操作日志查询参数
 */
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
