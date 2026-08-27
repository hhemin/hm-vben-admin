---
name: Skill Creation & Governance (Skill 创建与演进决策规范)
description: 指导 AI 助手与开发者创建、维护和演进 Skill 技能的流程规范。强调优先合并归纳、保护第三方资源、软件工程解耦分类及精简提炼。
keywords: create skill, skill creation, skill governance, merge skill, software engineering, decoupling, index
---

# Skill 创建与演进决策规范 (Skill Creation & Governance)

本指南旨在规范 Skill 技能文件的创建、演进与分类管理，确保知识库遵循软件工程高内聚低耦合原则，便于 AI 快速精准识别，防止文件碎片化与 Token 浪费。

---

## 1. 核心决策四要素

### 1.1 归纳与合并优先 (Merge First)
- 在新增任何 Skill 指南前，**必须优先思考已有 Skill 目录**。
- 若与现有领域相关（如表格、页面创建属于 `layout`，接口规范属于 `admin-api`），**必须就地扩展或增加子 Markdown**（如 `layout/table-crud.md`），严禁无序新建概念重叠的散碎文件夹。

### 1.2 第三方工具与依赖隔离 (Protect Third-Party)
- 属于第三方安装或集成的 Skill 库（如 `ui-ux-pro-max`），**切勿随意修改或混入项目业务规则**。
- 项目自定义规约与第三方工具彻底解耦，独立维护。

### 1.3 软件工程与解耦分类 (Software Engineering Classification)
- **高内聚低耦合**：每个 Skill 只专注解决单一领域问题。
- **目录结构规范**：
  ```text
  .agents/skills/
  ├── INDEX.md                        # 📌 技能总索引表（必须保持同步更新）
  ├── SKILL_GOVERNANCE.md             # 🛡️ 治理元标准
  └── <skill-domain>/                 # 领域主目录 (kebab-case)
      ├── SKILL.md                    # 领域入口 (Frontmatter + 索引)
      └── <topic-name>.md             # 专精主题子文档 (精简抓重点)
  ```

### 1.4 内容精简与 AI 快速识别 (Concise & AI-Optimized)
- **抓重点**：绝不大段粘贴冗余代码，只提供决策树、规则列表与核心路径。
- **精准关键词**：YAML Frontmatter 中的 `keywords` 与 `description` 必须涵盖高频触发词，方便 AI 一击即中。

---

## 2. 代码更新与 Skill 动态同步规约 (Code & Skill Synchronization)

### 2.1 找准位置就地更新 (Precise Target Updating)
- **拒绝 Skill 滞后**：当项目核心架构、Hook 参数、全局样式或 API 调用范式更新时，**必须第一时间同步更新对应的 Skill 文件**。
- **找准文件精准修改**：
  - 查阅 `INDEX.md` 确定所属领域文件夹（如 `layout` / `admin-api`）。
  - 在该领域文件夹下的特定 `.md` 文件中修补变动点，切勿新增重复文件或插入到无关系的 Skill 中。

### 2.2 第三方 Skill 绝对只读 (Third-Party Immutability)
- 第三方安装或集成的 Skill（如 `ui-ux-pro-max`）**绝对不动**。
- 无论业务代码如何重构更新，只修改项目自研的业务 Skill，严禁将项目业务逻辑混入第三方 Skill。

---

## 3. Skill 创建与更新 3 步闭环流程

1. **Step 1：查重、归类与定位**
   - 新增时判断是新建领域还是合并入已有领域。
   - 更新时通过 `INDEX.md` 找准具体目标 `.md` 文件。
2. **Step 2：精简同步**
   - 保持抓重点原则，同步最新的代码参数或路径约束，剔除过时规则。
3. **Step 3：索引同步**
   - 涉及 Frontmatter 变更或 Skill 增减时，同步更新 [INDEX.md](file:///.agents/skills/INDEX.md)。
