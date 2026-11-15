import { describe, expect, it, vi, beforeEach } from 'vitest';
import { parseModelJson, reviewPackSchema, wordRequestSchema, wordResultSchema } from '../server/validation';

describe('server validation', () => {
  it('trims and bounds a word request', () => {
    expect(wordRequestSchema.parse({ word: '  resilient  ', context: '  a context ' })).toEqual({ word: 'resilient', context: 'a context' });
    expect(() => wordRequestSchema.parse({ word: '' })).toThrow();
  });

  it('parses a valid model result', () => {
    const result = wordResultSchema.parse({ word: 'resilient', phonetic: '/rɪˈzɪliənt/', partOfSpeech: 'adj.', meanings: ['有韧性的'], contextMeaning: '坚韧的', collocations: ['resilient economy'], example: 'She is resilient.', memoryTip: 're + silent' });
    expect(result.word).toBe('resilient');
  });

  it('extracts fenced JSON and rejects malformed JSON', () => {
    expect(parseModelJson('```json\n{"word":"adapt"}\n```')).toEqual({ word: 'adapt' });
    expect(() => parseModelJson('not json')).toThrow(/JSON/);
  });

  it('accepts review vocabulary entries when the model omits optional notes', () => {
    const pack = reviewPackSchema.parse({
      dateKey: '2026-11-15',
      examples: [],
      reading: {
        title: 'Review',
        body: 'A reading.',
        translation: '一篇阅读。',
        vocabulary: [{ word: 'adapt' }]
      }
    });
    expect(pack.reading.vocabulary[0].note).toBe('');
  });
});

describe('deepseek adapter', () => {
  beforeEach(() => vi.restoreAllMocks());
  it('fails clearly when the API key is missing', async () => {
    const { callDeepSeek } = await import('../server/deepseek');
    await expect(callDeepSeek([{ role: 'user', content: 'hi' }], { apiKey: '' })).rejects.toThrow(/API key/);
  });
});
