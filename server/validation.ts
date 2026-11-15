import { z } from 'zod';

export const wordRequestSchema = z.object({ word: z.string().trim().min(1).max(80), context: z.string().trim().max(1000).optional().default('') });
export type WordRequest = z.infer<typeof wordRequestSchema>;

export const wordResultSchema = z.object({
  word: z.string(), phonetic: z.string().default(''), partOfSpeech: z.string(), meanings: z.array(z.string()).min(1), contextMeaning: z.string(), collocations: z.array(z.string()).default([]), example: z.string(), memoryTip: z.string()
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

export function parseModelJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(cleaned); } catch { throw new Error('模型返回的内容不是有效 JSON'); }
}
