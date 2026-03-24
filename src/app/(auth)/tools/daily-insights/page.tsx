'use client';

/**
 * דף תובנות יומיות — תובנה יומית משולבת (טארוט + נומרולוגיה + אסטרולוגיה)
 * מציג תובנת גיבור להיום + רשימת תובנות עבר
 * תומך בבחירת מודולים (D-06) וב-SubscriptionGuard
 */

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import { PageHeader } from '@/components/layouts/PageHeader';
import { InsightHeroCard } from '@/components/features/daily-insights/InsightHeroCard';
import { InsightHistoryList, type HistoryInsight } from '@/components/features/daily-insights/InsightHistoryList';
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { animations } from '@/lib/animations/presets';
import { DEFAULT_MODULES, type DailyInsightModules } from '@/lib/validations/daily-insights';

// ===== טיפוסים =====

/** תשובת API לתובנה יומית */
interface DailyInsightApiResponse {
  data?: {
    id: string;
    title: string;
    content: string;
    tarot: unknown;
    actionable_tip: string | null;
    insight_date: string;
    data_sources: unknown;
  };
  error?: string;
}

/** תשובת API להיסטוריה */
interface DailyInsightHistoryResponse {
  data?: HistoryInsight[];
  error?: string;
}

// ===== פונקציות fetch =====

/**
 * מביא תובנה יומית מה-API
 * @param modules מודולים מופעלים
 */
async function fetchDailyInsight(modules: DailyInsightModules): Promise<DailyInsightApiResponse['data'] | null> {
  const modulesJson = encodeURIComponent(JSON.stringify(modules));
  const res = await fetch(`/api/tools/daily-insights?modules=${modulesJson}`, {
    cache: 'no-store',
  });
  const json = await res.json() as DailyInsightApiResponse;
  if (!res.ok) throw new Error(json.error ?? 'שגיאה בטעינת תובנה יומית');
  return json.data ?? null;
}

/**
 * מביא היסטוריית תובנות מה-API
 */
async function fetchInsightHistory(): Promise<HistoryInsight[]> {
  const res = await fetch('/api/tools/daily-insights?history=true', {
    cache: 'no-store',
  });
  const json = await res.json() as DailyInsightHistoryResponse;
  if (!res.ok) throw new Error(json.error ?? 'שגיאה בטעינת היסטוריה');
  return json.data ?? [];
}

// ===== רכיב בוחר מודולים =====

/** הגדרת מודול תצוגה */
interface ModuleDefinition {
  key: keyof DailyInsightModules;
  label: string;
}

/** מודולים ותוויותיהם בעברית */
const MODULE_DEFINITIONS: ModuleDefinition[] = [
  { key: 'astrology', label: 'אסטרולוגיה' },
  { key: 'numerology', label: 'נומרולוגיה' },
  { key: 'tarot', label: 'טארוט' },
  { key: 'recommendation', label: 'המלצה' },
];

/** Props לרכיב בוחר מודולים */
interface ModuleSelectorProps {
  modules: DailyInsightModules;
  onToggle: (key: keyof DailyInsightModules) => void;
}

/** שורת מתגי מודולים */
function ModuleSelector({ modules, onToggle }: ModuleSelectorProps) {
  return (
    <div
      className="flex flex-wrap gap-4 rounded-xl border border-outline-variant/10 bg-surface-container px-4 py-3"
      role="group"
      aria-label="בחר מודולים לתובנה"
    >
      {MODULE_DEFINITIONS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-2">
          <Switch
            id={`module-${key}`}
            checked={modules[key]}
            onCheckedChange={() => onToggle(key)}
            aria-label={`${modules[key] ? 'כבה' : 'הפעל'} מודול ${label}`}
          />
          <Label htmlFor={`module-${key}`} className="cursor-pointer text-sm">
            {label}
          </Label>
        </div>
      ))}
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/** דף תובנות יומיות */
export default function DailyInsightsPage() {
  const [modules, setModules] = useState<DailyInsightModules>(DEFAULT_MODULES);

  /** החלפת מצב מודול */
  const handleToggleModule = useCallback((key: keyof DailyInsightModules) => {
    setModules((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // שאילתת תובנה יומית — מחדשת כשמשתנים המודולים
  const {
    data: todayInsight,
    isLoading: insightLoading,
    isError: insightError,
  } = useQuery({
    queryKey: ['daily-insight', modules],
    queryFn: () => fetchDailyInsight(modules),
    staleTime: 1000 * 60 * 30, // 30 דקות — הנתון יציב ב-cache DB
    retry: 1,
  });

  // שאילתת היסטוריה — נטענת פעם אחת ביום
  const {
    data: historyInsights,
    isLoading: historyLoading,
  } = useQuery({
    queryKey: ['daily-insights-history'],
    queryFn: fetchInsightHistory,
    staleTime: 1000 * 60 * 60, // שעה
    retry: 1,
  });

  // הצגת הודעת שגיאה
  if (insightError) {
    toast.error('שגיאה בטעינת התובנה היומית — נסה לרענן');
  }

  return (
    <SubscriptionGuard feature="analyses">
      <motion.div
        {...animations.fadeIn}
        className="space-y-6"
        dir="rtl"
      >
        {/* כותרת דף */}
        <PageHeader
          title="תובנות יומיות"
          description="תובנה יומית אישית המשלבת אסטרולוגיה, נומרולוגיה וטארוט"
          icon={<Sparkles className="h-5 w-5" aria-hidden="true" />}
          breadcrumbs={[
            { label: 'כלים', href: '/tools' },
            { label: 'תובנות יומיות' },
          ]}
        />

        {/* בוחר מודולים */}
        <ModuleSelector modules={modules} onToggle={handleToggleModule} />

        {/* תובנת גיבור */}
        <InsightHeroCard
          insight={todayInsight ?? null}
          isLoading={insightLoading}
        />

        {/* מפריד */}
        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="shrink-0 text-sm font-label text-on-surface-variant">תובנות קודמות</span>
          <Separator className="flex-1" />
        </div>

        {/* רשימת היסטוריה */}
        <InsightHistoryList
          insights={historyInsights ?? []}
          isLoading={historyLoading}
        />
      </motion.div>
    </SubscriptionGuard>
  );
}
