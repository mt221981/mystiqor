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
import { Card, CardContent } from '@/components/ui/card'
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard'
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
          className="mb-6 flex items-center gap-2 text-sm text-gray-400"
        >
          <Database className="h-4 w-4" />
          <span>
            {analysisCount ?? 0} ניתוחים זמינים לסינתזה
            {!hasEnoughAnalyses && (
              <span className="text-amber-400 me-2"> — נדרשים לפחות 2 ניתוחים</span>
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
          <Card className="bg-gradient-to-br from-indigo-900/40 via-purple-900/40 to-gray-900/40 border-indigo-500/30">
            <CardContent className="p-8 text-center flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-purple-500/20">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">סינתזה הוליסטית</h2>
                <p className="text-indigo-200 text-sm mb-6 leading-relaxed">
                  שילוב כל הכלים לפרופיל אישיות מאוחד ותחזית עתידית מקיפה.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => generateMutation.mutate('on_demand')}
                disabled={generateMutation.isPending || !hasEnoughAnalyses}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
              >
                {generateMutation.isPending && generateMutation.variables === 'on_demand' ? (
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                ) : null}
                {!hasEnoughAnalyses ? 'נדרשים לפחות 2 ניתוחים' : 'צור סינתזה'}
              </Button>
            </CardContent>
          </Card>

          {/* דוח שבועי */}
          <Card className="bg-gradient-to-br from-blue-900/40 via-cyan-900/40 to-gray-900/40 border-cyan-500/30">
            <CardContent className="p-8 text-center flex flex-col h-full justify-between">
              <div>
                <div className="w-14 h-14 mx-auto bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mb-4 shadow-xl shadow-blue-500/20">
                  <Calendar className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">דוח שבועי</h2>
                <p className="text-cyan-200 text-sm mb-6 leading-relaxed">
                  ניתוח דפוסי שימוש, המלצות לשילוב רוחני וסיכום 7 הימים האחרונים.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => generateMutation.mutate('weekly')}
                disabled={generateMutation.isPending || !hasEnoughAnalyses}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white"
              >
                {generateMutation.isPending && generateMutation.variables === 'weekly' ? (
                  <Loader2 className="w-4 h-4 animate-spin me-2" />
                ) : null}
                {!hasEnoughAnalyses ? 'נדרשים לפחות 2 ניתוחים' : 'צור דוח שבועי'}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* מצב טעינה */}
        {generateMutation.isPending && (
          <motion.div
            initial={animations.fadeIn.initial}
            animate={animations.fadeIn.animate}
            className="mb-8 flex flex-col items-center gap-4 py-12"
          >
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
            <p className="text-gray-400 text-sm">יוצר סינתזה מיסטית... עשוי לקחת מספר שניות</p>
          </motion.div>
        )}

        {/* טעינה ראשונית */}
        {isLoading && !generateMutation.isPending && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse h-32 bg-gray-800/50 rounded-lg" />
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
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700/50">
              <p className="text-sm text-gray-400">
                נוצר: {new Date(latestSynthesis.created_at).toLocaleDateString('he-IL')}
              </p>
              {latestSynthesis.input_data?.sources?.length > 0 && (
                <p className="text-xs text-gray-500">
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
