'use client';

/**
 * InsightHistoryList — רשימת תובנות יומיות עברית
 * מציגה תובנות עבר בסדר כרונולוגי יורד
 * תמיכה בהרחבה בלחיצה, מצב ריק, ו-skeleton בטעינה
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { animations } from '@/lib/animations/presets';

// ===== טיפוסים =====

/** נתוני תובנה עבר */
export interface HistoryInsight {
  /** מזהה ייחודי */
  id: string;
  /** כותרת התובנה */
  title: string;
  /** תוכן מלא */
  content: string;
  /** תאריך YYYY-MM-DD */
  insight_date: string;
  /** טיפ לפעולה */
  actionable_tip: string | null;
}

/** Props של InsightHistoryList */
export interface InsightHistoryListProps {
  /** מערך תובנות עבר */
  insights: HistoryInsight[];
  /** האם בטעינה */
  isLoading: boolean;
}

// ===== פונקציות עזר =====

/**
 * ממיר תאריך YYYY-MM-DD לפורמט DD/MM/YYYY
 * @param dateStr תאריך ISO
 * @returns תאריך ישראלי
 */
function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * מקצר טקסט ל-maxChars תווים עם "..."
 * @param text הטקסט
 * @param maxChars מספר תווים מקסימלי
 * @returns טקסט מקוצר
 */
function truncateText(text: string, maxChars = 150): string {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars).trimEnd() + '...';
}

// ===== שלד טעינה =====

/** שלד טעינה לרשימת תובנות */
function InsightHistorySkeletons() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="טוען תובנות קודמות">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="border-border/50">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <Skeleton className="h-5 w-5 shrink-0 rounded" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ===== כרטיס תובנה בודד =====

/** Props לכרטיס תובנה בודד */
interface InsightHistoryItemProps {
  insight: HistoryInsight;
}

/** כרטיס תובנה עבר — עם הרחבה בלחיצה */
function InsightHistoryItem({ insight }: InsightHistoryItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <Card className="bg-surface-container rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-colors">
      <CardContent className="p-4">
        <button
          type="button"
          className="w-full text-start"
          onClick={toggleExpand}
          aria-expanded={isExpanded}
          aria-controls={`insight-content-${insight.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* תאריך */}
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="h-3.5 w-3.5 shrink-0 text-on-surface-variant" aria-hidden="true" />
                <time dateTime={insight.insight_date} className="text-xs font-label text-on-surface-variant">
                  {formatDate(insight.insight_date)}
                </time>
              </div>

              {/* כותרת */}
              <p className="text-sm font-headline font-semibold text-on-surface leading-snug mb-1.5">
                {insight.title}
              </p>

              {/* תצוגה מקוצרת */}
              {!isExpanded && (
                <p className="text-xs font-body text-on-surface-variant leading-relaxed">
                  {truncateText(insight.content)}
                </p>
              )}
            </div>

            {/* אייקון הרחבה */}
            <span className="mt-0.5 shrink-0 text-on-surface-variant" aria-hidden="true">
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </span>
          </div>
        </button>

        {/* תוכן מורחב */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id={`insight-content-${insight.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-3 pt-3 border-t border-outline-variant/20 space-y-3">
                <p className="text-sm font-body text-on-surface leading-relaxed whitespace-pre-wrap">
                  {insight.content}
                </p>

                {insight.actionable_tip && (
                  <div className="rounded-md bg-surface-container-high px-3 py-2">
                    <span className="text-xs font-label font-semibold text-on-surface-variant">טיפ ליום: </span>
                    <span className="text-xs font-body text-on-surface">{insight.actionable_tip}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// ===== קומפוננטה ראשית =====

/**
 * רשימת תובנות יומיות עברית — ניתן לגלילה, הרחבה בלחיצה
 */
export function InsightHistoryList({ insights, isLoading }: InsightHistoryListProps) {
  if (isLoading) {
    return <InsightHistorySkeletons />;
  }

  if (insights.length === 0) {
    return (
      <motion.div {...animations.fadeIn} className="flex flex-col items-center justify-center py-10 text-center">
        <Calendar className="mb-3 h-8 w-8 text-muted-foreground/50" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">אין תובנות קודמות</p>
        <p className="mt-1 text-xs text-muted-foreground/70">תובנות יומיות יצטברו כאן עם הזמן</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06 } },
      }}
    >
      {insights.map((insight) => (
        <motion.div
          key={insight.id}
          variants={{
            hidden: { opacity: 0, y: 8 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.25 }}
        >
          <InsightHistoryItem insight={insight} />
        </motion.div>
      ))}
    </motion.div>
  );
}
