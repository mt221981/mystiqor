/**
 * היסטוריית ניתוחים — מציגה רשימת ניתוחים עם סינון לפי כלי
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5" />
          ניתוחים אחרונים
        </CardTitle>
        {showFilter && toolTypes.length > 1 && (
          <div className="flex flex-wrap gap-1 mt-2">
            <Button
              variant={filter === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(null)}
              className="text-xs"
            >
              הכל
            </Button>
            {toolTypes.map((type) => (
              <Button
                key={type}
                variant={filter === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(type)}
                className="text-xs"
              >
                {TOOL_NAMES[type] ?? type}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {displayed.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            אין ניתוחים עדיין
          </p>
        ) : (
          <ul className="space-y-2">
            {displayed.map((analysis) => (
              <li key={analysis.id}>
                <Link
                  href={`/history?id=${analysis.id}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {TOOL_NAMES[analysis.tool_type] ?? analysis.tool_type}
                    </Badge>
                    <span className="text-sm truncate">
                      {analysis.summary ?? 'ניתוח'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeDate(analysis.created_at)}
                    </span>
                    <ChevronLeft className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
