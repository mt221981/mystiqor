'use client'

/**
 * דף סינתזה מיסטית — ייצור וצפייה בסינתזה הוליסטית
 * מדוע: ממשק ראשי לכלי הסינתזה המיסטית (SYNT-01, SYNT-02, SYNT-03) — מאחד תובנות מכל הכלים.
 */

import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Sparkles, Brain, Calendar, Loader2, Database } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/layouts/PageHeader'
import { Button } from '@/components/ui/button'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
import { useSubscription } from '@/hooks/useSubscription'
import { SynthesisResult } from '@/components/features/synthesis/SynthesisResult'
import { createClient } from '@/lib/supabase/client'
import { animations } from '@/lib/animations/presets'

// ===== טיפוסים =====

/** תוצאת סינתזה שמורה */
interface SynthesisAnalysis {
  id: string
  results: {
    personality_profile: {
      summary: string
      strengths: string[]
      challenges: string[]
      hidden_talents: string[]
    }
    predictive_insights: Array<{
      timeframe: string
      area: string
      prediction: string
      probability: string
    }>
    recommendations: Array<{
      action: string
      reason: string
      related_tool?: string
    }>
    usage_analysis?: {
      most_used_tools: string[]
      peak_activity_times: string
      pattern_insight: string
    }
    practical_integration?: Array<{
      suggestion: string
      context: string
      difficulty: 'easy' | 'medium' | 'hard'
    }>
    period_summary?: string
  }
  created_at: string
  input_data: {
    sources: string[]
    type: string
  }
}

// ===== קומפוננטה =====

/** דף סינתזה מיסטית הוליסטית */
export default function SynthesisPage() {
  const queryClient = useQueryClient()
  const supabase = createClient()

  // טעינת הסינתזה האחרונה
  const { data: latestSynthesis, isLoading } = useQuery({
    queryKey: ['synthesis-latest'],
    queryFn: async () => {
      const { data } = await supabase
        .from('analyses')
        .select('*')
        .eq('tool_type', 'synthesis')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      return data as SynthesisAnalysis | null
    },
  })

  // ספירת ניתוחים זמינים לסינתזה (לא כולל סינתזות)
  const { data: analysisCount } = useQuery({
    queryKey: ['synthesis-analysis-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('analyses')
        .select('*', { count: 'exact', head: true })
        .neq('tool_type', 'synthesis')
      return count ?? 0
    },
  })

  const { incrementUsage } = useSubscription()
  const hasEnoughAnalyses = (analysisCount ?? 0) >= 2

  // Mutation ליצירת סינתזה חדשה
  const generateMutation = useMutation({
    mutationFn: async (type: 'on_demand' | 'weekly') => {
      const res = await fetch('/api/tools/synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'שגיאה' }))
        throw new Error((err as { error?: string }).error ?? 'שגיאה')
      }
      return res.json()
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['synthesis-latest'] })
      void incrementUsage().catch(() => {})
      toast.success('הסינתזה המיסטית הושלמה בהצלחה!')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'שגיאה ביצירת הסינתזה')
    },
  })

  return (
    <div dir="rtl" className="container mx-auto px-4 py-6 max-w-5xl">
      <PageHeader
        title="סינתזה מיסטית הוליסטית"
        description="ה-AI שלנו מחבר את כל הנקודות מכל הכלים לתמונה אחת שלמה וצלולה"
        icon={<Sparkles className="h-5 w-5" />}
        breadcrumbs={[
          { label: 'דף הבית', href: '/' },
          { label: 'כלים', href: '/tools' },
          { label: 'סינתזה מיסטית' },
        ]}
      />

      <SubscriptionGuard feature="analyses">
        {/* סטטיסטיקה */}
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.3 }}
          className="mb-6 flex items-center gap-2 text-sm text-on-surface-variant font-body"
        >
          <Database className="h-4 w-4" />
          <span>
            {analysisCount ?? 0} ניתוחים זמינים לסינתזה
            {!hasEnoughAnalyses && (
              <span className="text-tertiary me-2"> — נדרשים לפחות 2 ניתוחים</span>
            )}
          </span>
        </motion.div>

        {/* כרטיסי פעולה */}
        <motion.div
          initial={animations.fadeInUp.initial}
          animate={animations.fadeInUp.animate}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="grid md:grid-cols-2 gap-6 mb-8"
        >
          {/* סינתזה הוליסטית */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5 flex flex-col h-full justify-between gap-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-primary-container to-secondary-container rounded-full flex items-center justify-center mb-4 celestial-glow">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-headline font-bold text-on-surface text-xl mb-2">סינתזה הוליסטית</h2>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                שילוב כל הכלים לפרופיל אישיות מאוחד ותחזית עתידית מקיפה.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => generateMutation.mutate('on_demand')}
              disabled={generateMutation.isPending || !hasEnoughAnalyses}
              className="w-full bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95 hover:opacity-90"
            >
              {generateMutation.isPending && generateMutation.variables === 'on_demand' ? (
                <Loader2 className="w-4 h-4 animate-spin me-2" />
              ) : null}
              {!hasEnoughAnalyses ? 'נדרשים לפחות 2 ניתוחים' : 'צור סינתזה'}
            </Button>
          </div>

          {/* דוח שבועי */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5 flex flex-col h-full justify-between gap-6">
            <div className="text-center">
              <div className="w-14 h-14 mx-auto bg-gradient-to-br from-secondary-container to-primary-container rounded-full flex items-center justify-center mb-4 celestial-glow">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <h2 className="font-headline font-bold text-on-surface text-xl mb-2">דוח שבועי</h2>
              <p className="text-on-surface-variant font-body text-sm leading-relaxed">
                ניתוח דפוסי שימוש, המלצות לשילוב רוחני וסיכום 7 הימים האחרונים.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => generateMutation.mutate('weekly')}
              disabled={generateMutation.isPending || !hasEnoughAnalyses}
              className="w-full bg-gradient-to-br from-secondary-container to-primary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95 hover:opacity-90"
            >
              {generateMutation.isPending && generateMutation.variables === 'weekly' ? (
                <Loader2 className="w-4 h-4 animate-spin me-2" />
              ) : null}
              {!hasEnoughAnalyses ? 'נדרשים לפחות 2 ניתוחים' : 'צור דוח שבועי'}
            </Button>
          </div>
        </motion.div>

        {/* מצב טעינה */}
        {generateMutation.isPending && (
          <motion.div
            initial={animations.fadeIn.initial}
            animate={animations.fadeIn.animate}
            className="mb-8 flex flex-col items-center gap-4 py-12"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-on-surface-variant font-body text-sm">יוצר סינתזה מיסטית... עשוי לקחת מספר שניות</p>
          </motion.div>
        )}

        {/* טעינה ראשונית */}
        {isLoading && !generateMutation.isPending && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-32 bg-surface-container rounded-lg" />
            ))}
          </div>
        )}

        {/* תוצאות */}
        {latestSynthesis && !generateMutation.isPending && (
          <motion.div
            initial={animations.fadeInUp.initial}
            animate={animations.fadeInUp.animate}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant/20">
              <p className="text-sm text-on-surface-variant font-body">
                נוצר: {new Date(latestSynthesis.created_at).toLocaleDateString('he-IL')}
              </p>
              {latestSynthesis.input_data?.sources?.length > 0 && (
                <p className="text-xs text-on-surface-variant/60 font-label">
                  מבוסס על: {latestSynthesis.input_data.sources.join(', ')}
                </p>
              )}
            </div>
            <SynthesisResult result={latestSynthesis.results} />
          </motion.div>
        )}
      </SubscriptionGuard>
    </div>
  )
}
