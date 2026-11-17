import type { ReviewPack, WordResult } from '../server/validation';
export type WordRecord = WordResult & { id: string; normalizedWord: string; context: string; searchedAt: string };
export type SavedReviewPack = ReviewPack & { id: string; wordIds: string[]; generatedAt: string };
export type HistoryDay = { dateKey: string; words: WordRecord[]; review: SavedReviewPack | null };
const DB_NAME = 'cet6-word-companion'; const DB_VERSION = 1; let dbPromise: Promise<IDBDatabase> | undefined;
const memoryWords = new Map<string, WordRecord>(); const memoryReviews = new Map<string, SavedReviewPack>();
export function getTodayKey(date = new Date()): string { const pad = (n: number) => String(n).padStart(2, '0'); return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`; }
// searchedAt 是 ISO 字符串（UTC），转换成本地日历日期后再取 key，避免跨时区错日。
export function getDateKeyOf(record: Pick<WordRecord, 'searchedAt'>): string { return getTodayKey(new Date(record.searchedAt)); }
const hasIndexedDb = () => typeof indexedDB !== 'undefined';
function getDb() { if (!dbPromise) dbPromise = new Promise((resolve, reject) => { const request = indexedDB.open(DB_NAME, DB_VERSION); request.onupgradeneeded = () => { const db = request.result; if (!db.objectStoreNames.contains('words')) { const words = db.createObjectStore('words', { keyPath: 'id' }); words.createIndex('normalizedWord', 'normalizedWord', { unique: true }); words.createIndex('searchedAt', 'searchedAt'); } if (!db.objectStoreNames.contains('reviews')) db.createObjectStore('reviews', { keyPath: 'id' }); }; request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); return dbPromise; }
function request<T>(store: IDBObjectStore, operation: (store: IDBObjectStore) => IDBRequest<T>) { return new Promise<T>((resolve, reject) => { const req = operation(store); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }
export async function saveWord(word: WordRecord) { if (!hasIndexedDb()) { memoryWords.set(word.normalizedWord, word); return; } const db = await getDb(); return request(db.transaction('words', 'readwrite').objectStore('words'), store => store.put(word)); }
export async function listWords() { if (!hasIndexedDb()) return [...memoryWords.values()]; const db = await getDb(); return request<WordRecord[]>(db.transaction('words', 'readonly').objectStore('words'), store => store.getAll()); }
export async function listTodayWords() { const today = getTodayKey(); return (await listWords()).filter(word => getDateKeyOf(word) === today).sort((a,b) => b.searchedAt.localeCompare(a.searchedAt)); }
export async function saveReviewPack(pack: SavedReviewPack) { if (!hasIndexedDb()) { memoryReviews.set(pack.id, pack); return; } const db = await getDb(); return request(db.transaction('reviews', 'readwrite').objectStore('reviews'), store => store.put(pack)); }
export async function getReviewPack(id: string) { if (!hasIndexedDb()) return memoryReviews.get(id); const db = await getDb(); return request<SavedReviewPack | undefined>(db.transaction('reviews', 'readonly').objectStore('reviews'), store => store.get(id)); }
export async function listReviewPacks() { if (!hasIndexedDb()) return [...memoryReviews.values()]; const db = await getDb(); return request<SavedReviewPack[]>(db.transaction('reviews', 'readonly').objectStore('reviews'), store => store.getAll()); }
/** 按本地日期分组的全部历史记录，日期从新到旧，每天内部按查词时间从新到旧，并附带当天的复习包。 */
export function groupWordsByDate(words: WordRecord[], reviews: SavedReviewPack[] = []): HistoryDay[] {
  const reviewByDate = new Map(reviews.map(pack => [pack.id, pack] as const));
  const byDate = new Map<string, WordRecord[]>();
  for (const word of words) { const key = getDateKeyOf(word); const bucket = byDate.get(key); if (bucket) bucket.push(word); else byDate.set(key, [word]); }
  // 有复习但当天单词已被删的极端情况也保留一条，避免阅读丢失。
  for (const key of reviewByDate.keys()) if (!byDate.has(key)) byDate.set(key, []);
  return [...byDate.entries()].sort(([a], [b]) => b.localeCompare(a)).map(([dateKey, items]) => ({ dateKey, words: items.sort((a, b) => b.searchedAt.localeCompare(a.searchedAt)), review: reviewByDate.get(dateKey) ?? null }));
}
export async function listHistory(): Promise<HistoryDay[]> { const [words, reviews] = await Promise.all([listWords(), listReviewPacks()]); return groupWordsByDate(words, reviews); }
export async function clearDatabase() { memoryWords.clear(); memoryReviews.clear(); if (!hasIndexedDb()) return; if (dbPromise) { (await dbPromise).close(); dbPromise = undefined; } await new Promise<void>(resolve => { const req = indexedDB.deleteDatabase(DB_NAME); req.onsuccess = () => resolve(); req.onerror = () => resolve(); req.onblocked = () => resolve(); }); }
