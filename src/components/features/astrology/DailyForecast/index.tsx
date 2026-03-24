/**
 * DailyForecast — קומפוננטת תחזית אסטרולוגית יומית
 * מציגה תחזית יומית מותאמת למזל המשתמש בפורמט כרטיסים מיסטיים
 */

import ReactMarkdown from 'react-markdown'
import { Star, Heart, Briefcase, Activity, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ZodiacSignKey } from '@/lib/constants/astrology'
import { ZODIAC_SIGNS } from '@/lib/constants/astrology'

// ===== טיפוסים =====

/** נתוני תחזית מפורטת מה-LLM */
export interface ForecastData {
  energyGeneral: string
  love: string
  career: string
  health: string
  luckyNumber: number
  summary: string
}

/** Props של קומפוננטת DailyForecast */
export interface DailyForecastProps {
  /** תוכן סיכום התחזית */
  content: string
  /** נתוני התחזית המפורטים */
  forecast: ForecastData | null
  /** מפתח המזל */
  zodiacSign: ZodiacSignKey
  /** תאריך התחזית בפורמט YYYY-MM-DD */
  date: string
  /** האם בטעינה */
  isLoading: boolean
}

// ===== הגדרות תצוגה =====

/** מפת אייקוני קטגוריה לתחומי החיים */
const SECTION_ICONS = {
  energyGeneral: { icon: Star,      label: 'אנרגיה כללית', color: 'text-tertiary'   },
  love:          { icon: Heart,     label: 'אהבה ויחסים',  color: 'text-primary'    },
  career:        { icon: Briefcase, label: 'קריירה וכסף',  color: 'text-secondary'  },
  health:        { icon: Activity,  label: 'בריאות',        color: 'text-tertiary'   },
} as const

type SectionKey = keyof typeof SECTION_ICONS

/**
 * פורמט תאריך לפורמט DD/MM/YYYY
 * @param isoDate - תאריך בפורמט YYYY-MM-DD
 */
function formatDate(isoDate: string): string {
  const parts = isoDate.split('-')
  if (parts.length !== 3) return isoDate
  const [year, month, day] = parts
  return `${day}/${month}/${year}`
}

// ===== Skeleton =====

/** סקלטון טעינה לכרטיס תחזית */
function ForecastSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  )
}

// ===== קומפוננטה ראשית =====

/**
 * תחזית יומית אסטרולוגית — מציגה תחזית מפורטת עם אייקוני קטגוריות
 */
export function DailyForecast({ content, forecast, zodiacSign, date, isLoading }: DailyForecastProps) {
  if (isLoading) {
    return <ForecastSkeleton />
  }

  const signInfo = ZODIAC_SIGNS[zodiacSign]

  return (
    <div className="space-y-4" dir="rtl">
      {/* כותרת מזל ותאריך */}
      <Card className="bg-surface-container border-outline-variant/5 border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label={signInfo.name}>
              {signInfo.emoji}
            </span>
            <div>
              <CardTitle className="text-2xl font-headline text-on-surface">
                מזל {signInfo.name}
              </CardTitle>
              <p className="text-on-surface-variant text-sm mt-1 font-label">
                תחזית ליום {formatDate(date)} — יסוד {signInfo.element}
              </p>
            </div>
          </div>
        </CardHeader>
        {/* סיכום כללי */}
        {content && (
          <CardContent>
            <div className="bg-surface-container-high rounded-lg p-4">
              <div className="prose prose-sm prose-invert max-w-none text-on-surface-variant leading-relaxed font-body">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* קטגוריות תחזית */}
      {forecast && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.keys(SECTION_ICONS) as SectionKey[]).map((key) => {
            const { icon: Icon, label, color } = SECTION_ICONS[key]
            const text = forecast[key]
            if (typeof text !== 'string') return null
            return (
              <Card
                key={key}
                className="bg-surface-container border-outline-variant/5 hover:bg-surface-container-high transition-colors"
              >
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm font-headline flex items-center gap-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-on-surface-variant text-sm leading-relaxed font-body">{text}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* מספר מזל */}
      {forecast?.luckyNumber && (
        <Card className="bg-surface-container border-outline-variant/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-4 w-4" />
                <span className="font-label text-sm font-medium">מספר מזל להיום</span>
              </div>
              <span
                className="text-3xl font-headline font-bold text-primary"
                style={{ color: signInfo.color }}
              >
                {forecast.luckyNumber}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
