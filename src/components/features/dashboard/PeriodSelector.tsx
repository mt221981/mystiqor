'use client';

/**
 * בוחר תקופה — כפתורי טאב ליומי/שבועי/חודשי
 * משפיע על תרשים מגמת מצב רוח ותרשים ניתוחים (Pitfall 7)
 */

// ===== טיפוסים =====

/** ערכי תקופה אפשריים */
export type Period = 'daily' | 'weekly' | 'monthly';

/** Props של בוחר תקופה */
interface PeriodSelectorProps {
  /** תקופה נבחרת כרגע */
  readonly value: Period;
  /** callback בעת שינוי תקופה */
  readonly onChange: (period: Period) => void;
}

// ===== קבועים =====

/** הגדרות כפתורי תקופה */
const PERIOD_OPTIONS: Array<{ readonly value: Period; readonly label: string }> = [
  { value: 'daily', label: 'יומי' },
  { value: 'weekly', label: 'שבועי' },
  { value: 'monthly', label: 'חודשי' },
];

// ===== קומפוננטה =====

/**
 * בוחר תקופה — 3 כפתורי טאב בשורה אחת
 * הטאב הנבחר עם עיצוב active
 */
export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div
      className="inline-flex rounded-lg border border-border bg-muted/30 p-0.5"
      role="group"
      aria-label="בחר תקופה"
      dir="rtl"
    >
      {PERIOD_OPTIONS.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={
              isActive
                ? 'rounded-md px-4 py-1.5 text-sm font-medium transition-all bg-primary text-primary-foreground shadow-sm'
                : 'rounded-md px-4 py-1.5 text-sm font-medium transition-all text-muted-foreground hover:text-foreground hover:bg-background/50'
            }
            aria-pressed={isActive}
            aria-label={option.label}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
