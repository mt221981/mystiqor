'use client'

/**
 * DrawingCompare — השוואת שני ניתוחי ציורים זה לצד זה
 * מאפשר למשתמש לבחור שני ניתוחים קודמים ולראות הבדלים בציוני Koppitz ומדדים רגשיים
 *
 * מדוע: מעקב אחר התפתחות פסיכולוגית לאורך מספר ציורים — מאפשר לזהות שינויים בביטוי הרגשי
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { DrawingResponse } from '@/services/analysis/response-schemas/drawing'

// ===== ממשקי טיפוסים =====

/** Props לקומפוננטת DrawingCompare */
interface DrawingCompareProps {
  /** מזהה המשתמש לשליפת ניתוחים */
  userId: string
}

/** שורת ניתוח ציורים מה-API — כולל results */
interface DrawingAnalysisRow {
  /** מזהה הניתוח */
  id: string
  /** תאריך הניתוח */
  created_at: string
  /** סיכום הניתוח */
  summary: string | null
  /** תוצאות הניתוח — DrawingResponse shape */
  results: Record<string, unknown> | null
}

/** תגובת API לרשימת ניתוחים */
interface AnalysisListResponse {
  data: DrawingAnalysisRow[]
  meta: { offset: number; limit: number; total: number }
}

// ===== פונקציות עזר =====

/**
 * שולף רשימת ניתוחי ציורים מה-API
 */
async function fetchDrawingAnalyses(): Promise<DrawingAnalysisRow[]> {
  const res = await fetch('/api/analysis?tool_type=drawing&limit=10&include_results=true')
  if (!res.ok) throw new Error('שגיאה בשליפת ניתוחים')
  const json = (await res.json()) as AnalysisListResponse
  return json.data
}

/**
 * מחלץ DrawingResponse מ-results של שורת ניתוח
 */
function extractDrawingResponse(row: DrawingAnalysisRow): DrawingResponse | null {
  if (!row.results) return null
  const r = row.results as Record<string, unknown>
  if (typeof r.summary !== 'string') return null
  return r as unknown as DrawingResponse
}

/**
 * מחזיר תאריך מעוצב DD/MM/YYYY
 */
