---
name: 后台管理系统 API 接口规范
keywords: admin api, fastapi, users, response format, token, request
---

# Admin API 接口与集成规范

本 Skill 定义了 `hm_admin_template` 管理后台与 Python FastAPI 后端 (`http://localhost:8000`) 的真实 API 接口对接规范、响应格式约束及前端调用方法。

---

## 1. 后端统一响应格式 (Python Response Standard)

后端通过 `src/utils/response.py` 统一封装返回数据字典格式，格式如下：

### 成功响应结构 (200, 201, 202, 204)
```json
{
  "code": 200,
  "msg": "请求成功",
  "data": { ... }
}
```

### 分页列表响应结构 (Page Response)
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
  "code": 401,
  "msg": "未授权 / Token 已过期",
  "data": null
}
```

---

## 2. 管理后台 API 接口清单 (`/admin/*`)

后台所有接口前缀均为 `/admin`，完整的 OpenAPI 格式文档参见 `http://localhost:8000/openapi.json`。

### 认证接口 (Authentication)
- **POST `/admin/login`**
  - **描述**: 管理员登录
  - **请求体 (JSON)**: `{"phone": "手机号", "password": "密码"}`
  - **响应**: `{"code": 200, "msg": "请求成功", "data": {"access_token": "JWT_TOKEN", "token_type": "bearer"}}`

### 管理员个人中心 (Admin Self Management)
- **GET `/admin/users/info`**
  - **描述**: 获取当前登录管理员个人信息 (需 Header `Authorization: Bearer <Token>`)
  - **响应**: `{"code": 200, "msg": "请求成功", "data": {"id": 1, "username": "admin", "phone": "...", "avatar": "..."}}`
- **PUT `/admin/users/info`**
  - **描述**: 更新当前登录管理员个人信息
  - **请求体 (JSON)**: `UserUpdate` 结构（可更新 username, email, avatar, password 等）

### 用户管理接口 (User Management)
- **GET `/admin/users/`**
  - **描述**: [管理员] 分页查询用户列表
  - **Query 参数**: `pageNum` (默认 1), `pageSize` (默认 10)
  - **响应**: 统一 `page_response` 格式
- **POST `/admin/users/`**
  - **描述**: [管理员] 创建新用户
  - **请求体 (JSON)**: `{"phone": "...", "password": "...", "username": "...", ...}`
- **GET `/admin/users/{user_id}`**
  - **描述**: [管理员] 根据 ID 查询指定用户详情
- **PUT `/admin/users/{user_id}`**
  - **描述**: [管理员] 更新指定用户信息 (可修改 `is_active` 状态)
- **DELETE `/admin/users/{user_id}`**
  - **描述**: [管理员] 删除指定用户
- **POST `/admin/users/batch`**
  - **描述**: [管理员] 批量导入用户

---

## 3. 前端网络请求封装与使用规约

### 请求拦截器规约 ([src/utils/request.ts](file:///Users/myself/Desktop/web/hm_admin_template/src/utils/request.ts))
1. **网络代理配置**:开发服务器通过 `vue.config.js` 的 `devServer.proxy` 代理 `/dev-api` 到 `http://127.0.0.1:8000`。
2. **Token 携带**: 每一个需要鉴权的请求，均需要在 Header 自动携带 `Authorization: Bearer <Token>`。
3. **状态码校验**: 允许 `res.code` 为 `200`, `201`, `202`, `204` 表示逻辑成功；遇到 `401` 触发登出弹窗并重定向至登录页。

### 前端 API 文件标准 ([src/api/users.ts](file:///Users/myself/Desktop/web/hm_admin_template/src/api/users.ts))
所有后台用户与认证相关调用函数需保持如下写法：
```typescript
import request from '@/utils/request'

export const login = (data: { phone?: string, username?: string, password: string }) =>
  request({
    url: '/admin/login',
    method: 'post',
    data: {
      phone: data.phone || data.username,
      password: data.password
    }
  })

export const getUserInfo = () =>
  request({
    url: '/admin/users/info',
    method: 'get'
  })

export const getUsers = (params?: any) =>
  request({
    url: '/admin/users',
    method: 'get',
    params
  })
```
