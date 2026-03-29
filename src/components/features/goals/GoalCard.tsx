'use client';

/**
 * כרטיס מטרה — מציג פרטי מטרה, פס התקדמות, עדכון מהיר ופעולות
 * כולל badge קטגוריה מצבעוני, badge סטטוס, ותאריך יעד מפורמט
 */

import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GOAL_CATEGORIES } from '@/lib/constants/categories';
import { cn } from '@/lib/utils/cn';

// ===== ממשק טיפוסים =====

/** נתוני מטרה המוצגים בכרטיס */
interface GoalData {
  id: string;
  title: string;
  description: string | null;
  category: string;
  progress: number | null;
  status: string;
  target_date: string | null;
  created_at: string | null;
}

/** מאפייני כרטיס המטרה */
interface GoalCardProps {
  readonly goal: GoalData;
  readonly onEdit: (goal: GoalData) => void;
  readonly onDelete: (id: string) => void;
  readonly onProgressUpdate: (id: string, progress: number) => void;
}

// ===== קבועים =====

/** צבעי badge לפי סטטוס */
const STATUS_STYLES: Record<string, string> = {
  active: 'bg-tertiary/10 text-tertiary font-label text-xs',
  in_progress: 'bg-primary/10 text-primary font-label text-xs',
  completed: 'bg-primary/10 text-primary font-label text-xs',
};

/** תרגום סטטוסים לעברית */
const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  in_progress: 'בתהליך',
  completed: 'הושלם',
};

// ===== קומפוננטה ראשית =====

/**
 * כרטיס מטרה — מציג את פרטי המטרה עם פס התקדמות
 * וכפתורי פעולה לעריכה, מחיקה ועדכון מהיר
 */
export function GoalCard({ goal, onEdit, onDelete, onProgressUpdate }: GoalCardProps) {
  const progress = goal.progress ?? 0;
  const categoryInfo = GOAL_CATEGORIES[goal.category as keyof typeof GOAL_CATEGORIES];

  /** עדכון התקדמות ב-+10% (עד 100) */
  function handleProgressIncrement() {
    const newProgress = Math.min(progress + 10, 100);
    onProgressUpdate(goal.id, newProgress);
  }

  /** פורמט תאריך יעד לפורמט עברי */
  function formatTargetDate(dateStr: string): string {
    try {
      return format(new Date(dateStr), 'dd/MM/yyyy', { locale: he });
    } catch {
      return dateStr;
    }
  }

  return (
    <article
      className={cn(
        'bg-surface-container rounded-xl p-5 border border-outline-variant/5',
        'transition-all duration-200 hover:border-primary/10',
        goal.status === 'completed' && 'opacity-75'
      )}
      dir="rtl"
    >
      {/* כותרת ופעולות */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-headline font-semibold text-on-surface leading-snug truncate">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 text-xs text-on-surface-variant line-clamp-2">{goal.description}</p>
          )}
        </div>

        {/* כפתורי עריכה ומחיקה */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onEdit(goal)}
            className="h-7 w-7 text-on-surface-variant hover:text-primary"
            aria-label="ערוך מטרה"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onDelete(goal.id)}
            className="h-7 w-7 text-error/80 hover:text-error"
            aria-label="מחק מטרה"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* badges קטגוריה וסטטוס */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {categoryInfo && (
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5',
              'bg-primary-container/10 text-primary font-label text-xs'
            )}
          >
            {categoryInfo.icon} {categoryInfo.label}
          </span>
        )}
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            STATUS_STYLES[goal.status] ?? STATUS_STYLES['active']
          )}
        >
          {STATUS_LABELS[goal.status] ?? goal.status}
        </span>
        {goal.target_date && (
          <span className="font-label text-xs text-on-surface-variant">
            יעד: {formatTargetDate(goal.target_date)}
          </span>
        )}
      </div>

      {/* פס התקדמות */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-label text-xs text-on-surface-variant">התקדמות</span>
          <div className="flex items-center gap-2">
            <span className="font-label text-xs font-medium text-on-surface-variant">{progress}%</span>
            {goal.status !== 'completed' && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleProgressIncrement}
                disabled={progress >= 100}
                className="h-6 w-6 rounded-full bg-primary-container/20 text-primary hover:bg-primary-container/40"
                aria-label="הוסף 10% התקדמות"
                title="+ 10%"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden" aria-label={`התקדמות: ${progress}%`}>
          <div
            className="h-full bg-gradient-to-l from-primary-container to-secondary-container rounded-full shadow-[0_0_15px_rgba(143,45,230,0.4)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </article>
  );
}
