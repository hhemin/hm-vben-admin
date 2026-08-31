import { requestClient } from '#/api/request';

export interface DictOption {
  label: string;
  value: string | number | boolean;
}

/**
 * [公共] 根据字典类型获取数据字典列表
 */
export async function getDictByTypeApi(dictType: string) {
  return requestClient.get<DictOption[]>(`/common/dicts/${dictType}`);
}
