---
name: 前端现代界面设计规范 (Frontend Design)
keywords: frontend design, ui, ux, scss, styles, element-ui, modern admin, layout, theme
---

# 前端现代界面设计规范 (Frontend Design Guide)

本 Skill 定义了 `hm_admin_template` 管理后台的现代 UI/UX 视觉设计系统、排版规范、组件样式标准与代码重构红线。

---

## 1. 核心设计哲学 (Design Philosophy)

1. **去 AI 浮夸感，专注企业级质感 (Anti-AI Cliché, Enterprise Modernity)**
   - 避免无序的高饱和度霓虹发光（紫光、青光）、过度毛玻璃覆盖、生硬的宇宙星空或 3D 悬浮球等陈词滥调。
   - 追求类似 Linear / Vercel / Tailwind UI / Ant Design 5 的克制、精简、极高信息密度的专业 SaaS 质感。

2. **精细中性灰阶体系 (Refined Neutral Scale)**
   - 使用冷中性色（Slate / Zinc 系）：
     - 浅色背景：`#f8fafc` (Slate-50) / `#f1f5f9` (Slate-100)
     - 边框分割线：`#e2e8f0` (Slate-200) / `#cbd5e1` (Slate-300)
     - 次要文本/占位符：`#94a3b8` (Slate-400) / `#64748b` (Slate-500)
     - 主要标题与正文：`#334155` (Slate-700) / `#1e293b` (Slate-800) / `#0f172a` (Slate-900)
   - 主色调（Primary）：
     - 现代高质感科技蓝/靛蓝：`#2563eb` (Blue-600) / `#3b82f6` (Blue-500) 或 `#4f46e5` (Indigo-600)

3. **微圆角与柔和微阴影 (Subtle Curves & Micro-elevation)**
   - 基础圆角：统一为 `6px` ~ `8px`，避免大圆弧或生硬直角。
   - 阴影系统：
     - Card / Panel 微阴影：`0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)`
     - Floating / Popover 阴影：`0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)`

---

## 2. 关键区域设计规约

### 2.1 侧边栏 (Sidebar)
- **色彩与层级**：深色模式使用深邃 Slate 灰 (`#0f172a` / `#1e293b`)，避免生硬死黑或偏紫蓝。
- **菜单交互**：
  - 选中项（Active item）：胶囊圆角、左侧 Accent 色条或内嵌渐变浅蓝高亮。
  - Hover 态：平滑微亮背景过渡（`rgba(255, 255, 255, 0.06)`）。
  - 图标与文字：间距协调（12px~16px），文本清晰不刺眼。

### 2.2 顶部导航栏 (Navbar & Header)
- **外观**：纯白底色 (`#ffffff`)，下边框使用极细淡灰线条 (`1px solid #e2e8f0`)，配合超轻量柔和阴影。
- **右侧功能区**：图标按钮统一悬浮态（圆角微底色、平滑动画），用户头像圆角与微边框。

### 2.3 标签栏 (TagsView)
- **风格**：现代胶囊标签，背景白底带淡边框。
- **激活态**：主色渐变或主色实底配白色文字，带微妙的投影，彻底摒弃旧版生硬绿色。
- **关闭按钮**：圆角微悬浮反馈，不突兀。

### 2.4 表格与表单 (Tables & Forms)
- **表格**：
  - 表头：浅灰底 (`#f8fafc`)、加粗中性灰文本 (`#475569`)、高度适中。
  - 行悬浮（Hover）：柔和浅淡悬浮色 (`#f1f5f9` / `#f8fafc`)。
  - 单元格分割线：极细淡色，整洁干净。
- **表单与输入框**：
  - 高度统一、边框平滑过渡，获得焦点（Focus）时使用微蓝色 Ring 扩散光晕（`box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15)`）。

### 2.5 登录页面 (Login Page)
- **构图**：现代卡片居中，背景柔和几何微晕光或冷灰渐变，避免单一沉闷的深黑大背景。
- **表单**：高透质感输入框、明确的图标引导、现代感充盈的主行动点（Primary Action Button）。

---

## 3. 开发重构守则 (Golden Rules)

> ⚠️ **极其重要（绝对红线）**：
> 1. **严禁修改任何 JS / TS 业务逻辑**（包括但不限于 Methods、Watch、Computed、Vuex 调用、路由守卫、网络请求、事件派发）。
> 2. **仅允许修改**：
>    - SCSS / CSS 样式文件（`src/styles/*` 以及各组件内部 `<style>`）
>    - 组件 `<template>` 中的 class、style 以及不破坏业务绑定的结构性 HTML 布局。
> 3. 必须确保在全屏与移动端折叠下样式响应良好，无溢出与布局错位。
