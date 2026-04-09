'use client';

/**
 * פרומפט יומי מיסטי — קריאה לפעולה שמשתנה לפי שעה ומצב פעילות
 * מציג הודעה מסתובבת ו-3 כפתורי CTA לכלים מרכזיים
 * אם המשתמש כבר פעיל היום — מציג מצב חיובי עם CTAs עדינים יותר
 */

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, Moon, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ===== קבועים =====

/**
 * מאגר הודעות מיסטיות — ייבחר לפי יום בשנה
 */
const MYSTICAL_MESSAGES: string[] = [
  'הכוכבים ממתינים לך — מה תרצה לגלות היום?',
  'היקום שלח לך מסר — בוא נפענח אותו יחד',
  'הנשמה שלך רוצה לדבר — אתה מקשיב?',
  'יום חדש, תובנה חדשה — מה מחכה לך?',
  'המספרים, הכוכבים והקלפים — הכל מוכן בשבילך',
];

/** הודעה למשתמש שכבר פעיל היום */
const DONE_MESSAGE = 'כל הכבוד! כבר עשית צעד היום';
const DONE_SUB = 'הכוכבים רושמים את ההתקדמות שלך — כל צעד נוסף מחזק את המסע';

/** הגדרות כפתורי CTA */
interface CtaItem {
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly href: string;
  readonly colorClass: string;
  readonly activeColorClass: string;
}

// ===== פונקציות עזר =====

/**
 * מחזיר מספר היום בשנה (1–366)
 * @returns מספר יום בשנה
 */
function getDayOfYear(): number {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * בוחר הודעה מיסטית לפי יום בשנה (דטרמיניסטי — אותה הודעה כל יום)
 * @returns הודעה מיסטית בעברית
 */
function getDailyMessage(): string {
  const index = getDayOfYear() % MYSTICAL_MESSAGES.length;
  const fallback = 'הכוכבים ממתינים לך — מה תרצה לגלות היום?';
  return MYSTICAL_MESSAGES[index] ?? fallback;
}

// ===== טיפוסים =====

/** Props של קומפוננטת פרומפט יומי */
interface DailyPromptProps {
  /** האם למשתמש יש פעילות כלשהי היום */
  readonly hasActivityToday: boolean;
}

// ===== קומפוננטה =====

/**
 * פרומפט יומי מיסטי
 * מציג קריאה לפעולה עם 3 כפתורים לכלים מרכזיים
 * @param hasActivityToday האם יש פעילות היום
 */
export function DailyPrompt({ hasActivityToday }: DailyPromptProps) {
  const shouldReduceMotion = useReducedMotion();
  const dailyMessage = getDailyMessage();

  const ctaItems: readonly CtaItem[] = [
    {
      label: 'תובנה יומית',
      icon: <Sparkles className="h-4 w-4" aria-hidden="true" />,
      href: '/tools/daily-insights',
      colorClass: 'hover:text-primary hover:border-primary/50 hover:bg-primary/5',
      activeColorClass: 'text-primary/60 border-primary/20 bg-primary/3',
    },
    {
      label: 'מצב רוח',
      icon: <Moon className="h-4 w-4" aria-hidden="true" />,
      href: '/mood',
      colorClass: 'hover:text-blue-400 hover:border-blue-500/50 hover:bg-blue-500/5',
      activeColorClass: 'text-blue-400/60 border-blue-500/20 bg-blue-500/3',
    },
    {
      label: 'קלף יומי',
      icon: <Layers className="h-4 w-4" aria-hidden="true" />,
      href: '/tools/tarot',
      colorClass: 'hover:text-yellow-400 hover:border-yellow-500/50 hover:bg-yellow-500/5',
      activeColorClass: 'text-yellow-400/60 border-yellow-500/20 bg-yellow-500/3',
    },
  ] as const;

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border border-primary/15 p-5 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(88,28,135,0.18) 0%, rgba(30,27,75,0.22) 50%, rgba(88,28,135,0.12) 100%)',
        backdropFilter: 'blur(8px)',
      }}
      initial={shouldReduceMotion ? {} : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      role="region"
      aria-label="פרומפט יומי"
      dir="rtl"
    >
      {/* כוכבים דקורטיביים ברקע */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute end-6 top-4 h-1 w-1 rounded-full bg-yellow-300/40" />
        <div className="absolute end-16 top-10 h-0.5 w-0.5 rounded-full bg-purple-300/50" />
        <div className="absolute start-8 top-6 h-1 w-1 rounded-full bg-blue-300/30" />
        <div className="absolute start-20 bottom-6 h-0.5 w-0.5 rounded-full bg-yellow-300/40" />
        <div className="absolute end-10 bottom-5 h-1 w-1 rounded-full bg-purple-300/30" />
      </div>

      <div className="relative space-y-4">
        {/* הודעה מיסטית */}
        <div className="text-center space-y-1">
          {hasActivityToday ? (
            <>
              <p className="text-base sm:text-lg font-semibold font-headline text-foreground leading-snug">
                {DONE_MESSAGE}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-body max-w-sm mx-auto">
                {DONE_SUB}
              </p>
            </>
          ) : (
            <>
              <motion.p
                className="text-base sm:text-xl font-bold font-headline text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-white to-yellow-200 leading-snug"
                animate={shouldReduceMotion ? {} : { opacity: [0.85, 1, 0.85] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {dailyMessage}
              </motion.p>
              <p className="text-xs text-muted-foreground font-body">
                בחר את הכלי שמדבר אליך עכשיו
              </p>
            </>
          )}
        </div>

        {/* כפתורי CTA */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
          {ctaItems.map((cta) => (
            <Link key={cta.href} href={cta.href}>
              <Button
                variant="outline"
                size="sm"
                className={[
                  'h-9 rounded-full border-outline-variant/20 bg-surface-container/40 transition-all gap-2 text-sm font-medium',
                  hasActivityToday
                    ? cta.activeColorClass
                    : `text-foreground/80 ${cta.colorClass}`,
                ].join(' ')}
                aria-label={`עבור ל: ${cta.label}`}
              >
                {cta.icon}
                <span>{cta.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
