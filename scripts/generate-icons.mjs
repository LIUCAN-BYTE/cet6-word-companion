// 从 assets/ 中的原图生成 PWA / iOS 图标。
// 用法：node scripts/generate-icons.mjs
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const source = path.resolve('assets/source-icon.jpg');
const outDir = path.resolve('public/icons');
const background = '#0f766e';

await mkdir(outDir, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 }
];

for (const { file, size } of targets) {
  await sharp(source).resize(size, size, { fit: 'cover', position: 'centre' }).png({ compressionLevel: 9 }).toFile(path.join(outDir, file));
  console.log('written', path.join('public/icons', file));
}

// maskable 图标：内容缩到 80% 安全区，四周填充主题色
const maskableSize = 512;
const inner = Math.round(maskableSize * 0.8);
const inset = Math.round((maskableSize - inner) / 2);
const innerIcon = await sharp(source).resize(inner, inner, { fit: 'cover', position: 'centre' }).png().toBuffer();
await sharp({ create: { width: maskableSize, height: maskableSize, channels: 3, background } })
  .composite([{ input: innerIcon, top: inset, left: inset }])
  .png({ compressionLevel: 9 })
  .toFile(path.join(outDir, 'icon-maskable-512.png'));
console.log('written', path.join('public/icons', 'icon-maskable-512.png'));
