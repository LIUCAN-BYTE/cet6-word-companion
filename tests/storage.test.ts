import { describe, expect, it, beforeEach } from 'vitest';
import { clearDatabase, getTodayKey, groupWordsByDate, listHistory, listTodayWords, saveReviewPack, saveWord, getReviewPack, type WordRecord } from '../client/storage';

const makeWord = (id: string, searchedAt: string, extra: Partial<WordRecord> = {}): WordRecord => ({ id, word: id, normalizedWord: id, context: '', phonetic: '', partOfSpeech: 'v.', meanings: ['释义'], contextMeaning: '释义', collocations: [], example: '', memoryTip: '', searchedAt, ...extra });

describe('local storage', () => {
  beforeEach(async () => { await clearDatabase(); });
  it('uses local calendar date keys', () => expect(getTodayKey(new Date(2026, 10, 15))).toBe('2026-11-15'));
  it('upserts a word and filters today', async () => {
    await saveWord(makeWord('adapt', new Date().toISOString(), { meanings: ['适应'], contextMeaning: '适应' }));
    expect((await listTodayWords())).toHaveLength(1);
    await saveWord(makeWord('adapt', new Date().toISOString(), { context: 'new', meanings: ['调整'], contextMeaning: '调整' }));
    expect((await listTodayWords())).toHaveLength(1); expect((await listTodayWords())[0].context).toBe('new');
  });
  it('saves and loads a review pack', async () => { const pack = { id: '2026-11-15', dateKey: '2026-11-15', wordIds: ['1'], examples: [], reading: { title: 'A', body: 'B', translation: 'C', vocabulary: [] }, generatedAt: new Date().toISOString() }; await saveReviewPack(pack); expect(await getReviewPack('2026-11-15')).toEqual(pack); });
});

describe('history grouping', () => {
  beforeEach(async () => { await clearDatabase(); });
  it('groups words by local date, newest day first, newest word first within a day', () => {
    const d1a = new Date(2026, 10, 15, 9).toISOString(); const d1b = new Date(2026, 10, 15, 18).toISOString(); const d2 = new Date(2026, 10, 16, 8).toISOString();
    const days = groupWordsByDate([makeWord('early', d1a), makeWord('later', d1b), makeWord('next', d2)], [{ id: '2026-11-15', dateKey: '2026-11-15', wordIds: [], examples: [], reading: { title: '', body: '', translation: '', vocabulary: [] }, generatedAt: d1b }]);
    expect(days.map(d => d.dateKey)).toEqual(['2026-11-16', '2026-11-15']);
    expect(days[1].words.map(w => w.id)).toEqual(['later', 'early']);
    expect(days[1].hasReview).toBe(true); expect(days[0].hasReview).toBe(false);
  });
  it('listHistory reads every stored word, not just today', async () => {
    await saveWord(makeWord('old', new Date(2024, 0, 1).toISOString())); await saveWord(makeWord('now', new Date().toISOString()));
    const days = await listHistory();
    expect(days.flatMap(d => d.words.map(w => w.id)).sort()).toEqual(['now', 'old']);
    expect(days[0].dateKey).toBe(getTodayKey());
  });
});
