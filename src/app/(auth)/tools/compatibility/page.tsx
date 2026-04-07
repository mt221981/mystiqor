'use client'

/**
 * דף תאימות — ניתוח תאימות משולב: נומרולוגיה + אסטרולוגיה
 * Anti-Barnum: כל ציון מבוסס על חישוב ספציפי — לא הכללות גנריות
 */

import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Heart, CircleDot } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader'
import { MysticLoadingText } from '@/components/ui/mystic-loading-text'
import { MYSTIC_LOADING_PHRASES } from '@/lib/constants/mystic-loading-phrases'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { animations } from '@/lib/animations/presets'
import { useSubscription } from '@/hooks/useSubscription'
import { useProfileDefaults } from '@/hooks/useProfileDefaults'

// ===== סכמות טפסים =====

const PersonFormSchema = z.object({
  fullName: z.string().min(1, 'שם חובה'),
  birthDate: z.string().min(1, 'תאריך לידה חובה'),
  birthTime: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

const FormSchema = z.object({
  person1: PersonFormSchema,
  person2: PersonFormSchema,
})

type FormValues = z.infer<typeof FormSchema>

// ===== ממשק תוצאות =====

interface NumerologyBreakdown {
  life_path: number
  destiny: number
  soul: number
  overall: number
}

interface PersonSigns {
  sunSign: string
  moonSign: string
  risingSign: string
}

interface CompatibilityResult {
  numerologyScore: number
  astrologyScore: number
  totalScore: number
  numerologyBreakdown: NumerologyBreakdown
  person1Signs: PersonSigns | null
  person2Signs: PersonSigns | null
  interpretation: string
  analysis_id: string | null
}

// ===== פונקציות שירות =====

/** קריאת API לניתוח תאימות */
async function fetchCompatibility(input: FormValues): Promise<CompatibilityResult> {
  const res = await fetch('/api/tools/compatibility', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      person1: {
        fullName: input.person1.fullName,
        birthDate: input.person1.birthDate,
        ...(input.person1.birthTime ? { birthTime: input.person1.birthTime } : {}),
        ...(input.person1.latitude != null ? { latitude: input.person1.latitude } : {}),
        ...(input.person1.longitude != null ? { longitude: input.person1.longitude } : {}),
      },
      person2: {
        fullName: input.person2.fullName,
        birthDate: input.person2.birthDate,
        ...(input.person2.birthTime ? { birthTime: input.person2.birthTime } : {}),
        ...(input.person2.latitude != null ? { latitude: input.person2.latitude } : {}),
        ...(input.person2.longitude != null ? { longitude: input.person2.longitude } : {}),
      },
    }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'שגיאה בניתוח תאימות' }))
    throw new Error((err as { error?: string }).error ?? 'שגיאה בניתוח תאימות')
  }
  return ((await res.json()) as { data: CompatibilityResult }).data
}

/** מחזיר צבע Tailwind לפי ציון */
function getScoreColor(score: number): string {
  if (score >= 75) return 'text-tertiary'
  if (score >= 50) return 'text-primary'
  return 'text-on-surface-variant'
}

// ===== קומפוננט טופס אדם בודד =====

interface PersonCardProps {
  prefix: 'person1' | 'person2'
  title: string
  register: ReturnType<typeof useForm<FormValues>>['register']
  errors: ReturnType<typeof useForm<FormValues>>['formState']['errors']
}

