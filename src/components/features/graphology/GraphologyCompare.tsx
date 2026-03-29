'use client'

/**
 * השוואת ניתוחים גרפולוגיים — בחירת שתי דגימות ועמדן השוואה זו לצד זו
 * מדוע: מאפשר למשתמש להשוות ציוני מרכיבים בין שתי ניתוחים ולזהות שיפורים/ירידות
 * Pattern: useQuery רשימה → שני Select → useQuery על כל ID נבחר → תצוגה זה לצד זה
 */

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { GraphologyResponse } from '@/services/analysis/response-schemas/graphology'

// ===== טיפוסים =====

/** שורת ניתוח מ-GET /api/analysis */
interface AnalysisRow {
  id: string
  tool_type: string
  summary: string | null
  confidence_score: number | null
  created_at: string
}

/** ניתוח מלא מ-GET /api/analysis/[id] */
interface FullAnalysis {
  id: string
  tool_type: string
  results: GraphologyResponse
  summary: string | null
  created_at: string
}

/** תגובת API רשימת ניתוחים */
interface AnalysisListResponse {
  data: AnalysisRow[]
  meta: { offset: number; limit: number; total: number }
}

/** תגובת API ניתוח בודד */
interface SingleAnalysisResponse {
  data: FullAnalysis
}

/** Props לרכיב ההשוואה */
export interface GraphologyCompareProps {
  /** מזהה המשתמש (אופציונלי — auth מצד השרת) */
  userId?: string
}

// ===== פונקציות עזר =====

/**
 * מפרמטת תאריך ISO ל-DD/MM/YYYY
 */
function formatDate(iso: string): string {
  const d = new Date(iso)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

/**
 * מביא רשימת ניתוחי גרפולוגיה
 */
async function fetchGraphologyList(): Promise<AnalysisRow[]> {
  const res = await fetch('/api/analysis?tool_type=graphology&limit=20')
  if (!res.ok) throw new Error('שגיאה בטעינת רשימת ניתוחים')
  const json = (await res.json()) as AnalysisListResponse
  return json.data ?? []
}

/**
 * מביא ניתוח מלא לפי ID
 */
async function fetchFullAnalysis(id: string): Promise<FullAnalysis> {
  const res = await fetch(`/api/analysis/${id}`)
  if (!res.ok) throw new Error('שגיאה בטעינת ניתוח')
  const json = (await res.json()) as SingleAnalysisResponse
  return json.data
}

// ===== קומפוננטות עזר =====

/** אייקון דלתא בין שני ציונים */
function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <ArrowUp className="h-3 w-3 text-green-400" />
  if (delta < 0) return <ArrowDown className="h-3 w-3 text-red-400" />
  return <Minus className="h-3 w-3 text-on-surface-variant/80" />
}

/** תיבת בחירת ניתוח */
function AnalysisSelect({
  label,
  analyses,
  selectedId,
  onSelect,
  excludeId,
}: {
  label: string
  analyses: AnalysisRow[]
  selectedId: string
  onSelect: (id: string) => void
  excludeId: string
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-label font-medium text-on-surface-variant">{label}</label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full rounded-md border border-outline-variant/30 bg-surface-container-low text-on-surface px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
        dir="rtl"
      >
        <option value="">— בחר ניתוח —</option>
        {analyses
          .filter((a) => a.id !== excludeId)
          .map((a) => (
            <option key={a.id} value={a.id}>
              {formatDate(a.created_at)}{a.summary ? ` — ${a.summary.substring(0, 40)}...` : ''}
            </option>
          ))}
      </select>
    </div>
  )
}

// ===== קומפוננטה ראשית =====

/**
 * השוואה זה לצד זה של שני ניתוחים גרפולוגיים
 */
