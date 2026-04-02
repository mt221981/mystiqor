'use client'

/**
 * ReadingCard — כרטיס הצגת קריאה אסטרולוגית
 * מציג כותרת, תאריך, סיכום ופרקים מתקפלים עם react-markdown
 * משמש בדף קריאות אסטרולוגיות (readings)
 */

import ReactMarkdown from 'react-markdown'
import { Share } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils/dates'

// ===== ממשקי טיפוסים =====

/** פרק קריאה — כותרת ותוכן */
export interface ReadingSection {
  /** כותרת הפרק */
  readonly title: string
  /** תוכן הפרק (markdown) */
  readonly content: string
}

/** Props של ReadingCard */
export interface ReadingCardProps {
  /** מזהה סוג הקריאה */
  readonly type: string
  /** שם סוג הקריאה בעברית */
  readonly typeLabel: string
  /** סיכום קצר של הקריאה (2-3 משפטים) */
  readonly summary: string
  /** פרקים מפורטים — מתקפלים (אופציונלי) */
  readonly sections?: ReadingSection[]
  /** תאריך יצירת הקריאה (ISO string, אופציונלי) */
  readonly createdAt?: string
}

// ===== קומפוננטה ראשית =====

/**
 * מציג קריאה אסטרולוגית עם סיכום וכפתורי פרקים מתקפלים
 * @param props - ReadingCardProps
 */
export function ReadingCard({
  type,
  typeLabel,
  summary,
  sections = [],
  createdAt,
}: ReadingCardProps) {
  return (
    <Card className="border-outline-variant/5 bg-surface-container" dir="rtl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="text-base font-headline text-primary">
              {typeLabel}
            </CardTitle>
            <Badge variant="secondary" className="text-xs font-label">
              {type}
            </Badge>
            {createdAt && (
              <span className="text-xs text-on-surface-variant font-label">
                {formatDate(createdAt)}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-on-surface-variant hover:text-primary shrink-0"
            title="שיתוף"
            onClick={() => {
              if (navigator.share) {
                void navigator.share({
                  title: typeLabel,
                  text: summary,
                })
              }
            }}
          >
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* סיכום — תמיד גלוי */}
        <div className="text-sm text-on-surface-variant leading-relaxed font-body">
          <ReactMarkdown>{summary}</ReactMarkdown>
        </div>

        {/* פרקים מפורטים — accordion */}
        {sections.length > 0 && (
          <Accordion multiple={false} className="w-full space-y-1">
            {sections.map((section, index) => (
              <AccordionItem
                key={index}
                value={index}
                className="border border-outline-variant/10 rounded-lg px-3 bg-surface-container-high/30"
              >
                <AccordionTrigger className="text-sm font-headline text-primary py-3 hover:no-underline">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent className="pb-3">
                  <div className="text-sm text-on-surface-variant leading-relaxed font-body prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{section.content}</ReactMarkdown>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </CardContent>
    </Card>
  )
}
