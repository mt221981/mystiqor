/**
 * מטא-דאטה עשירה לקלפי טארוט — ארכיטיפים, קבלה, אסטרולוגיה, אלמנטים
 * חולץ ממערכת BASE44 המקורית — 78 קלפים מלאים
 */

/** מטא-דאטה עשירה לקלף טארוט */
export interface TarotCardMeta {
  readonly cardNumber: number;
  readonly element: string;
  readonly astrology: string;
  readonly kabbalah?: string;
  readonly archetype: string;
  readonly uprightKeywords: readonly string[];
  readonly reversedKeywords: readonly string[];
}

/** מטא-דאטה לכל 78 קלפי הטארוט — ממופה לפי card_number */
export const TAROT_CARD_META: Record<number, TarotCardMeta> = {
  0: { cardNumber: 0, element: 'air', astrology: 'Uranus', kabbalah: 'Aleph', archetype: 'התמים', uprightKeywords: ['התחלות', 'תמימות', 'ספונטניות', 'רוח חופשית'], reversedKeywords: ['פזיזות', 'סיכון', 'טיפשות'] },
  1: { cardNumber: 1, element: 'air', astrology: 'Mercury', kabbalah: 'Beth', archetype: 'היוצר', uprightKeywords: ['ביטוי', 'כוח', 'פעולה', 'ריכוז'], reversedKeywords: ['מניפולציה', 'תכנון גרוע', 'פוטנציאל לא ממומש'] },
  2: { cardNumber: 2, element: 'water', astrology: 'Moon', kabbalah: 'Gimel', archetype: 'המיסטיקנית', uprightKeywords: ['אינטואיציה', 'ידע קדוש', 'תת-מודע'], reversedKeywords: ['סודות', 'נסיגה', 'שתיקה'] },
  3: { cardNumber: 3, element: 'earth', astrology: 'Venus', kabbalah: 'Daleth', archetype: 'האם', uprightKeywords: ['נשיות', 'יופי', 'טבע', 'שפע'], reversedKeywords: ['תלות', 'חנק', 'חסימה יצירתית'] },
  4: { cardNumber: 4, element: 'fire', astrology: 'Aries', kabbalah: 'Heh', archetype: 'האב', uprightKeywords: ['סמכות', 'מבנה', 'שליטה', 'אבהות'], reversedKeywords: ['שליטה', 'נוקשות', 'חוסר גמישות'] },
  5: { cardNumber: 5, element: 'earth', astrology: 'Taurus', kabbalah: 'Vav', archetype: 'המורה', uprightKeywords: ['מסורת', 'קונפורמיות', 'מוסר', 'אתיקה'], reversedKeywords: ['מרד', 'חתרנות', 'גישות חדשות'] },
  6: { cardNumber: 6, element: 'air', astrology: 'Gemini', kabbalah: 'Zayin', archetype: 'האוהב', uprightKeywords: ['אהבה', 'הרמוניה', 'יחסים', 'ערכים'], reversedKeywords: ['דיסהרמוניה', 'חוסר איזון', 'חוסר התאמה'] },
  7: { cardNumber: 7, element: 'water', astrology: 'Cancer', kabbalah: 'Cheth', archetype: 'הלוחם', uprightKeywords: ['שליטה', 'כוח רצון', 'הצלחה', 'נחישות'], reversedKeywords: ['חוסר שליטה', 'חוסר כיוון', 'תוקפנות'] },
  8: { cardNumber: 8, element: 'fire', astrology: 'Leo', kabbalah: 'Teth', archetype: 'הגיבור', uprightKeywords: ['כוח', 'אומץ', 'סבלנות', 'חמלה'], reversedKeywords: ['חולשה', 'ספק עצמי', 'חוסר משמעת עצמית'] },
  9: { cardNumber: 9, element: 'earth', astrology: 'Virgo', kabbalah: 'Yod', archetype: 'החכם', uprightKeywords: ['חיפוש נפש', 'התבוננות פנימית', 'הדרכה פנימית'], reversedKeywords: ['בידוד', 'בדידות', 'נסיגה'] },
  10: { cardNumber: 10, element: 'fire', astrology: 'Jupiter', kabbalah: 'Kaph', archetype: 'הפטליסט', uprightKeywords: ['שינוי', 'מחזורים', 'גורל', 'מזל'], reversedKeywords: ['מזל רע', 'התנגדות לשינוי', 'שבירת מחזורים'] },
  11: { cardNumber: 11, element: 'air', astrology: 'Libra', kabbalah: 'Lamed', archetype: 'השופט', uprightKeywords: ['צדק', 'הגינות', 'אמת', 'חוק'], reversedKeywords: ['חוסר הגינות', 'חוסר אחריות', 'אי-יושר'] },
  12: { cardNumber: 12, element: 'water', astrology: 'Neptune', kabbalah: 'Mem', archetype: 'הקדוש מרצון', uprightKeywords: ['עצירה', 'כניעה', 'שחרור', 'נקודת מבט חדשה'], reversedKeywords: ['עיכובים', 'התנגדות', 'עמידה במקום'] },
  13: { cardNumber: 13, element: 'water', astrology: 'Scorpio', kabbalah: 'Nun', archetype: 'הטרנספורמר', uprightKeywords: ['סיומים', 'שינוי', 'טרנספורמציה', 'מעבר'], reversedKeywords: ['התנגדות לשינוי', 'טרנספורמציה אישית', 'טיהור פנימי'] },
  14: { cardNumber: 14, element: 'fire', astrology: 'Sagittarius', kabbalah: 'Samekh', archetype: 'המרפא', uprightKeywords: ['איזון', 'מתינות', 'סבלנות', 'מטרה'], reversedKeywords: ['חוסר איזון', 'עודף', 'ריפוי עצמי'] },
  15: { cardNumber: 15, element: 'earth', astrology: 'Capricorn', kabbalah: 'Ayin', archetype: 'הצל', uprightKeywords: ['כבלים', 'התמכרות', 'מיניות', 'חומריות'], reversedKeywords: ['שחרור', 'חופש', 'ניתוק'] },
  16: { cardNumber: 16, element: 'fire', astrology: 'Mars', kabbalah: 'Peh', archetype: 'המהפכן', uprightKeywords: ['שינוי פתאומי', 'מהפך', 'כאוס', 'גילוי'], reversedKeywords: ['טרנספורמציה אישית', 'פחד משינוי', 'מניעת אסון'] },
  17: { cardNumber: 17, element: 'air', astrology: 'Aquarius', kabbalah: 'Tzaddi', archetype: 'החזיונאי', uprightKeywords: ['תקווה', 'אמונה', 'מטרה', 'חידוש'], reversedKeywords: ['חוסר אמונה', 'ייאוש', 'ניתוק'] },
  18: { cardNumber: 18, element: 'water', astrology: 'Pisces', kabbalah: 'Qoph', archetype: 'החולם', uprightKeywords: ['אשליה', 'פחד', 'חרדה', 'תת-מודע'], reversedKeywords: ['שחרור פחדים', 'בלבול פנימי', 'רגש מודחק'] },
  19: { cardNumber: 19, element: 'fire', astrology: 'Sun', kabbalah: 'Resh', archetype: 'הילד', uprightKeywords: ['חיוביות', 'כיף', 'חום', 'הצלחה'], reversedKeywords: ['ילד פנימי', 'אופטימיות יתר', 'עצב'] },
  20: { cardNumber: 20, element: 'fire', astrology: 'Pluto', kabbalah: 'Shin', archetype: 'המתעורר', uprightKeywords: ['שיפוט', 'לידה מחדש', 'קריאה פנימית', 'סליחה'], reversedKeywords: ['ספק עצמי', 'מבקר פנימי', 'התעלמות מהקריאה'] },
  21: { cardNumber: 21, element: 'earth', astrology: 'Saturn', kabbalah: 'Tav', archetype: 'השלם', uprightKeywords: ['השלמה', 'אינטגרציה', 'הישג', 'נסיעות'], reversedKeywords: ['חיפוש אחר סגירה', 'עיכובים', 'לא שלם'] },
  22: { cardNumber: 22, element: 'fire', astrology: 'Fire signs', kabbalah: undefined, archetype: 'השראה', uprightKeywords: ['השראה', 'הזדמנויות חדשות', 'צמיחה', 'פוטנציאל'], reversedKeywords: ['חוסר כיוון', 'הסחות דעת', 'עיכובים'] },
  23: { cardNumber: 23, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'שניים במטות', uprightKeywords: ['תכנון', 'החלטות', 'התקדמות', 'גילוי'], reversedKeywords: ['פחד מהלא נודע', 'חוסר תכנון', 'החלטות גרועות'] },
  24: { cardNumber: 24, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'שלושה במטות', uprightKeywords: ['התרחבות', 'צפייה קדימה', 'מעבר לים', 'מנהיגות'], reversedKeywords: ['מכשולים', 'עיכובים', 'תסכול'] },
  25: { cardNumber: 25, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'ארבעה במטות', uprightKeywords: ['חגיגה', 'שמחה', 'הרמוניה', 'חזרה הביתה'], reversedKeywords: ['חוסר הרמוניה', 'מעבר', 'קונפליקט'] },
  26: { cardNumber: 26, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'חמישה במטות', uprightKeywords: ['קונפליקט', 'תחרות', 'מתח', 'גיוון'], reversedKeywords: ['עימות פנימי', 'הימנעות מקונפליקט', 'שחרור'] },
  27: { cardNumber: 27, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'שישה במטות', uprightKeywords: ['הצלחה', 'הכרה ציבורית', 'התקדמות', 'ביטחון עצמי'], reversedKeywords: ['אגואיזם', 'חוסר הכרה', 'עונש'] },
  28: { cardNumber: 28, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'שבעה במטות', uprightKeywords: ['אתגר', 'תחרות', 'התמדה'], reversedKeywords: ['תשישות', 'ויתור', 'הצפה'] },
  29: { cardNumber: 29, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'שמונה במטות', uprightKeywords: ['תנועה', 'מהירות', 'התקדמות', 'פעולה'], reversedKeywords: ['עיכובים', 'תסכול', 'התנגדות לשינוי'] },
  30: { cardNumber: 30, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'תשעה במטות', uprightKeywords: ['חוסן', 'התמדה', 'מבחן', 'גבולות'], reversedKeywords: ['פרנויה', 'הגנתיות', 'סירוב לעזרה'] },
  31: { cardNumber: 31, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'עשרה במטות', uprightKeywords: ['עומס', 'אחריות', 'עבודה קשה', 'לחץ'], reversedKeywords: ['שחרור', 'ויתור', 'האצלה'] },
  32: { cardNumber: 32, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'נסיך מטות', uprightKeywords: ['השראה', 'רעיונות', 'גילוי', 'התלהבות'], reversedKeywords: ['חוסר כיוון', 'דחיינות', 'חסימות יצירתיות'] },
  33: { cardNumber: 33, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'אביר מטות', uprightKeywords: ['פעולה', 'הרפתקה', 'חוסר פחד', 'אנרגיה'], reversedKeywords: ['פזיזות', 'חיפזון', 'תסכול'] },
  34: { cardNumber: 34, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'מלכת מטות', uprightKeywords: ['אומץ', 'נחישות', 'עצמאות', 'חברתי'], reversedKeywords: ['אנוכיות', 'קנאה', 'חוסר ביטחון'] },
  35: { cardNumber: 35, element: 'fire', astrology: '', kabbalah: undefined, archetype: 'מלך מטות', uprightKeywords: ['מנהיגות', 'חזון', 'יזמות', 'כבוד'], reversedKeywords: ['אימפולסיביות', 'אכזריות', 'ציפיות גבוהות'] },
  36: { cardNumber: 36, element: 'water', astrology: '', kabbalah: undefined, archetype: 'אס גביעים', uprightKeywords: ['אהבה', 'יחסים חדשים', 'חמלה', 'יצירתיות'], reversedKeywords: ['אובדן רגשי', 'יצירתיות חסומה', 'ריקנות'] },
  37: { cardNumber: 37, element: 'water', astrology: '', kabbalah: undefined, archetype: 'שניים בגביעים', uprightKeywords: ['אחדות', 'שותפות', 'קשר', 'משיכה'], reversedKeywords: ['חוסר איזון', 'תקשורת שבורה', 'מתח'] },
  38: { cardNumber: 38, element: 'water', astrology: '', kabbalah: undefined, archetype: 'שלושה בגביעים', uprightKeywords: ['חברות', 'קהילה', 'אושר', 'חגיגה'], reversedKeywords: ['הגזמה', 'רכילות', 'בידוד'] },
  39: { cardNumber: 39, element: 'water', astrology: '', kabbalah: undefined, archetype: 'ארבעה בגביעים', uprightKeywords: ['מדיטציה', 'התבוננות', 'אפתיה', 'הערכה מחדש'], reversedKeywords: ['נסיגה', 'נסיגה', 'בדיקה'] },
  40: { cardNumber: 40, element: 'water', astrology: '', kabbalah: undefined, archetype: 'חמישה בגביעים', uprightKeywords: ['אובדן', 'צער', 'אכזבה', 'חרטה'], reversedKeywords: ['קבלה', 'המשך הלאה', 'מציאת שלום'] },
  41: { cardNumber: 41, element: 'water', astrology: '', kabbalah: undefined, archetype: 'שישה בגביעים', uprightKeywords: ['נוסטלגיה', 'זיכרונות', 'ילדות', 'איחוד'], reversedKeywords: ['תקיעות בעבר', 'נאיביות', 'עצמאות'] },
  42: { cardNumber: 42, element: 'water', astrology: '', kabbalah: undefined, archetype: 'שבעה בגביעים', uprightKeywords: ['בחירות', 'פנטזיה', 'אשליה', 'חשיבה משאלת לב'], reversedKeywords: ['בהירות', 'יישור ערכים', 'קבלת בחירות'] },
  43: { cardNumber: 43, element: 'water', astrology: '', kabbalah: undefined, archetype: 'שמונה בגביעים', uprightKeywords: ['אכזבה', 'נטישה', 'נסיגה', 'בריחה'], reversedKeywords: ['הימנעות', 'פחד', 'פחד מהתחייבות'] },
  44: { cardNumber: 44, element: 'water', astrology: '', kabbalah: undefined, archetype: 'תשעה בגביעים', uprightKeywords: ['שביעות רצון', 'סיפוק', 'הכרת תודה', 'משאלה מתגשמת'], reversedKeywords: ['חמדנות', 'חוסר שביעות רצון', 'חומריות'] },
  45: { cardNumber: 45, element: 'water', astrology: '', kabbalah: undefined, archetype: 'עשרה בגביעים', uprightKeywords: ['הרמוניה', 'אושר', 'התאמה', 'משפחה'], reversedKeywords: ['ניתוק', 'ערכים לא מיושרים', 'בית שבור'] },
  46: { cardNumber: 46, element: 'water', astrology: '', kabbalah: undefined, archetype: 'נסיך גביעים', uprightKeywords: ['יצירתיות', 'אינטואיציה', 'סקרנות', 'אפשרות'], reversedKeywords: ['חוסר בגרות', 'פגיעות רגשית', 'חוסר ביטחון'] },
  47: { cardNumber: 47, element: 'water', astrology: '', kabbalah: undefined, archetype: 'אביר גביעים', uprightKeywords: ['רומנטיקה', 'קסם', 'דמיון', 'אידיאליזם'], reversedKeywords: ['מצבי רוח', 'אכזבה', 'לא ריאליסטי'] },
  48: { cardNumber: 48, element: 'water', astrology: '', kabbalah: undefined, archetype: 'מלכת גביעים', uprightKeywords: ['חמלה', 'רוגע', 'נחמה', 'אינטואיציה'], reversedKeywords: ['חוסר ביטחון', 'נתינה יתר', 'תלות משותפת'] },
  49: { cardNumber: 49, element: 'water', astrology: '', kabbalah: undefined, archetype: 'מלך גביעים', uprightKeywords: ['איזון רגשי', 'חמלה', 'דיפלומטיה', 'שליטה'], reversedKeywords: ['קרירות', 'מצבי רוח', 'מניפולציה'] },
  50: { cardNumber: 50, element: 'air', astrology: '', kabbalah: undefined, archetype: 'אס חרבות', uprightKeywords: ['פריצת דרך', 'בהירות', 'שכל חד', 'אמת'], reversedKeywords: ['בלבול', 'כאוס', 'חוסר בהירות'] },
  51: { cardNumber: 51, element: 'air', astrology: '', kabbalah: undefined, archetype: 'שניים בחרבות', uprightKeywords: ['בחירות קשות', 'מבוי סתום', 'הימנעות', 'הכחשה'], reversedKeywords: ['חוסר החלטיות', 'בלבול', 'עומס מידע'] },
  52: { cardNumber: 52, element: 'air', astrology: '', kabbalah: undefined, archetype: 'שלושה בחרבות', uprightKeywords: ['שבירת לב', 'צער', 'כאב', 'בגידה'], reversedKeywords: ['החלמה', 'סליחה', 'המשך הלאה'] },
  53: { cardNumber: 53, element: 'air', astrology: '', kabbalah: undefined, archetype: 'ארבעה בחרבות', uprightKeywords: ['מנוחה', 'שיקום', 'התבוננות', 'התאוששות'], reversedKeywords: ['חוסר מנוחה', 'שחיקה', 'חוסר התקדמות'] },
  54: { cardNumber: 54, element: 'air', astrology: '', kabbalah: undefined, archetype: 'חמישה בחרבות', uprightKeywords: ['עימות', 'תבוסה', 'ניצחון במחיר', 'בגידה'], reversedKeywords: ['פיוס', 'תיקון', 'טינה מהעבר'] },
  55: { cardNumber: 55, element: 'air', astrology: '', kabbalah: undefined, archetype: 'שישה בחרבות', uprightKeywords: ['מעבר', 'שינוי', 'המשך הלאה', 'נסיעה'], reversedKeywords: ['התנגדות לשינוי', 'עניינים לא גמורים'] },
  56: { cardNumber: 56, element: 'air', astrology: '', kabbalah: undefined, archetype: 'שבעה בחרבות', uprightKeywords: ['רמאות', 'בגידה', 'אסטרטגיה', 'ערמומיות'], reversedKeywords: ['הודאה', 'שינוי גישה'] },
  57: { cardNumber: 57, element: 'air', astrology: '', kabbalah: undefined, archetype: 'שמונה בחרבות', uprightKeywords: ['הגבלה', 'כלא', 'מנטליות קורבן', 'חוסר אונים'], reversedKeywords: ['קבלה עצמית', 'חופש', 'שחרור'] },
  58: { cardNumber: 58, element: 'air', astrology: '', kabbalah: undefined, archetype: 'תשעה בחרבות', uprightKeywords: ['חרדה', 'דאגה', 'פחד', 'סיוטים'], reversedKeywords: ['תקווה', 'פנייה לעזרה', 'ייאוש'] },
  59: { cardNumber: 59, element: 'air', astrology: '', kabbalah: undefined, archetype: 'עשרה בחרבות', uprightKeywords: ['סוף כואב', 'בגידה', 'אובדן', 'משבר'], reversedKeywords: ['התאוששות', 'התחדשות', 'פחד מחורבן'] },
  60: { cardNumber: 60, element: 'air', astrology: '', kabbalah: undefined, archetype: 'נסיך חרבות', uprightKeywords: ['סקרנות', 'חוסר מנוחה', 'אנרגיה מנטלית', 'ערנות'], reversedKeywords: ['מניפולציה', 'דיבורים ריקים'] },
  61: { cardNumber: 61, element: 'air', astrology: '', kabbalah: undefined, archetype: 'אביר חרבות', uprightKeywords: ['פעולה', 'אימפולסיביות', 'שאפתנות', 'חיפזון'], reversedKeywords: ['פזיזות', 'חוסר מיקוד'] },
  62: { cardNumber: 62, element: 'air', astrology: '', kabbalah: undefined, archetype: 'מלכת חרבות', uprightKeywords: ['עצמאות', 'חשיבה בהירה', 'תקשורת ישירה'], reversedKeywords: ['קרירות', 'אכזריות', 'מרירות'] },
  63: { cardNumber: 63, element: 'air', astrology: '', kabbalah: undefined, archetype: 'מלך חרבות', uprightKeywords: ['בהירות מנטלית', 'סמכות', 'אמת', 'כוח'], reversedKeywords: ['מניפולטיביות', 'אכזריות', 'חולשה'] },
  64: { cardNumber: 64, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'אס מטבעות', uprightKeywords: ['הזדמנות', 'שגשוג', 'מיזם חדש', 'ביטוי'], reversedKeywords: ['הזדמנות אבודה', 'חוסר תכנון', 'מחסור'] },
  65: { cardNumber: 65, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'שניים במטבעות', uprightKeywords: ['איזון', 'הסתגלות', 'ניהול זמן', 'עדיפויות'], reversedKeywords: ['עומס', 'חוסר ארגון', 'סדר עדיפויות מחדש'] },
  66: { cardNumber: 66, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'שלושה במטבעות', uprightKeywords: ['עבודת צוות', 'שיתוף פעולה', 'למידה', 'יישום'], reversedKeywords: ['חוסר שיתוף', 'התעלמות מכישורים'] },
  67: { cardNumber: 67, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'ארבעה במטבעות', uprightKeywords: ['שליטה', 'יציבות', 'ביטחון', 'שמרנות'], reversedKeywords: ['חמדנות', 'חומריות', 'הגנה עצמית'] },
  68: { cardNumber: 68, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'חמישה במטבעות', uprightKeywords: ['אובדן כלכלי', 'עוני', 'חוסר ביטחון', 'בידוד'], reversedKeywords: ['התאוששות', 'התגברות על קשיים'] },
  69: { cardNumber: 69, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'שישה במטבעות', uprightKeywords: ['נדיבות', 'צדקה', 'שיתוף', 'שגשוג'], reversedKeywords: ['חוב', 'נתינה עם תנאים', 'אי-שוויון'] },
  70: { cardNumber: 70, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'שבעה במטבעות', uprightKeywords: ['ראייה לטווח ארוך', 'התמדה', 'השקעה', 'מאמץ'], reversedKeywords: ['חוסר סבלנות', 'חוסר תגמול', 'מאמץ לריק'] },
  71: { cardNumber: 71, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'שמונה במטבעות', uprightKeywords: ['חניכות', 'מיומנות', 'פיתוח כישרון', 'מאסטריות'], reversedKeywords: ['חוסר מיקוד', 'פרפקציוניזם', 'חוסר השראה'] },
  72: { cardNumber: 72, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'תשעה במטבעות', uprightKeywords: ['שפע', 'יוקרה', 'עצמאות', 'כושר עצמי'], reversedKeywords: ['השקעת יתר', 'עסקאות מפוקפקות', 'חיים מעבר ליכולת'] },
  73: { cardNumber: 73, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'עשרה במטבעות', uprightKeywords: ['עושר', 'ירושה', 'משפחה', 'מורשת'], reversedKeywords: ['כישלון כלכלי', 'בדידות', 'סכסוכים משפחתיים'] },
  74: { cardNumber: 74, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'נסיך מטבעות', uprightKeywords: ['שאפתנות', 'רצון', 'חריצות', 'מטרות'], reversedKeywords: ['חוסר מחויבות', 'חמדנות', 'עצלות'] },
  75: { cardNumber: 75, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'אביר מטבעות', uprightKeywords: ['יעילות', 'שגרה', 'שמרנות', 'שיטתיות'], reversedKeywords: ['עצלות', 'אובססיביות', 'עבודה ללא תגמול'] },
  76: { cardNumber: 76, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'מלכת מטבעות', uprightKeywords: ['טיפוח', 'מעשיות', 'דאגה', 'ביטחון'], reversedKeywords: ['הזנחה עצמית', 'חוסר איזון בין עבודה לבית'] },
  77: { cardNumber: 77, element: 'earth', astrology: '', kabbalah: undefined, archetype: 'מלך מטבעות', uprightKeywords: ['עושר', 'עסקים', 'ביטחון', 'משמעת'], reversedKeywords: ['חמדנות', 'חומריות יתר', 'עקשנות'] },
};

