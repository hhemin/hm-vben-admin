<script lang="ts" setup>
import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import {
  ElButton,
  ElCard,
  ElForm,
  ElFormItem,
  ElInput,
  ElPagination,
  ElSpace,
  ElTable,
  ElTableColumn,
  ElTag,
  ElTooltip,
} from 'element-plus';

import {
  getOperationLogsApi,
  type OperationLogItem,
} from '#/api/operation-logs';
import { useTable } from '#/hooks';
import OperationLogDrawer from './components/operation-log-drawer.vue';

const drawerRef = ref<InstanceType<typeof OperationLogDrawer> | null>(null);

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
} = useTable<OperationLogItem>(getOperationLogsApi, {
  defaultParams: {
    module: '',
  },
});

function handleViewDetail(row: any) {
  drawerRef.value?.open(row as OperationLogItem);
}

/** 模块 Tag 样式映射 */
function getModuleTagType(moduleName?: string) {
  if (!moduleName) return 'info';
  if (moduleName.includes('用户') || moduleName.includes('认证')) return 'primary';
  if (moduleName.includes('人员') || moduleName.includes('权限')) return 'warning';
  if (moduleName.includes('课程') || moduleName.includes('活动')) return 'success';
  if (moduleName.includes(' Banner') || moduleName.includes('轮播')) return 'danger';
  return 'info';
}
</script>

<template>
  <Page
    title="操作日志"
    description="记录并跟踪管理员及人员在管理后台的安全审计日志与系统级数据变更操作"
  >
    <!-- 1. 顶部检索与过滤区域 -->
    <ElCard class="mb-4 rounded-xl border border-border/60 shadow-sm" shadow="hover">
      <ElForm :inline="true" :model="queryParams" class="flex flex-wrap items-center gap-y-2">
        <ElFormItem label="操作模块" class="!mb-0">
          <ElInput
            v-model="queryParams.module"
            placeholder="按模块名称过滤（如: 认证、用户）"
            clearable
            class="w-64"
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

    <!-- 2. 表格与分页内容区域 -->
    <ElCard class="rounded-xl border border-border/60 shadow-sm" shadow="hover">
      <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="text-xs text-muted-foreground">
            共查询到 <strong class="text-primary font-semibold">{{ pagination.total }}</strong> 条审计日志
          </span>
        </div>

        <ElSpace :size="8">
          <ElTooltip content="刷新日志列表" placement="top">
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
        <ElTableColumn prop="id" label="ID" width="75" align="center">
          <template #default="{ row }">
            <span class="text-xs font-mono text-muted-foreground font-medium">#{{ row.id }}</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="module" label="业务模块" width="130">
          <template #default="{ row }">
            <ElTag
              :type="getModuleTagType(row.module)"
              size="small"
              effect="light"
              class="!rounded-md font-medium"
            >
              {{ row.module || '通用模块' }}
            </ElTag>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作动作 / 变更内容" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-sm font-medium text-foreground">
              {{ row.action || '系统业务变更' }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作人员" width="150">
          <template #default="{ row }">
            <div class="flex flex-col">
              <span class="text-xs font-medium text-foreground">
                {{ row.operatorName || (row.operatorId ? `ID #${row.operatorId}` : '系统人员') }}
              </span>
              <span v-if="row.operatorType !== undefined" class="text-[11px] text-muted-foreground">
                {{ row.operatorType === 1 ? '管理员' : (row.operatorType === 2 ? '前台学员' : '系统自动') }}
              </span>
            </div>
          </template>
        </ElTableColumn>

        <ElTableColumn label="目标对象" width="130" show-overflow-tooltip>
          <template #default="{ row }">
            <span v-if="row.targetTable" class="text-xs font-mono text-muted-foreground">
              {{ row.targetTable }}<span v-if="row.targetId"> #{{ row.targetId }}</span>
            </span>
            <span v-else class="text-xs text-muted-foreground/60">-</span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="ip" label="客户端 IP" width="125">
          <template #default="{ row }">
            <span class="text-xs font-mono text-muted-foreground">
              {{ row.ip || '127.0.0.1' }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn prop="createdTime" label="操作时间" width="170" show-overflow-tooltip>
          <template #default="{ row }">
            <span class="text-xs font-mono text-muted-foreground">
              {{ row.createdTime || '-' }}
            </span>
          </template>
        </ElTableColumn>

        <ElTableColumn label="操作" width="95" align="center" fixed="right">
          <template #default="{ row }">
            <ElButton
              type="primary"
              link
              size="small"
              class="!font-medium"
              @click="handleViewDetail(row)"
            >
              查看明细
            </ElButton>
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

    <!-- 3. 日志明细抽屉组件 -->
    <OperationLogDrawer ref="drawerRef" />
  </Page>
</template>
