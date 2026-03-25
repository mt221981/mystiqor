'use client';

/**
 * עמוד יומן אישי — CRUD מלא לרשומות יומן
 * כולל: יצירה, עריכה, מחיקה, רשימת רשומות
 * D-07: pre-fill מצב רוח מ-URL params (?mood_score, ?mood)
 * D-08: טופס מלא עם כותרת, תוכן, מצב רוח, אנרגיה, הכרת תודה
 * D-09: כרטיסי רשומה עם אמוג'י מצב רוח, תאריך, תצוגה מקוצרת
 */

import { useState, Suspense } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, X } from 'lucide-react';

import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { JournalEntryForm } from '@/components/features/journal/JournalEntryForm';
import { JournalEntryCard } from '@/components/features/journal/JournalEntryCard';
import { Button } from '@/components/ui/button';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
import { queryKeys } from '@/lib/query/cache-config';
import { cn } from '@/lib/utils/cn';

import type { JournalCreate } from '@/lib/validations/journal';

// ===== טיפוסים =====

/** נתוני רשומת יומן מה-API */
interface JournalEntry {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  mood_score: number | null;
  energy_level: number | null;
  gratitude: string[] | null;
  goals: string[] | null;
  created_at: string | null;
  updated_at: string | null;
}

/** תשובת API לרשימת רשומות */
interface JournalListResponse {
  data: JournalEntry[];
  total: number;
  page: number;
  limit: number;
}

// ===== קבועים =====

/** פריטי פירורי לחם */
const BREADCRUMB_ITEMS = [
  { label: 'לוח בקרה', href: '/dashboard' },
  { label: 'יומן אישי' },
] as const;

// ===== פונקציות fetch =====

/** שולף רשימת רשומות יומן */
async function fetchJournalEntries(): Promise<JournalListResponse> {
  const res = await fetch('/api/journal?limit=50');
  if (!res.ok) throw new Error('שגיאה בטעינת רשומות יומן');
  return res.json() as Promise<JournalListResponse>;
}

/** יוצר רשומת יומן חדשה */
async function createJournalEntry(data: JournalCreate): Promise<JournalEntry> {
  const res = await fetch('/api/journal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('שגיאה ביצירת רשומת יומן');
  const json = await res.json() as { data: JournalEntry };
  return json.data;
}

/** מעדכן רשומת יומן קיימת */
async function updateJournalEntry(id: string, data: JournalCreate): Promise<JournalEntry> {
  const res = await fetch(`/api/journal/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('שגיאה בעדכון רשומת יומן');
  const json = await res.json() as { data: JournalEntry };
  return json.data;
}

/** מוחק רשומת יומן */
async function deleteJournalEntry(id: string): Promise<void> {
  const res = await fetch(`/api/journal/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('שגיאה במחיקת רשומת יומן');
}

// ===== skeleton loading =====

/** 3 skeleton cards בעת טעינה */
function JournalSkeletons() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <MysticSkeleton key={i} className="h-[120px] w-full rounded-xl" />
      ))}
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/**
 * עמוד יומן אישי — CRUD מלא
 * useQuery לקריאה, useMutation ליצירה/עדכון/מחיקה
 */
