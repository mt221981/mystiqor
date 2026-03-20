/**
 * קבועי קטגוריות, מצבי רוח, תובנות ותגיות
 * ריכוז כל הקבועים המשמשים ברחבי האפליקציה
 * מקור: MyGoals.jsx, MoodTracker.jsx, ExplainableInsight.jsx, Compatibility.jsx
 */

// ===== ממשקי טיפוסים =====

/** מידע על קטגוריית יעד */
export interface GoalCategoryInfo {
  /** שם הקטגוריה בעברית */
  readonly label: string;
  /** אמוג'י מייצג */
  readonly icon: string;
  /** גרדיאנט צבע (Tailwind CSS classes) */
  readonly color: string;
}

/** מפתח קטגוריית יעד */
export type GoalCategoryKey =
  | 'career'
  | 'relationships'
  | 'personal_growth'
  | 'health'
  | 'spirituality'
  | 'creativity'
  | 'finance'
  | 'other';

/** מידע על סוג מצב רוח */
export interface MoodTypeInfo {
  /** ערך מזהה */
  readonly value: string;
  /** שם בעברית */
  readonly label: string;
  /** אמוג'י מייצג */
  readonly emoji: string;
  /** שם צבע (Tailwind) */
  readonly color: string;
}

/** מפתח סוג מצב רוח */
export type MoodTypeKey =
  | 'very_happy'
  | 'happy'
  | 'content'
  | 'neutral'
  | 'sad'
  | 'very_sad'
  | 'anxious'
  | 'stressed'
  | 'energized'
  | 'tired';

/** מפתח סוג תובנה */
export type InsightTypeKey =
  | 'personality'
  | 'career'
  | 'relationships'
  | 'health'
  | 'timing'
  | 'challenge'
  | 'strength'
  | 'recommendation'
  | 'spiritual'
  | 'creative';

/** מידע על סוג התאמה */
export interface CompatibilityTypeInfo {
  /** שם בעברית */
  readonly label: string;
  /** אמוג'י מייצג */
  readonly emoji: string;
}

/** מפתח סוג התאמה */
export type CompatibilityTypeKey = 'romantic' | 'business' | 'friendship' | 'family';

// ===== קבועים =====

/**
 * 8 קטגוריות יעדים עם שם בעברית, אמוג'י וצבע גרדיאנט
 * ערכים מקוריים מ-MyGoals.jsx
 */
export const GOAL_CATEGORIES: Readonly<Record<GoalCategoryKey, GoalCategoryInfo>> = {
  career: { label: 'קריירה', icon: '💼', color: 'from-blue-600 to-cyan-600' },
  relationships: { label: 'יחסים', icon: '💕', color: 'from-pink-600 to-rose-600' },
  personal_growth: { label: 'צמיחה אישית', icon: '🌱', color: 'from-green-600 to-emerald-600' },
  health: { label: 'בריאות', icon: '💪', color: 'from-red-600 to-orange-600' },
  spirituality: { label: 'רוחניות', icon: '🧘', color: 'from-purple-600 to-violet-600' },
  creativity: { label: 'יצירתיות', icon: '🎨', color: 'from-amber-600 to-yellow-600' },
  finance: { label: 'כלכלה', icon: '💰', color: 'from-green-600 to-teal-600' },
  other: { label: 'אחר', icon: '⭐', color: 'from-gray-600 to-slate-600' },
} as const;

/**
 * 10 סוגי מצבי רוח עם ערך, שם בעברית, אמוג'י וצבע
 * ערכים מקוריים מ-MoodTracker.jsx
 */
export const MOOD_TYPES: readonly MoodTypeInfo[] = [
  { value: 'very_happy', label: 'שמח מאוד', emoji: '😄', color: 'green' },
  { value: 'happy', label: 'שמח', emoji: '😊', color: 'lime' },
  { value: 'content', label: 'מרוצה', emoji: '🙂', color: 'emerald' },
  { value: 'neutral', label: 'ניטרלי', emoji: '😐', color: 'gray' },
  { value: 'sad', label: 'עצוב', emoji: '😢', color: 'blue' },
  { value: 'very_sad', label: 'עצוב מאוד', emoji: '😭', color: 'indigo' },
  { value: 'anxious', label: 'חרד', emoji: '😰', color: 'amber' },
  { value: 'stressed', label: 'לחוץ', emoji: '😫', color: 'orange' },
  { value: 'energized', label: 'אנרגטי', emoji: '⚡', color: 'yellow' },
  { value: 'tired', label: 'עייף', emoji: '😴', color: 'slate' },
] as const;

/**
 * צבעי CSS לכל סוג תובנה (Tailwind classes)
 * ערכים מקוריים מ-ExplainableInsight.jsx
 */
export const INSIGHT_TYPE_COLORS: Readonly<Record<InsightTypeKey, string>> = {
  personality: 'bg-purple-100 text-purple-800 border-purple-300',
  career: 'bg-blue-100 text-blue-800 border-blue-300',
  relationships: 'bg-pink-100 text-pink-800 border-pink-300',
  health: 'bg-red-100 text-red-800 border-red-300',
  timing: 'bg-green-100 text-green-800 border-green-300',
  challenge: 'bg-orange-100 text-orange-800 border-orange-300',
  strength: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  recommendation: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  spiritual: 'bg-violet-100 text-violet-800 border-violet-300',
  creative: 'bg-amber-100 text-amber-800 border-amber-300',
} as const;

/**
 * תרגום תגיות מאנגלית לעברית
 * ערכים מקוריים מ-ExplainableInsight.jsx
 */
export const TAG_TRANSLATIONS: Readonly<Record<string, string>> = {
  personality: 'אישיות',
  career: 'קריירה',
  relationships: 'יחסים',
  health: 'בריאות',
  timing: 'תזמון',
  challenge: 'אתגר',
  strength: 'חוזק',
  recommendation: 'המלצה',
  spiritual: 'רוחניות',
  creative: 'יצירתיות',
} as const;

/**
 * סוגי התאמה בין אנשים עם שם בעברית ואמוג'י
 * ערכים מקוריים מ-Compatibility.jsx
 */
export const COMPATIBILITY_TYPES: Readonly<Record<CompatibilityTypeKey, CompatibilityTypeInfo>> = {
  romantic: { label: 'זוגית/רומנטית', emoji: '💕' },
  business: { label: 'עסקית', emoji: '💼' },
  friendship: { label: 'חברות', emoji: '🤝' },
  family: { label: 'משפחתית', emoji: '👨‍👩‍👧' },
} as const;

// ===== פונקציות עזר =====

/**
 * מתרגם תגית מאנגלית לעברית
 * אם לא נמצא תרגום - מחזיר את התגית כמו שהיא
 */
export function getHebrewTag(tag: string): string {
  return TAG_TRANSLATIONS[tag] ?? tag;
}

/**
 * מחפש מידע על מצב רוח לפי ערך מזהה
 * מחזיר undefined אם לא נמצא
 */
export function getMoodByValue(value: string): MoodTypeInfo | undefined {
  return MOOD_TYPES.find((mood) => mood.value === value);
}

/**
 * מחזיר את קלאסי ה-CSS של סוג תובנה
 * אם לא נמצא - מחזיר ברירת מחדל אפורה
 */
export function getInsightTypeColor(type: string): string {
  return INSIGHT_TYPE_COLORS[type as InsightTypeKey] ?? 'bg-gray-100 text-gray-800 border-gray-300';
}
