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
} from 'element-plus';

import {
  createAdminUserApi,
  type AdminUserItem,
  updateAdminUserApi,
} from '#/api/admin-users';
import { useForm } from '#/hooks';
import { EMPLOYEE_NO_REGEX, PHONE_REGEX } from '#/utils';

const emit = defineEmits<{
  (e: 'success'): void;
}>();

const visible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);
const formRef = ref<FormInstance | null>(null);

const initialForm = {
  phone: '',
  employeeNo: '',
  password: '',
  roles: ['admin'],
  category: '',
  remark: '',
  status: 1,
};

const rules: FormRules = {
  employeeNo: [
    { required: true, message: '请输入员工工号', trigger: 'blur' },
    {
      pattern: EMPLOYEE_NO_REGEX,
      message: '工号格式为2-20位字母、数字或符号',
      trigger: 'blur',
    },
  ],
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
          callback(new Error('请输入后台登录密码'));
        } else if (value && value.length < 6) {
          callback(new Error('密码长度不能少于6位'));
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

const dialogTitle = computed(() => (isEdit.value ? '编辑人员信息' : '新增后台人员'));

function open(row?: AdminUserItem) {
  visible.value = true;
  if (row && row.id) {
    isEdit.value = true;
    currentId.value = row.id;
    setFormModel({
      phone: row.phone || '',
      employeeNo: row.employeeNo || '',
      password: '',
      roles: row.roles && row.roles.length ? row.roles : ['admin'],
      category: row.category || '',
      remark: row.remark || '',
      status: row.status ?? 1,
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
      await updateAdminUserApi(currentId.value, payload);
      ElMessage.success('更新人员信息成功');
    } else {
      await createAdminUserApi(formModel as any);
      ElMessage.success('创建人员成功');
    }
    visible.value = false;
    emit('success');
  } catch (error: any) {
    console.error('Submit admin user error:', error);
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
    width="660px"
    destroy-on-close
    append-to-body
    class="rounded-xl"
  >
    <div class="mb-4 text-xs text-muted-foreground">
      {{ isEdit ? '修改后台管理人员档案与部门权限配置，留空密码则保持原密码不变。' : '添加后台管理/教师/助教人员，初始密码将作为首次登录凭证。' }}
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
          <ElFormItem label="员工工号" prop="employeeNo">
            <ElInput
              v-model="formModel.employeeNo"
              placeholder="例如: EMP001 / A1001"
              clearable
            />
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="手机号码" prop="phone">
            <ElInput
              v-model="formModel.phone"
              placeholder="请输入11位手机号"
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
          <ElFormItem label="部门/类别" prop="category">
            <ElSelect
              v-model="formModel.category"
              placeholder="选择或输入部门类别"
              filterable
              allow-create
              clearable
              class="w-full"
            >
              <ElOption label="管理部门" value="管理部门" />
              <ElOption label="教学部" value="教学部" />
              <ElOption label="教务部" value="教务部" />
              <ElOption label="运营部" value="运营部" />
              <ElOption label="财务部" value="财务部" />
            </ElSelect>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElRow :gutter="20">
        <ElCol :span="12">
          <ElFormItem label="角色权限" prop="roles">
            <ElSelect
              v-model="formModel.roles"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="请选择人员角色"
              class="w-full"
            >
              <ElOption label="超级管理员 (admin)" value="admin" />
              <ElOption label="授课教师 (teacher)" value="teacher" />
              <ElOption label="助教 (assistant)" value="assistant" />
              <ElOption label="运营人员 (operator)" value="operator" />
              <ElOption label="财务人员 (finance)" value="finance" />
            </ElSelect>
          </ElFormItem>
        </ElCol>

        <ElCol :span="12">
          <ElFormItem label="账号状态" prop="status">
            <ElRadioGroup v-model="formModel.status" class="mt-1">
              <ElRadio :value="1">启用</ElRadio>
              <ElRadio :value="0">禁用</ElRadio>
            </ElRadioGroup>
          </ElFormItem>
        </ElCol>
      </ElRow>

      <ElFormItem label="备注说明" prop="remark">
        <ElInput
          v-model="formModel.remark"
          type="textarea"
          :rows="2"
          placeholder="岗位职责、教学科目或备注说明"
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
