/**
 * API Route: אנליטיקה אישית
 * GET /api/analytics — שליפת נתוני שימוש מרוכזים למשתמש המחובר
 * מחזיר: התפלגות כלים, פעילות לפי תאריך, מגמת מצב רוח, סטטיסטיקות כלליות
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { AnalyticsQuerySchema } from '@/lib/validations/analytics';

// ===== טיפוסים =====

/** התפלגות שימוש בכלים — שם כלי → מספר שימושים */
type ToolDistribution = Record<string, number>;

/** נקודת פעילות לפי תאריך */
interface ActivityByDate {
  date: string;
  count: number;
}

/** נקודת מגמת מצב רוח */
interface MoodTrendPoint {
  date: string;
  mood: number;
  energy: number;
}

/** סטטיסטיקות כלליות */
interface AnalyticsStats {
  totalAnalyses: number;
  avgMood: number;
  avgEnergy: number;
  totalGoals: number;
  completedGoals: number;
  goalCompletionRate: number;
}

/** תגובת API אנליטיקה */
interface AnalyticsResponse {
  toolDistribution: ToolDistribution;
  activityByDate: ActivityByDate[];
  moodTrend: MoodTrendPoint[];
  stats: AnalyticsStats;
}

// ===== עזר =====

/**
 * מחשב תאריך חיתוך לפי תקופה
 * @param period תקופה נבחרת
 * @returns תאריך ISO של התחלת התקופה, או null עבור "הכל"
 */
function computeCutoff(period: '7d' | '30d' | '90d' | 'all'): string | null {
  if (period === 'all') return null;
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff.toISOString();
}

/**
 * מחלץ חלק תאריך (YYYY-MM-DD) ממחרוזת ISO
 * @param isoString תאריך ISO
 * @returns מחרוזת תאריך
 */
function extractDate(isoString: string): string {
  return isoString.slice(0, 10);
}

// ===== Handler =====

/** שליפת נתוני אנליטיקה אישית */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'לא מחובר' }, { status: 401 });
    }

    // ולידציה של פרמטרי שאילתה
    const params = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = AnalyticsQuerySchema.safeParse(params);
    const period = parsed.success ? parsed.data.period : '30d';
    const cutoff = computeCutoff(period);

    // שאילתות מקבילות לשלוש הטבלאות
    const [analysesResult, moodResult, goalsResult] = await Promise.all([
      // ניתוחים — שליפת tool_type ותאריך
      cutoff
        ? supabase
            .from('analyses')
            .select('tool_type, created_at')
            .eq('user_id', user.id)
            .gte('created_at', cutoff)
        : supabase
            .from('analyses')
            .select('tool_type, created_at')
            .eq('user_id', user.id),

      // ערכי מצב רוח — שליפת ציון ורמת אנרגיה
      cutoff
        ? supabase
            .from('mood_entries')
            .select('mood_score, energy_level, created_at')
            .eq('user_id', user.id)
            .gte('created_at', cutoff)
        : supabase
            .from('mood_entries')
            .select('mood_score, energy_level, created_at')
            .eq('user_id', user.id),

      // יעדים — ללא סינון תקופה (נתונים כוללים)
      supabase
        .from('goals')
        .select('status, category, progress, created_at')
        .eq('user_id', user.id),
    ]);

    if (analysesResult.error) {
      return NextResponse.json({ error: 'שגיאה בשליפת ניתוחים' }, { status: 500 });
    }
    if (moodResult.error) {
      return NextResponse.json({ error: 'שגיאה בשליפת ערכי מצב רוח' }, { status: 500 });
    }
    if (goalsResult.error) {
      return NextResponse.json({ error: 'שגיאה בשליפת יעדים' }, { status: 500 });
    }

    const analyses = analysesResult.data ?? [];
    const moodEntries = moodResult.data ?? [];
    const goals = goalsResult.data ?? [];

    // ===== עיבוד נתוני ניתוחים =====

    // התפלגות כלים: ספירה לפי tool_type
    const toolDistribution: ToolDistribution = {};
    for (const row of analyses) {
      const key = row.tool_type;
      toolDistribution[key] = (toolDistribution[key] ?? 0) + 1;
    }

    // פעילות לפי תאריך: קיבוץ ניתוחים לפי YYYY-MM-DD
    const activityMap = new Map<string, number>();
    for (const row of analyses) {
      const date = extractDate(row.created_at);
      activityMap.set(date, (activityMap.get(date) ?? 0) + 1);
    }
    const activityByDate: ActivityByDate[] = Array.from(activityMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ===== עיבוד נתוני מצב רוח =====

    // מגמת מצב רוח: ממוצע mood_score ו-energy_level לפי תאריך
    const moodMap = new Map<string, { mood: number[]; energy: number[] }>();
    for (const row of moodEntries) {
      const date = extractDate(row.created_at);
      const existing = moodMap.get(date) ?? { mood: [], energy: [] };
      if (row.mood_score !== null) existing.mood.push(row.mood_score);
      if (row.energy_level !== null) existing.energy.push(row.energy_level);
      moodMap.set(date, existing);
    }
    const moodTrend: MoodTrendPoint[] = Array.from(moodMap.entries())
      .map(([date, { mood, energy }]) => ({
        date,
        mood: parseFloat((mood.reduce((a, b) => a + b, 0) / mood.length).toFixed(1)),
        energy: parseFloat((energy.reduce((a, b) => a + b, 0) / energy.length).toFixed(1)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ===== עיבוד נתוני יעדים =====

    const totalGoals = goals.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const goalCompletionRate =
      totalGoals > 0
        ? parseFloat(((completedGoals / totalGoals) * 100).toFixed(1))
        : 0;

    // ===== סטטיסטיקות כלליות =====

    const moodScores = moodEntries
      .map((m) => m.mood_score)
      .filter((v): v is number => v !== null);
    const energyLevels = moodEntries
      .map((m) => m.energy_level)
      .filter((v): v is number => v !== null);

    const avgMood =
      moodScores.length > 0
        ? parseFloat(
            (moodScores.reduce((sum, v) => sum + v, 0) / moodScores.length).toFixed(1)
          )
        : 0;

    const avgEnergy =
      energyLevels.length > 0
        ? parseFloat(
            (energyLevels.reduce((sum, v) => sum + v, 0) / energyLevels.length).toFixed(1)
          )
        : 0;

    const stats: AnalyticsStats = {
      totalAnalyses: analyses.length,
      avgMood,
      avgEnergy,
      totalGoals,
      completedGoals,
      goalCompletionRate,
    };

    const responseData: AnalyticsResponse = {
      toolDistribution,
      activityByDate,
      moodTrend,
      stats,
    };

    return NextResponse.json({ data: responseData });
  } catch {
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 });
  }
}
