/**
 * קבועי סוגי פעילות לכלי התזמון — ניתן לייבא בקוד לקוח
 * מופרד מ-services/astrology/timing.ts שמייבא astronomy-engine (server-side בלבד)
 */

/** 8 סוגי פעילות נתמכים בכלי התזמון */
export const ACTIVITY_TYPES = [
  'relationship_start',
  'business_launch',
  'travel',
  'health_procedure',
  'creative_project',
  'financial_decision',
  'spiritual_practice',
  'important_meeting',
] as const

/** טיפוס סוג פעילות */
export type ActivityType = typeof ACTIVITY_TYPES[number]

/** תוויות עבריות לסוגי פעילות */
export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  relationship_start: 'תחילת קשר',
  business_launch: 'השקת עסק',
  travel: 'נסיעה',
  health_procedure: 'הליך רפואי',
  creative_project: 'פרויקט יצירתי',
  financial_decision: 'החלטה פיננסית',
  spiritual_practice: 'עבודה רוחנית',
  important_meeting: 'פגישה חשובה',
}