function PersonCard({ prefix, title, register, errors }: PersonCardProps) {
  return (
    <Card className="border-outline-variant/5 bg-surface-container rounded-xl p-6 flex-1">
      <CardHeader className="pb-3">
        <CardTitle className="font-headline font-semibold text-primary text-lg flex items-center gap-2">
          <Heart className="h-4 w-4" />{title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-1">
          <Label className="text-on-surface-variant font-label text-sm">שם מלא</Label>
          <Input placeholder="שם מלא" {...register(`${prefix}.fullName`)} />
          {errors[prefix]?.fullName && <p className="text-xs text-error">{errors[prefix]?.fullName?.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-on-surface-variant font-label text-sm">תאריך לידה</Label>
          <Input type="date" dir="ltr" {...register(`${prefix}.birthDate`)} />
          {errors[prefix]?.birthDate && <p className="text-xs text-error">{errors[prefix]?.birthDate?.message}</p>}
        </div>
        <div className="space-y-1">
          <Label className="text-on-surface-variant font-label text-sm">שעת לידה (אופציונלי)</Label>
          <Input type="time" dir="ltr" {...register(`${prefix}.birthTime`)} />
        </div>
      </CardContent>
    </Card>
  )
}

// ===== קומפוננט מד ציון =====

interface ScoreBarProps {
  label: string
  score: number
  description?: string
}

function ScoreBar({ label, score, description }: ScoreBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-on-surface font-body">{label}</span>
        <span className={`font-label font-medium ${getScoreColor(score)}`}>{score}/100</span>
      </div>
      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
        {/* inline style נדרש לרוחב דינמי — אין מקבילה ב-Tailwind לערכי runtime */}
        <div
          className="h-full bg-gradient-to-l from-primary-container to-secondary-container rounded-full shadow-[0_0_15px_rgba(143,45,230,0.4)]"
          style={{ width: `${score}%` }}
        />
      </div>
      {description && (
        <p className="text-xs text-on-surface-variant font-body">{description}</p>
      )}
    </div>
  )
}

// ===== דף ראשי =====

export default function CompatibilityPage() {
  const [result, setResult] = useState<CompatibilityResult | null>(null)
  const { incrementUsage } = useSubscription()
  const shouldReduceMotion = useReducedMotion()

  const { defaults } = useProfileDefaults()

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    values: defaults
      ? {
          person1: {
            fullName: defaults.fullName,
            birthDate: defaults.birthDate,
            birthTime: defaults.birthTime || undefined,
            latitude: defaults.latitude ?? undefined,
            longitude: defaults.longitude ?? undefined,
          },
          person2: { fullName: '', birthDate: '' },
        }
      : undefined,
  })

  const mutation = useMutation({
    mutationFn: fetchCompatibility,
    onSuccess: (data) => { setResult(data); toast.success('הניתוח הושלם'); void incrementUsage().catch(() => {}) },
    onError: (err) => { toast.error(err instanceof Error ? err.message : 'שגיאה בניתוח תאימות') },
  })

  return (
    <motion.div
      dir="rtl"
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="ניתוח תאימות"
        description="ניתוח תאימות אסטרולוגי ונומרולוגי משולב — ציוני אמת, לא הכללות"
        icon={<CircleDot className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'תאימות' },
        ]}
      />

      {/* טופס קלט */}
      <motion.div
        initial={animations.fadeInUp.initial}
        animate={animations.fadeInUp.animate}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <Card className="border-outline-variant/5 bg-surface-container mystic-hover">
          <CardHeader>
            <CardTitle className="text-lg text-primary font-headline">הזן נתוני לידה</CardTitle>
          </CardHeader>
          <CardContent>
            <SubscriptionGuard feature="analyses">
              <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
                {/* שני עמודות — אדם 1 + אדם 2 */}
                <div className="flex flex-col md:flex-row gap-4">
                  <PersonCard prefix="person1" title="אדם 1" register={register} errors={errors} />
                  <PersonCard prefix="person2" title="אדם 2" register={register} errors={errors} />
                </div>

                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95"
                >
                  {mutation.isPending
                    ? <MysticLoadingText text={MYSTIC_LOADING_PHRASES['compatibility']?.button ?? 'בוחן את ההתאמה...'} />
                    : 'נתח תאימות'}
                </Button>
              </form>
            </SubscriptionGuard>
          </CardContent>
        </Card>
      </motion.div>

      {/* תוצאות */}
      {result && (
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          {/* ציון כולל */}
          <Card className="border-outline-variant/5 bg-surface-container text-center mystic-hover">
            <CardContent className="pt-6 pb-6">
              <div className={`text-6xl font-headline font-black ${getScoreColor(result.totalScore)}`}>
                {result.totalScore}<span className="text-2xl text-on-surface-variant font-normal">/100</span>
              </div>
              <p className="font-label text-sm text-on-surface-variant mt-1">ציון תאימות כולל</p>
              <p className="text-xs text-on-surface-variant/60 mt-0.5">נומרולוגיה 40% + אסטרולוגיה 60%</p>
            </CardContent>
          </Card>

          {/* פירוט ציוני מימדים */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardHeader><CardTitle className="text-base text-primary font-headline">פירוט ציונים</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <ScoreBar label="ניתוח נומרולוגי" score={result.numerologyScore}
                description={`נתיב חיים: ${result.numerologyBreakdown.life_path}/100 · גורל: ${result.numerologyBreakdown.destiny}/100 · נשמה: ${result.numerologyBreakdown.soul}/100`} />
              <ScoreBar label="ניתוח אסטרולוגי" score={result.astrologyScore}
                description={result.person1Signs && result.person2Signs
                  ? `שמש: ${result.person1Signs.sunSign} ↔ ${result.person2Signs.sunSign} · ירח: ${result.person1Signs.moonSign} ↔ ${result.person2Signs.moonSign}`
                  : 'ציון ברירת מחדל — הזן קואורדינטות לדיוק מלא'} />
            </CardContent>
          </Card>

          {/* פרשנות AI */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardHeader>
              <CardTitle className="text-base text-primary font-headline">ניתוח מפורט</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="result-heading-glow prose prose-invert prose-sm max-w-none text-on-surface-variant font-body">
                <ReactMarkdown>{result.interpretation}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
