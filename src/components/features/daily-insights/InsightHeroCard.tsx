'use client';

/**
 * InsightHeroCard — כרטיס תובנה יומית גיבור
 * מציג את התובנה היומית של היום בצורה בולטת ומרשימה
 * כולל כותרת, תוכן בפורמט Markdown, קלף טארוט וטיפ לפעולה
 */

import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import { GiSparkles, GiStarShuriken, GiLightBulb } from 'react-icons/gi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MysticSkeleton } from '@/components/ui/mystic-skeleton';
import { animations } from '@/lib/animations/presets';

// ===== טיפוסים =====

/** נתוני תובנה יומית */
interface InsightData {
  /** כותרת התובנה */
  title: string;
  /** תוכן מלא (תומך Markdown) */
  content: string;
  /** נתוני קלף טארוט */
  tarot: unknown;
  /** טיפ לפעולה ליום */
  actionable_tip: string | null;
  /** תאריך התובנה YYYY-MM-DD */
  insight_date: string;
  /** מקורות נתונים (מודולים מופעלים) */
  data_sources: unknown;
}

/** Props של InsightHeroCard */
export interface InsightHeroCardProps {
  /** נתוני התובנה — null בזמן טעינה */
  insight: InsightData | null;
  /** האם בטעינה */
  isLoading: boolean;
}

// ===== פונקציות עזר =====

/**
 * מפרסרת נתוני טארוט מהשדה הגנרי
 * @param tarot שדה טארוט מהDB
 * @returns שם הקלף או null
 */
function parseTarotCard(tarot: unknown): string | null {
  if (!tarot || typeof tarot !== 'object') return null;
  const obj = tarot as Record<string, unknown>;
  if (typeof obj['card'] === 'string') return obj['card'];
  return null;
}

/**
 * ממיר תאריך YYYY-MM-DD לפורמט DD/MM/YYYY
 * @param dateStr תאריך בפורמט ISO
 * @returns תאריך בפורמט ישראלי
 */
function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

// ===== רכיב Skeleton =====

/** שלד טעינה מונפש */
function InsightHeroSkeleton() {
  return (
    <Card className="overflow-hidden nebula-glow rounded-xl">
      <CardHeader className="pb-4">
        <MysticSkeleton className="h-6 w-3/4" />
        <MysticSkeleton className="mt-2 h-4 w-1/4" />
      </CardHeader>
      <CardContent className="space-y-3">
        <MysticSkeleton className="h-4 w-full" />
        <MysticSkeleton className="h-4 w-5/6" />
        <MysticSkeleton className="h-4 w-4/6" />
        <MysticSkeleton className="h-4 w-full" />
        <MysticSkeleton className="h-4 w-3/4" />
        <div className="mt-4 rounded-lg border border-outline-variant/10 bg-surface-container-high/20 p-3">
          <MysticSkeleton className="h-4 w-1/3" />
          <MysticSkeleton className="mt-2 h-4 w-5/6" />
        </div>
      </CardContent>
    </Card>
  );
}

// ===== קומפוננטה ראשית =====

/**
 * כרטיס גיבור לתובנה היומית — מציג כותרת, תוכן, טארוט וטיפ
 */
export function InsightHeroCard({ insight, isLoading }: InsightHeroCardProps) {
  if (isLoading) {
    return <InsightHeroSkeleton />;
  }

  if (!insight) {
    return (
      <Card className="nebula-glow rounded-xl border-none">
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-white/70 font-body">לא נמצאה תובנה יומית</p>
        </CardContent>
      </Card>
    );
  }

  const tarotCardName = parseTarotCard(insight.tarot);

  return (
    <motion.div {...animations.fadeInUp} transition={{ duration: 0.5 }}>
      <Card className="overflow-hidden nebula-glow rounded-xl border-none p-8">
        {/* כותרת */}
        <CardHeader className="pb-4 p-0 mb-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <GiSparkles className="mt-0.5 h-5 w-5 shrink-0 text-white" aria-hidden="true" />
              <h2 className="text-2xl font-headline font-bold leading-snug text-white">
                {insight.title}
              </h2>
            </div>
            <time
              dateTime={insight.insight_date}
              className="shrink-0 text-sm font-label text-white/70"
            >
              {formatDate(insight.insight_date)}
            </time>
          </div>
        </CardHeader>

        <CardContent className="space-y-5 p-0">
          {/* תוכן בפורמט Markdown */}
          <div className="prose prose-sm prose-invert max-w-none font-body text-white/80
            prose-headings:text-white prose-strong:text-white
            prose-p:leading-relaxed">
            <ReactMarkdown>{insight.content}</ReactMarkdown>
          </div>

          {/* קלף טארוט */}
          {tarotCardName && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-500/20 bg-yellow-950/20 px-3 py-2">
              <GiStarShuriken className="h-4 w-4 shrink-0 text-yellow-400" aria-hidden="true" />
              <span className="text-sm font-body text-yellow-200/90">
                <span className="font-semibold">קלף היום: </span>
                {tarotCardName}
              </span>
            </div>
          )}

          {/* טיפ לפעולה */}
          {insight.actionable_tip && (
            <div className="rounded-lg border border-tertiary/20 bg-tertiary/10 p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <GiLightBulb className="h-4 w-4 shrink-0 text-tertiary" aria-hidden="true" />
                <span className="text-xs font-label font-semibold uppercase text-tertiary">
                  טיפ ליום
                </span>
              </div>
              <p className="text-sm font-body text-tertiary/90 leading-relaxed">
                {insight.actionable_tip}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
