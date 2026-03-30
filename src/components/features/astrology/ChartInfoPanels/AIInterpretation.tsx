'use client'

/**
 * AIInterpretation — פאנל פרשנות AI אסטרולוגית
 * מציג את פרשנות ה-AI של מפת הלידה בפורמט Markdown
 * תומך בטעינה (skeleton) ובהרחבה ("קרא עוד")
 */

import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MysticSkeleton } from '@/components/ui/mystic-skeleton'

/** Props של רכיב AIInterpretation */
export interface AIInterpretationProps {
  /** טקסט הפרשנות (Markdown) */
  interpretation: string
  /** האם הרכיב בטעינה */
  isLoading?: boolean
}

/** כמות התווים המוצגת לפני "קרא עוד" */
const PREVIEW_LENGTH = 300

/**
 * פאנל פרשנות AI — כרטיס עם כותרת "פירוש AI" ותוכן Markdown
 * מציג skeleton בזמן טעינה, ומאפשר הרחבה/כיווץ של הטקסט
 *
 * @param interpretation - טקסט הפרשנות ב-Markdown
 * @param isLoading - מצב טעינה
 */
export function AIInterpretation({ interpretation, isLoading = false }: AIInterpretationProps) {
  const [expanded, setExpanded] = useState(false)

  /** האם הטקסט ארוך מהתצוגה המקדימה */
  const isLong = interpretation.length > PREVIEW_LENGTH

  /** הטקסט המוצג — חלק ראשון או הכל */
  const displayText = expanded || !isLong ? interpretation : interpretation.slice(0, PREVIEW_LENGTH) + '...'

  return (
    <Card className="bg-surface-container rounded-xl border border-outline-variant/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          פירוש AI
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          /* מצב טעינה — 4 שורות skeleton */
          <div className="space-y-3" aria-label="טוען פרשנות...">
            <MysticSkeleton className="h-4 w-full" />
            <MysticSkeleton className="h-4 w-5/6" />
            <MysticSkeleton className="h-4 w-4/5" />
            <MysticSkeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <div>
            {/* תוכן Markdown עם RTL */}
            <div
              className="result-heading-glow prose prose-invert prose-sm max-w-none font-body text-on-surface-variant leading-relaxed"
              dir="rtl"
            >
              <ReactMarkdown>{displayText}</ReactMarkdown>
            </div>

            {/* כפתור הרחבה/כיווץ — מוצג רק כשיש טקסט ארוך */}
            {isLong && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(prev => !prev)}
                className="mt-3 text-primary hover:text-primary-fixed p-0 h-auto"
                aria-expanded={expanded}
              >
                {expanded ? 'הצג פחות' : 'קרא עוד'}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
