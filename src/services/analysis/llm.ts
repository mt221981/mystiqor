/**
 * שירות LLM — נקודת האינטגרציה היחידה לכל קריאות OpenAI
 * כל הכלים בפאזה 2 קוראים ל-invokeLLM — לא ישירות ל-OpenAI SDK
 * חשוב: שירות זה הוא SERVER-SIDE ONLY — לא מיובא בקומפוננטות לקוח
 * OPENAI_API_KEY לא מופיע בשום קוד לקוח
 */

import OpenAI from 'openai'
import type { z } from 'zod'
import { sanitizeForLLM } from '@/lib/utils/sanitize'
import { forceToString } from '@/lib/utils/llm-response'
import type { LLMValidationError, LLMValidatedResult } from '@/types/llm'

/** בקשה ל-LLM — כולל prompt, הגדרות מודל ואפשרויות פלט */
export interface LLMRequest {
  /** הטקסט הראשי שנשלח למודל */
  prompt: string
  /** הנחיות מערכת (system message) — אופציונלי */
  systemPrompt?: string
  /** סכמת JSON לפלט מובנה — אם מסופק, המודל מחזיר JSON בלבד */
  responseSchema?: Record<string, unknown>
  /** סכמת Zod לולידציה — אם מסופקת, התשובה מאומתת אחרי פרסור */
  zodSchema?: z.ZodSchema
  /** URLs של תמונות לניתוח ויזואלי (ציור, כף יד) — מפעיל gpt-4o במקום mini */
  imageUrls?: string[]
  /** מספר טוקנים מקסימלי לתשובה — ברירת מחדל 4096 */
  maxTokens?: number
  /** מזהה המשתמש — לצורך rate limiting ולוגים */
  userId: string
}

/** תשובת LLM — גנרית על סוג הנתונים */
export interface LLMResponse<T = unknown> {
  /** הנתונים שהוחזרו — string אם אין סכמה, אובייקט מפורסר אם יש */
  data: T
  /** סך הטוקנים שנוצלו בקריאה */
  tokensUsed: number
  /** שם המודל שענה (gpt-4o-mini / gpt-4o) */
  model: string
  /** תוצאת ולידציה — קיים רק כש-zodSchema סופק בבקשה */
  validationResult?: LLMValidatedResult<T>
}

/**
 * קורא ל-OpenAI ומחזיר תשובה מטיפוס גנרי T
 * מבצע סניטיזציה של הקלט לפני שליחה — מונע prompt injection ו-XSS
 * משתמש ב-gpt-4o-mini לטקסט ו-gpt-4o לניתוח תמונות
 * אם zodSchema מסופק — מאמת את התשובה ומחזיר validationResult
 *
 * @param request - בקשת LLM עם prompt, סכמה ואופציות
 * @returns תשובה מטיפוס T עם מטא-דאטה (טוקנים, מודל, תוצאת ולידציה)
 * @throws Error עם הודעה בעברית אם הקריאה נכשלה
 */
export async function invokeLLM<T = unknown>(request: LLMRequest): Promise<LLMResponse<T>> {
  try {
    // סניטיזציה של הקלט — מונע prompt injection ו-XSS
    const safePrompt = sanitizeForLLM(request.prompt)
    const safeSystemPrompt = request.systemPrompt
      ? sanitizeForLLM(request.systemPrompt)
      : undefined

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    // בניית system message — כולל הוראת JSON אם יש סכמה
    let systemContent = safeSystemPrompt ?? 'אתה עוזר מועיל.'
    if (request.responseSchema) {
      systemContent += `\n\nענה בפורמט JSON בלבד בהתאם לסכמה: ${JSON.stringify(request.responseSchema)}`
    }

    // בניית messages — תמיכה בתמונות לניתוח ויזואלי
    type MessageParam = OpenAI.Chat.Completions.ChatCompletionMessageParam
    const messages: MessageParam[] = [
      { role: 'system', content: systemContent },
    ]

    if (request.imageUrls && request.imageUrls.length > 0) {
      // vision mode — שולחים תמונות יחד עם הטקסט
      const userContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] = [
        { type: 'text', text: safePrompt },
        ...request.imageUrls.map(
          (url): OpenAI.Chat.Completions.ChatCompletionContentPartImage => ({
            type: 'image_url',
            image_url: { url },
          })
        ),
      ]
      messages.push({ role: 'user', content: userContent })
    } else {
      messages.push({ role: 'user', content: safePrompt })
    }

    // בחירת מודל — gpt-4o לתמונות (vision), gpt-4o-mini לטקסט (חיסכון בעלות)
    const model = request.imageUrls && request.imageUrls.length > 0 ? 'gpt-4o' : 'gpt-4o-mini'

    // הגדרת response_format — JSON mode אם יש סכמה
    const responseFormat: OpenAI.Chat.Completions.ChatCompletionCreateParams['response_format'] =
      request.responseSchema ? { type: 'json_object' } : undefined

    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: request.maxTokens ?? 4096,
      ...(responseFormat ? { response_format: responseFormat } : {}),
    })

    const rawContent = completion.choices[0]?.message?.content ?? ''

    // פרסור התשובה — JSON אם יש סכמה, מחרוזת אחרת
    const data: T = request.responseSchema
      ? (JSON.parse(rawContent) as T)
      : (forceToString(rawContent) as T)

    // ולידציית Zod — אם zodSchema מסופק ויש responseSchema (JSON mode)
    let validationResult: LLMValidatedResult<T> | undefined
    if (request.zodSchema && request.responseSchema) {
      const parseResult = request.zodSchema.safeParse(data)
      if (parseResult.success) {
        validationResult = { success: true, data: parseResult.data as T }
      } else {
        const fallbackText = forceToString(data)
        const validationError: LLMValidationError = {
          type: 'llm_validation_error',
          message: 'תשובת LLM לא תואמת לסכמה המצופה',
          issues: parseResult.error.issues,
          rawResponse: data,
          fallbackText,
        }
        validationResult = { success: false, error: validationError }
        console.error('[LLM] Validation failed:', validationError.issues)
      }
    }

    return {
      data,
      tokensUsed: completion.usage?.total_tokens ?? 0,
      model: completion.model,
      ...(validationResult ? { validationResult } : {}),
    }
  } catch (error) {
    // שגיאות JSON parsing — מחזירים שגיאה ברורה
    if (error instanceof SyntaxError) {
      throw new Error('שגיאה בפרסור תשובת LLM — התשובה אינה JSON תקין')
    }
    // כל שאר השגיאות — שומרים את ההודעה המקורית
    const message = error instanceof Error ? error.message : 'שגיאה לא צפויה'
    throw new Error(`שגיאה בקריאה ל-LLM: ${message}`)
  }
}
