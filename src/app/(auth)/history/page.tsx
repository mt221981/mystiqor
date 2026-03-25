/**
 * דף היסטוריית ניתוחים — HIST-01, HIST-02, ASTR-08
 * מציג רשימה מסוננת ומעומודת של כל הניתוחים
 * תומך בתצוגת רשת ותצוגת ציר זמן, ובחירת שני ניתוחים להשוואה
 */
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { History, List, Clock, GitCompare, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatDate } from '@/lib/utils/dates';
import { TOOL_NAMES } from '@/lib/constants/tool-names';
import { HistoryFilters } from '@/components/features/history/HistoryFilters';
import { AnalysisCard, type AnalysisCardData } from '@/components/features/history/AnalysisCard';
import { CACHE_TIMES } from '@/lib/query/cache-config';

/** תגובת API ניתוחים */
interface AnalysesApiResponse {
  data: AnalysisCardData[];
  meta: {
    offset: number;
    limit: number;
    total: number;
  };
}

/** מצב תצוגה — רשת או ציר זמן */
type ViewMode = 'list' | 'timeline';

/** מספר ניתוחים בעמוד */
const PAGE_SIZE = 20;

/**
 * שליפת ניתוחים מה-API עם pagination וסינון
 */
async function fetchAnalyses(
  toolFilter: string | null,
  page: number
): Promise<AnalysesApiResponse> {
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    offset: String(page * PAGE_SIZE),
  });
  if (toolFilter) params.set('tool_type', toolFilter);

  const res = await fetch(`/api/analysis?${params.toString()}`);
  if (!res.ok) throw new Error('שגיאה בטעינת ניתוחים');
  return res.json() as Promise<AnalysesApiResponse>;
}

/**
 * שליפת כל הניתוחים לחילוץ רשימת כלים זמינים
 */
async function fetchAllToolTypes(): Promise<string[]> {
  const res = await fetch('/api/analysis?limit=200');
  if (!res.ok) return [];
  const json = (await res.json()) as AnalysesApiResponse;
  const types = [...new Set(json.data.map((a) => a.tool_type))];
  return types.sort();
}

// ===== רכיב ציר הזמן =====

/** פריט בציר הזמן */
interface TimelineItemProps {
  analysis: AnalysisCardData;
  index: number;
  selected: boolean;
  onSelect: (id: string) => void;
}

/** פריט בודד על ציר הזמן */
function TimelineItem({ analysis, index, selected, onSelect }: TimelineItemProps) {
  const isEven = index % 2 === 0;
  const toolName = TOOL_NAMES[analysis.tool_type] ?? analysis.tool_type;

  return (
    <div className={cn('flex items-start gap-4', isEven ? 'flex-row' : 'flex-row-reverse')}>
      {/* כרטיס מידע */}
      <div
        className={cn(
          'flex-1 max-w-sm cursor-pointer bg-surface-container rounded-xl border border-outline-variant/5 p-3 transition-all duration-200',
          'hover:border-primary/20',
          selected && 'ring-2 ring-primary border-primary/40'
        )}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={() => onSelect(analysis.id)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(analysis.id);
        }}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <Badge variant="outline" className="font-label text-xs bg-primary-container/10 text-primary border-none">
            {toolName}
          </Badge>
          {selected && (
            <span className="font-label text-xs text-primary">נבחר</span>
          )}
        </div>
        <p className="font-body text-xs text-on-surface-variant line-clamp-2">
          {analysis.summary ?? 'ניתוח'}
        </p>
      </div>

      {/* נקודה ותאריך על הציר */}
      <div className="flex flex-col items-center shrink-0">
        <div className={cn(
          'h-3 w-3 rounded-full border-2 border-primary',
          selected ? 'bg-primary' : 'bg-surface'
        )} />
        <span className="font-label text-xs text-on-surface-variant mt-1 whitespace-nowrap">
          {formatDate(analysis.created_at)}
        </span>
      </div>

      {/* עמוד placeholder לאיזון */}
      <div className="flex-1 max-w-sm" />
    </div>
  );
}

