export type DeepSeekMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type DeepSeekConfig = { apiKey: string; baseUrl?: string; model?: string };

export async function callDeepSeek(messages: DeepSeekMessage[], config: DeepSeekConfig = { apiKey: process.env.DEEPSEEK_API_KEY ?? '' }): Promise<string> {
  if (!config.apiKey) throw new Error('DeepSeek API key 未配置');
  const response = await fetch(config.baseUrl ?? process.env.DEEPSEEK_BASE_URL ?? 'https://api.deepseek.com/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` }, body: JSON.stringify({ model: config.model ?? process.env.DEEPSEEK_MODEL ?? 'deepseek-flash', messages, temperature: 0.3, response_format: { type: 'json_object' } }) });
  if (!response.ok) throw new Error(`DeepSeek 请求失败（${response.status}）`);
  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('DeepSeek 未返回有效内容');
  return content;
}
