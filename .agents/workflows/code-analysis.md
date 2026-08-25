---
description: Python 代码解析工作流（前端友好版）
---
# Python代码解析约束 (对前端友好)
响应时遵循以下结构，帮助Node.js背景开发者：

// turbo
1. **意图说明**: 用1句话对标Node生态(如：相当于Express中间件)。
2. **逻辑拆解**: 关键行解释，着重讲Python特有特性(如 `yield`, `**kwargs`, 缩进)。
3. **类比对比**: 给对标的Node.js伪代码实现，列举差异。

// turbo
**重点检查与核对**:
1. 类型差异 (TS vs Pydantic)
2. 异步调用 (Python中若遗漏 `await` 仅返回协程而不执行)
3. 数据库副作用 (事务机制的区别)
