# CET-6 Word Companion Design Spec

## Goal
Build a mobile-first PWA for CET-6 learners that quickly explains a word with DeepSeek, records words locally, and generates same-day example sentences plus a reading using the recorded words.

## Scope
The first release supports clipboard-first lookup with manual fallback, optional context, local-only persistence in IndexedDB, DeepSeek API calls through a server-side proxy, daily word list, and generated review content. It does not include accounts, cloud sync, native apps, or spaced-repetition scheduling.

## User Flow
1. Open the PWA after copying a word; the app requests clipboard text and pre-fills the lookup field when permitted.
2. The learner edits the word or pastes/types it manually and optionally enters the sentence context.
3. The browser posts the query to the local server; the server calls DeepSeek and returns validated JSON.
4. The app renders pronunciation, part of speech, meanings, context meaning, CET-6 collocations, an example, and a memory tip, then stores the record locally.
5. The learner opens Today and asks for review generation; the server returns examples for the day’s words and a CET-6 reading with translation and vocabulary notes. The result is stored locally.

## Architecture
- React + TypeScript + Vite client, responsive mobile-first UI, installable PWA manifest and service worker.
- Node.js + Express server with `/api/word` and `/api/review` endpoints.
- DeepSeek adapter uses `https://api.deepseek.com/chat/completions`, `DEEPSEEK_API_KEY`, and configurable `DEEPSEEK_MODEL` (default `deepseek-chat`).
- IndexedDB via a small typed repository in the browser. The server does not persist learner data.
- Zod validates request payloads and model JSON before rendering.

## Data Contracts
`WordRecord`: id, word, normalizedWord, context, phonetic, partOfSpeech, meanings[], contextMeaning, collocations[], example, memoryTip, searchedAt.
`ReviewPack`: id, dateKey, wordIds[], examples[{word, sentence, translation}], reading{title, body, translation, vocabulary[]}, generatedAt.

## Reliability and Safety
- API key is read only from server environment variables and never returned to the client.
- DeepSeek output is requested as JSON and parsed defensively; malformed output returns a clear retryable error.
- Empty or oversized input is rejected before calling the model.
- Clipboard access is best effort; manual input always remains available.
- The UI displays loading, API configuration, rate-limit, and validation errors without losing existing local records.

## Acceptance Criteria
- On a phone-sized viewport, a copied word can be queried in one primary action after page load, with manual fallback.
- A successful query creates or updates a local record and appears in Today.
- Review generation uses the current day’s local records and survives page reload.
- The browser never receives the DeepSeek key.
- Tests cover request validation, DeepSeek response parsing, local repository behavior, and the main UI flow.
