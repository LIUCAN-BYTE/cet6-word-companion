import type { SavedReviewPack, WordRecord } from '../storage';
import ReviewContent from './ReviewContent';

/** 自上次生成复习之后新查的词。 */
export function findNewWords(today: WordRecord[], pack: SavedReviewPack | null): WordRecord[] {
  if (!pack) return today;
  const covered = new Set(pack.wordIds);
  return today.filter(word => !covered.has(word.id));
}

export default function ReviewPackView({ pack, today, loading, onGenerate }: { pack: SavedReviewPack | null; today: WordRecord[]; loading: boolean; onGenerate: () => void }) {
  const hasWords = today.length > 0;
  if (!pack) return <section className="stack"><div className="card review-intro"><span className="eyebrow">DAILY REVIEW</span><h2>把今天查过的词串起来</h2><p>生成每词例句和一篇约 120 词、包含今日词汇的六级短文，帮助你从“见过”走向“会用”。</p><button onClick={onGenerate} disabled={!hasWords || loading}>{loading ? '生成中…' : hasWords ? '生成今日复习' : '先查几个单词'}</button></div></section>;
  const fresh = findNewWords(today, pack);
  const words = today.filter(word => pack.wordIds.includes(word.id)).map(word => word.word);
  return <section className="stack">
    {fresh.length > 0
      ? <div className="card regen-banner"><div><strong>自上次生成后新查了 {fresh.length} 个词</strong><small>{fresh.map(word => word.word).join('、')}</small></div><button onClick={onGenerate} disabled={loading}>{loading ? '生成中…' : '重新生成今日复习'}</button></div>
      : <div className="regen-row"><span className="muted">已覆盖今天全部 {pack.wordIds.length} 个词</span><button className="ghost" onClick={onGenerate} disabled={loading}>{loading ? '生成中…' : '重新生成'}</button></div>}
    <ReviewContent pack={pack} words={words.length ? words : pack.examples.map(item => item.word)} />
  </section>;
}