export function GraphologyCompare({ userId: _userId }: GraphologyCompareProps) {
  const [idA, setIdA] = useState('')
  const [idB, setIdB] = useState('')

  // רשימת ניתוחים
  const { data: analyses = [], isLoading: listLoading } = useQuery({
    queryKey: ['graphology-compare-list'],
    queryFn: fetchGraphologyList,
  })

  // ניתוח A
  const { data: analysisA } = useQuery({
    queryKey: ['graphology-full', idA],
    queryFn: () => fetchFullAnalysis(idA),
    enabled: !!idA,
  })

  // ניתוח B
  const { data: analysisB } = useQuery({
    queryKey: ['graphology-full', idB],
    queryFn: () => fetchFullAnalysis(idB),
    enabled: !!idB,
  })

  if (listLoading) {
    return (
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardContent className="py-8 text-center text-on-surface-variant">טוען ניתוחים...</CardContent>
      </Card>
    )
  }

  if (analyses.length < 2) {
    return (
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardContent className="py-12 text-center">
          <p className="text-on-surface-variant">נדרשים לפחות 2 ניתוחים להשוואה. בצע ניתוח נוסף!</p>
        </CardContent>
      </Card>
    )
  }

  // מרכיבים מ-A ו-B
  const componentsA = analysisA?.results?.components ?? []
  const componentsB = analysisB?.results?.components ?? []

  // תכונות אישיות
  const traitsA = new Set(analysisA?.results?.personality_traits ?? [])
  const traitsB = new Set(analysisB?.results?.personality_traits ?? [])
  const traitsOnlyA = [...traitsA].filter((t) => !traitsB.has(t))
  const traitsOnlyB = [...traitsB].filter((t) => !traitsA.has(t))
  const traitsBoth = [...traitsA].filter((t) => traitsB.has(t))

  return (
    <Card className="border-outline-variant/5 bg-surface-container" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-primary font-headline">השוואת ניתוחים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* בחירת ניתוחים */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnalysisSelect
            label="דגימה A"
            analyses={analyses}
            selectedId={idA}
            onSelect={setIdA}
            excludeId={idB}
          />
          <AnalysisSelect
            label="דגימה B"
            analyses={analyses}
            selectedId={idB}
            onSelect={setIdB}
            excludeId={idA}
          />
        </div>

        {/* טבלת השוואת מרכיבים */}
        {analysisA && analysisB && componentsA.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-headline font-semibold text-primary">השוואת מרכיבים</h3>
            <div className="space-y-2">
              {componentsA.map((compA) => {
                const compB = componentsB.find((c) => c.name === compA.name)
                const scoreB = compB?.score_1_to_10 ?? null
                const delta = scoreB !== null ? scoreB - compA.score_1_to_10 : null

                return (
                  <div
                    key={compA.name}
                    className="flex items-center gap-3 p-2 rounded-lg border border-outline-variant/20 bg-surface-container-high/30"
                  >
                    {/* שם המרכיב */}
                    <span className="flex-1 text-xs text-on-surface">{compA.name}</span>

                    {/* ציון A */}
                    <Badge className="bg-primary-container/20 text-primary border-outline-variant/20 font-label text-xs min-w-[3rem] justify-center">
                      {compA.score_1_to_10}/10
                    </Badge>

                    {/* אייקון דלתא */}
                    {delta !== null && (
                      <div className="flex items-center gap-1">
                        <DeltaIcon delta={delta} />
                        <span className={`text-xs font-medium ${
                          delta > 0 ? 'text-tertiary' : delta < 0 ? 'text-error' : 'text-on-surface-variant/80'
                        }`}>
                          {delta > 0 ? `+${delta}` : delta}
                        </span>
                      </div>
                    )}

                    {/* ציון B */}
                    <Badge className={`font-label text-xs min-w-[3rem] justify-center ${
                      delta === null
                        ? 'bg-surface-container-high text-on-surface-variant'
                        : delta > 0
                        ? 'bg-tertiary/10 text-tertiary border-tertiary/20'
                        : delta < 0
                        ? 'bg-error/10 text-error border-error/20'
                        : 'bg-surface-container-high/20 text-on-surface-variant'
                    }`}>
                      {scoreB !== null ? `${scoreB}/10` : '—'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* השוואת תכונות אישיות */}
        {analysisA && analysisB && (
          <div className="space-y-3">
            <h3 className="text-sm font-headline font-semibold text-primary">תכונות אישיות</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* תכונות בדגימה A בלבד */}
              <div className="space-y-1.5">
                <p className="text-xs font-label font-medium text-primary">דגימה A בלבד</p>
                {traitsOnlyA.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {traitsOnlyA.map((t) => (
                      <Badge key={t} className="bg-primary-container/20 text-primary border-outline-variant/20 font-label text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant/80">—</p>
                )}
              </div>

              {/* תכונות משותפות */}
              <div className="space-y-1.5">
                <p className="text-xs font-label font-medium text-on-surface-variant">משותפות</p>
                {traitsBoth.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {traitsBoth.map((t) => (
                      <Badge key={t} className="bg-surface-container-high text-on-surface-variant border-outline-variant/20 font-label text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant/80">—</p>
                )}
              </div>

              {/* תכונות בדגימה B בלבד */}
              <div className="space-y-1.5">
                <p className="text-xs font-label font-medium text-secondary">דגימה B בלבד</p>
                {traitsOnlyB.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {traitsOnlyB.map((t) => (
                      <Badge key={t} className="bg-secondary-container/20 text-secondary border-outline-variant/20 font-label text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant/80">—</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* הוראות אם לא נבחרו */}
        {(!analysisA || !analysisB) && (
          <p className="text-xs text-on-surface-variant/80 text-center py-4">
            בחר שני ניתוחים להשוואה
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default GraphologyCompare
