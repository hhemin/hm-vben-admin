---
name: Frontend Layout Templates (前端标准页面布局规范)
description: Element Plus / Vue3 经典页面布局构建指南，包含表格列表 CRUD、表单页、卡片页等模块化规范与交互决策机制。
keywords: layout, table, crud, list, page, form, element-plus, vue3, useTable, useForm, useDelete, dialog, drawer
---

# Frontend Layout Standard (前端标准页面布局规范)

本技能汇集了系统中各种标准页面布局的构建规范、决策机制与精炼示例。便于开发者与 AI 助手按需调用。

---

## 📂 布局模块导航

| 布局类型 | 适用场景与关键机制 | 规范文件 |
| :--- | :--- | :--- |
| **表格列表 (Table / CRUD)** | 纯展示列表与交互式 CRUD 列表生成；只读/CRUD判断；Dialog/Drawer 模式询问；`components/` 子目录规范；`useTable`/`useForm`/`useDelete` 解耦 | [table-crud.md](file:///.agents/skills/layout/table-crud.md) |

---

## 🧭 调度与使用规则

1. **表格列表/CRUD 场景**：
   在接到表格列表开发或重构指令时，**必须参考 [table-crud.md](file:///.agents/skills/layout/table-crud.md)** 规范执行。
2. **场景分类与询问**：
   - 只有查询需求时：生成纯展示列表，不建 `components/` 表单组件。
   - 带新增/编辑需求时：在 `components/` 目录下抽取 Dialog/Drawer。
   - 用户未声明 Dialog 或 Drawer 模式时：**必须主动提问确认模式后再写代码**。