function JournalPageContent() {
  const queryClient = useQueryClient();

  /** מצב — האם הטופס פתוח */
  const [isFormOpen, setIsFormOpen] = useState(false);
  /** מצב — רשומה נערכת (null = יצירה חדשה) */
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  /** מצב — מצב הטופס: מלא או מהיר */
  const [formMode, setFormMode] = useState<'full' | 'quick'>('full');

  // --- React Query ---

  const {
    data: journalData,
    isLoading,
    error,
  } = useQuery({
    queryKey: queryKeys.journal.list(),
    queryFn: fetchJournalEntries,
  });

  const createMutation = useMutation({
    mutationFn: createJournalEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      setIsFormOpen(false);
      setEditingEntry(null);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: JournalCreate }) =>
      updateJournalEntry(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
      setIsFormOpen(false);
      setEditingEntry(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJournalEntry,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
    },
  });

  // --- handlers ---

  /** פתיחת טופס יצירה */
  function handleNewEntry(mode: 'full' | 'quick') {
    setEditingEntry(null);
    setFormMode(mode);
    setIsFormOpen(true);
  }

  /** פתיחת טופס עריכה */
  function handleEditEntry(entry: JournalEntry) {
    setEditingEntry(entry);
    setFormMode('full');
    setIsFormOpen(true);
  }

  /** שמירת טופס */
  function handleFormSubmit(data: JournalCreate) {
    if (editingEntry) {
      updateMutation.mutate({ id: editingEntry.id, data });
    } else {
      createMutation.mutate(data);
    }
  }

  /** ביטול */
  function handleCancel() {
    setIsFormOpen(false);
    setEditingEntry(null);
  }

  const entries = journalData?.data ?? [];
  const isMutating =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="min-h-screen p-4 md:p-6" dir="rtl">
      {/* פירורי לחם */}
      <div className="mb-4">
        <Breadcrumbs items={BREADCRUMB_ITEMS} />
      </div>

      {/* כותרת + כפתורים */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">יומן אישי</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            {journalData?.total ? `${journalData.total} רשומות` : 'אין רשומות עדיין'}
          </p>
        </div>

        {/* כפתורי יצירה */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleNewEntry('quick')}
            disabled={isMutating}
            className="border-outline-variant/20 hover:border-primary/40"
          >
            <Plus className="h-4 w-4 ml-1" aria-hidden="true" />
            רשומה מהירה
          </Button>
          <Button
            size="sm"
            onClick={() => handleNewEntry('full')}
            disabled={isMutating}
          >
            <Plus className="h-4 w-4 ml-1" aria-hidden="true" />
            רשומה חדשה
          </Button>
        </div>
      </div>

      {/* טופס יצירה/עריכה — מתקפל */}
      {isFormOpen && (
        <div
          className={cn(
            'mb-6 rounded-xl border border-outline-variant/10 bg-surface-container/60 backdrop-blur-xl p-5',
            'shadow-xl shadow-black/20'
          )}
        >
          {/* כותרת הטופס */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-headline text-base font-semibold text-on-surface">
              {editingEntry ? 'עריכת רשומה' : formMode === 'quick' ? 'רשומה מהירה' : 'רשומה חדשה'}
            </h2>
            <button
              type="button"
              onClick={handleCancel}
              aria-label="סגור טופס"
              className="text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Suspense עבור useSearchParams בתוך JournalEntryForm */}
          <Suspense fallback={<div className="h-40 animate-pulse rounded-lg bg-white/5" />}>
            <JournalEntryForm
              initialData={
                editingEntry
                  ? {
                      id: editingEntry.id,
                      title: editingEntry.title ?? undefined,
                      content: editingEntry.content,
                      mood: editingEntry.mood ?? undefined,
                      mood_score: editingEntry.mood_score ?? undefined,
                      energy_level: editingEntry.energy_level ?? undefined,
                      gratitude: editingEntry.gratitude ?? [],
                      goals: editingEntry.goals ?? [],
                    }
                  : undefined
              }
              onSubmit={handleFormSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
              mode={formMode}
              onCancel={handleCancel}
            />
          </Suspense>

          {/* הודעות שגיאה מ-mutations */}
          {(createMutation.isError || updateMutation.isError) && (
            <p className="mt-3 text-sm text-destructive">
              {(createMutation.error as Error)?.message ??
                (updateMutation.error as Error)?.message ??
                'שגיאה בשמירת הרשומה'}
            </p>
          )}
        </div>
      )}

      {/* מצב טעינה */}
      {isLoading && <JournalSkeletons />}

      {/* מצב שגיאה */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
          שגיאה בטעינת רשומות היומן. נסה לרענן את הדף.
        </div>
      )}

      {/* מצב ריק */}
      {!isLoading && !error && entries.length === 0 && (
        <EmptyState
          icon={<BookOpen className="h-8 w-8" />}
          title="אין רשומות יומן עדיין"
          description="התחל לתעד את המחשבות, הרגשות והתובנות שלך ביומן האישי"
          action={{ label: 'רשומה ראשונה', onClick: () => handleNewEntry('full') }}
        />
      )}

      {/* רשימת רשומות */}
      {!isLoading && entries.length > 0 && (
        <div className="space-y-3">
          {entries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={handleEditEntry}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          ))}
        </div>
      )}

      {/* שגיאת מחיקה */}
      {deleteMutation.isError && (
        <p className="mt-3 text-sm text-destructive">
          {(deleteMutation.error as Error)?.message ?? 'שגיאה במחיקת הרשומה'}
        </p>
      )}
    </div>
  );
}

/** עמוד יומן אישי עטוף ב-ErrorBoundary */
export default function JournalPage() {
  return (
    <ErrorBoundary>
      <JournalPageContent />
    </ErrorBoundary>
  );
}
