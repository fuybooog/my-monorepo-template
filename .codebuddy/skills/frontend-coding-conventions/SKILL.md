---
name: frontend-coding-conventions
description: This skill must be applied whenever generating, editing, or reviewing frontend code in the admin-pc app (React + Ant Design + SmartTable/SmartForm components). It enforces project-specific coding conventions such as using getMessage() instead of antd's message, extracting all user-facing prompt text into constants/message.ts (no hardcoded strings), using numeric status values, and reusing the SmartTable + useXxxList page pattern.
---

# 前端编码约定 (admin-pc)

本 skill 定义 `apps/admin-pc` 中生成前端代码时必须遵循的约定。每次生成或修改 React 组件、hooks、api 层代码前，先核对本约定。

## 1. 全局提示（最重要）

**禁止**直接从 `antd` 导入 `message` 使用。统一使用项目封装的实例：

```ts
import { getMessage } from '@/utils/antd-instance'
getMessage().success('操作成功')
getMessage().error('操作失败')
getMessage().warning('警告内容')
```

错误写法（不要生成）：

```ts
import { message } from 'antd'
message.success('创建成功')
```

> 原因：项目使用 `getMessage()` 获取全局单例 message 实例，避免在非 React 渲染上下文中调用 antd message 报 context 警告。

## 2. 提示文案集中管理（禁止硬编码）

**所有用户可见的提示文案必须提取到 `apps/admin-pc/src/constants/message.ts`，禁止在业务文件中写字符串字面量。** 该文件已通过 `constants/index.ts` 的 `@/constants` 统一导出。

文件结构（已建立，新增文案时按此归类）：

```ts
// 固定文案：常量对象，按 level + 业务动作命名
export const SUCCESS_MESSAGE = { CREATE: '创建成功', DELETE: '删除成功', OPERATION: '操作成功', ... }
export const ERROR_MESSAGE   = { DELETE: '部分删除失败', SORT_FAILED: '排序失败', ... }
export const WARNING_MESSAGE = {}
export const INFO_MESSAGE    = {}

// 二次确认弹窗文案
export const CONFIRM_MESSAGE = { DELETE_SINGLE: '确定要删除该条数据吗？此操作不可撤销。', RESET_SORT: '确定要重置顺序吗？', ... }

// 含变量的文案：定义为函数，返回拼接字符串
export const formatMessage = {
  confirmDeleteCount: (count: number) => `确认删除选中的 ${count} 条数据吗？`,
  totalCount: (totalCount: number) => `共 ${totalCount} 条数据`,
}
```

使用方式：

```ts
import { SUCCESS_MESSAGE, ERROR_MESSAGE, CONFIRM_MESSAGE, formatMessage } from '@/constants'
import { getMessage } from '@/utils/antd-instance'

getMessage().success(SUCCESS_MESSAGE.VALUE_SET_CREATE) // 常量
getMessage().error(ERROR_MESSAGE.SORT_FAILED) // 常量
getModal().confirm({ content: formatMessage.confirmDeleteCount(3) }) // 含变量 → 函数
```

规则小结：

- **无变量** → 加到对应 `SUCCESS_MESSAGE` / `ERROR_MESSAGE` / `CONFIRM_MESSAGE` 等常量对象
- **有变量** → 加到 `formatMessage` 中的函数（`(arg) => \`...${arg}...\``），调用时传参
- 通用组件（如 `SmartTable`/`SmartTableButtons`）内部文案同样从此文件读取，不内联
- 文案 key 用大写蛇形，值与业务语义对应，避免重复（先查已有 key 再新增）

## 2. 状态值（status）

- 后端实体状态字段为**数字**：`1` = 启用，`0` = 禁用。
- 表单/查询 schema 的 select `options` 使用数字 `value`（`{ label: '启用', value: 1 }`）。
- 状态开关渲染使用 `createStatusRender`（默认 `statusMap: [1, 0]`），不要传字符串 `'ENABLED'/'DISABLED'`。
- 类型中若涉及状态字段，使用 `number` 类型。

## 3. 列表页模式（复用）

新增/修改列表页时，复用既有模块（如 `features/user`）的结构：