/** ציר זמן עם קו אנכי מרכזי */
function TimelineView({
  analyses,
  selectedIds,
  onSelect,
}: {
  analyses: AnalysisCardData[];
  selectedIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="relative">
      {/* קו אנכי מרכזי */}
      <div className="absolute inset-y-0 start-1/2 w-px bg-outline-variant/20 -translate-x-1/2" aria-hidden />

      <div className="flex flex-col gap-6 py-2">
        {analyses.map((analysis, index) => (
          <TimelineItem
            key={analysis.id}
            analysis={analysis}
            index={index}
            selected={selectedIds.has(analysis.id)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

// ===== עמוד ראשי =====

/** עמוד היסטוריית ניתוחים */
export default function HistoryPage() {
  const router = useRouter();

  const [page, setPage] = useState(0);
  const [toolFilter, setToolFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  /** שליפת הניתוחים הנוכחיים */
  const { data, isLoading, isError } = useQuery<AnalysesApiResponse>({
    queryKey: ['analyses', toolFilter, page],
    queryFn: () => fetchAnalyses(toolFilter, page),
    staleTime: CACHE_TIMES.SHORT,
  });

  /** שליפת רשימת כלים זמינים לסינון */
  const { data: availableTools = [] } = useQuery<string[]>({
    queryKey: ['analyses-tool-types'],
    queryFn: fetchAllToolTypes,
    staleTime: CACHE_TIMES.MEDIUM,
  });

  const analyses = data?.data ?? [];
  const total = data?.meta.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const rangeStart = page * PAGE_SIZE + 1;
  const rangeEnd = Math.min((page + 1) * PAGE_SIZE, total);

  /** שינוי סינון כלי — אפס גם את העמוד */
  function handleToolChange(tool: string | null) {
    setToolFilter(tool);
    setPage(0);
    setSelectedIds(new Set());
  }

  /** בחירה/ביטול בחירה של ניתוח — מקסימום 2 */
  function handleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < 2) {
        next.add(id);
      }
      return next;
    });
  }

  /** ניווט לדף השוואה */
  function handleCompare() {
    const ids = [...selectedIds].join(',');
    router.push(`/history/compare?ids=${ids}`);
  }

  const showCompareButton = selectedIds.size === 2;

  /** חישוב מצב ריק — לפי useMemo */
  const isEmpty = useMemo(() => !isLoading && analyses.length === 0, [isLoading, analyses.length]);

  return (
    <div className="space-y-6 p-6">
      {/* כותרת הדף */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <History className="h-6 w-6 text-primary" />
          <h1 className="font-headline text-2xl font-bold text-on-surface">היסטוריית ניתוחים</h1>
        </div>

        {/* כפתור השוואה — מופיע רק כשנבחרו 2 ניתוחים */}
        {showCompareButton && (
          <Button onClick={handleCompare} className="gap-2">
            <GitCompare className="h-4 w-4" />
            השווה ניתוחים
          </Button>
        )}
      </div>

      {/* שורת סינון + מיתוג תצוגה */}
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <HistoryFilters
          selectedTool={toolFilter}
          onToolChange={handleToolChange}
          availableTools={availableTools}
        />

        {/* מיתוג תצוגה */}
        <div
          className="flex gap-1 bg-surface-container border border-outline-variant/10 rounded-lg p-1"
          role="group"
          aria-label="מצב תצוגה"
        >
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2 px-3"
            aria-pressed={viewMode === 'list'}
          >
            <List className="h-4 w-4" />
            רשת
          </Button>
          <Button
            variant={viewMode === 'timeline' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('timeline')}
            className="gap-2 px-3"
            aria-pressed={viewMode === 'timeline'}
          >
            <Clock className="h-4 w-4" />
            ציר זמן
          </Button>
        </div>
      </div>

      {/* הנחייה לבחירה */}
      {selectedIds.size > 0 && selectedIds.size < 2 && (
        <p className="font-body text-sm text-on-surface-variant">
          בחר ניתוח נוסף להשוואה ({selectedIds.size}/2)
        </p>
      )}

      {/* שגיאת טעינה */}
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>שגיאה בטעינת הניתוחים. נסה שוב.</AlertDescription>
        </Alert>
      )}

      {/* מצב טעינה */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <MysticSkeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      )}

      {/* מצב ריק */}
      {isEmpty && !isError && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <History className="h-12 w-12 text-on-surface-variant/40 mb-4" />
          <p className="font-body text-on-surface-variant">
            אין ניתוחים עדיין. התחל להשתמש בכלים כדי לראות היסטוריה.
          </p>
        </div>
      )}

      {/* תצוגת רשת */}
      {!isLoading && !isEmpty && viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyses.map((analysis) => (
            <AnalysisCard
              key={analysis.id}
              analysis={analysis}
              selected={selectedIds.has(analysis.id)}
              onSelect={handleSelect}
            />
          ))}
        </div>
      )}

      {/* תצוגת ציר זמן */}
      {!isLoading && !isEmpty && viewMode === 'timeline' && (
        <TimelineView
          analyses={analyses}
          selectedIds={selectedIds}
          onSelect={handleSelect}
        />
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <span className="font-label text-sm text-on-surface-variant">
            {total > 0 ? `מציג ${rangeStart}–${rangeEnd} מתוך ${total}` : ''}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              הקודם
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => p + 1)}
              disabled={page >= totalPages - 1}
            >
              הבא
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
