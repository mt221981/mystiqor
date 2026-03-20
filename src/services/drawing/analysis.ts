/**
 * שירות ניתוח ציורים — HTP (House-Tree-Person)
 * בונה פרומפט לניתוח ציורים על פי מדדי Machover ו-Koppitz
 * בשלב 2 יתווסף ניתוח ראייה (Vision API) לחילוץ תכונות אוטומטי
 */

// ===== ממשקי טיפוסים =====

/**
 * תכונות שנחלצות מציור HTP (House-Tree-Person)
 * כל תכונה משפיעה על הפרשנות הפסיכולוגית
 */
export interface DrawingFeatures {
  /** עוצמת לחץ הקו — מאפיין אנרגיה פנימית */
  stroke_pressure: 'light' | 'medium' | 'heavy';
  /** איכות הקו — מאפיין שליטה רגשית */
  line_quality: 'smooth' | 'jagged' | 'trembling';
  /** שימוש בחלל הדף — מאפיין ניצול הסביבה */
  space_usage: 'left' | 'center' | 'right' | 'full';
  /** גודל הדמות — מאפיין הערכה עצמית */
  figure_size: 'small' | 'medium' | 'large';
  /** קיום קו קרקע — מאפיין יציבות */
  ground_line: boolean;
  /** פירוט גג הבית — מאפיין שאיפות ופנטזיות */
  roof_detail: boolean;
  /** מספר חלונות — מאפיין קשר עם העולם */
  window_count: number;
  /** מיקום הדלת — מאפיין נגישות רגשית */
  door_placement: 'center' | 'side' | 'absent';
  /** כותרת העץ — מאפיין יחסים חברתיים */
  tree_crown: 'round' | 'pointed' | 'absent';
  /** ידיים של הדמות — מאפיין תקשורת והשפעה */
  person_arms: 'raised' | 'down' | 'absent';
}

// ===== קבועים =====

/**
 * ערכי ברירת מחדל לתכונות הציור
 * משמשים כאשר ניתוח ראייה אינו זמין
 */
const DEFAULT_DRAWING_FEATURES: DrawingFeatures = {
  stroke_pressure: 'medium',
  line_quality: 'smooth',
  space_usage: 'center',
  figure_size: 'medium',
  ground_line: true,
  roof_detail: false,
  window_count: 2,
  door_placement: 'center',
  tree_crown: 'round',
  person_arms: 'down',
};

// ===== פונקציות עזר פנימיות =====

/**
 * מתרגם ערך stroke_pressure לתיאור עברי עבור הפרומפט
 */
function describePressure(pressure: DrawingFeatures['stroke_pressure']): string {
  const descriptions: Record<DrawingFeatures['stroke_pressure'], string> = {
    light: 'קו עדין ורך — אנרגיה נמוכה או רגישות גבוהה',
    medium: 'קו בינוני — אנרגיה מאוזנת',
    heavy: 'קו כבד ועוצמתי — אנרגיה גבוהה או חרדה',
  };
  return descriptions[pressure];
}

/**
 * מתרגם ערך line_quality לתיאור עברי עבור הפרומפט
 */
function describeLineQuality(quality: DrawingFeatures['line_quality']): string {
  const descriptions: Record<DrawingFeatures['line_quality'], string> = {
    smooth: 'קווים חלקים — שליטה ויציבות',
    jagged: 'קווים שבורים — חרדה או ספונטניות',
    trembling: 'קווים רועדים — חוסר ביטחון או בעיות פיזיות',
  };
  return descriptions[quality];
}

/**
 * בונה בלוק תיאור תכונות הציור עבור הפרומפט
 * ממיר את הנתונים הגולמיים לתיאורים פסיכולוגיים
 */
function buildFeaturesDescription(features: Partial<DrawingFeatures>): string {
  const merged: DrawingFeatures = { ...DEFAULT_DRAWING_FEATURES, ...features };
  const lines: string[] = [];

  lines.push(`- לחץ קו: ${describePressure(merged.stroke_pressure)}`);
  lines.push(`- איכות קו: ${describeLineQuality(merged.line_quality)}`);
  lines.push(
    `- שימוש בחלל: ${merged.space_usage} — ` +
    (merged.space_usage === 'left' ? 'נטייה לעבר העבר' :
     merged.space_usage === 'right' ? 'נטייה לעבר העתיד' :
     merged.space_usage === 'full' ? 'שימוש מלא בחלל' : 'מרכזי ומאוזן')
  );
  lines.push(
    `- גודל ציור: ${merged.figure_size} — ` +
    (merged.figure_size === 'small' ? 'הערכה עצמית נמוכה' :
     merged.figure_size === 'large' ? 'ביטחון עצמי גבוה' : 'הערכה עצמית נורמלית')
  );
  lines.push(`- קו קרקע: ${merged.ground_line ? 'קיים — יציבות ושורשים' : 'חסר — חוסר יציבות'}`);
  lines.push(`- פירוט גג: ${merged.roof_detail ? 'מפורט — פנטזיות ושאיפות' : 'פשוט'}`);
  lines.push(`- חלונות: ${merged.window_count} — ${merged.window_count === 0 ? 'בידוד' : merged.window_count >= 4 ? 'פתיחות יתר' : 'נגישות נורמלית'}`);
  lines.push(
    `- דלת: ${merged.door_placement} — ` +
    (merged.door_placement === 'center' ? 'נגישות רגשית ישירה' :
     merged.door_placement === 'side' ? 'גישה לא ישירה, ביישנות' : 'חסר — בידוד')
  );
  lines.push(
    `- כותרת עץ: ${merged.tree_crown} — ` +
    (merged.tree_crown === 'round' ? 'יחסים חברתיים מאוזנים' :
     merged.tree_crown === 'pointed' ? 'יחסים מאתגרים' : 'ניתוק חברתי')
  );
  lines.push(
    `- ידיים: ${merged.person_arms} — ` +
    (merged.person_arms === 'raised' ? 'פתיחות ורצון בקשר' :
     merged.person_arms === 'down' ? 'יחס פסיבי לסביבה' : 'קושי בתקשורת')
  );

  return lines.join('\n');
}

