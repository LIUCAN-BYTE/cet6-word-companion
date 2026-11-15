import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../client/App';

vi.mock('../client/api', () => ({ lookupWord: vi.fn(async (word: string) => ({ word, phonetic: '/əˈdæpt/', partOfSpeech: 'v.', meanings: ['适应'], contextMeaning: '适应', collocations: [], example: 'We adapt.', memoryTip: '记忆' })), generateReview: vi.fn(async () => ({ dateKey: '2026-11-15', examples: [], reading: { title: 'Review', body: 'text', translation: '翻译', vocabulary: [] } })) }));

describe('app flow', () => {
  it('allows manual lookup and shows the saved word', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText('单词'), 'adapt');
    await userEvent.click(screen.getAllByRole('button', { name: '查词' }).at(-1)!);
    expect((await screen.findAllByText('适应')).length).toBeGreaterThan(0);
  });
  it('offers clipboard fallback when clipboard access fails', async () => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { readText: vi.fn().mockRejectedValue(new Error('denied')) } });
    render(<App />);
    await waitFor(() => expect(screen.getByLabelText('单词')).toBeInTheDocument());
    expect(screen.getByText('剪贴板权限不可用，也可以手动输入')).toBeInTheDocument();
  });
});