- `api/<module>.ts`：封装该模块所有接口，使用 `http`（来自 `@/utils/request`）。
- `hooks/use<Module>List.ts`：封装 `smartTable` ref、`handleFetchData`、搜索、刷新逻辑。
- `model/schemas.tsx`：`SmartSchema` 查询与表单 schema。
- `model/columns.tsx`：`getColumns` 函数返回列定义。
- `pages/<Module>ListPage.tsx`：`PageLayout` + 查询 `SmartForm` + `SmartTable` + 抽屉 `Drawer` + `XxxFormContainer`。
- `components/<Module>FormContainer.tsx`：抽屉内表单容器，编辑时按 id 拉详情。

## 4. 路由

- 页面路由在 `apps/admin-pc/src/router/index.tsx` 中以 routeConfig 数组声明，使用 `permission: [PERMISSIONS.XXX]` 控制权限。
- 权限常量来自 `@repo/shared` 的 `PERMISSIONS`（命名形如 `SYS_<模块>_LIST_PAGE`）。

## 5. 类型

- 前后端共享类型来自 `@repo/types`（`Backend.*`），由后端 swagger 自动生成，**不要手写**业务类型到组件里；缺失类型时先在后端补充 DTO 并重新生成。

## 6. 通用工具

- 时间渲染用 `commonTimeRender`（来自 `@/utils`）。
- 状态渲染用 `createStatusRender`（来自 `@/utils`）。
- 抽屉状态用 `useDrawer` hook。

## 7. SmartForm / SmartSchema 写法（widget 必须传组件）

`SmartForm` 的 `item.widget` 接收的是 **antd 组件本身**，不是字符串。`SmartForm.tsx` 内部 `const WidgetComponent = item.widget || Input`，不传则默认 `Input`，且只有 `WidgetComponent?.displayName === 'Input'/'Select'/...` 命中时才会自动补全 `placeholder`/`allowClear`。

**正确：**

```ts
import { Select } from 'antd'
import { defaultStatusList } from '@/constants'

const schema: SmartSchema = {
  userName: { title: '用户名' }, // 纯文本输入：不写 widget，默认 Input
  status: {
    title: '状态',
    widget: Select, // 传组件，不是字符串
    props: { options: defaultStatusList }, // 状态选项复用 @/constants 的 defaultStatusList
  },
  gender: {
    title: '性别',
    widget: ValueSetSelect, // 自定义组件直接传组件
    props: { setCode: 'SYS_GENDER' },
  },
}
```

**错误（不要生成）：**

```ts
widget: 'input' // ❌ 字符串，会导致 displayName 匹配失败、缺少自动 placeholder/allowClear
widget: 'select' // ❌ 同上
```

规则小结：

- **纯文本/数字输入**：不写 `widget`（默认 `Input`），`SmartForm` 自动加 `请输入${title}` 占位符与 `allowClear`
- **下拉/选择器**：`widget: Select`（从 `antd` 导入组件），`props.options` 优先用 `@/constants` 已有的 `defaultStatusList` 等，不要手写 `{label:'启用',value:1}`
- **自定义组件**（如 `ValueSetSelect`/`AddressSelect`/`DatePicker`）：直接传组件引用
- **placeholder 一般不要手写**：`Input` 自动 `请输入${title}`、`Select` 自动 `请选择${title}`；仅当需要覆盖时才在 `props.placeholder` 显式给出
- `props.options` 支持 `{ id, name }` 结构，组件会自动转成 `{ label: name, value: id }`（见 `useWidgetProps`）

## 8. 表单必填：用 itemProps.rules，不是 requiredWhen

- `requiredWhen` 是**依赖字段动态必填**语义（需配合 `dependencyField` + `hideWhen` 使用），**不是静态必填**
- 静态必填 → 写在 `item.itemProps.rules: [{ required: true, message: 'xxx' }]`（对齐 `user/model/schemas.tsx` 写法）

```ts
userName: {
  title: '用户名',
  itemProps: { rules: [{ required: true, message: '请输入用户名' }] },  // ✅ 静态必填
},
// ❌ 不要写成 requiredWhen: true（那是动态依赖模式）
```

## 9. 列表页 增 / 删 / 改（actionColumn + toolbar）模式

列表页的「新建 / 编辑 / 删除 / 批量删除」必须复用 `SmartTable` 的 `toolbar` + `actionColumn` 能力，并以 `useXxxList` hook + `useDrawer` 组织，参考 `features/user` 模块。

