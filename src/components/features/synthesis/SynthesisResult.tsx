'use client'

/**
 * SynthesisResult — מציג תוצאות הסינתזה המיסטית
 * כולל פרופיל אישיות, תחזיות עתידיות, המלצות מעשיות וסקציות שבועיות
 */

import { motion } from 'framer-motion'
import { Star, AlertTriangle, Sparkles, CheckCircle, TrendingUp, Brain } from 'lucide-react'

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
  גבוהה: 'bg-tertiary/10 text-tertiary border-tertiary/30',
  בינונית: 'bg-secondary/10 text-secondary border-secondary/30',
  נמוכה: 'bg-outline/10 text-on-surface-variant border-outline/30',
}

/** צבעי תגית קושי */
const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-tertiary/10 text-tertiary border-tertiary/30',
  medium: 'bg-secondary/10 text-secondary border-secondary/30',
  hard: 'bg-error/10 text-error border-error/30',
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
            <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
              <h4 className="text-base text-primary font-headline font-semibold flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4" />
                ניתוח שימוש
              </h4>
              <div className="space-y-3">
                <p className="text-sm text-on-surface-variant font-body bg-surface-container-high p-3 rounded-lg">
                  {usage_analysis.pattern_insight}
                </p>
                <div className="flex flex-wrap gap-2">
                  {usage_analysis.most_used_tools.map((tool, i) => (
                    <span key={i} className="bg-primary-container/10 text-primary font-label text-xs px-2 py-1 rounded-full">
                      {tool}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-on-surface-variant/80 font-label">
                  זמן פעילות שיא: {usage_analysis.peak_activity_times}
                </p>
              </div>
            </div>
          )}

          {practical_integration && practical_integration.length > 0 && (
            <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
              <h4 className="text-base text-tertiary font-headline font-semibold flex items-center gap-2 mb-4">
                <CheckCircle className="h-4 w-4" />
                אינטגרציה מעשית
              </h4>
              <div className="space-y-3">
                {practical_integration.map((item, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-surface-container-high rounded-lg">
                    <div className="mt-1 shrink-0">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          item.difficulty === 'easy'
                            ? 'bg-tertiary'
                            : item.difficulty === 'medium'
                              ? 'bg-secondary'
                              : 'bg-error'
                        }`}
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <p className="text-sm text-on-surface font-body font-medium">{item.suggestion}</p>
                        <span
                          className={`text-xs shrink-0 px-2 py-0.5 rounded-full border font-label ${DIFFICULTY_COLORS[item.difficulty] ?? ''}`}
                        >
                          {DIFFICULTY_LABELS[item.difficulty] ?? item.difficulty}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant font-body">{item.context}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {period_summary && (
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-br from-primary-container/10 to-secondary-container/10 rounded-xl p-6 border border-outline-variant/5">
            <h3 className="text-base font-headline font-bold text-on-surface mb-3">סיכום תקופה</h3>
            <p className="text-on-surface-variant font-body leading-relaxed">{period_summary}</p>
          </div>
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
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
          <h3 className="text-lg text-primary font-headline font-semibold flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5" />
            פרופיל אישיות משולב
          </h3>
          <div className="space-y-6">
            <p className="text-on-surface font-body leading-relaxed border-s-4 border-primary/40 ps-4 bg-primary-container/5 py-3 rounded-e-lg">
              {personality_profile.summary}
            </p>

            <div className="grid lg:grid-cols-3 gap-4">
              {/* נקודות חוזק */}
              <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/5">
                <h4 className="text-sm text-tertiary font-headline font-semibold flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4" />
                  נקודות חוזק
                </h4>
                <ul className="space-y-2">
                  {personality_profile.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 font-body text-sm text-on-surface-variant">
                      <CheckCircle className="h-3 w-3 text-tertiary mt-1 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* אתגרים */}
              <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/5">
                <h4 className="text-sm text-secondary font-headline font-semibold flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4" />
                  אתגרים
                </h4>
                <ul className="space-y-2">
                  {personality_profile.challenges.map((item, i) => (
                    <li key={i} className="font-body text-sm text-on-surface-variant">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* כישרונות נסתרים */}
              <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/5">
                <h4 className="text-sm text-primary font-headline font-semibold flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4" />
                  כישרונות נסתרים
                </h4>
                <ul className="space-y-2">
                  {personality_profile.hidden_talents.map((item, i) => (
                    <li key={i} className="font-body text-sm text-on-surface-variant">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* תחזיות עתידיות */}
      <motion.div variants={itemVariants}>
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
          <h3 className="text-lg text-primary font-headline font-semibold flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5" />
            תחזיות עתידיות
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {predictive_insights.map((insight, i) => (
              <div
                key={i}
                className="p-4 bg-surface-container-high rounded-lg border border-outline-variant/5 space-y-2"
              >
                <div className="flex justify-between items-start gap-2">
                  <span className="bg-primary-container/10 text-primary font-label text-xs px-2 py-1 rounded-full">
                    {insight.timeframe}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-label ${PROBABILITY_COLORS[insight.probability] ?? 'text-on-surface-variant'}`}
                  >
                    {insight.probability}
                  </span>
                </div>
                <p className="text-sm text-on-surface font-body font-medium">{insight.area}</p>
                <p className="text-xs text-on-surface-variant font-body leading-relaxed">{insight.prediction}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* המלצות מעשיות */}
      <motion.div variants={itemVariants}>
        <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/5">
          <h3 className="text-lg text-tertiary font-headline font-semibold flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5" />
            המלצות מעשיות
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 bg-surface-container-high rounded-lg border border-outline-variant/5"
              >
                <span className="text-primary font-headline font-bold shrink-0 text-lg">{i + 1}.</span>
                <div className="min-w-0">
                  <p className="text-sm text-on-surface font-body font-medium mb-1">{rec.action}</p>
                  <p className="text-xs text-on-surface-variant font-body mb-2">{rec.reason}</p>
                  {rec.related_tool && (
                    <span className="bg-primary-container/10 text-primary font-label text-xs px-2 py-1 rounded-full">
                      כלי קשור: {rec.related_tool}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
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
