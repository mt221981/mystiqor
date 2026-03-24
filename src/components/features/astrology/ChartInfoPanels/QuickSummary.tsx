'use client'

/**
 * QuickSummary — תקציר מהיר של שמש, ירח ועולה
 * מציג 3 כרטיסים: שמש ב{sign}, ירח ב{sign}, עולה ב{sign}
 * כל כרטיס מכיל אמוג'י, שם עברי ותיאור חד-שורתי לפי יסוד המזל
 */

import { Card, CardContent } from '@/components/ui/card'
import { ZODIAC_SIGNS, type ZodiacSignKey } from '@/lib/constants/astrology'

/** Props של רכיב QuickSummary */
export interface QuickSummaryProps {
  /** שם המזל של השמש (Aries, Taurus, וכו') */
  sunSign: string
  /** שם המזל של הירח */
  moonSign: string
  /** שם המזל של העולה */
  risingSign: string
}

/** תיאורים קצרים לפי יסוד */
const ELEMENT_DESCRIPTIONS: Record<string, string> = {
  'אש': 'אנרגטי, יוזם וסוחף',
  'אדמה': 'מעשי, יציב ואמין',
  'אוויר': 'אינטלקטואלי, תקשורתי וחברותי',
  'מים': 'רגיש, אינטואיטיבי ועמוק',
}

/** מידע לתצוגת כרטיס מזל */
interface SignCardData {
  /** כותרת הכרטיס בעברית */
  label: string
  /** מפתח המזל */
  signKey: ZodiacSignKey | null
  /** צבע הגבול */
  borderColor: string
  /** צבע הכותרת */
  titleColor: string
}

/**
 * מחזיר ZodiacSignKey אם המחרוזת היא מפתח מזל תקין
 * @param sign - שם המזל
 */
function toSignKey(sign: string): ZodiacSignKey | null {
  if (sign in ZODIAC_SIGNS) return sign as ZodiacSignKey
  return null
}

/**
 * כרטיס מזל יחיד — מציג אמוג'י, שם ותיאור
 */
function SignCard({ label, signKey, borderColor, titleColor }: SignCardData) {
  const signInfo = signKey ? ZODIAC_SIGNS[signKey] : null
  const description = signInfo ? (ELEMENT_DESCRIPTIONS[signInfo.element] ?? '') : ''

  return (
    <Card
      className="bg-surface-container rounded-xl flex-1 min-w-0 border border-outline-variant/5"
      style={{ borderColor: signInfo?.color ? `${signInfo.color}33` : undefined }}
    >
      <CardContent className="pt-4 pb-4 px-3 text-center">
        {/* אמוג'י המזל */}
        <div className="text-3xl mb-1" aria-hidden="true">
          {signInfo?.emoji ?? '✨'}
        </div>

        {/* כותרת + שם מזל */}
        <p className="text-xs font-label text-on-surface-variant mb-0.5" dir="rtl">
          {label}
        </p>
        <p
          className="text-sm font-headline font-semibold mb-1"
          style={{ color: titleColor }}
          dir="rtl"
        >
          {signInfo?.name ?? signKey ?? '—'}
        </p>

        {/* תיאור יסוד */}
        <p className="text-xs font-body text-on-surface-variant/60" dir="rtl">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * תקציר מהיר — 3 כרטיסים זה לצד זה: שמש, ירח, עולה
 *
 * @param sunSign - מזל השמש
 * @param moonSign - מזל הירח
 * @param risingSign - מזל העולה
 */
export function QuickSummary({ sunSign, moonSign, risingSign }: QuickSummaryProps) {
  const cards: SignCardData[] = [
    {
      label: 'שמש',
      signKey: toSignKey(sunSign),
      borderColor: '#FFD700',
      titleColor: '#FFD700',
    },
    {
      label: 'ירח',
      signKey: toSignKey(moonSign),
      borderColor: '#C0C0C0',
      titleColor: '#C0C0C0',
    },
    {
      label: 'עולה',
      signKey: toSignKey(risingSign),
      borderColor: '#A78BFA',
      titleColor: '#A78BFA',
    },
  ]

  return (
    <div className="flex gap-3" dir="rtl" aria-label="תקציר מזלות">
      {cards.map((card) => (
        <SignCard key={card.label} {...card} />
      ))}
    </div>
  )
}
