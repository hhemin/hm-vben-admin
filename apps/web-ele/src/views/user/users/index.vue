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
  ElPagination,
  ElSpace,
  ElSwitch,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTooltip,
} from 'element-plus';

import {
  deleteUserApi,
  getUsersApi,
  updateUserApi,
  type UserItem,
} from '#/api/users';
import { useDelete, useTable } from '#/hooks';
import UserDialog from './user-dialog.vue';

const dialogRef = ref<InstanceType<typeof UserDialog> | null>(null);

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
} = useTable<UserItem>(getUsersApi, {
  defaultParams: {
    phone: '',
    username: '',
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
    () => deleteUserApi(row.id),
    {
      title: '删除用户确认',
      content: `确定要删除用户 [${row.username || row.phone}] 吗？此操作无法撤销！`,
    },
  );
  if (ok) {
    refreshList();
  }
}

function onSwitchStatus(row: any) {
  handleStatusChange(
    (id, val) => updateUserApi(id, { is_active: val }),
    row,
    'is_active',
    `用户 [${row.username || row.phone}] 状态已${row.is_active ? '启用' : '禁用'}`,
  );
}

/** 随机色系头像背景生成 */
function getAvatarBg(name?: string) {
  const colors = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)',
    'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  ];
  if (!name) return colors[0];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}
</script>

<template>
  <Page
    title="用户管理"
    description="集中管理系统前台注册与导入的用户基础档案、账号状态及角色权限"
  >
    <!-- 顶部检索与过滤区域 -->
    <ElCard class="mb-4 rounded-xl border border-border/60 shadow-sm" shadow="hover">
      <ElForm :inline="true" :model="queryParams" class="flex flex-wrap items-center gap-y-2">
        <ElFormItem label="手机号码" class="!mb-0">
          <ElInput
            v-model="queryParams.phone"
            placeholder="搜索手机号"
            clearable
            class="w-52"
            @keyup.enter="handleSearch"
          />
        </ElFormItem>

        <ElFormItem label="用户名称" class="!mb-0">
          <ElInput
            v-model="queryParams.username"
            placeholder="搜索用户名"
            clearable
            class="w-52"
            @keyup.enter="handleSearch"
          />
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
            + 新增用户
          </ElButton>
          <span class="text-xs text-muted-foreground">
            共找到 <strong class="text-primary font-semibold">{{ pagination.total }}</strong> 条用户记录
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

        <ElTableColumn label="用户档案" min-width="180">
          <template #default="{ row }">
            <div class="flex items-center gap-3 py-1">
              <ElAvatar
                :size="38"
                :src="row.avatar"
                :style="{ background: getAvatarBg(row.username || row.phone), color: '#fff', fontWeight: 600 }"
              >
                {{ row.username ? row.username.charAt(0).toUpperCase() : (row.phone ? row.phone.slice(-2) : 'U') }}
              </ElAvatar>
              <div class="flex flex-col">
                <span class="font-medium text-foreground text-sm leading-tight">
                  {{ row.username || '未设置昵称' }}
                </span>
                <span class="text-xs text-muted-foreground font-mono mt-0.5">
                  {{ row.phone }}
                </span>
              </div>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="email" label="电子邮箱" min-width="160">
          <template #default="{ row }">
            <span v-if="row.email" class="text-xs font-mono text-foreground">{{ row.email }}</span>
            <span v-else class="text-xs text-muted-foreground/60">-</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <ElTag
              v-if="row.gender === 1"
              type="primary"
              size="small"
              effect="light"
              class="!rounded-md"
            >
              男
            </ElTag>
            <ElTag
              v-else-if="row.gender === 2"
              type="danger"
              size="small"
              effect="light"
              class="!rounded-md"
            >
              女
            </ElTag>
            <ElTag
              v-else
              type="info"
              size="small"
              effect="plain"
              class="!rounded-md"
            >
              未知
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="roles" label="所属角色" min-width="150">
          <template #default="{ row }">
            <ElSpace wrap size="small">
              <ElTag
                v-for="role in (row.roles || ['user'])"
                :key="role"
                size="small"
                :type="role === 'admin' ? 'warning' : (role === 'vip' ? 'danger' : 'success')"
                effect="light"
                class="!rounded-md !px-2 font-mono text-xs font-medium"
              >
                {{ role }}
              </ElTag>
            </ElSpace>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="is_active" label="状态" width="100" align="center">
          <template #default="{ row }">
            <ElSwitch
              v-model="row.is_active"
              inline-prompt
              active-text="启"
              inactive-text="禁"
              @change="() => onSwitchStatus(row)"
            />
          </template>
        </ElTableColumn>

        <ElTableColumn prop="created_at" label="注册时间" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-xs font-mono text-muted-foreground">
              {{ row.created_at ? new Date(row.created_at).toLocaleString() : '-' }}
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

    <UserDialog ref="dialogRef" @success="refreshList" />
  </Page>
</template>
