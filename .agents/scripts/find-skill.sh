#!/bin/bash

# RobotAdminPlatform Skill 路由脚本
# 使用方法: ./find-skill.sh [关键词]

PROJECT_ROOT=$(pwd)
INDEX_FILE="$PROJECT_ROOT/.agents/skills/INDEX.md"

if [ -z "$1" ]; then
    echo "使用方法: $0 [关键词]"
    exit 1
fi

KEYWORD=$1

# 在第一列（任务类型）或第二列（关键词）中严格搜索关键词
# 使用 awk 处理表格列，并根据关键词类型选择匹配策略
RESULT_LINE=$(awk -F'|' -v kw="$KEYWORD" '
    BEGIN {
        # 如果是全英文/数字关键词，则使用单词边界匹配（防止 "UI" 匹配到 "build"）
        # 如果包含中文或其他字符，则使用模糊匹配以增强灵活性
        if (kw ~ /^[a-zA-Z0-9]+$/) {
            pattern = "(^|[^a-zA-Z0-9])" tolower(kw) "([^a-zA-Z0-9]|$)"
        } else {
            pattern = tolower(kw)
        }
    }
    tolower($2) ~ pattern || tolower($3) ~ pattern {
        print $0;
        exit;
    }
' "$INDEX_FILE")

# 从匹配行中提取 Skill 路径（Markdown 表格的第 4 列）
SKILL_PATH=$(echo "$RESULT_LINE" | awk -F'|' '{print $4}' | sed 's/ //g' | sed 's/`//g')

if [ -z "$SKILL_PATH" ]; then
    echo "错误: 未找到与关键词 '$KEYWORD' 匹配的 Skill"
    exit 1
fi

# 如果路径是相对路径，转换为项目绝对路径
if [[ "$SKILL_PATH" == .* ]]; then
    FULL_PATH="$PROJECT_ROOT/${SKILL_PATH#./}"
else
    FULL_PATH="$SKILL_PATH"
fi

echo "$FULL_PATH"