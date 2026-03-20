/**
 * תובנה עם provenance — GEM 9
 * מציגה תובנה עם confidence, tags, provenance, עצות מעשיות
 */
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfidenceBadge } from '@/components/features/insights/ConfidenceBadge';
import { TAG_TRANSLATIONS, INSIGHT_TYPE_COLORS, getHebrewTag } from '@/lib/constants/categories';
import { cn } from '@/lib/utils/cn';
import { ChevronDown, ChevronUp, Sparkles, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Insight } from '@/types/analysis';

/** Props של תובנה מוסברת */
export interface ExplainableInsightProps {
  /** אובייקט התובנה */
  insight: Insight;
  /** האם להציג provenance */
  showProvenance?: boolean;
}

/** תובנה עם הסברים, confidence, tags, ועצות מעשיות */
export function ExplainableInsight({ insight, showProvenance = true }: ExplainableInsightProps) {
  const [showSources, setShowSources] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);

  const {
    title, content, insight_type, confidence, weight,
    provenance, tags = [], actionable_advice = [],
    psychological_connection, ancient_wisdom,
  } = insight;

  const colorClass = insight_type
    ? INSIGHT_TYPE_COLORS[insight_type] ?? 'bg-gray-100 text-gray-800 border-gray-300'
    : 'bg-gray-100 text-gray-800 border-gray-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="article"
      aria-label={`תובנה: ${title}`}
    >
      <Card className="bg-gradient-to-br from-card to-card/80 border-primary/20 hover:border-primary/40 transition-all">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {insight_type && (
                  <Badge className={colorClass}>{getHebrewTag(insight_type)}</Badge>
                )}
                {confidence !== undefined && (
                  <ConfidenceBadge confidence={confidence} />
                )}
                {weight !== undefined && weight > 0.85 && (
                  <Badge className="bg-yellow-600/80 text-yellow-100 border-yellow-500/50">
                    <Sparkles className="w-3 h-3 me-1" />
                    חשוב מאוד
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">{content}</p>

          {/* תגיות */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {TAG_TRANSLATIONS[tag] ?? tag}
                </Badge>
              ))}
            </div>
          )}

          {/* חיבור פסיכולוגי */}
          {psychological_connection && (
            <div className="bg-muted/50 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">חיבור פסיכולוגי</p>
              <p className="text-muted-foreground">{psychological_connection}</p>
            </div>
          )}

          {/* חוכמה עתיקה */}
          {ancient_wisdom && (
            <div className="bg-primary/5 rounded-lg p-3 text-sm">
              <p className="font-medium mb-1">חוכמה עתיקה</p>
              <p className="text-muted-foreground italic">{ancient_wisdom}</p>
            </div>
          )}

          {/* עצות מעשיות */}
          {actionable_advice.length > 0 && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvice(!showAdvice)}
                className="gap-2 text-sm"
              >
                <BookOpen className="h-4 w-4" />
                עצות מעשיות ({actionable_advice.length})
                {showAdvice ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
              <AnimatePresence>
                {showAdvice && (
                  <motion.ul
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-2 space-y-1 overflow-hidden"
                  >
                    {actionable_advice.map((advice, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2 ps-2">
                        <span className="text-primary">•</span>
                        <span>{advice}</span>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* מקורות (provenance) */}
          {showProvenance && provenance && (
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSources(!showSources)}
                className="gap-2 text-xs text-muted-foreground"
              >
                מקורות
                {showSources ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
              <AnimatePresence>
                {showSources && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-1 text-xs text-muted-foreground bg-muted/30 rounded p-2 overflow-hidden"
                  >
                    {provenance.rule_description && <p>{provenance.rule_description}</p>}
                    {provenance.sources.length > 0 && (
                      <p className="mt-1">מקורות: {provenance.sources.join(', ')}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
