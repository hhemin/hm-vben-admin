<script lang="ts" setup>
import { computed, ref } from 'vue';
import {
  ElButton,
  ElCard,
  ElDescriptions,
  ElDescriptionsItem,
  ElDrawer,
  ElMessage,
  ElTag,
} from 'element-plus';
import type { OperationLogItem } from '#/api/operation-logs';

const visible = ref(false);
const logData = ref<OperationLogItem | null>(null);

function open(row: OperationLogItem) {
  logData.value = row;
  visible.value = true;
}

/** 格式化 JSON 显示 */
function formatJson(data: any): string {
  if (!data) return 'null';
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return data;
    }
  }
  return JSON.stringify(data, null, 2);
}

/** 复制 JSON */
function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    ElMessage.success('已复制到剪贴板');
  }).catch(() => {
    ElMessage.error('复制失败');
  });
}

/** HTTP 方法对应的颜色类别 */
const methodTagType = computed(() => {
  const method = (logData.value?.method || 'GET').toUpperCase();
  switch (method) {
    case 'GET':
      return 'success';
    case 'POST':
      return 'primary';
    case 'PUT':
      return 'warning';
    case 'DELETE':
      return 'danger';
    default:
      return 'info';
  }
});

/** 状态码 Tag 类型 */
const statusCodeType = computed(() => {
  const code = logData.value?.status_code || 200;
  if (code >= 200 && code < 300) return 'success';
  if (code >= 400 && code < 500) return 'warning';
  if (code >= 500) return 'danger';
  return 'info';
});

defineExpose({ open });
</script>

<template>
  <ElDrawer
    v-model="visible"
    title="操作日志明细"
    size="680px"
    destroy-on-close
    append-to-body
    class="operation-log-drawer"
  >
    <div v-if="logData" class="flex flex-col gap-5 pb-6">
      <!-- 头部核心概况卡片 -->
      <ElCard class="!border border-border/60 !rounded-xl shadow-xs" body-class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ElTag :type="methodTagType" effect="dark" size="large" class="!font-bold font-mono !rounded-lg">
              {{ (logData.method || 'ACTION').toUpperCase() }}
            </ElTag>
            <div>
              <div class="font-semibold text-foreground text-base">
                {{ logData.operation || logData.action || '系统操作记录' }}
              </div>
              <div class="text-xs font-mono text-muted-foreground mt-0.5">
                ID: #{{ logData.id }} | 模块: {{ logData.module || '默认模块' }}
              </div>
            </div>
          </div>
          <ElTag v-if="logData.status_code" :type="statusCodeType" effect="light" class="font-mono font-medium">
            HTTP {{ logData.status_code }}
          </ElTag>
        </div>
      </ElCard>

      <!-- 基础元数据网格列表 -->
      <ElCard class="!border border-border/60 !rounded-xl shadow-xs" body-class="p-4">
        <div class="text-xs font-bold text-foreground/80 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-primary inline-block"></span>
          审计元数据 (Metadata)
        </div>
        <ElDescriptions :column="2" border size="small" class="metadata-descriptions">
          <ElDescriptionsItem label="操作模块">
            <ElTag size="small" effect="plain" class="!rounded-md font-medium">
              {{ logData.module }}
            </ElTag>
          </ElDescriptionsItem>

          <ElDescriptionsItem label="操作人员">
            <span class="font-medium text-foreground">
              {{ logData.operator_name || logData.operator || (logData.admin_id ? `Admin #${logData.admin_id}` : '系统人员') }}
            </span>
          </ElDescriptionsItem>

          <ElDescriptionsItem label="IP 地址">
            <span class="font-mono text-xs text-foreground">
              {{ logData.ip || '127.0.0.1' }}
              <span v-if="logData.ip_location" class="text-muted-foreground font-normal">({{ logData.ip_location }})</span>
            </span>
          </ElDescriptionsItem>

          <ElDescriptionsItem label="触发时间">
            <span class="font-mono text-xs text-muted-foreground">
              {{ logData.created_at ? new Date(logData.created_at).toLocaleString() : '-' }}
            </span>
          </ElDescriptionsItem>

          <ElDescriptionsItem v-if="logData.request_path" label="请求路径" :span="2">
            <span class="font-mono text-xs text-primary font-medium">
              {{ logData.request_path }}
            </span>
          </ElDescriptionsItem>

          <ElDescriptionsItem v-if="logData.user_agent" label="User Agent" :span="2">
            <div class="font-mono text-xs text-muted-foreground break-all line-clamp-2" :title="logData.user_agent">
              {{ logData.user_agent }}
            </div>
          </ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <!-- 请求参数 JSON 展示区 -->
      <ElCard class="!border border-border/60 !rounded-xl shadow-xs" body-class="p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            请求入参 (Params / Body)
          </div>
          <ElButton
            v-if="logData.params"
            size="small"
            link
            type="primary"
            class="!text-xs"
            @click="copyToClipboard(formatJson(logData.params))"
          >
            复制 JSON
          </ElButton>
        </div>
        <div class="bg-muted/50 rounded-lg p-3 border border-border/40 font-mono text-xs text-foreground overflow-x-auto">
          <pre class="whitespace-pre-wrap break-all leading-relaxed">{{ formatJson(logData.params) }}</pre>
        </div>
      </ElCard>

      <!-- 响应结果 JSON / 错误信息区 -->
      <ElCard class="!border border-border/60 !rounded-xl shadow-xs" body-class="p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            响应数据 (Response / Exception)
          </div>
          <ElButton
            v-if="logData.result"
            size="small"
            link
            type="primary"
            class="!text-xs"
            @click="copyToClipboard(formatJson(logData.result))"
          >
            复制 JSON
          </ElButton>
        </div>
        <div class="bg-muted/50 rounded-lg p-3 border border-border/40 font-mono text-xs text-foreground overflow-x-auto">
          <pre class="whitespace-pre-wrap break-all leading-relaxed">{{ formatJson(logData.result) }}</pre>
        </div>
      </ElCard>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <ElButton type="primary" plain @click="visible = false">关闭</ElButton>
      </div>
    </template>
  </ElDrawer>
</template>

<style scoped>
.metadata-descriptions :deep(.el-descriptions__label) {
  width: 100px;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-secondary);
  font-weight: 500;
  font-size: 12px;
}
</style>
