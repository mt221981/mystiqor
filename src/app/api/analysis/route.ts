/**
 * API Route: ניתוחים — יצירה ושליפה
 * POST /api/analysis — יצירת ניתוח חדש
 * GET /api/analysis — שליפת רשימת ניתוחים (עם pagination)
 */
import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AnalysisCreateSchema, AnalysisQuerySchema } from '@/lib/validations/analysis';
import type { TablesInsert } from '@/types/database';
import { zodValidationError } from '@/lib/utils/api-error';

/** יצירת ניתוח חדש */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = AnalysisCreateSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError('נתונים לא תקינים', parsed.error.flatten());
    }

    const row: TablesInsert<'analyses'> = {
      user_id: user.id,
      tool_type: parsed.data.tool_type,
      input_data: JSON.parse(JSON.stringify(parsed.data.input_data)),
      results: JSON.parse(JSON.stringify(parsed.data.results)),
      summary: parsed.data.summary ?? null,
      confidence_score: parsed.data.confidence_score ?? null,
    };

    const { data, error } = await supabase
      .from('analyses')
      .insert(row)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: 'שגיאה בשמירת ניתוח' }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}

/** שליפת רשימת ניתוחים */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = AnalysisQuerySchema.safeParse(params);

    const limit = parsed.success ? (parsed.data.limit ?? 20) : 20;
    const offset = parsed.success ? (parsed.data.offset ?? 0) : 0;
    const toolType = parsed.success ? parsed.data.tool_type : undefined;
    const includeResults = parsed.success ? parsed.data.include_results === 'true' : false;

    const from = offset;
    const to = from + limit - 1;

    const selectFields = includeResults
      ? 'id, tool_type, summary, confidence_score, created_at, results, input_data'
      : 'id, tool_type, summary, confidence_score, created_at';

    let query = supabase
      .from('analyses')
      .select(selectFields, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (toolType) {
      query = query.eq('tool_type', toolType);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ error: 'שגיאה בשליפת ניתוחים' }, { status: 500 });
    }

    return NextResponse.json({
      data: data ?? [],
      meta: { offset, limit, total: count ?? 0 },
    });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
