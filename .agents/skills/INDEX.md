---
name: 项目技能索引 (Skills Index)
description: hm-vben-admin 技能目录导航，快速定位各领域 Skill。开始任何任务前先查阅本文件确认使用的 Skill。
---

# hm-vben-admin — Skills 技能索引

> 📌 **使用原则**：
> - **先查索引**：任务开始前先查阅下表定位对应 Skill，按需使用 `view_file` 读取，切勿盲目猜测。
> - **按需加载**：仅加载与当前任务相关的 Skill，支持多领域叠加组合。
> - **治理规范**：新增或修改任何 Skill 必须严格遵守 [SKILL_GOVERNANCE.md](file:///.agents/skills/SKILL_GOVERNANCE.md) 的工程化与模块化标准。

---

## 📂 技能清单目录

<!-- SKILLS_START -->
| 技能名称 (领域) | 适用场景与核心职责 | 触发关键词 | Skill 路径 |
| :--- | :--- | :--- | :--- |
| **后台管理系统 API 接口规范** | FastAPI 后端接口对接、统一响应结构解析、Token 鉴权与请求拦截、用户/人员/认证 CRUD 调用规范 | `admin api`, `fastapi`, `users`, `admin-users`, `response format`, `token`, `request`, `crud` | [.agents/skills/admin-api/SKILL.md](file:///.agents/skills/admin-api/SKILL.md) |
| **前端现代界面设计规范** | 企业级 UI/UX 现代视觉体系、Slate 中性灰阶、微阴影微圆角、表格/表单/卡片布局与侧边栏样式标准 | `frontend design`, `ui`, `ux`, `element-plus`, `styles`, `layout`, `theme`, `table`, `form` | [.agents/skills/Frontend-Design/SKILL.md](file:///.agents/skills/Frontend-Design/SKILL.md) |
| **UI/UX Pro Max 设计智能库** | 全栈界面设计风格推荐、色彩方案、字体搭配、图表可视化与产品体验决策引擎（包含 Python 检索脚本） | `ui-ux-pro-max`, `design system`, `palette`, `typography`, `charts`, `landing`, `mobile ui` | [.agents/skills/ui-ux-pro-max/SKILL.md](file:///.agents/skills/ui-ux-pro-max/SKILL.md) |
<!-- SKILLS_END -->

---

## 🧭 典型工作流与 Skill 调度对照

| 任务场景 | 推荐加载的 Skill 组合 | 核心关注点 |
| :--- | :--- | :--- |
| **对接新后台接口 / 数据交互** | `admin-api` | 统一响应格式 `code/data/msg`、请求参数与路径对齐、Token 自动携带 |
| **新增或重构页面 UI / 交互优化** | `Frontend-Design` + `admin-api` | 现代企业级质感、卡片化布局、表格与表单组件规范、输入校验与反馈 |
| **设计全新模块设计系统 / 主题定制** | `ui-ux-pro-max` + `Frontend-Design` | 配色方案推导、交互体验指南、字体与图表选型 |

---

## 🛡️ 技能维护与更新规则

1. **查重与归属**：若有新规范，优先就地演进已有 Skill，避免创建概念重叠的散碎文件。
2. **格式合规**：所有 `SKILL.md` 必须具备合法的 YAML Frontmatter（`name`, `description`, `keywords`）及标准四段式正文。
3. **索引同步**：变更或增减技能时，必须同步更新本 [INDEX.md](file:///.agents/skills/INDEX.md) 文件。
