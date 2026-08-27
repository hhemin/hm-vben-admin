# 表格列表 (Table / CRUD) 构建规范

## 1. 目录结构与架构约束

- **主页面**：`views/<module>/<page>/index.vue`
- **表单组件**：`views/<module>/<page>/components/<domain>-[dialog|drawer].vue`（仅在有新增/编辑/详情需求时创建）

---

## 2. 交互与创建决策流程

```text
[接收列表需求]
  ├── 纯展示/只读列表 (无新增/编辑/详情) ──> 仅生成 index.vue，不创建 components/ 目录
  └── CRUD 列表 (有新增/编辑/详情)
        ├── 用户已指定 Dialog / Drawer ──> 在 components/ 下生成对应的容器组件
        └── 用户未指定容器模式 ──> 🛑 必选行为：主动提问确认（Dialog 还是 Drawer 模式？）
```

---

## 3. 核心 Hook 精要 (解耦规范)

引入：`import { useTable, useForm, useDelete } from '#/hooks';`

### 3.1 `useTable` (表格检索/状态/分页)
```typescript
const {
  loading, list, pagination, queryParams,
  handleSearch, handleReset, refreshList,
  onPageChange, onPageSizeChange, handleStatusChange,
} = useTable<ItemType>(getListApi, { defaultParams: { keyword: '' } });

// 开关状态切换与回滚示例
function onSwitchStatus(row: ItemType) {
  handleStatusChange(
    (id, val) => updateApi(id, { is_active: val }),
    row, 'is_active', '状态更新成功'
  );
}
```

### 3.2 `useForm` (表单状态/校验/重置)
```typescript
const { formModel, formRules, isSubmitting, validate, resetFields, setFormModel } = useForm(
  initialForm, rules, formRef
);

// 弹窗 open 函数模式
function open(row?: ItemType) {
  visible.value = true;
  if (row?.id) {
    isEdit.value = true;
    setFormModel({ name: row.name });
  } else {
    isEdit.value = false;
    resetFields();
  }
}
```

### 3.3 `useDelete` (二次确认删除)
```typescript
const { handleDelete } = useDelete();

async function onDelete(row: ItemType) {
  const ok = await handleDelete(
    () => deleteApi(row.id),
    { title: '删除确认', content: `确定要删除 [${row.name}] 吗？` }
  );
  if (ok) refreshList();
}
```

---

## 4. 代码核心骨架

### 4.1 主页面骨架 (`index.vue`)
```vue
<script lang="ts" setup>
import { ref } from 'vue';
import { Page } from '@vben/common-ui';
import { ElButton, ElCard, ElForm, ElFormItem, ElInput, ElPagination, ElSpace, ElTable, ElTableColumn } from 'element-plus';
import { deleteApi, getListApi, updateApi, type ItemType } from '#/api/demo';
import { useDelete, useTable } from '#/hooks';
import DemoDialog from './components/demo-dialog.vue'; // CRUD 场景时引入

const dialogRef = ref<InstanceType<typeof DemoDialog> | null>(null);
const { loading, list, pagination, queryParams, handleSearch, handleReset, refreshList, onPageChange, onPageSizeChange } = useTable<ItemType>(getListApi);
const { handleDelete } = useDelete();
</script>

<template>
  <Page title="模块名称" description="模块说明">
    <!-- 1. 顶部检索卡片 -->
    <ElCard class="mb-4 rounded-xl border border-border/60 shadow-sm">
      <ElForm :inline="true" :model="queryParams">
        <ElFormItem label="关键字">
          <ElInput v-model="queryParams.keyword" clearable @keyup.enter="handleSearch" />
        </ElFormItem>
        <ElFormItem>
          <ElButton type="primary" :loading="loading" @click="handleSearch">查询</ElButton>
          <ElButton plain @click="handleReset">重置</ElButton>
        </ElFormItem>
      </ElForm>
    </ElCard>

    <!-- 2. 表格与分页卡片 -->
    <ElCard class="rounded-xl border border-border/60 shadow-sm">
      <div class="mb-4 flex items-center justify-between">
        <ElButton type="primary" @click="dialogRef?.open()">+ 新增</ElButton>
        <ElButton plain :loading="loading" @click="refreshList">刷新</ElButton>
      </div>

      <ElTable v-loading="loading" :data="list" stripe>
        <!-- 列定义 -->
      </ElTable>

      <div class="mt-5 flex items-center justify-between">
        <ElPagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          @current-change="onPageChange"
          @size-change="onPageSizeChange"
        />
      </div>
    </ElCard>

    <!-- 3. 表单组件 (仅 CRUD 场景) -->
    <DemoDialog ref="dialogRef" @success="refreshList" />
  </Page>
</template>
```

### 4.2 表单容器组件骨架 (`components/<domain>-[dialog|drawer].vue`)
```vue
<script lang="ts" setup>
import { computed, ref } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElButton, ElDialog, ElForm, ElFormItem, ElInput, ElMessage } from 'element-plus'; // 抽屉改用 ElDrawer
import { createApi, updateApi } from '#/api/demo';
import { useForm } from '#/hooks';

const emit = defineEmits<{ (e: 'success'): void }>();
const visible = ref(false);
const isEdit = ref(false);
const currentId = ref<number | null>(null);
const formRef = ref<FormInstance | null>(null);

const { formModel, formRules, isSubmitting, validate, resetFields, setFormModel } = useForm(
  { name: '' },
  { name: [{ required: true, message: '请输入名称', trigger: 'blur' }] },
  formRef
);

function open(row?: any) {
  visible.value = true;
  if (row?.id) {
    isEdit.value = true;
    currentId.value = row.id;
    setFormModel({ name: row.name });
  } else {
    isEdit.value = false;
    currentId.value = null;
    resetFields();
  }
}

async function handleSubmit() {
  if (!(await validate())) return;
  isSubmitting.value = true;
  try {
    isEdit.value ? await updateApi(currentId.value!, formModel) : await createApi(formModel);
    ElMessage.success('保存成功');
    visible.value = false;
    emit('success');
  } finally {
    isSubmitting.value = false;
  }
}

defineExpose({ open });
</script>

<template>
  <ElDialog v-model="visible" :title="isEdit ? '编辑' : '新建'" width="580px" destroy-on-close append-to-body class="rounded-xl">
    <ElForm ref="formRef" :model="formModel" :rules="formRules" label-width="80px">
      <ElFormItem label="名称" prop="name">
        <ElInput v-model="formModel.name" placeholder="请输入名称" clearable />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="visible = false">取消</ElButton>
      <ElButton type="primary" :loading="isSubmitting" @click="handleSubmit">确定保存</ElButton>
    </template>
  </ElDialog>
</template>
```

---

## 5. 核心禁忌

1. 🚫 纯展示/只读列表场景下创建空的 `components/` 弹窗组件。
2. 🚫 弹窗组件放在页面同级根路径，不存入 `components/` 子文件夹。
3. 🚫 未明确模式时直接硬编码 Dialog 或 Drawer，必须提问确认。
4. 🚫 不使用 `useTable` / `useForm` / `useDelete` 手动重复编写分页、加载与校验逻辑。
