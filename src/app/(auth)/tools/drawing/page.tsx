'use client'

/**
 * דף ניתוח ציורים — 3 לשוניות: ניתוח חדש, השוואה, מושגים
 * מדוע: ממשק ראשי לכלי ניתוח הציורים הפסיכולוגי — HTP, Koppitz, FDM
 * SubscriptionGuard מגן רק על לשונית הניתוח — השוואה ומושגים פתוחים לכולם
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Palette } from 'lucide-react'
import dynamic from 'next/dynamic'

import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { DrawingAnalysisForm } from '@/components/features/drawing/DrawingAnalysisForm'
import { animations } from '@/lib/animations/presets'
import { MYSTIC_LOADING_PHRASES } from '@/lib/constants/mystic-loading-phrases'
// SubscriptionGuard is applied inside DrawingAnalysisForm — wraps the analysis tab only
// import type {} from '@/components/features/subscription/SubscriptionGuard'

const DrawingCompare = dynamic(
  () => import('@/components/features/drawing/DrawingCompare'),
  { ssr: false }
)
const DrawingConceptCards = dynamic(
  () => import('@/components/features/drawing/DrawingConceptCards'),
  { ssr: false }
)

// ===== קבועים =====

/** לשוניות הדף */
const TABS = [
  { id: 'analyze', label: 'ניתוח חדש' },
  { id: 'compare', label: 'השוואה' },
  { id: 'concepts', label: 'מושגים' },
] as const

type TabId = (typeof TABS)[number]['id']

// ===== קומפוננטה ראשית =====

/** דף כלי ניתוח הציורים */
export default function DrawingPage() {
  const [activeTab, setActiveTab] = useState<TabId>('analyze')
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-4xl"
      dir="rtl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="ניתוח ציורים"
        description="ניתוח פסיכולוגי של ציורים (בית-עץ-אדם) — עם מדדי קופיץ ו-FDM"
        icon={<Palette className="w-6 h-6" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'ניתוח ציורים' },
        ]}
      />

      {/* לשוניות ניווט */}
      <div className="flex gap-1 mb-6 border-b border-outline-variant/30">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-label font-medium transition-colors rounded-t-md border-b-2 ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-surface-container/60'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container/30'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* לשונית 1: ניתוח חדש — SubscriptionGuard בתוך DrawingAnalysisForm */}
      {/* ביטוי טעינה: MYSTIC_LOADING_PHRASES['drawing'].button — משמש ב-DrawingAnalysisForm */}
      {activeTab === 'analyze' && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          exit={animations.fadeInUp.exit}
          transition={{ duration: 0.4 }}
        >
          <DrawingAnalysisForm />
        </motion.div>
      )}

      {/* לשונית 2: השוואה — פתוחה לכולם */}
      {activeTab === 'compare' && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.4 }}
        >
          <DrawingCompare userId="" />
        </motion.div>
      )}

      {/* לשונית 3: מושגים — פתוחה לכולם */}
      {activeTab === 'concepts' && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.4 }}
        >
          <DrawingConceptCards />
        </motion.div>
      )}
    </motion.div>
  )
}
