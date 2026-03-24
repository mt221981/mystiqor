'use client';

/**
 * דף תזכורות והתראות — /notifications
 * מציג רשימת תזכורות עם אפשרות להוסיף ולמחוק
 * תמיכה ב-optimistic UI לחוויה מהירה
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Bell, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';
import {
  ReminderCard,
  REMINDER_TYPE_LABELS,
} from '@/components/features/notifications/ReminderCard';

import type { Reminder, ReminderType } from '@/components/features/notifications/ReminderCard';

// ===== טיפוסים =====

/** גוף בקשת יצירת תזכורת */
interface CreateReminderInput {
  message: string;
  scheduled_date: string;
  type: ReminderType;
}

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

// ===== קומפוננטה ראשית =====

/** ערך ברירת מחדל לסוג תזכורת */
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

  // מוטציית מחיקה עם optimistic update
  const deleteMutation = useMutation({
    mutationFn: deleteReminder,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['reminders'] });
      const previous = queryClient.getQueryData<Reminder[]>(['reminders']);
      queryClient.setQueryData<Reminder[]>(['reminders'], (old = []) =>
        old.filter((r) => r.id !== id)
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
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

    createMutation.mutate({
      message: message.trim(),
      scheduled_date: new Date(scheduledDate).toISOString(),
      type,
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6" dir="rtl">

      {/* כותרת */}
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary-container/20">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h1 className="font-headline text-3xl font-bold text-on-surface">תזכורות והתראות</h1>
        </div>
        <p className="font-body text-base text-on-surface-variant">
          נהל את התזכורות האישיות שלך לניתוחים, מצב רוח, יומן ויעדים
        </p>
      </div>

      {/* טופס הוספת תזכורת */}
      <Card className="mb-8 border border-outline-variant/10 bg-surface-container/60 backdrop-blur-xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            <h2 className="font-headline text-base font-semibold text-on-surface">הוסף תזכורת חדשה</h2>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="reminder-message"
                className="font-label mb-1.5 block text-sm font-medium text-on-surface-variant"
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
                className="bg-surface-container-lowest border-none text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="reminder-date"
                  className="font-label mb-1.5 block text-sm font-medium text-on-surface-variant"
                >
                  תאריך
                </label>
                <input
                  id="reminder-date"
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className={cn(
                    'w-full rounded-lg bg-surface-container-lowest border-none px-3 py-2',
                    'text-sm text-on-surface',
                    'focus:outline-none focus:ring-1 focus:ring-primary/40',
                    '[color-scheme:dark]'
                  )}
                />
              </div>

              <div>
                <label
                  htmlFor="reminder-type"
                  className="font-label mb-1.5 block text-sm font-medium text-on-surface-variant"
                >
                  סוג
                </label>
                <select
                  id="reminder-type"
                  value={type}
                  onChange={(e) => setType(e.target.value as ReminderType)}
                  className={cn(
                    'w-full rounded-lg bg-surface-container-lowest border-none px-3 py-2',
                    'text-sm text-on-surface',
                    'focus:outline-none focus:ring-1 focus:ring-primary/40'
                  )}
                >
                  {Object.entries(REMINDER_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value} className="bg-surface-container text-on-surface">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {formError && <p className="text-sm text-red-400">{formError}</p>}

            <Button
              type="submit"
              disabled={createMutation.isPending}
              className={cn(
                'w-full bg-gradient-to-br from-primary-container to-secondary-container',
                'font-headline font-bold text-white shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95'
              )}
            >
              {createMutation.isPending ? 'מוסיף...' : 'הוסף תזכורת'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* רשימת תזכורות */}
      <section>
        <h2 className="font-headline mb-4 text-lg font-semibold text-on-surface">התזכורות שלי</h2>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-red-400">שגיאה בטעינת התזכורות — נסה לרענן את הדף</p>
        )}

        {!isLoading && !isError && reminders.length === 0 && (
          <div className="rounded-xl border border-outline-variant/10 bg-surface-container p-8 text-center">
            <Bell className="mx-auto mb-3 h-10 w-10 text-on-surface-variant" />
            <p className="font-body text-on-surface-variant">
              אין תזכורות עדיין — הוסף תזכורת חדשה
            </p>
          </div>
        )}

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
