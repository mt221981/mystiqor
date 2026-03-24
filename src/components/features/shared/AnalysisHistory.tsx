/**
 * היסטוריית ניתוחים — מציגה רשימת ניתוחים עם סינון לפי כלי
 */
'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatRelativeDate } from '@/lib/utils/dates';
import { History, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import type { ToolType } from '@/types/analysis';
import { TOOL_NAMES } from '@/lib/constants/tool-names';

/** ניתוח בודד */
interface AnalysisItem {
  id: string;
  tool_type: ToolType;
  summary: string | null;
  confidence_score: number | null;
  created_at: string;
}

/** Props */
export interface AnalysisHistoryProps {
  analyses: AnalysisItem[];
  maxItems?: number;
  showFilter?: boolean;
  className?: string;
}

/** רשימת ניתוחים עם סינון אופציונלי */
export function AnalysisHistory({
  analyses,
  maxItems = 10,
  showFilter = false,
  className,
}: AnalysisHistoryProps) {
  const [filter, setFilter] = useState<string | null>(null);

  const filtered = filter
    ? analyses.filter((a) => a.tool_type === filter)
    : analyses;
  const displayed = filtered.slice(0, maxItems);

  const toolTypes = [...new Set(analyses.map((a) => a.tool_type))];

  return (
    <div className={cn('bg-surface-container rounded-xl border border-outline-variant/5', className)}>
      {/* כותרת */}
      <div className="p-4 border-b border-outline-variant/10">
        <h3 className="font-headline font-semibold text-on-surface flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          ניתוחים אחרונים
        </h3>
        {showFilter && toolTypes.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-3">
            <button
              onClick={() => setFilter(null)}
              className={cn(
                'font-label text-xs rounded-lg px-3 py-1.5 transition-colors',
                filter === null
                  ? 'bg-primary-container/20 text-primary'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              )}
            >
              הכל
            </button>
            {toolTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={cn(
                  'font-label text-xs rounded-lg px-3 py-1.5 transition-colors',
                  filter === type
                    ? 'bg-primary-container/20 text-primary'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                )}
              >
                {TOOL_NAMES[type] ?? type}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* תוכן */}
      <div className="p-4">
        {displayed.length === 0 ? (
          <p className="font-body text-sm text-on-surface-variant text-center py-4">
            אין ניתוחים עדיין
          </p>
        ) : (
          <ul className="space-y-2">
            {displayed.map((analysis) => (
              <li key={analysis.id}>
                <Link
                  href={`/history?id=${analysis.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-label text-xs bg-primary-container/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                      {TOOL_NAMES[analysis.tool_type] ?? analysis.tool_type}
                    </span>
                    <span className="font-body text-sm text-on-surface truncate">
                      {analysis.summary ?? 'ניתוח'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-label text-xs text-on-surface-variant">
                      {formatRelativeDate(analysis.created_at)}
                    </span>
                    <ChevronLeft className="h-4 w-4 text-on-surface-variant" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
