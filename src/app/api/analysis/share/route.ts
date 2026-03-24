/**
 * API Route: שיתוף ניתוח
 * POST /api/analysis/share — יצירת קישור שיתוף לניתוח
 * GET /api/analysis/share?token=UUID — שליפת ניתוח משותף לפי טוקן
 */
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ShareAnalysisSchema, ShareTokenSchema } from '@/lib/validations/analysis'

/** יצירת קישור שיתוף לניתוח — מחייב אימות ובעלות על הניתוח */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = ShareAnalysisSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'נתונים לא תקינים', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { analysis_id } = parsed.data

    // בדיקת בעלות — הניתוח חייב להיות של המשתמש המחובר
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('id, share_token, user_id')
      .eq('id', analysis_id)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !analysis) {
      return NextResponse.json({ error: 'ניתוח לא נמצא' }, { status: 404 })
    }

    // עדכון is_public=true — share_token כבר נוצר אוטומטית ב-DB
    const { error: updateError } = await supabase
      .from('analyses')
      .update({ is_public: true })
      .eq('id', analysis_id)

    if (updateError) {
      return NextResponse.json({ error: 'שגיאה בעדכון הניתוח' }, { status: 500 })
    }

    // בניית URL שיתוף
    const origin =
      request.headers.get('origin') ?? request.headers.get('host') ?? ''
    const share_token = analysis.share_token

    return NextResponse.json({
      share_url: `${origin}/share/${share_token}`,
      share_token,
    })
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

/** שליפת ניתוח משותף לפי טוקן — ציבורי, ללא אימות */
export async function GET(request: NextRequest) {
  try {
    const tokenParam = request.nextUrl.searchParams.get('token')
    const parsed = ShareTokenSchema.safeParse({ token: tokenParam })

    if (!parsed.success) {
      return NextResponse.json({ error: 'טוקן לא תקין' }, { status: 400 })
    }

    const { token } = parsed.data

    // שימוש ב-admin client לעקוף RLS ולהחזיר ניתוח ציבורי בוודאות
    const adminClient = createAdminClient()
    const { data: analysis, error } = await adminClient
      .from('analyses')
      .select('*')
      .eq('share_token', token)
      .eq('is_public', true)
      .single()

    if (error || !analysis) {
      return NextResponse.json(
        { error: 'ניתוח לא נמצא או לא משותף' },
        { status: 404 }
      )
    }

    // הסרת user_id מהתגובה לשמירה על פרטיות
    const { user_id: _omitted, ...publicAnalysis } = analysis

    return NextResponse.json({ data: publicAnalysis })
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}