**页面（`<Module>ListPage.tsx`）结构：**

```tsx
const {
  searchParams, smartTable, handleFetchData, searchTable, refreshTable,
  onDelete, onBatchDelete,            // 删除类放 hook
} = useXxxList()

const {
  drawerVisible, formMode, openDrawer, closeDrawer, drawerData: currentId,
} = useDrawer<number>()               // 抽屉状态

const onCreate = () => openDrawer('create')
const onEdit = (record) => openDrawer('edit', record.id)

<SmartTable
  ref={smartTable}
  rowKey="id"                          // 有 id 的实体用默认 id
  request={handleFetchData}
  columns={columns}
  toolbar={{ onCreate, onBatchDelete }}                 // 顶部工具条：新建 + 批量删除
  actionColumn={{ buttons: () => ['edit', 'delete'], onEdit, onDelete }}  // 行操作列
/>

<Drawer title={formTitleMap[formMode]} open={drawerVisible} onClose={() => closeDrawer()} size="large" destroyOnHidden>
  <XxxFormContainer
    id={currentId as number}
    mode={formMode}
    closeDrawer={closeDrawer}
    onSuccess={() => { closeDrawer(); refreshTable() }}   // 成功后关抽屉 + 刷新列表
  />
</Drawer>
```

规则小结：

- **`toolbar.onCreate`**：打开创建抽屉（`openDrawer('create')`）。
- **`actionColumn.buttons`**：数组，预置字符串 `'edit'` / `'delete'` 会被 `SmartTableButtons` 自动渲染成带 Popconfirm 的「编辑 / 删除」按钮；自定义按钮传 `ActionItem` 对象。
- **`onEdit` / `onDelete`** 由页面传入；`onDelete` 处理单行删除（带 Popconfirm 已在组件内），成功后 `getMessage().success(SUCCESS_MESSAGE.DELETE)` 并 `refreshTable()`。
- **`onBatchDelete(keys)`**：`keys` 为选中行 `rowKey` 数组，调用 `api.batchDelete(keys.join())`。
- **删除/批量删除的接口调用与提示**建议下沉到 `useXxxList` hook（见 `useUserList`），页面只负责打开抽屉。
- **`formMode` 与 `drawerData`** 类型：`formMode: SmartFormEditMode`（`'create' | 'edit' | 'view'`），`drawerData` 通常为 `number`（实体 id）。

**虚拟聚合列表（如 value-set 的「集」列表，按 setCode 去重、无 id）的特殊处理：**

- `rowKey` 设为聚合键（如 `rowKey="setCode"`）。
- 这类列表没有单一实体 id，编辑/删除需作用于其下明细：删除时按聚合键拉取全部明细 id 再 `batchDelete`；编辑时取该聚合下第一条明细 id 打开表单。
- 明细页（如 `ValueSetDetailPage`）才是真正的逐条 CRUD，直接用 `valueSetApi.create/update/delete`，与普通列表页一致。
- 创建明细时若需带入聚合维度（如 `setCode` / `setName`），给 `XxxFormContainer` 增加可选 `presetValues` 属性，在 `create` 模式下合并进 `initialValues`。

## 10. 表单按模式切换可见性 / 必填（FormContainer 模式）

编辑与新增共用同一个 `XxxFormContainer` 时，字段的可见性与必填需按 `mode` 切换，参考 `features/resource/components/ResourceFormContainer.tsx`：

- **用 `useMemo` 构建 `dynamicSchema`**：根据 `mode` 修改字段，**不要用 `useState` + `useEffect` 去 `setSchema`**。
- **某个模式下「永不出现」的字段，必须从 schema 中剔除（解构忽略），不要用 `hiddenModes`**。原因：`hiddenModes` 等同 antd 的 `hidden`，字段仍注册在表单里，提交时 antd 会短暂渲染/校验它们，造成「点确定后隐藏字段闪一下才关抽屉」的界面问题。例如编辑集时：`const { code, name, status, ...rest } = valueSetFormSchema; return rest`。
- `hiddenModes` 仅用于「该字段在某些模式下隐藏、但值仍需保留/提交」的场景；纯隐藏不提交的字段一律从 schema 删除。

## 11.1 抽屉关闭时的「隐藏字段闪现」坑（与 useDrawer 配合）

