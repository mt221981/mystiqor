/**
 * הוקים לעקיבה אנליטית — מעקב צפיות בדפים ושימוש בכלים
 * שולח events לטבלת analytics_events בסופאבייס
 * מיועד לשימוש בצד הלקוח בלבד ('use client')
 */

'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

/**
 * עוקב אחר צפיות בדפים — מופעל אוטומטית בשינוי URL
 * שליחה אסינכרונית לא חוסמת את ה-UI
 * יש לקרוא להוק זה בקומפוננטה שמוצגת בכל הדפים (layout)
 */
export function usePageTracking(): void {
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;

      // שליחה אסינכרונית — כישלון בעקיבה לא אמור לשבור את ה-UI
      void supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: 'page_view',
        page_url: pathname,
        event_data: {},
      });
    });
  }, [pathname]);
}

/**
 * מחזיר פונקציה לעקיבה אחר שימוש בכלי ניתוח
 * יש לקרוא ל-trackTool בעת לחיצה על כלי או הפעלת ניתוח
 * @returns אובייקט עם פונקציית trackTool
 */
export function useToolTracking(): { trackTool: (toolType: string, metadata?: Record<string, unknown>) => Promise<void> } {
  const trackTool = useCallback(
    async (toolType: string, metadata: Record<string, unknown> = {}): Promise<void> => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      await supabase.from('analytics_events').insert({
        user_id: user.id,
        event_type: 'tool_usage',
        page_url: `/tools/${toolType}`,
        event_data: { tool_type: toolType, ...metadata },
      });
    },
    []
  );

  return { trackTool };
}
