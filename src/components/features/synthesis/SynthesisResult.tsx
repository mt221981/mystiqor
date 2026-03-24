'use client'

/**
 * SynthesisResult — מציג תוצאות הסינתזה המיסטית
 * כולל פרופיל אישיות, תחזיות עתידיות, המלצות מעשיות וסקציות שבועיות
 */

import { motion } from 'framer-motion'
import { Star, AlertTriangle, Sparkles, CheckCircle, TrendingUp, Brain } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

// ===== טיפוסים =====

/** פרופיל אישיות */
interface PersonalityProfile {
  summary: string
  strengths: string[]
  challenges: string[]
  hidden_talents: string[]
}

/** תחזית עתידית */
interface PredictiveInsight {
  timeframe: string
  area: string
  prediction: string
  probability: string
}

/** המלצה מעשית */
interface Recommendation {
  action: string
  reason: string
  related_tool?: string
}

/** ניתוח שימוש (שבועי) */
interface UsageAnalysis {
  most_used_tools: string[]
  peak_activity_times: string
  pattern_insight: string
}

/** אינטגרציה מעשית (שבועי) */
interface PracticalIntegration {
  suggestion: string
  context: string
  difficulty: 'easy' | 'medium' | 'hard'
}

/** Props של קומפוננטת SynthesisResult */
interface SynthesisResultProps {
  result: {
    personality_profile: PersonalityProfile
    predictive_insights: PredictiveInsight[]
    recommendations: Recommendation[]
    usage_analysis?: UsageAnalysis
    practical_integration?: PracticalIntegration[]
    period_summary?: string
  }
}

// ===== קבועים =====

/** צבעי תגית הסתברות */
const PROBABILITY_COLORS: Record<string, string> = {
  גבוהה: 'bg-green-500/20 text-green-300 border-green-500/40',
  בינונית: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  נמוכה: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
}

/** צבעי תגית קושי */
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-500/20 text-green-300 border-green-500/40',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  hard: 'bg-red-500/20 text-red-300 border-red-500/40',
}

/** תוויות קושי בעברית */
const DIFFICULTY_LABELS: Record<string, string> = {
  easy: 'קל',
  medium: 'בינוני',
  hard: 'מאתגר',
}

// ===== וריאנטי אנימציה =====

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

// ===== תת-קומפוננטות שבועיות =====

/** סקציות שבועיות — usage analysis + practical integration + period summary */
function WeeklySections({
  usage_analysis,
  practical_integration,
  period_summary,
}: {
  usage_analysis?: UsageAnalysis
  practical_integration?: PracticalIntegration[]
  period_summary?: string
}) {
  if (!usage_analysis && !practical_integration?.length && !period_summary) return null

  return (
    <>
      {(usage_analysis ?? (practical_integration?.length ?? 0) > 0) && (
        <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
          {usage_analysis && (
            <Card className="border-blue-500/20 bg-gray-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-blue-300 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  ניתוח שימוש
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                  {usage_analysis.pattern_insight}
                </p>
                <div className="flex flex-wrap gap-2">
                  {usage_analysis.most_used_tools.map((tool, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {tool}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  זמן פעילות שיא: {usage_analysis.peak_activity_times}
                </p>
              </CardContent>
            </Card>
          )}

          {practical_integration && practical_integration.length > 0 && (
            <Card className="border-green-500/20 bg-gray-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-green-300 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  אינטגרציה מעשית
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {practical_integration.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <div className="mt-1 shrink-0">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.difficulty === 'easy'
                            ? 'bg-green-500'
                            : item.difficulty === 'medium'
                              ? 'bg-amber-500'
                              : 'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm text-white font-medium">{item.suggestion}</p>
                        <Badge
                          variant="outline"
                          className={`text-xs shrink-0 ${DIFFICULTY_COLORS[item.difficulty] ?? ''}`}
                        >
                          {DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-400">{item.context}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {period_summary && (
        <motion.div variants={itemVariants}>
          <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-900/20 to-purple-900/20">
            <CardContent className="pt-6">
              <h3 className="text-base font-bold text-white mb-3">סיכום תקופה</h3>
              <p className="text-gray-300 leading-relaxed">{period_summary}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  )
}

// ===== קומפוננטה ראשית =====

/**
 * מציג את תוצאות הסינתזה המיסטית המלאות
 * פרופיל אישיות + תחזיות + המלצות + סקציות שבועיות אופציונליות
 */
export function SynthesisResult({ result }: SynthesisResultProps) {
  const { personality_profile, predictive_insights, recommendations } = result

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* פרופיל אישיות */}
      <motion.div variants={itemVariants}>
        <Card className="border-purple-500/20 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-purple-300 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              פרופיל אישיות משולב
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-200 leading-relaxed border-s-4 border-purple-500 ps-4 bg-purple-500/5 py-3 rounded-e-lg">
              {personality_profile.summary}
            </p>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* נקודות חוזק */}
              <Card className="border-green-500/20 bg-green-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-green-400 flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    נקודות חוזק
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {personality_profile.strengths.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle className="h-3 w-3 text-green-400 mt-1 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* אתגרים */}
              <Card className="border-amber-500/20 bg-amber-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-amber-400 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    אתגרים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {personality_profile.challenges.map((item, i) => (
                      <li key={i} className="text-sm text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* כישרונות נסתרים */}
              <Card className="border-purple-500/20 bg-purple-900/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    כישרונות נסתרים
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {personality_profile.hidden_talents.map((item, i) => (
                      <li key={i} className="text-sm text-gray-300">
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* תחזיות עתידיות */}
      <motion.div variants={itemVariants}>
        <Card className="border-indigo-500/20 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-indigo-300 flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              תחזיות עתידיות
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {predictive_insights.map((insight, i) => (
                <div
                  key={i}
                  className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50 space-y-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <Badge className="bg-indigo-900/50 text-indigo-200 border-indigo-700/50 text-xs">
                      {insight.timeframe}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${PROBABILITY_COLORS[insight.probability] ?? 'text-gray-400'}`}
                    >
                      {insight.probability}
                    </Badge>
                  </div>
                  <p className="text-sm text-white font-medium">{insight.area}</p>
                  <p className="text-xs text-gray-300 leading-relaxed">{insight.prediction}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* המלצות מעשיות */}
      <motion.div variants={itemVariants}>
        <Card className="border-emerald-500/20 bg-gray-900/50">
          <CardHeader>
            <CardTitle className="text-lg text-emerald-300 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              המלצות מעשיות
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
              >
                <span className="text-emerald-400 font-bold shrink-0 text-lg">{i + 1}.</span>
                <div className="min-w-0">
                  <p className="text-sm text-white font-medium mb-1">{rec.action}</p>
                  <p className="text-xs text-gray-400 mb-2">{rec.reason}</p>
                  {rec.related_tool && (
                    <Badge variant="secondary" className="text-xs">
                      כלי קשור: {rec.related_tool}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* סקציות שבועיות */}
      <WeeklySections
        usage_analysis={result.usage_analysis}
        practical_integration={result.practical_integration}
        period_summary={result.period_summary}
      />
    </motion.div>
  )
}
