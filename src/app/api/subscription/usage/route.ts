/**
 * API Route: עדכון שימוש
 * POST /api/subscription/usage — מגדיל מונה ניתוחים ב-1
 * משתמש ב-RPC increment_usage למניעת race conditions
 */
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
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

    const result = data as { success: boolean; new_count: number; limit: number } | null;

    return NextResponse.json({
      new_count: result?.new_count ?? 0,
      limit: result?.limit ?? 3,
    });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
