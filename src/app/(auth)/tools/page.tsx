'use client'

/**
 * עמוד כלים מיסטיים — רשת 6 כלים עיקריים
 * משתמש ב-StandardSectionHeader לאחידות אטמוספרית עם שאר עמודי הכלים
 */

import { motion, useReducedMotion } from 'framer-motion'
import { GiSpellBook } from 'react-icons/gi'

import { ToolGrid } from '@/components/features/shared/ToolGrid'
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'

/** עמוד כלים מיסטיים — יעד טאב הכלים בניווט התחתון */
export default function ToolsPage() {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      dir="rtl"
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="כלים מיסטיים"
        description="בחר כלי לניתוח מיסטי מעמיק"
        icon={<GiSpellBook className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים' },
        ]}
      />
      <div className="mt-6">
        <ToolGrid />
      </div>
    </motion.div>
  )
}
