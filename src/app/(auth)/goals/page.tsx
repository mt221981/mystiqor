'use client';

/**
 * עמוד מטרות — CRUD מלא עם סינון לפי סטטוס, טופס ביצירה/עריכה
 * כולל ErrorBoundary, Breadcrumbs, לשוניות סטטוס, Skeleton ו-EmptyState
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Plus, Target } from 'lucide-react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { EmptyState } from '@/components/common/EmptyState';
import { GoalForm } from '@/components/features/goals/GoalForm';
import { GoalCard } from '@/components/features/goals/GoalCard';
import { Button } from '@/components/ui/button';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { queryKeys } from '@/lib/query/cache-config';
import type { GoalCreate, GoalUpdate } from '@/lib/validations/goals';
import type { GoalFormSubmit } from '@/components/features/goals/GoalForm';

// ===== טיפוסים =====

/** נתוני מטרה מה-API */
interface GoalRow {
  id: string;
  title: string;
  description: string | null;
  category: string;
  progress: number | null;
  status: string;
  target_date: string | null;
  created_at: string | null;
  recommendations: { linked_analyses?: string[] } | null;
  preferred_tools: string[] | null;
}

/** טבי סינון */
type StatusFilter = 'all' | 'active' | 'in_progress' | 'completed';

// ===== לשוניות =====

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'הכל' },
  { value: 'active', label: 'פעיל' },
  { value: 'in_progress', label: 'בתהליך' },
  { value: 'completed', label: 'הושלם' },
];

// ===== פונקציות API =====

/** שליפת מטרות לפי סטטוס */
async function fetchGoals(status: StatusFilter): Promise<GoalRow[]> {
  const url = status === 'all' ? '/api/goals' : `/api/goals?status=${status}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('שגיאה בטעינת מטרות');
  const json = await res.json() as { data: GoalRow[] };
  return json.data;
}

/** יצירת מטרה חדשה */
async function createGoal(data: GoalCreate): Promise<GoalRow> {
  const res = await fetch('/api/goals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('שגיאה ביצירת מטרה');
  const json = await res.json() as { data: GoalRow };
  return json.data;
}

/** עדכון מטרה */
async function updateGoal(id: string, data: GoalUpdate & { linked_analyses?: string[] }): Promise<GoalRow> {
  const res = await fetch(`/api/goals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('שגיאה בעדכון מטרה');
  const json = await res.json() as { data: GoalRow };
  return json.data;
}

/** מחיקת מטרה */
async function deleteGoal(id: string): Promise<void> {
  const res = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('שגיאה במחיקת מטרה');
}

// ===== Skeleton =====

/** כרטיסי skeleton בטעינה */
function GoalsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl border border-outline-variant/5 bg-surface-container p-5 space-y-3">
          <MysticSkeleton className="h-5 w-3/4" />
          <MysticSkeleton className="h-3 w-full" />
          <MysticSkeleton className="h-3 w-1/2" />
          <div className="flex gap-2">
            <MysticSkeleton className="h-5 w-16 rounded-full" />
            <MysticSkeleton className="h-5 w-14 rounded-full" />
          </div>
          <MysticSkeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/** עמוד מטרות — ניהול CRUD עם לשוניות סינון */
function GoalsPageContent() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<StatusFilter>('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalRow | null>(null);

  /** שליפת מטרות */
  const { data: goals, isLoading } = useQuery({
    queryKey: queryKeys.goals.list({ status: activeTab }),
    queryFn: () => fetchGoals(activeTab),
  });

  /** יצירת מטרה */
  const createMutation = useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      setIsCreateOpen(false);
      toast.success('המטרה נוצרה בהצלחה');
    },
    onError: () => toast.error('שגיאה ביצירת מטרה'),
  });

  /** עדכון מטרה */
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: GoalUpdate & { linked_analyses?: string[] } }) =>
      updateGoal(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      setEditingGoal(null);
      toast.success('המטרה עודכנה בהצלחה');
    },
    onError: () => toast.error('שגיאה בעדכון מטרה'),
  });

  /** מחיקת מטרה */
  const deleteMutation = useMutation({
    mutationFn: deleteGoal,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.goals.all });
      toast.success('המטרה נמחקה');
    },
    onError: () => toast.error('שגיאה במחיקת מטרה'),
  });

  /** עדכון התקדמות מהיר */
  function handleProgressUpdate(id: string, progress: number) {
    updateMutation.mutate({ id, data: { progress } });
  }

  return (
    <div className="space-y-6 p-6" dir="rtl">
      {/* פירורי לחם */}
      <Breadcrumbs
        items={[
          { label: 'לוח בקרה', href: '/dashboard' },
          { label: 'מטרות' },
        ]}
      />

      {/* כותרת ופעולה ראשית */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-2xl font-bold text-on-surface">המטרות שלי</h1>
          <p className="text-sm text-on-surface-variant">הגדר ועקוב אחר המטרות האישיות שלך</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-br from-primary-container to-secondary-container font-headline font-bold text-white shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
        >
          <Plus className="me-2 h-4 w-4" />
          מטרה חדשה
        </Button>
      </div>

      {/* לשוניות סינון */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as StatusFilter)}>
        <TabsList className="bg-surface-container-high">
          {STATUS_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {STATUS_TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-6">
            {isLoading ? (
              <GoalsSkeleton />
            ) : !goals || goals.length === 0 ? (
              <EmptyState
                icon={<Target className="h-8 w-8" />}
                title={tab.value === 'all' ? 'אין מטרות עדיין' : `אין מטרות בסטטוס "${tab.label}"`}
                description="הגדר מטרה חדשה ועקוב אחר ההתקדמות שלך"
                action={{ label: 'מטרה חדשה', onClick: () => setIsCreateOpen(true) }}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {goals.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onEdit={(g) => setEditingGoal(g as GoalRow)}
                    onDelete={(id) => deleteMutation.mutate(id)}
                    onProgressUpdate={handleProgressUpdate}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog: יצירת מטרה */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>מטרה חדשה</DialogTitle>
          </DialogHeader>
          <GoalForm
            onSubmit={(data: GoalFormSubmit) => createMutation.mutate({
              title: data.title,
              description: data.description,
              category: data.category,
              target_date: data.target_date,
              preferred_tools: data.preferred_tools,
            } satisfies GoalCreate)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: עריכת מטרה */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => { if (!open) setEditingGoal(null); }}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>עריכת מטרה</DialogTitle>
          </DialogHeader>
          {editingGoal && (
            <GoalForm
              isEdit
              initialData={{
                title: editingGoal.title,
                description: editingGoal.description ?? undefined,
                category: editingGoal.category as GoalCreate['category'],
                target_date: editingGoal.target_date ?? undefined,
                preferred_tools: editingGoal.preferred_tools ?? [],
                progress: editingGoal.progress ?? 0,
                status: editingGoal.status as 'active' | 'in_progress' | 'completed',
                linked_analyses: editingGoal.recommendations?.linked_analyses ?? [],
              }}
              onSubmit={(data: GoalFormSubmit) => {
                const { linked_analyses, progress, status, ...rest } = data;
                const updateData: GoalUpdate & { linked_analyses?: string[] } = {
                  ...rest,
                  progress,
                  status: status as GoalUpdate['status'],
                  linked_analyses,
                };
                updateMutation.mutate({
                  id: editingGoal.id,
                  data: updateData,
                });
              }}
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** עמוד מטרות עטוף ב-ErrorBoundary */
export default function GoalsPage() {
  return (
    <ErrorBoundary>
      <GoalsPageContent />
    </ErrorBoundary>
  );
}
