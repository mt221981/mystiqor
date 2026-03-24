/**
 * כרטיס ניתוח — מציג ניתוח בודד ברשת ההיסטוריה
 * תומך בבחירה לצורך השוואה, עם אינדיקטור בחירה חזותי
 */
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { formatRelativeDate } from '@/lib/utils/dates';
import { TOOL_NAMES } from '@/lib/constants/tool-names';
import { CheckCircle2 } from 'lucide-react';

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

  const cardContent = (
    <CardContent className="p-4">
      {/* כותרת: שם הכלי + אינדיקטור בחירה */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <Badge variant="outline" className="text-xs shrink-0">
          {toolName}
        </Badge>
        {onSelect && selected && (
          <CheckCircle2 className="h-4 w-4 text-purple-500 shrink-0" aria-label="נבחר" />
        )}
      </div>

      {/* סיכום — מקוצר ל-2 שורות */}
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3 min-h-[2.5rem]">
        {analysis.summary ?? 'ניתוח'}
      </p>

      {/* תחתית: תאריך + ציון ביטחון */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatRelativeDate(analysis.created_at)}</span>
        {confidenceText && (
          <span className="opacity-60">{confidenceText}</span>
        )}
      </div>
    </CardContent>
  );

  const cardClass = cn(
    'cursor-pointer transition-all duration-200 hover:shadow-md hover:border-purple-400/50',
    selected && 'ring-2 ring-purple-500 border-purple-400'
  );

  /* כשיש onSelect — כרטיס הוא div לחיץ; אחרת — Link */
  if (onSelect) {
    return (
      <Card
        className={cardClass}
        onClick={() => onSelect(analysis.id)}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') onSelect(analysis.id);
        }}
      >
        {cardContent}
      </Card>
    );
  }

  return (
    <Link href={`/history?id=${analysis.id}`} className="block">
      <Card className={cardClass}>{cardContent}</Card>
    </Link>
  );
}
