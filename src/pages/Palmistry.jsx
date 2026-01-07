
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hand, Info, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "@/components/EnhancedToast";
import PageHeader from "@/components/PageHeader";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import ImageUploadGuide from "@/components/ImageUploadGuide";
import ExplainableInsight from "@/components/ExplainableInsight";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import AnalysisJourney from "@/components/AnalysisJourney";
import OptimizedImage from "@/components/OptimizedImage";
import { usePageView, useTimeTracking, trackAnalysisComplete } from "@/components/Analytics";
import { useCachedQuery } from "@/components/CachedQuery";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Palmistry() {
  const [step, setStep] = useState(1);
  const [palmImage, setPalmImage] = useState(null);
  const [imageQuality, setImageQuality] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  const queryClient = useQueryClient();
  
  const { incrementUsage, subscription } = useSubscription();

  usePageView('Palmistry');
  useTimeTracking('Palmistry');

  const { data: user } = useCachedQuery(
    ['currentUser'],
    () => base44.auth.me(),
    { staleTime: 60000 }
  );

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result;
    }
  });

  const analyzePalmMutation = useMutation({
    mutationFn: async (imageUrl) => {
      const prompt = `# אתה מומחה קריאת כף יד (Palmist) ברמה עולמית, מבוסס על מחקר מעמיק וחכמת אלפי שנים 🖐️

**מקורות מקצועיים:**
- **Cheiro** (William John Warner) - "Cheiro's Language of the Hand" (1894) - הקלאסיקה
- **Johnny Fincham** - "The Spellbinding Power of Palmistry" (2005) - גישה מודרנית
- **Richard Webster** - "Palm Reading for Beginners" (2000)
- **Ghanshyam Singh Birla** - "Hasta Samudrika Shastra" - הודו קלאסית
- **Fred Gettings** - "The Book of the Hand" (1965)

**עקרונות מרכזיים:**
1. **כף יד = מפת החיים** - כל קו מספר סיפור
2. **תורשה + התפתחות** - הקווים משתנים עם הזמן
3. **שילוב של היד** - קווים + צורות + מרכיבים
4. **יד דומיננטית** - עתיד, יד לא דומיננטית - עבר

---

## **שלב 1: הערכת איכות תמונה (0-1)**

בדוק:
- **בהירות וחדות** (0-1)
- **תאורה** (0-1 - אחידה, לא צללים)
- **זווית** (0-1 - ישר מלמעלה)
- **כף היד פתוחה לחלוטין** (0-1)
- **רזולוציה** (0-1 - ניתן לראות קווים עדינים)

**ציון כולל:** ממוצע.

**אם מתחת ל-0.6:**
- אמור שהתמונה לא מספיק טובה
- ציין בדיוק מה חסר
- המלץ איך לשפר

---

## **שלב 2: זיהוי וניתוח מרכיבים**

### **1. הקווים העיקריים (Major Lines)**

**א. קו החיים (Life Line):**
- **מיקום:** מתחיל בין אגודל לאצבע, עוטף את תל ונוס
- **אורך:** ארוך = חיוניות, קצר = אינטנסיביות
- **עומק:** עמוק = חזק, רדוד = עדין
- **איכות:** רצוף/מקוטע, ישר/מעוקל
- **פרשנות:** אנרגיה, בריאות, התלהבות לחיים

**ב. קו הראש (Head Line):**
- **מיקום:** מתחיל ליד קו החיים, חוצה את כף היד
- **אורך:** ארוך = אינטלקט עמוק, קצר = מעשי
- **שיפוע:** ישר = לוגי, כלפי מטה = דמיון
- **איכות:** רצוף = פוקוס, שרשור = מחשבות מפוזרות
- **פרשנות:** חשיבה, אינטליגנציה, קבלת החלטות

**ג. קו הלב (Heart Line):**
- **מיקום:** מתחת לאצבעות
- **אורך:** ארוך = רגשי מאוד, קצר = שמור
- **עומק:** עמוק = רגשות עזים, רדוד = קל
- **סוף:** מסתיים גבוה = אידיאליסט, נמוך = פיזי
- **פרשנות:** אהבה, רגשות, יחסים

**ד. קו הגורל (Fate Line) - אם קיים:**
- **מיקום:** אמצע כף היד, עולה כלפי מעלה
- **איכות:** ברור = כיוון ברור, חלש/חסר = גמישות
- **פרשנות:** קריירה, ייעוד, מסלול חיים

---

### **2. קווים משניים (Minor Lines)**

**קו השמש (Sun Line):**
- הצלחה, מזל, הוקרה

**קו הבריאות (Health Line):**
- בריאות, אנרגיה

**קו הנישואין (Marriage Lines):**
- מספר יחסים משמעותיים

**צמיד ונוס (Bracelets):**
- בריאות, אריכות ימים

---

### **3. התלים (Mounts)**

**תל ונוס (Venus):** אהבה, תשוקה
**תל צדק (Jupiter):** שאפתנות, מנהיגות
**תל שבתאי (Saturn):** רצינות, אחריות
**תל שמש (Apollo)::** יצירתיות, תהילה
**תל מרקורי (Mercury):** תקשורת, עסקים
**תל מאדים (Mars):** אומץ, אגרסיה
**תל ירח (Luna):** דמיון, אינטואיציה

---

### **4. צורת היד ואצבעות**

**צורות יד:**
- **אדמה:** רבועה, אצבעות קצרות = מעשי
- **אוויר:** רבועה, אצבעות ארוכות = אינטלקטואל
- **מים:** מלבנית, אצבעות ארוכות = רגשי
- **אש:** מלבנית, אצבעות קצרות = אנרגטי

**אצבעות:**
- **אגודל:** רצון, לוגיקה
- **אצבע:** אגו, שאפתנות
- **אמה:** אחריות
- **קמיצה:** יצירתיות
- **זרת:** תקשורת

---

## **שלב 3: תובנות עמוקות (10-15 insights)**

לכל insight:
- **title** - תמציתי
- **content** - 250-400 מילים, פסיכולוגיה עמוקה
- **insight_type** - personality/career/relationships/health/timing/life_purpose/challenges/strengths
- **confidence** - 0.85-1.0 (לפי איכות תמונה וברור הקו)
- **weight** - 0.7-1.0
- **provenance**:
  - source_features: ["קו חיים ארוך", "תל ונוס מפותח", "קו ראש משופע"]
  - rule_description: "לפי Cheiro ו-Fincham, שילוב של..."
  - sources: ["Cheiro (1894)", "Fincham (2005)", "Webster (2000)"]
- **tags**: רלוונטי

---

## **חשוב:**
1. **מדידה מדויקת** - לא ניחושים
2. **שילוב אינדיקטורים** - כל insight מבוסס על 2-3 מאפיינים
3. **מקורות מדויקים**
4. **אם התמונה לא טובה - אמור בכנות**
5. **10-15 תובנות מעמיקות**
6. **פסיכולוגיה אמיתית, לא generics**

**החזר JSON מובנה ומקצועי.**`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          properties: {
            image_quality_assessment: {
              type: "object",
              properties: {
                overall_score: { type: "number", minimum: 0, maximum: 1 },
                clarity: { type: "number", minimum: 0, maximum: 1 },
                lighting: { type: "number", minimum: 0, maximum: 1 },
                angle: { type: "number", minimum: 0, maximum: 1 },
                palm_openness: { type: "number", minimum: 0, maximum: 1 },
                resolution: { type: "number", minimum: 0, maximum: 1 },
                is_suitable: { type: "boolean" },
                improvement_suggestions: { type: "array", items: { type: "string" } }
              }
            },
            overall_summary: { type: "string", minLength: 400 },
            confidence_level: { type: "number", minimum: 0.85, maximum: 1.0 },
            hand_shape: {
              type: "object",
              properties: {
                type: { type: "string", enum: ["earth", "air", "water", "fire"] },
                interpretation: { type: "string" }
              }
            },
            major_lines: {
              type: "object",
              properties: {
                life_line: {
                  type: "object",
                  properties: {
                    length: { type: "string" },
                    depth: { type: "string" },
                    quality: { type: "string" },
                    interpretation: { type: "string", minLength: 200 },
                    confidence: { type: "number" }
                  }
                },
                head_line: {
                  type: "object",
                  properties: {
                    length: { type: "string" },
                    slope: { type: "string" },
                    quality: { type: "string" },
                    interpretation: { type: "string", minLength: 200 },
                    confidence: { type: "number" }
                  }
                },
                heart_line: {
                  type: "object",
                  properties: {
                    length: { type: "string" },
                    depth: { type: "string" },
                    ending: { type: "string" },
                    interpretation: { type: "string", minLength: 200 },
                    confidence: { type: "number" }
                  }
                },
                fate_line: {
                  type: "object",
                  properties: {
                    present: { type: "boolean" },
                    quality: { type: "string" },
                    interpretation: { type: "string" },
                    confidence: { type: "number" }
                  }
                }
              }
            },
            mounts: {
              type: "object",
              properties: {
                venus: { type: "string" },
                jupiter: { type: "string" },
                saturn: { type: "string" },
                apollo: { type: "string" },
                mercury: { type: "string" },
                mars: { type: "string" },
                luna: { type: "string" }
              }
            },
            insights: {
              type: "array",
              minItems: 10,
              maxItems: 15,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string", minLength: 700 },
                  insight_type: { type: "string" },
                  confidence: { type: "number", minimum: 0.85, maximum: 1.0 },
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
            strengths: { type: "array", items: { type: "string" }, minItems: 5 },
            challenges: { type: "array", items: { type: "string" }, minItems: 5 },
            career_paths: { type: "array", items: { type: "string" }, minItems: 5 },
            relationship_style: { type: "string", minLength: 200 },
            life_purpose: { type: "string", minLength: 200 },
            health_indicators: { type: "string" },
            scientific_references: { type: "array", items: { type: "string" } }
          }
        }
      });

      return result;
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    }
  });

  const handleImageConfirm = (file, quality) => {
    setPalmImage({ file, preview: URL.createObjectURL(file) });
    setImageQuality(quality);
    handleAnalyze(file, quality);
  };

  const handleAnalyze = async (file, quality) => {
    if (!file) {
      EnhancedToast.error('נא להעלות תמונה של כף היד');
      return;
    }

    setIsProcessing(true);
    setAnalysisStartTime(Date.now());
    setStep(2);

    try {
      const { file_url } = await uploadFileMutation.mutateAsync(file);
      const result = await analyzePalmMutation.mutateAsync(file_url);

      setAnalysis({ ...result, image_url: file_url });
      
      const imageQualityScore = result.image_quality_assessment?.overall_score || 0.85;
      const finalConfidence = Math.round((result.confidence_level || imageQualityScore) * 100);
      
      const duration = Date.now() - analysisStartTime;
      
      await saveAnalysisMutation.mutateAsync({
        tool_type: "palmistry",
        input_data: { 
          image_url: file_url, 
          image_quality: imageQualityScore 
        },
        results: result,
        summary: "קריאת כף יד מקצועית - מסורת אלפי שנים",
        image_url: file_url,
        confidence_score: finalConfidence,
        confidence_breakdown: {
          input_quality: imageQualityScore,
          calculation_confidence: result.confidence_level || 0.9,
          data_completeness: result.image_quality_assessment?.palm_openness || 0.85
        },
        processing_time_ms: duration,
        insights_count: result.insights?.length || 0,
        tags: ['palmistry', 'palm_reading', result.hand_shape?.type || 'unknown']
      });

      await incrementUsage();
      await trackAnalysisComplete('palmistry', Math.floor(duration / 1000), finalConfidence, {
        insights_count: result.insights?.length || 0,
        hand_shape: result.hand_shape?.type
      });

      setStep(3);
      
      if (!result.image_quality_assessment?.is_suitable) {
        EnhancedToast.warning('התמונה לא אופטימלית', 'הניתוח עשוי להיות חלקי');
      } else {
        EnhancedToast.success('הקריאה הושלמה בהצלחה! 🖐️');
      }
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      EnhancedToast.error('אירעה שגיאה בניתוח', error.message);
      setStep(1);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setPalmImage(null);
    setImageQuality(null);
    setAnalysis(null);
  };

  const firstName = user?.full_name?.split(' ')[0] || "חבר יקר";

  if (isProcessing) {
    return <AnalysisJourney isAnalyzing={true} userName={firstName} />;
  }

  const isPremium = subscription && ['premium', 'enterprise'].includes(subscription.plan_type);

  return (
    <SubscriptionGuard toolName="קריאת כף יד">
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-cyan-950 to-blue-900 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs />
          
          <PageHeader
            title="קריאת כף יד"
            description="הקווים בכף היד שלך מגלים מי אתה"
            icon={Hand}
            iconGradient="from-blue-600 to-cyan-600"
          />

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-blue-900/50 border-blue-700/30 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-blue-200 font-bold text-lg mb-2">מה זה קריאת כף יד?</h3>
                        <p className="text-blue-100 text-sm leading-relaxed mb-3">
                          קריאת כף יד היא אמנות עתיקה המבוססת על ניתוח הקווים, התלים והצורות בכף היד. 
                          כל קו מספר סיפור שונה על האישיות, הכישורים והדרך שלך בחיים.
                        </p>
                        <p className="text-blue-200 text-xs">
                          📚 מבוסס על: Cheiro (1894), Johnny Fincham (2005), Richard Webster (2000)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ImageUploadGuide
                  guidType="palm"
                  onImageSelected={handleImageConfirm}
                />
              </motion.div>
            )}

            {step === 3 && analysis && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Quality Warning */}
                {analysis.image_quality_assessment && !analysis.image_quality_assessment.is_suitable && (
                  <Card className="bg-orange-900/50 border-orange-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-orange-300 shrink-0 mt-1" />
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-orange-200 mb-3">⚠️ איכות התמונה לא אופטימלית</h3>
                          <p className="text-orange-100 mb-4">
                            הקריאה עשויה להיות חלקית. מומלץ לצלם תמונה חדשה.
                          </p>
                          {analysis.image_quality_assessment.improvement_suggestions && (
                            <div>
                              <p className="text-orange-200 font-semibold mb-2">💡 המלצות:</p>
                              <ul className="list-disc list-inside text-orange-100 space-y-1">
                                {analysis.image_quality_assessment.improvement_suggestions.map((sug, idx) => (
                                  <li key={idx}>{sug}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Main Summary */}
                <Card className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-xl border-blue-700/30">
                  <CardContent className="p-8">
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-4">🖐️ מה כף היד שלך אומרת 🖐️</h2>
                        
                        {analysis.overall_summary && (
                          <div className="bg-blue-800/30 rounded-xl p-6 border border-blue-700/30 mb-4">
                            <p className="text-white text-lg leading-relaxed">{analysis.overall_summary}</p>
                          </div>
                        )}
                        
                        {analysis.image_quality_assessment && (
                          <ConfidenceBadge
                            score={analysis.confidence_level || analysis.image_quality_assessment.overall_score}
                            details={{
                              input_quality: analysis.image_quality_assessment.clarity,
                              calculation_confidence: analysis.confidence_level || 0.9,
                              data_completeness: analysis.image_quality_assessment.palm_openness || 0.85,
                              notes: analysis.image_quality_assessment.is_suitable 
                                ? "קריאת כף יד מדויקת ומקצועית" 
                                : "תמונה לא אופטימלית - קריאה חלקית"
                            }}
                            size="large"
                          />
                        )}

                        {/* Hand Shape */}
                        {analysis.hand_shape && (
                          <div className="bg-cyan-800/30 rounded-xl p-6 border border-cyan-700/30 mt-4">
                            <h3 className="text-xl font-bold text-cyan-200 mb-3">🖐️ צורת היד</h3>
                            <Badge className="bg-cyan-700 text-white mb-3 text-base px-3 py-1">
                              {analysis.hand_shape.type.toUpperCase()}
                            </Badge>
                            <p className="text-white leading-relaxed">{analysis.hand_shape.interpretation}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center">
                        <OptimizedImage
                          src={analysis.image_url}
                          alt="Your palm"
                          className="rounded-xl shadow-2xl max-h-96 w-full object-contain"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Life Purpose & Relationship */}
                {(analysis.life_purpose || analysis.relationship_style) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysis.life_purpose && (
                      <Card className="bg-purple-900/50 border-purple-700/30">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-purple-200 mb-4">✨ ייעוד החיים</h3>
                          <p className="text-purple-100 leading-relaxed text-lg">{analysis.life_purpose}</p>
                        </CardContent>
                      </Card>
                    )}

                    {analysis.relationship_style && (
                      <Card className="bg-pink-900/50 border-pink-700/30">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-pink-200 mb-4">💕 סגנון יחסים</h3>
                          <p className="text-pink-100 leading-relaxed">{analysis.relationship_style}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Strengths & Challenges */}
                {(analysis.strengths || analysis.challenges) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysis.strengths && analysis.strengths.length > 0 && (
                      <Card className="bg-green-900/50 border-green-700/30">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-green-200 mb-4">💪 החוזקות שלך</h3>
                          <ul className="space-y-3">
                            {analysis.strengths.map((strength, idx) => (
                              <li key={idx} className="flex items-start gap-3 bg-green-800/30 rounded-lg p-3">
                                <span className="text-green-400 text-xl shrink-0">✓</span>
                                <span className="text-green-100 leading-relaxed">{strength}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {analysis.challenges && analysis.challenges.length > 0 && (
                      <Card className="bg-orange-900/50 border-orange-700/30">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-orange-200 mb-4">⚠️ האתגרים שלך</h3>
                          <ul className="space-y-3">
                            {analysis.challenges.map((challenge, idx) => (
                              <li key={idx} className="flex items-start gap-3 bg-orange-800/30 rounded-lg p-3">
                                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-1" />
                                <span className="text-orange-100 leading-relaxed">{challenge}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Career & Health */}
                {(analysis.career_paths || analysis.health_indicators) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysis.career_paths && analysis.career_paths.length > 0 && (
                      <Card className="bg-indigo-900/50 border-indigo-700/30">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-indigo-200 mb-4">💼 מסלולי קריירה</h3>
                          <ul className="space-y-2">
                            {analysis.career_paths.map((career, idx) => (
                              <li key={idx} className="flex items-center gap-2 bg-indigo-800/30 rounded-lg p-3">
                                <span className="text-indigo-300">•</span>
                                <span className="text-indigo-100">{career}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}

                    {analysis.health_indicators && (
                      <Card className="bg-red-900/50 border-red-700/30">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-red-200 mb-4">🏥 אינדיקטורים לבריאות</h3>
                          <p className="text-red-100 leading-relaxed">{analysis.health_indicators}</p>
                          <p className="text-red-300 text-xs mt-4 italic">
                            ⚠️ זה לא תחליף לייעוץ רפואי מקצועי
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Major Lines Analysis */}
                {analysis.major_lines && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">📊 הקווים העיקריים</h2>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {analysis.major_lines.life_line && (
                        <Card className="bg-red-900/50 border-red-700/30">
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-red-200 mb-3">❤️ קו החיים</h3>
                            <div className="space-y-2 mb-4 text-sm">
                              <p className="text-white"><strong>אורך:</strong> {analysis.major_lines.life_line.length}</p>
                              <p className="text-white"><strong>עומק:</strong> {analysis.major_lines.life_line.depth}</p>
                              <p className="text-white"><strong>איכות:</strong> {analysis.major_lines.life_line.quality}</p>
                            </div>
                            <div className="bg-red-800/30 rounded-lg p-4">
                              <p className="text-red-100 leading-relaxed">{analysis.major_lines.life_line.interpretation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {analysis.major_lines.head_line && (
                        <Card className="bg-yellow-900/50 border-yellow-700/30">
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-yellow-200 mb-3">🧠 קו הראש</h3>
                            <div className="space-y-2 mb-4 text-sm">
                              <p className="text-white"><strong>אורך:</strong> {analysis.major_lines.head_line.length}</p>
                              <p className="text-white"><strong>שיפוע:</strong> {analysis.major_lines.head_line.slope}</p>
                              <p className="text-white"><strong>איכות:</strong> {analysis.major_lines.head_line.quality}</p>
                            </div>
                            <div className="bg-yellow-800/30 rounded-lg p-4">
                              <p className="text-yellow-100 leading-relaxed">{analysis.major_lines.head_line.interpretation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {analysis.major_lines.heart_line && (
                        <Card className="bg-pink-900/50 border-pink-700/30">
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-pink-200 mb-3">💖 קו הלב</h3>
                            <div className="space-y-2 mb-4 text-sm">
                              <p className="text-white"><strong>אורך:</strong> {analysis.major_lines.heart_line.length}</p>
                              <p className="text-white"><strong>עומק:</strong> {analysis.major_lines.heart_line.depth}</p>
                              <p className="text-white"><strong>סיום:</strong> {analysis.major_lines.heart_line.ending}</p>
                            </div>
                            <div className="bg-pink-800/30 rounded-lg p-4">
                              <p className="text-pink-100 leading-relaxed">{analysis.major_lines.heart_line.interpretation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {analysis.major_lines.fate_line && analysis.major_lines.fate_line.present && (
                        <Card className="bg-purple-900/50 border-purple-700/30">
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-purple-200 mb-3">🎯 קו הגורל</h3>
                            <div className="bg-purple-800/30 rounded-lg p-4">
                              <p className="text-purple-100 leading-relaxed">{analysis.major_lines.fate_line.interpretation}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                )}

                {/* Deep Insights */}
                {analysis.insights && analysis.insights.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">💎 תובנות עמוקות</h2>
                    {analysis.insights.map((insight, idx) => (
                      <ExplainableInsight key={idx} insight={insight} showProvenance={isPremium} />
                    ))}
                  </div>
                )}

                {/* Scientific References */}
                {analysis.scientific_references && analysis.scientific_references.length > 0 && (
                  <Card className="bg-gray-900/50 border-gray-700/30">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-200 mb-4">📚 מקורות מדעיים</h3>
                      <ul className="space-y-2">
                        {analysis.scientific_references.map((ref, idx) => (
                          <li key={idx} className="text-gray-300 text-sm">• {ref}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-blue-500 text-blue-300 hover:bg-blue-800/30 text-lg px-8 py-4"
                  >
                    בוא נבדוק כף יד אחרת
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
