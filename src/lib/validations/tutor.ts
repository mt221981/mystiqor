/**
 * סכמות ולידציה לצ'אט מורה אסטרולוגיה ו-ציור
 * משמשות גם את ה-API routes וגם את הטפסים בצד הלקוח
 */

import { z } from 'zod'

/**
 * סכמת ולידציה להודעת משתמש למורה
 * message: מחרוזת בין 1 ל-3000 תווים
 */
export const TutorMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'הודעה ריקה')
    .max(3000, 'הודעה ארוכה מדי'),
})

/** טיפוס מוסק מסכמת הודעת המורה */
export type TutorMessage = z.infer<typeof TutorMessageSchema>
