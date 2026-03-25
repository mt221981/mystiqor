'use client'

/**
 * דף סינסטרי — ניתוח תאימות אסטרולוגית בין שני אנשים
 * מחשב שני גלגלות לידה עם ephemeris אמיתי ומציג אספקטים בין-גלגלות + פרשנות
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react'
import { GiLovers } from 'react-icons/gi'
import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'

// ===== סכמות ולידציה =====

const PersonFormSchema = z.object({
  name: z.string().min(1, 'שם חובה'),
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
  birthTime: z.string().optional(),
  latitude: z.number({ error: 'נדרש מיקום' }),
  longitude: z.number({ error: 'נדרש מיקום' }),
  locationName: z.string().optional(),
})

const FormSchema = z.object({
  person1: PersonFormSchema,
  person2: PersonFormSchema,
})

type FormValues = z.input<typeof FormSchema>

// ===== טיפוסים =====

interface AspectResult { planet1: string; planet2: string; type: string; orb: number; strength: number }
interface PlanetDetail { name: string; sign: string; house: number; degree_in_sign: number }
interface PersonMeta { sunSign: string; moonSign: string; ascendant: string; elements: Record<string, number> }
interface SynastryInterpretation {
  compatibility_score: number
  sun_sun_dynamic: string
  moon_moon_dynamic: string
  venus_mars_chemistry: string
  strengths: string[]
  challenges: string[]
  recommendations: string[]
  summary: string
}
interface SynastryResult {
  person1_chart: PlanetDetail[]
  person2_chart: PlanetDetail[]
  person1_meta: PersonMeta
  person2_meta: PersonMeta
  inter_aspects: AspectResult[]
  interpretation: SynastryInterpretation
  analysis_id: string | null
}

// ===== פונקציות עזר =====

async function fetchSynastry(input: FormValues): Promise<SynastryResult> {
  const res = await fetch('/api/tools/astrology/synastry', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בניתוח סינסטרי' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בניתוח סינסטרי')
  }
  return ((await res.json()) as { data: SynastryResult }).data
}

/** טיפוס צבע לפי ציון */
function scoreColor(score: number): string {
  if (score >= 75) return 'text-tertiary'
  if (score >= 50) return 'text-secondary'
  return 'text-error'
}

// ===== קומפוננטת תוצאות =====

interface SynastryResultsProps {
  result: SynastryResult
  person1Name: string
  person2Name: string
}

