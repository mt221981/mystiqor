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
  energyGeneral: { icon: Star,      label: 'אנרגיה כללית', color: 'text-yellow-400' },
  love:          { icon: Heart,     label: 'אהבה ויחסים',  color: 'text-pink-400'   },
  career:        { icon: Briefcase, label: 'קריירה וכסף',  color: 'text-blue-400'   },
  health:        { icon: Activity,  label: 'בריאות',        color: 'text-green-400'  },
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
      <Card className="bg-gradient-to-br from-indigo-950/80 to-purple-950/80 border-indigo-700/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="text-4xl" role="img" aria-label={signInfo.name}>
              {signInfo.emoji}
            </span>
            <div>
              <CardTitle className="text-2xl text-white">
                מזל {signInfo.name}
              </CardTitle>
              <p className="text-indigo-300 text-sm mt-1">
                תחזית ליום {formatDate(date)} — יסוד {signInfo.element}
              </p>
            </div>
          </div>
        </CardHeader>
        {/* סיכום כללי */}
        {content && (
          <CardContent>
            <div className="bg-indigo-900/40 rounded-lg p-4">
              <div className="prose prose-sm prose-invert max-w-none text-indigo-100 leading-relaxed">
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
                className="bg-indigo-950/60 border-indigo-800/30 hover:border-indigo-600/50 transition-colors"
              >
                <CardHeader className="pb-2">
                  <CardTitle className={`text-sm flex items-center gap-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-indigo-100 text-sm leading-relaxed">{text}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* מספר מזל */}
      {forecast?.luckyNumber && (
        <Card className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border-purple-700/30">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">מספר מזל להיום</span>
              </div>
              <span
                className="text-3xl font-bold text-purple-200"
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
