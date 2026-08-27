# 页面创建流程与 Token 优化规范 (Page Creation & Token Optimization)

针对 AI 助手生成/修改页面时的**标准化固定流程**，避免大面积扫描项目文件造成 Token 浪费与性能下降。

---

## 1. 页面创建标准 4 件套路径 (固定路径，禁止全盘扫描)

接到创建页面或模块指令时，**严禁使用 `list_dir` 全盘遍历 `src/`**。直接按以下固定结构建立 4 个文件：

```text
apps/web-ele/src/
├── api/<module>.ts                                  # 1. API 接口与类型定义
├── router/routes/modules/<module>.ts                # 2. 动态路由与菜单配置
└── views/<module>/<page>/
    ├── index.vue                                    # 3. 视图主页面 (Page 容器 + useTable)
    └── components/<domain>-[drawer|dialog].vue      # 4. 详情/表单组件 (必须在 components/ 子目录)
```

---

## 2. 极简 4 件套职责速查

1. **API 层 (`api/<module>.ts`)**：
   导出列表查询 Api 方法及 TS 接口定义（`Item` 与 `QueryParams`）。
2. **路由层 (`router/routes/modules/<module>.ts`)**：
   定义 `RouteRecordRaw` 数组，路由匹配与侧边栏菜单由框架自动加载。
3. **主页面 (`views/<module>/<page>/index.vue`)**：
   使用 `@vben/common-ui` 的 `Page` + `useTable` + `ElTable` + 顶部检索卡片。
4. **侧滑/弹窗组件 (`views/<module>/<page>/components/...`)**：
   根据确认的模式定义 Drawer/Dialog，放在 `components/` 子目录下，通过 `ref` 的 `open(row)` 呼出。

---

## 3. Token 防滥用与开发避坑规则

- 🛑 **禁止盲目遍历目录**：严禁探查不相干的 view 或组件库源文件，只读取业务相关 API/路由文件。
- 🛑 **弹窗/抽屉归位**：组件必须放在 `components/` 目录下，严禁在页面根路径乱放。
- 🛑 **解耦 Hook 优先**：表格逻辑必须使用 `useTable`，禁止手写重复的分页与 Loading 逻辑。
- 🛑 **插槽传参类型兼容**：在 `index.vue` 的 `ElTable` 动作按钮中传参 `handleViewDetail(row: any)` 并转型 `row as Item`，避免 Element Plus 插槽默认类型报错。
