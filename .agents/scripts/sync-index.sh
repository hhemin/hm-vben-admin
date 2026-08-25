#!/bin/bash
# sync-index.sh - 自动同步所有技能到 INDEX.md

PROJECT_ROOT=$(pwd)
SKILLS_DIR="$PROJECT_ROOT/.agents/skills"
INDEX_FILE="$SKILLS_DIR/INDEX.md"

echo "正在同步技能索引..."

# 写入用户要求的头部与表格开头
cat << 'EOF' > "$INDEX_FILE"
---
name: 项目技能索引 (Skills Index)
description: RobotAdminPlatform 技能目录导航，快速定位各领域 skill。开始任何任务前先读此文件确认使用哪个 skill。
---

# RobotAdminPlatform — Skills 索引

> 读此文件后，根据任务类型定位对应 skill，再用 `view_file` 读取对应 SKILL.md 获取完整规范。

## 📂 技能目录

<!-- SKILLS_START -->
| 任务类型 | 关键词 | Skill 路径 |
|---|---|---|
EOF

# 扫描所有 SKILL.md
for skill_file in "$SKILLS_DIR"/*/SKILL.md; do
    if [ -f "$skill_file" ]; then
        # 获取相对路径
        rel_path=".agents/skills/$(basename "$(dirname "$skill_file")")/SKILL.md"
        
        # 解析 YAML 元数据
        name=$(awk -F': ' '/^name:/ {print $2}' "$skill_file" | xargs)
        keywords=$(awk -F': ' '/^keywords:/ {print $2}' "$skill_file" | xargs)
        
        # 如果提取不到，就使用默认值
        if [ -z "$name" ]; then
            name=$(basename "$(dirname "$skill_file")")
        fi
        
        # 输出这一行到表格，任务类型加粗，路径加反引号
        echo "| **$name** | $keywords | \`$rel_path\` |" >> "$INDEX_FILE"
    fi
done

# 写入表格结尾与使用规则
cat << 'EOF' >> "$INDEX_FILE"
<!-- SKILLS_END -->

## 💡 使用规则

1. **先查索引**：任务开始时先读本文件，不要直接猜测或跳过
2. **按需加载**：只 `view_file` 当前任务需要的 skill，不要全部读取
3. **多领域叠加**：一个任务可能涉及多个 skill，分别加载即可
EOF

echo "同步完成！已生成 $INDEX_FILE"
