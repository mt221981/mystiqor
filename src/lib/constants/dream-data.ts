/**
 * מילון רגשות חלומות — 10+ רגשות עם אימוג'ים ותיאורים בעברית
 * חולץ ממערכת BASE44 המקורית
 */

/** רגש בחלום */
export interface DreamEmotion {
  readonly value: string;
  readonly label: string;
  readonly emoji: string;
  readonly description: string;
}

/** 12 רגשות חלומות עם אימוג'ים ותיאורים */
export const DREAM_EMOTIONS: readonly DreamEmotion[] = [
  { value: 'fear', label: 'פחד', emoji: '😨', description: 'תחושת איום או סכנה — לעתים מצביע על חרדות לא מעובדות או על צורך בהגנה' },
  { value: 'joy', label: 'שמחה', emoji: '😊', description: 'תחושת אושר ומילוי — יכול להצביע על סיפוק פנימי או על משאלת לב מתגשמת' },
  { value: 'sadness', label: 'עצב', emoji: '😢', description: 'כאב רגשי או אובדן — לעתים מייצג תהליך עיבוד של אבל או ויתור על משהו' },
  { value: 'anger', label: 'כעס', emoji: '😠', description: 'תסכול או זעם — יכול לשקף גבולות שנפרצו או עוול שלא טופל בהקיץ' },
  { value: 'confusion', label: 'בלבול', emoji: '😕', description: 'חוסר בהירות — לעתים מצביע על צומת החלטות או על מצב מורכב שדורש הבנה' },
  { value: 'peace', label: 'שלווה', emoji: '😌', description: 'רוגע עמוק ושלום פנימי — יכול להעיד על השלמה, קבלה או חיבור רוחני' },
  { value: 'anxiety', label: 'חרדה', emoji: '😰', description: 'מתח ודאגה — לעתים משקף לחצים ביומיום או פחדים מהעתיד' },
  { value: 'excitement', label: 'התרגשות', emoji: '🤩', description: 'ציפייה נלהבת — יכול להצביע על שינוי חיובי מתקרב או על רצון לחוויות חדשות' },
  { value: 'love', label: 'אהבה', emoji: '❤️', description: 'חום ורגש עמוק — מייצג קשר, געגוע, או צורך בקרבה ובהשתייכות' },
  { value: 'curiosity', label: 'סקרנות', emoji: '🤔', description: 'רצון לגלות ולחקור — לעתים מצביע על הזדמנויות חדשות או על חלקים לא מוכרים בנפש' },
  { value: 'nostalgia', label: 'נוסטלגיה', emoji: '🥹', description: 'געגוע לעבר — יכול להצביע על רצון לחזור לתקופה מאושרת או על שיעורי חיים שלא נלמדו' },
  { value: 'wonder', label: 'פליאה', emoji: '✨', description: 'תדהמה מול הנעלם — מייצג קשר לממד הרוחני, פתיחות לנסים ותחושת קדושה' },
] as const;
