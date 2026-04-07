/**
 * GET /api/tools/daily-insights — תובנה יומית עם cache לפי תאריך
 * cache-or-generate: אם קיימת תובנה ל-user_id + insight_date + mood_type='daily' — מחזיר אותה.
 * אחרת: מייצר קריאת LLM אחת המשלבת מזל + נומרולוגיה + טארוט + מספר חיים + ניתוחים קודמים.
 *
 * GET ?history=true — מחזיר 30 תובנות אחרונות בסדר יורד.
 */

import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { reduceToSingleDigit } from '@/services/numerology/calculations'
import { getPersonalContext } from '@/services/analysis/personal-context'
import { DailyInsightModulesSchema, DEFAULT_MODULES, type DailyInsightModules } from '@/lib/validations/daily-insights'
import type { TablesInsert } from '@/types/database'
import { checkUsageQuota } from '@/lib/utils/usage-guard'

export const maxDuration = 60

// ===== פונקציות עזר =====

/**
 * מחשב מספר נומרולוגי יומי
 * נוסחה: יום + חודש + שנה נוכחית (UTC), מצומצם ל-1-9 או 11/22/33
 * @param todayStr תאריך YYYY-MM-DD
 * @returns מספר נומרולוגי
 */
function getDayNumber(todayStr: string): number {
  const parts = todayStr.split('-').map(Number)
  const year = parts[0] ?? 0
  const month = parts[1] ?? 0
  const day = parts[2] ?? 0
  return reduceToSingleDigit(day + month + year)
}

/**
 * מנסה לחלץ "טיפ ליום" מהתשובה — הפסקה האחרונה של הטקסט
 * @param content תוכן ה-LLM
 * @returns הטיפ או null
 */
function extractTipFromContent(content: string): string | null {
  const paragraphs = content
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
  const lastParagraph = paragraphs[paragraphs.length - 1]
  if (!lastParagraph || lastParagraph.length < 20) return null
  // חסל prefix כמו "טיפ:" / "המלצה:"
  return lastParagraph.replace(/^(טיפ|המלצה|עצה)\s*[:：]\s*/i, '').trim() || null
}

/**
 * בונה prompt למשתמש לפי מודולים מופעלים, מספר חיים ותמצית ניתוחים קודמים
 * @param zodiacSign מזל המשתמש בעברית
 * @param dayNumber מספר נומרולוגי יומי
 * @param tarotCardName שם קלף הטארוט
 * @param modules מודולים מופעלים
 * @param lifePathNumber מספר חיים של המשתמש
 * @param priorSummary תמצית כותרות תובנות אחרונות (ריק אם אין)
 * @returns מחרוזת prompt
 */
function buildPrompt(
  zodiacSign: string,
  dayNumber: number,
  tarotCardName: string,
  modules: DailyInsightModules,
  lifePathNumber: number,
  priorSummary: string
): string {
  const sections: string[] = []
  if (modules.astrology) sections.push('תחזית אסטרולוגית')
  if (modules.numerology) sections.push('אנרגיה נומרולוגית')
  if (modules.tarot) sections.push('הודעת הטארוט')
  if (modules.recommendation) sections.push('המלצה אישית')

  const sectionsText = sections.length > 0 ? sections.join(', ') : 'תובנה כללית'

  return `צור תובנה יומית עמוקה ואישית בעברית עבור אדם ממזל ${zodiacSign}.
המספר הנומרולוגי של היום הוא ${dayNumber} — התייחס למשמעות הרוחנית שלו.
מספר החיים שלו הוא ${lifePathNumber} — התייחס למשמעותו הרוחנית העמוקה ולהשפעתו על יומו.
הקלף שנשלף עבורו היום הוא "${tarotCardName}" — שזור את המסר שלו בתובנה.
${priorSummary ? `\nנושאים מניתוחים אחרונים שלו: ${priorSummary}\nשלב אזכור עדין של נושאים אלו בתובנה.` : ''}
כלול את הסעיפים הבאים: ${sectionsText}.

הנחיות חשובות:
- כתוב כותרת מעוררת השראה בשורה הראשונה (ללא prefix)
- התחל בפניה ישירה ואישית — "היום, האנרגיה של..." או "הכוכבים מספרים..."
- שלב בין אסטרולוגיה, נומרולוגיה וטארוט לתמונה אחת שלמה
- הפוך את התובנה לרלוונטית ליום ממש — לא מליצות גנריות
- סיים בטיפ פעולה קונקרטי קצר בפסקה נפרדת, החל במילה "טיפ:"`
}

// ===== handler ראשי =====

