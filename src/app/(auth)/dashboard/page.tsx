/**
 * דף דשבורד — Placeholder עם כרטיסי סטטיסטיקות
 * ייבנה במלואו בשלב 2, כרגע מציג מבנה בסיסי
 */

import {
  BarChart3,
  Sparkles,
  Target,
  CalendarDays,
} from 'lucide-react';

// ===== קבועים =====

/** כרטיסי סטטיסטיקות לתצוגה ראשונית */
const STATS_CARDS = [
  {
    icon: Sparkles,
    label: 'ניתוחים',
    value: '0',
    description: 'ניתוחים שבוצעו החודש',
    gradient: 'from-purple-500/20 to-violet-500/20',
    iconColor: 'text-purple-400',
  },
  {
    icon: Target,
    label: 'יעדים',
    value: '0',
    description: 'יעדים פעילים',
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: CalendarDays,
    label: 'רצף יומי',
    value: '0',
    description: 'ימים רצופים של שימוש',
    gradient: 'from-amber-500/20 to-orange-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: BarChart3,
    label: 'תובנות',
    value: '0',
    description: 'תובנות שנוצרו',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-400',
  },
] as const;

// ===== קומפוננטה =====

/** דף דשבורד ראשי — placeholder עם כרטיסי סטטיסטיקות */
export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* כותרת */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          ברוך הבא לדשבורד
        </h1>
        <p className="mt-1 text-muted-foreground">
          כאן תוכל לראות סיכום של הפעילות שלך ולגשת לכלים השונים
        </p>
      </div>

      {/* כרטיסי סטטיסטיקות */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="mt-1 text-3xl font-bold text-foreground">
                    {card.value}
                  </p>
                </div>
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${card.gradient}`}
                >
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {card.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Placeholder לתוכן עתידי */}
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Sparkles className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
        <h2 className="text-lg font-medium text-muted-foreground">
          התוכן המלא ייבנה בקרוב
        </h2>
        <p className="mt-1 text-sm text-muted-foreground/70">
          דשבורד מלא עם תובנות יומיות, סטטיסטיקות מפורטות, ויעדים אישיים
        </p>
      </div>
    </div>
  );
}
