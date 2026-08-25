---
description: 项目架构约束：Controller-Service-Repository
---

# 架构规则
强制三层架构：`Router -> Service -> Repository`。严禁越级。

1. **Router (src/routers/)**: 接听HTTP请求、参数校验、统一返回。仅调用Service。
2. **Service (src/services/)**: 核心业务处理。严禁直接调用ORM或SQL，须调用Repository关联数据。
3. **Repository (src/repositories/)**: 专项数据库CRUD(SQLAlchemy)。严禁混入业务逻辑。
4. 运行辅助脚本查找并返回路径。
   ```bash
   ./.agent/scripts/find-skill.sh [关键词]
   ```