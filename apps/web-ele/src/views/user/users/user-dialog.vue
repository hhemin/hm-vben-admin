<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import {
  ElButton,
  ElCol,
  ElDialog,
  ElForm,
  ElFormItem,
  ElInput,
  ElMessage,
  ElOption,
  ElRadio,
  ElRadioGroup,
  ElRow,
  ElSelect,
  ElSwitch,
} from 'element-plus';

import { createUserApi, updateUserApi, type UserItem } from '#/api/users';
import { useForm } from '#/hooks';
import { EMAIL_REGEX, ID_CARD_REGEX, PHONE_REGEX } from '#/utils';

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const visible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);
const formRef = ref<FormInstance | null>(null);

const initialForm = {
  phone: '',
  username: '',
  password: '',
  email: '',
  id_card: '',
  gender: 0,
  address: '',
  roles: ['user'],
  is_active: true,
};

const rules: FormRules = {
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: PHONE_REGEX,
      message: '请输入正确的11位手机号码',
      trigger: 'blur',
    },
  ],
  password: [
    {
      validator: (_rule, value, callback) => {
        if (!isEdit.value && !value) {
          callback(new Error('请输入初始密码'));
        } else if (value && value.length < 6) {
          callback(new Error('密码长度不能少于6位'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
  email: [
    {
      pattern: EMAIL_REGEX,
      message: '请输入有效的邮箱地址',
      trigger: 'blur',
    },
  ],
  id_card: [
    {
      validator: (_rule, value, callback) => {
        if (value && !ID_CARD_REGEX.test(value)) {
          callback(new Error('请输入合法的15位或18位身份证号'));
        } else {
          callback();
        }
      },
      trigger: 'blur',
    },
  ],
};

const {
  formModel,
  formRules,
  isSubmitting,
  validate,
  resetFields,
  setFormModel,
} = useForm(initialForm, rules, formRef);

const dialogTitle = computed(() => (isEdit.value ? '编辑用户信息' : '新增普通用户'));

function open(row?: UserItem) {
  visible.value = true;
  if (row && row.id) {
    isEdit.value = true;
    currentId.value = row.id;
    setFormModel({
      phone: row.phone || '',
      username: row.username || '',
      password: '',
      email: row.email || '',
      id_card: row.id_card || '',
      gender: row.gender ?? 0,
      address: row.address || '',
      roles: row.roles && row.roles.length ? row.roles : ['user'],
      is_active: row.is_active ?? true,
    });
  } else {
    isEdit.value = false;
    currentId.value = null;
    resetFields();
  }
}

async function handleSubmit() {
  const valid = await validate();
  if (!valid) return;

  isSubmitting.value = true;
  try {
    if (isEdit.value && currentId.value) {
      const payload: any = { ...formModel };
      if (!payload.password) {
        delete payload.password;
      }
      await updateUserApi(currentId.value, payload);
      ElMessage.success('更新用户成功');
    } else {
      await createUserApi(formModel as any);
      ElMessage.success('创建用户成功');
    }
    visible.value = false;
    emit('success');
  } catch (error: any) {
    console.error('Submit user error:', error);
  } finally {
    isSubmitting.value = false;
  }
}

defineExpose({
  open,
});
</script>

<template>
  <ElDialog
    v-model="visible"
    :title="dialogTitle"
    width="680px"
    destroy-on-close
    append-to-body
    class="rounded-xl"
  >
    <div class="mb-4 text-xs text-muted-foreground">
      {{ isEdit ? '修改前台普通用户基础信息，留空密码则保持原密码不变。' : '填写新用户注册信息并设置登录账号与初始密码。' }}
    </div>

    <ElForm
      ref="formRef"
      :model="formModel"
      :rules="formRules"
      label-width="90px"
      label-position="right"
    >
      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="手机号" prop="phone">
            <ElInput
              v-model="formModel.phone"
              placeholder="请输入11位手机号"
              clearable
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="用户名" prop="username">
            <ElInput
              v-model="formModel.username"
              placeholder="请输入用户昵称/姓名"
              clearable
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem
            label="登录密码"
            prop="password"
            :required="!isEdit"
          >
            <ElInput
              v-model="formModel.password"
              type="password"
              show-password
              :placeholder="isEdit ? '留空则不修改' : '初始密码 (最少6位)'"
              clearable
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="电子邮箱" prop="email">
            <ElInput
              v-model="formModel.email"
              placeholder="例如: example@mail.com"
              clearable
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="身份证号" prop="id_card">
            <ElInput
              v-model="formModel.id_card"
              placeholder="请输入身份证号码"
              clearable
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="性别" prop="gender">
            <ElRadioGroup v-model="formModel.gender" class="mt-1">
              <ElRadio :value="1">男</ElRadio>
              <ElRadio :value="2">女</ElRadio>
              <ElRadio :value="0">未知</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="所属角色" prop="roles">
            <ElSelect
              v-model="formModel.roles"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择用户角色"
              class="w-full"
            >
              <ElOption label="普通用户 (user)" value="user" />
              <ElOption label="VIP会员 (vip)" value="vip" />
              <ElOption label="注册学员 (student)" value="student" />
              <ElOption label="系统管理 (admin)" value="admin" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="账号状态" prop="is_active">
            <ElSwitch
              v-model="formModel.is_active"
              inline-prompt
              active-text="启用"
              inactive-text="禁用"
            />
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="联系地址" prop="address">
        <ElInput
          v-model="formModel.address"
          type="textarea"
          :rows="2"
          placeholder="请输入详细通讯/居住地址"
          clearable
        />
      </ElFormItem>
    </ElForm>

    <template #footer>
      <div class="flex justify-end gap-3 pt-2">
        <ElButton @click="visible = false">取消</ElButton>
        <ElButton type="primary" :loading="isSubmitting" @click="handleSubmit">
          确定保存
        </ElButton>
      </div>
    </template>
  </ElDialog>
</template>
