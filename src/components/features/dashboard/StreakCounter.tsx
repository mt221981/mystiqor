'use client';

/**
 * מונה רצף ימים — מציג כמה ימים רצופים המשתמש היה פעיל
 * מחשב רצף מניתוחים, רשומות מצב רוח ורשומות יומן
 * עיצוב: כרטיס אופקי עם להבה + נקודות 7 ימים אחרונים
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { subDays, startOfDay, format } from 'date-fns';

import { createClient } from '@/lib/supabase/client';
import { CACHE_TIMES } from '@/lib/query/cache-config';

// ===== קבועים =====

/** מספר ימים לאחור לבדיקת היסטוריה */
const HISTORY_DAYS = 30;
/** מספר נקודות ימים להצגה */
const DOT_DAYS = 7;

// ===== טיפוסים =====

/** תוצאת חישוב רצף */
interface StreakResult {
  /** מספר ימים ברצף הנוכחי */
  readonly streak: number;
  /** סט תאריכים פעילים בפורמט YYYY-MM-DD */
  readonly activeDatesSet: ReadonlySet<string>;
}

// ===== פונקציות עזר =====

/**
 * מחשב רצף ימים רצופים מסט תאריכים פעילים
 * סופר מהיום אחורה עד שמוצא יום לא פעיל
 * @param activeDates סט תאריכים פעילים בפורמט YYYY-MM-DD
 * @returns מספר ימי הרצף
 */
function calculateStreak(activeDates: ReadonlySet<string>): number {
  let streak = 0;
  const today = startOfDay(new Date());

  for (let i = 0; i < HISTORY_DAYS; i++) {
    const date = format(subDays(today, i), 'yyyy-MM-dd');
    if (activeDates.has(date)) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * מחלץ תאריך בפורמט YYYY-MM-DD מ-ISO timestamp
 * @param isoString מחרוזת ISO
 * @returns תאריך בפורמט YYYY-MM-DD
 */
function extractDate(isoString: string): string {
  return isoString.slice(0, 10);
}

// ===== הוק נתונים =====

/**
 * שואב ומחשב נתוני רצף פעילות מ-Supabase
 * מאחד ניתוחים, מצב רוח ויומן לתאריכים פעילים
 * @returns StreakResult עם רצף ותאריכים פעילים
 */
function useStreakData(): {
  data: StreakResult | undefined;
  isLoading: boolean;
  isError: boolean;
} {
  const supabase = createClient();
  const since = subDays(startOfDay(new Date()), HISTORY_DAYS).toISOString();

  return useQuery<StreakResult>({
    queryKey: ['dashboard-streak', since.slice(0, 10)],
    queryFn: async (): Promise<StreakResult> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('לא מחובר');

      // שלוש שאילתות במקביל
      const [analysesResult, moodResult, journalResult] = await Promise.allSettled([
        supabase
          .from('analyses')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', since),
        supabase
          .from('mood_entries')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', since),
        supabase
          .from('journal_entries')
          .select('created_at')
          .eq('user_id', user.id)
          .gte('created_at', since),
      ]);

      // איסוף כל התאריכים הפעילים לסט אחד
      const activeDates = new Set<string>();

      if (analysesResult.status === 'fulfilled' && analysesResult.value.data) {
        for (const row of analysesResult.value.data) {
          activeDates.add(extractDate(row.created_at));
        }
      }
      if (moodResult.status === 'fulfilled' && moodResult.value.data) {
        for (const row of moodResult.value.data) {
          activeDates.add(extractDate(row.created_at));
        }
      }
      if (journalResult.status === 'fulfilled' && journalResult.value.data) {
        for (const row of journalResult.value.data) {
          activeDates.add(extractDate(row.created_at));
        }
      }

      return {
        streak: calculateStreak(activeDates),
        activeDatesSet: activeDates,
      };
    },
    staleTime: CACHE_TIMES.SHORT,
  });
}

// ===== קומפוננטה =====

/**
 * מונה רצף ימים רצופים
 * מציג להבה, מספר ימים, ונקודות 7 ימים אחרונים
 * אין Props — שואב נתונים פנימית
 */
export function StreakCounter() {
  const { data, isLoading, isError } = useStreakData();
  const shouldReduceMotion = useReducedMotion();

  // חישוב 7 נקודות הימים האחרונות
  const dotDays = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: DOT_DAYS }, (_, i) => {
      const date = format(subDays(today, DOT_DAYS - 1 - i), 'yyyy-MM-dd');
      return {
        date,
        isActive: data?.activeDatesSet.has(date) ?? false,
        isToday: i === DOT_DAYS - 1,
      };
    });
  }, [data]);

  const streak = data?.streak ?? 0;
  const hasStreak = streak > 0;

  // מצב טעינה
  if (isLoading) {
    return (
      <div
        className="rounded-2xl border border-primary/10 bg-surface-container p-4 animate-pulse"
        aria-busy="true"
        aria-label="טוען נתוני רצף..."
      >
        <div className="h-8 w-48 rounded-lg bg-white/10" />
      </div>
    );
  }

  // מצב שגיאה — שקט (לא מפריע לדשבורד)
  if (isError) return null;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-surface-container p-4 sm:p-5"
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundImage: 'linear-gradient(135deg, rgba(168,85,247,0.06) 0%, rgba(234,179,8,0.06) 100%)',
      }}
      role="region"
      aria-label="מונה רצף פעילות"
    >
      {/* גבול gradient בהובר */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-700 group-hover:opacity-100"
        style={{
          background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(234,179,8,0.15))',
          filter: 'blur(1px)',
        }}
        aria-hidden="true"
      />

      <div className="relative flex items-center justify-between gap-4">
        {/* צד ימין — להבה + טקסט */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.span
            className="text-3xl sm:text-4xl shrink-0"
            animate={shouldReduceMotion ? {} : hasStreak ? { scale: [1, 1.15, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
            aria-hidden="true"
          >
            🔥
          </motion.span>

          <div className="min-w-0">
            {hasStreak ? (
              <p className="text-xl sm:text-2xl font-bold font-headline text-foreground leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-yellow-400">
                  {streak}
                </span>
                {' '}
                <span>ימים רצופים!</span>
              </p>
            ) : (
              <p className="text-base sm:text-lg font-semibold font-headline text-muted-foreground leading-tight">
                התחל את הרצף שלך היום!
              </p>
            )}

            <p className="text-xs text-muted-foreground mt-0.5 font-body">
              {hasStreak ? 'המשך כך — אתה בדרך הנכונה' : 'כל פעולה קטנה בונה הרגל'}
            </p>
          </div>
        </div>

        {/* 7 נקודות ימים אחרונים */}
        <div
          className="flex items-center gap-1.5 shrink-0"
          role="list"
          aria-label="7 ימים אחרונים"
        >
          {dotDays.map((day) => (
            <motion.div
              key={day.date}
              className={[
                'h-3 w-3 rounded-full transition-all duration-300',
                day.isActive
                  ? 'bg-gradient-to-br from-primary to-yellow-400 shadow-sm shadow-primary/40'
                  : 'bg-white/15 border border-white/10',
                day.isToday && !day.isActive
                  ? 'ring-1 ring-primary/50'
                  : '',
              ].join(' ')}
              title={day.date}
              role="listitem"
              aria-label={`${day.date}: ${day.isActive ? 'פעיל' : 'לא פעיל'}`}
              initial={shouldReduceMotion ? {} : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.05 * dotDays.indexOf(day) }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