/** GET /api/tools/daily-insights */
export async function GET(request: NextRequest) {
  try {
    // אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    const { searchParams } = new URL(request.url)

    // === מסלול היסטוריה ===
    if (searchParams.get('history') === 'true') {
      const { data: insights, error } = await supabase
        .from('daily_insights')
        .select('id, title, content, insight_date, actionable_tip, tarot, data_sources, created_at')
        .eq('user_id', user.id)
        .eq('mood_type', 'daily')
        .order('insight_date', { ascending: false })
        .limit(30)

      if (error) {
        console.error('[daily-insights] שגיאה בשליפת היסטוריה:', error)
        return NextResponse.json({ error: 'שגיאה בשליפת היסטוריה' }, { status: 500 })
      }

      return NextResponse.json({ data: insights ?? [] })
    }

    // === מסלול תובנה יומית ===

    // פרסור מודולים — query param ?modules={json}
    let modules: DailyInsightModules = DEFAULT_MODULES
    const modulesParam = searchParams.get('modules')
    if (modulesParam) {
      try {
        const parsed = JSON.parse(modulesParam) as unknown
        const validated = DailyInsightModulesSchema.safeParse(parsed)
        if (validated.success) {
          modules = validated.data
        }
      } catch {
        // מודולים לא תקינים — ממשיכים עם ברירת מחדל
      }
    }

    // תאריך היום ב-UTC (per Pitfall 3 — עקביות UTC)
    const today: string = new Date().toISOString().split('T')[0] ?? new Date().toISOString().substring(0, 10) // YYYY-MM-DD

    // === בדיקת cache ===
    const { data: existing, error: cacheError } = await supabase
      .from('daily_insights')
      .select('*')
      .eq('user_id', user.id)
      .eq('insight_date', today)
      .eq('mood_type', 'daily')
      .maybeSingle()

    if (cacheError) {
      console.error('[daily-insights] שגיאת cache:', cacheError)
      // ממשיכים לייצר תובנה חדשה
    }

    if (existing) {
      return NextResponse.json({ data: existing })
    }

    // === שליפת הקשר אישי (שם, מזל, מספר חיים) ===
    const ctx = await getPersonalContext(supabase, user.id)
    const zodiacSign = ctx.zodiacSign || 'טלה'
    const dayNumber = getDayNumber(today)

    // === שליפת תמצית תובנות קודמות (3 ימים אחרונים) ===
    let priorSummary = ''
    try {
      const { data: recentInsights } = await supabase
        .from('daily_insights')
        .select('title')
        .eq('user_id', user.id)
        .eq('mood_type', 'daily')
        .neq('insight_date', today)
        .order('insight_date', { ascending: false })
        .limit(3)
      if (recentInsights && recentInsights.length > 0) {
        priorSummary = (recentInsights as { title?: string | null }[])
          .map((i) => i.title ?? '')
          .filter(Boolean)
          .join(' | ')
      }
    } catch { /* graceful — no prior context */ }

    // === בחירת קלף טארוט אקראי ===
    let tarotCardName = 'הטוב הגדול' // fallback
    try {
      const { count } = await supabase
        .from('tarot_cards')
        .select('*', { count: 'exact', head: true })

      if (count && count > 0) {
        const randomOffset = Math.floor(Math.random() * count)
        const { data: tarotCards } = await supabase
          .from('tarot_cards')
          .select('name')
          .range(randomOffset, randomOffset)

        if (tarotCards && tarotCards.length > 0 && tarotCards[0]) {
          const card = tarotCards[0] as { name?: string }
          tarotCardName = card.name ?? tarotCardName
        }
      }
    } catch {
      // טבלת tarot_cards לא קיימת או ריקה — משתמשים ב-fallback
    }

    // === קריאת LLM יחידה (per Pitfall 7) ===
    const systemPrompt = `אתה מייעץ רוחני-מיסטי עמוק עם ידע בקבלה, אסטרולוגיה ונומרולוגיה.
אתה מדבר ישירות לנשמה — חם, אינטימי, חודר. כל מילה שלך מחוברת לאור אין-סוף.
${ctx.firstName ? `אתה פונה אל ${ctx.firstName} — ממזל ${zodiacSign}, מספר חיים ${ctx.lifePathNumber}. דבר אליו כאילו אתה מכיר אותו שנים.` : ''}
שלב רפרנסים לספירות עץ החיים ונתיבות החכמה כשרלוונטי — בשפה חמה, לא אקדמית.
פסקאות קצרות וברורות. ללא כוכביות (asterisks) מיותרות.`

    const prompt = buildPrompt(zodiacSign, dayNumber, tarotCardName, modules, ctx.lifePathNumber, priorSummary)

    const llmResponse = await invokeLLM({
      userId: user.id,
      systemPrompt,
      prompt,
      maxTokens: 1200,
    })

    const llmText = String(llmResponse.data)

    // חילוץ כותרת — שורה ראשונה
    const lines = llmText.split('\n').filter((l) => l.trim())
    const title = lines[0]?.replace(/^[#*]+\s*/, '').trim() ?? 'תובנה יומית'
    const content = lines.slice(1).join('\n').trim() || llmText

    const actionableTip = extractTipFromContent(content)

    // === שמירת cache ===
    const row: TablesInsert<'daily_insights'> = {
      user_id: user.id,
      insight_date: today,
      mood_type: 'daily',
      title,
      content,
      tarot: JSON.parse(JSON.stringify({ card: tarotCardName })),
      data_sources: JSON.parse(JSON.stringify(modules)),
      actionable_tip: actionableTip,
    }

    const { data: inserted, error: insertError } = await supabase
      .from('daily_insights')
      .insert(row)
      .select('*')
      .single()

    if (insertError) {
      console.error('[daily-insights] שגיאת שמירה:', insertError)
      // מחזירים את הנתון גם אם לא נשמר
      return NextResponse.json({ data: { ...row, id: '', created_at: new Date().toISOString() } })
    }

    return NextResponse.json({ data: inserted })
  } catch (error) {
    console.error('[daily-insights] שגיאה:', error)
    return NextResponse.json({ error: 'שגיאה בייצור תובנה יומית' }, { status: 500 })
  }
}
