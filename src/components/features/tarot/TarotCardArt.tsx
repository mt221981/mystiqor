'use client'

/**
 * TarotCardArt — אמנות CSS ויזואלית לקלף טארוט
 * מדוע: מחליף תצוגת טקסט שטוחה בחוויה מיסטית עם גרדיאנטים, אותיות עבריות קבליות ועיצוב ארקנה גדולה
 */

/** פרופס של TarotCardArt */
interface TarotCardArtProps {
  /** מספר הקלף (0-77) */
  cardNumber: number
  /** ארקנה: 'major' | 'minor' */
  arcana: string
  /** סוט (לארקנה קטנה): 'wands' | 'cups' | 'swords' | 'pentacles' */
  suit?: string | null
  /** אלמנט: 'fire' | 'water' | 'earth' | 'air' */
  element?: string
  /** אות קבלה (לארקנה גדולה) */
  kabbalah?: string
  /** שם הארכיטיפ */
  archetype?: string
  /** שם הקלף בעברית */
  nameHe: string
}

/** מיפוי מספר רומי לקלפי ארקנה גדולה */
const ROMAN_NUMERALS: Record<number, string> = {
  0: '0',
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
  13: 'XIII',
  14: 'XIV',
  15: 'XV',
  16: 'XVI',
  17: 'XVII',
  18: 'XVIII',
  19: 'XIX',
  20: 'XX',
  21: 'XXI',
}

/** מיפוי שם קבלה לאות עברית — 22 אותיות לארקנה גדולה */
const KABBALAH_LETTER: Record<string, string> = {
  Aleph: 'א',
  Beth: 'ב',
  Gimel: 'ג',
  Daleth: 'ד',
  Heh: 'ה',
  Vav: 'ו',
  Zayin: 'ז',
  Cheth: 'ח',
  Teth: 'ט',
  Yod: 'י',
  Kaph: 'כ',
  Lamed: 'ל',
  Mem: 'מ',
  Nun: 'נ',
  Samekh: 'ס',
  Ayin: 'ע',
  Peh: 'פ',
  Tzaddi: 'צ',
  Qoph: 'ק',
  Resh: 'ר',
  Shin: 'ש',
  Tav: 'ת',
}

/** מיפוי אלמנט לגרדיאנט CSS לארקנה גדולה */
const ELEMENT_GRADIENT: Record<string, string> = {
  fire: 'from-red-950 via-orange-900 to-amber-950',
  water: 'from-blue-950 via-indigo-900 to-purple-950',
  earth: 'from-green-950 via-emerald-900 to-amber-950',
  air: 'from-slate-800 via-gray-700 to-zinc-900',
}

/** מיפוי אלמנט לצבע הזוהר */
const ELEMENT_GLOW: Record<string, string> = {
  fire: 'rgba(251,146,60,0.35)',
  water: 'rgba(139,92,246,0.35)',
  earth: 'rgba(52,211,153,0.30)',
  air: 'rgba(226,232,240,0.25)',
}

/** מיפוי אלמנט לצבע הכותרת */
const ELEMENT_TEXT_COLOR: Record<string, string> = {
  fire: '#fbbf24',
  water: '#a78bfa',
  earth: '#6ee7b7',
  air: '#e2e8f0',
}

/** גרדיאנט לפי סוט — ארקנה קטנה */
const SUIT_GRADIENT: Record<string, string> = {
  wands: 'from-red-950 via-orange-900 to-red-900',
  cups: 'from-blue-950 via-cyan-900 to-indigo-950',
  swords: 'from-slate-900 via-gray-800 to-slate-950',
  pentacles: 'from-green-950 via-emerald-900 to-green-900',
}

/** סמל הסוט */
const SUIT_SYMBOL: Record<string, string> = {
  wands: '🔥',
  cups: '💧',
  swords: '⚔️',
  pentacles: '⭐',
}

