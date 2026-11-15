const required = ['DEEPSEEK_API_KEY', 'DEEPSEEK_BASE_URL', 'DEEPSEEK_MODEL'];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) { console.error(`缺少环境变量：${missing.join(', ')}`); process.exitCode = 1; } else { console.log(`配置完整：${required.filter(key => key !== 'DEEPSEEK_API_KEY').map(key => `${key}=${process.env[key]}`).join(', ')}`); }
