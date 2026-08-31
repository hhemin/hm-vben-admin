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
  navigator.clipboard
    .writeText(text)
    .then(() => {
      ElMessage.success('已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败');
    });
}

/** 操作人类型文本与 Tag 颜色 */
const operatorTypeInfo = computed(() => {
  const t = logData.value?.operatorType ?? 1;
  switch (t) {
    case 0:
      return { label: '系统自动', type: 'info' as const };
    case 1:
      return { label: '管理员', type: 'warning' as const };
    case 2:
      return { label: '前台学员', type: 'success' as const };
    default:
      return { label: '其他人员', type: 'info' as const };
  }
});

/** 模块 Tag 样式 */
function getModuleTagType(moduleName?: string) {
  if (!moduleName) return 'info';
  if (moduleName.includes('用户') || moduleName.includes('认证')) return 'primary';
  if (moduleName.includes('人员') || moduleName.includes('权限')) return 'warning';
  if (moduleName.includes('课程') || moduleName.includes('活动')) return 'success';
  if (moduleName.includes('Banner') || moduleName.includes('轮播')) return 'danger';
  return 'info';
}

defineExpose({ open });
</script>

<template>
  <ElDrawer
    v-model="visible"
    title="操作日志审计明细"
    size="640px"
    destroy-on-close
    append-to-body
    class="operation-log-drawer"
  >
    <div v-if="logData" class="flex flex-col gap-5 pb-6">
      <!-- 头部核心概况卡片 -->
      <ElCard class="!border border-border/60 !rounded-xl shadow-xs" body-class="p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <ElTag
              :type="getModuleTagType(logData.module)"
              effect="dark"
              size="large"
              class="!font-bold !rounded-lg"
            >
              {{ logData.module || '通用模块' }}
            </ElTag>
            <div>
              <div class="font-semibold text-foreground text-base">
                {{ logData.action || '系统业务变更' }}
              </div>
              <div class="text-xs font-mono text-muted-foreground mt-0.5">
                日志 ID: #{{ logData.id }}
              </div>
            </div>
          </div>
          <ElTag :type="operatorTypeInfo.type" effect="light" class="font-medium !rounded-md">
            {{ operatorTypeInfo.label }}
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
          <ElDescriptionsItem label="业务模块">
            <ElTag size="small" effect="plain" class="!rounded-md font-medium">
              {{ logData.module }}
            </ElTag>
          </ElDescriptionsItem>

          <ElDescriptionsItem label="具体动作">
            <span class="font-medium text-foreground">
              {{ logData.action || '-' }}
            </span>
          </ElDescriptionsItem>

          <ElDescriptionsItem label="操作人员">
            <div class="flex items-center gap-1.5">
              <span class="font-medium text-foreground">
                {{ logData.operatorName || (logData.operatorId ? `ID #${logData.operatorId}` : '系统人员') }}
              </span>
              <span v-if="logData.operatorId" class="text-xs font-mono text-muted-foreground">
                (#{{ logData.operatorId }})
              </span>
            </div>
          </ElDescriptionsItem>

          <ElDescriptionsItem label="身份类型">
            <ElTag size="small" :type="operatorTypeInfo.type" effect="light" class="!rounded-md">
              {{ operatorTypeInfo.label }}
            </ElTag>
          </ElDescriptionsItem>

          <ElDescriptionsItem label="客户端 IP">
            <span class="font-mono text-xs text-foreground">
              {{ logData.ip || '127.0.0.1' }}
            </span>
          </ElDescriptionsItem>

          <ElDescriptionsItem label="操作时间">
            <span class="font-mono text-xs text-muted-foreground">
              {{ logData.createdTime || '-' }}
            </span>
          </ElDescriptionsItem>

          <ElDescriptionsItem v-if="logData.targetTable" label="目标数据表">
            <span class="font-mono text-xs text-primary font-medium">
              {{ logData.targetTable }}
            </span>
          </ElDescriptionsItem>

          <ElDescriptionsItem v-if="logData.targetId" label="目标记录 ID">
            <span class="font-mono text-xs text-foreground font-medium">
              #{{ logData.targetId }}
            </span>
          </ElDescriptionsItem>
        </ElDescriptions>
      </ElCard>

      <!-- 变更详情快照 JSON 展示区 -->
      <ElCard class="!border border-border/60 !rounded-xl shadow-xs" body-class="p-4">
        <div class="flex items-center justify-between mb-2">
          <div class="text-xs font-bold text-foreground/80 uppercase tracking-wider flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            变更详情快照 (Detail Snapshot)
          </div>
          <ElButton
            v-if="logData.detail"
            size="small"
            link
            type="primary"
            class="!text-xs"
            @click="copyToClipboard(formatJson(logData.detail))"
          >
            复制快照
          </ElButton>
        </div>
        <div class="bg-muted/50 rounded-lg p-3 border border-border/40 font-mono text-xs text-foreground overflow-x-auto max-h-96">
          <pre class="whitespace-pre-wrap break-all leading-relaxed">{{ formatJson(logData.detail || '无附加快照数据') }}</pre>
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

