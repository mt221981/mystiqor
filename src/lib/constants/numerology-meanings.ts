/**
 * משמעויות המספרים הנומרולוגיים — baseline לכל מספר מ-1 עד 33
 * כולל מספרי מאסטר (11, 22, 33) וסמלים קבליים
 * מדוע: מאפשר להציג תיאור ראשוני מיידי לפני שהפרשנות AI מגיעה
 */

/** תיאור מספר נומרולוגי */
export interface NumberMeaning {
  /** המספר */
  readonly number: number
  /** כותרת עברית קצרה */
  readonly title: string
  /** תיאור קצר — משפט אחד */
  readonly shortDescription: string
  /** תיאור מעמיק — 2-3 משפטים */
  readonly deepDescription: string
  /** ספירה בעץ החיים */
  readonly sephira: string
  /** אות עברית מקושרת */
  readonly hebrewLetter: string
  /** אלמנט / כוכב */
  readonly association: string
  /** מילות מפתח */
  readonly keywords: readonly string[]
}

/** מיפוי סוגי המספרים לכותרות עבריות */
export const NUMBER_TYPE_LABELS: Record<string, { label: string; icon: string; description: string }> = {
  life_path: {
    label: 'נתיב חיים',
    icon: '🛤️',
    description: 'המספר שמגדיר את מסע החיים שלך — האתגרים, ההזדמנויות והשיעורים שנשמתך בחרה ללמוד בגלגול הזה.',
  },
  destiny: {
    label: 'גורל',
    icon: '⭐',
    description: 'המספר שחושף את ייעודך בעולם — מה באת לתת, ליצור ולהגשים. זהו הכוח שמושך אותך קדימה.',
  },
  soul: {
    label: 'נשמה',
    icon: '💫',
    description: 'הרצון הפנימי העמוק ביותר שלך — מה שנשמתך כמהה לו מעבר לכל הופעה חיצונית.',
  },
  personality: {
    label: 'אישיות',
    icon: '🪞',
    description: 'האופן שבו העולם רואה אותך — המסכה או המעטפת שדרכה אתה מתגלה לאחרים.',
  },
  personal_year: {
    label: 'שנה אישית',
    icon: '🔮',
    description: 'האנרגיה השולטת בשנה הנוכחית שלך — מה עומד במוקד, מה כדאי לפתח ומה לשחרר.',
  },
}

