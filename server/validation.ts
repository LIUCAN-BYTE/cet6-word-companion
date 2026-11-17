import { z } from 'zod';

export const wordRequestSchema = z.object({ word: z.string().trim().min(1).max(80), context: z.string().trim().max(1000).optional().default('') });
export type WordRequest = z.infer<typeof wordRequestSchema>;

/** 模型偶尔把 "坚韧的" 写成 {"pos":"adj.","meaning":"坚韧的"} 这类对象，这里统一拍平成一行文字。 */
export function toText(value: unknown): string {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join('；');
  if (value && typeof value === 'object') return Object.values(value as Record<string, unknown>).map(toText).filter(Boolean).join(' ');
  return '';
}
/** 字符串数组；允许模型返回单个字符串、对象数组或 null，都会被规整成 string[]。 */
const textList = z.preprocess(value => {
  if (value == null) return [];
  const items = Array.isArray(value) ? value : [value];
  return items.map(toText).filter(Boolean);
}, z.array(z.string()));
const text = z.preprocess(toText, z.string());

export const wordResultSchema = z.object({
  word: text.pipe(z.string().min(1, '模型没有返回单词')), phonetic: text.default(''), partOfSpeech: text.default(''), meanings: textList.pipe(z.array(z.string()).min(1, '模型没有返回释义')), contextMeaning: text.default(''), collocations: textList.default([]), example: text.default(''), memoryTip: text.default('')
});
export type WordResult = z.infer<typeof wordResultSchema>;

export const reviewRequestSchema = z.object({ dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), words: z.array(z.object({ word: z.string().min(1), meanings: z.array(z.string()).default([]) })).min(1).max(60) });
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

export const reviewPackSchema = z.object({
  dateKey: z.string(),
  examples: z.array(z.object({ word: z.string(), sentence: z.string(), translation: z.string() })),
  reading: z.object({ title: z.string(), body: z.string(), translation: z.string(), vocabulary: z.array(z.object({ word: z.string(), note: z.string().optional().default('') })) })
});
export type ReviewPack = z.infer<typeof reviewPackSchema>;

export function parseModelJson(raw: string): unknown {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch { throw new Error('模型返回的内容不是有效 JSON'); }
}

/** 把 Zod 的结构错误转成一句用户能看懂的话，而不是把原始 JSON 丢到页面上。 */
export function describeValidationError(error: unknown, fallback: string): string {
  if (error instanceof z.ZodError) {
    const fields = [...new Set(error.issues.map(issue => String(issue.path[0] ?? '')).filter(Boolean))];
    return fields.length ? `模型返回的格式不符合预期（字段：${fields.join('、')}），请重试一次` : '模型返回的格式不符合预期，请重试一次';
  }
  return error instanceof Error ? error.message : fallback;
}
