
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HelpCircle, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "@/components/EnhancedToast";
import PageHeader from "@/components/PageHeader";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import { MysticalLoader } from "@/components/LoadingStates";
import ExplainableInsight from "@/components/ExplainableInsight";
import ConfidenceBadge from "@/components/ConfidenceBadge";

// 🔥 FORCE TO STRING - handles any nested structure
const forceToString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'כן' : 'לא';
  
  if (Array.isArray(value)) {
    for (const item of value) {
      const str = forceToString(item, '');
      if (str) return str;
    }
    return fallback;
  }
  
  if (typeof value === 'object') {
    const keys = ['text', 'value', 'content', 'message', 'data', 'description', 'answer'];
    for (const key of keys) {
      if (value[key] !== undefined) {
        const str = forceToString(value[key], '');
        if (str) return str;
      }
    }
    
    const objKeys = Object.keys(value);
    if (objKeys.length > 0) {
      return forceToString(value[objKeys[0]], fallback);
    }
  }
  
  return fallback;
};

// Clean array to strings
const cleanArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr.map(item => forceToString(item, '')).filter(Boolean);
};

export default function AskQuestion() {
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("general"); // category state is still used in LLM prompt
  const [answer, setAnswer] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { incrementUsage, subscription } = useSubscription();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: userAnalyses } = useQuery({
    queryKey: ['userAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50),
    staleTime: 300000
  });

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user
  });

  const getAnswerMutation = useMutation({
    mutationFn: async ({ question, category }) => {
      // Prepare context from user's previous analyses
      let userContext = "";
      
      if (userAnalyses && userAnalyses.length > 0) {
        const numerologyAnalyses = userAnalyses.filter(a => a.tool_type === 'numerology').slice(0, 1);
        const astrologyAnalyses = userAnalyses.filter(a => a.tool_type === 'astrology').slice(0, 1);
        const palmistryAnalyses = userAnalyses.filter(a => a.tool_type === 'palmistry').slice(0, 1);
        
        if (numerologyAnalyses.length > 0) {
          const num = numerologyAnalyses[0].results;
          userContext += `\n\n**נומרולוגיה של המשתמש:**\n`;
          if (num.calculation?.life_path) userContext += `- מספר מסלול חיים: ${num.calculation.life_path.number}\n`;
          if (num.calculation?.destiny) userContext += `- מספר גורל: ${num.calculation.destiny.number}\n`;
          if (num.calculation?.soul) userContext += `- מספר נשמה: ${num.calculation.soul.number}\n`;
        }
        
        if (astrologyAnalyses.length > 0) {
          const astro = astrologyAnalyses[0].results;
          userContext += `\n**אסטרולוגיה של המשתמש:**\n`;
          if (astro.sun_sign) userContext += `- מזל שמש: ${astro.sun_sign}\n`;
          if (astro.moon_sign) userContext += `- מזל ירח: ${astro.moon_sign}\n`;
          if (astro.ascendant?.sign) userContext += `- אסצנדנט: ${astro.ascendant.sign}\n`;
        }
      }
      
      if (userProfile) {
        userContext += `\n**פרטי משתמש:**\n`;
        if (userProfile.birth_date) userContext += `- תאריך לידה: ${userProfile.birth_date}\n`;
      }

      const categoryPrompts = {
        general: "מענה כללי מיסטי מעמיק",
        career: "ייעוץ קריירה והכוונה מקצועית מבוססת ניתוחים",
        love: "תובנות על אהבה ויחסים בהתבסס על פרופיל אישי",
        timing: "תזמון והזדמנויות - האם זה הזמן הנכון?",
        spiritual: "צמיחה רוחנית והתפתחות אישית",
        decision: "עזרה בקבלת החלטה חשובה",
        purpose: "מציאת תכלית ומשמעות בחיים"
      };

      const prompt = `אתה יועץ מיסטי מומחה ברמה עולמית, משלב ידע בנומרולוגיה, אסטרולוגיה, טארוט, פסיכולוגיה יונגיאנית וקבלה.

**⚠️ CRITICAL: Return ONLY plain text strings in ALL fields. NO nested objects, NO {text: "..."} structures.**
**Each field must be a simple string or an array of simple strings.**

**גישה מקצועית:**
- התבסס על מחקרים וידע מבוסס
- שלב תובנות מהניתוחים הקודמים של המשתמש
- תן תשובה מעמיקה, פרקטית ומעצימה
- הימנע מכליות וממענה כללי
- התמקד בפעולות קונקרטיות

${userContext ? `\n**הקשר אישי של המשתמש:**${userContext}` : ''}

**קטגוריה:** ${categoryPrompts[category]}
**שאלה:** "${question}"

**הוראות:**
1. **תשובה ישירה** (פסקה ראשונה) - מענה ישיר לשאלה
2. **תובנות מיסטיות** (פסקה שנייה) - חבר לניתוחים הקיימים אם יש
3. **המלצות מעשיות** (3-5 פעולות קונקרטיות)
4. **זמנים והזדמנויות** - מתי לפעול? (אם רלוונטי)
5. **שיקולים חשובים** - על מה להיזהר

**חשוב:**
- אם יש נתונים אישיים - השתמש בהם!
- אם אין - תן מענה כללי איכותי
- תמיד תן המלצות מעשיות
- היה ספציפי, לא כללי

**צור גם 3-5 תובנות מעמיקות (insights):**
כל תובנה תכלול:
- title (string)
- content (string, 150-200 מילים)
- insight_type: advice/timing/warning/opportunity/spiritual/practical
- confidence (number 0-1)
- weight (number 0-1)
- provenance מלא
- tags (array of strings)

**החזר JSON מובנה.**`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            question: { type: "string" },
            category: { type: "string" },
            direct_answer: { type: "string", minLength: 50 },
            mystical_insights: { type: "string", minLength: 50 },
            practical_recommendations: {
              type: "array",
              items: { type: "string" },
              minItems: 3
            },
            timing_guidance: { type: "string" },
            important_notes: {
              type: "array",
              items: { type: "string" }
            },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string", minLength: 150 },
                  insight_type: { type: "string" },
                  confidence: { type: "number" },
                  weight: { type: "number" },
                  provenance: {
                    type: "object",
                    properties: {
                      source_features: { type: "array", items: { type: "string" } },
                      rule_description: { type: "string" },
                      sources: { type: "array", items: { type: "string" } }
                    }
                  },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            },
            overall_message: { type: "string" },
            confidence_level: { type: "number" }
          },
          required: ["direct_answer", "mystical_insights", "practical_recommendations"]
        }
      });

      // 🔥 CLEAN ALL FIELDS
      const cleaned = {
        question: forceToString(result.question || question),
        category: forceToString(result.category || category),
        direct_answer: forceToString(result.direct_answer, 'תשובה לא זמינה'),
        mystical_insights: forceToString(result.mystical_insights, ''),
        practical_recommendations: cleanArray(result.practical_recommendations),
        timing_guidance: forceToString(result.timing_guidance, ''),
        important_notes: cleanArray(result.important_notes),
        insights: Array.isArray(result.insights) 
          ? result.insights.map(insight => ({
              title: forceToString(insight.title, 'תובנה'),
              content: forceToString(insight.content, ''),
              insight_type: forceToString(insight.insight_type, 'advice'),
              confidence: typeof insight.confidence === 'number' ? insight.confidence : 0.85,
              weight: typeof insight.weight === 'number' ? insight.weight : 0.7,
              provenance: insight.provenance ? {
                source_features: cleanArray(insight.provenance.source_features),
                rule_description: forceToString(insight.provenance.rule_description, ''),
                sources: cleanArray(insight.provenance.sources)
              } : { source_features: [], rule_description: '', sources: [] },
              tags: cleanArray(insight.tags)
            }))
          : [],
        overall_message: forceToString(result.overall_message, ''),
        confidence_level: typeof result.confidence_level === 'number' ? result.confidence_level : 0.85
      };

      console.log('✅ Cleaned answer:', cleaned);

      return cleaned;
    }
  });

  const saveQuestionMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      EnhancedToast.error('נא להזין שאלה');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await getAnswerMutation.mutateAsync({ question, category });
      
      setAnswer(result);

      await saveQuestionMutation.mutateAsync({
        tool_type: "question",
        input_data: { question, category },
        results: result,
        summary: `שאלה: ${question.substring(0, 50)}...`,
        confidence_score: Math.round((result.confidence_level || 0.85) * 100)
      });

      await incrementUsage();

      EnhancedToast.success('התשובה הושלמה! ✨');
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      EnhancedToast.error('אירעה שגיאה');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing && !answer) { // Added !answer condition so loader only shows on initial load, not when switching to answer view
    return <MysticalLoader message="מחפש תשובות בחכמה העתיקה..." />;
  }

  const isPremium = subscription && ['premium', 'enterprise'].includes(subscription.plan_type);

  return (
    <SubscriptionGuard toolName="שאל שאלה">
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-pink-950 to-purple-900 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="שאל שאלה 💬"
            description="שאל כל שאלה והקבל תשובה מעמיקה"
            icon={HelpCircle}
            iconGradient="from-purple-600 to-pink-600"
          />

          <AnimatePresence mode="wait">
            {!answer ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-white text-center">
                      מה השאלה שלך?
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Category selection removed as per instructions */}
                      {/* <div className="space-y-3">
                        <Label htmlFor="category" className="text-white text-lg">
                          בחר נושא:
                        </Label>
                        <Select value={category} onValueChange={setCategory}>
                          <SelectTrigger className="bg-gray-800 border-indigo-700 text-white text-lg h-14">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">כללי</SelectItem>
                            <SelectItem value="career">קריירה ועבודה</SelectItem>
                            <SelectItem value="love">אהבה ויחסים</SelectItem>
                            <SelectItem value="timing">תזמון והזדמנויות</SelectItem>
                            <SelectItem value="spiritual">רוחניות וצמיחה אישית</SelectItem>
                            <SelectItem value="decision">קבלת החלטה</SelectItem>
                            <SelectItem value="purpose">תכלית ומשמעות</SelectItem>
                          </SelectContent>
                        </Select>
                      </div> */}

                      <div className="space-y-3">
                        <Label htmlFor="question" className="text-white text-lg font-semibold">
                          השאלה שלך *
                        </Label>
                        <Textarea
                          id="question"
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="למשל: מה הכיוון הנכון בשבילי בקריירה?"
                          className="bg-gray-700/50 border-purple-500/50 text-white placeholder-gray-300 text-lg min-h-[120px] focus:border-purple-400 focus:ring-purple-400"
                          dir="rtl"
                          required
                        />
                        <p className="text-purple-300 text-sm">
                          ככל שהשאלה מפורטת יותר, כך התשובה תהיה מדויקת יותר
                        </p>
                      </div>

                      {/* Info about previous analyses removed */}
                      {/* {userAnalyses && userAnalyses.length > 0 && (
                        <div className="bg-indigo-900/30 rounded-xl p-4 border border-indigo-700/50">
                          <p className="text-indigo-200 text-sm">
                            💡 התשובה תתבסס על {userAnalyses.length} ניתוחים קודמים שלך
                          </p>
                        </div>
                      )} */}

                      <Button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-xl h-16 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin ml-2" />
                            מחפש תשובה...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-6 h-6 ml-2" />
                            קבל תשובה
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="answer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-indigo-700/30">
                  <CardContent className="p-8">
                    <h2 className="text-2xl font-bold text-white mb-4">🔮 התשובה שלך</h2>
                    
                    {answer.confidence_level && (
                      <div className="mb-6">
                        <ConfidenceBadge
                          score={answer.confidence_level}
                          size="large"
                        />
                      </div>
                    )}

                    <div className="bg-indigo-800/30 rounded-xl p-6 mb-6">
                      <p className="text-indigo-200">
                        <span className="font-bold text-white">שאלה:</span> {question}
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="bg-white/10 rounded-xl p-6">
                        <h3 className="text-xl font-bold text-white mb-3">💫 תשובה:</h3>
                        <p className="text-white text-lg leading-relaxed">{answer.direct_answer}</p>
                      </div>

                      {answer.mystical_insights && (
                        <div className="bg-purple-800/30 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-purple-200 mb-3">✨ תובנות מיסטיות:</h3>
                          <p className="text-white leading-relaxed">{answer.mystical_insights}</p>
                        </div>
                      )}

                      {answer.practical_recommendations && answer.practical_recommendations.length > 0 && (
                        <div className="bg-blue-900/30 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-blue-200 mb-4">🎯 המלצות מעשיות:</h3>
                          <ul className="space-y-3">
                            {answer.practical_recommendations.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-3">
                                <span className="text-blue-400 font-bold">{idx + 1}.</span>
                                <span className="text-white">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {answer.timing_guidance && (
                        <div className="bg-amber-900/30 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-amber-200 mb-3">⏰ הכוונת תזמון:</h3>
                          <p className="text-white leading-relaxed">{answer.timing_guidance}</p>
                        </div>
                      )}

                      {answer.important_notes && answer.important_notes.length > 0 && (
                        <div className="bg-orange-900/30 rounded-xl p-6">
                          <h3 className="text-xl font-bold text-orange-200 mb-4">⚠️ נקודות חשובות:</h3>
                          <ul className="space-y-2">
                            {answer.important_notes.map((note, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-orange-400">•</span>
                                <span className="text-white">{note}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Deep Insights */}
                {answer.insights && answer.insights.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">💎 תובנות נוספות</h2>
                    {answer.insights.map((insight, idx) => (
                      <ExplainableInsight key={idx} insight={insight} showProvenance={isPremium} />
                    ))}
                  </div>
                )}

                {answer.overall_message && (
                  <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700/30">
                    <CardContent className="p-8 text-center">
                      <h3 className="text-2xl font-bold text-white mb-4">💫 המסר המרכזי</h3>
                      <p className="text-white text-xl leading-relaxed">{answer.overall_message}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setAnswer(null);
                      setQuestion("");
                    }}
                    variant="outline"
                    className="border-indigo-500 text-indigo-300 hover:bg-indigo-800/30"
                  >
                    שאל שאלה נוספת
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SubscriptionGuard>
  );
}
