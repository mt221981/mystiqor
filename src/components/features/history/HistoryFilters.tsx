/**
 * מסנני היסטוריה — שורת כפתורי סינון לפי סוג כלי ותאריך
 * מציג "הכל" + כפתור לכל כלי זמין, עם הדגשה לפי בחירה נוכחית
 */
'use client';

import { Button } from '@/components/ui/button';
import { TOOL_NAMES } from '@/lib/constants/tool-names';

/** Props של רכיב הסינון */
export interface HistoryFiltersProps {
  /** הכלי הנבחר כרגע — null אומר "הכל" */
  selectedTool: string | null;
  /** קולבק לשינוי הסינון */
  onToolChange: (tool: string | null) => void;
  /** רשימת הכלים הזמינים לסינון */
  availableTools: string[];
}

/**
 * שורת כפתורי סינון לפי סוג כלי
 * כפתור "הכל" פעיל כשאין סינון, כפתורי כלים פעילים לפי בחירה
 */
export function HistoryFilters({
  selectedTool,
  onToolChange,
  availableTools,
}: HistoryFiltersProps) {
  return (
    <div
      className="flex flex-wrap gap-2"
      role="group"
      aria-label="סינון לפי סוג כלי"
    >
      {/* כפתור "הכל" */}
      <Button
        variant={selectedTool === null ? 'default' : 'outline'}
        size="sm"
        onClick={() => onToolChange(null)}
        className="text-xs"
        aria-pressed={selectedTool === null}
      >
        הכל
      </Button>

      {/* כפתור לכל סוג כלי זמין */}
      {availableTools.map((tool) => (
        <Button
          key={tool}
          variant={selectedTool === tool ? 'default' : 'outline'}
          size="sm"
          onClick={() => onToolChange(tool)}
          className="text-xs"
          aria-pressed={selectedTool === tool}
        >
          {TOOL_NAMES[tool] ?? tool}
        </Button>
      ))}
    </div>
  );
}
