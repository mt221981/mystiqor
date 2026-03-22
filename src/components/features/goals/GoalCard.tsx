'use client';

/**
 * כרטיס מטרה — מציג פרטי מטרה, פס התקדמות, עדכון מהיר ופעולות
 * כולל badge קטגוריה מצבעוני, badge סטטוס, ותאריך יעד מפורמט
 */

import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
  active: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  in_progress: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  completed: 'bg-green-500/20 text-green-300 border border-green-500/30',
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
        'relative rounded-xl border border-white/10 bg-gray-900/60 p-5',
        'transition-all duration-200 hover:border-white/20 hover:bg-gray-900/80',
        goal.status === 'completed' && 'opacity-75'
      )}
      dir="rtl"
    >
      {/* כותרת ופעולות */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white leading-snug truncate">{goal.title}</h3>
          {goal.description && (
            <p className="mt-1 text-xs text-gray-400 line-clamp-2">{goal.description}</p>
          )}
        </div>

        {/* כפתורי עריכה ומחיקה */}
        <div className="flex shrink-0 items-center gap-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onEdit(goal)}
            className="h-7 w-7 text-gray-400 hover:text-purple-400"
            aria-label="ערוך מטרה"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => onDelete(goal.id)}
            className="h-7 w-7 text-gray-400 hover:text-red-400"
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
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
              'bg-gradient-to-r text-white',
              categoryInfo.color
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
          <span className="text-xs text-gray-500">
            יעד: {formatTargetDate(goal.target_date)}
          </span>
        )}
      </div>

      {/* פס התקדמות */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">התקדמות</span>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-white">{progress}%</span>
            {goal.status !== 'completed' && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={handleProgressIncrement}
                disabled={progress >= 100}
                className="h-6 w-6 rounded-full bg-purple-600/20 text-purple-400 hover:bg-purple-600/40"
                aria-label="הוסף 10% התקדמות"
                title="+ 10%"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <Progress
          value={progress}
          className="h-2"
          aria-label={`התקדמות: ${progress}%`}
        />
      </div>
    </article>
  );
}