/** הגדרת פריסת טארוט */
export interface TarotSpread {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cardCount: number;
  readonly positions: readonly string[];
}

/** 4 פריסות טארוט — קלף בודד, שלושה, יחסים, צלב קלטי */
export const TAROT_SPREADS: readonly TarotSpread[] = [
  { id: 'single_card', name: 'קלף בודד', description: 'תובנה מיידית', cardCount: 1, positions: ['התובנה'] },
  { id: 'three_card', name: 'שלושה קלפים', description: 'עבר, הווה, עתיד', cardCount: 3, positions: ['עבר', 'הווה', 'עתיד'] },
  { id: 'relationship', name: 'פריסת יחסים', description: '5 קלפים על מערכת יחסים', cardCount: 5, positions: ['המצב שלך', 'המצב של השני', 'הקשר ביניכם', 'האתגרים', 'הפוטנציאל'] },
  { id: 'celtic_cross', name: 'הצלב הקלטי', description: 'פריסה מקיפה של 10 קלפים', cardCount: 10, positions: ['המצב הנוכחי', 'האתגר/המכשול', 'הבסיס/העבר הרחוק', 'העבר הקרוב', 'האפשרות הטובה ביותר', 'העתיד הקרוב', 'איך אתה רואה את עצמך', 'איך אחרים רואים אותך', 'תקוות ופחדים', 'התוצאה הסופית'] },
] as const;
