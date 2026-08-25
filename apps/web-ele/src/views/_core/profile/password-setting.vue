<script setup lang="ts">
import type { VbenFormSchema } from '#/adapter/form';

import { computed, ref } from 'vue';

import { ProfilePasswordSetting, z } from '@vben/common-ui';

import { ElMessage } from 'element-plus';

import { changeAdminPasswordApi } from '#/api';

const profilePasswordSettingRef = ref();

const formSchema = computed((): VbenFormSchema[] => {
  return [
    {
      component: 'VbenInputPassword',
      componentProps: {
        placeholder: '请输入旧密码',
      },
      fieldName: 'oldPassword',
      label: '旧密码',
      rules: z.string().min(1, { message: '请输入旧密码' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: '请输入新密码',
      },
      fieldName: 'newPassword',
      label: '新密码',
      rules: z
        .string()
        .min(6, { message: '新密码长度不能少于 6 位' })
        .max(30, { message: '新密码长度不能超过 30 位' }),
    },
    {
      component: 'VbenInputPassword',
      componentProps: {
        passwordStrength: true,
        placeholder: '请再次输入新密码',
      },
      dependencies: {
        rules(values) {
          const { newPassword } = values;
          return z
            .string({ error: '请再次输入新密码' })
            .min(1, { message: '请再次输入新密码' })
            .refine((value) => value === newPassword, {
              message: '两次输入的密码不一致',
            });
        },
        triggerFields: ['newPassword'],
      },
      fieldName: 'confirmPassword',
      label: '确认密码',
    },
  ];
});

async function handleSubmit(values: Record<string, any>) {
  try {
    await changeAdminPasswordApi({
      confirmPassword: values.confirmPassword,
      newPassword: values.newPassword,
      oldPassword: values.oldPassword,
    });
    ElMessage.success('密码修改成功');
    profilePasswordSettingRef.value?.getFormApi()?.resetForm();
  } catch (error: any) {
    ElMessage.error(error?.message || '修改密码失败');
  }
}
</script>
<template>
  <ProfilePasswordSetting
    ref="profilePasswordSettingRef"
    class="w-full md:w-1/2"
    :form-schema="formSchema"
    @submit="handleSubmit"
  />
</template>