/** סמל ייחודי לכל קלף Major Arcana — מעשיר את ה-CSS art */
const MAJOR_SYMBOL: Record<number, string> = {
  0: '🌀',   // השוטה — ספירלה, מסע ללא סוף
  1: '⚡',   // הקוסם — כוח יצירה
  2: '🌙',   // הכוהנת — ירח, אינטואיציה
  3: '🌿',   // הקיסרית — טבע, שפע
  4: '👑',   // הקיסר — סמכות
  5: '🔑',   // ההיירופנט — מפתח לידע
  6: '💕',   // האוהבים — אהבה
  7: '⭐',   // המרכבה — כוכב מנחה
  8: '🦁',   // הכוח — אומץ
  9: '🏮',   // הנזיר — אור פנימי
  10: '☸️',  // גלגל המזל — מחזוריות
  11: '⚖️',  // הצדק — איזון
  12: '🔮',  // התלוי — חזון
  13: '🦋',  // המוות — טרנספורמציה
  14: '🏺',  // המתינות — כלי קדוש
  15: '🔗',  // השטן — כבלים
  16: '⚡',  // המגדל — מהפך
  17: '✨',  // הכוכב — תקווה
  18: '🌊',  // הירח — תת-מודע
  19: '☀️',  // השמש — הארה
  20: '🕊️',  // השיפוט — התעוררות
  21: '🌍',  // העולם — שלמות
}

/** צבע טקסט הסוט */
const SUIT_TEXT_COLOR: Record<string, string> = {
  wands: '#fb923c',
  cups: '#60a5fa',
  swords: '#cbd5e1',
  pentacles: '#a3e635',
}

/**
 * ממיר מספר קלף לתווית מספר רומי
 * @param num — מספר הקלף (0-21)
 * @returns מחרוזת מספר רומי
 */
function toRoman(num: number): string {
  return ROMAN_NUMERALS[num] ?? String(num)
}

/**
 * מרנדר אמנות CSS ויזואלית לקלף טארוט
 * ארקנה גדולה: גרדיאנט אלמנטלי + אות קבלה + מספר רומי + שם ארכיטיפ
 * ארקנה קטנה: גרדיאנט לפי סוט + מספר גדול + סמל הסוט
 */
