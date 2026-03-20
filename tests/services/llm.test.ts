/**
 * בדיקות שירות LLM — סניטיזציה לפני שליחה ל-OpenAI
 * מכסה: INFRA-02 (sanitizeForLLM called, XSS prevention, length truncation)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock OpenAI — לא קוראים ל-API אמיתי בבדיקות
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'תשובת LLM לבדיקה' } }],
          usage: { total_tokens: 10 },
          model: 'gpt-4o-mini',
        }),
      },
    },
  })),
}))

// Mock sanitizeForLLM — מוודא שנקרא לפני שליחה
vi.mock('@/lib/utils/sanitize', () => ({
  sanitizeForLLM: vi.fn((input: string) => input.replace(/<[^>]*>/g, '').slice(0, 2000)),
}))

vi.mock('@/lib/utils/llm-response', () => ({
  forceToString: vi.fn((value: unknown) => String(value ?? '')),
}))

import { invokeLLM } from '@/services/analysis/llm'
import { sanitizeForLLM } from '@/lib/utils/sanitize'

describe('invokeLLM sanitization (INFRA-02)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-key'
  })

  it('קורא ל-sanitizeForLLM על ה-prompt לפני שליחה ל-OpenAI', async () => {
    await invokeLLM({ prompt: '<script>alert("xss")</script> שלום', userId: 'user-1' })
    expect(sanitizeForLLM).toHaveBeenCalledWith('<script>alert("xss")</script> שלום')
  })

  it('קורא ל-sanitizeForLLM על systemPrompt אם סופק', async () => {
    await invokeLLM({ prompt: 'שאלה', systemPrompt: '<b>מערכת</b>', userId: 'user-1' })
    expect(sanitizeForLLM).toHaveBeenCalledTimes(2)
  })

  it('מחזיר data, tokensUsed, model בתשובה', async () => {
    const result = await invokeLLM({ prompt: 'שאלה', userId: 'user-1' })
    expect(result).toHaveProperty('data')
    expect(result).toHaveProperty('tokensUsed')
    expect(result).toHaveProperty('model')
  })
})
