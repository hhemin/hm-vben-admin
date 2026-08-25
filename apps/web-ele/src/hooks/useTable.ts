import { reactive, ref, toRaw, type Ref } from 'vue';
import { ElMessage } from 'element-plus';

export interface TablePagination {
  pageNum: number;
  pageSize: number;
  total: number;
}

export interface UseTableOptions<T = any, P = Record<string, any>> {
  /** 初始查询参数 */
  defaultParams?: P;
  /** 是否立即请求 */
  immediate?: boolean;
  /** 自定义数据格式转换 */
  transformResponse?: (res: any) => { items: T[]; total: number };
  /** 最小加载动效展示时间 (毫秒)，防止本地/高速接口瞬间闪烁，默认 350ms */
  minLoadingTime?: number;
}

/**
 * 通用表格管理 Hook
 */
export function useTable<T = any, P extends Record<string, any> = Record<string, any>>(
  fetchApi: (params: any) => Promise<any>,
  options: UseTableOptions<T, P> = {},
) {
  const {
    defaultParams = {} as P,
    immediate = true,
    transformResponse,
    minLoadingTime = 350,
  } = options;

  const loading = ref(false);
  const list = ref<T[]>([]) as Ref<T[]>;

  const pagination = reactive<TablePagination>({
    pageNum: 1,
    pageSize: 10,
    total: 0,
  });

  const queryParams = reactive<P>({
    ...defaultParams,
  });

  /** 获取列表数据 */
  async function fetchList() {
    loading.value = true;
    const startTime = Date.now();
    try {
      const params = {
        pageNum: pagination.pageNum,
        pageSize: pagination.pageSize,
        page: pagination.pageNum,
        limit: pagination.pageSize,
        ...toRaw(queryParams),
      };

      const res = await fetchApi(params);

      if (transformResponse) {
        const { items, total } = transformResponse(res);
        list.value = items || [];
        pagination.total = total || 0;
      } else if (res && typeof res === 'object') {
        if (Array.isArray(res)) {
          list.value = res;
          pagination.total = res.length;
        } else {
          // 兼容后端返回的数据结构 { items: [], count: 0 } 或 { items: [], total: 0 }
          const items = res.items || res.list || res.records || [];
          const total = res.count ?? res.total ?? items.length;
          list.value = items;
          pagination.total = Number(total) || 0;
        }
      } else {
        list.value = [];
        pagination.total = 0;
      }
    } catch (error: any) {
      list.value = [];
      pagination.total = 0;
      console.error('fetchList error:', error);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minLoadingTime - elapsed);
      setTimeout(() => {
        loading.value = false;
      }, remaining);
    }
  }

  /** 查询（重置页码为1） */
  function handleSearch() {
    pagination.pageNum = 1;
    return fetchList();
  }

  /** 重置查询条件并刷新 */
  function handleReset() {
    Object.keys(queryParams).forEach((key) => {
      (queryParams as any)[key] = (defaultParams as any)[key] ?? undefined;
    });
    pagination.pageNum = 1;
    return fetchList();
  }

  /** 刷新列表（可选保持当前页码） */
  function refreshList(keepPage = true) {
    if (!keepPage) {
      pagination.pageNum = 1;
    }
    return fetchList();
  }

  /** 页码改变 */
  function onPageChange(page: number) {
    pagination.pageNum = page;
    fetchList();
  }

  /** 每页条数改变 */
  function onPageSizeChange(size: number) {
    pagination.pageSize = size;
    pagination.pageNum = 1;
    fetchList();
  }

  /** 状态快速切换与回滚 */
  async function handleStatusChange<R extends Record<string, any>>(
    statusApi: (id: any, newStatus: any) => Promise<any>,
    row: R,
    statusField: keyof R = 'status' as keyof R,
    successMsg = '状态更新成功',
  ) {
    const rawVal = row[statusField];
    try {
      await statusApi(row.id, rawVal);
      ElMessage.success(successMsg);
    } catch (error: any) {
      // 失败时回滚
      if (typeof rawVal === 'boolean') {
        (row as any)[statusField] = !rawVal;
      } else if (typeof rawVal === 'number') {
        (row as any)[statusField] = rawVal === 1 ? 0 : 1;
      }
      console.error('handleStatusChange error:', error);
    }
  }

  if (immediate) {
    fetchList();
  }

  return {
    loading,
    list,
    pagination,
    queryParams,
    fetchList,
    handleSearch,
    handleReset,
    refreshList,
    onPageChange,
    onPageSizeChange,
    handleStatusChange,
  };
}
