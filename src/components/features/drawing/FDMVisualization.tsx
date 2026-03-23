'use client'

/**
 * FDMVisualization — תצוגת קטגוריות FDM ומדדים רגשיים מניתוח ציור
 * מציג קטגוריות FDM כתגיות ומדדים רגשיים כרשימה עם נקודות צבועות
 *
 * מדוע: מרכיב ייעודי לתצוגת ממצאי FDM (Family Drawing Method) בעברית עם RTL
 */

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ===== ממשקי טיפוסים =====

/** Props לקומפוננטת FDMVisualization */
interface FDMVisualizationProps {
  /** קטגוריות FDM שזוהו */
  categories: string[]
  /** מדדים רגשיים שזוהו בציור */
  emotionalIndicators: string[]
}

// ===== פונקציות עזר =====

/**
 * מחזיר צבע נקודה לפי אינדקס
 * מגוון צבעים לייחוד ויזואלי של מדדים שונים
 */
function getIndicatorColor(index: number): string {
  const colors: string[] = [
    'bg-purple-400',
    'bg-blue-400',
    'bg-teal-400',
    'bg-indigo-400',
    'bg-violet-400',
    'bg-cyan-400',
    'bg-sky-400',
    'bg-pink-400',
  ]
  return colors[index % colors.length] ?? 'bg-purple-400'
}

// ===== קומפוננטה ראשית =====

/**
 * תצוגת קטגוריות FDM ומדדים רגשיים
 * FDM = Family Drawing Method — שיטת ציור משפחה פסיכולוגית
 */
export function FDMVisualization({ categories, emotionalIndicators }: FDMVisualizationProps) {
  if (categories.length === 0 && emotionalIndicators.length === 0) return null

  return (
    <Card className="border-purple-500/20 bg-gray-900/50" dir="rtl">
      <CardHeader>
        <CardTitle className="text-base text-purple-300">ממצאים רגשיים ו-FDM</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* קטגוריות FDM */}
        {categories.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">קטגוריות FDM שזוהו:</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((category, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-purple-900/50 text-purple-300 border border-purple-700/30 text-xs"
                  >
                    {category}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* מדדים רגשיים */}
        {emotionalIndicators.length > 0 && (
          <div>
            <p className="text-xs font-medium text-gray-400 mb-2">מדדים רגשיים:</p>
            <div className="space-y-2">
              {emotionalIndicators.map((indicator, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${getIndicatorColor(idx)}`} />
                  <span className="text-sm text-gray-300 leading-relaxed">{indicator}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
