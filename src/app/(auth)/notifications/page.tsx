'use client';

/**
 * דף תזכורות והתראות — /notifications
 * מציג רשימת תזכורות עם אפשרות להוסיף ולמחוק
 * תמיכה ב-optimistic UI לחוויה מהירה
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

// ===== טיפוסים =====

/** שורת תזכורת מבסיס הנתונים */
interface Reminder {
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

/** גוף בקשת יצירת תזכורת */
interface CreateReminderInput {
  message: string;
  scheduled_date: string;
  type: ReminderType;
}

/** סוגי תזכורות */
type ReminderType = 'analysis' | 'mood' | 'journal' | 'goal' | 'custom';

// ===== קבועים =====

/** תיאורים עבריים לסוגי תזכורות */
const REMINDER_TYPE_LABELS: Record<ReminderType, string> = {
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

// ===== פונקציות API =====

/** שליפת תזכורות מ-API */
async function fetchReminders(): Promise<Reminder[]> {
  const response = await fetch('/api/notifications');
  if (!response.ok) {
    throw new Error('שגיאה בטעינת התזכורות');
  }
  const data = (await response.json()) as { reminders: Reminder[] };
  return data.reminders;
}

/** יצירת תזכורת חדשה */
async function createReminder(input: CreateReminderInput): Promise<Reminder> {
  const response = await fetch('/api/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? 'שגיאה ביצירת התזכורת');
  }
  const data = (await response.json()) as { reminder: Reminder };
  return data.reminder;
}

/** מחיקת תזכורת לפי מזהה */
async function deleteReminder(id: string): Promise<void> {
  const response = await fetch(`/api/notifications?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('שגיאה במחיקת התזכורת');
  }
}

// ===== עזרים =====

/** עיצוב תאריך ל-DD/MM/YYYY */
function formatDate(dateString: string): string {
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

// ===== קומפוננטת כרטיס תזכורת =====

/** מאפייני כרטיס תזכורת בודד */
interface ReminderCardProps {
  readonly reminder: Reminder;
  readonly onDelete: (id: string) => void;
  readonly isDeleting: boolean;
}

/** כרטיס תזכורת בודד עם פרטים וכפתור מחיקה */
function ReminderCard({ reminder, onDelete, isDeleting }: ReminderCardProps) {
  return (
    <Card className="border border-white/10 bg-white/5">
      <CardContent className="flex items-start justify-between gap-4 p-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white mb-2 break-words">{reminder.message}</p>
          <div className="flex items-center gap-2 flex-wrap">
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
            'text-gray-500 hover:text-red-400 hover:bg-red-500/10',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          aria-label="מחק תזכורת"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}

// ===== קומפוננטה ראשית =====

/** ערכי ברירת מחדל לטופס */
const DEFAULT_TYPE: ReminderType = 'custom';

/** דף תזכורות והתראות */
export default function NotificationsPage() {
  const queryClient = useQueryClient();

  // מצב טופס
  const [message, setMessage] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [type, setType] = useState<ReminderType>(DEFAULT_TYPE);
  const [formError, setFormError] = useState<string | null>(null);

  // שאילתת תזכורות
  const {
    data: reminders = [],
    isLoading,
    isError,
  } = useQuery<Reminder[]>({
    queryKey: ['reminders'],
    queryFn: fetchReminders,
    staleTime: 60 * 1000,
  });

  // מוטציית יצירה
  const createMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: (newReminder) => {
      // Optimistic: הוסף מיידית לרשימה
      queryClient.setQueryData<Reminder[]>(['reminders'], (old = []) => [
        newReminder,
        ...old,
      ]);
      setMessage('');
      setScheduledDate('');
      setType(DEFAULT_TYPE);
      setFormError(null);
      toast.success('התזכורת נוספה בהצלחה');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // מוטציית מחיקה
  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onMutate: async (id: string) => {
      // Optimistic: הסר מיידית מהרשימה
      await queryClient.cancelQueries({ queryKey: ['reminders'] });
      const previous = queryClient.getQueryData<Reminder[]>(['reminders']);
      queryClient.setQueryData<Reminder[]>(['reminders'], (old = []) =>
        old.filter((r) => r.id !== id)
      );
      return { previous };
    },
    onError: (_error, _id, context) => {
      // שחזור אם נכשל
      if (context?.previous) {
        queryClient.setQueryData<Reminder[]>(['reminders'], context.previous);
      }
      toast.error('שגיאה במחיקת התזכורת');
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });

  /** שליחת טופס יצירת תזכורת */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!message.trim()) {
      setFormError('יש להזין הודעת תזכורת');
      return;
    }

    if (!scheduledDate) {
      setFormError('יש לבחור תאריך');
      return;
    }

    // המרת תאריך HTML ל-ISO datetime
    const isoDate = new Date(scheduledDate).toISOString();

    createMutation.mutate({ message: message.trim(), scheduled_date: isoDate, type });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6" dir="rtl">

      {/* כותרת */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/30">
            <Bell className="h-5 w-5 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">תזכורות והתראות</h1>
        </div>
        <p className="text-muted-foreground text-base">
          נהל את התזכורות האישיות שלך לניתוחים, מצב רוח, יומן ויעדים
        </p>
      </div>

      {/* טופס הוספת תזכורת */}
      <Card className="mb-8 border border-white/10 bg-white/5">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-purple-400" />
            <h2 className="text-base font-semibold text-white">הוסף תזכורת חדשה</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* הודעה */}
            <div>
              <label
                htmlFor="reminder-message"
                className="mb-1.5 block text-sm font-medium text-gray-300"
              >
                הודעת תזכורת
              </label>
              <Input
                id="reminder-message"
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="לדוגמה: לעשות ניתוח אסטרולוגי חדש"
                maxLength={500}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600"
                aria-required="true"
              />
            </div>

            {/* שורת תאריך וסוג */}
            <div className="grid grid-cols-2 gap-3">
              {/* תאריך */}
              <div>
                <label
                  htmlFor="reminder-date"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  תאריך
                </label>
                <input
                  id="reminder-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className={cn(
                    'w-full rounded-md border border-white/10 bg-white/5 px-3 py-2',
                    'text-sm text-white',
                    'focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500',
                    'transition-colors duration-200',
                    '[color-scheme:dark]'
                  )}
                  aria-required="true"
                />
              </div>

              {/* סוג */}
              <div>
                <label
                  htmlFor="reminder-type"
                  className="mb-1.5 block text-sm font-medium text-gray-300"
                >
                  סוג
                </label>
                <select
                  id="reminder-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ReminderType)}
                  className={cn(
                    'w-full rounded-md border border-white/10 bg-white/5 px-3 py-2',
                    'text-sm text-white',
                    'focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500',
                    'transition-colors duration-200',
                    'bg-gray-900'
                  )}
                >
                  {Object.entries(REMINDER_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-gray-900 text-white">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* שגיאת טופס */}
            {formError && (
              <p className="text-sm text-red-400">{formError}</p>
            )}

            {/* כפתור שליחה */}
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className={cn(
                'w-full bg-gradient-to-l from-purple-600 to-indigo-600',
                'hover:from-purple-700 hover:to-indigo-700',
                'text-white font-medium'
              )}
            >
              {createMutation.isPending ? 'מוסיף...' : 'הוסף תזכורת'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* רשימת תזכורות */}
      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">התזכורות שלי</h2>

        {/* טעינה */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        )}

        {/* שגיאה */}
        {isError && (
          <p className="text-sm text-red-400">שגיאה בטעינת התזכורות — נסה לרענן את הדף</p>
        )}

        {/* מצב ריק */}
        {!isLoading && !isError && reminders.length === 0 && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-gray-600" />
            <p className="text-muted-foreground">
              אין תזכורות עדיין — הוסף תזכורת חדשה
            </p>
          </div>
        )}

        {/* רשימת כרטיסים */}
        {!isLoading && !isError && reminders.length > 0 && (
          <div className="flex flex-col gap-3">
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                reminder={reminder}
                onDelete={(id) => deleteMutation.mutate(id)}
                isDeleting={deleteMutation.isPending}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
