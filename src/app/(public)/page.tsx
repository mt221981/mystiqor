/**
 * דף הבית — מציג ToolGrid + widget של תובנה יומית.
 * משמש גם כ-landing page לאנונימיים וגם כ-home למחוברים.
 * אנונימיים מופנים ל-/login; מחוברים רואים ToolGrid + DailyInsightWidget.
 */

import { redirect } from 'next/navigation';
import { CalendarDays } from 'lucide-react';

import { createClient } from '@/lib/supabase/server';
import { ToolGrid } from '@/components/features/shared/ToolGrid';

// ===== קומפוננטה פנימית: widget תובנה יומית =====

/**
 * Widget תובנה יומית — placeholder עד Phase 3
 * מציג הודעת "בקרוב" עם אייקון לוח שנה
 */
function DailyInsightWidget() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
        <CalendarDays className="h-6 w-6 text-primary" />
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground">תובנה יומית</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          תובנה יומית תהיה זמינה בקרוב
        </p>
      </div>
    </div>
  );
}

// ===== דף הבית =====

/** דף הבית המחובר — ToolGrid + DailyInsightWidget */
export default async function HomePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  /** אנונימיים — הפניה לדף כניסה */
  if (!user) {
    redirect('/login');
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* תובנה יומית */}
      <DailyInsightWidget />

      {/* כותרת כלים */}
      <div>
        <h2 className="text-xl font-bold text-foreground">הכלים שלנו</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          בחר כלי להתחיל בניתוח
        </p>
      </div>

      {/* רשת כלים */}
      <ToolGrid />
    </div>
  );
}
