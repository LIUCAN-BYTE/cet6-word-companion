import type { SavedReviewPack } from '../storage';
import { splitHighlights } from '../highlight';

export function HighlightedText({ text, words, className }: { text: string; words: string[]; className?: string }) {
  return <p className={className}>{splitHighlights(text, words).map((piece, index) => piece.hit ? <strong className="hl" key={index}>{piece.text}</strong> : <span key={index}>{piece.text}</span>)}</p>;
}

/** 复习包的正文渲染：阅读 + 例句。今日复习页和历史页共用。 */
export default function ReviewContent({ pack, words }: { pack: SavedReviewPack; words: string[] }) {
  const wordCount = pack.reading.body.trim().split(/\s+/).filter(Boolean).length;
  return <>
    <div className="card reading-card"><div className="section-heading"><span className="eyebrow">READING</span><span className="muted">{wordCount} 词</span></div><h2>{pack.reading.title}</h2><HighlightedText className="reading-body" text={pack.reading.body} words={words} /><p className="translation">{pack.reading.translation}</p></div>
    {pack.examples.length > 0 && <div className="card"><h3>例句</h3>{pack.examples.map(item => <div className="example-row" key={item.word}><strong>{item.word}</strong><HighlightedText text={item.sentence} words={[item.word]} /><small>{item.translation}</small></div>)}</div>}
  </>;
}
