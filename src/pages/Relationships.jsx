import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePageView, useTimeTracking, trackToolUsage, trackAnalysisComplete } from "@/components/Analytics";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import { toast } from "sonner";

export default function Relationships() {
  const [formData, setFormData] = useState({
    yourName: "",
    yourBirthDate: "",
    partnerName: "",
    partnerBirthDate: "",
    relationshipType: "romantic"
  });
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { incrementUsage } = useSubscription();
  
  // Analytics
  usePageView('Relationships');
  useTimeTracking('Relationships');

  const analyzeMutation = useMutation({
    mutationFn: async (data) => {
      const startTime = Date.now();
      
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `בצע ניתוח מערכת יחסים מעמיק:
        
        אדם 1: ${data.yourName}, נולד ב-${data.yourBirthDate}
        אדם 2: ${data.partnerName}, נולד ב-${data.partnerBirthDate}
        סוג הקשר: ${data.relationshipType === 'romantic' ? 'רומנטי' : data.relationshipType === 'friendship' ? 'חברות' : 'משפחתי'}
        
        נתח:
        1. רמת התאמה כללית (0-100)
        2. תחומי חוזקה במערכת היחסים
        3. אתגרים פוטנציאליים
        4. איך כל אחד משלים את השני
        5. המלצות לחיזוק הקשר
        6. סגנונות תקשורת של שניהם
        
        החזר JSON עם המבנה הבא:
        {
          "compatibility_score": 0-100,
          "overall_summary": "סיכום כללי",
          "strengths": ["חוזקה 1", "חוזקה 2", ...],
          "challenges": ["אתגר 1", "אתגר 2", ...],
          "how_you_complement": "איך משלימים זה את זה",
          "communication_styles": {
            "person1": "סגנון תקשורת",
            "person2": "סגנון תקשורת"
          },
          "recommendations": ["המלצה 1", "המלצה 2", ...]
        }`,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            compatibility_score: { type: "number" },
            overall_summary: { type: "string" },
            strengths: { type: "array", items: { type: "string" } },
            challenges: { type: "array", items: { type: "string" } },
            how_you_complement: { type: "string" },
            communication_styles: {
              type: "object",
              properties: {
                person1: { type: "string" },
                person2: { type: "string" }
              }
            },
            recommendations: { type: "array", items: { type: "string" } }
          }
        }
      });
      
      const duration = Math.floor((Date.now() - startTime) / 1000);
      await trackAnalysisComplete('relationships', duration, result.compatibility_score || 85);
      
      return result;
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data)
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.yourName || !formData.yourBirthDate || !formData.partnerName || !formData.partnerBirthDate) {
      toast.error('נא למלא את כל השדות');
      return;
    }

    setIsLoading(true);

    try {
      await trackToolUsage('relationships', true);
      
      const result = await analyzeMutation.mutateAsync(formData);
      
      setAnalysis(result);

      await saveAnalysisMutation.mutateAsync({
        tool_type: "relationships",
        input_data: formData,
        results: result,
        summary: `ניתוח קשר בין ${formData.yourName} ל-${formData.partnerName}`,
        confidence_score: result.compatibility_score || 85
      });

      await incrementUsage();

      toast.success('הניתוח הושלם בהצלחה! ❤️');
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
      <div className="min-h-screen bg-gradient-to-br from-pink-950 via-rose-950 to-red-950 flex items-center justify-center">
        <LoadingSpinner message="מנתח את הקשר שלכם..." />
      </div>
    );
  }

  return (
    <SubscriptionGuard toolName="ניתוח מערכות יחסים">
      <div className="min-h-screen bg-gradient-to-br from-pink-950 via-rose-950 to-red-950 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="יחסים ואהבה"
            description="גלו את הקסם שביניכם"
            icon={Heart}
            iconGradient="from-pink-500 to-rose-500"
          />

          <AnimatePresence mode="wait">
            {!analysis ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-pink-800/50 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-white text-center">
                      ספרו לי עליכם
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="yourName" className="text-white text-lg">
                            השם שלך *
                          </Label>
                          <Input
                            id="yourName"
                            value={formData.yourName}
                            onChange={(e) => setFormData({ ...formData, yourName: e.target.value })}
                            placeholder="השם שלך"
                            className="bg-gray-800/50 border-pink-700 text-white text-lg h-14"
                            dir="rtl"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="yourBirthDate" className="text-white text-lg">
                            תאריך הלידה שלך *
                          </Label>
                          <Input
                            id="yourBirthDate"
                            type="date"
                            value={formData.yourBirthDate}
                            onChange={(e) => setFormData({ ...formData, yourBirthDate: e.target.value })}
                            className="bg-gray-800/50 border-pink-700 text-white text-lg h-14"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="partnerName" className="text-white text-lg">
                            שם השני *
                          </Label>
                          <Input
                            id="partnerName"
                            value={formData.partnerName}
                            onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                            placeholder="שם השותף/ה"
                            className="bg-gray-800/50 border-pink-700 text-white text-lg h-14"
                            dir="rtl"
                            required
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="partnerBirthDate" className="text-white text-lg">
                            תאריך הלידה שלו/ה *
                          </Label>
                          <Input
                            id="partnerBirthDate"
                            type="date"
                            value={formData.partnerBirthDate}
                            onChange={(e) => setFormData({ ...formData, partnerBirthDate: e.target.value })}
                            className="bg-gray-800/50 border-pink-700 text-white text-lg h-14"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label className="text-white text-lg">סוג הקשר</Label>
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={() => setFormData({ ...formData, relationshipType: 'romantic' })}
                            className={`flex-1 h-14 ${formData.relationshipType === 'romantic' ? 'bg-pink-600' : 'bg-gray-800'}`}
                          >
                            ❤️ רומנטי
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setFormData({ ...formData, relationshipType: 'friendship' })}
                            className={`flex-1 h-14 ${formData.relationshipType === 'friendship' ? 'bg-pink-600' : 'bg-gray-800'}`}
                          >
                            🤝 חברות
                          </Button>
                          <Button
                            type="button"
                            onClick={() => setFormData({ ...formData, relationshipType: 'family' })}
                            className={`flex-1 h-14 ${formData.relationshipType === 'family' ? 'bg-pink-600' : 'bg-gray-800'}`}
                          >
                            👨‍👩‍👧 משפחה
                          </Button>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white text-xl h-16"
                      >
                        <Sparkles className="w-6 h-6 ml-2" />
                        נתח את הקשר
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
                {/* Compatibility Score */}
                <Card className="bg-gradient-to-r from-pink-900/50 to-rose-900/50 backdrop-blur-xl border-2 border-pink-700">
                  <CardContent className="p-8 text-center">
                    <div className="text-8xl font-bold text-white mb-4">
                      {analysis.compatibility_score}%
                    </div>
                    <h2 className="text-3xl font-bold text-pink-200 mb-4">רמת ההתאמה</h2>
                    {analysis.overall_summary && (
                      <p className="text-white text-lg leading-relaxed max-w-2xl mx-auto">
                        {analysis.overall_summary}
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Strengths */}
                {analysis.strengths && analysis.strengths.length > 0 && (
                  <ResultCard title="💪 החוזקות שלכם ביחד" gradient="from-green-900/50 to-emerald-900/50">
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

                {/* How You Complement */}
                {analysis.how_you_complement && (
                  <ResultCard title="🧩 איך אתם משלימים זה את זה" gradient="from-purple-900/50 to-pink-900/50">
                    <p className="text-white text-lg leading-relaxed">{analysis.how_you_complement}</p>
                  </ResultCard>
                )}

                {/* Communication Styles */}
                {analysis.communication_styles && (
                  <ResultCard title="💬 סגנונות התקשורת שלכם" gradient="from-blue-900/50 to-cyan-900/50">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-lg p-4 border border-blue-700/30">
                        <h3 className="text-blue-200 font-bold mb-2">{formData.yourName}</h3>
                        <p className="text-white">{analysis.communication_styles.person1}</p>
                      </div>
                      <div className="bg-white/5 rounded-lg p-4 border border-cyan-700/30">
                        <h3 className="text-cyan-200 font-bold mb-2">{formData.partnerName}</h3>
                        <p className="text-white">{analysis.communication_styles.person2}</p>
                      </div>
                    </div>
                  </ResultCard>
                )}

                {/* Challenges */}
                {analysis.challenges && analysis.challenges.length > 0 && (
                  <ResultCard title="⚡ נקודות לשיפור" gradient="from-amber-900/50 to-orange-900/50">
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

                {/* Recommendations */}
                {analysis.recommendations && analysis.recommendations.length > 0 && (
                  <ResultCard title="💡 המלצות לחיזוק הקשר" gradient="from-rose-900/50 to-red-900/50">
                    <ol className="space-y-3">
                      {analysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="text-white text-lg flex items-start gap-3">
                          <span className="text-rose-400 font-bold">{idx + 1}.</span>
                          {rec}
                        </li>
                      ))}
                    </ol>
                  </ResultCard>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setAnalysis(null);
                      setFormData({
                        yourName: "",
                        yourBirthDate: "",
                        partnerName: "",
                        partnerBirthDate: "",
                        relationshipType: "romantic"
                      });
                    }}
                    className="bg-gray-800 text-white border-2 border-pink-700 hover:bg-gray-700 text-lg px-8 py-6"
                  >
                    <Users className="w-5 h-5 ml-2" />
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