# Skills 治理与写入规范 (Skill Governance & Engineering Standards)

为了保证 AI 助手与团队开发者在编写、修改项目代码与知识沉淀时保持**严格工程化、模块化、低耦合、统一规范**，所有在 `.agents/skills/` 下维护的技能必须严格遵守本治理准则。

---

## 一、核心工程原则 (Core Engineering Principles)

1. **归纳与就地演进**：优先在现有领域 Skill 下修补拓展，严禁无序建立同质化散碎文件。
2. **第三方资源绝对只读**：第三方安装的库/工具（如 `ui-ux-pro-max`）只读不动，绝不改动或混入业务规则。
3. **代码与 Skill 动态同步**：代码或架构变动时，通过 `INDEX.md` 找准目标 `.md` 文件第一时间同步修补，拒绝知识滞后。
4. **精简去冗余**：抓住规则与架构重点，不大段堆砌无关代码。

## 二、标准目录结构与元数据格式

所有 Skill 必须以独立文件夹形式存在于 `.agents/skills/` 目录下：

```text
.agents/skills/
├── INDEX.md                        # 📌 技能总索引表（必须保持同步更新）
├── SKILL_GOVERNANCE.md             # 🛡️ 本治理规范（全局元标准）
├── <skill-kebab-case-name>/        # 技能主目录（全小写短横线命名）
│   └── SKILL.md                    # 技能主体文件
```

### `SKILL.md` 标准格式要求

每个 `SKILL.md` 必须具备合法的 **YAML Frontmatter** 和标准章节组织：

```markdown
---
name: <skill-name> (<中文标题>)
description: <一句话精准描述该技能的用途与场景>
keywords: <逗号分隔的触发关键词，供智能调度定位>
---

# <技能主标题>

## 1. 概述与适用场景
- 明确该技能解决的核心问题与边界。

## 2. 核心架构约束与设计原则
- 说明分层职责、模型关联、依赖规范等。

## 3. 标准实现代码示例 (Best Practices)
- 提供规范且完整的 Router / Service / Repository / Schema 代码范式。

## 4. 常见反例与禁忌 (Anti-Patterns)
- 列举容易踩坑的错误写法及正确替代方案。
```

---

## 三、单一真实源 (Single Source of Truth) 体系



## 四、新增 / 修改 Skill 闭环工作流

在向项目新增或重构 Skill 时，必须遵循以下闭环流程：

1. **Step 1: 查重与归属评估**
   - 优先在上述已有领域 Skill 中就地演进，**严禁无序创建概念重叠的零散 Skill**。
2. **Step 2: 严格对标治理规范编写**
   - 必须包含标准 YAML Frontmatter（`name`, `description`, `keywords`）。
   - 遵循标准四段式结构（概述 → 原则 → 标准示例 → 反例禁忌）。
3. **Step 3: 同步维护 INDEX.md**
   - 新增 Skill 必须同步登记到 [INDEX.md](file:///.agents/skills/INDEX.md) 索引导航中。
