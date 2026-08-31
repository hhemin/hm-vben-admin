---
name: 后台管理系统 API 接口规范
description: FastAPI 后端接口对接规范、统一响应结构、Token 鉴权、用户/后台人员/轮播图/课程/操作日志 CRUD 接口定义与前端调用标准。
keywords: admin api, fastapi, users, admin-users, banners, courses, operation-logs, response format, token, request, crud
---

# Admin API 接口与集成规范

本 Skill 定义了 `hm-vben-admin` 管理后台与 Python FastAPI 后端 (`http://localhost:8000`) 的真实 API 接口对接规范、响应格式约束及前端调用方法。

---

## 1. 后端统一响应格式 (FastAPI Response Standard)

后端通过 `src/utils/response.py` 统一封装返回数据字典格式：

### 成功响应结构 (200, 201, 202, 204)
```json
{
  "code": 200,
  "msg": "请求成功",
  "data": { ... }
}
```

### 分页列表响应结构 (Page / List Response)
```json
{
  "code": 200,
  "msg": "请求成功",
  "data": {
    "items": [ ... ],
    "count": 100,
    "page": 1,
    "pageSize": 10,
    "totalPages": 10
  }
}
```

### 错误响应结构 (400, 401, 403, 404, 422, 500 等)
```json
{
  "code": 1001,
  "msg": "错误提示信息",
  "data": null
}
```

---

## 2. 管理后台 API 接口清单 (`/admin/*`)

完整 OpenAPI 格式规范文档参见 `http://localhost:8000/openapi.json`。

### 认证接口 (Authentication)
- **POST `/admin/login`**：管理员/教师登录（入参：`phone`, `password`；出参：`accessToken`, `roles`, `adminId`）
- **GET `/admin/me`**：获取当前登录后台用户信息
- **PUT `/admin/profile`**：修改当前登录用户个人资料（入参：`phone`, `avatar`, `remark`, `category`）
- **POST `/admin/change-password`**：修改当前登录用户密码（入参：`oldPassword`, `newPassword`, `confirmPassword`）

### 用户管理接口 (User Management - 前台普通用户)
- **GET `/admin/users/`**：[管理员] 分页及条件检索用户列表（参数：`phone`, `username`, `page/pageNum`, `pageSize/limit`）
- **POST `/admin/users/`**：[管理员] 创建新用户（入参：`phone`, `password`, `username`, `email`, `idCard`, `gender`, `address`, `avatar`）
- **GET `/admin/users/{user_id}`**：[管理员] 获取指定用户详情
- **PUT `/admin/users/{user_id}`**：[管理员] 更新指定用户信息 (入参支持修改 `isActive` 状态)
- **DELETE `/admin/users/{user_id}`**：[管理员] 删除用户
- **POST `/admin/users/batch`**：[管理员] 批量导入用户

### 人员管理接口 (Staff Management - 后台管理/教职人员)
- **GET `/admin/admin-users/`**：[管理员] 分页及条件检索后台人员列表（参数：`phone`, `employeeNo`, `status`, `page/pageNum`, `pageSize/limit`）
- **POST `/admin/admin-users/`**：[管理员] 创建后台人员（入参：`phone`, `employeeNo`, `password`, `roles`, `category`, `remark`, `status`）
- **GET `/admin/admin-users/{admin_id}`**：[管理员] 获取指定后台人员详情
- **PUT `/admin/admin-users/{admin_id}`**：[管理员] 更新后台人员信息（支持工号 `employeeNo`、角色、部门、状态等全量/增量更新）
- **DELETE `/admin/admin-users/{admin_id}`**：[管理员] 删除后台人员

### 轮播图管理接口 (Banner Management)
- **GET `/admin/banners/`**：[管理员] 获取所有轮播图列表（含停用）
- **POST `/admin/banners/`**：[管理员] 新建广告轮播图（入参：`imageUrl`, `title`, `targetUrl`, `sortOrder`, `isActive`）
- **PUT `/admin/banners/{banner_id}`**：[管理员] 编辑轮播图（记录操作审计日志）
- **DELETE `/admin/banners/{banner_id}`**：[管理员] 删除轮播图（记录操作审计日志）

