/**
 * מסנני היסטוריה — שורת כפתורי סינון לפי סוג כלי ותאריך
 * מציג "הכל" + כפתור לכל כלי זמין, עם הדגשה לפי בחירה נוכחית
 */
'use client';

import { cn } from '@/lib/utils/cn';
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
      <button
        onClick={() => onToolChange(null)}
        aria-pressed={selectedTool === null}
        className={cn(
          'font-label text-sm rounded-lg px-3 py-1.5 transition-colors',
          selectedTool === null
            ? 'bg-primary-container/20 text-primary'
            : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
        )}
      >
        הכל
      </button>

      {/* כפתור לכל סוג כלי זמין */}
      {availableTools.map((tool) => (
        <button
          key={tool}
          onClick={() => onToolChange(tool)}
          aria-pressed={selectedTool === tool}
          className={cn(
            'font-label text-sm rounded-lg px-3 py-1.5 transition-colors',
            selectedTool === tool
              ? 'bg-primary-container/20 text-primary'
              : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
          )}
        >
          {TOOL_NAMES[tool] ?? tool}
        </button>
      ))}
    </div>
  );
}
