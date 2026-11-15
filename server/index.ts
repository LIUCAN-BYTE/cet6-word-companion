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
app.use((req, res, next) => {
  if (req.path === '/api/health') {
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
