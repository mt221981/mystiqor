/**
 * דף שיתוף ניתוח — ציבורי, ללא אימות
 * מציג ניתוח משותף לפי טוקן ייחודי
 */
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { TOOL_NAMES_HE } from '@/components/features/export/pdf-styles'

interface SharePageProps {
  params: Promise<{ token: string }>
}

/** מטה-נתונים דינמיים לתצוגה ברשתות חברתיות */
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  const { token } = await params
  const adminClient = createAdminClient()

  const { data } = await adminClient
    .from('analyses')
    .select('tool_type, summary')
    .eq('share_token', token)
    .eq('is_public', true)
    .single()

  if (!data) {
    return { title: 'ניתוח לא נמצא — MystiQor' }
  }

  const toolName = TOOL_NAMES_HE[data.tool_type] ?? data.tool_type

  return {
    title: `MystiQor — ניתוח ${toolName}`,
    description: data.summary ?? `ניתוח ${toolName} מ-MystiQor`,
    openGraph: {
      title: `MystiQor — ניתוח ${toolName}`,
      description: data.summary ?? `ניתוח ${toolName} מ-MystiQor`,
      type: 'article',
    },
  }
}

/**
 * מסיר תכונות nested רקורסיבית עד עומק 3
 * מחזיר אלמנטי JSX לתצוגה
 */
function renderValue(
  value: unknown,
  depth = 0
): React.ReactNode {
  if (depth >= 3 || value == null) return null

  if (typeof value === 'string' || typeof value === 'number') {
    return <span>{String(value)}</span>
  }

  if (Array.isArray(value)) {
    return (
      <ul className="list-disc list-inside space-y-1 me-4">
        {value.filter(Boolean).map((item, i) => (
          <li key={i} className="text-sm text-foreground">
            {String(item)}
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === 'object') {
    return (
      <div className="space-y-2">
        {Object.entries(value as Record<string, unknown>)
          .filter(([, v]) => v != null)
          .map(([key, v]) => (
            <div key={key}>
              <span className="text-xs font-medium text-muted-foreground">{key}</span>
              <div className="ms-2 text-sm">{renderValue(v, depth + 1)}</div>
            </div>
          ))}
      </div>
    )
  }

  return null
}

/** דף שיתוף ניתוח ציבורי */
export default async function SharePage({ params }: SharePageProps) {
  const { token } = await params
  const adminClient = createAdminClient()

  const { data: analysis } = await adminClient
    .from('analyses')
    .select('tool_type, summary, results, created_at')
    .eq('share_token', token)
    .eq('is_public', true)
    .single()

  if (!analysis) {
    notFound()
  }

  const toolName = TOOL_NAMES_HE[analysis.tool_type] ?? analysis.tool_type
  const dateStr = new Date(analysis.created_at).toLocaleDateString('he-IL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-10 px-4" dir="rtl">
      {/* כותרת */}
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-primary">MystiQor</h1>
        <p className="text-muted-foreground text-sm mt-1">גלה את עצמך</p>
      </div>

      {/* כרטיס ניתוח */}
      <div className="w-full max-w-2xl bg-card rounded-lg p-6 shadow space-y-4">
        <div className="border-b pb-4">
          <h2 className="text-xl font-semibold">{toolName}</h2>
          <p className="text-sm text-muted-foreground">{dateStr}</p>
        </div>

        {analysis.summary && (
          <div>
            <h3 className="font-medium mb-2">סיכום</h3>
            <p className="text-sm text-foreground">{analysis.summary}</p>
          </div>
        )}

        <div>
          <h3 className="font-medium mb-2">תוצאות</h3>
          <div className="text-sm space-y-2">
            {renderValue(analysis.results as Record<string, unknown>)}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 text-center">
        <p className="text-muted-foreground mb-3 text-sm">
          רוצה ניתוח מיסטי משלך?
        </p>
        <Link
          href="/login"
          className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity"
        >
          הרשמו ב-MystiQor
        </Link>
      </div>
    </div>
  )
}
