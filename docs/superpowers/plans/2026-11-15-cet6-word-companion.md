# CET-6 单词助手实施计划

> **面向代理开发者：** 必须使用 `superpowers:subagent-driven-development`（推荐）或 `superpowers:executing-plans` 子技能逐项执行本计划。每项步骤使用复选框（`- [x]`）跟踪完成情况。

**目标：** 构建一个可安装、适合手机使用的 PWA，通过 DeepSeek 查询六级单词、在本地保存查词记录，并生成当天的复习材料。

**架构：** Vite + React 客户端通过 Express 服务端代理调用 DeepSeek。服务端负责保存 DeepSeek 凭证并验证模型结构化输出；客户端负责 IndexedDB 本地记录，以及查词、今日词汇和复习页面的展示。

**技术栈：** TypeScript、React、Vite、Express、Zod、IndexedDB、Vitest、Testing Library、vite-plugin-pwa。

**对应规格：** `docs/superpowers/specs/2026-11-15-cet6-word-companion-design.md`

## 全局约束

- DeepSeek Key 必须只保存在服务端的 `DEEPSEEK_API_KEY` 中。
- 默认 API 地址为 `https://api.deepseek.com/chat/completions`。
- v1 版本使用 IndexedDB 本地保存，不做账号和云同步。
- 剪贴板读取是尽力而为，手动输入必须始终可用。
- 调用模型前必须裁剪并限制输入长度；模型返回的无效 JSON 必须转化为可重试错误。

---

### 任务 1：搭建全栈 PWA 基础结构

**文件：**
- 新建：`package.json`、`tsconfig.json`、`vite.config.ts`、`index.html`
- 新建：`client/`、`server/`、`shared/`、`tests/`
- 新建：`.env.example`、`.gitignore`、`README.md`

- [x] **步骤 1：添加 package 脚本和依赖**，包括 `dev`、`build`、`test`、`typecheck`，并加入 React、Express、Zod、Vitest、Testing Library 和 vite-plugin-pwa。
- [x] **步骤 2：添加 TypeScript/Vite 配置**，客户端入口设为 `client/main.tsx`，服务端入口设为 `server/index.ts`。
- [x] **步骤 3：添加健康检查接口和最小客户端外壳**，使 `npm run dev` 能启动客户端与服务端，使 `npm run build` 能生成客户端构建产物。
- [x] **步骤 4：运行 `npm run typecheck` 和 `npm run build`**，修复配置错误。

### 任务 2：定义数据契约并实现 DeepSeek 服务端适配器

**文件：**
- 新建：`shared/contracts.ts`
- 新建：`server/deepseek.ts`、`server/validation.ts`、`server/routes.ts`
- 测试：`tests/server.test.ts`

- [x] **步骤 1：先写失败测试**，覆盖输入裁剪与长度限制、有效单词结果解析、模型返回格式错误以及缺少 API Key 的情况。
- [x] **步骤 2：实现 Zod 数据结构**，包括 `WordRecordInput`、`WordResult`、`ReviewRequest` 和 `ReviewPack`。
- [x] **步骤 3：实现 `callDeepSeek(messages)`**，使用配置中的 API 地址和模型，并设置超时，返回 assistant 的文本内容。
- [x] **步骤 4：实现 `/api/word`**，完成输入校验、严格 JSON 提示词、模型 JSON 的防御性提取和结构校验。
- [x] **步骤 5：实现 `/api/review`**，采用同样的安全措施，并要求生成内容自然覆盖所有传入单词。
- [x] **步骤 6：运行 `npm test -- tests/server.test.ts`**，确认服务端测试全部通过。

### 任务 3：实现 IndexedDB 本地存储仓库

**文件：**
- 新建：`client/storage.ts`
- 测试：`tests/storage.test.ts`

- [x] **步骤 1：先写失败测试**，覆盖按标准化单词更新、按当天筛选，以及保存和读取复习包。
- [x] **步骤 2：实现类型安全的 IndexedDB 封装**，建立 `words` 和 `reviews` 两个对象仓库，并在 `normalizedWord` 和 `dateKey` 上建立索引。
- [x] **步骤 3：添加确定性的日期键函数**，使用用户本地日历日期。
- [x] **步骤 4：运行 `npm test -- tests/storage.test.ts`**，确认数据持久化行为正确。

### 任务 4：构建移动端优先的界面和 PWA 外壳

**文件：**
- 新建：`client/App.tsx`、`client/styles.css`、`client/api.ts`、`client/components/WordResultCard.tsx`、`client/components/TodayList.tsx`、`client/components/ReviewPackView.tsx`
- 修改：`client/main.tsx`、`vite.config.ts`
- 测试：`tests/app.test.tsx`

- [x] **步骤 1：先写失败的界面测试**，覆盖剪贴板预填与手动输入回退、提交查词、本地记录展示和生成复习内容。
- [x] **步骤 2：实现响应式外壳**，包含四个视图：查词、今日词汇、今日复习、设置。
- [x] **步骤 3：实现剪贴板优先初始化**，对 `navigator.clipboard.readText()` 做功能检测和权限错误处理。
- [x] **步骤 4：实现查词和复习接口客户端**，并通过本地存储仓库保存成功结果。
- [x] **步骤 5：添加加载、错误和空状态**，显示 DeepSeek 配置状态，但不能暴露凭证。
- [x] **步骤 6：启用 PWA manifest 和 service worker**，设置中文应用名称和主题色。
- [x] **步骤 7：运行 `npm test -- tests/app.test.tsx` 和 `npm run build`**。

### 任务 5：补充文档并完成端到端验证

**文件：**
- 修改：`README.md`
- 新建：`scripts/check-config.mjs`

- [x] **步骤 1：记录本地启动方法**，包括 Node 版本、`npm install`、`.env` 配置、`npm run dev` 和生产构建。
- [x] **步骤 2：说明 DeepSeek API 地址和模型配置方式**，明确 API Key 不能写入客户端代码。
- [x] **步骤 3：添加配置检查脚本**，报告缺少的环境变量，但不能打印密钥内容。
- [x] **步骤 4：运行 `npm run typecheck`、`npm test` 和 `npm run build`**。
- [x] **步骤 5：在手机尺寸视口手动验证核心流程**：剪贴板/手动查词、刷新页面后今日词汇仍然存在、生成的复习内容正常显示。若受 API 配置影响无法验证，必须明确记录限制。
