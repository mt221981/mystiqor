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
  /** מזהה המשתמש (אינו בשימוש בקריאת API — auth מצד השרת) */
  userId: string
}

// ===== פונקציות עזר =====

/**
 * מחשבת ציון ממוצע מ-results JSON — מוחזר מ-/api/analysis/[id] אך ב-list אין results
 * לכן נשתמש ב-confidence_score כציון ייצוגי
 */
function scoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-700 text-gray-400'
  if (score >= 0.8) return 'bg-purple-600 text-white'
  if (score >= 0.5) return 'bg-purple-400/20 text-purple-300'
  return 'bg-gray-700 text-gray-400'
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
      <Card className="border-purple-500/20 bg-gray-900/50">
        <CardContent className="py-8 text-center text-gray-400">
          טוען ניתוחים...
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card className="border-red-500/20 bg-gray-900/50">
        <CardContent className="py-8 text-center text-red-400">
          שגיאה בטעינת הניתוחים
        </CardContent>
      </Card>
    )
  }

  if (!analyses || analyses.length === 0) {
    return (
      <Card className="border-purple-500/20 bg-gray-900/50">
        <CardContent className="py-12 text-center">
          <TrendingUp className="h-10 w-10 text-purple-400/40 mx-auto mb-3" />
          <p className="text-gray-400">אין ניתוחים קודמים. בצע ניתוח ראשון!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-purple-500/20 bg-gray-900/50" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-purple-300 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          ציר זמן ניתוחי כתב יד
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* קו אנכי */}
          <div className="absolute top-0 bottom-0 end-5 w-px bg-purple-500/20" />

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
                  <div className="absolute end-3 top-1.5 w-5 h-5 rounded-full bg-purple-600 border-2 border-purple-400 flex-shrink-0 z-10" />

                  {/* תוכן הכרטיס */}
                  <div className="flex-1 p-3 rounded-lg border border-purple-500/20 bg-gray-800/50 hover:border-purple-500/40 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-200">
                        ניתוח #{analyses.length - idx}
                      </span>
                      <div className="flex items-center gap-2">
                        {scoreDisplay && (
                          <Badge className={`text-xs px-2 py-0.5 ${scoreColor(analysis.confidence_score)}`}>
                            {scoreDisplay}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(analysis.created_at)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
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
