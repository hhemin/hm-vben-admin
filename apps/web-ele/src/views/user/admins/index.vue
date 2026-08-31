<script lang="ts" setup>
import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  ElAvatar,
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElOption,
  ElPagination,
  ElSelect,
  ElSpace,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTooltip,
} from 'element-plus';

import {
  type AdminUserItem,
  deleteAdminUserApi,
  getAdminUsersApi,
  updateAdminUserApi,
} from '#/api/admin-users';
import { useDelete, useTable } from '#/hooks';
import AdminDialog from './admin-dialog.vue';

const dialogRef = ref<InstanceType<typeof AdminDialog> | null>(null);

const {
  loading,
  list,
  pagination,
  queryParams,
  handleSearch,
  handleReset,
  refreshList,
  onPageChange,
  onPageSizeChange,
  handleStatusChange,
} = useTable<AdminUserItem>(getAdminUsersApi, {
  defaultParams: {
    phone: '',
    employeeNo: '',
    status: undefined,
  },
});

const { handleDelete } = useDelete();

function handleAdd() {
  dialogRef.value?.open();
}

function handleEdit(row: any) {
  dialogRef.value?.open(row);
}

async function onDelete(row: any) {
  const ok = await handleDelete(
    () => deleteAdminUserApi(row.id),
    {
      title: '删除人员确认',
      content: `确定要删除后台人员 [工号: ${row.employeeNo} / 手机: ${row.phone}] 吗？此操作无法撤销！`,
    },
  );
  if (ok) {
    refreshList();
  }
}

function onSwitchStatus(row: any) {
  handleStatusChange(
    (id, val) => updateAdminUserApi(id, { status: val }),
    row,
    'status',
    `人员 [${row.employeeNo}] 账号已${row.status === 1 ? '启用' : '禁用'}`,
  );
}

/** 随机色系头像背景生成 */
function getAvatarBg(name?: string) {
  const colors = [
    'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  ];
  if (!name) return colors[0];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}
</script>

<template>
  <Page
    title="人员管理"
    description="管理后台管理员、授课教师、教务与运营人员，维护账号权限及系统访问控制"
  >
    <!-- 顶部检索与过滤区域 -->
    <ElCard class="mb-4 rounded-xl border border-border/60 shadow-sm" shadow="hover">
      <ElForm :inline="true" :model="queryParams" class="flex flex-wrap items-center gap-y-2">
        <ElFormItem label="员工工号" class="!mb-0">
          <ElInput
            v-model="queryParams.employeeNo"
            placeholder="搜索员工工号"
            clearable
            class="w-48"
            @keyup.enter="handleSearch"
          />
        </ElFormItem>

        <ElFormItem label="手机号码" class="!mb-0">
          <ElInput
            v-model="queryParams.phone"
            placeholder="搜索手机号"
            clearable
            class="w-48"
            @keyup.enter="handleSearch"
          />
        </ElFormItem>

        <ElFormItem label="账号状态" class="!mb-0">
          <ElSelect
            v-model="queryParams.status"
            placeholder="全部状态"
            clearable
            class="w-32"
            @change="handleSearch"
          >
            <ElOption label="启用" :value="1" />
            <ElOption label="禁用" :value="0" />
          </ElSelect>
        </ElFormItem>

        <ElFormItem class="!mb-0">
          <ElSpace :size="10">
            <ElButton type="primary" :loading="loading" @click="handleSearch">
              <span class="font-medium">查询</span>
            </ElButton>
            <ElButton plain @click="handleReset">重置</ElButton>
          </ElSpace>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 表格内容主体区域 -->
    <ElCard class="rounded-xl border border-border/60 shadow-sm" shadow="hover">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <ElButton type="primary" class="!px-4 !font-medium" @click="handleAdd">
            + 新增人员
          </ElButton>
          <span class="text-xs text-muted-foreground">
            共找到 <strong class="text-primary font-semibold">{{ pagination.total }}</strong> 位后台人员
          </span>
        </div>

        <ElSpace :size="8">
          <ElTooltip content="重新载入列表" placement="top">
            <ElButton plain :loading="loading" @click="() => refreshList()">
              刷新
            </ElButton>
          </ElTooltip>
        </ElSpace>
      </div>

      <ElTable
        v-loading="loading"
        :data="list"
        stripe
        class="w-full rounded-lg"
        header-cell-class-name="bg-muted/40 text-foreground font-semibold text-xs"
      >
        <ElTableColumn prop="id" label="ID" width="70" align="center">
          <template #default="{ row }">
            <span class="text-xs font-mono text-muted-foreground font-medium">#{{ row.id }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="人员信息" min-width="170">
          <template #default="{ row }">
            <div class="flex items-center gap-3 py-1">
              <ElAvatar
                :size="38"
                :src="row.avatar"
                :style="{ background: getAvatarBg(row.employeeNo || row.phone), color: '#fff', fontWeight: 600 }"
              >
                {{ row.employeeNo ? row.employeeNo.slice(0, 2).toUpperCase() : 'A' }}
              </ElAvatar>
              <div class="flex flex-col">
                <span class="font-bold text-foreground text-sm leading-tight font-mono tracking-wide">
                  {{ row.employeeNo }}
                </span>
                <span class="text-xs text-muted-foreground font-mono mt-0.5">
                  {{ row.phone }}
                </span>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="category" label="所属部门" min-width="120">
          <template #default="{ row }">
            <ElTag v-if="row.category" type="info" effect="plain" class="!rounded-md font-medium text-xs">
              {{ row.category }}
            </ElTag>
            <span v-else class="text-xs text-muted-foreground/60">-</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="roles" label="权限角色" min-width="160">
          <template #default="{ row }">
            <ElSpace wrap size="small">
              <ElTag
                v-for="role in (row.roles || ['admin'])"
                :key="role"
                size="small"
                :type="role === 'admin' ? 'warning' : (role === 'teacher' ? 'primary' : 'info')"
                effect="light"
                class="!rounded-md !px-2 font-mono text-xs font-medium"
              >
                {{ role }}
              </ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="status" label="账号状态" width="100" align="center">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              inline-prompt
              active-text="启"
              inactive-text="禁"
              @change="() => onSwitchStatus(row)"
            />
          </template>
        </ElTableColumn>

        <ElTableColumn prop="remark" label="备注说明" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-xs text-foreground/80">{{ row.remark || '-' }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="createdTime" label="创建时间" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-xs font-mono text-muted-foreground">
              {{ row.createdTime ? new Date(row.createdTime).toLocaleString() : '-' }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <ElSpace :size="2">
              <ElButton
                type="primary"
                link
                size="small"
                class="!font-medium"
                @click="handleEdit(row)"
              >
                编辑
              </ElButton>
              <span class="text-border">|</span>
              <ElButton
                type="danger"
                link
                size="small"
                class="!font-medium"
                @click="onDelete(row)"
              >
                删除
              </ElButton>
            </ElSpace>
          </template>
        </ElTableColumn>
      </ElTable>

      <div class="mt-5 flex items-center justify-between">
        <span class="text-xs text-muted-foreground">
          每页显示 {{ pagination.pageSize }} 条，当前第 {{ pagination.pageNum }} 页
        </span>
        <ElPagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @current-change="onPageChange"
          @size-change="onPageSizeChange"
        />
      </div>
    </ElCard>

    <AdminDialog ref="dialogRef" @success="refreshList" />
  </Page>
</template>
