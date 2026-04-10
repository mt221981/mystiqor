'use client';

/**
 * JourneyWidget — ויג'ט "המסע שלי" בדשבורד (JOUR-02)
 *
 * מציג את המסע הפעיל של המשתמש: שם, progress bar, הצעד הבא, כפתור CTA.
 * אם אין מסע פעיל — מציג הזמנה להתחיל מסע חדש.
 *
 * משתף queryKey עם JourneysPanel כדי לחסוך שליפות כפולות.
 */

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { motion, useReducedMotion } from 'framer-motion';
import { Route, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ===== טיפוסים =====

/** צעד במסע אימון (תת-קבוצה של Journey.steps) */
interface JourneyStep {
  readonly step_number: number;
  readonly title: string;
  readonly description: string;
  readonly status: 'todo' | 'completed';
}

/** מסע אימון מה-API */
interface Journey {
  readonly id: string;
  readonly title: string;
  readonly description: string | null;
  readonly status: string | null;
  readonly steps: JourneyStep[];
  readonly progress_percentage: number | null;
  readonly completed_steps: number | null;
}

// ===== פונקציות עזר =====

/**
 * בוחר את המסע הפעיל הראשון מתוך הרשימה
 * @param journeys רשימת כל המסעות
 * @returns המסע הפעיל הראשון או undefined
 */
function pickActiveJourney(journeys: readonly Journey[]): Journey | undefined {
  return journeys.find((j) => j.status === 'active') ?? journeys[0];
}

/**
 * מוצא את הצעד הבא (הראשון שלא הושלם) במסע נתון
 * @param journey המסע הנבחר
 * @returns הצעד הבא או undefined אם המסע הושלם
 */
function findNextStep(journey: Journey): JourneyStep | undefined {
  return journey.steps.find((s) => s.status === 'todo');
}

// ===== קומפוננטה =====

/** JourneyWidget — ויג'ט דשבורד שמציג את המסע הפעיל או הזמנה להתחיל */
export function JourneyWidget() {
  const shouldReduceMotion = useReducedMotion();

  // שימוש באותו queryKey של JourneysPanel — שיתוף cache
  const { data: journeys = [], isLoading } = useQuery<Journey[]>({
    queryKey: ['coach-journeys'],
    queryFn: async () => {
      const res = await fetch('/api/coach/journeys');
      if (!res.ok) throw new Error('שגיאה בטעינת המסעות');
      const json = (await res.json()) as { data: Journey[] };
      return json.data ?? [];
    },
    staleTime: 60_000,
  });

  const activeJourney = pickActiveJourney(journeys);
  const nextStep = activeJourney ? findNextStep(activeJourney) : undefined;
  const progress = activeJourney?.progress_percentage ?? 0;

  // ===== מצב טעינה =====
  if (isLoading) {
    return (
      <div
        className="relative overflow-hidden rounded-2xl border border-primary/15 p-5 sm:p-6 min-h-[160px] animate-pulse"
        style={{
          background:
            'linear-gradient(135deg, rgba(88,28,135,0.18) 0%, rgba(30,27,75,0.22) 50%, rgba(88,28,135,0.12) 100%)',
        }}
        dir="rtl"
      >
        <div className="h-5 w-32 rounded bg-white/10 mb-3" />
        <div className="h-3 w-full rounded bg-white/5" />
      </div>
    );
  }

  // ===== מצב ריק — אין מסעות =====
  if (!activeJourney) {
    return (
      <motion.div
        className="relative overflow-hidden rounded-2xl border border-primary/15 p-5 sm:p-6"
        style={{
          background:
            'linear-gradient(135deg, rgba(88,28,135,0.18) 0%, rgba(30,27,75,0.22) 50%, rgba(88,28,135,0.12) 100%)',
          backdropFilter: 'blur(8px)',
        }}
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        role="region"
        aria-label="ויג'ט מסע אישי"
        dir="rtl"
      >
        {/* כוכבים דקורטיביים */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute end-6 top-4 h-1 w-1 rounded-full bg-yellow-300/40" />
          <div className="absolute end-16 top-10 h-0.5 w-0.5 rounded-full bg-purple-300/50" />
          <div className="absolute start-10 bottom-5 h-1 w-1 rounded-full bg-blue-300/30" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-center gap-4 sm:gap-5 text-center sm:text-start">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/40">
            <Route className="h-7 w-7 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-lg sm:text-xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-yellow-200">
              מוכן למסע האישי שלך?
            </h3>
            <p className="text-sm text-muted-foreground font-body">
              נועה תבנה לך מסע אימון אישי מותאם — צעד אחר צעד אל המטרות שלך
            </p>
          </div>
          <Link href="/journey" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-10 px-5 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-semibold gap-2 hover:opacity-90 active:scale-95">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>התחל מסע אישי</span>
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // ===== מצב מלא — יש מסע פעיל =====
  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-primary/15 p-5 sm:p-6"
      style={{
        background:
          'linear-gradient(135deg, rgba(88,28,135,0.22) 0%, rgba(30,27,75,0.28) 50%, rgba(217,119,6,0.12) 100%)',
        backdropFilter: 'blur(8px)',
      }}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="region"
      aria-label={`המסע שלי: ${activeJourney.title}`}
      dir="rtl"
    >
      {/* כוכבים דקורטיביים */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute end-6 top-4 h-1 w-1 rounded-full bg-yellow-300/40" />
        <div className="absolute end-20 top-12 h-0.5 w-0.5 rounded-full bg-purple-300/50" />
        <div className="absolute start-10 bottom-6 h-1 w-1 rounded-full bg-blue-300/30" />
        <div className="absolute start-24 top-8 h-0.5 w-0.5 rounded-full bg-yellow-300/40" />
      </div>

      <div className="relative space-y-4">
        {/* כותרת + שם המסע */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 border border-primary/40">
            <Route className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-primary/80 font-label mb-0.5">
              המסע שלי
            </p>
            <h3 className="text-base sm:text-lg font-bold font-headline text-foreground truncate">
              {activeJourney.title}
            </h3>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-label">
            <span className="text-muted-foreground">התקדמות</span>
            <span className="text-primary font-bold">{Math.round(progress)}%</span>
          </div>
          <div
            className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="התקדמות במסע"
          >
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-primary via-secondary to-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* הצעד הבא */}
        {nextStep ? (
          <div className="rounded-xl border border-primary/20 bg-surface-container/50 px-3 py-2.5">
            <p className="text-xs font-medium text-primary/80 font-label mb-0.5">
              הצעד הבא
            </p>
            <p className="text-sm font-semibold text-foreground font-body line-clamp-1">
              {nextStep.title}
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-gold/30 bg-gold/10 px-3 py-2.5">
            <p className="text-sm font-semibold text-gold font-body text-center">
              סיימת את כל הצעדים במסע — כל הכבוד!
            </p>
          </div>
        )}

        {/* CTA */}
        <Link href="/journey" className="block">
          <Button className="w-full h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-semibold gap-2 hover:opacity-90 active:scale-95">
            <span>המשך מסע</span>
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