/** משמעויות מספרים 1-9 + מאסטר */
export const NUMBER_MEANINGS: Record<number, NumberMeaning> = {
  1: {
    number: 1,
    title: 'הפורץ',
    shortDescription: 'עצמאות, מנהיגות והתחלות חדשות.',
    deepDescription: 'אתה נושא בתוכך אנרגיה של ראשוניות — הכוח ליזום, להוביל ולפלס דרך חדשה. המספר 1 מסמל את הניצוץ הראשון של הבריאה, את הרגע שבו הכל מתחיל.',
    sephira: 'כתר',
    hebrewLetter: 'א',
    association: 'שמש',
    keywords: ['מנהיגות', 'עצמאות', 'חדשנות', 'אומץ', 'יוזמה'],
  },
  2: {
    number: 2,
    title: 'המגשר',
    shortDescription: 'שותפות, רגישות ואיזון.',
    deepDescription: 'נשמתך מחפשת חיבור, הרמוניה ושיתוף פעולה. המספר 2 מגלם את הדואליות — אור וצל, נותן ומקבל, נשמתי וארצי. כוחך בדיפלומטיה ובהקשבה.',
    sephira: 'חכמה',
    hebrewLetter: 'ב',
    association: 'ירח',
    keywords: ['שותפות', 'רגישות', 'דיפלומטיה', 'איזון', 'אינטואיציה'],
  },
  3: {
    number: 3,
    title: 'היוצר',
    shortDescription: 'יצירתיות, ביטוי עצמי ושמחה.',
    deepDescription: 'אתה ערוץ ליצירה — מילים, צלילים, צבעים וביטוי זורמים דרכך. המספר 3 הוא המשולש הקדוש — תזה, אנטיתזה וסינתזה. הקסם שלך ביכולת להפוך מחשבות למציאות.',
    sephira: 'בינה',
    hebrewLetter: 'ג',
    association: 'צדק (יופיטר)',
    keywords: ['יצירתיות', 'ביטוי', 'שמחה', 'תקשורת', 'השראה'],
  },
  4: {
    number: 4,
    title: 'הבונה',
    shortDescription: 'יציבות, סדר ובניית יסודות.',
    deepDescription: 'אתה אדריכל החיים — בונה מבנים חזקים של ביטחון, סדר ומשמעת. המספר 4 מייצג את ארבע הרוחות, ארבעת היסודות ואת היסוד שעליו הכל נבנה.',
    sephira: 'חסד',
    hebrewLetter: 'ד',
    association: 'אורנוס',
    keywords: ['יציבות', 'מעשיות', 'סדר', 'אחריות', 'התמדה'],
  },
  5: {
    number: 5,
    title: 'החופשי',
    shortDescription: 'חירות, הרפתקנות ושינוי.',
    deepDescription: 'נשמתך צמאה לחופש ולחוויות. המספר 5 הוא מספר החמישה חושים, השער בין הרוחני לגשמי. אתה נולדת להתנסות, לטעום ולחקור.',
    sephira: 'גבורה',
    hebrewLetter: 'ה',
    association: 'כוכב חמה (מרקורי)',
    keywords: ['חופש', 'הרפתקה', 'גמישות', 'שינוי', 'חושים'],
  },
  6: {
    number: 6,
    title: 'המטפל',
    shortDescription: 'אהבה, אחריות ומשפחה.',
    deepDescription: 'ליבך נושא אהבה עמוקה ורצון לדאוג. המספר 6 הוא מגן דוד — שני משולשים שלובים, שמיים וארץ בהרמוניה. הכוח שלך ביכולת לרפא דרך אהבה ללא תנאי.',
    sephira: 'תפארת',
    hebrewLetter: 'ו',
    association: 'נוגה (ונוס)',
    keywords: ['אהבה', 'אחריות', 'משפחה', 'ריפוי', 'הרמוניה'],
  },
  7: {
    number: 7,
    title: 'החוקר',
    shortDescription: 'חוכמה פנימית, מיסטיקה וחיפוש אמת.',
    deepDescription: 'אתה נשמה עתיקה שמחפשת אמת מעבר למראית העין. המספר 7 הוא המספר הקדוש — שבעת ימי הבריאה, שבע הספירות התחתונות. הדרך שלך היא פנימה.',
    sephira: 'נצח',
    hebrewLetter: 'ז',
    association: 'נפטון',
    keywords: ['חוכמה', 'מיסטיקה', 'אמת', 'מדיטציה', 'אנליזה'],
  },
  8: {
    number: 8,
    title: 'השליט',
    shortDescription: 'כוח, שפע ומימוש.',
    deepDescription: 'אתה נושא אנרגיה של שפע ומימוש. המספר 8 שוכב הוא סמל האינסוף — הזרימה שבין עולם הרוח לעולם החומר. כוחך ביכולת להפוך חזון למציאות.',
    sephira: 'הוד',
    hebrewLetter: 'ח',
    association: 'שבתאי (סטורן)',
    keywords: ['כוח', 'שפע', 'סמכות', 'מימוש', 'קארמה'],
  },
  9: {
    number: 9,
    title: 'החכם',
    shortDescription: 'חמלה, השלמה ואוניברסליות.',
    deepDescription: 'נשמתך רחבה כיקום — מכילה, מבינה, סולחת. המספר 9 הוא המספר השלם, סיום מחזור, חוכמה שנצברה מכל המספרים שלפניו. אתה כאן כדי לתת ולשרת.',
    sephira: 'יסוד',
    hebrewLetter: 'ט',
    association: 'מאדים (מארס)',
    keywords: ['חמלה', 'חוכמה', 'שירות', 'השלמה', 'אוניברסליות'],
  },
  11: {
    number: 11,
    title: 'המאסטר המשדר',
    shortDescription: 'מספר מאסטר — אינטואיציה גבוהה, השראה ותעלות רוחנית.',
    deepDescription: 'אתה נושא תדר כפול של האחד — אינטואיציה חדה כתער, חיבור ישיר למקור. מספר המאסטר 11 הוא שער בין העולמות — אתה כאן כערוץ להארה ולהשראה.',
    sephira: 'כתר-חכמה',
    hebrewLetter: 'כ',
    association: 'פלוטו',
    keywords: ['אינטואיציה', 'השראה', 'ערוץ', 'הארה', 'רגישות גבוהה'],
  },
  22: {
    number: 22,
    title: 'המאסטר הבונה',
    shortDescription: 'מספר מאסטר — חזון עולמי ויכולת מימוש אדירה.',
    deepDescription: 'אתה נושא את הכוח ליצור שינוי בקנה מידה עולמי. 22 אותיות בעברית, 22 נתיבות בעץ החיים — אתה אדריכל של מציאות חדשה. המאסטר שמחבר שמיים וארץ.',
    sephira: 'חכמה-חסד',
    hebrewLetter: 'ת',
    association: 'כל הכוכבים',
    keywords: ['חזון', 'בנייה', 'מימוש גדול', 'מורשת', 'שליחות'],
  },
  33: {
    number: 33,
    title: 'המאסטר המרפא',
    shortDescription: 'מספר מאסטר — אהבה ללא תנאי, ריפוי ושירות.',
    deepDescription: 'אתה נושא את תדר האהבה הגבוה ביותר — ריפוי, הוראה ושירות מתוך חמלה אינסופית. 33 הוא מספר המשיח — לא במובן דתי אלא במובן של אהבה שמשנה עולמות.',
    sephira: 'בינה-תפארת',
    hebrewLetter: 'ל',
    association: 'נפטון-ונוס',
    keywords: ['ריפוי', 'אהבה ללא תנאי', 'הוראה', 'הקרבה', 'אור'],
  },
}

/**
 * מחזיר משמעות מספר — fallback למספר מצומצם אם אין ערך ישיר
 */
export function getNumberMeaning(num: number): NumberMeaning {
  if (NUMBER_MEANINGS[num]) return NUMBER_MEANINGS[num]
  // fallback — צמצום ל-1-9
  let reduced = num
  while (reduced > 9 && reduced !== 11 && reduced !== 22 && reduced !== 33) {
    reduced = String(reduced).split('').reduce((s, d) => s + parseInt(d, 10), 0)
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- NUMBER_MEANINGS[1] תמיד קיים
  return NUMBER_MEANINGS[reduced] ?? NUMBER_MEANINGS[1]!
}