**现象**：编辑模式下（schema 已剔除某些字段），点「确定」提交后，这些字段先闪现一下，抽屉才关闭。

**根因**：`useDrawer().closeDrawer` 不能把 `formMode` 重置回默认值。`Drawer`（`destroyOnHidden`）在关闭**动画期间仍挂载内容**；若 `closeDrawer` 立即把 `formMode` 设回 `'create'`，正在关闭的表单会以 create 模式渲染，被剔除的字段便瞬间出现。

**正确做法**：`closeDrawer` 只 `setDrawerVisible(false)`，**保留 `formMode` / `drawerData`**（用函数式 `setState` 展开 prev），让关闭动画期间仍渲染打开时的模式。下次 `openDrawer` 会重新设置它们，无需在关闭时复位。

## 11.2 同一表单容器区分「编辑集」与「编辑值」（editTarget）

当同一个 `XxxFormContainer` 既用于「编辑聚合维度（集）」又用于「编辑明细（值）」时，用 `editTarget: 'set' | 'value'` 属性区分：

- `editTarget === 'set'`：schema 剔除明细字段（`code`/`name`/`status`/`sortNumber`），仅保留 `setCode`/`setName`；回显/提交只含集字段。
- `editTarget === 'value'`：schema 剔除 `setCode`/`setName`，保留值字段；回显/提交完整值。
- `create`：保留全部字段。
  页面在 `openDrawer` 后渲染容器时按场景传入 `editTarget`；默认 `'value'`。

## 11.3 排序字段（sortNumber）全栈落地

需「可维护 + 列表展示 + 排序」的表，加排序号字段，分层处理：

- **DB**：`synchronize:true`（非生产）下 TypeORM 启动自动按实体加列；否则手动 `ALTER TABLE ... ADD COLUMN sort_number int`。
- **后端**：实体加 `sortNumber` 列；`BaseDto`/`BaseRespDto` 加 `sortNumber?: number`（`@Expose()`）；Repository 排序 `orderBy('x.sortNumber','ASC').addOrderBy('createdAt','DESC')`。
- **前端**：schema 加 `sortNumber`（必填 + `props:{ type:'number' }`，InputNumber）；列表列展示 `sortNumber`；`packages/types` 对应 Dto 同步加字段（后由 typegen 覆盖）。
- **用 `useMemo` 计算 `initialValues`**：
  - 编辑：`findById(id)` 拉取后只回显需要的字段（如 `{ setCode, setName }`）；
  - 新增：给默认值（如 `status: 1`）并合并 `presetValues`。
- **用 `useEffect` 把 `initialValues` 同步进表单**：`if (initialValues) form.setFieldsValue(initialValues)`（依赖 `[initialValues, form]`），不要在 effect 里 `setState` 兜圈子。
- **提交时按 `mode` 裁剪入参**：编辑只提交可见字段（如 `{ setCode, setName }`）；新增提交完整对象。
- **必填用 `itemProps.rules: [{ required: true, message }]`**（文案取自 `constants/message.ts`），**不要用 `requiredWhen: true`**（`requiredWhen` 是动态依赖模式专用）。隐藏字段不会进入提交值，无需为其单独处理必填。
- 回显取值要兼容响应包裹：`const data = (res.data as any)?.data ?? res.data`。

## 12. antd 组件上加样式（间距等）：外层包一层原生元素

**禁止**直接在 antd 组件上写 Tailwind 的 margin 类来加间距（如 `<Steps className="mb-6">`）。原因：

- antd 组件根元素自带 `resetComponent`（`margin: 0`、`padding: 0` 等），且 cssinjs 生成的选择器带 hashId（如 `.ant-steps.ant-steps-css-var-xxx`），特异性（`0-2-0`）高于 Tailwind 类（`0-1-0`）；
- Tailwind v4 的 `mb-*` / `mt-*` 等是**逻辑属性**（`margin-block-end` / `margin-block-start`），与 antd 的物理属性 `margin-bottom` 竞争同一盒模型位置，按 CSS 规范 antd 必然胜出 → 间距不生效。

**正确做法**：把间距写在包在外层的原生元素上（与 LoginCard 的 `<div className="mt-3">` 写法一致）：

```tsx
{/* ✅ 外层 div 承载间距 */}
<div className="mb-6">
  <Steps current={step} items={[{ title: '填写邮箱' }, { title: '重置密码' }]} />
</div>
{/* ❌ 不要直接写在 antd 组件上 */}
<Steps className="mb-6" current={step} items={[...]} />
```

