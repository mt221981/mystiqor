'use client';

/**
 * כרטיס תזכורת בודד — מציג פרטי תזכורת עם כפתור מחיקה
 */

import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

// ===== טיפוסים =====

/** שורת תזכורת מבסיס הנתונים */
export interface Reminder {
  id: string;
  message: string;
  scheduled_date: string;
  type: string;
  is_recurring: boolean | null;
  recurrence_rule: string | null;
  status: string | null;
  created_at: string | null;
  user_id: string;
}

/** סוגי תזכורות */
export type ReminderType = 'analysis' | 'mood' | 'journal' | 'goal' | 'custom';

// ===== קבועים =====

/** תיאורים עבריים לסוגי תזכורות */
export const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
  analysis: 'ניתוח',
  mood: 'מצב רוח',
  journal: 'יומן',
  goal: 'יעד',
  custom: 'אחר',
};

/** צבעי badge לפי סוג */
const REMINDER_TYPE_COLORS: Record<ReminderType, string> = {
  analysis: 'bg-purple-600/20 text-purple-300 border-purple-500/30',
  mood: 'bg-yellow-600/20 text-yellow-300 border-yellow-500/30',
  journal: 'bg-blue-600/20 text-blue-300 border-blue-500/30',
  goal: 'bg-green-600/20 text-green-300 border-green-500/30',
  custom: 'bg-gray-600/20 text-gray-300 border-gray-500/30',
};

// ===== עזרים =====

/** עיצוב תאריך ל-DD/MM/YYYY */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateString;
  }
}

/** קבלת תווית סוג תזכורת */
function getTypeLabel(type: string): string {
  return REMINDER_TYPE_LABELS[type as ReminderType] ?? type;
}

/** קבלת צבע badge לפי סוג */
function getTypeColor(type: string): string {
  return REMINDER_TYPE_COLORS[type as ReminderType] ?? REMINDER_TYPE_COLORS.custom;
}

// ===== קומפוננטת כרטיס =====

/** מאפייני כרטיס תזכורת בודד */
interface ReminderCardProps {
  readonly reminder: Reminder;
  readonly onDelete: (id: string) => void;
  readonly isDeleting: boolean;
}

/** כרטיס תזכורת בודד עם פרטים וכפתור מחיקה */
export function ReminderCard({ reminder, onDelete, isDeleting }: ReminderCardProps) {
  return (
    <Card className="border border-white/10 bg-white/5">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0 flex-1">
          <p className="mb-2 break-words text-sm font-medium text-white">
            {reminder.message}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
                getTypeColor(reminder.type)
              )}
            >
              {getTypeLabel(reminder.type)}
            </span>
            <span className="text-xs text-gray-500">
              {formatDate(reminder.scheduled_date)}
            </span>
            {reminder.is_recurring && (
              <span className="text-xs text-indigo-400">חוזר</span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(reminder.id)}
          disabled={isDeleting}
          className={cn(
            'flex-shrink-0 rounded-lg p-2 transition-colors duration-200',
            'text-gray-500 hover:bg-red-500/10 hover:text-red-400',
            'disabled:cursor-not-allowed disabled:opacity-50'
          )}
          aria-label="מחק תזכורת"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}
