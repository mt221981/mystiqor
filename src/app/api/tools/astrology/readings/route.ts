/**
 * POST /api/tools/astrology/readings — 8 סוגי קריאות אסטרולוגיות
 * מנתב לפי readingType לתבנית prompt מתאימה
 * תנאי מוקדם: המשתמש חייב להיות בעל מפת לידה שמורה (tool_type: 'astrology')
 */

import { NextResponse, type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { invokeLLM } from '@/services/analysis/llm'
import { INTERPRETATION_SYSTEM_PROMPT } from '@/services/astrology/prompts/interpretation'
import { getPersonalContext } from '@/services/analysis/personal-context'
import type { TablesInsert } from '@/types/database'

import { READING_TYPES, type ReadingTypeId } from '@/lib/constants/readings'

// ===== סכמות ולידציה =====

/** סכמת ולידציה לקלט קריאה אסטרולוגית */
const ReadingInputSchema = z.object({
  readingType: z.enum([
    'birth_chart', 'monthly', 'yearly', 'transits',
    'compatibility', 'relationship', 'career', 'question',
  ]),
  /** לסוג monthly — מספר חודש (1-12) */
  month: z.number().int().min(1).max(12).optional(),
  /** לסוגים monthly/yearly — שנה */
  year: z.number().int().min(2020).max(2030).optional(),
  /** לסוג transits — תאריך ספציפי */
  date: z.string().optional(),
  /** לסוגים compatibility/relationship — שאלה ספציפית */
  question: z.string().max(500).optional(),
  /** לסוגים compatibility/relationship — שם האדם השני */
  person2Name: z.string().optional(),
})

/** טיפוס קלט הקריאה */
type ReadingInput = z.infer<typeof ReadingInputSchema>

// ===== נתוני מפת לידה מינימלית לבניית פרומפט =====

/** נתוני נטאל מינימליים לבניית פרומפט הקריאה */
interface NatalSummary {
  sunSign: string
  moonSign: string
  risingSign: string
}

// ===== פונקציות עזר =====

/**
 * בונה פרומפט מותאם לפי סוג הקריאה ונתוני הנטאל
 * @param type - סוג הקריאה
 * @param natal - נתוני מפת הלידה
 * @param input - קלט הקריאה עם שדות נוספים
 * @returns מחרוזת פרומפט לשליחה ל-LLM
 */
function buildReadingPrompt(type: ReadingTypeId, natal: NatalSummary, input: ReadingInput): string {
  const base = `מפת לידה: שמש ב${natal.sunSign}, ירח ב${natal.moonSign}, עולה ב${natal.risingSign}.`
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  switch (type) {
    case 'monthly':
      return `${base} תן תחזית אסטרולוגית מפורטת לחודש ${input.month ?? currentMonth}/${input.year ?? currentYear}. כלול: אירועים אנרגטיים עיקריים, המלצות לניצול האנרגיה, אתגרים צפויים, ותחומי חיים להתמקד בהם.`
    case 'yearly':
      return `${base} תן תחזית אסטרולוגית שנתית מלאה לשנת ${input.year ?? currentYear}. כלול: ציר מרכזי של השנה, הזדמנויות גדולות, אתגרים עיקריים, ומחזורים פלנטריים חשובים.`
    case 'transits':
      return `${base} נתח את הטרנזיטים הפלנטריים${input.date ? ` לתאריך ${input.date}` : ' לתקופה הנוכחית'}. כלול: טרנזיטים פעילים, שילובים משמעותיים, תזמון אירועים.`
    case 'compatibility':
      return `${base} ${input.person2Name ? `נתח תאימות עם ${input.person2Name}.` : 'נתח דפוסי תאימות כלליים לפי מפת הלידה.'} כלול: מאפייני הקשר האידיאלי, מכשולים נפוצים, המלצות.`
    case 'relationship':
      return `${base} ${input.person2Name ? `נתח דינמיקת יחסים עם ${input.person2Name}.` : 'נתח דינמיקת יחסים לפי מפת הלידה.'} כלול: דפוסי קשר, כימיה, אתגרים ודרכי התמודדות.`
    case 'career':
      return `${base} נתח את הפוטנציאל הקריירתי לפי מפת הלידה. כלול: נקודות חוזק מקצועיות, נתיבי קריירה מתאימים, אתגרים, וזמן אידיאלי לשינויים.`
    case 'question':
      return `${base} שאלה: ${input.question ?? 'מה המסר הכללי של מפת הלידה לתקופה הנוכחית?'}. ענה בצורה ממוקדת ואישית בהתבסס על מפת הלידה.`
    default:
      // birth_chart — פרשנות כללית של מפת הלידה
      return `${base} תן פרשנות מקיפה של מפת הלידה. כלול: מהות השמש, עולם הרגשות (ירח), מסכה חיצונית (עולה), חוזקות מרכזיות, ואתגרים עיקריים.`
  }
}

/**
 * מפרסר את תגובת ה-LLM לסיכום ופרקים
 * אם יש כותרות ## — מפצל לפרקים נפרדים
 * אחרת — מחזיר הכל כסיכום
 * @param raw - תגובת LLM גולמית
 * @returns אובייקט עם summary ו-sections
 */
function parseReadingResponse(raw: string): {
  summary: string
  sections: Array<{ title: string; content: string }>
} {
  const text = raw.trim()

  // חיפוש כותרות ## לפיצול לפרקים
  const headingPattern = /^##\s+(.+)$/m
  if (!headingPattern.test(text)) {
    // אין כותרות — הכל כסיכום
    const lines = text.split('\n').filter(l => l.trim())
    const summary = lines.slice(0, 3).join(' ')
    return { summary, sections: [] }
  }

  // פיצול לפי כותרות ##
  const parts = text.split(/^##\s+/m).filter(p => p.trim())
  const sections: Array<{ title: string; content: string }> = []

  // הפרק הראשון הוא הסיכום (לפני הכותרת הראשונה)
  const firstBreak = text.indexOf('\n## ')
  const summaryText = firstBreak > 0 ? text.slice(0, firstBreak).trim() : parts[0] ?? ''

  // שאר החלקים הם פרקים
  for (const part of parts) {
    const newlineIndex = part.indexOf('\n')
    if (newlineIndex < 0) continue
    const title = part.slice(0, newlineIndex).trim()
    const content = part.slice(newlineIndex + 1).trim()
    if (title && content) {
      sections.push({ title, content })
    }
  }

  return {
    summary: summaryText || (sections[0]?.content.slice(0, 200) ?? 'קריאה אסטרולוגית'),
    sections: sections.length > 0 ? sections : [],
  }
}

// ===== POST handler =====

/** POST /api/tools/astrology/readings — קריאה אסטרולוגית מותאמת אישית */
export async function POST(request: NextRequest) {
  try {
    // שלב 1: אימות משתמש
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    // שלב 2: ולידציה של הקלט
    const body: unknown = await request.json()
    const parsed = ReadingInputSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'קלט לא תקין', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const input = parsed.data

    // שלב 3: שליפת הקשר אישי
    const ctx = await getPersonalContext(supabase, user.id)

    // שלב 4: שליפת מפת לידה נטאלית — תנאי מוקדם
    const { data: natalAnalysis } = await supabase
      .from('analyses')
      .select('results, created_at')
      .eq('user_id', user.id)
      .eq('tool_type', 'astrology')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (!natalAnalysis?.results) {
      return NextResponse.json(
        { error: 'יש לבצע תחילה מפת לידה — עבור לדף האסטרולוגיה' },
        { status: 422 }
      )
    }

    // שלב 5: חילוץ נתוני נטאל מהתוצאות
    const natalResults = natalAnalysis.results as Record<string, unknown>
    const natalPlanets = natalResults['planetDetails'] as Array<{
      name: string
      sign: string
    }> | undefined

    const natalChartData = natalResults['chartData'] as { ascendant?: number } | undefined

    const sunPlanet = natalPlanets?.find(p => p.name === 'sun')
    const moonPlanet = natalPlanets?.find(p => p.name === 'moon')

    // חילוץ מזל עולה מהנתונים
    let risingSign = 'Aries'
    if (natalChartData?.ascendant !== undefined) {
      const signIndex = Math.floor(((natalChartData.ascendant % 360) + 360) % 360 / 30)
      const SIGNS = ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
      risingSign = SIGNS[Math.min(signIndex, 11)] ?? 'Aries'
    }

    const natal: NatalSummary = {
      sunSign: sunPlanet?.sign ?? 'Aries',
      moonSign: moonPlanet?.sign ?? 'Cancer',
      risingSign,
    }

    // שלב 6: בניית פרומפט מותאם לסוג הקריאה
    const readingPrompt = buildReadingPrompt(input.readingType as ReadingTypeId, natal, input)

    // מציאת תווית הסוג בעברית
    const readingTypeDef = READING_TYPES.find(rt => rt.id === input.readingType)
    const typeLabel = readingTypeDef?.label ?? input.readingType

    // שלב 7: קריאת LLM
    const systemPrompt = `${INTERPRETATION_SYSTEM_PROMPT}
${ctx.firstName ? `אתה פונה אל ${ctx.firstName}, ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.` : ''}
בנה את התגובה עם כותרות ## לפרקים שונים. ענה בעברית בלבד.`

    const llmResponse = await invokeLLM<string>({
      userId: user.id,
      systemPrompt,
      prompt: readingPrompt,
      maxTokens: 2500,
    })

    const rawResponse = String(llmResponse.data)

    // שלב 8: פרסור התגובה לסיכום + פרקים
    const { summary, sections } = parseReadingResponse(rawResponse)

    // שלב 9: שמירה ב-DB
    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: 'astrology',
      input_data: JSON.parse(JSON.stringify({ ...input })),
      results: JSON.parse(JSON.stringify({
        readingType: input.readingType,
        typeLabel,
        summary,
        sections,
        rawResponse,
      })),
      summary: `קריאה אסטרולוגית: ${typeLabel} — שמש ב${natal.sunSign}`,
    }

    const { data: analysis } = await supabase
      .from('analyses')
      .insert(row)
      .select('id')
      .single()

    // שלב 10: החזרה
    return NextResponse.json({
      data: {
        readingType: input.readingType,
        typeLabel,
        summary,
        sections,
        analysis_id: analysis?.id ?? null,
        createdAt: new Date().toISOString(),
      },
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה בקריאה האסטרולוגית' }, { status: 500 })
  }
}
