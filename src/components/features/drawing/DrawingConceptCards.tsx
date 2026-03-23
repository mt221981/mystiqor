'use client'

/**
 * DrawingConceptCards — כרטיסיות מידע חינוכיות על ניתוח ציורים HTP
 * תוכן סטטי המסביר את מתודולוגיית ניתוח הציורים למשתמשים
 *
 * מדוע: הנגשת המתודולוגיה הפסיכולוגית — עוזר למשתמשים להבין את התוצאות ולפרש אותן נכון
 */

import { Home, TreePine, User, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ===== נתוני הכרטיסיות =====

/** מבנה כרטיסיית מושג */
interface ConceptCard {
  /** כותרת הכרטיסייה */
  title: string
  /** כותרת משנה */
  subtitle: string
  /** תיאור מלא */
  description: string
  /** אייקון lucide-react לרנדור */
  Icon: React.ComponentType<{ className?: string }>
  /** צבע הטקסט של הכותרת */
  colorClass: string
  /** צבע גבול הכרטיסייה */
  borderClass: string
}

/** 4 כרטיסיות מושגים עיקריות */
const CONCEPT_CARDS: ConceptCard[] = [
  {
    title: 'מהו מבחן HTP?',
    subtitle: 'House-Tree-Person',
    description:
      'מבחן HTP (בית-עץ-אדם) פותח בשנת 1948 על ידי ג\'ון באק. המבחן מבקש מהמשתתף לצייר בית, עץ ואדם — שלושה נושאים שמייצגים את הסביבה, הזהות הנפשית והיחסים הבין-אישיים. הציורים מנותחים לפי גודל, מיקום, פרטים ולחץ העיפרון כדי לגלות תבניות רגשיות ופסיכולוגיות.',
    Icon: Home,
    colorClass: 'text-blue-300',
    borderClass: 'border-blue-500/20',
  },
  {
    title: 'מדדי Koppitz',
    subtitle: 'Koppitz Emotional Indicators',
    description:
      'ד"ר אליזבת קופיץ (1968) פיתחה 30 מדדים רגשיים לניתוח ציורי דמות אדם. כל מדד (כמו השמטת אברי גוף, עיניים חריגות, לחץ חזק) מצביע על מצב רגשי ספציפי. ציון Koppitz גבוה (21-30) מרמז על לחץ רגשי משמעותי, בינוני (11-20) על קושי מסוים, ונמוך (0-10) על איזון רגשי.',
    Icon: User,
    colorClass: 'text-purple-300',
    borderClass: 'border-purple-500/20',
  },
  {
    title: 'FDM — ציור משפחה דינמי',
    subtitle: 'Family Drawing Method',
    description:
      'שיטת ציור המשפחה הדינמי (FDM) פותחה על ידי ר\'ן ובירן (1972). מבקשים מהמשתתף לצייר את משפחתו כשכל אחד עושה משהו. ניתוח ה-FDM בוחן: מיקום הדמויות, מרחק ביניהן, פעולות, גדלים יחסיים, ומי צויר ראשון — כדי לחשוף דינמיקות משפחתיות ועמדות רגשיות.',
    Icon: TreePine,
    colorClass: 'text-green-300',
    borderClass: 'border-green-500/20',
  },
  {
    title: 'כיצד לפרש תוצאות',
    subtitle: 'פרשנות אחראית',
    description:
      'תוצאות ניתוח ציורים הן הצעות לחשיבה ולא אבחנות רפואיות. הניתוח מספק זווית ראייה נוספת על העולם הרגשי — לא תחליף לאבחון מקצועי. פרש את התוצאות בהקשר של חייך, רגשותיך ומצבך הנוכחי. אם תוצאות מעלות שאלות משמעותיות, מומלץ להתייעץ עם פסיכולוג מוסמך.',
    Icon: BookOpen,
    colorClass: 'text-yellow-300',
    borderClass: 'border-yellow-500/20',
  },
]

// ===== קומפוננטה ראשית =====

/**
 * DrawingConceptCards — כרטיסיות חינוכיות סטטיות על מתודולוגיית ניתוח ציורים
 * מסביר HTP, מדדי Koppitz, FDM ועקרונות פרשנות אחראית
 */
export default function DrawingConceptCards() {
  return (
    <div className="space-y-4" dir="rtl">
      {/* כותרת */}
      <div>
        <h3 className="text-base font-semibold text-purple-300">מושגי יסוד בניתוח ציורים</h3>
        <p className="text-sm text-gray-400 mt-1">
          הכר את המתודולוגיה הפסיכולוגית שעומדת בבסיס הניתוח
        </p>
      </div>

      {/* רשת כרטיסיות — 2 עמודות בדסקטופ, 1 במובייל */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {CONCEPT_CARDS.map((card, idx) => {
          const { Icon } = card
          return (
            <Card key={idx} className={`${card.borderClass} bg-gray-900/50`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`h-5 w-5 ${card.colorClass}`} />
                  <div>
                    <CardTitle className={`text-sm ${card.colorClass}`}>{card.title}</CardTitle>
                    <p className="text-xs text-gray-500">{card.subtitle}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-300 leading-relaxed">{card.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* הערת בסיס */}
      <p className="text-xs text-gray-500 text-center">
        * הניתוח מבוסס על מחקרים פסיכולוגיים מוכרים ואינו תחליף לאבחון מקצועי
      </p>
    </div>
  )
}
