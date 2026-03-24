'use client';

/**
 * טופס יצירה ועריכת מטרה אישית
 * כולל 8 קטגוריות, תאריך יעד, כלים מועדפים, התקדמות ומצב (במצב עריכה)
 * ו-TRCK-04: קישור ניתוחים קיימים למטרה
 */

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/client';
import { GoalCreateSchema } from '@/lib/validations/goals';
import { queryKeys } from '@/lib/query/cache-config';
import { GOAL_CATEGORIES } from '@/lib/constants/categories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { GoalCreate } from '@/lib/validations/goals';

// ===== סכמה מורחבת לטופס (יצירה + עריכה) =====

/** סכמת טופס מלאה — מרחיבה GoalCreateSchema עם שדות עריכה */
const GoalFormSchema = GoalCreateSchema.extend({
  progress: z
    .number()
    .int()
    .min(0)
    .max(100)
    .optional(),
  status: z
    .enum(['active', 'in_progress', 'completed'])
    .optional(),
  linked_analyses: z.array(z.string()).optional(),
});

/** טיפוס ערכי הטופס (input) */
type GoalFormValues = z.input<typeof GoalFormSchema>;

// ===== קבועים =====

/** תרגום שמות קטגוריות לעברית */
const CATEGORY_LABELS: Record<string, string> = {
  career: 'קריירה',
  relationships: 'מערכות יחסים',
  personal_growth: 'צמיחה אישית',
  health: 'בריאות',
  spirituality: 'רוחניות',
  creativity: 'יצירתיות',
  finance: 'כלכלה',
  other: 'אחר',
};

/** תרגום סטטוסים לעברית */
const STATUS_LABELS: Record<string, string> = {
  active: 'פעיל',
  in_progress: 'בתהליך',
  completed: 'הושלם',
};

/** כלים מועדפים עם שמות עבריים */
const PREFERRED_TOOLS: Array<{ value: string; label: string }> = [
  { value: 'numerology', label: 'נומרולוגיה' },
  { value: 'astrology', label: 'אסטרולוגיה' },
  { value: 'graphology', label: 'גרפולוגיה' },
  { value: 'drawing', label: 'ציורים' },
  { value: 'tarot', label: 'טארוט' },
  { value: 'dream', label: 'חלומות' },
  { value: 'personality', label: 'אישיות' },
  { value: 'human_design', label: 'הדיזיין האנושי' },
];

// ===== ממשק טיפוסים =====

/** תוצאת הגשת הטופס */
export interface GoalFormSubmit {
  title: string;
  description?: string;
  category: GoalCreate['category'];
  target_date?: string;
  preferred_tools: string[];
  progress?: number;
  status?: string;
  linked_analyses?: string[];
}

/** מאפייני טופס המטרה */
interface GoalFormProps {
  /** נתונים ראשוניים במצב עריכה */
  readonly initialData?: Partial<GoalFormValues>;
  /** callback לשמירה */
  readonly onSubmit: (data: GoalFormSubmit) => void;
  /** האם בטעינה */
  readonly isLoading?: boolean;
  /** מצב עריכה */
  readonly isEdit?: boolean;
}

/** ניתוח מקוצר */
interface AnalysisSummary {
  id: string;
  tool_type: string;
  summary: string | null;
  created_at: string | null;
}

// ===== קומפוננטה ראשית =====

