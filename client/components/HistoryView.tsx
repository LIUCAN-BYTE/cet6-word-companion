import type { HistoryDay, WordRecord } from '../storage';

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

export default function HistoryView({ days, todayKey, onSelect }: { days: HistoryDay[]; todayKey: string; onSelect: (word: WordRecord) => void }) {
  const total = days.reduce((sum, day) => sum + day.words.length, 0);
  return <section className="stack">
    <div className="section-heading"><div><span className="eyebrow">LEARNING HISTORY</span><h2>历史记录</h2></div><span className="count-badge">{total} 词 · {days.length} 天</span></div>
    {days.length === 0
      ? <div className="card empty"><p>还没有任何查词记录。</p><p className="muted">每次查词都会自动记在这里，按日期归档。</p></div>
      : days.map(day => <div className="card history-day" key={day.dateKey}>
          <div className="history-head"><div><strong>{formatDateLabel(day.dateKey, todayKey)}</strong><small>{day.dateKey}</small></div><div className="history-meta"><span className="count-badge">{day.words.length} 词</span>{day.hasReview && <span className="review-badge">已生成复习</span>}</div></div>
          <div className="word-list">{day.words.map(word => <button className="word-row history-row" key={word.id} onClick={() => onSelect(word)}><span><strong>{word.word}</strong><small>{word.contextMeaning}</small></span><span className="arrow">→</span></button>)}</div>
        </div>)}
  </section>;
}
