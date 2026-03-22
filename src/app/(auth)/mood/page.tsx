'use client';

/**
 * דף מעקב מצב רוח — רישום יומי של מצב רוח, אנרגיה, לחץ ושינה
 * כולל טופס עם בורר אמוג'י, סליידרים ורשימת רשומות אחרונות
 */

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { SmilePlus, BookOpen } from 'lucide-react';
import Link from 'next/link';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { MoodEmojiPicker } from '@/components/features/mood/MoodEmojiPicker';
import { MoodEntryCard } from '@/components/features/mood/MoodEntryCard';
import { Slider } from '@/components/ui/slider';
import { Skeleton } from '@/components/ui/skeleton';
import { z } from 'zod';
import { MoodCreateSchema, type MoodCreate } from '@/lib/validations/mood';

/** טיפוס קלט לטופס — תואם ל-React Hook Form (לפני Zod transforms) */
type MoodFormValues = z.input<typeof MoodCreateSchema>;
import { queryKeys } from '@/lib/query/cache-config';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils/cn';
import type { Tables } from '@/types/database';

// ===== טיפוסים =====

type MoodEntry = Tables<'mood_entries'>;

// ===== פונקציות API =====

/** שליפת רשומות מצב רוח מה-API */
async function fetchMoods(period = 'weekly'): Promise<MoodEntry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('mood_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw new Error('שגיאה בטעינת רשומות מצב הרוח');
  return data ?? [];
}

/** יצירת רשומת מצב רוח חדשה */
async function createMood(data: MoodCreate): Promise<MoodEntry> {
  const response = await fetch('/api/mood', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(
      (body as { error?: string }).error ?? 'שגיאה ברישום מצב הרוח'
    );
  }

  const result = (await response.json()) as { data: MoodEntry };
  return result.data;
}

/** מחיקת רשומת מצב רוח */
async function deleteMood(id: string): Promise<void> {
  const response = await fetch(`/api/mood/${id}`, { method: 'DELETE' });

  if (!response.ok) {
    throw new Error('שגיאה במחיקת הרשומה');
  }
}

// ===== קומפוננטת Skeleton =====

