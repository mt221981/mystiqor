/**
 * לוח השוואה — מציג שני ניתוחים זה לצד זה
 * כל עמודה: שם הכלי, תאריך, סיכום, ותוצאות מפורטות בפורמט JSON
 */
'use client';

import { formatDate } from '@/lib/utils/dates';
import { TOOL_NAMES } from '@/lib/constants/tool-names';
import { GitCompare } from 'lucide-react';

/** ניתוח מלא עם תוצאות — לצורך השוואה */
export interface AnalysisWithResults {
  id: string;
  tool_type: string;
  summary: string | null;
  results: Record<string, unknown>;
  input_data: Record<string, unknown>;
  created_at: string;
}

/** Props של לוח ההשוואה */
export interface ComparePanelProps {
  /** ניתוח שמאלי (ראשון) */
  left: AnalysisWithResults;
  /** ניתוח ימני (שני) */
  right: AnalysisWithResults;
}

/** עמודת ניתוח בודדת בתוך לוח ההשוואה */
function AnalysisColumn({ analysis }: { analysis: AnalysisWithResults }) {
  const toolName = TOOL_NAMES[analysis.tool_type] ?? analysis.tool_type;

  return (
    <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5 h-full flex flex-col gap-4">
      {/* כותרת עמודה */}
      <div className="flex items-center justify-between gap-2">
        <span className="bg-primary-container/10 text-primary font-label text-sm px-2 py-0.5 rounded-full">
          {toolName}
        </span>
        <span className="font-label text-xs text-on-surface-variant">
          {formatDate(analysis.created_at)}
        </span>
      </div>

      {/* סיכום */}
      {analysis.summary && (
        <p className="font-body text-sm text-on-surface-variant">
          {analysis.summary}
        </p>
      )}

      {/* תוצאות מפורטות */}
      <div className="bg-surface-container-high rounded-lg p-3 flex-1">
        <p className="font-label text-xs text-on-surface-variant mb-2">תוצאות מפורטות</p>
        <pre className="font-body text-xs text-on-surface-variant overflow-auto max-h-96 whitespace-pre-wrap break-words">
          {JSON.stringify(analysis.results, null, 2)}
        </pre>
      </div>
    </div>
  );
}

/**
 * לוח השוואה בין שני ניתוחים — פריסה של שתי עמודות
 * כל עמודה מציגה: שם כלי, תאריך, סיכום, ותוצאות מפורטות
 */
export function ComparePanel({ left, right }: ComparePanelProps) {
  return (
    <div>
      {/* כותרת לוח ההשוואה */}
      <div className="flex items-center gap-2 mb-6">
        <GitCompare className="h-5 w-5 text-primary" />
        <h2 className="font-headline text-xl font-bold text-on-surface">השוואת ניתוחים</h2>
      </div>

      {/* רשת שתי עמודות */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisColumn analysis={left} />
        <AnalysisColumn analysis={right} />
      </div>
    </div>
  );
}
