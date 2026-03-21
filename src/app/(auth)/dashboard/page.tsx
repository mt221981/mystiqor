'use client';

/**
 * לוח הבקרה — מציג סטטיסטיקות אמיתיות מ-Supabase: ניתוחים, מטרות, מצב רוח, תזכורות.
 * משתמש ב-Promise.allSettled לשאילתות מקבילות + Recharts ל-chart (דרך AnalysesChart).
 */

import { useQuery } from '@tanstack/react-query';
import { Sparkles, Target, SmilePlus, Bell } from 'lucide-react';

import { createClient } from '@/lib/supabase/client';
import { CACHE_TIMES } from '@/lib/query/cache-config';
import { Skeleton } from '@/components/ui/skeleton';
import { AnalysesChart, type ChartDataPoint } from '@/components/features/shared/AnalysesChart';

// ===== טיפוסים =====

/** שורת ניתוח בסיסית לתרשים */
interface AnalysisRow {
  id: string;
  tool_type: string;
  created_at: string;
}

/** נתוני הדשבורד */
interface DashboardStats {
  analysesCount: number;
  goalsCount: number;
  moodCount: number;
  remindersCount: number;
  recentAnalyses: AnalysisRow[];
}

// ===== קבועים =====

/** הגדרות כרטיסי סטטיסטיקות */
const STAT_CARDS = [
  { key: 'analysesCount' as const, label: 'ניתוחים', description: 'ניתוחים שבוצעו', Icon: Sparkles, gradient: 'from-purple-500/20 to-violet-500/20', iconColor: 'text-purple-400' },
  { key: 'goalsCount' as const, label: 'מטרות', description: 'מטרות פעילות', Icon: Target, gradient: 'from-emerald-500/20 to-teal-500/20', iconColor: 'text-emerald-400' },
  { key: 'moodCount' as const, label: 'מצב רוח', description: 'רשומות מצב רוח', Icon: SmilePlus, gradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-amber-400' },
  { key: 'remindersCount' as const, label: 'תזכורות', description: 'תזכורות ממתינות', Icon: Bell, gradient: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-400' },
] as const;

/** תרגום שמות כלים לעברית */
const TOOL_NAME_HE: Record<string, string> = {
  numerology: 'נומרולוגיה', astrology: 'אסטרולוגיה', palmistry: 'כירומנטיה',
  graphology: 'גרפולוגיה', tarot: 'טארוט', drawing: 'ציורים',
  dream: 'חלומות', career: 'קריירה', compatibility: 'התאמה',
  synastry: 'סינסטרי', solar_return: 'חזרה סולרית', transits: 'טרנזיטים',
  human_design: 'הדיזיין האנושי', personality: 'אישיות',
  document: 'מסמך', question: 'שאלה', relationship: 'יחסים', synthesis: 'סינתזה',
};

// ===== פונקציות עזר =====

/**
 * מקבצת ניתוחים לפי סוג כלי ומחזירה נתוני תרשים
 */
function buildChartData(analyses: AnalysisRow[]): ChartDataPoint[] {
  const grouped = analyses.reduce<Record<string, number>>((acc, row) => {
    acc[row.tool_type] = (acc[row.tool_type] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(grouped).map(([toolType, count]) => ({
    name: TOOL_NAME_HE[toolType] ?? toolType,
    ניתוחים: count,
  }));
}

// ===== Skeleton =====

/** כרטיס skeleton לזמן טעינה */
function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-8 w-12" />
        </div>
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-3 w-24" />
    </div>
  );
}

// ===== קומפוננטה =====

/** לוח הבקרה הראשי עם נתוני Supabase אמיתיים */
export default function DashboardPage() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');

      const [analyses, goals, mood, reminders] = await Promise.allSettled([
        supabase.from('analyses').select('id, tool_type, created_at', { count: 'exact' }).eq('user_id', user.id).limit(30).order('created_at', { ascending: false }),
        supabase.from('goals').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('mood_entries').select('id', { count: 'exact' }).eq('user_id', user.id),
        supabase.from('reminders').select('id', { count: 'exact' }).eq('user_id', user.id).eq('status', 'pending'),
      ]);

      return {
        analysesCount: analyses.status === 'fulfilled' ? (analyses.value.count ?? 0) : 0,
        goalsCount: goals.status === 'fulfilled' ? (goals.value.count ?? 0) : 0,
        moodCount: mood.status === 'fulfilled' ? (mood.value.count ?? 0) : 0,
        remindersCount: reminders.status === 'fulfilled' ? (reminders.value.count ?? 0) : 0,
        recentAnalyses: analyses.status === 'fulfilled' ? ((analyses.value.data ?? []) as AnalysisRow[]) : [],
      };
    },
    staleTime: CACHE_TIMES.SHORT,
  });

  const chartData = stats?.recentAnalyses ? buildChartData(stats.recentAnalyses) : [];

  return (
    <div className="space-y-8" dir="rtl">
      {/* כותרת */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">לוח הבקרה</h1>
        <p className="mt-1 text-muted-foreground">סיכום הפעילות שלך</p>
      </div>

      {/* כרטיסי סטטיסטיקות */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : STAT_CARDS.map(({ key, label, description, Icon, gradient, iconColor }) => (
              <div key={key} className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="mt-1 text-3xl font-bold text-foreground">
                      {stats?.[key] ?? 0}
                    </p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}>
                    <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{description}</p>
              </div>
            ))}
      </div>

      {/* תרשים ניתוחים */}
      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-5">
          <Skeleton className="mb-4 h-5 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 text-base font-semibold text-foreground">ניתוחים לפי כלי</h2>
          <AnalysesChart data={chartData} />
        </div>
      )}
    </div>
  );
}