function SynastryResults({ result, person1Name, person2Name }: SynastryResultsProps) {
  const [showAspects, setShowAspects] = useState(false)
  const { interpretation, inter_aspects } = result

  return (
    <motion.div
      initial={animations.fadeInUp.initial}
      animate={animations.fadeInUp.animate}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="space-y-4"
    >
      {/* ציון תאימות */}
      <Card className="border-outline-variant/5 bg-surface-container text-center">
        <CardContent className="pt-6">
          <div className={`text-7xl font-headline font-bold ${scoreColor(interpretation.compatibility_score)}`}>
            {interpretation.compatibility_score}%
          </div>
          <p className="text-on-surface-variant text-sm mt-1 font-label">ציון תאימות — {person1Name} & {person2Name}</p>
          <p className="text-on-surface-variant text-sm mt-3 leading-relaxed max-w-lg mx-auto font-body">{interpretation.summary}</p>
        </CardContent>
      </Card>

      {/* דינמיקות עיקריות */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'דינמיקת שמש-שמש', content: interpretation.sun_sun_dynamic, icon: '☀️' },
          { title: 'דינמיקת ירח-ירח', content: interpretation.moon_moon_dynamic, icon: '🌙' },
          { title: 'כימיה נוגה-מאדים', content: interpretation.venus_mars_chemistry, icon: '♀' },
        ].map((card) => (
          <Card key={card.title} className="border-outline-variant/5 bg-surface-container">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-headline text-primary flex items-center gap-2">
                <span>{card.icon}</span>{card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-on-surface-variant text-sm leading-relaxed font-body">{card.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* חוזקות ואתגרים */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="border-outline-variant/5 bg-surface-container flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline text-tertiary flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />חוזקות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {interpretation.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                  <CheckCircle className="h-3 w-3 text-tertiary mt-1 shrink-0" />{s}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-outline-variant/5 bg-surface-container flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-headline text-secondary flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />אתגרים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {interpretation.challenges.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                  <AlertTriangle className="h-3 w-3 text-secondary mt-1 shrink-0" />{c}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* המלצות */}
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
            <GiLovers className="h-4 w-4" />המלצות
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {interpretation.recommendations.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-on-surface-variant font-body">
                <GiLovers className="h-3 w-3 text-primary mt-1 shrink-0" />{r}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* טבלת אספקטים בין-גלגלות */}
      <Card className="border-outline-variant/5 bg-surface-container">
        <CardHeader className="pb-2">
          <button
            onClick={() => setShowAspects(!showAspects)}
            className="w-full flex items-center justify-between text-base font-headline text-primary font-semibold"
          >
            <span>אספקטים בין-גלגלות ({inter_aspects.length})</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showAspects ? 'rotate-180' : ''}`} />
          </button>
        </CardHeader>
        {showAspects && (
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-on-surface-variant">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-on-surface-variant/60">
                    <th className="pb-2 text-start font-label">כוכב 1</th>
                    <th className="pb-2 text-center font-label">אספקט</th>
                    <th className="pb-2 text-start font-label">כוכב 2</th>
                    <th className="pb-2 text-end font-label">orb</th>
                    <th className="pb-2 text-end font-label">עוצמה</th>
                  </tr>
                </thead>
                <tbody>
                  {inter_aspects.slice(0, 20).map((asp, i) => (
                    <tr key={i} className="border-b border-outline-variant/10 hover:bg-surface-container-high/30">
                      <td className="py-1 text-primary font-label">{asp.planet1.replace('p1:', '')}</td>
                      <td className="py-1 text-center text-secondary font-label">{asp.type}</td>
                      <td className="py-1 text-on-surface-variant font-label">{asp.planet2.replace('p2:', '')}</td>
                      <td className="py-1 text-end text-on-surface-variant/60 font-label">{asp.orb}°</td>
                      <td className="py-1 text-end font-label">
                        <span className={asp.strength > 0.7 ? 'text-tertiary' : asp.strength > 0.4 ? 'text-secondary' : 'text-on-surface-variant/60'}>
                          {Math.round(asp.strength * 100)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </motion.div>
  )
}

// ===== קומפוננטת הדף הראשית =====

export default function SynastryPage() {
  const [result, setResult] = useState<SynastryResult | null>(null)
  const { incrementUsage } = useSubscription()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      person1: { latitude: 31.7683, longitude: 35.2137, locationName: 'ירושלים' },
      person2: { latitude: 31.7683, longitude: 35.2137, locationName: 'ירושלים' },
    },
  })

  const mutation = useMutation({
    mutationFn: fetchSynastry,
    onSuccess: (data) => {
      setResult(data)
      toast.success('ניתוח סינסטרי הושלם')
      // עדכן שימוש — non-blocking, non-fatal
      void incrementUsage().catch(() => {})
    },
    onError: (err) => { toast.error(err instanceof Error ? err.message : 'שגיאה בניתוח סינסטרי') },
  })

  const renderPersonSection = (prefix: 'person1' | 'person2', title: string) => (
    <Card className="border-outline-variant/5 bg-surface-container flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-headline text-primary flex items-center gap-2">
          <GiLovers className="h-4 w-4" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-on-surface-variant text-sm font-label">שם</Label>
          <Input placeholder="שם מלא" {...register(`${prefix}.name`)} />
          {errors[prefix]?.name && <p className="text-xs text-error font-label">{errors[prefix]?.name?.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-on-surface-variant text-sm font-label">תאריך לידה</Label>
          <Input type="date" dir="ltr" {...register(`${prefix}.birthDate`)} />
          {errors[prefix]?.birthDate && <p className="text-xs text-error font-label">{errors[prefix]?.birthDate?.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-on-surface-variant text-sm font-label">שעת לידה (אופציונלי)</Label>
          <Input type="time" dir="ltr" {...register(`${prefix}.birthTime`)} />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-on-surface-variant text-sm font-label">קו רוחב</Label>
            <Input
              type="number"
              step="0.0001"
              placeholder="31.7683"
              dir="ltr"
              {...register(`${prefix}.latitude`, { valueAsNumber: true })}
            />
            {errors[prefix]?.latitude && <p className="text-xs text-error font-label">{errors[prefix]?.latitude?.message}</p>}
          </div>
          <div className="space-y-1">
            <Label className="text-on-surface-variant text-sm font-label">קו אורך</Label>
            <Input
              type="number"
              step="0.0001"
              placeholder="35.2137"
              dir="ltr"
              {...register(`${prefix}.longitude`, { valueAsNumber: true })}
            />
            {errors[prefix]?.longitude && <p className="text-xs text-error font-label">{errors[prefix]?.longitude?.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div dir="rtl" className="container mx-auto px-4 py-6 max-w-5xl">
      <PageHeader
        title="סינסטרי"
        description="תאימות אסטרולוגית — ניתוח שני גלגלות לידה ואספקטים בין-גלגלות"
        icon={<GiLovers className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'אסטרולוגיה', href: '/tools/astrology' },
          { label: 'סינסטרי' },
        ]}
      />

      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="border-outline-variant/5 bg-surface-container">
          <CardHeader>
            <CardTitle className="text-lg font-headline text-primary">הזן נתוני לידה לשני אנשים</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {renderPersonSection('person1', 'אדם 1')}
                  {renderPersonSection('person2', 'אדם 2')}
                </div>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold"
                >
                  {mutation.isPending ? 'מחשב סינסטרי...' : 'חשב סינסטרי'}
                </Button>
              </form>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {result && (
        <SynastryResults
          result={result}
          person1Name={result.person1_chart[0] ? 'אדם 1' : 'אדם 1'}
          person2Name={result.person2_chart[0] ? 'אדם 2' : 'אדם 2'}
        />
      )}
    </div>
  )
}
