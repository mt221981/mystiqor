import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Sparkles, TrendingUp, Target } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePageView, useTimeTracking, trackToolUsage, trackAnalysisComplete } from "@/components/Analytics";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import { toast } from "sonner";

export default function CareerGuidance() {
  const [formData, setFormData] = useState({
    currentField: "",
    skills: "",
    interests: "",
    birthDate: ""
  });
  const [guidance, setGuidance] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { incrementUsage } = useSubscription();
  
  // Analytics
  usePageView('CareerGuidance');
  useTimeTracking('CareerGuidance');

  const analyzeMutation = useMutation({
    mutationFn: async (data) => {
      const startTime = Date.now();
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `בצע ניתוח קריירה מעמיק עבור אדם עם הפרטים הבאים:
        תחום נוכחי: ${data.currentField || 'לא צוין'}
        כישורים: ${data.skills}
        תחומי עניין: ${data.interests}
        ${data.birthDate ? `תאריך לידה: ${data.birthDate}` : ''}
        
        נתח והמלץ על:
        1. תחומי קריירה מתאימים (3-5 אפשרויות)
        2. כישורים שכדאי לפתח
        3. הזדמנויות צמיחה פוטנציאליות
        4. אתגרים אפשריים ואיך להתמודד איתם
        5. צעדים מעשיים לקידום הקריירה
        
        החזר JSON עם המבנה הבא:
        {
          "recommended_fields": [{"name": "שם תחום", "match_score": 0-100, "reason": "סיבה"}],
          "skills_to_develop": ["כישור 1", "כישור 2", ...],
          "growth_opportunities": ["הזדמנות 1", "הזדמנות 2", ...],
          "challenges": [{"challenge": "אתגר", "solution": "פתרון"}],
          "action_steps": ["צעד 1", "צעד 2", ...],
          "overall_assessment": "הערכה כוללת"
        }`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            recommended_fields: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  match_score: { type: "number" },
                  reason: { type: "string" }
                }
              }
            },
            skills_to_develop: { type: "array", items: { type: "string" } },
            growth_opportunities: { type: "array", items: { type: "string" } },
            challenges: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  challenge: { type: "string" },
                  solution: { type: "string" }
                }
              }
            },
            action_steps: { type: "array", items: { type: "string" } },
            overall_assessment: { type: "string" }
          }
        }
      });
      
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await trackAnalysisComplete('career', duration, 85);
      
      return result;
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.skills || !formData.interests) {
      toast.error('נא למלא כישורים ותחומי עניין');
      return;
    }

    setIsLoading(true);

    try {
      await trackToolUsage('career', true);
      
      const result = await analyzeMutation.mutateAsync(formData);
      
      setGuidance(result);

      await saveAnalysisMutation.mutateAsync({
        tool_type: "career",
        input_data: formData,
        results: result,
        summary: "הדרכה לקריירה",
        confidence_score: 85
      });

      await incrementUsage();

      toast.success('ההדרכה הושלמה בהצלחה! ✨');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 flex items-center justify-center">
        <LoadingSpinner message="מנתח את הקריירה שלך..." />
      </div>
    );
  }

  return (
    <SubscriptionGuard toolName="הדרכה לקריירה">
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-indigo-950 to-purple-950 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="הדרכה לקריירה"
            description="גלה את הדרך המקצועית שלך"
            icon={Briefcase}
            iconGradient="from-blue-500 to-indigo-500"
          />

          <AnimatePresence mode="wait">
            {!guidance ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-blue-800/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-white text-center">
                      ספר לי על עצמך
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="currentField" className="text-white text-lg">
                          תחום נוכחי (אופציונלי)
                        </Label>
                        <Input
                          id="currentField"
                          value={formData.currentField}
                          onChange={(e) => setFormData({ ...formData, currentField: e.target.value })}
                          placeholder="למשל: הייטק, חינוך, אמנות"
                          className="bg-gray-800/50 border-blue-700 text-white text-lg h-14"
                          dir="rtl"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="skills" className="text-white text-lg">
                          הכישורים שלך *
                        </Label>
                        <Input
                          id="skills"
                          value={formData.skills}
                          onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                          placeholder="למשל: תכנות, עיצוב, ניהול, תקשורת"
                          className="bg-gray-800/50 border-blue-700 text-white text-lg h-14"
                          dir="rtl"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="interests" className="text-white text-lg">
                          מה מעניין אותך *
                        </Label>
                        <Input
                          id="interests"
                          value={formData.interests}
                          onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                          placeholder="למשל: טכנולוגיה, עזרה לאנשים, יצירה"
                          className="bg-gray-800/50 border-blue-700 text-white text-lg h-14"
                          dir="rtl"
                          required
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="birthDate" className="text-white text-lg">
                          תאריך לידה (אופציונלי)
                        </Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className="bg-gray-800/50 border-blue-700 text-white text-lg h-14"
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xl h-16"
                      >
                        <Sparkles className="w-6 h-6 ml-2" />
                        קבל הדרכה
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
                {/* Overall Assessment */}
                {guidance.overall_assessment && (
                  <ResultCard title="📊 הערכה כוללת" gradient="from-blue-900/50 to-indigo-900/50">
                    <p className="text-white text-lg leading-relaxed">{guidance.overall_assessment}</p>
                  </ResultCard>
                )}

                {/* Recommended Fields */}
                {guidance.recommended_fields && guidance.recommended_fields.length > 0 && (
                  <ResultCard title="🎯 תחומים מומלצים" gradient="from-green-900/50 to-emerald-900/50">
                    <div className="space-y-4">
                      {guidance.recommended_fields.map((field, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 border border-green-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white text-xl font-bold">{field.name}</h3>
                            <Badge className="bg-green-600 text-white">
                              {field.match_score}% התאמה
                            </Badge>
                          </div>
                          <p className="text-green-100">{field.reason}</p>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Skills to Develop */}
                {guidance.skills_to_develop && guidance.skills_to_develop.length > 0 && (
                  <ResultCard title="📚 כישורים לפיתוח" gradient="from-purple-900/50 to-pink-900/50">
                    <div className="flex flex-wrap gap-3">
                      {guidance.skills_to_develop.map((skill, idx) => (
                        <Badge key={idx} className="bg-purple-700 text-white text-lg px-4 py-2">
                          <TrendingUp className="w-4 h-4 ml-2" />
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Growth Opportunities */}
                {guidance.growth_opportunities && guidance.growth_opportunities.length > 0 && (
                  <ResultCard title="🌟 הזדמנויות צמיחה" gradient="from-amber-900/50 to-orange-900/50">
                    <ul className="space-y-3">
                      {guidance.growth_opportunities.map((opportunity, idx) => (
                        <li key={idx} className="text-white text-lg flex items-start gap-3">
                          <span className="text-amber-400 font-bold">→</span>
                          {opportunity}
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                {/* Challenges */}
                {guidance.challenges && guidance.challenges.length > 0 && (
                  <ResultCard title="⚡ אתגרים ופתרונות" gradient="from-red-900/50 to-rose-900/50">
                    <div className="space-y-4">
                      {guidance.challenges.map((item, idx) => (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 border border-red-700/30">
                          <h4 className="text-red-200 font-bold mb-2">🚧 {item.challenge}</h4>
                          <p className="text-white">💡 {item.solution}</p>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Action Steps */}
                {guidance.action_steps && guidance.action_steps.length > 0 && (
                  <ResultCard title="✅ צעדים מעשיים" gradient="from-cyan-900/50 to-blue-900/50">
                    <ol className="space-y-3">
                      {guidance.action_steps.map((step, idx) => (
                        <li key={idx} className="text-white text-lg flex items-start gap-3">
                          <span className="text-cyan-400 font-bold">{idx + 1}.</span>
                          {step}
                        </li>
                      ))}
                    </ol>
                  </ResultCard>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setGuidance(null);
                      setFormData({ currentField: "", skills: "", interests: "", birthDate: "" });
                    }}
                    className="bg-gray-800 text-white border-2 border-blue-700 hover:bg-gray-700 text-lg px-8 py-6"
                  >
                    <Target className="w-5 h-5 ml-2" />
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