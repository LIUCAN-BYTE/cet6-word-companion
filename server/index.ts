import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { router } from './routes';
import { createBasicAuth } from './auth';

const app = express();
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDirectory = path.join(projectRoot, 'dist');
app.use(cors());
app.use(express.json({ limit: '32kb' }));
const protectApp = createBasicAuth();
const protectApp = createBasicAuth();
// PWA 安装检测需要匿名读取 manifest、service worker、图标和构建产物，
// 这些文件不含密钥或用户数据；页面与 API 仍受密码保护。
const PUBLIC_PREFIXES = ['/manifest.webmanifest', '/sw.js', '/registerSW.js', '/workbox-', '/icons/', '/assets/'];
app.use((req, res, next) => {
  if (req.path === '/api/health' || PUBLIC_PREFIXES.some(p => req.path.startsWith(p))) {
    next();
    return;
  }
  protectApp(req, res, next);
});

app.use('/api', router);
app.use(express.static(distDirectory));
app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(distDirectory, 'index.html')));
if (process.env.NODE_ENV !== 'test') app.listen(Number(process.env.PORT ?? 3001), () => console.log('API server listening on port ' + (process.env.PORT ?? 3001)));
export default app;