function formatDate(isoDate: string): string {
  const d = new Date(isoDate)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

/**
 * מחשב את הדלתא בין שני ציוני Koppitz ומחזיר אייקון + צבע
 */
function KoppitzDelta({ scoreA, scoreB }: { scoreA?: number; scoreB?: number }) {
  if (scoreA === undefined || scoreB === undefined) {
    return <span className="text-gray-500">—</span>
  }
  const delta = scoreB - scoreA
  if (delta === 0) {
    return (
      <span className="flex items-center gap-1 text-gray-400">
        <Minus className="h-4 w-4" />
        {delta}
      </span>
    )
  }
  if (delta > 0) {
    return (
      <span className="flex items-center gap-1 text-red-400">
        <ArrowUp className="h-4 w-4" />+{delta}
      </span>
    )
  }
  return (
    <span className="flex items-center gap-1 text-green-400">
      <ArrowDown className="h-4 w-4" />{delta}
    </span>
  )
}

/** מחזיר תוויות טיפוס ציור בעברית */
function drawingTypeLabel(type: string): string {
  const map: Record<string, string> = {
    house: 'בית',
    tree: 'עץ',
    person: 'אדם',
    free: 'חופשי',
  }
  return map[type] ?? type
}

// ===== קומפוננטת ניתוח יחיד =====

/** כרטיסיית ניתוח בודד בתוך ההשוואה */
function AnalysisCard({
  label,
  analysis,
  response,
  highlightIndicators,
  isAdd,
}: {
  label: string
  analysis: DrawingAnalysisRow
  response: DrawingResponse
  highlightIndicators: Set<string>
  isAdd: boolean
}) {
  return (
    <Card className="border-purple-500/20 bg-gray-900/50 flex-1">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-purple-300">
          {label} — {formatDate(analysis.created_at)}
        </CardTitle>
        <p className="text-xs text-gray-400">
          סוג: {drawingTypeLabel(response.analysis_type)}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* סיכום */}
        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">{response.summary}</p>

        {/* ציון Koppitz */}
        {response.koppitz_score !== undefined && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-1">ציון Koppitz</p>
            <span className="text-lg font-bold text-purple-300">{response.koppitz_score}/30</span>
          </div>
        )}

        {/* מדדים רגשיים */}
        {response.emotional_indicators.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">מדדים רגשיים</p>
            <div className="flex flex-wrap gap-1">
              {response.emotional_indicators.map((indicator, idx) => {
                const isHighlighted = highlightIndicators.has(indicator)
                return (
                  <Badge
                    key={idx}
                    variant={isHighlighted ? (isAdd ? 'default' : 'destructive') : 'outline'}
                    className={`text-xs ${isHighlighted ? '' : 'text-gray-400 border-gray-600'}`}
                  >
                    {indicator}
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ===== קומפוננטה ראשית =====

/**
 * DrawingCompare — השוואה בין שני ניתוחי ציורים
 * מציג בורר לניתוח A ו-B, ולאחר מכן תצוגה זה לצד זה עם הדגשת הבדלים
 */
export default function DrawingCompare({ userId: _userId }: DrawingCompareProps) {
  const [selectedA, setSelectedA] = useState<string>('')
  const [selectedB, setSelectedB] = useState<string>('')

  const { data: analyses, isLoading, isError } = useQuery({
    queryKey: ['drawing-analyses-compare'],
    queryFn: fetchDrawingAnalyses,
  })

  if (isLoading) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>טוען ניתוחים...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>שגיאה בטעינת ניתוחים. נסה שוב.</p>
      </div>
    )
  }

  if (!analyses || analyses.length < 2) {
    return (
      <Card className="border-purple-500/20 bg-gray-900/50">
        <CardContent className="py-8 text-center">
          <p className="text-gray-400">נדרשים לפחות 2 ניתוחים להשוואה</p>
          <p className="text-sm text-gray-500 mt-2">
            בצע ניתוחי ציורים נוספים כדי להשוות בין תוצאות
          </p>
        </CardContent>
      </Card>
    )
  }

  const analysisA = analyses.find(a => a.id === selectedA)
  const analysisB = analyses.find(a => a.id === selectedB)
  const responseA = analysisA ? extractDrawingResponse(analysisA) : null
  const responseB = analysisB ? extractDrawingResponse(analysisB) : null

  // חישוב מדדים שהוספו/הוסרו
  const indicatorsA = new Set(responseA?.emotional_indicators ?? [])
  const indicatorsB = new Set(responseB?.emotional_indicators ?? [])
  const addedInB = new Set([...indicatorsB].filter(x => !indicatorsA.has(x)))
  const removedFromA = new Set([...indicatorsA].filter(x => !indicatorsB.has(x)))

  return (
    <div className="space-y-4" dir="rtl">
      {/* בוררי ניתוחים */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* ניתוח A */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-300">ניתוח A</label>
          <select
            value={selectedA}
            onChange={e => setSelectedA(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">בחר ניתוח</option>
            {analyses.map(a => (
              <option key={a.id} value={a.id} disabled={a.id === selectedB}>
                {formatDate(a.created_at)} — {a.summary?.slice(0, 40) ?? 'ניתוח ציור'}...
              </option>
            ))}
          </select>
        </div>

        {/* ניתוח B */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-300">ניתוח B</label>
          <select
            value={selectedB}
            onChange={e => setSelectedB(e.target.value)}
            className="w-full rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">בחר ניתוח</option>
            {analyses.map(a => (
              <option key={a.id} value={a.id} disabled={a.id === selectedA}>
                {formatDate(a.created_at)} — {a.summary?.slice(0, 40) ?? 'ניתוח ציור'}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* תצוגת השוואה */}
      {responseA && responseB && (
        <div className="space-y-4">
          {/* כרטיסיות זה לצד זה */}
          <div className="flex flex-col sm:flex-row gap-4">
            <AnalysisCard
              label="ניתוח A"
              analysis={analysisA!}
              response={responseA}
              highlightIndicators={removedFromA}
              isAdd={false}
            />
            <AnalysisCard
              label="ניתוח B"
              analysis={analysisB!}
              response={responseB}
              highlightIndicators={addedInB}
              isAdd={true}
            />
          </div>

          {/* סיכום הבדלים */}
          <Card className="border-purple-500/20 bg-gray-900/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-purple-300">השוואה</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Koppitz delta */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 w-32">שינוי ציון Koppitz:</span>
                <KoppitzDelta
                  scoreA={responseA.koppitz_score}
                  scoreB={responseB.koppitz_score}
                />
                {responseA.koppitz_score !== undefined && responseB.koppitz_score !== undefined && (
                  <span className="text-xs text-gray-500">
                    ({responseA.koppitz_score} → {responseB.koppitz_score})
                  </span>
                )}
              </div>

              {/* מדדים שנוספו */}
              {addedInB.size > 0 && (
                <div>
                  <p className="text-xs font-medium text-green-400 mb-1">
                    מדדים רגשיים חדשים בניתוח B:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {[...addedInB].map((ind, idx) => (
                      <Badge key={idx} variant="default" className="text-xs bg-green-700 text-white">
                        + {ind}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* מדדים שהוסרו */}
              {removedFromA.size > 0 && (
                <div>
                  <p className="text-xs font-medium text-red-400 mb-1">
                    מדדים רגשיים שנעלמו בניתוח B:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {[...removedFromA].map((ind, idx) => (
                      <Badge key={idx} variant="destructive" className="text-xs">
                        - {ind}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {addedInB.size === 0 && removedFromA.size === 0 && (
                <p className="text-sm text-gray-400">המדדים הרגשיים זהים בשני הניתוחים</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