**替代方案**（仅在无法包一层元素时使用）：

- Tailwind v4 的 important 后缀：`className="mb-6!"`（v3 是前缀 `!mb-6`，v4 是后缀）
- 内联样式：`style={{ marginBottom: 24 }}`

> 附带提醒：antd 6 已弃用部分旧 API，开发时留意 IDE 的 `@deprecated` 提示并改用新 API。如 `Alert` 的 `message` 已弃用，改用 `title`；`Steps` 的 `labelPlacement` 改用 `titlePlacement`、`progressDot` 改用 `type="dot"`、`direction` 改用 `orientation`。

## 11. 后端 UpdateDto 字段可选 + 聚合列表状态列

- **编辑时只改部分字段，后端 UpdateDto 必须让未编辑字段可选**。不要直接 `OmitType(BaseDto, ['id'])`（会把 `code`/`name` 等也设为必填，导致「code,name 必填」报错）。正确做法：用 `IntersectionType(OmitType(Base, ['id']), OptionalDto)` 把本次不提交的字段（`code`/`name` 等）显式标 `@IsOptional()`，需要提交的字段（如 `setCode`/`setName`）保持必填。
- **聚合列表（集列表）的状态列**：聚合查询用 `MAX(valueSet.status) AS status`（有任一值启用即视为启用）返回 `status`，响应 DTO 增加该字段；前端用 `createStatusRender({ onStatusChange, refreshList, permission })` 渲染（与 user 模块一致）。`onStatusChange` 作用于整集时，先按聚合键拉取全部明细 id，再调用 `batchUpdateStatus(ids.join(), status)`。
- 切换/删除整集时，明细 id 拉取逻辑抽成可复用的导出函数（如 `fetchSetValueIds(setCode)`），供 `onDelete` / `onBatchDelete` / `onStatusChange` 共用。

## 13. 代码完成自检（每次交付前必跑 lint）

每次完成/修改 `apps/admin-pc` 下任何代码后，**必须先自检再交付**：在 `apps/admin-pc` 目录下运行 lint，确认 **0 error 且尽量 0 warning** 才算完成：

```bash
cd apps/admin-pc && pnpm run lint
```

lint 报告的 warning 不得遗留，须按下述指引修复：

### 13.1 常见 warning 与修复

**① `react-hooks/set-state-in-effect`（禁止在 effect 内同步 setState）**

典型场景：「modal / drawer 的 `open` 由外变 true 时，需同步重置内部表单/结果状态」。

❌ 错误写法（会触发级联渲染告警）：

```tsx
useEffect(() => {
  if (open) {
    setFile(null)
    setResult(null)
  }
}, [open])
```

✅ 正确写法：用 React 官方的 **previous-render 模式**，在**渲染期间**依据上一次渲染的值有条件地调整 state（有 `if` 条件保护且能收敛，React 允许，不会级联）：

```tsx
// 记录上一次的 open，open 从 false→true 那一帧完成重置
const [prevOpen, setPrevOpen] = useState(open)
if (open !== prevOpen) {
  setPrevOpen(open)
  if (open) {
    setFile(null)
    setResult(null)
  }
}
```

> 先例：`ExcelImportModal.tsx` 打开时重置 `file/result/importing/downloading` 即采用此模式。

**② `@typescript-eslint/no-explicit-any`（禁止局部 any）**

不要给局部类型、函数入参、接口字段写 `any`。做法：声明**最小契约**具名类型，需要跨文件复用时 `export`，在 hooks/组件里 import 复用：

```ts
// api/user.ts 中定义并导出
export interface FileResponse {
  data: Blob
  headers?: { 'content-disposition'?: string | null } // 只声明实际用到的响应头
}
```

```ts
// hooks/useUserExcel.ts 中复用，入参不用 any
import userApi, { type FileResponse } from '../api/user'
function resolveFileResponse(res: FileResponse) { ... }
```

> 注：`@repo/api` 的 `HttpClient` 泛型默认 `T = any` 是库侧约定，业务方法只需显式标注返回类型（如 `Promise<FileResponse>`），无需（也不应）再写 `any`。

## 14. 提交代码前必须跑双端测试

