/**
 * API Route: עדכון שימוש
 * POST /api/subscription/usage — מגדיל מונה ניתוחים ב-1
 * משתמש ב-RPC increment_usage למניעת race conditions
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { llmRateLimit, checkRateLimit } from '@/lib/rate-limit';

/** סכמת תוצאת RPC — מחליפה type assertion לא בטוח */
const UsageRPCResultSchema = z.object({
  success: z.boolean(),
  new_count: z.number().int().nonnegative(),
  limit: z.number().int(),
});

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // הגבלת קצב — חסימה לפני שימוש ב-RPC
    const allowed = await checkRateLimit(llmRateLimit, user.id);
    if (!allowed) {
      return NextResponse.json(
        { error: 'יותר מדי בקשות — נסה שוב בעוד דקה' },
        { status: 429 }
      );
    }

    const { data, error } = await supabase.rpc('increment_usage', {
      p_user_id: user.id,
    });

    if (error) {
      if (error.message.includes('Usage limit reached')) {
        return NextResponse.json({ error: 'הגעת למגבלת השימוש' }, { status: 429 });
      }
      return NextResponse.json({ error: 'שגיאה בעדכון שימוש' }, { status: 500 });
    }

    const parsed = UsageRPCResultSchema.safeParse(data);
    if (!parsed.success) {
      console.error('Usage RPC returned unexpected shape', data, parsed.error.issues);
      return NextResponse.json({ error: 'שגיאה בעדכון שימוש' }, { status: 500 });
    }

    return NextResponse.json({
      new_count: parsed.data.new_count,
      limit: parsed.data.limit,
    });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
