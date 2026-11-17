import { describe, expect, it } from 'vitest';
import { splitHighlights, stemOf } from '../client/highlight';
import { findNewWords } from '../client/components/ReviewPackView';
import type { SavedReviewPack, WordRecord } from '../client/storage';

const word = (id: string): WordRecord => ({ id, word: id, normalizedWord: id, context: '', phonetic: '', partOfSpeech: '', meanings: ['x'], contextMeaning: '', collocations: [], example: '', memoryTip: '', searchedAt: new Date().toISOString() });

describe('reading highlight', () => {
  it('derives stems that match common inflections', () => {
    expect(stemOf('adapt')).toBe('adap'); expect(stemOf('resilient')).toBe('resili'); expect(stemOf('cat')).toBe('cat');
  });
  it('marks looked-up words and their inflections, case-insensitively', () => {
    const pieces = splitHighlights('Adapted species show resilience; a cat sat.', ['adapt', 'resilient']);
    expect(pieces.filter(p => p.hit).map(p => p.text)).toEqual(['Adapted', 'resilience']);
    expect(pieces.map(p => p.text).join('')).toBe('Adapted species show resilience; a cat sat.');
  });
  it('returns the text untouched when there is nothing to match', () => {
    expect(splitHighlights('plain text', [])).toEqual([{ text: 'plain text', hit: false }]);
  });
});

describe('review freshness', () => {
  const pack: SavedReviewPack = { id: '2026-11-17', dateKey: '2026-11-17', wordIds: ['adapt'], examples: [], reading: { title: '', body: '', translation: '', vocabulary: [] }, generatedAt: '' };
  it('lists words looked up after the pack was generated', () => {
    expect(findNewWords([word('adapt'), word('resilient')], pack).map(w => w.id)).toEqual(['resilient']);
    expect(findNewWords([word('adapt')], pack)).toEqual([]);
    expect(findNewWords([word('adapt')], null)).toHaveLength(1);
  });
});