**提交前门禁**：任何代码提交之前，必须先运行 **backend-api** 与 **admin-pc** 两边的测试，**两者全部通过后才能继续提交**：

```bash
# 1) 后端
cd apps/backend-api && pnpm run test
# 2) 前端
cd apps/admin-pc && env -u NODE_ENV pnpm run test
```

要点与坑位：

- **admin-pc 必须 `env -u NODE_ENV`**：若执行环境带有 `NODE_ENV=production`，react@19 会加载生产构建（`cjs/react.production.js` **不导出 `act`**），导致大量组件/hook 用例报 `React.act is not a function`（约 21 个用例整片失败）。vitest 只在 NODE_ENV 未设置时才默认置为 `test`，因此跑测试前务必剥离该变量。
- **偶发 flaky 的处理**：若某用例间歇性失败，不要直接略过。先定位竞态根因再修。既有先例：`RemoteSelect.test.tsx`「展开下拉框无数据触发首次加载」用例——组件挂载防抖(300ms)预载与展开时立即加载会重复请求，原 `mockResolvedValueOnce` 只供一次 mock，第二次请求拿到空结果把已渲染数据清空导致 `findByText` 超时。修复方式：改 `mockResolvedValue`（接口始终返回同一结果），并把 `beforeEach` 用 `vi.resetAllMocks()` 防持久实现泄漏。修完需连续多次（≥3）跑全量确认稳定。
- lint 自检（第 13 节）与双端测试都通过，才算完成一次可提交的改动。

## 15. 新模块接入 Excel 导入导出（后端 checklist）

系统 excel 能力是**共享引擎**（`backend-api/src/modules/excel/`，ExcelModule 为 @Global，无需在各业务模块 imports 重复声明）。user / role / resource / value-set 已接入。给新模块接入时照此步骤：

1. **新建 `<module>.import-export.ts`**：声明 `ImportDefinition`（moduleType/fileName/sheetName/fields）与 `ExportColumnSpec[]` + 导出行 interface；只声明列与格式规则，模板生成/解析/公共校验交给 excel.service。
2. **service**：
   - constructor 注入 `private readonly excelService: ExcelService`
   - `downloadTemplate()` → `buildImportTemplate(def)` → 私有 `toExcelStream(buffer, fileName)`
   - `importXxx(file)` → `parseImportFile(def, buffer)` → headerErrors/rows → **业务校验**（文件内重复 + 库内重复、父级/引用存在性，逐行写 `row.errors['中文表头'] = 文案`）→ `dataSource.transaction` 内 `manager.create(Entity, {...})` 逐行保存（**部分成功语义**，catch 里标 `row.errors['保存']`）→ 组装 `ImportResultDto`（total/successCount/failCount/failedRows）
   - `exportXxx(query)` → 复用 repository 列表查询**循环翻页全量**（分页 DTO pageSize 上限 500，禁止传大 pageSize）→ `buildExportBuffer` → toExcelStream
   - 坑：Excel 解析值类型是 `string|number|boolean`，落库前须收窄（如 `status: row.values.status === 0 ? 0 : 1`），否则 `manager.create` 会因类型不匹配解析到数组重载而 TS 报错。
3. **controller**：三个路由已约定 `POST <模块>/template|import|export` + 权限码 `SYS_XXX_LIST_IMPORT/EXPORT`。若脚手架预置了空壳方法，只需补齐参数：template 无参；import 带 `@UploadedFile() file: ExcelUploadFile | undefined` + `FileInterceptor('file')`；export 带 `@Query() query: XxxPageDto`。需要等级权限的（如 role）额外注入 `@CurrentUser()` 的 maxLevel 传给 service。
4. **前端**：api 文件加 `FileResponse`（导出）+ 三个方法（模板 `http.post('/xxx/template', undefined, {responseType:'blob'})`、导入 FormData append `file`、导出参数走 params）；新建 `useXxxExcel.ts`（模板/导入/导出三回调 + `resolveFileResponse` + 权限码 + 兜底文件名常量在 message.ts EXCEL_MESSAGE 里按 `XXX_IMPORT_TITLE` 等命名）；列表页 `<SmartTable excel={...} />` 一行接入。
5. **验证**：backend-api `tsc --noEmit` + eslint、admin-pc lint + 两端 test（第 13/14 节）全绿。
