import { describe, expect, it, vi, beforeEach } from 'vitest';
import { describeValidationError, parseModelJson, reviewPackSchema, wordRequestSchema, wordResultSchema } from '../server/validation';

describe('server validation', () => {
  it('trims and bounds a word request', () => {
    expect(wordRequestSchema.parse({ word: '  resilient  ', context: '  a context ' })).toEqual({ word: 'resilient', context: 'a context' });
    expect(() => wordRequestSchema.parse({ word: '' })).toThrow();
  });

  it('parses a valid model result', () => {
    const result = wordResultSchema.parse({ word: 'resilient', phonetic: '/rɪˈzɪliənt/', partOfSpeech: 'adj.', meanings: ['有韧性的'], contextMeaning: '坚韧的', collocations: ['resilient economy'], example: 'She is resilient.', memoryTip: 're + silent' });
    expect(result.word).toBe('resilient');
  });

  it('flattens object-shaped meanings and collocations into strings', () => {
    const result = wordResultSchema.parse({
      word: 'resilient', phonetic: '', partOfSpeech: 'adj.',
      meanings: [{ pos: 'adj.', meaning: '有韧性的' }, { pos: 'adj.', meaning: '恢复快的' }],
      contextMeaning: { meaning: '坚韧的' },
      collocations: 'resilient economy',
      example: 'She is resilient.', memoryTip: null
    });
    expect(result.meanings).toEqual(['adj. 有韧性的', 'adj. 恢复快的']);
    expect(result.contextMeaning).toBe('坚韧的');
    expect(result.collocations).toEqual(['resilient economy']);
    expect(result.memoryTip).toBe('');
  });

  it('still rejects a result with no usable meanings and reports a friendly message', () => {
    let caught: unknown;
    try { wordResultSchema.parse({ word: 'x', partOfSpeech: 'n.', meanings: [], contextMeaning: '', example: '', memoryTip: '' }); } catch (error) { caught = error; }
    expect(describeValidationError(caught, '查词失败')).toMatch(/meanings/);
    expect(describeValidationError(new Error('DeepSeek 请求失败（429）'), '查词失败')).toBe('DeepSeek 请求失败（429）');
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
