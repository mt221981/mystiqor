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
import type { TablesInsert } from '@/types/database';

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

    const body = await request.json() as unknown;
    const parsed = DreamInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
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

    // עבודת רקע אסינכרונית (fire-and-forget — שגיאות נלכדות פנימית)
    const backgroundWork = async () => {
      try {
        const interpretation = await invokeLLM<string>({
          systemPrompt: 'אתה פסיכולוג חלומות. נתח את החלום לפי תיאוריות פסיכואנליטיות. התמקד בסמלים, רגשות ומסרים פנימיים. אל תיתן ניבוי גורל.',
          prompt: `חלום: "${dreamData.description}". רגשות: ${dreamData.emotions.join(', ')}. סמלים: ${dreamData.symbols.join(', ')}.`,
          maxTokens: 800,
          userId,
        });
        // עדכון רשומת החלום עם הפרשנות
        const updateSupabase = await createClient();
        await updateSupabase
          .from('dreams')
          .update({ ai_interpretation: interpretation.data })
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
