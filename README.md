# 六级单词助手

一个面向安卓平板和手机的 CET-6 词汇 PWA：复制单词后打开页面即可尝试读取剪贴板，也可以手动输入；查词结果和当天单词保存在当前浏览器，并可生成当天例句和六级阅读。

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm install
Copy-Item .env.example .env
# 编辑 .env，填入 DEEPSEEK_API_KEY
npm run dev
```

电脑端打开 `http://localhost:5173`。开发服务器会监听局域网地址，并将 `/api` 请求代理到 `http://localhost:3001`。手机或平板与电脑连接同一 Wi‑Fi 后，打开 `http://电脑局域网IP:5173`（可用 `ipconfig` 查看 IPv4 地址）。

## 配置

```env
DEEPSEEK_API_KEY=你的 DeepSeek 官方 API Key
DEEPSEEK_BASE_URL=https://api.deepseek.com/chat/completions
DEEPSEEK_MODEL=deepseek-flash
PORT=3001
APP_USERNAME=student
APP_PASSWORD=设置一个访问网页的密码
```

API Key 只由服务端读取，不能写进前端代码，也不要提交到 Git。`APP_PASSWORD` 设置后，打开网页会出现浏览器登录框；`APP_USERNAME` 默认是 `student`。`npm run check-config` 可以检查配置是否存在，但不会打印密钥。


## PWA 安装与部署检查

图标由 `assets/source-icon.jpg` 生成到 `public/icons/`。替换原图后运行 `npm run icons`，会重新生成 192、512、maskable 三种图标。构建产物会包含 manifest、service worker 和全部图标。

必须在 HTTPS 下访问（localhost 除外），否则 service worker 和剪贴板 API 都不可用。部署后：

- Android / Chrome：菜单选择“安装应用”或“添加到主屏幕”，即可全屏打开并离线使用已有页面。
- 平板横屏、手机竖屏都可用，界面会自适应宽度。

## 部署到云平台

使用 Render、Railway 等 Node.js 云平台时，配置：

- Build Command：`npm install && npm run build`
- Start Command：`npm start`
- Environment：设置 `DEEPSEEK_API_KEY`、`DEEPSEEK_BASE_URL`、`DEEPSEEK_MODEL`、`APP_USERNAME`、`APP_PASSWORD`

健康检查地址为 `/api/health`，不需要登录；其他页面和 API 会要求 `APP_USERNAME` 与 `APP_PASSWORD`。

部署完成后使用平台提供的 HTTPS 地址访问，并在安卓平板或手机的 Chrome 菜单里选择“安装应用”。公开部署必须设置 `APP_PASSWORD`，否则任何拿到网址的人都可能调用你的 API 余额。

## 功能

- 剪贴板优先，手动输入回退
- 可提供题目上下文，优先解释当前语境
- 查询释义、词性、音标、六级搭配、例句和记忆提示
- IndexedDB 本地保存当天查词记录
- 根据当天查过的词生成例句和一篇六级阅读
- 可添加到手机主屏幕作为 PWA 使用

## 验证

```bash
npm run typecheck
npm test
npm run build
```

如果没有配置 DeepSeek Key，页面仍可打开，但真实查词和复习生成会返回配置错误；本地存储和界面测试不依赖 API Key。

