'use client'

/** עמוד מילון אסטרולוגי — מזלות, כוכבים, בתים ואספקטים בטאבים */

import { Orbit } from 'lucide-react'

import { PageHeader } from '@/components/layouts/PageHeader'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ZodiacGrid } from '@/components/features/astrology/ZodiacGrid'
import { PlanetGrid } from '@/components/features/astrology/PlanetGrid'
import { HouseList } from '@/components/features/astrology/HouseList'
import { AspectDictionary } from '@/components/features/astrology/AspectDictionary'

/**
 * עמוד מילון אסטרולוגי
 * מציג ארבעה קטגוריות — מזלות, כוכבים, בתים ואספקטים — בטאבים
 */
export default function AstrologyDictionaryPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="מילון אסטרולוגי"
        description="מדריך עיון מלא — מזלות, כוכבים, בתים ואספקטים"
        icon={<Orbit className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'למידה', href: '/learn/tutorials' },
          { label: 'מילון אסטרולוגי' },
        ]}
      />

      <Tabs defaultValue="signs" dir="rtl">
        <TabsList className="w-full grid grid-cols-4 bg-surface-container-high">
          <TabsTrigger value="signs">מזלות</TabsTrigger>
          <TabsTrigger value="planets">כוכבים</TabsTrigger>
          <TabsTrigger value="houses">בתים</TabsTrigger>
          <TabsTrigger value="aspects">אספקטים</TabsTrigger>
        </TabsList>

        <TabsContent value="signs" className="mt-4">
          <ZodiacGrid />
        </TabsContent>

        <TabsContent value="planets" className="mt-4">
          <PlanetGrid />
        </TabsContent>

        <TabsContent value="houses" className="mt-4">
          <HouseList />
        </TabsContent>

        <TabsContent value="aspects" className="mt-4">
          <AspectDictionary />
        </TabsContent>
      </Tabs>
    </div>
  )
}
