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
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
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
        <MysticSkeleton key={i} className="h-24 w-full rounded-xl" />
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
          <h1 className="font-headline text-2xl font-bold text-on-surface">מעקב מצב רוח</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            רשום את מצב הרוח שלך כדי לזהות מגמות ולשפר את האיזון האישי
          </p>
        </div>

        {/* טופס רישום */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={cn(
            'mb-10 rounded-2xl border border-outline-variant/10 bg-surface-container/60 backdrop-blur-xl p-6',
            'space-y-6'
          )}
        >
          {/* בורר אמוג'י */}
          <div>
            <label className="font-label mb-3 block text-sm font-medium text-on-surface-variant">
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
                <label className="font-label text-sm font-medium text-on-surface-variant">
                  רמת אנרגיה
                </label>
                <span className="font-label text-sm text-primary">
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
                <label className="font-label text-sm font-medium text-on-surface-variant">
                  רמת לחץ
                </label>
                <span className="font-label text-sm text-primary">
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
                <label className="font-label text-sm font-medium text-on-surface-variant">
                  איכות שינה
                </label>
                <span className="font-label text-sm text-primary">
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
              className="font-label mb-2 block text-sm font-medium text-on-surface-variant"
            >
              הערות (אופציונלי)
            </label>
            <textarea
              id="mood-notes"
              {...register('notes')}
              placeholder="מה עוד שווה לרשום על היום הזה?"
              rows={3}
              className={cn(
                'w-full bg-surface-container-lowest border-none rounded-lg px-4 py-3',
                'text-sm text-on-surface placeholder:text-outline/40',
                'focus:outline-none focus:ring-1 focus:ring-primary/40',
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
                  'border border-outline-variant/20 text-sm text-on-surface-variant',
                  'hover:border-primary/40 hover:text-primary',
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
                'inline-flex items-center gap-2 rounded-xl px-6 py-2.5',
                'bg-gradient-to-br from-primary-container to-secondary-container font-headline font-bold text-white',
                'shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95',
                'disabled:cursor-not-allowed disabled:opacity-60',
                'transition-all duration-200',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
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
          <h2 className="font-headline mb-4 text-lg font-semibold text-on-surface">
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
