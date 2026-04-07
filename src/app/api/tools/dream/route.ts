/**
 * POST /api/tools/dream — שמירת חלום מיידית + ניתוח AI אסינכרוני
 * Pattern: שמור מיד → החזר { dream_id, status: 'processing' } → LLM ב-background
 * Note: Vercel Edge timeout is 10s; we return before LLM call completes.
 *       The async work continues via the Vercel background task pattern (waitUntil).
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { invokeLLM } from '@/services/analysis/llm';
import { getPersonalContext } from '@/services/analysis/personal-context';
import type { TablesInsert } from '@/types/database';
import { zodValidationError } from '@/lib/utils/api-error';
import { checkUsageQuota } from '@/lib/utils/usage-guard';

export const maxDuration = 30

/** JSON schema for dream LLM response — JSON mode */
const DREAM_RESPONSE_JSON_SCHEMA = {
  type: 'object',
  properties: { interpretation: { type: 'string' } },
  required: ['interpretation'],
} as const

/** Zod schema — validates non-empty dream interpretation */
const DreamSimpleSchema = z.object({
  interpretation: z.string().min(10, 'תגובת AI קצרה מדי'),
})

// ===== סכמת קלט =====

/** סכמת בדיקת קלט לדף ניתוח חלומות */
export const DreamInputSchema = z.object({
  title: z.string().min(1, 'כותרת חובה').max(100, 'כותרת ארוכה מדי — מקסימום 100 תווים'),
  description: z.string().min(10, 'תיאור קצר מדי — לפחות 10 תווים').max(2000, 'תיאור ארוך מדי — מקסימום 2000 תווים'),
  dreamDate: z.string().default(new Date().toISOString().split('T')[0] ?? ''),
  emotions: z.array(z.string()).max(10, 'מקסימום 10 רגשות').default([]),
  symbols: z.array(z.string()).max(10, 'מקסימום 10 סמלים').default([]),
  generateImage: z.boolean().default(false),
});

// ===== POST — שמירת חלום + LLM אסינכרוני =====

/** שומר חלום מיידית ומחזיר { dream_id, status: 'processing' } — LLM רץ ב-background */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    // בדיקת מכסת שימוש — STAB-01
    const guard = await checkUsageQuota(supabase, user.id)
    if (!guard.allowed) return guard.response

    // שליפת הקשר אישי לפני עבודת הרקע — סוגרים על ctx בסגור
    // חשוב (Pitfall 3): לא שולפים בתוך backgroundWork — חייב להיות בhandler הראשי
    const ctx = await getPersonalContext(supabase, user.id);

    const body = await request.json() as unknown;
    const parsed = DreamInputSchema.safeParse(body);
    if (!parsed.success) {
      return zodValidationError('קלט לא תקין', parsed.error.flatten());
    }

    // שלב 1: שמירת חלום מיידית עם ai_interpretation=null
    const dreamRow: TablesInsert<'dreams'> = {
      user_id: user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      dream_date: parsed.data.dreamDate,
      emotions: parsed.data.emotions,
      symbols: parsed.data.symbols,
      ai_interpretation: null,
    };

    const { data: dream, error: insertError } = await supabase
      .from('dreams')
      .insert(dreamRow)
      .select('id')
      .single();

    if (insertError || !dream) {
      return NextResponse.json({ error: 'שגיאה בשמירת החלום' }, { status: 500 });
    }

    // שלב 2: החזרת תשובה מיידית — AI עובד ב-background
    const dreamId = dream.id;
    const dreamData = parsed.data;
    const userId = user.id;

    // בניית systemPrompt מועשר — שפה קבלית-מיסטית עם פנייה אישית
    const personalLine = ctx.firstName
      ? `אתה פונה אל ${ctx.firstName} — ממזל ${ctx.zodiacSign}, מספר חיים ${ctx.lifePathNumber}.`
      : ''

    const dreamSystemPrompt = `אתה מפרש חלומות מיסטי-קבלי שרואה את השפה הסמלית של הנשמה.
${personalLine}
שלב בין פסיכולוגיה עמוקה (יונג, פרויד) לבין חכמה קבלית — חלומות כמסרים מעולם היצירה.
כל סמל בחלום הוא נתיב בעץ החיים. ענה בעברית, בשפה חמה ואינטימית.`

    // עבודת רקע אסינכרונית (fire-and-forget — שגיאות נלכדות פנימית)
    const backgroundWork = async () => {
      try {
        const interpretation = await invokeLLM<{ interpretation: string }>({
          systemPrompt: dreamSystemPrompt,
          prompt: `חלום: "${dreamData.description}". רגשות: ${dreamData.emotions.join(', ')}. סמלים: ${dreamData.symbols.join(', ')}.\n\nענה בפורמט JSON עם שדה "interpretation" בלבד.`,
          maxTokens: 800,
          userId,
          responseSchema: DREAM_RESPONSE_JSON_SCHEMA,
          zodSchema: DreamSimpleSchema,
        });

        // ולידציית תגובת LLM — STAB-04
        if (interpretation.validationResult && !interpretation.validationResult.success) {
          const updateSupabase2 = await createClient()
          await updateSupabase2
            .from('dreams')
            .update({ ai_interpretation: 'לא ניתן לנתח את החלום כרגע — נסה שוב' })
            .eq('id', dreamId)
          return
        }

        // עדכון רשומת החלום עם הפרשנות
        const updateSupabase = await createClient();

        // שמירת ניתוח ב-analyses — STAB-05
        const analysisRow: TablesInsert<'analyses'> = {
          user_id: userId,
          tool_type: 'dream',
          input_data: JSON.parse(JSON.stringify({
            title: dreamData.title,
            description: dreamData.description,
            emotions: dreamData.emotions,
            symbols: dreamData.symbols,
          })),
          results: JSON.parse(JSON.stringify({ interpretation: interpretation.data.interpretation, dream_id: dreamId })),
          summary: `פרשנות חלום: ${dreamData.title}`,
        }
        const { error: insertError } = await updateSupabase
          .from('analyses')
          .insert(analysisRow)
          .select('id')
          .single()

        if (insertError) {
          console.error('[dream] שגיאת שמירת ניתוח:', insertError)
          await updateSupabase.from('dreams').update({
            ai_interpretation: 'לא ניתן לשמור את הניתוח — נסה שוב'
          }).eq('id', dreamId)
          return
        }

        await updateSupabase
          .from('dreams')
          .update({ ai_interpretation: interpretation.data.interpretation })
          .eq('id', dreamId);
      } catch {
        // לכידה שקטה — כשלון בעבודת הרקע לא אמור להשפיע על המשתמש
      }
    };

    backgroundWork(); // intentional floating promise — this is the fire-and-forget pattern

    return NextResponse.json({ data: { dream_id: dreamId, status: 'processing' } });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 });
  }
}

// ===== GET — שליפת פרשנות חלום לפולינג =====

/** מחזיר סטטוס הפרשנות לחלום לפי id — משמש ל-polling מהדף */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'חסר מזהה חלום' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
    }

    const { data: dream } = await supabase
      .from('dreams')
      .select('ai_interpretation, title')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    return NextResponse.json({ data: dream });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית בשרת' }, { status: 500 });
  }
}
