import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [react(), VitePWA({ registerType: 'autoUpdate', manifest: { name: '六级单词助手', short_name: '六级助手', description: '快速查词与每日复习', theme_color: '#0f766e', background_color: '#f8fafc', display: 'standalone', start_url: '/' }, workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] } })],
  server: { port: 5173, proxy: { '/api': 'http://localhost:3001' } },
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'] }
});
