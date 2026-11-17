import { Router } from 'express';
import { callDeepSeek } from './deepseek';
import { describeValidationError, parseModelJson, reviewPackSchema, reviewRequestSchema, wordRequestSchema, wordResultSchema } from './validation';

export const router = Router();
router.get('/health', (_req, res) => res.json({ ok: true, configured: Boolean(process.env.DEEPSEEK_API_KEY) }));
router.post('/word', async (req, res) => {
  try {
    const input = wordRequestSchema.parse(req.body);
    const content = await callDeepSeek([
      { role: 'system', content: '你是 CET-6 英语词汇老师。只返回一个 JSON 对象，不要 Markdown。字段必须为 word, phonetic, partOfSpeech, meanings, contextMeaning, collocations, example, memoryTip。其中 meanings 和 collocations 必须是纯字符串数组，例如 ["adj. 有韧性的", "adj. 恢复快的"]，不要在数组里放对象；其余字段都是字符串。' },
      { role: 'user', content: JSON.stringify({ task: '解释单词并结合上下文', ...input }) }
    ]);
    res.json(wordResultSchema.parse(parseModelJson(content)));
  } catch (error) { res.status(400).json({ error: describeValidationError(error, '查词失败') }); }
});
router.post('/review', async (req, res) => {
  try {
    const input = reviewRequestSchema.parse(req.body);
    const content = await callDeepSeek([
      { role: 'system', content: '你是 CET-6 阅读老师。只返回一个 JSON 对象，不要 Markdown。生成例句和一篇自然的六级难度短文。短文 reading.body 严格控制在 110 到 130 个英文单词之间，只写一个段落，必须自然地用到每一个给定单词（允许变形），纯文本，不要 Markdown、不要加粗、不要换行。字段必须为 dateKey, examples, reading；examples 是对象数组，每项包含 word, sentence, translation 三个字符串；reading 必须包含 title, body, translation, vocabulary；vocabulary 必须是对象数组，每项包含 word 和 note 两个字符串，若没有特别说明也要填写空字符串。' },
      { role: 'user', content: JSON.stringify({ task: '覆盖所有单词并生成当天复习材料', ...input }) }
    ]);
    res.json(reviewPackSchema.parse(parseModelJson(content)));
  } catch (error) { res.status(400).json({ error: describeValidationError(error, '生成复习失败') }); }
});
