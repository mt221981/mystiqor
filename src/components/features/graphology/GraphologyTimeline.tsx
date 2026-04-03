'use client'

/**
 * ציר זמן גרפולוגי — מציג ניתוחי כתב יד קודמים בציר זמן אנכי
 * מדוע: מאפשר למשתמש לעקוב אחרי התקדמות כתב ידו לאורך זמן
 * Pattern: useQuery → /api/analysis?tool_type=graphology&limit=20 → ציר אנכי
 */

import { useQuery } from '@tanstack/react-query'
import { Clock, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ===== טיפוסים =====

/** שורת ניתוח מה-API (GET /api/analysis) */
interface AnalysisRow {
  id: string
  tool_type: string
  summary: string | null
  confidence_score: number | null
  created_at: string
}

/** תגובת API רשימת ניתוחים */
interface AnalysisListResponse {
  data: AnalysisRow[]
  meta: { offset: number; limit: number; total: number }
}

/** Props לציר הזמן הגרפולוגי */
export interface GraphologyTimelineProps {
  /** מזהה המשתמש (אופציונלי — auth מצד השרת) */
  userId?: string
}

// ===== פונקציות עזר =====

/**
 * מחשבת ציון ממוצע מ-results JSON — מוחזר מ-/api/analysis/[id] אך ב-list אין results
 * לכן נשתמש ב-confidence_score כציון ייצוגי
 */
function scoreColor(score: number | null): string {
  if (score === null) return 'bg-surface-container-high text-on-surface-variant'
  if (score >= 0.8) return 'bg-primary-container text-on-primary-container'
  if (score >= 0.5) return 'bg-primary-container/20 text-primary'
  return 'bg-surface-container-high text-on-surface-variant'
}

/**
 * מפרמטת תאריך לפורמט DD/MM/YYYY
 */
function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * מביא את רשימת ניתוחי הגרפולוגיה
 */
async function fetchGraphologyAnalyses(): Promise<AnalysisRow[]> {
  const res = await fetch('/api/analysis?tool_type=graphology&limit=20')
  if (!res.ok) throw new Error('שגיאה בטעינת ניתוחים')
  const json = (await res.json()) as AnalysisListResponse
  return json.data ?? []
}

// ===== קומפוננטה ראשית =====

/**
 * ציר זמן אנכי של ניתוחי גרפולוגיה קודמים
 */
export function GraphologyTimeline({ userId: _userId }: GraphologyTimelineProps) {
  const { data: analyses, isLoading, isError } = useQuery({
    queryKey: ['graphology-timeline'],
    queryFn: fetchGraphologyAnalyses,
  })

  if (isLoading) {
    return (
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardContent className="py-8 text-center text-on-surface-variant">
          טוען ניתוחים...
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="border-error/20 bg-surface-container">
        <CardContent className="py-8 text-center text-error">
          שגיאה בטעינת הניתוחים
        </CardContent>
      </Card>
    )
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-10 w-10 text-primary/40 mx-auto mb-3" />
          <p className="text-on-surface-variant">אין ניתוחים קודמים. בצע ניתוח ראשון!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-outline-variant/5 bg-surface-container" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-primary font-headline flex items-center gap-2">
          <Clock className="h-4 w-4" />
          ציר זמן ניתוחי כתב יד
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* קו אנכי */}
          <div className="absolute top-0 bottom-0 end-5 w-px bg-primary-container/30" />

          <div className="space-y-6">
            {analyses.map((analysis, idx) => {
              const summaryText = analysis.summary
                ? analysis.summary.substring(0, 100) + (analysis.summary.length > 100 ? '...' : '')
                : 'ללא סיכום'

              const scoreDisplay = analysis.confidence_score !== null
                ? `${Math.round(analysis.confidence_score * 100)}%`
                : null

              return (
                <div key={analysis.id} className="relative flex items-start gap-4 pe-14">
                  {/* נקודה בציר הזמן */}
                  <div className="absolute end-3 top-1.5 w-5 h-5 rounded-full bg-primary border-2 border-primary-container flex-shrink-0 z-10" />

                  {/* תוכן הכרטיס */}
                  <div className="flex-1 bg-surface-container rounded-xl p-4 border border-outline-variant/5 hover:border-primary/20 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-on-surface">
                        ניתוח #{analyses.length - idx}
                      </span>
                      <div className="flex items-center gap-2">
                        {scoreDisplay && (
                          <Badge className={`font-label text-xs px-2 py-0.5 ${scoreColor(analysis.confidence_score)}`}>
                            {scoreDisplay}
                          </Badge>
                        )}
                        <span className="font-label text-xs text-on-surface-variant">
                          {formatDate(analysis.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-on-surface-variant font-body">
                      {summaryText}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default GraphologyTimeline
