import { useState } from 'react';
import type { HistoryDay, WordRecord } from '../storage';
import ReviewContent from './ReviewContent';

const WEEKDAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export function formatDateLabel(dateKey: string, todayKey: string): string {
  if (dateKey === todayKey) return '今天';
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
  if (dateKey === yesterdayKey) return '昨天';
  const sameYear = y === new Date().getFullYear();
  return `${sameYear ? '' : `${y}年`}${m}月${d}日 ${WEEKDAYS[date.getDay()]}`;
}

function WordRows({ words, onSelect }: { words: WordRecord[]; onSelect: (word: WordRecord) => void }) {
  return <div className="word-list">{words.map(word => <button className="word-row history-row" key={word.id} onClick={() => onSelect(word)}><span><strong>{word.word}</strong><small>{word.contextMeaning}</small></span><span className="arrow">→</span></button>)}</div>;
}

export default function HistoryView({ days, todayKey, onSelect }: { days: HistoryDay[]; todayKey: string; onSelect: (word: WordRecord) => void }) {
  const [openDate, setOpenDate] = useState<string | null>(null);
  const total = days.reduce((sum, day) => sum + day.words.length, 0);
  const open = openDate ? days.find(day => day.dateKey === openDate) : undefined;

  if (open) {
    const words = open.review ? open.words.filter(word => open.review!.wordIds.includes(word.id)).map(word => word.word) : [];
    return <section className="stack">
      <div className="section-heading"><div><button className="ghost back" onClick={() => setOpenDate(null)}>← 返回历史</button><h2>{formatDateLabel(open.dateKey, todayKey)}</h2><p className="muted">{open.dateKey} · {open.words.length} 词</p></div></div>
      {open.review ? <ReviewContent pack={open.review} words={words.length ? words : open.review.examples.map(item => item.word)} /> : <div className="card empty"><p>这一天没有生成复习阅读。</p></div>}
      {open.words.length > 0 && <div className="card history-day"><h3>当天查过的词</h3><WordRows words={open.words} onSelect={onSelect} /></div>}
    </section>;
  }

  return <section className="stack">
    <div className="section-heading"><div><span className="eyebrow">LEARNING HISTORY</span><h2>历史记录</h2></div><span className="count-badge">{total} 词 · {days.length} 天</span></div>
    {days.length === 0
      ? <div className="card empty"><p>还没有任何查词记录。</p><p className="muted">每次查词都会自动记在这里，按日期归档。</p></div>
      : days.map(day => <div className="card history-day" key={day.dateKey}>
          <div className="history-head"><div><strong>{formatDateLabel(day.dateKey, todayKey)}</strong><small>{day.dateKey}</small></div><div className="history-meta"><span className="count-badge">{day.words.length} 词</span>{day.review && <button className="review-badge" onClick={() => setOpenDate(day.dateKey)}>查看复习阅读 →</button>}</div></div>
          <WordRows words={day.words} onSelect={onSelect} />
        </div>)}
  </section>;
}
