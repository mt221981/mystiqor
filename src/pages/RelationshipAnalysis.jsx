import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Sparkles, Loader2, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ImprovedToast from "@/components/ImprovedToast";
import { usePageView } from "@/components/Analytics";

export default function RelationshipAnalysis() {
  usePageView('RelationshipAnalysis');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [formData, setFormData] = useState({
    person1_name: "",
    person2_name: "",
    relationship_type: "romantic",
    person1_birth_date: "",
    person2_birth_date: "",
    relationship_context: ""
  });

  const queryClient = useQueryClient();

  const analyzeMutation = useMutation({
    mutationFn: async (data) => {
      setIsAnalyzing(true);
      
      // Get user's profile for person1 data
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter(
        { created_by: user.email },
        '-created_date',
        1
      );
      const myProfile = profiles[0];

      // Build comprehensive analysis prompt
      const prompt = `אתה יועץ זוגי ומומחה לניתוח יחסים מבוסס אסטרולוגיה ופסיכולוגיה.

**ניתוח יחסים:**
- ${data.person1_name} (נולד/ה: ${data.person1_birth_date})
- ${data.person2_name} (נולד/ה: ${data.person2_birth_date})
- סוג יחסים: ${data.relationship_type}
${data.relationship_context ? `- הקשר: ${data.relationship_context}` : ''}

**המשימה:** נתח את הדינמיקה ביחסים, נקודות חוזק, אתגרים, והמלצות מעשיות.

**החזר JSON מפורט:**`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            compatibility_score: { type: "number", minimum: 0, maximum: 100 },
            summary: { type: "string", minLength: 200, maxLength: 600 },
            strengths: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 5
            },
            challenges: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 5
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
              minItems: 3,
              maxItems: 6
            },
            communication_style: { type: "string" },
            emotional_dynamics: { type: "string" },
            growth_opportunities: {
              type: "array",
              items: { type: "string" },
              minItems: 2,
              maxItems: 4
            }
          },
          required: ["compatibility_score", "summary", "strengths", "challenges", "recommendations"]
        }
      });

      // Save analysis
      const savedAnalysis = await base44.entities.CompatibilityAnalysis.create({
        person1_name: data.person1_name,
        person2_name: data.person2_name,
        person1_profile_id: myProfile?.id,
        person1_data: {
          birth_date: data.person1_birth_date
        },
        person2_data: {
          birth_date: data.person2_birth_date
        },
        compatibility_type: data.relationship_type,
        overall_score: response.compatibility_score,
        strengths: response.strengths,
        challenges: response.challenges,
        recommendations: response.recommendations,
        detailed_analysis: response.summary,
        confidence_score: 0.9,
        metadata: {
          communication_style: response.communication_style,
          emotional_dynamics: response.emotional_dynamics,
          growth_opportunities: response.growth_opportunities,
          context: data.relationship_context
        }
      });

      return { ...response, savedAnalysis };
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setIsAnalyzing(false);
      queryClient.invalidateQueries(['compatibility_analyses']);
      ImprovedToast.magic('ניתוח היחסים הושלם!', 'התוצאות מוכנות לצפייה 💕');
    },
    onError: (error) => {
      setIsAnalyzing(false);
      ImprovedToast.error('שגיאה בניתוח', error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.person1_name || !formData.person2_name || !formData.person1_birth_date || !formData.person2_birth_date) {
      ImprovedToast.warning('שדות חסרים', 'נא למלא את כל השדות הנדרשים');
      return;
    }

    analyzeMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-pink-950/30 to-black p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="ניתוח יחסים 💕"
          description="גלה את הדינמיקה בין שני אנשים - נקודות חוזק, אתגרים, והמלצות לחיזוק היחסים"
          icon={Heart}
          iconGradient="from-pink-600 to-rose-600"
        />

        {!analysisResult ? (
          <Card className="bg-gray-900/80 backdrop-blur-xl border-pink-700/50">
            <CardHeader>
              <CardTitle className="text-white text-2xl">פרטי היחסים</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white text-lg mb-2 block">שם אדם ראשון *</Label>
                    <Input
                      value={formData.person1_name}
                      onChange={(e) => setFormData({ ...formData, person1_name: e.target.value })}
                      placeholder="השם שלך"
                      className="bg-gray-800 text-white border-pink-700 h-12"
                      dir="rtl"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white text-lg mb-2 block">תאריך לידה *</Label>
                    <Input
                      type="date"
                      value={formData.person1_birth_date}
                      onChange={(e) => setFormData({ ...formData, person1_birth_date: e.target.value })}
                      className="bg-gray-800 text-white border-pink-700 h-12"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-white text-lg mb-2 block">שם אדם שני *</Label>
                    <Input
                      value={formData.person2_name}
                      onChange={(e) => setFormData({ ...formData, person2_name: e.target.value })}
                      placeholder="שם השותף/ה"
                      className="bg-gray-800 text-white border-pink-700 h-12"
                      dir="rtl"
                      required
                    />
                  </div>

                  <div>
                    <Label className="text-white text-lg mb-2 block">תאריך לידה *</Label>
                    <Input
                      type="date"
                      value={formData.person2_birth_date}
                      onChange={(e) => setFormData({ ...formData, person2_birth_date: e.target.value })}
                      className="bg-gray-800 text-white border-pink-700 h-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-white text-lg mb-2 block">סוג היחסים</Label>
                  <Select value={formData.relationship_type} onValueChange={(value) => setFormData({ ...formData, relationship_type: value })}>
                    <SelectTrigger className="bg-gray-800 text-white border-pink-700 h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="romantic">זוגיות רומנטית 💑</SelectItem>
                      <SelectItem value="friendship">חברות 🤝</SelectItem>
                      <SelectItem value="business">עסקי 💼</SelectItem>
                      <SelectItem value="family">משפחה 👨‍👩‍👧‍👦</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-white text-lg mb-2 block">הקשר נוסף (אופציונלי)</Label>
                  <Textarea
                    value={formData.relationship_context}
                    onChange={(e) => setFormData({ ...formData, relationship_context: e.target.value })}
                    placeholder="ספר/י קצת על היחסים - כמה זמן אתם מכירים, מה החוזקות והאתגרים..."
                    className="bg-gray-800 text-white border-pink-700"
                    dir="rtl"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isAnalyzing}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 h-14"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                      מנתח יחסים...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 ml-2" />
                      נתח יחסים
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Compatibility Score */}
            <Card className="bg-gradient-to-r from-pink-900/50 to-rose-900/50 border-pink-700">
              <CardContent className="p-8 text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <h2 className="text-3xl font-bold text-white">{formData.person1_name}</h2>
                  <Heart className="w-8 h-8 text-pink-400" />
                  <h2 className="text-3xl font-bold text-white">{formData.person2_name}</h2>
                </div>
                <div className="text-7xl font-black text-white mb-2">
                  {analysisResult.compatibility_score}%
                </div>
                <Badge className="bg-pink-600 text-lg px-4 py-2">
                  {analysisResult.compatibility_score >= 80 ? 'התאמה מצוינת!' : 
                   analysisResult.compatibility_score >= 60 ? 'התאמה טובה' :
                   analysisResult.compatibility_score >= 40 ? 'התאמה בינונית' :
                   'יש מה לעבוד עליו'}
                </Badge>
              </CardContent>
            </Card>

            {/* Summary */}
            <Card className="bg-gray-900/80 border-purple-700/50">
              <CardContent className="p-6">
                <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                  סיכום
                </h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {analysisResult.summary}
                </p>
              </CardContent>
            </Card>

            {/* Strengths */}
            <Card className="bg-green-950/40 border-green-700">
              <CardContent className="p-6">
                <h3 className="text-green-100 text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  נקודות חוזק
                </h3>
                <div className="space-y-3">
                  {analysisResult.strengths?.map((strength, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 bg-green-900/30 rounded-lg p-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-green-100 leading-relaxed">{strength}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Challenges */}
            <Card className="bg-amber-950/40 border-amber-700">
              <CardContent className="p-6">
                <h3 className="text-amber-100 text-xl font-bold mb-4 flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-amber-400" />
                  אתגרים
                </h3>
                <div className="space-y-3">
                  {analysisResult.challenges?.map((challenge, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 bg-amber-900/30 rounded-lg p-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-amber-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                        {idx + 1}
                      </div>
                      <p className="text-amber-100 leading-relaxed">{challenge}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="bg-purple-950/40 border-purple-700">
              <CardContent className="p-6">
                <h3 className="text-purple-100 text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  המלצות לחיזוק היחסים
                </h3>
                <div className="space-y-3">
                  {analysisResult.recommendations?.map((rec, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 bg-purple-900/30 rounded-lg p-4"
                    >
                      <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center shrink-0 text-white font-bold text-sm">
                        💡
                      </div>
                      <p className="text-purple-100 leading-relaxed">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Additional Insights */}
            {(analysisResult.communication_style || analysisResult.emotional_dynamics) && (
              <div className="grid md:grid-cols-2 gap-6">
                {analysisResult.communication_style && (
                  <Card className="bg-blue-950/40 border-blue-700">
                    <CardContent className="p-6">
                      <h4 className="text-blue-100 font-bold mb-3">💬 סגנון תקשורת</h4>
                      <p className="text-blue-200 text-sm leading-relaxed">
                        {analysisResult.communication_style}
                      </p>
                    </CardContent>
                  </Card>
                )}
                
                {analysisResult.emotional_dynamics && (
                  <Card className="bg-indigo-950/40 border-indigo-700">
                    <CardContent className="p-6">
                      <h4 className="text-indigo-100 font-bold mb-3">❤️ דינמיקה רגשית</h4>
                      <p className="text-indigo-200 text-sm leading-relaxed">
                        {analysisResult.emotional_dynamics}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                setAnalysisResult(null);
                setFormData({
                  person1_name: "",
                  person2_name: "",
                  relationship_type: "romantic",
                  person1_birth_date: "",
                  person2_birth_date: "",
                  relationship_context: ""
                });
              }}
              className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700"
            >
              ניתוח חדש
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}