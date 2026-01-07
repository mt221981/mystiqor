import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { Sparkles, TrendingUp, Target, Brain, Loader2, RefreshCw, Crown, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import useSubscription from "./useSubscription";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AdvancedDailyInsights() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { subscription, planInfo } = useSubscription();
  const isPremium = ['premium', 'enterprise'].includes(subscription?.plan_type);

  const { data: goals = [] } = useQuery({
    queryKey: ['userGoals'],
    queryFn: () => base44.entities.UserGoal.list('-created_date', 10),
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-entry_date', 14),
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const { data: analyses = [] } = useQuery({
    queryKey: ['recentAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 10),
    staleTime: 5 * 60 * 1000,
    retry: 1
  });

  const { data: insights, refetch, isLoading, error } = useQuery({
    queryKey: ['advancedDailyInsights', new Date().toDateString(), isPremium],
    queryFn: async () => {
      const activeGoals = goals.filter(g => g.status === 'active');
      const recentMood = moodEntries.slice(0, 7);
      const avgMood = recentMood.length > 0 
        ? (recentMood.reduce((sum, m) => sum + (m.mood_score || 5), 0) / recentMood.length).toFixed(1)
        : null;

      const moodTrend = moodEntries.length > 1
        ? (moodEntries[0]?.mood_score > moodEntries[moodEntries.length - 1]?.mood_score ? 'עולה' : 'יורדת')
        : null;

      const contextData = {
        goals: activeGoals.map(g => ({
          title: g.goal_title,
          category: g.goal_category,
          progress: g.progress_percentage,
          target_date: g.target_date
        })),
        mood: {
          average: avgMood,
          trend: moodTrend,
          recent_entries: recentMood.map(m => ({
            date: m.entry_date,
            score: m.mood_score,
            energy: m.energy_level,
            stress: m.stress_level
          }))
        },
        analyses: analyses.map(a => ({
          type: a.tool_type,
          date: a.created_date
        }))
      };

      const prompt = isPremium ? `
אתה מאמן אישי מתקדם עם יכולות AI. נתח את הנתונים הבאים ותן תובנות עמוקות ומפורטות:

נתוני המשתמש:
${JSON.stringify(contextData, null, 2)}

צור תובנות מתקדמות הכוללות:
1. ניתוח מעמיק של הדפוסים ההתנהגותיים
2. תחזיות מדויקות למגמות עתידיות בהתבסס על הדאטה
3. המלצות אסטרטגיות לשיפור והתקדמות
4. אזהרות על סיכונים או אתגרים פוטנציאליים
5. הזדמנויות להתפתחות אישית

תן תשובה בעברית, עמוקה ומקצועית.
` : `
אתה מאמן אישי. נתח בקצרה את הנתונים הבאים:

${JSON.stringify(contextData, null, 2)}

תן תובנות בסיסיות על:
1. מצב כללי והתקדמות
2. מגמה ראשית
3. המלצה אחת מרכזית

תשובה קצרה בעברית.
`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: "object",
          properties: {
            overall_status: { type: "string" },
            key_patterns: { type: "array", items: { type: "string" } },
            predictions: { type: "array", items: { 
              type: "object",
              properties: {
                area: { type: "string" },
                prediction: { type: "string" },
                confidence: { type: "string" }
              }
            }},
            recommendations: { type: "array", items: { type: "string" } },
            warnings: { type: "array", items: { type: "string" } },
            opportunities: { type: "array", items: { type: "string" } }
          }
        }
      });

      return response;
    },
    enabled: goals.length > 0 && moodEntries.length > 0 && isPremium,
    staleTime: 12 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false
  });

  const handleRegenerate = async () => {
    setIsGenerating(true);
    await refetch();
    setIsGenerating(false);
  };

  if (!isPremium) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/80 to-purple-900/50 border-2 border-purple-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-400" />
            תובנות יומיות מתקדמות
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500">
              <Crown className="w-3 h-3 ml-1" />
              פרימיום
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Lock className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-300 mb-4">
            תובנות מתקדמות וחיזוי מגמות זמינים למנויי פרימיום
          </p>
          <Link to={createPageUrl("Pricing")}>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Crown className="w-4 h-4 ml-2" />
              שדרג לפרימיום
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-purple-900/80 to-pink-900/50 border-2 border-purple-500/50 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer" />
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-purple-300" />
            תובנות יומיות מתקדמות
            <Badge className="bg-purple-600/50 text-purple-200">
              <Sparkles className="w-3 h-3 ml-1" />
              AI Premium
            </Badge>
          </CardTitle>
          <Button
            onClick={handleRegenerate}
            disabled={isGenerating || isLoading}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg border border-purple-400/30 transition-all hover:scale-105 active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${(isGenerating || isLoading) ? 'animate-spin' : ''}`} />
            <span className="font-bold">רענן תובנות</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {(isLoading || isGenerating) && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
            <span className="text-purple-300 mr-3">מייצר תובנות מתקדמות...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-3">שגיאה בטעינת התובנות</p>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              נסה שוב
            </Button>
          </div>
        )}

        <AnimatePresence>
          {insights && !isLoading && !isGenerating && !error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Status */}
              {insights.overall_status && (
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <h3 className="text-purple-200 text-sm font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    מצב כללי
                  </h3>
                  <p className="text-white leading-relaxed">{insights.overall_status}</p>
                </div>
              )}

              {/* Key Patterns */}
              {insights.key_patterns && insights.key_patterns.length > 0 && (
                <div>
                  <h3 className="text-purple-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    דפוסים מרכזיים
                  </h3>
                  <div className="space-y-2">
                    {insights.key_patterns.map((pattern, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-purple-800/30 rounded-lg p-3 border border-purple-600/30"
                      >
                        <p className="text-purple-100 text-sm">• {pattern}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Predictions */}
              {insights.predictions && insights.predictions.length > 0 && (
                <div>
                  <h3 className="text-purple-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    תחזיות AI
                  </h3>
                  <div className="space-y-3">
                    {insights.predictions.map((pred, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.15 }}
                        className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-lg p-4 border border-blue-600/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-200 font-semibold text-sm">{pred.area}</span>
                          {pred.confidence && (
                            <Badge className="bg-blue-600/50 text-blue-100 text-xs">
                              {pred.confidence}
                            </Badge>
                          )}
                        </div>
                        <p className="text-white text-sm">{pred.prediction}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {insights.recommendations && insights.recommendations.length > 0 && (
                <div>
                  <h3 className="text-purple-200 text-sm font-semibold mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    המלצות אסטרטגיות
                  </h3>
                  <div className="space-y-2">
                    {insights.recommendations.map((rec, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-green-900/30 rounded-lg p-3 border border-green-600/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <p className="text-green-100 text-sm flex-1">✓ {rec}</p>
                        
                        {/* Action Button based on recommendation content */}
                        <div className="shrink-0">
                          {rec.includes('יומן') || rec.includes('כתיבה') ? (
                            <Link to={createPageUrl("Journal")}>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs shadow-md transition-all hover:scale-105 font-bold">
                                <BookOpen className="w-3 h-3 ml-1" />
                                כתוב ביומן
                              </Button>
                            </Link>
                          ) : (rec.includes('מטרה') || rec.includes('יעד') || rec.includes('תכנון')) ? (
                            <Link to={createPageUrl("MyGoals")}>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs shadow-md transition-all hover:scale-105 font-bold">
                                <Target className="w-3 h-3 ml-1" />
                                הגדר יעד
                              </Button>
                            </Link>
                          ) : (rec.includes('שאלה') || rec.includes('התייעצות')) ? (
                            <Link to={createPageUrl("AICoach")}>
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs shadow-md transition-all hover:scale-105 font-bold">
                                <Sparkles className="w-3 h-3 ml-1" />
                                התייעץ
                              </Button>
                            </Link>
                          ) : null}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings */}
              {insights.warnings && insights.warnings.length > 0 && (
                <div>
                  <h3 className="text-purple-200 text-sm font-semibold mb-3">⚠️ נקודות לתשומת לב</h3>
                  <div className="space-y-2">
                    {insights.warnings.map((warn, idx) => (
                      <div key={idx} className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-600/30">
                        <p className="text-yellow-100 text-sm">{warn}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Opportunities */}
              {insights.opportunities && insights.opportunities.length > 0 && (
                <div>
                  <h3 className="text-purple-200 text-sm font-semibold mb-3">💡 הזדמנויות</h3>
                  <div className="space-y-2">
                    {insights.opportunities.map((opp, idx) => (
                      <div key={idx} className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-600/30">
                        <p className="text-cyan-100 text-sm">{opp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!insights && !isLoading && goals.length === 0 && (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">התחל להגדיר יעדים ולעקוב אחר מצב הרוח כדי לקבל תובנות מתקדמות</p>
          </div>
        )}
      </CardContent>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </Card>
  );
}