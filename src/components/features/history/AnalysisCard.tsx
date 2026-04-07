/**
 * כרטיס ניתוח — מציג ניתוח בודד ברשת ההיסטוריה
 * תומך בבחירה לצורך השוואה, עם אינדיקטור בחירה חזותי
 */
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { formatRelativeDate } from '@/lib/utils/dates';
import { TOOL_NAMES } from '@/lib/constants/tool-names';
import { CheckCircle2 } from 'lucide-react';
import { ExportButton } from '@/components/features/export/ExportButton';
import { SharePanel } from '@/components/features/sharing/SharePanel';

/** נתוני ניתוח בסיסיים לתצוגת כרטיס */
export interface AnalysisCardData {
  id: string;
  tool_type: string;
  summary: string | null;
  confidence_score: number | null;
  created_at: string;
}

/** Props של כרטיס ניתוח */
export interface AnalysisCardProps {
  /** נתוני הניתוח להצגה */
  analysis: AnalysisCardData;
  /** האם הכרטיס נבחר לצורך השוואה */
  selected?: boolean;
  /** קולבק בחירת כרטיס — אם קיים, מציג אינדיקטור בחירה */
  onSelect?: (id: string) => void;
}

/**
 * כרטיס ניתוח יחיד ברשת ההיסטוריה
 * כשיש onSelect — לחיצה בוחרת/מבטלת בחירה
 * כשאין onSelect — לחיצה מנווטת ל-/history?id=...
 */
export function AnalysisCard({ analysis, selected = false, onSelect }: AnalysisCardProps) {
  const toolName = TOOL_NAMES[analysis.tool_type] ?? analysis.tool_type;
  const confidenceText =
    analysis.confidence_score !== null
      ? `${Math.round(analysis.confidence_score * 100)}%`
      : null;

  const cardClass = cn(
    'bg-surface-container rounded-xl p-4 border border-outline-variant/5 hover:border-primary/10 transition-colors cursor-pointer',
    selected && 'ring-2 ring-primary border-primary/20'
  );

  const cardContent = (
    <div className={cardClass}>
      {/* כותרת: שם הכלי + אינדיקטור בחירה */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="bg-primary-container/10 text-primary font-label text-xs px-2 py-0.5 rounded-full shrink-0">
          {toolName}
        </span>
        {onSelect && selected && (
          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" aria-label="נבחר" />
        )}
      </div>

      {/* סיכום — מקוצר ל-2 שורות */}
      <p className="font-headline font-semibold text-on-surface text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
        {analysis.summary ?? 'ניתוח'}
      </p>

      {/* תחתית: תאריך + ציון ביטחון */}
      <div className="flex items-center justify-between">
        <span className="font-label text-xs text-on-surface-variant">
          {formatRelativeDate(analysis.created_at)}
        </span>
        {confidenceText && (
          <span className="font-label text-xs text-on-surface-variant">
            {confidenceText}
          </span>
        )}
      </div>
    </div>
  );

  /* כשיש onSelect — כרטיס הוא div לחיץ; אחרת — Link */
  if (onSelect) {
    return (
      <div
        onClick={() => onSelect(analysis.id)}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(analysis.id);
        }}
      >
        {cardContent}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Link href={`/history?id=${analysis.id}`} className="block">
        {cardContent}
      </Link>
      {/* כפתורי ייצוא ושיתוף — רק במצב עיון, לא בבחירה להשוואה */}
      <div className="flex gap-2 flex-wrap px-1" dir="rtl">
        <ExportButton
          toolType={analysis.tool_type}
          summary={analysis.summary}
          results={{}}
          createdAt={analysis.created_at}
        />
        <SharePanel
          analysisId={analysis.id}
          title={`ניתוח ${TOOL_NAMES[analysis.tool_type] ?? analysis.tool_type}`}
        />
      </div>
    </div>
  );
}
