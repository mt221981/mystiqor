/**
 * לוח השוואה — מציג שני ניתוחים זה לצד זה
 * כל עמודה: שם הכלי, תאריך, סיכום, ותוצאות מפורטות בפורמט JSON
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-sm">
            {toolName}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(analysis.created_at)}
          </span>
        </div>
        {analysis.summary && (
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {analysis.summary}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {/* תוצאות מפורטות בפורמט JSON קריא */}
        <Card className="bg-muted/30">
          <CardContent className="p-3">
            <p className="text-xs font-semibold text-muted-foreground mb-2">תוצאות מפורטות</p>
            <pre className="text-xs text-muted-foreground overflow-auto max-h-96 whitespace-pre-wrap break-words leading-relaxed">
              {JSON.stringify(analysis.results, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
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
        <GitCompare className="h-5 w-5 text-purple-400" />
        <h2 className="text-xl font-bold">השוואת ניתוחים</h2>
      </div>

      {/* רשת שתי עמודות */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AnalysisColumn analysis={left} />
        <AnalysisColumn analysis={right} />
      </div>
    </div>
  );
}
