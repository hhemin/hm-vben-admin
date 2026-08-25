import { nextTick, reactive, ref, type Ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { cloneDeep } from '@vben/utils';

/**
 * 通用表单管理 Hook
 */
export function useForm<T extends Record<string, any>>(
  initialModel: T,
  rules: FormRules = {},
  customFormRef?: Ref<FormInstance | null>,
) {
  const formRef = customFormRef || ref<FormInstance | null>(null);
  const defaultModel = cloneDeep(initialModel);
  const formModel = reactive<T>(cloneDeep(initialModel)) as T;
  const formRules = reactive<FormRules>(rules);
  const isSubmitting = ref(false);

  /** 校验表单 */
  async function validate(): Promise<boolean> {
    if (!formRef.value) return false;
    try {
      await formRef.value.validate();
      return true;
    } catch {
      return false;
    }
  }

  /** 重置表单字段为初始值并清除校验状态 */
  function resetFields(overrideData?: Partial<T>) {
    Object.keys(formModel).forEach((key) => {
      delete (formModel as any)[key];
    });
    Object.assign(formModel, cloneDeep(defaultModel), overrideData || {});
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  }

  /** 设置/回显表单数据 */
  function setFormModel(data: Partial<T>) {
    Object.assign(formModel, cloneDeep(data));
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  }

  /** 清除校验结果 */
  function clearValidate(props?: string | string[]) {
    nextTick(() => {
      formRef.value?.clearValidate(props);
    });
  }

  return {
    formRef,
    formModel,
    formRules,
    isSubmitting,
    validate,
    resetFields,
    setFormModel,
    clearValidate,
  };
}
