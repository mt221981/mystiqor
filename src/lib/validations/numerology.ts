/**
 * סכמות ולידציה Zod לנומרולוגיה
 * מדוע: ולידציה מרכזית לשימוש ב-API routes ובטפסים
 */

import { z } from 'zod'

/** פרטי אדם לחישוב נומרולוגיה */
const PersonSchema = z.object({
  /** שם מלא */
  fullName: z.string().min(1, 'שם מלא חובה').max(100, 'שם ארוך מדי'),
  /** תאריך לידה בפורמט YYYY-MM-DD */
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
})

/**
 * סכמת ולידציה לחישוב תאימות נומרולוגית בין שני אנשים
 */
export const NumerologyCompatibilitySchema = z.object({
  /** האדם הראשון */
  person1: PersonSchema,
  /** האדם השני */
  person2: PersonSchema,
})

/** טיפוס TypeScript של קלט תאימות נומרולוגית */
export type NumerologyCompatibilityInput = z.infer<typeof NumerologyCompatibilitySchema>
