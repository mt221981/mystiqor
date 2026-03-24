'use client';

/**
 * דף אנליטיקה אישית — /analytics
 * מציג: כרטיסי סטטיסטיקות, תרשים התפלגות כלים, פעילות לאורך זמן, מגמת מצב רוח
 * מאפשר בחירת תקופה: שבוע / חודש / 3 חודשים / הכל
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ToolUsageChart } from '@/components/features/analytics/ToolUsageChart';
import { ActivityHeatmap } from '@/components/features/analytics/ActivityHeatmap';
import { UsageStats } from '@/components/features/analytics/UsageStats';
import type { AnalyticsStatsData } from '@/components/features/analytics/UsageStats';

// ===== קבועים =====

/**
 * שמות כלים בעברית — fallback מקומי עד שמודול tool-names יהיה זמין
 * TODO(09-05): החלף ב-import מ-@/lib/constants/tool-names
 */
const TOOL_NAMES: Record<string, string> = {
  numerology: 'נומרולוגיה',
  astrology: 'אסטרולוגיה',
  palmistry: 'קריאת כף יד',
  graphology: 'גרפולוגיה',
  tarot: 'טארוט',
  drawing: 'ניתוח ציור',
  dream: 'פירוש חלומות',
  career: 'ניתוח קריירה',
  compatibility: 'תאימות',
  synastry: 'סינסטרי',
  solar_return: 'חזרה סולרית',
  transits: 'טרנזיטים',
  human_design: 'עיצוב אנושי',
  personality: 'אישיות',
  document: 'ניתוח מסמכים',
  question: 'שאלה',
  relationship: 'מערכת יחסים',
  synthesis: 'סינתזה',
};

/** אפשרויות תקופה */
type Period = '7d' | '30d' | '90d' | 'all';

/** תוויות תקופה בעברית */
const PERIOD_LABELS: Record<Period, string> = {
  '7d': 'שבוע',
  '30d': 'חודש',
  '90d': '3 חודשים',
  all: 'הכל',
};

// ===== טיפוסים =====

/** צורת תגובת API אנליטיקה */
interface AnalyticsData {
  toolDistribution: Record<string, number>;
  activityByDate: Array<{ date: string; count: number }>;
  moodTrend: Array<{ date: string; mood: number; energy: number }>;
  stats: AnalyticsStatsData;
}

/** מבנה תגובת ה-API */
interface AnalyticsApiResponse {
  data: AnalyticsData;
}

// ===== פונקציות עזר =====

/**
 * ממיר התפלגות כלים (Record) למערך לתרשים עוגה
 * @param distribution - מילון tool_type → ספירה
 * @returns מערך { name, value } עם שמות בעברית
 */
function mapToolDistribution(
  distribution: Record<string, number>
): Array<{ name: string; value: number }> {
  return Object.entries(distribution).map(([key, value]) => ({
    name: TOOL_NAMES[key] ?? key,
    value,
  }));
}

// ===== ערכי ברירת מחדל =====

/** ערכי סטטיסטיקות ריקות */
const EMPTY_STATS: AnalyticsStatsData = {
  totalAnalyses: 0,
  avgMood: 0,
  avgEnergy: 0,
  totalGoals: 0,
  completedGoals: 0,
  goalCompletionRate: 0,
};

// ===== קומפוננטות עזר =====

/** Skeleton לזמן טעינה */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border bg-card p-5">
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-[350px] rounded-xl" />
        <Skeleton className="h-[350px] rounded-xl" />
      </div>
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/**
 * דף אנליטיקה אישית — מציג נתוני שימוש, פעילות ומגמות
 * טוען נתונים מ-/api/analytics עם React Query
 */
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>('30d');

  const { data: apiResponse, isLoading, isError } = useQuery<AnalyticsApiResponse>({
    queryKey: ['analytics', period],
    queryFn: async () => {
      const res = await fetch(`/api/analytics?period=${period}`);
      if (!res.ok) throw new Error('שגיאה בטעינת נתוני אנליטיקה');
      return res.json() as Promise<AnalyticsApiResponse>;
    },
  });

  const analyticsData = apiResponse?.data;
  const hasData =
    analyticsData &&
    (analyticsData.stats.totalAnalyses > 0 || analyticsData.stats.totalGoals > 0);

  return (
    <div className="container mx-auto max-w-6xl space-y-8 p-6" dir="rtl">
      {/* כותרת */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
          <BarChart3 className="h-5 w-5 text-purple-400" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">אנליטיקה אישית</h1>
          <p className="text-sm text-muted-foreground">
            עקוב אחר דפוסי השימוש והמגמות שלך
          </p>
        </div>
      </div>

      {/* בוחר תקופה */}
      <div className="flex gap-2" role="group" aria-label="בחר תקופת זמן">
        {(Object.entries(PERIOD_LABELS) as [Period, string][]).map(([value, label]) => (
          <Button
            key={value}
            variant={period === value ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPeriod(value)}
            aria-pressed={period === value}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* מצב טעינה */}
      {isLoading && <AnalyticsSkeleton />}

      {/* מצב שגיאה */}
      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">שגיאה בטעינת נתוני האנליטיקה. נסה שנית.</p>
        </div>
      )}

      {/* מצב ריק */}
      {!isLoading && !isError && !hasData && (
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <BarChart3
            className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30"
            aria-hidden="true"
          />
          <h2 className="mb-2 text-lg font-semibold text-foreground">
            עדיין אין מספיק נתונים
          </h2>
          <p className="text-muted-foreground">
            התחל להשתמש בכלים כדי לראות סטטיסטיקות ומגמות אישיות
          </p>
        </div>
      )}

      {/* תוכן עיקרי */}
      {!isLoading && !isError && analyticsData && (
        <div className="space-y-6">
          {/* כרטיסי סטטיסטיקות */}
          <UsageStats stats={analyticsData.stats ?? EMPTY_STATS} />

          {/* תרשימים — שני עמודות */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* תרשים התפלגות כלים */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">התפלגות שימוש בכלים</CardTitle>
              </CardHeader>
              <CardContent>
                <ToolUsageChart
                  data={mapToolDistribution(analyticsData.toolDistribution ?? {})}
                />
              </CardContent>
            </Card>

            {/* תרשים פעילות לפי זמן */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">פעילות לאורך זמן</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityHeatmap data={analyticsData.activityByDate ?? []} />
              </CardContent>
            </Card>
          </div>

          {/* מגמת מצב רוח */}
          {analyticsData.moodTrend && analyticsData.moodTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">מגמת מצב רוח</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityHeatmap
                  data={analyticsData.moodTrend.map((point) => ({
                    date: point.date,
                    count: point.mood,
                  }))}
                />
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
