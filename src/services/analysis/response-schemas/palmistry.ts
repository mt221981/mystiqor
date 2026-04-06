/**
 * סכמת Zod לתשובת LLM — קריאה בכף יד (כירומנטיה)
 * מינימלית: מוודאת שהתשובה היא מחרוזת לא ריקה.
 * Vision mode (gpt-4o) עובד עם JSON mode — הפרשנות עטופה באובייקט.
 */
import { z } from 'zod'

/** סכמת תשובת ניתוח כף יד */
export const PalmistryResponseSchema = z.object({
  /** פרשנות כירומנטית מלאה — לפחות 10 תווים */
  interpretation: z.string().min(10, 'תגובת AI קצרה מדי'),
})

export type PalmistryResponse = z.infer<typeof PalmistryResponseSchema>
