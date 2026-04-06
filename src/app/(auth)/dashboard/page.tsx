'use client';

/**
 * לוח הבקרה הראשי — D-01 עד D-06 + DASH-01 עד DASH-06
 * מציג: תובנה יומית, 4 כרטיסי סטטיסטיקות, תרשים ביוריתם,
 * מגמת מצב רוח, התקדמות יעדים, ניתוחים לפי כלי.
 * בוחר תקופה (יומי/שבועי/חודשי) משפיע על נתוני מצב רוח וניתוחים.
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subDays, subMonths, startOfDay } from 'date-fns';

import { createClient } from '@/lib/supabase/client';
import { CACHE_TIMES, queryKeys } from '@/lib/query/cache-config';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Smile, BookOpen, HelpCircle } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { animations } from '@/lib/animations/presets';
import { AnalysesChart, type ChartDataPoint } from '@/components/features/shared/AnalysesChart';
import { DailyInsightCard } from '@/components/features/dashboard/DailyInsightCard';
import { HeroToolGrid } from '@/components/features/dashboard/HeroToolGrid';
import { BiorhythmChart } from '@/components/features/dashboard/BiorhythmChart';
import { MoodTrendChart } from '@/components/features/dashboard/MoodTrendChart';
import { GoalsProgressChart } from '@/components/features/dashboard/GoalsProgressChart';
import { PeriodSelector, type Period } from '@/components/features/dashboard/PeriodSelector';
import { StatCards } from '@/components/features/dashboard/StatCards';
import { Button } from '@/components/ui/button';

// ===== טיפוסים =====

/** שורת ניתוח בסיסית */
interface AnalysisRow {
  readonly id: string;
  readonly tool_type: string;
  readonly created_at: string;
}

/** שורת מצב רוח */
interface MoodRow {
  readonly id: string;
  readonly mood_score: number;
  readonly created_at: string;
}

/** שורת יעד */
interface GoalRow {
  readonly id: string;
  readonly category: string;
  readonly progress: number;
  readonly status: string;
}

/** נתוני פרופיל לדשבורד */
interface ProfileData {
  readonly birth_date: string | null;
  readonly full_name: string | null;
}

// ===== קבועים =====

/** תרגום שמות כלים לעברית — שימוש ב-DASH-05 */
const TOOL_NAME_HE: Record<string, string> = {
  numerology: 'נומרולוגיה', astrology: 'אסטרולוגיה', palmistry: 'קריאה בכף יד',
  graphology: 'גרפולוגיה', tarot: 'טארוט', drawing: 'ציורים',
  dream: 'חלומות', career: 'קריירה', compatibility: 'התאמה',
  synastry: 'סינסטרי', solar_return: 'חזרה סולרית', transits: 'טרנזיטים',
  human_design: 'הדיזיין האנושי', personality: 'אישיות',
  document: 'מסמך', question: 'שאלה', relationship: 'יחסים', synthesis: 'סינתזה',
};

// ===== פונקציות עזר =====

/**
 * מחשב תאריך התחלה לפי תקופה נבחרת
 * @param period תקופה נבחרת
 * @returns תאריך התחלה של הטווח
 */
function getPeriodStartDate(period: Period): Date {
  const now = new Date();
  if (period === 'daily') return startOfDay(now);
  if (period === 'weekly') return subDays(now, 7);
  return subMonths(now, 1);
}

/**
 * מקבצת ניתוחים לפי סוג כלי ומחזירה נתוני תרשים — DASH-05
 * @param analyses רשימת ניתוחים
 * @returns נתוני תרשים
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

/**
 * מחשב ממוצע מצב רוח ממערך רשומות
 * @param moods רשימת רשומות מצב רוח
 * @returns ממוצע ציון מצב רוח, 0 אם ריק
 */
function calcAverageMoodScore(moods: MoodRow[]): number {
  if (moods.length === 0) return 0;
  const total = moods.reduce((sum, m) => sum + m.mood_score, 0);
  return total / moods.length;
}

/**
 * מקבצת יעדים לפי קטגוריה לתרשים — DASH-04
 * @param goals רשימת יעדים
 * @returns נתוני תרשים מקובצים לפי קטגוריה
 */
function buildGoalsChartData(
  goals: GoalRow[]
): Array<{ category: string; progress: number; count: number }> {
  const grouped = goals.reduce<Record<string, { total: number; count: number }>>((acc, goal) => {
    const cat = goal.category;
    if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
    acc[cat].total += goal.progress;
    acc[cat].count += 1;
    return acc;
  }, {});

  return Object.entries(grouped).map(([category, { total, count }]) => ({
    category,
    progress: Math.round(total / count),
    count,
  }));
}

/**
 * מחזיר ברכה בעברית לפי שעת היום
 */
function getHebrewGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'בוקר טוב';
  if (hour < 17) return 'צהריים טובים';
  if (hour < 21) return 'ערב טוב';
  return 'לילה טוב';
}

// ===== קומפוננטה =====

/** לוח הבקרה הראשי */
export default function DashboardPage() {
  // מצב תקופה — D-03/DASH-06
  const [period, setPeriod] = useState<Period>('weekly');

  const supabase = createClient();

  // === שאילתת פרופיל (לביוריתם ותובנה יומית) ===
  const { data: profile } = useQuery<ProfileData>({
    queryKey: queryKeys.profile.current(),
    queryFn: async (): Promise<ProfileData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');
      const { data } = await supabase
        .from('profiles')
        .select('birth_date, full_name')
        .eq('id', user.id)
        .maybeSingle();
      return { birth_date: data?.birth_date ?? null, full_name: data?.full_name ?? null };
    },
    staleTime: CACHE_TIMES.LONG,
  });

  // === שאילתת סטטיסטיקות (יעדים + תזכורות) ===
  const { data: coreStats, isLoading: isCoreLoading } = useQuery({
    queryKey: ['dashboard-core-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');

      const [activeGoals, completedGoals, reminders] = await Promise.allSettled([
        supabase
          .from('goals')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['active', 'in_progress']),
        supabase
          .from('goals')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'completed'),
        supabase
          .from('reminders')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'pending'),
      ]);

      return {
        activeGoals: activeGoals.status === 'fulfilled' ? (activeGoals.value.count ?? 0) : 0,
        completedGoals: completedGoals.status === 'fulfilled' ? (completedGoals.value.count ?? 0) : 0,
        pendingReminders: reminders.status === 'fulfilled' ? (reminders.value.count ?? 0) : 0,
      };
    },
    staleTime: CACHE_TIMES.SHORT,
  });

  // === שאילתת מצב רוח 7 ימים (לממוצע stat card) ===
  const { data: moodStats } = useQuery({
    queryKey: queryKeys.moods.recent(7),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      const { data } = await supabase
        .from('mood_entries')
        .select('id, mood_score, created_at')
        .eq('user_id', user.id)
        .gte('created_at', sevenDaysAgo)
        .order('created_at', { ascending: true });
      return (data ?? []) as MoodRow[];
    },
    staleTime: CACHE_TIMES.SHORT,
  });

  // === שאילתת מצב רוח לפי תקופה — DASH-03 + Pitfall 7 ===
  const { data: moodTrend, isLoading: isMoodLoading } = useQuery({
    queryKey: queryKeys.moods.list({ period }),  // period בmatchKey — Pitfall 7
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');
      const startDate = getPeriodStartDate(period).toISOString();
      const { data } = await supabase
        .from('mood_entries')
        .select('id, mood_score, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: true });
      return (data ?? []) as MoodRow[];
    },
    staleTime: CACHE_TIMES.SHORT,
  });

  // === שאילתת יעדים לפי קטגוריה — DASH-04 ===
  const { data: activeGoalsData, isLoading: isGoalsLoading } = useQuery({
    queryKey: queryKeys.goals.active(),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');
      const { data } = await supabase
        .from('goals')
        .select('id, category, progress, status')
        .eq('user_id', user.id)
        .in('status', ['active', 'in_progress']);
      return (data ?? []) as GoalRow[];
    },
    staleTime: CACHE_TIMES.SHORT,
  });

  // === שאילתת ניתוחים לפי תקופה — DASH-05 + Pitfall 7 ===
  const { data: analysesData, isLoading: isAnalysesLoading } = useQuery({
    queryKey: queryKeys.analyses.list({ period }),  // period ב-queryKey — Pitfall 7
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');
      const startDate = getPeriodStartDate(period).toISOString();
      const { data } = await supabase
        .from('analyses')
        .select('id, tool_type, created_at')
        .eq('user_id', user.id)
        .gte('created_at', startDate)
        .order('created_at', { ascending: false });
      return (data ?? []) as AnalysisRow[];
    },
    staleTime: CACHE_TIMES.SHORT,
  });

  // === חישוב נגזרים ===
  const averageMoodScore = calcAverageMoodScore(moodStats ?? []);
  const moodTrendData = (moodTrend ?? []).map((m) => ({
    date: m.created_at,
    mood_score: m.mood_score,
  }));
  const goalsChartData = buildGoalsChartData(activeGoalsData ?? []);
  const analysesChartData = buildChartData(analysesData ?? []);
  const isStatsLoading = isCoreLoading;

  const stats = {
    activeGoals: coreStats?.activeGoals ?? 0,
    currentMoodScore: averageMoodScore,
    completedGoals: coreStats?.completedGoals ?? 0,
    pendingReminders: coreStats?.pendingReminders ?? 0,
  };

  const shouldReduceMotion = useReducedMotion();
  const motionProps = shouldReduceMotion ? {} : animations.pageEntry;
  const staggerDelay = (i: number) => shouldReduceMotion ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 * i, duration: 0.5 } };

  return (
    <ErrorBoundary>
      <motion.div className="space-y-8" dir="rtl" {...motionProps}>

        {/* ===== 1. Hero — ברכה אישית ===== */}
        <motion.div className="text-center space-y-4" {...staggerDelay(0)}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>המסע שלך מתחיל כאן</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-thin text-foreground font-headline">
            {getHebrewGreeting()},{' '}
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {profile?.full_name?.split(' ')[0] ?? 'חבר'}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto font-body">
            היום הוא הזדמנות חדשה להכיר את עצמך קצת יותר לעומק.
          </p>
        </motion.div>

        {/* ===== 2. גריד 6 כלים עיקריים ===== */}
        <motion.div {...staggerDelay(1)}>
          <HeroToolGrid />
        </motion.div>

        {/* ===== 3. תובנה יומית עם זוהר ===== */}
        <motion.div {...staggerDelay(2)} className="max-w-2xl mx-auto w-full">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-container to-gold rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000" aria-hidden="true" />
            <div className="relative bg-surface-container rounded-[1.75rem] overflow-hidden shadow-2xl border border-outline-variant/10">
              <DailyInsightCard birthDate={profile?.birth_date ?? null} />
            </div>
          </div>
        </motion.div>

        {/* ===== 4. כפתורי פעולה מהירים ===== */}
        <motion.div {...staggerDelay(3)} className="flex flex-wrap justify-center gap-4">
          <Link href="/mood">
            <Button variant="outline" className="h-10 px-6 rounded-full border-outline-variant/20 bg-surface-container/50 hover:bg-surface-container-high hover:text-primary hover:border-primary/50 transition-all gap-2">
              <Smile className="w-4 h-4" />
              <span>איך אני מרגיש?</span>
            </Button>
          </Link>
          <Link href="/journal">
            <Button variant="outline" className="h-10 px-6 rounded-full border-outline-variant/20 bg-surface-container/50 hover:bg-surface-container-high hover:text-blue-400 hover:border-blue-500/50 transition-all gap-2">
              <BookOpen className="w-4 h-4" />
              <span>יומן אישי</span>
            </Button>
          </Link>
          <Link href="/coach">
            <Button variant="outline" className="h-10 px-6 rounded-full border-outline-variant/20 bg-surface-container/50 hover:bg-surface-container-high hover:text-gold hover:border-gold/50 transition-all gap-2">
              <HelpCircle className="w-4 h-4" />
              <span>שאל שאלה</span>
            </Button>
          </Link>
        </motion.div>

        {/* ===== 5. סטטיסטיקות ===== */}
        <motion.div {...staggerDelay(4)}>
          <StatCards stats={stats} isLoading={isStatsLoading} />
        </motion.div>

        {/* ===== 6. גרפים ומגמות ===== */}
        <motion.div {...staggerDelay(5)}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-headline text-gradient-gold">גרפים ומגמות</h2>
            <PeriodSelector value={period} onChange={setPeriod} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-surface-container rounded-2xl p-6 border border-primary/10 hover:border-primary/20 transition-colors">
              <h3 className="mb-4 text-xl font-bold font-headline text-foreground">ביוריתם אישי</h3>
              <BiorhythmChart birthDate={profile?.birth_date ?? null} />
            </div>

            <div className="bg-surface-container rounded-2xl p-6 border border-primary/10 hover:border-primary/20 transition-colors">
              <h3 className="mb-4 text-xl font-bold font-headline text-foreground">מגמת מצב רוח</h3>
              {isMoodLoading ? <MysticSkeleton className="h-[200px] w-full" /> : <MoodTrendChart data={moodTrendData} period={period} />}
            </div>

            <div className="bg-surface-container rounded-2xl p-6 border border-primary/10 hover:border-primary/20 transition-colors">
              <h3 className="mb-4 text-xl font-bold font-headline text-foreground">התקדמות יעדים</h3>
              {isGoalsLoading ? <MysticSkeleton className="h-[200px] w-full" /> : <GoalsProgressChart data={goalsChartData} />}
            </div>

            <div className="lg:col-span-2 bg-surface-container rounded-2xl p-6 border border-primary/10 hover:border-primary/20 transition-colors">
              <h3 className="mb-4 text-xl font-bold font-headline text-foreground">ניתוחים לפי כלי</h3>
              {isAnalysesLoading ? <MysticSkeleton className="h-[200px] w-full" /> : <AnalysesChart data={analysesChartData} />}
            </div>
          </div>
        </motion.div>

      </motion.div>
    </ErrorBoundary>
  );
}
