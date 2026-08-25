import { ElMessage, ElMessageBox } from 'element-plus';

export interface UseDeleteOptions {
  title?: string;
  content?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  type?: 'warning' | 'info' | 'error' | 'success';
  successMessage?: string;
}

/**
 * 封装通用删除二次确认操作
 */
export function useDelete() {
  async function handleDelete(
    deleteApi: () => Promise<any>,
    options: UseDeleteOptions = {},
  ): Promise<boolean> {
    const {
      title = '确认删除',
      content = '此操作将永久删除该数据，是否继续？',
      confirmButtonText = '确定',
      cancelButtonText = '取消',
      type = 'warning',
      successMessage = '删除成功',
    } = options;

    try {
      await ElMessageBox.confirm(content, title, {
        confirmButtonText,
        cancelButtonText,
        type,
        center: true,
      });

      await deleteApi();
      ElMessage.success(successMessage);
      return true;
    } catch (error: any) {
      if (error !== 'cancel' && error !== 'close') {
        console.error('handleDelete error:', error);
      }
      return false;
    }
  }

  return {
    handleDelete,
  };
}
