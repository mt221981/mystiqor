
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Sparkles, Heart, Brain } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePageView, useTimeTracking, trackToolUsage, trackAnalysisComplete } from "@/components/Analytics";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import { toast } from "sonner";

export default function PersonalityAnalysis() {
  const [formData, setFormData] = useState({
    birthDate: "",
    birthTime: "",
    birthPlace: ""
  });
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { incrementUsage } = useSubscription();
  
  // Analytics
  usePageView('PersonalityAnalysis');
  useTimeTracking('PersonalityAnalysis');

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  const analyzeMutation = useMutation({
    mutationFn: async (data) => {
      const startTime = Date.now();
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `בצע ניתוח אישיות מקיף עבור אדם שנולד ב-${data.birthDate}${data.birthTime ? ` בשעה ${data.birthTime}` : ''}${data.birthPlace ? ` ב-${data.birthPlace}` : ''}.
        
        נתח את האישיות שלו מבחינת:
        1. תכונות אופי מרכזיות
        2. חוזקות וכישרונות
        3. אתגרים פוטנציאליים
        4. סגנון תקשורת
        5. דרך קבלת החלטות
        6. מוטיבציה מרכזית
        7. איך אחרים תופסים אותו
        
        החזר JSON עם המבנה הבא:
        {
          "core_traits": ["תכונה 1", "תכונה 2", ...],
          "strengths": ["כוח 1", "כוח 2", ...],
          "challenges": ["אתגר 1", "אתגר 2", ...],
          "communication_style": "תיאור",
          "decision_making": "תיאור",
          "core_motivation": "תיאור",
          "how_others_see_you": "תיאור",
          "personal_growth_advice": ["עצה 1", "עצה 2", ...]
        }`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            core_traits: { type: "array", items: { type: "string" } },
            strengths: { type: "array", items: { type: "string" } },
            challenges: { type: "array", items: { type: "string" } },
            communication_style: { type: "string" },
            decision_making: { type: "string" },
            core_motivation: { type: "string" },
            how_others_see_you: { type: "string" },
            personal_growth_advice: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await trackAnalysisComplete('personality', duration, 85);
      
      return result;
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.birthDate) {
      toast.error('נא להזין תאריך לידה');
      return;
    }

    setIsLoading(true);

    try {
      await trackToolUsage('personality', true);
      
      const result = await analyzeMutation.mutateAsync(formData);
      
      setAnalysis(result);

      await saveAnalysisMutation.mutateAsync({
        tool_type: "personality",
        input_data: formData,
        results: result,
        summary: "ניתוח אישיות מקיף",
        confidence_score: 85
      });

      await incrementUsage();

      toast.success('הניתוח הושלם בהצלחה! ✨');
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      toast.error('אירעה שגיאה בניתוח');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 flex items-center justify-center">
        <LoadingSpinner message="מנתח את האישיות שלך..." />
      </div>
    );
  }

  return (
    <SubscriptionGuard toolName="ניתוח אישיות">
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="ניתוח אישיות"
            description="גלה מי אתה באמת"
            icon={Brain}
            iconGradient="from-indigo-500 to-purple-500"
          />

          <AnimatePresence mode="wait">
            {!analysis ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border-2 border-indigo-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-white text-center flex items-center justify-center gap-3">
                      <User className="w-8 h-8 text-indigo-400" />
                      ספר לי עליך
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="birthDate" className="text-white text-lg font-semibold">
                          תאריך לידה *
                        </Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className="bg-gray-700/50 border-indigo-500/50 text-white text-lg h-14 focus:border-indigo-400 focus:ring-indigo-400"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="birthTime" className="text-white text-lg font-semibold">
                          שעת לידה (אופציונלי)
                        </Label>
                        <Input
                          id="birthTime"
                          type="time"
                          value={formData.birthTime}
                          onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                          className="bg-gray-700/50 border-indigo-500/50 text-white text-lg h-14 focus:border-indigo-400 focus:ring-indigo-400"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="birthPlace" className="text-white text-lg font-semibold">
                          מקום לידה (אופציונלי)
                        </Label>
                        <Input
                          id="birthPlace"
                          value={formData.birthPlace}
                          onChange={(e) => setFormData({ ...formData, birthPlace: e.target.value })}
                          placeholder="למשל: תל אביב"
                          className="bg-gray-700/50 border-indigo-500/50 text-white placeholder-gray-300 text-lg h-14 focus:border-indigo-400 focus:ring-indigo-400"
                          dir="rtl"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xl h-16"
                      >
                        <Sparkles className="w-6 h-6 ml-2" />
                        נתח את האישיות שלי
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Core Traits */}
                {analysis.core_traits && (
                  <ResultCard title="תכונות ליבה" gradient="from-indigo-900/50 to-purple-900/50">
                    <div className="flex flex-wrap gap-3">
                      {analysis.core_traits.map((trait, idx) => (
                        <Badge key={idx} className="bg-indigo-700 text-white text-lg px-4 py-2">
                          {trait}
                        </Badge>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Strengths */}
                {analysis.strengths && (
                  <ResultCard title="💪 החוזקות שלך" gradient="from-green-900/50 to-emerald-900/50">
                    <ul className="space-y-3">
                      {analysis.strengths.map((strength, idx) => (
                        <li key={idx} className="text-white text-lg flex items-start gap-3">
                          <span className="text-green-400 font-bold">✓</span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                {/* Challenges */}
                {analysis.challenges && (
                  <ResultCard title="⚡ אתגרים לצמיחה" gradient="from-amber-900/50 to-orange-900/50">
                    <ul className="space-y-3">
                      {analysis.challenges.map((challenge, idx) => (
                        <li key={idx} className="text-white text-lg flex items-start gap-3">
                          <span className="text-amber-400 font-bold">→</span>
                          {challenge}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                {/* Communication Style */}
                {analysis.communication_style && (
                  <ResultCard title="💬 סגנון התקשורת שלך" gradient="from-blue-900/50 to-cyan-900/50">
                    <p className="text-white text-lg leading-relaxed">{analysis.communication_style}</p>
                  </ResultCard>
                )}

                {/* Decision Making */}
                {analysis.decision_making && (
                  <ResultCard title="🎯 איך אתה מקבל החלטות" gradient="from-purple-900/50 to-pink-900/50">
                    <p className="text-white text-lg leading-relaxed">{analysis.decision_making}</p>
                  </ResultCard>
                )}

                {/* Core Motivation */}
                {analysis.core_motivation && (
                  <ResultCard title="🔥 מה מניע אותך" gradient="from-rose-900/50 to-red-900/50">
                    <p className="text-white text-lg leading-relaxed">{analysis.core_motivation}</p>
                  </ResultCard>
                )}

                {/* How Others See You */}
                {analysis.how_others_see_you && (
                  <ResultCard title="👁️ איך אחרים רואים אותך" gradient="from-violet-900/50 to-fuchsia-900/50">
                    <p className="text-white text-lg leading-relaxed">{analysis.how_others_see_you}</p>
                  </ResultCard>
                )}

                {/* Personal Growth Advice */}
                {analysis.personal_growth_advice && (
                  <ResultCard title="🌱 המלצות לצמיחה אישית" gradient="from-teal-900/50 to-cyan-900/50">
                    <ul className="space-y-3">
                      {analysis.personal_growth_advice.map((advice, idx) => (
                        <li key={idx} className="text-white text-lg flex items-start gap-3">
                          <span className="text-teal-400 font-bold">{idx + 1}.</span>
                          {advice}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setAnalysis(null);
                      setFormData({ birthDate: "", birthTime: "", birthPlace: "" });
                    }}
                    className="bg-gray-800 text-white border-2 border-indigo-700 hover:bg-gray-700 text-lg px-8 py-6"
                  >
                    <Heart className="w-5 h-5 ml-2" />
                    ניתוח חדש
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