/** טעינת Skeleton לרשומות */
function MoodEntriesSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/** דף מעקב מצב רוח */
export default function MoodPage() {
  const queryClient = useQueryClient();
  const [selectedScore, setSelectedScore] = useState<number | null>(null);

  // טופס React Hook Form עם Zod
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MoodFormValues>({
    resolver: zodResolver(MoodCreateSchema),
    defaultValues: {
      mood: '',
      mood_score: 0,
      energy_level: 5,
      stress_level: 5,
      sleep_quality: 5,
      notes: '',
      activities: [],
      gratitude: [],
    },
  });

  const currentMood = watch('mood');
  const currentScore = watch('mood_score');

  // שאילתת רשומות
  const {
    data: entries = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: queryKeys.moods.list({ period: 'weekly' }),
    queryFn: () => fetchMoods('weekly'),
    staleTime: 2 * 60 * 1000,
  });

  // מוטציית יצירה
  const createMutation = useMutation({
    mutationFn: createMood,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.moods.all });
      toast.success('מצב הרוח נרשם בהצלחה');
      reset();
      setSelectedScore(null);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // מוטציית מחיקה
  const deleteMutation = useMutation({
    mutationFn: deleteMood,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.moods.all });
      toast.success('הרשומה נמחקה');
    },
    onError: () => {
      toast.error('שגיאה במחיקת הרשומה');
    },
  });

  /** עדכון ערכי בורר אמוג'י */
  function handleMoodSelect(score: number, label: string) {
    setSelectedScore(score);
    setValue('mood_score', score, { shouldValidate: true });
    setValue('mood', label, { shouldValidate: true });
  }

  /** שליחת הטופס — Zod output (after transforms) is MoodCreate */
  function onSubmit(data: MoodFormValues) {
    createMutation.mutate(data as MoodCreate);
  }

  return (
    <ErrorBoundary>
      <div className="mx-auto max-w-2xl px-4 py-6" dir="rtl">

        {/* פירורי לחם */}
        <div className="mb-6">
          <Breadcrumbs
            items={[
              { label: 'לוח בקרה', href: '/dashboard' },
              { label: 'מצב רוח' },
            ]}
          />
        </div>

        {/* כותרת */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">מעקב מצב רוח</h1>
          <p className="mt-1 text-sm text-gray-400">
            רשום את מצב הרוח שלך כדי לזהות מגמות ולשפר את האיזון האישי
          </p>
        </div>

        {/* טופס רישום */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn(
            'mb-10 rounded-2xl border border-white/10 bg-white/5 p-6',
            'space-y-6'
          )}
        >
          {/* בורר אמוג'י */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">
              איך אתה מרגיש?
            </label>
            <MoodEmojiPicker value={selectedScore} onChange={handleMoodSelect} />
            {errors.mood && (
              <p className="mt-2 text-xs text-red-400">{errors.mood.message}</p>
            )}
            {errors.mood_score && (
              <p className="mt-1 text-xs text-red-400">
                {errors.mood_score.message}
              </p>
            )}
          </div>

          {/* סליידרים */}
          <div className="space-y-5">
            {/* אנרגיה */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  רמת אנרגיה
                </label>
                <span className="text-sm text-purple-300">
                  {watch('energy_level') ?? 5}/10
                </span>
              </div>
              <Controller
                name="energy_level"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={1}
                    max={10}
                    value={[field.value ?? 5]}
                    onValueChange={(vals) => {
                      const first = Array.isArray(vals)
                        ? (vals as number[])[0]
                        : (vals as number);
                      field.onChange(first);
                    }}
                    aria-label="רמת אנרגיה"
                  />
                )}
              />
            </div>

            {/* לחץ */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  רמת לחץ
                </label>
                <span className="text-sm text-purple-300">
                  {watch('stress_level') ?? 5}/10
                </span>
              </div>
              <Controller
                name="stress_level"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={1}
                    max={10}
                    value={[field.value ?? 5]}
                    onValueChange={(vals) => {
                      const first = Array.isArray(vals)
                        ? (vals as number[])[0]
                        : (vals as number);
                      field.onChange(first);
                    }}
                    aria-label="רמת לחץ"
                  />
                )}
              />
            </div>

            {/* שינה */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  איכות שינה
                </label>
                <span className="text-sm text-purple-300">
                  {watch('sleep_quality') ?? 5}/10
                </span>
              </div>
              <Controller
                name="sleep_quality"
                control={control}
                render={({ field }) => (
                  <Slider
                    min={1}
                    max={10}
                    value={[field.value ?? 5]}
                    onValueChange={(vals) => {
                      const first = Array.isArray(vals)
                        ? (vals as number[])[0]
                        : (vals as number);
                      field.onChange(first);
                    }}
                    aria-label="איכות שינה"
                  />
                )}
              />
            </div>
          </div>

          {/* הערות */}
          <div>
            <label
              htmlFor="mood-notes"
              className="mb-2 block text-sm font-medium text-gray-300"
            >
              הערות (אופציונלי)
            </label>
            <textarea
              id="mood-notes"
              {...register('notes')}
              placeholder="מה עוד שווה לרשום על היום הזה?"
              rows={3}
              className={cn(
                'w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3',
                'text-sm text-white placeholder:text-gray-600',
                'focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500',
                'resize-none transition-colors duration-200'
              )}
            />
            {errors.notes && (
              <p className="mt-1 text-xs text-red-400">
                {errors.notes.message}
              </p>
            )}
          </div>

          {/* פעולות */}
          <div className="flex items-center justify-between gap-3">
            {/* קישור הרחבה ליומן (D-07) */}
            {currentScore > 0 && currentMood && (
              <Link
                href={`/journal?mood_score=${currentScore}&mood=${encodeURIComponent(currentMood)}`}
                className={cn(
                  'inline-flex items-center gap-2 rounded-lg px-4 py-2.5',
                  'border border-white/10 text-sm text-gray-300',
                  'hover:border-purple-400/50 hover:text-purple-300',
                  'transition-colors duration-200'
                )}
              >
                <BookOpen className="h-4 w-4" />
                הרחב ליומן
              </Link>
            )}

            {/* כפתור שמירה */}
            <button
              type="submit"
              disabled={isSubmitting || createMutation.isPending}
              className={cn(
                'inline-flex items-center gap-2 rounded-lg px-6 py-2.5',
                'bg-purple-600 text-sm font-medium text-white',
                'hover:bg-purple-500 active:bg-purple-700',
                'disabled:cursor-not-allowed disabled:opacity-60',
                'transition-colors duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
                'ms-auto'
              )}
            >
              <SmilePlus className="h-4 w-4" />
              {createMutation.isPending ? 'שומר...' : 'רשום מצב רוח'}
            </button>
          </div>
        </form>

        {/* רשימת רשומות אחרונות */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-white">
            רשומות אחרונות
          </h2>

          {isLoading && <MoodEntriesSkeleton />}

          {isError && (
            <p className="text-sm text-red-400">
              שגיאה בטעינת הרשומות — נסה לרענן את הדף
            </p>
          )}

          {!isLoading && !isError && entries.length === 0 && (
            <EmptyState
              title="אין רשומות עדיין"
              description="רשום את מצב הרוח הראשון שלך עם הטופס למעלה"
            />
          )}

          {!isLoading && !isError && entries.length > 0 && (
            <div className="flex flex-col gap-3">
              {entries.map((entry) => (
                <MoodEntryCard
                  key={entry.id}
                  entry={entry}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </ErrorBoundary>
  );
}
