'use client'

/**
 * דף המסע האישי — עמוד standalone של מסעות האימון
 *
 * מציג את JourneysPanel כחוויה עצמאית, נגיש ישירות מהסיידבר והדשבורד,
 * ולא רק כטאב בתוך /coach. (JOUR-03)
 */

import { Route } from 'lucide-react'
import { PageHeader } from '@/components/layouts/PageHeader'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { JourneysPanel } from '@/components/features/coach/JourneysPanel'

/** דף המסע האישי — standalone route ב-/journey */
export default function JourneyPage() {
  return (
    <div dir="rtl" className="container mx-auto px-3 sm:px-4 py-6 max-w-6xl">
      <PageHeader
        title="המסע שלי"
        description="מסעות אימון אישיים שהמאמן בונה עבורך — התקדם צעד אחר צעד לעבר המטרות שלך"
        icon={<Route className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'המסע שלי' },
        ]}
      />

      <SubscriptionGuard feature="analyses">
        <div className="mt-6">
          <JourneysPanel />
        </div>
      </SubscriptionGuard>
    </div>
  )
}
