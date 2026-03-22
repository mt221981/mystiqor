/**
 * סוגי LLM — טיפוסים לשירות ה-LLM ולטיפול בשגיאות ולידציה
 */
import type { z } from 'zod'

/** שגיאת ולידציה של תשובת LLM — מוחזרת כערך, לא נזרקת */
export interface LLMValidationError {
  /** סוג השגיאה — תמיד 'llm_validation_error' */
  type: 'llm_validation_error'
  /** הודעת שגיאה מתארת */
  message: string
  /** בעיות הולידציה מ-Zod */
  issues: z.ZodIssue[]
  /** התשובה הגולמית מהמודל — לצורך דיבוג */
  rawResponse: unknown
  /** טקסט fallback שחולץ מהתשובה הגולמית */
  fallbackText: string
}

/** תוצאת ולידציה — הצלחה עם data מפורסר, או כישלון עם LLMValidationError */
export type LLMValidatedResult<T> =
  | { success: true; data: T }
  | { success: false; error: LLMValidationError }

/** בקשה ל-LLM עם אפשרות לסכמת Zod */
export interface LLMRequestWithZod {
  prompt: string
  systemPrompt?: string
  /** סכמת JSON כפי שנשלחת למודל (כדי שידע מה הפורמט הרצוי) */
  responseSchema?: Record<string, unknown>
  /** סכמת Zod לולידציה של התשובה — אם לא מסופקת, התשובה מוחזרת as-is */
  zodSchema?: z.ZodSchema
  imageUrls?: string[]
  maxTokens?: number
  userId: string
}