export function TarotCardArt({
  cardNumber,
  arcana,
  suit,
  element,
  kabbalah,
  archetype,
  nameHe,
}: TarotCardArtProps) {
  const isMajor = arcana === 'major'

  /** גרדיאנט בסיסי */
  const gradientClass = isMajor
    ? (ELEMENT_GRADIENT[element ?? 'air'] ?? ELEMENT_GRADIENT['air'])
    : (SUIT_GRADIENT[suit ?? ''] ?? 'from-purple-950 via-indigo-900 to-purple-950')

  /** צבע הזוהר */
  const glowColor = isMajor
    ? (ELEMENT_GLOW[element ?? 'air'] ?? ELEMENT_GLOW['air'])
    : 'rgba(139,92,246,0.3)'

  /** צבע הכותרת */
  const accentColor = isMajor
    ? (ELEMENT_TEXT_COLOR[element ?? 'air'] ?? '#e2e8f0')
    : (SUIT_TEXT_COLOR[suit ?? ''] ?? '#c4b5fd')

  /** האות העברית לארקנה גדולה */
  const hebrewLetter = kabbalah ? (KABBALAH_LETTER[kabbalah] ?? '✦') : '✦'

  /** מספר הקלף לארקנה קטנה (בתוך הסוט) */
  const minorNumber = cardNumber >= 22 ? ((cardNumber - 22) % 14) + 1 : cardNumber

  return (
    <div
      className={`relative w-full rounded-xl bg-gradient-to-br ${gradientClass} overflow-hidden flex flex-col items-center justify-between py-3 px-2`}
      style={{
        aspectRatio: '2 / 3',
        boxShadow: `0 0 25px ${glowColor}, inset 0 0 40px rgba(0,0,0,0.5)`,
      }}
      aria-hidden="true"
    >
      {/* מסגרת זהובה פנימית */}
      <div className="absolute inset-1.5 rounded-lg border border-amber-400/25 pointer-events-none" />
      <div className="absolute inset-3 rounded-md border border-amber-400/10 pointer-events-none" />

      {/* כוכבים דקורטיביים ברקע */}
      <div
        className="absolute inset-0 opacity-25 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 20%, rgba(255,255,255,0.2) 1px, transparent 1px), radial-gradient(circle at 80% 15%, rgba(255,255,255,0.15) 1px, transparent 1px), radial-gradient(circle at 45% 75%, rgba(255,255,255,0.18) 1px, transparent 1px), radial-gradient(circle at 70% 50%, rgba(255,255,255,0.12) 1px, transparent 1px), radial-gradient(circle at 25% 60%, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px, 50px 50px, 70px 70px, 40px 40px, 90px 90px',
        }}
      />

      {/* עיגול מיסטי מרכזי */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '25%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '40%',
          border: `1px solid ${accentColor}20`,
          borderRadius: '50%',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '45%',
          height: '30%',
          border: `1px solid ${accentColor}15`,
          borderRadius: '50%',
        }}
      />

      {/* זוהר מרכזי */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center 40%, ${glowColor} 0%, transparent 60%)`,
        }}
      />

      {/* שורה עליונה — מספר רומי / מספר קלף */}
      <div className="relative z-10 text-center">
        {isMajor ? (
          <span
            className="text-xs font-mono tracking-widest opacity-80"
            style={{ color: accentColor }}
          >
            {toRoman(cardNumber)}
          </span>
        ) : (
          <span
            className="text-xs font-mono tracking-widest opacity-70"
            style={{ color: accentColor }}
          >
            {SUIT_SYMBOL[suit ?? ''] ?? '✦'}
          </span>
        )}
      </div>

      {/* מרכז — אות עברית / מספר ארקנה קטנה */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1">
        {isMajor ? (
          <>
            {/* סמל ייחודי לקלף — גדול ובולט */}
            <span className="select-none" style={{ fontSize: 'clamp(2.5rem, 10vw, 4rem)' }}>
              {MAJOR_SYMBOL[cardNumber] ?? '✦'}
            </span>
            {/* אות קבלה גדולה */}
            <span
              className="font-bold leading-none select-none"
              style={{
                fontSize: 'clamp(3.5rem, 14vw, 6rem)',
                color: accentColor,
                textShadow: `0 0 30px ${glowColor}, 0 0 60px ${glowColor}, 0 0 100px ${glowColor}`,
                fontFamily: 'serif',
                direction: 'rtl',
              }}
            >
              {hebrewLetter}
            </span>
            {/* שם קבלה קטן מתחת */}
            {kabbalah && (
              <span
                className="text-xs opacity-60 mt-1 tracking-widest uppercase"
                style={{ color: accentColor }}
              >
                {kabbalah}
              </span>
            )}
          </>
        ) : (
          <>
            {/* סמל הסוט למעלה — גדול */}
            <span className="select-none" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', opacity: 0.8 }}>{SUIT_SYMBOL[suit ?? ''] ?? '✦'}</span>
            {/* מספר גדול לארקנה קטנה */}
            <span
              className="font-bold leading-none select-none"
              style={{
                fontSize: 'clamp(3rem, 12vw, 5rem)',
                color: accentColor,
                textShadow: `0 0 25px ${glowColor}, 0 0 50px ${glowColor}`,
                fontFamily: 'serif',
              }}
            >
              {minorNumber}
            </span>
            {/* סמל הסוט תחתון */}
            <span className="select-none" style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', opacity: 0.5 }}>{SUIT_SYMBOL[suit ?? ''] ?? '✦'}</span>
          </>
        )}
      </div>

      {/* שורה תחתונה — שם הארכיטיפ */}
      <div className="relative z-10 text-center w-full px-1">
        <span
          className="text-xs font-medium leading-tight opacity-85 line-clamp-1 block"
          style={{ color: accentColor, direction: 'rtl' }}
        >
          {isMajor ? (archetype ?? nameHe) : nameHe}
        </span>
      </div>

      {/* קישוט פינות */}
      <div
        className="absolute top-1 end-1 text-xs opacity-30 select-none pointer-events-none"
        style={{ color: accentColor }}
      >
        ✦
      </div>
      <div
        className="absolute bottom-1 start-1 text-xs opacity-30 select-none pointer-events-none"
        style={{ color: accentColor }}
      >
        ✦
      </div>
    </div>
  )
}
