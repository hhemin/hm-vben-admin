<script setup lang="ts">
import type { BasicOption } from '@vben/types';

import type { VbenFormSchema } from '#/adapter/form';

import { computed, onMounted, ref } from 'vue';

import { ProfileBaseSetting, z } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { getUserInfoApi, updateAdminProfileApi } from '#/api';
import { useAuthStore } from '#/store';

const authStore = useAuthStore();
const profileBaseSettingRef = ref();

const ROLE_OPTIONS: BasicOption[] = [
  {
    label: '超级管理员 (admin)',
    value: 'admin',
  },
  {
    label: '授课教师 (teacher)',
    value: 'teacher',
  },
];

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'Input',
      componentProps: {
        disabled: true,
        placeholder: '系统工号',
      },
      fieldName: 'employee_no',
      label: '员工工号',
    },
    {
      component: 'Select',
      componentProps: {
        disabled: true,
        multiple: true,
        options: ROLE_OPTIONS,
        placeholder: '所属角色',
      },
      fieldName: 'roles',
      label: '角色权限',
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入手机号',
      },
      fieldName: 'phone',
      label: '联系手机',
      rules: z
        .string()
        .min(1, { message: '请输入手机号' })
        .regex(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' }),
    },
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入人员分类/所属部门',
      },
      fieldName: 'category',
      label: '人员分类',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入个人备注信息',
        rows: 3,
      },
      fieldName: 'remark',
      label: '备注信息',
    },
  ];
});

async function loadUserInfo() {
  try {
    const data = await getUserInfoApi();
    profileBaseSettingRef.value?.getFormApi()?.setValues({
      category: data.category || '',
      employee_no: data.employee_no || '',
      phone: data.phone || '',
      remark: data.remark || '',
      roles: data.roles || ['admin'],
    });
  } catch (error) {
    console.error('加载用户信息失败', error);
  }
}

async function handleSubmit(values: Record<string, any>) {
  try {
    await updateAdminProfileApi({
      category: values.category || null,
      phone: values.phone,
      remark: values.remark || null,
    });
    ElMessage.success('个人资料更新成功');
    // 同步更新 authStore 中的全局用户信息
    await authStore.fetchUserInfo();
  } catch (error: any) {
    ElMessage.error(error?.message || '更新个人资料失败');
  }
}

onMounted(() => {
  loadUserInfo();
});
</script>
<template>
  <ProfileBaseSetting
    ref="profileBaseSettingRef"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>

