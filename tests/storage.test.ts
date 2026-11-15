import { describe, expect, it, beforeEach } from 'vitest';
import { clearDatabase, getTodayKey, listTodayWords, saveReviewPack, saveWord, getReviewPack } from '../client/storage';

describe('local storage', () => {
  beforeEach(async () => { await clearDatabase(); });
  it('uses local calendar date keys', () => expect(getTodayKey(new Date(2026, 10, 15))).toBe('2026-11-15'));
  it('upserts a word and filters today', async () => {
    await saveWord({ id: '1', word: 'adapt', normalizedWord: 'adapt', context: '', phonetic: '', partOfSpeech: 'v.', meanings: ['适应'], contextMeaning: '适应', collocations: [], example: 'We adapt.', memoryTip: '', searchedAt: new Date().toISOString() });
    expect((await listTodayWords())).toHaveLength(1); await saveWord({ id: 'adapt', word: 'adapt', normalizedWord: 'adapt', context: 'new', phonetic: '', partOfSpeech: 'v.', meanings: ['调整'], contextMeaning: '调整', collocations: [], example: 'We adapt.', memoryTip: '', searchedAt: new Date().toISOString() }); expect((await listTodayWords())).toHaveLength(1); expect((await listTodayWords())[0].context).toBe('new');
  });
  it('saves and loads a review pack', async () => { const pack = { id: '2026-11-15', dateKey: '2026-11-15', wordIds: ['1'], examples: [], reading: { title: 'A', body: 'B', translation: 'C', vocabulary: [] }, generatedAt: new Date().toISOString() }; await saveReviewPack(pack); expect(await getReviewPack('2026-11-15')).toEqual(pack); });
});

