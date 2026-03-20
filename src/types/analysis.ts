/**
 * טיפוסי ניתוח - מגדיר את מבנה התוצאות, התובנות והמקורות של כל ניתוח
 */

/** סוגי כלי ניתוח הזמינים במערכת */
export type ToolType =
  | 'numerology'
  | 'astrology'
  | 'palmistry'
  | 'graphology'
  | 'tarot'
  | 'drawing'
  | 'dream'
  | 'career'
  | 'compatibility'
  | 'synastry'
  | 'solar_return'
  | 'transits'
  | 'human_design'
  | 'personality'
  | 'document'
  | 'question'
  | 'relationship'
  | 'synthesis';

/** סוגי תובנה - קטגוריות של מידע שהניתוח מפיק */
export type InsightType =
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

/** מקור תובנה - תיעוד מאיפה הגיעה התובנה ועל סמך מה */
export interface Provenance {
  /** תכונות מקור שהובילו לתובנה */
  source_features: string[];
  /** מזהה כלל מספר הכללים */
  rule_id?: string;
  /** תיאור הכלל שהופעל */
  rule_description?: string;
  /** מקורות ידע שבהם נעשה שימוש */
  sources: string[];
}

/** תובנה - יחידת מידע בודדת שהופקה מניתוח */
export interface Insight {
  /** כותרת התובנה */
  title: string;
  /** תוכן מפורט של התובנה */
  content: string;
  /** סוג התובנה - לסיווג וסינון */
  insight_type: InsightType;
  /** רמת ביטחון בתובנה (0-1) */
  confidence: number;
  /** משקל יחסי של התובנה בתוך הניתוח */
  weight: number;
  /** מקור התובנה - מאיפה הגיעה ועל סמך מה */
  provenance?: Provenance;
  /** תגיות לסיווג וחיפוש */
  tags: string[];
  /** נקודות חוזק שזוהו */
  strengths?: string[];
  /** אתגרים שזוהו */
  challenges?: string[];
  /** עצות מעשיות ליישום */
  actionable_advice?: string[];
  /** חיבור פסיכולוגי - הקשר לתהליכים נפשיים */
  psychological_connection?: string;
  /** חוכמה עתיקה - מקורות מסורתיים */
  ancient_wisdom?: string;
  /** ארכיטיפ - דמות מקורית מתאימה */
  archetype?: string;
}

/** תוצאת ניתוח - המבנה המלא שכל כלי ניתוח מחזיר */
export interface AnalysisResult {
  /** סיכום כללי של הניתוח */
  summary: string;
  /** רשימת תובנות שהופקו */
  insights: Insight[];
  /** ציון ביטחון כולל (0-1) */
  confidence_score: number;
  /** מטא-דאטה נוסף ספציפי לכלי */
  metadata?: Record<string, unknown>;
}