### 课程管理与考勤接口 (Course & Checkin Management)
- **GET `/admin/courses/`**：[管理员] 分页查询课程列表（参数：`status`, `pageNum`, `pageSize`）
- **POST `/admin/courses/`**：[管理员] 发布新课程（入参：`title`, `address`, `startTime`, `endTime`, `content`, `teacherId`, `maxCapacity`, `status`）
- **PUT `/admin/courses/{course_id}`**：[管理员] 编辑课程信息（记录操作审计日志）
- **DELETE `/admin/courses/{course_id}`**：[管理员] 删除课程（记录操作审计日志）
- **GET `/admin/courses/{course_id}/checkins`**：[管理员/教师] 查看课程学员签到核验名册
- **POST `/admin/courses/reservations/{reservation_id}/teacher-checkin`**：[管理员/教师] 手动代学员完成打卡

### 安全审计日志接口 (Operation Logs)
- **GET `/admin/operation-logs/`**：[管理员] 分页及模块检索系统操作审计日志（出参：`id`, `operatorType`, `operatorId`, `operatorName`, `module`, `action`, `targetTable`, `targetId`, `detail`, `ip`, `createdTime`）

---

## 3. 前端网络请求封装与使用规约

### 请求拦截器规约 ([src/api/request.ts](file:///Users/myself/Desktop/myself/hm-vben-admin/apps/web-ele/src/api/request.ts))
1. **Token 携带**：所有受保护接口通过请求拦截器自动附加 `Authorization: Bearer <Token>`。
2. **状态码校验**：基于 `defaultResponseInterceptor`，当 `code: 200` 时自动解包返回 `data` 节点。
3. **字段规范**：后端响应 DTO 统一输出小驼峰（`camelCase`）格式（如 `createdTime`, `isActive`, `employeeNo`, `operatorType`, `detail` 等）。

---

## 4. 接口更新与演进规范 (API Evolution & Type Mutation Rules)

针对管理后台庞大多变的业务模块体系，必须严格遵守以下**更新准则与标准维护工作流**：

### 4.1 核心决策准则

1. **Type 变化驱动原则 (Type-Driven Mutation)**：
   - **仅当 Type 类型/契约发生实质变更时才修改代码**：包括字段重命名（如 snake_case 转 camelCase）、属性增删、字段类型变更或必填项调整。
   - **无变动不触碰**：若接口 URL 或内部业务逻辑未引起入参/出参 Schema 变化，严禁随意修改现有稳态的 `api/*.ts` 接口及业务视图。
2. **零冗余别名规约 (Zero Redundant Aliases)**：
   - 彻底拒绝历史兼容别名（如 `employee_no?: string`、`is_active?: boolean` 等）。
   - TypeScript 类型定义必须与后端 OpenAPI 契约 **1:1 严格对齐**，确保类型系统纯净可靠。
3. **高内聚业务模块化 (High-Cohesion Modularization)**：
   - 接口按业务域独立拆分文件（`api/<module>.ts`，如 `users.ts`, `courses.ts`, `admin-users.ts`, `operation-logs.ts`），严禁巨石单体堆砌。
   - 基础公共设施归入 `core/`（如 `auth.ts`, `user.ts`, `menu.ts`）。

### 4.2 接口更新 4 步标准工作流

```text
[Step 1 契约比对] ➔ 比对 http://localhost:8000/openapi.json 与本地 api/*.ts 类型差异
[Step 2 类型重构] ➔ 仅在 Type 变动时，就地修改对应业务模块的 Payload 及 Item Interface
[Step 3 视图同步] ➔ 全局检索并级联更新受影响的 View 组件（表单 prop、表格 column、v-model）及 Store 状态
[Step 4 编译校验] ➔ 执行 `vue-tsc --noEmit --skipLibCheck` 确保 0 Error 闭环
```