// ===== פונקציות ציבוריות =====

/**
 * בונה פרומפט לניתוח ציור HTP (House-Tree-Person)
 * מבוסס על מדדי Machover (1949) ו-Koppitz (1968)
 *
 * @param imageDescription - תיאור טקסטואלי של הציור (מה מצויר)
 * @param features - תכונות שנחלצו מהציור (חלקי — ימלא ברירות מחדל)
 * @returns מחרוזת פרומפט עברית לשליחה ל-LLM
 */
export function buildDrawingAnalysisPrompt(
  imageDescription: string,
  features: Partial<DrawingFeatures>
): string {
  const featuresDescription = buildFeaturesDescription(features);

  return `אתה פסיכולוג קליני מומחה בניתוח ציורים פרוייקטיביים.
יש לך ידע מעמיק בטכניקת House-Tree-Person (HTP) על פי John Buck ו-Emanuel Hammer,
ובמדדים פסיכולוגיים של Karen Machover ו-Elizabeth Koppitz.
אתה כותב בעברית, בגישה פסיכולוגית חמלה ומכבדת.

## תיאור הציור:
${imageDescription}

## תכונות מזוהות:
${featuresDescription}

---

## הנחיות ניתוח:

**מדדי Koppitz (ניתוח כמותי):**
נתח נוכחות/היעדרות של 30 מדדי Koppitz בציור.
כלול: עיגול ראש, עיניים, אף, פה, גוף, ידיים, רגליים, אצבעות.
מדדים חיוביים (נורמליים לגיל): רשום ✓
מדדים שליליים (סימני חרדה/עיכוב): רשום ✗

**סימני Machover (ניתוח איכותי):**
- מיקום הדמות בדף: משמעות פסיכולוגית
- גודל הדמות: הערכה עצמית
- פרטי הפנים: ביטוי רגשי
- חלקי גוף בולטים/חסרים: נקודות מתח
- לחץ קו ואיכות: אנרגיה רגשית

**פרשנות HTP:**
1. הבית: ייצוג הבית הפנימי, המשפחה, תחושת הביטחון
2. העץ: ייצוג העצמי הפנימי, הצמיחה הפסיכולוגית, יחסים
3. האדם: ייצוג האני המודע, הגוף העצמי, זהות

---

החזר תשובה בפורמט JSON:
{
  "koppitz_indicators": [
    {
      "indicator": "שם המדד",
      "present": true,
      "significance": "משמעות פסיכולוגית"
    }
  ],
  "machover_signs": [
    {
      "sign": "שם הסימן",
      "observation": "מה נצפה",
      "interpretation": "פרשנות פסיכולוגית"
    }
  ],
  "interpretation": "פרשנות כוללת של הציור (4-5 משפטים)",
  "emotional_indicators": [
    {
      "category": "anxiety|self_esteem|relationships|trauma|development",
      "level": "high|medium|low",
      "evidence": "מה בציור תומך בממצא זה"
    }
  ],
  "recommendations": [
    "המלצה מעשית 1",
    "המלצה מעשית 2"
  ],
  "overall_assessment": "הערכה כוללת — תקין|סימנים קלים|דורש מעקב|פנייה מקצועית מומלצת"
}`;
}

/**
 * חילוץ תכונות ציור מכתובת תמונה
 * PLACEHOLDER — יימומש בשלב 2 עם Vision API
 * כרגע מחזיר ערכי ברירת מחדל עם אזהרה ב-console
 *
 * @param imageUrl - כתובת URL של תמונת הציור
 * @returns תכונות ציור בסיסיות (ברירת מחדל)
 */
export async function extractDrawingFeatures(imageUrl: string): Promise<DrawingFeatures> {
  // TODO Phase 2: לממש ניתוח ראייה עם OpenAI Vision API
  // כרגע מחזיר ברירת מחדל עם אזהרה
  void imageUrl; // שימוש מינימלי למניעת שגיאת TypeScript

  // eslint-disable-next-line no-console
  console.warn('extractDrawingFeatures: תכונות ברירת מחדל — נדרש ניתוח ראייה');

  return { ...DEFAULT_DRAWING_FEATURES };
}
