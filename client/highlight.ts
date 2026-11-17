export type TextPiece = { text: string; hit: boolean };

/**
 * 取词干前缀，让 adapt 也能命中 adapted / adaptation，resilient 命中 resilience。
 * 短词保留全词，避免 cat 命中 category 之类的误报。
 */
export function stemOf(word: string): string {
  const w = word.trim().toLowerCase();
  if (w.length >= 7) return w.slice(0, -3);
  if (w.length >= 5) return w.slice(0, -1);
  return w;
}

/** 把一段文字切成「命中 / 未命中」片段，供界面加粗显示。大小写不敏感，按词边界匹配。 */
export function splitHighlights(text: string, words: string[]): TextPiece[] {
  const stems = [...new Set(words.map(stemOf).filter(s => s.length >= 3))].sort((a, b) => b.length - a.length);
  if (!text || !stems.length) return [{ text, hit: false }];
  const pattern = new RegExp(`\\b(?:${stems.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})[a-z]*`, 'gi');
  const pieces: TextPiece[] = [];
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > last) pieces.push({ text: text.slice(last, start), hit: false });
    pieces.push({ text: match[0], hit: true });
    last = start + match[0].length;
  }
  if (last < text.length) pieces.push({ text: text.slice(last), hit: false });
  return pieces;
}