/** טופס יצירה ועריכת מטרה */
export function GoalForm({
  initialData,
  onSubmit,
  isLoading = false,
  isEdit = false,
}: GoalFormProps) {
  const supabase = createClient();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(GoalFormSchema),
    defaultValues: {
      title: initialData?.title ?? '',
      description: initialData?.description ?? '',
      category: initialData?.category ?? 'personal_growth',
      target_date: initialData?.target_date ?? '',
      preferred_tools: initialData?.preferred_tools ?? [],
      progress: initialData?.progress ?? 0,
      status: initialData?.status ?? 'active',
      linked_analyses: initialData?.linked_analyses ?? [],
    },
  });

  /** שליפת ניתוחים אחרונים לקישור (TRCK-04) */
  const { data: analysesData } = useQuery({
    queryKey: queryKeys.analyses.list({ limit: 20 }),
    queryFn: async () => {
      const { data } = await supabase
        .from('analyses')
        .select('id, tool_type, summary, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
      return (data ?? []) as AnalysisSummary[];
    },
    enabled: isEdit,
  });

  const linkedAnalyses = form.watch('linked_analyses') ?? [];
  const progressValue = form.watch('progress') ?? 0;

  /** עדכון רשימת ניתוחים מקושרים */
  function toggleAnalysis(id: string, checked: boolean) {
    const current = form.getValues('linked_analyses') ?? [];
    if (checked) {
      form.setValue('linked_analyses', [...current, id]);
    } else {
      form.setValue('linked_analyses', current.filter((a) => a !== id));
    }
  }

  /** עטיפת onSubmit לתאימות עם SubmitHandler */
  function handleFormSubmit(values: GoalFormValues) {
    onSubmit({
      title: values.title,
      description: values.description,
      category: values.category,
      target_date: values.target_date,
      preferred_tools: values.preferred_tools ?? [],
      progress: values.progress,
      status: values.status,
      linked_analyses: values.linked_analyses,
    });
  }

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-5" dir="rtl">

      {/* כותרת */}
      <div className="space-y-1.5">
        <Label htmlFor="goal-title">כותרת המטרה *</Label>
        <Input
          id="goal-title"
          placeholder="לדוגמה: לשפר את הכושר הגופני"
          {...form.register('title')}
          aria-invalid={!!form.formState.errors.title}
          className="bg-surface-container-lowest border-none text-on-surface placeholder:text-outline/40 focus-visible:ring-primary/40"
        />
        {form.formState.errors.title && (
          <p className="text-xs text-red-400">{form.formState.errors.title.message}</p>
        )}
      </div>

      {/* תיאור */}
      <div className="space-y-1.5">
        <Label htmlFor="goal-description">תיאור (אופציונלי)</Label>
        <Textarea
          id="goal-description"
          placeholder="תאר את המטרה שלך בפירוט..."
          rows={3}
          {...form.register('description')}
          aria-invalid={!!form.formState.errors.description}
          className="bg-surface-container-lowest border-none text-on-surface placeholder:text-outline/40 focus-visible:ring-primary/40 resize-none"
        />
        {form.formState.errors.description && (
          <p className="text-xs text-red-400">{form.formState.errors.description.message}</p>
        )}
      </div>

      {/* קטגוריה */}
      <div className="space-y-1.5">
        <Label htmlFor="goal-category">קטגוריה *</Label>
        <Controller
          name="category"
          control={form.control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger
                id="goal-category"
                aria-invalid={!!form.formState.errors.category}
              >
                <SelectValue placeholder="בחר קטגוריה" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(GOAL_CATEGORIES).map(([key, info]) => (
                  <SelectItem key={key} value={key}>
                    {info.icon} {CATEGORY_LABELS[key] ?? info.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {form.formState.errors.category && (
          <p className="text-xs text-red-400">
            {form.formState.errors.category.message as string}
          </p>
        )}
      </div>

      {/* תאריך יעד */}
      <div className="space-y-1.5">
        <Label htmlFor="goal-target-date">תאריך יעד (אופציונלי)</Label>
        <Input
          id="goal-target-date"
          type="date"
          {...form.register('target_date')}
          aria-invalid={!!form.formState.errors.target_date}
          className="bg-surface-container-lowest border-none text-on-surface focus-visible:ring-primary/40 [color-scheme:dark]"
        />
        {form.formState.errors.target_date && (
          <p className="text-xs text-red-400">
            {form.formState.errors.target_date.message as string}
          </p>
        )}
      </div>

      {/* כלים מועדפים */}
      <div className="space-y-2">
        <Label>כלים מועדפים (אופציונלי)</Label>
        <div className="grid grid-cols-2 gap-2">
          {PREFERRED_TOOLS.map((tool) => {
            const currentTools = form.watch('preferred_tools') ?? [];
            const isChecked = currentTools.includes(tool.value);
            return (
              <label
                key={tool.value}
                className="flex cursor-pointer items-center gap-2 rounded-lg border border-outline-variant/20 p-2 hover:border-primary/40 text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    const current = form.getValues('preferred_tools') ?? [];
                    if (checked) {
                      form.setValue('preferred_tools', [...current, tool.value]);
                    } else {
                      form.setValue('preferred_tools', current.filter((t) => t !== tool.value));
                    }
                  }}
                  id={`tool-${tool.value}`}
                />
                <span className="font-label text-sm text-on-surface-variant">{tool.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* שדות עריכה בלבד */}
      {isEdit && (
        <>
          {/* התקדמות */}
          <div className="space-y-2">
            <Label>התקדמות: {progressValue}%</Label>
            <Controller
              name="progress"
              control={form.control}
              render={({ field }) => (
                <Slider
                  min={0}
                  max={100}
                  step={5}
                  value={[field.value ?? 0]}
                  onValueChange={(value) => {
                    const numValue = Array.isArray(value) ? value[0] : value;
                    if (typeof numValue === 'number') {
                      field.onChange(numValue);
                    }
                  }}
                  className="w-full"
                />
              )}
            />
          </div>

          {/* סטטוס */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-status">סטטוס</Label>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="goal-status">
                    <SelectValue placeholder="בחר סטטוס" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* קישור ניתוחים — TRCK-04 */}
          {analysesData && analysesData.length > 0 && (
            <div className="space-y-2">
              <Label>קישור לניתוחים</Label>
              <div className="max-h-40 space-y-1.5 overflow-y-auto rounded-lg border border-outline-variant/20 p-3 bg-surface-container">
                {analysesData.map((analysis) => (
                  <label
                    key={analysis.id}
                    className="flex cursor-pointer items-start gap-2 rounded p-1.5 hover:bg-surface-container-high"
                  >
                    <Checkbox
                      checked={linkedAnalyses.includes(analysis.id)}
                      onCheckedChange={(checked) => toggleAnalysis(analysis.id, !!checked)}
                      id={`analysis-${analysis.id}`}
                    />
                    <span className="text-sm text-on-surface-variant">
                      <span className="font-label font-medium text-primary">{analysis.tool_type}</span>
                      {analysis.summary && (
                        <span className="block truncate text-xs text-on-surface-variant/60">
                          {analysis.summary.slice(0, 80)}...
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* כפתור שמירה */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-br from-primary-container to-secondary-container font-headline font-bold text-white shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
      >
        {isLoading ? 'שומר...' : isEdit ? 'עדכן מטרה' : 'צור מטרה'}
      </Button>
    </form>
  );
}
