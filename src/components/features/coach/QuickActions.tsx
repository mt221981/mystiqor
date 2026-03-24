'use client'

/**
 * קומפוננטת פעולות מהירות — 6 כפתורים עם פרומפטים מוכנים מראש
 * מוצגת כשאין הודעות בשיחה — עוזרת למשתמש להתחיל בקלות
 */

import { memo } from 'react'
import { Button } from '@/components/ui/button'
import { Hash, Stars, Heart, Briefcase, TrendingUp, HelpCircle } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** פריט פעולה מהירה */
interface QuickAction {
  id: string
  label: string
  icon: LucideIcon
  prompt: string
}

/** רשימת הפעולות המהירות — 6 קטגוריות אימון */
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'numerology_insight',
    label: 'תובנת נומרולוגיה',
    icon: Hash,
    prompt: 'תן לי תובנה מעמיקה על מספר מסלול החיים שלי',
  },
  {
    id: 'astrology_today',
    label: 'אסטרולוגיה היום',
    icon: Stars,
    prompt: 'מה המזלות אומרים לי היום?',
  },
  {
    id: 'love_advice',
    label: 'ייעוץ זוגי',
    icon: Heart,
    prompt: 'תן לי עצה בנושא יחסים ואהבה',
  },
  {
    id: 'career_guidance',
    label: 'הכוונה תעסוקתית',
    icon: Briefcase,
    prompt: 'מה עלי לעשות כדי להתקדם בקריירה?',
  },
  {
    id: 'personal_growth',
    label: 'צמיחה אישית',
    icon: TrendingUp,
    prompt: 'איך אני יכול להתפתח באופן אישי?',
  },
  {
    id: 'daily_challenge',
    label: 'אתגר יומי',
    icon: HelpCircle,
    prompt: 'תן לי אתגר יומי לצמיחה אישית',
  },
]

/** Props של קומפוננטת הפעולות המהירות */
interface QuickActionsProps {
  /** פונקציה הנקראת עם הפרומפט כשהמשתמש לוחץ על פעולה */
  onAction: (prompt: string) => void
  /** האם הכפתורים מושבתים */
  disabled?: boolean
}

/**
 * רשת כפתורי פעולה מהירה — 2 עמודות במובייל, 3 בדסקטופ
 * ממומגנת עם memo למניעת רינדורים מיותרים
 */
export const QuickActions = memo(function QuickActionsComponent({
  onAction,
  disabled,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon
        return (
          <Button
            key={action.id}
            onClick={() => onAction(action.prompt)}
            disabled={disabled}
            variant="outline"
            className="border-purple-700/30 bg-purple-900/20 hover:bg-purple-800/30 text-white h-auto py-4 flex flex-col items-center gap-2"
          >
            <Icon className="w-5 h-5 text-purple-400" />
            <span className="text-sm">{action.label}</span>
          </Button>
        )
      })}
    </div>
  )
})

QuickActions.displayName = 'QuickActions'
