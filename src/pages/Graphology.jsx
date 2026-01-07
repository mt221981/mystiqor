import React, { useState, useCallback, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PenTool, Sparkles,
  Target, Zap,
  AlertCircle, BookOpen, Brain
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "@/components/EnhancedToast";
import EnhancedSuccessCelebration from "@/components/EnhancedSuccessCelebration"; // Added new import
import PageHeader from "@/components/PageHeader";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
// The original `SuccessCelebration` import is replaced by `EnhancedSuccessCelebration`
// import SuccessCelebration from "@/components/SuccessCelebration";
import { notifyAnalysisComplete } from "@/components/NotificationManager";
import AnalysisJourney from "@/components/AnalysisJourney";
import ImageUploadGuide from "@/components/ImageUploadGuide";
import ExplainableInsight from "@/components/ExplainableInsight";
import BigFiveRadarChart from "@/components/BigFiveRadarChart";
import QuantitativeMeasurements from "@/components/QuantitativeMeasurements";
import FeatureExplorer from "@/components/FeatureExplorer";
import ImageComparisonView from "@/components/ImageComparisonView";
import InsightsFilter from "@/components/InsightsFilter";
import GraphologyExportPDF from "@/components/GraphologyExportPDF";
import GraphologyTimeline from "@/components/GraphologyTimeline";
import StrengthsGrowthGrid from "@/components/StrengthsGrowthGrid";
import DeepDiveAccordion from "@/components/DeepDiveAccordion";
import GestaltCard from "@/components/GestaltCard";
import HealthIndicatorsCard from "@/components/HealthIndicatorsCard";
import GraphologyComparison from "@/components/GraphologyComparison";
import SavedInsights from "@/components/SavedInsights";
import GraphologyPrintView from "@/components/GraphologyPrintView";
import GraphologyReminder from "@/components/GraphologyReminder";
import GraphologyProgressTracker from "@/components/GraphologyProgressTracker";
import FDMVisualization from "@/components/FDMVisualization";
import ImageQualityIndicator from "@/components/ImageQualityIndicator";
import GraphologyQuickStats from "@/components/GraphologyQuickStats";
import GraphologyLearnMore from "@/components/GraphologyLearnMore";
import GraphologyShareButton from "@/components/GraphologyShareButton";
import { usePageView, useTimeTracking } from "@/components/Analytics";

export default function Graphology() {
  usePageView('Graphology');
  useTimeTracking('Graphology');

  const [step, setStep] = useState(1);
  const [handwritingImage, setHandwritingImage] = useState(null);
  const [imageQuality, setImageQuality] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [filteredInsights, setFilteredInsights] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const queryClient = useQueryClient();
  
  const { incrementUsage, subscription } = useSubscription();

  // New state variables for success celebration
  const [showCelebration, setShowCelebration] = useState(false);
  const [firstName, setFirstName] = useState("משתמש"); // Placeholder for user's first name
  const [confidenceScore, setConfidenceScore] = useState(0);

  const uploadFileMutation = useMutation({
    mutationFn: async (file) => {
      const result = await base44.integrations.Core.UploadFile({ file });
      return result;
    }
  });

  const analyzeHandwritingMutation = useMutation({
    mutationFn: async (imageUrl) => {
      const prompt = "# פרויקט \"גרפו-לוגוס\" - מערכת ניתוח גרפולוגי הוליסטי מתקדם\n" +
"## מבוסס מחקר מקיף על 140+ מקורות מקצועיים ומדעיים\n\n" +
"אתה מומחה גרפולוגי ברמה עולמית עם 25+ שנות ניסיון, המתמחה בניתוח הוליסטי (Gestalt Graphology).\n" +
"אתה עומד לבצע ניתוח כתב יד מקיף ומקצועי ביותר, מבוסס על תיאוריות גרפולוגיות מתקדמות, מחקר עדכני ושקיפות מדעית מלאה.\n\n" +
"## הצהרת שקיפות ואתיקה - קריטי לקרוא תחילה\n\n" +
"### המציאות המדעית של גרפולוגיה (עובדות מחקריות)\n\n" +
"**ממצאים ממחקר מקיף על 140+ מקורות:**\n\n" +
"1. **חוסר תוקף מדעי מוכח:**\n" +
"   - מחקר מקיף על 1,223 דגימות כתב יד לא הצליח להוכיח מתאם משמעותי\n" +
"   - גרפולוגים לא הצליחו לחזות אישיות טוב יותר מאנשים רגילים\n" +
"   - מטא-אנליזות (Dean 1992) מראות תקפות כמעט אפסית (r ≈ 0.02)\n\n" +
"2. **מחקר Garoot (2021) - מתאמים חלשים עד בינוניים:**\n" +
"   - Agreeableness: ρ ≈ 0.4-0.5 (החזק ביותר)\n" +
"   - Conscientiousness: ρ ≈ 0.3\n" +
"   - Openness: ρ ≈ 0.3\n" +
"   - Extraversion: ρ ≈ 0.15 (חלש)\n" +
"   - Emotional Stability: ρ ≈ 0.1 (חלש מאוד)\n\n" +
"   **חשוב:** גם המתאם החזק אינו מספיק לחיזוי אמין.\n\n" +
"3. **ההבחנה הקריטית:**\n" +
"   - FDE (זיהוי זיופים) = מדעי, דיוק 95%+\n" +
"   - גרפולוגיה לאישיות = אין בסיס מדעי מוכח\n\n" +
"### השפה שבה תשתמש (חובה):\n" +
"- \"לפי תיאוריות של...\"\n" +
"- \"ייתכן ש...\", \"נטען כי...\"\n" +
"- \"מחקר Garoot מצא מתאם חלש (ρ = X)\"\n\n" +
"## תהליך הניתוח - 8 שלבים\n\n" +
"### שלב 0: הערכת איכות תמונה\n" +
"בדוק: clarity, lighting, angle, text_amount, pen_type, background, completeness\n" +
"ציון < 0.6 = לא מתאים\n\n" +
"### שלב 1: FDM - זיהוי זיופים (מדעי!)\n" +
"בדוק 10 תופעות מיקרו:\n" +
"1. קווים רועדים\n" +
"2. הפסקות לא טבעיות\n" +
"3. לחץ לא אחיד חשוד\n" +
"4. חוסר עקביות פנימית\n" +
"5. אחידות יתר\n" +
"6. מהירות לא הגיונית\n" +
"7. חוסר התאמה לפרופיל\n" +
"8. סטיות קיצוניות\n" +
"9. תיקונים מרובים\n" +
"10. שגיאות כתיב חריגות\n\n" +
"**סף: 8+ סימנים = זיוף, הפסק ניתוח**\n\n" +
"### שלב 2: Formniveau (תיאורטי)\n" +
"ציון 1-10 לפי: rhythm, originality, organization, seele-geist balance\n" +
"**הבהר: זה לא ניתן למדידה אובייקטיבית (קלאגס)**\n\n" +
"### שלב 3: ניתוח 23 מאפיינים\n" +
"לכל מאפיין:\n" +
"1. מדידה אובייקטיבית (מ\"מ, מעלות)\n" +
"2. פרשנות תיאורטית (מקור)\n" +
"3. קורלציה Garoot עם ρ\n" +
"4. פרשנות לפי FN\n\n" +
"**מאפיינים:**\n" +
"- Baseline, Slant, Size, Pressure, Speed\n" +
"- Spacing, Margins, Zones, Connectivity\n" +
"- Letter Forms, Width, Regularity, Rhythm\n" +
"- T-bars, I-dots, Closed Letters, Loops\n" +
"- Capitals, Signature, Starting/Ending Strokes\n" +
"- Dots & Accents, Word Spacing\n\n" +
"### שלב 4: קורלציות Big Five (Garoot 2021)\n" +
"**Agreeableness (ρ ≈ 0.4-0.5):**\n" +
"- Rounded forms, Light pressure, Right slant\n\n" +
"**Conscientiousness (ρ ≈ 0.3):**\n" +
"- Regular baseline, Consistent size\n\n" +
"**Openness (ρ ≈ 0.3):**\n" +
"- Original forms, Variable slant\n\n" +
"**Extraversion (ρ ≈ 0.15):**\n" +
"- Large size, Heavy pressure\n\n" +
"**Emotional Stability (ρ ≈ 0.1):**\n" +
"- Stable baseline, Consistent pressure\n\n" +
"**הזכר תמיד: המתאמים חלשים מדי לחיזוי אמין**\n\n" +
"### שלב 5: סינתזה גשטאלטית\n" +
"זהה dominant, sub-dominant, counter features\n\n" +
"### שלב 6: 12-18 תובנות עמוקות\n" +
"כל insight: 800-1200 מילים, 3-5 מאפיינים, מקורות, ρ values\n\n" +
"### שלב 7: מבנה דוח מלא (17 קטגוריות)\n\n" +
"## Disclaimer (1200+ מילים)\n" +
"חובה לכלול:\n" +
"- מגבלות מדעיות מלאות\n" +
"- ממצאי מחקר\n" +
"- שימוש נכון vs אסור\n" +
"- FDE = מדעי, שאר = תיאורטי\n\n" +
"## מקורות (30-50)\n" +
"כולל: Dean 1992, Garoot 2021, Klages, Pulver, PNAS 2022, SWGDOC\n\n" +
"**החזר JSON מובנה, מקצועי, שקוף ואחראי.**";

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
                text_amount: { type: "number", minimum: 0, maximum: 1 },
                pen_type: { type: "string" },
                background: { type: "number", minimum: 0, maximum: 1 },
                completeness: { type: "number", minimum: 0, maximum: 1 },
                is_suitable: { type: "boolean" },
                improvement_suggestions: { type: "array", items: { type: "string" } }
              },
              required: ["overall_score", "is_suitable"]
            },
            authenticity_assessment: {
              type: "object",
              properties: {
                is_natural: { type: "boolean" },
                authenticity_score: { type: "number", minimum: 0, maximum: 100 },
                confidence_threshold_breached: { type: "boolean" },
                micro_phenomena_detected: {
                  type: "object",
                  properties: {
                    trembling_lines: { type: "boolean" },
                    unnatural_pauses: { type: "boolean" },
                    suspicious_pressure: { type: "boolean" },
                    internal_inconsistency: { type: "boolean" },
                    excessive_uniformity: { type: "boolean" },
                    unnatural_speed: { type: "boolean" },
                    profile_mismatch: { type: "boolean" },
                    extreme_deviations: { type: "boolean" },
                    excessive_corrections: { type: "boolean" },
                    unusual_spelling_errors: { type: "boolean" },
                    detailed_findings: { type: "string", minLength: 500 },
                    forgery_methods_identified: { type: "array", items: { type: "string" } }
                  }
                },
                suspicious_indicators_count: { type: "number" },
                forensic_report: { type: "string", minLength: 800 },
                ace_v_analysis: { type: "string", minLength: 400 },
                action_if_not_authentic: { type: "string" },
                conclusion: { type: "string" }
              },
              required: ["is_natural", "authenticity_score", "suspicious_indicators_count", "forensic_report", "conclusion"]
            },
            form_niveau: {
              type: "object",
              properties: {
                score: { type: "number", minimum: 1, maximum: 10 },
                qualitative_assessment: { type: "string", enum: ["very_low", "low", "medium", "high", "very_high"] },
                rhythm_quality: { type: "string" },
                originality_assessment: { type: "string" },
                organization_harmony: { type: "string" },
                seele_geist_balance: { type: "string" },
                key_indicators: { type: "array", items: { type: "string" }, minItems: 5 },
                interpretation: { type: "string", minLength: 500 },
                theoretical_note: { type: "string", minLength: 120 }
              },
              required: ["score", "qualitative_assessment", "interpretation", "theoretical_note"]
            },
            personality_snapshot: {
              type: "object",
              properties: {
                title: { type: "string" },
                summary: { type: "string", minLength: 400 },
                theoretical_basis_note: { type: "string", minLength: 120 },
                big_five_comparison: {
                  type: "object",
                  properties: {
                    openness: { type: "number", minimum: 0, maximum: 100 },
                    conscientiousness: { type: "number", minimum: 0, maximum: 100 },
                    extraversion: { type: "number", minimum: 0, maximum: 100 },
                    agreeableness: { type: "number", minimum: 0, maximum: 100 },
                    neuroticism: { type: "number", minimum: 0, maximum: 100 },
                    garoot_disclaimer: { type: "string", minLength: 100 }
                  },
                  required: ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism", "garoot_disclaimer"]
                },
                radar_chart_data: {
                  type: "object",
                  properties: {
                    thinking: { type: "number", minimum: 0, maximum: 100 },
                    emotion: { type: "number", minimum: 0, maximum: 100 },
                    social: { type: "number", minimum: 0, maximum: 100 },
                    willpower: { type: "number", minimum: 0, maximum: 100 },
                    creativity: { type: "number", minimum: 0, maximum: 100 }
                  }
                }
              },
              required: ["title", "summary", "theoretical_basis_note", "big_five_comparison"]
            },
            quantitative_measurements: {
              type: "object",
              properties: {
                slant_degrees_exact: { type: "number" },
                middle_zone_mm_exact: { type: "number" },
                pressure_scale_1_10: { type: "number", minimum: 1, maximum: 10 },
                spacing_letters_mm_avg: { type: "number" },
                spacing_words_mm_avg: { type: "number" },
                spacing_lines_mm_avg: { type: "number" },
                rhythm_score_1_10: { type: "number", minimum: 1, maximum: 10 },
                connectivity_percentage: { type: "number", minimum: 0, maximum: 100 },
                upper_zone_ratio: { type: "number" },
                lower_zone_ratio: { type: "number" }
              }
            },
            graphological_features: { type: "object" },
            gestalt_synthesis: { type: "array" },
            deep_dive_sections: {
              type: "object",
              properties: {
                intelligence_and_thinking: { type: "string", minLength: 600 },
                emotional_world: { type: "string", minLength: 600 },
                social_relations: { type: "string", minLength: 600 },
                motivation_and_drive: { type: "string", minLength: 600 },
                work_style: { type: "string", minLength: 600 }
              },
              required: ["intelligence_and_thinking", "emotional_world", "social_relations", "motivation_and_drive", "work_style"]
            },
            insights: {
              type: "array",
              minItems: 12,
              maxItems: 18,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string", minLength: 800 },
                  insight_type: { type: "string" },
                  confidence: { type: "number", minimum: 0.7, maximum: 1.0 },
                  weight: { type: "number", minimum: 0.5, maximum: 1.0 },
                  provenance: {
                    type: "object",
                    properties: {
                      source_features: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
                      rule_description: { type: "string", minLength: 150 },
                      sources: { type: "array", items: { type: "string" }, minItems: 2 },
                      garoot_rho_values: { type: "array", items: { type: "string" } }
                    },
                    required: ["source_features", "rule_description", "sources"]
                  },
                  tags: { type: "array", items: { type: "string" } }
                },
                required: ["title", "content", "insight_type", "confidence", "weight", "provenance"]
              }
            },
            strengths: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 12 },
            growth_areas: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 12 },
            career_recommendations: { type: "array", items: { type: "string" }, minItems: 6, maxItems: 12 },
            relationship_style: { type: "string", minLength: 400 },
            health_indicators: {
              type: "object",
              properties: {
                trauma_signs: { type: "array", items: { type: "string" } },
                depression_signs: { type: "array", items: { type: "string" } },
                anxiety_signs: { type: "array", items: { type: "string" } },
                stress_indicators: { type: "array", items: { type: "string" } },
                overall_assessment: { type: "string", minLength: 300 },
                medical_disclaimer: { type: "string", minLength: 150 }
              },
              required: ["overall_assessment", "medical_disclaimer"]
            },
            concluding_remarks: { type: "string", minLength: 400 },
            disclaimer: { type: "string", minLength: 800 },
            scientific_references: { type: "array", items: { type: "string" }, minItems: 20, maxItems: 50 }
          },
          required: ["image_quality_assessment", "authenticity_assessment", "form_niveau", "personality_snapshot", "insights", "disclaimer", "scientific_references"]
        }
      });

      return result;
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      queryClient.invalidateQueries({ queryKey: ['graphology_analyses'] });
      queryClient.invalidateQueries({ queryKey: ['graphology_history'] });
    }
  });

  const handleAnalyze = useCallback(async (file, quality) => {
    if (!file) {
      EnhancedToast.error('נא להעלות תמונה של כתב היד');
      return;
    }

    setIsProcessing(true);
    setAnalysisStartTime(Date.now());
    setStep(2);

    try {
      const { file_url } = await uploadFileMutation.mutateAsync(file);
      const llmResult = await analyzeHandwritingMutation.mutateAsync(file_url);

      const imageQualityScore = llmResult.image_quality_assessment?.overall_score || 0.85;
      const authenticityScore = llmResult.authenticity_assessment?.authenticity_score ? llmResult.authenticity_assessment.authenticity_score / 100 : 1.0;
      const finalConfidence = Math.round((authenticityScore * imageQualityScore) * 100);
      
      const duration = Date.now() - analysisStartTime;
      
      const savedAnalysis = await saveAnalysisMutation.mutateAsync({
        tool_type: "graphology",
        input_data: { 
          image_url: file_url, 
          image_quality: imageQualityScore,
          authenticity_score: authenticityScore,
          form_niveau_score: llmResult.form_niveau?.score
        },
        results: llmResult,
        summary: llmResult.personality_snapshot?.title || "ניתוח גרפולוגי הוליסטי",
        image_url: file_url,
        confidence_score: finalConfidence,
        confidence_breakdown: {
          input_quality: imageQualityScore,
          authenticity: authenticityScore,
          form_niveau: llmResult.form_niveau?.score ? llmResult.form_niveau.score / 10 : 0.9,
          data_completeness: llmResult.image_quality_assessment?.text_amount || 0.8
        },
        processing_time_ms: duration,
        insights_count: llmResult.insights?.length || 0,
        tags: [
          'graphology', 
          'grapho_logos',
          'gestalt_analysis',
          'garoot_2021',
          'big_five_correlated',
          '140_sources',
          'entertainment_educational',
          llmResult.image_quality_assessment?.is_suitable ? 'high_quality' : 'medium_quality',
          llmResult.authenticity_assessment?.is_natural ? 'authentic' : 'forgery_suspected',
          llmResult.form_niveau?.qualitative_assessment ? "fn_" + llmResult.form_niveau.qualitative_assessment : 'fn_unknown'
        ]
      });

      setAnalysis({ 
        id: savedAnalysis.id,
        image_url: file_url,
        results: llmResult,
        confidence_score: finalConfidence,
        insights_count: llmResult.insights?.length || 0,
        processing_time_ms: duration
      });
      
      await incrementUsage();

      notifyAnalysisComplete({
        analysisId: savedAnalysis.id,
        title: savedAnalysis.summary,
        imageUrl: savedAnalysis.image_url,
      });

      setConfidenceScore(finalConfidence);
      setShowCelebration(true);

      if (llmResult.authenticity_assessment && !llmResult.authenticity_assessment.is_natural && llmResult.authenticity_assessment.confidence_threshold_breached) {
        EnhancedToast.error('זיוף חשוד!', 'ניתוח האישיות הושעה');
      } else if (!llmResult.authenticity_assessment?.is_natural) {
        EnhancedToast.warning('חשד לכתב מסכה', 'יש אינדיקציות לכתב לא אותנטי');
      } else if (!llmResult.image_quality_assessment?.is_suitable) {
        EnhancedToast.warning('איכות תמונה נמוכה', 'הניתוח עלול להיות חלקי');
      } else {
        EnhancedToast.success('ניתוח הושלם!', 'זכור - לבידור וחינוך בלבד');
      }
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      EnhancedToast.error('שגיאה בניתוח', error.message);
      setStep(1);
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  }, [uploadFileMutation, analyzeHandwritingMutation, saveAnalysisMutation, incrementUsage, analysisStartTime]);

  const handleImageConfirm = useCallback((file, quality) => {
    setHandwritingImage({ file, preview: URL.createObjectURL(file) });
    setImageQuality(quality);
    handleAnalyze(file, quality);
  }, [handleAnalyze]);



  const handleReset = useCallback(() => {
    if (handwritingImage?.preview) {
      URL.revokeObjectURL(handwritingImage.preview);
    }
    setStep(1);
    setHandwritingImage(null);
    setImageQuality(null);
    setAnalysis(null);
    setFilteredInsights(null);
    setShowCelebration(false); // Reset celebration state
    setConfidenceScore(0); // Reset confidence score
  }, [handwritingImage]);

  const isPremium = useMemo(() => 
    subscription && ['premium', 'enterprise'].includes(subscription.plan_type),
    [subscription]
  );

  if (isProcessing) {
    return <AnalysisJourney isAnalyzing={true} userName="חבר יקר" />;
  }

  // Conditional rendering for success celebration
  if (showCelebration) {
    return (
      <EnhancedSuccessCelebration
        title={`${firstName}, זה מדהים! 🎉`}
        message="הניתוח הגרפולוגי שלך מוכן"
        score={confidenceScore}
        onContinue={() => {
          setShowCelebration(false);
          setStep(3); // Now set the step to 3 after celebration
        }}
      />
    );
  }

  return (
    <SubscriptionGuard toolName="גרפולוגיה">
      <div className="min-h-screen bg-gradient-to-br from-green-950 via-teal-950 to-green-900 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="גרפו-לוגוס: גרפולוגיה הוליסטית"
            description="מבוסס על 140+ מקורות מחקר • לבידור וחינוך בלבד"
            icon={PenTool}
            iconGradient="from-green-600 to-teal-600"
          />

          {showDisclaimer && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              aria-labelledby="disclaimer-title"
            >
              <Card className="bg-yellow-900/80 backdrop-blur-xl border-yellow-600/70 border-2 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="w-8 h-8 text-yellow-200 shrink-0 mt-1 animate-pulse" aria-hidden="true" />
                    <div className="flex-1">
                      <h3 id="disclaimer-title" className="text-2xl font-bold text-yellow-100 mb-3 flex items-center gap-2">
                        <BookOpen className="w-6 h-6" aria-hidden="true" />
                        ⚠️ הצהרת שקיפות מדעית
                      </h3>
                      <div className="space-y-3 text-yellow-50 text-sm leading-relaxed">
                        <p className="font-semibold text-base">
                          גרפולוגיה לניתוח אישיות נחשבת <strong>פסאודו-מדע</strong> על-ידי הקונצנזוס המדעי.
                        </p>
                        <div className="bg-yellow-800/40 rounded-lg p-4">
                          <p className="font-semibold mb-2">📊 ממצאי מחקר מקיף (140+ מקורות):</p>
                          <ul className="list-disc list-inside space-y-1 mr-4">
                            <li>אין מתאם משמעותי למבחני אישיות</li>
                            <li>תקפות כמעט אפסית (r ≈ 0.02)</li>
                            <li>מחקר Garoot 2021: מתאמים חלשים-בינוניים (ρ = 0.1-0.5)</li>
                          </ul>
                        </div>
                        <p className="text-sm italic bg-yellow-800/30 rounded-lg p-3">
                          💡 <strong>מה כן מדעי:</strong> זיהוי זיופים (FDE) - דיוק 95%+
                        </p>
                      </div>
                      <div className="mt-4 flex justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowDisclaimer(false)}
                          className="text-yellow-200 hover:bg-yellow-800/30"
                          aria-label="הסכמה להצהרת השקיפות"
                        >
                          הבנתי והסכמתי
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-indigo-900/50 backdrop-blur-xl border-indigo-700/50 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Brain className="w-6 h-6 text-indigo-300 shrink-0 mt-1" aria-hidden="true" />
                      <div>
                        <h3 className="text-indigo-200 font-bold text-lg mb-3">📚 ניתוח גרפולוגי הוליסטי</h3>
                        <div className="space-y-3 text-indigo-100 text-sm leading-relaxed">
                          <p>
                            <strong>"גרפו-לוגוס"</strong> משלב תיאוריות גרפולוגיות עם שקיפות מדעית:
                          </p>
                          <ul className="list-disc list-inside space-y-1 mr-4">
                            <li><strong>Gestalt Graphology:</strong> ניתוח הוליסטי</li>
                            <li><strong>FDM פורנזי:</strong> זיהוי זיופים (דיוק 95%+)</li>
                            <li><strong>Big Five:</strong> מבוסס Garoot 2021</li>
                            <li><strong>23 מאפיינים:</strong> ניתוח מקיף</li>
                            <li><strong>140+ מקורות:</strong> מחקר עמוק</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <ImageUploadGuide
                  guidType="handwriting"
                  onImageSelected={handleImageConfirm}
                />

                <div className="mt-8">
                  <GraphologyProgressTracker />
                </div>

                <div className="mt-8">
                  <Card className="bg-indigo-900/50 backdrop-blur-xl border-indigo-700/50">
                    <CardContent className="p-6">
                      <Button
                        onClick={() => setShowComparison(!showComparison)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 mb-4"
                        aria-expanded={showComparison}
                        aria-controls="comparison-panel"
                      >
                        {showComparison ? 'הסתר השוואה' : 'השווה בין ניתוחים קודמים'}
                      </Button>
                      <AnimatePresence>
                        {showComparison && (
                          <motion.div
                            id="comparison-panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                          >
                            <GraphologyComparison />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </div>

                <div className="mt-8">
                  <GraphologyLearnMore />
                </div>
              </motion.div>
            )}

            {step === 3 && analysis && (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
                role="region"
                aria-label="תוצאות ניתוח"
              >
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <h2 className="text-3xl font-bold text-white">תוצאות הניתוח</h2>
                  <div className="flex gap-3 flex-wrap">
                    <GraphologyShareButton 
                      analysisId={analysis.id} 
                      title={analysis.results?.personality_snapshot?.title}
                    />
                    <GraphologyPrintView analysis={analysis.results} userName="משתמש" />
                    <GraphologyExportPDF analysis={analysis.results} userName="משתמש" />
                  </div>
                </div>

                <GraphologyTimeline currentStep={8} />

                <GraphologyQuickStats analysis={analysis} />

                {analysis.image_url && (
                  <ImageComparisonView imageUrl={analysis.image_url} />
                )}

                {analysis.results?.image_quality_assessment && (
                  <ImageQualityIndicator quality={analysis.results.image_quality_assessment} />
                )}

                {analysis.results?.authenticity_assessment && (
                  <FDMVisualization authenticity={analysis.results.authenticity_assessment} />
                )}

                {analysis.results?.authenticity_assessment && 
                 !analysis.results.authenticity_assessment.is_natural && 
                 analysis.results.authenticity_assessment.confidence_threshold_breached && (
                  <Card className="bg-red-900/90 border-red-600 border-4" role="alert" aria-labelledby="forgery-alert">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 text-red-100 shrink-0 mt-1" aria-hidden="true">🚨</div>
                        <div className="flex-1">
                          <h3 id="forgery-alert" className="text-3xl font-bold text-red-50 mb-4 flex items-center gap-3">
                            <AlertCircle className="w-8 h-8" aria-hidden="true" />
                            זיוף חשוד - ניתוח הושעה
                          </h3>
                          <Badge className="bg-green-600 text-white mb-4">
                            ✅ FDE מדעי - דיוק 95%+
                          </Badge>
                          <p className="text-red-100 mb-4 text-xl font-semibold">
                            זוהו <strong>{analysis.results.authenticity_assessment.suspicious_indicators_count || 0}</strong>/10 תופעות מיקרו
                          </p>
                          
                          {analysis.results.authenticity_assessment.forensic_report && (
                            <div className="bg-red-800/50 rounded-xl p-6 mb-6">
                              <h4 className="text-red-100 font-bold text-xl mb-3">📋 דו"ח פורנזי:</h4>
                              <p className="text-red-100 leading-relaxed whitespace-pre-wrap">{analysis.results.authenticity_assessment.forensic_report}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysis.results?.form_niveau && (
                  <Card className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 backdrop-blur-xl border-purple-600/50 border-2">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-6">
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl"
                            aria-hidden="true"
                          >
                            <Target className="w-12 h-12 text-white" />
                          </motion.div>
                          <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-purple-900 font-bold text-xl rounded-full w-12 h-12 flex items-center justify-center border-4 border-purple-900">
                            {analysis.results.form_niveau.score}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h2 className="text-3xl font-bold text-white mb-2">
                            Formniveau
                          </h2>
                          <Badge className="bg-yellow-600 text-white mb-3">
                            תיאוריה
                          </Badge>
                          
                          {analysis.results.form_niveau.theoretical_note && (
                            <div className="bg-yellow-800/30 rounded-lg p-3 mb-4">
                              <p className="text-yellow-100 text-sm">
                                {analysis.results.form_niveau.theoretical_note}
                              </p>
                            </div>
                          )}
                          
                          <div className="bg-purple-800/40 rounded-xl p-6">
                            <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                              {analysis.results.form_niveau.interpretation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysis.results?.personality_snapshot && (
                  <>
                    <Card className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 backdrop-blur-xl border-blue-700/30">
                      <CardContent className="p-8">
                        <div className="flex items-start justify-between mb-4">
                          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            <Sparkles className="w-8 h-8 text-yellow-400" aria-hidden="true" />
                            {analysis.results.personality_snapshot.title}
                          </h2>
                          <Badge className="bg-yellow-600 text-white">
                            תיאורטי
                          </Badge>
                        </div>
                        
                        {analysis.results.personality_snapshot.theoretical_basis_note && (
                          <div className="bg-yellow-800/20 border border-yellow-600/40 rounded-lg p-3 mb-4" role="note">
                            <p className="text-yellow-100 text-sm">
                              {analysis.results.personality_snapshot.theoretical_basis_note}
                            </p>
                          </div>
                        )}
                        
                        <div className="bg-blue-800/30 rounded-xl p-6">
                          <p className="text-white text-lg leading-relaxed">
                            {analysis.results.personality_snapshot.summary}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {analysis.results.personality_snapshot.big_five_comparison && (
                      <BigFiveRadarChart 
                        bigFiveData={analysis.results.personality_snapshot.big_five_comparison}
                        garoot_disclaimer={analysis.results.personality_snapshot.big_five_comparison.garoot_disclaimer}
                      />
                    )}
                  </>
                )}

                {analysis.results?.quantitative_measurements && (
                  <QuantitativeMeasurements measurements={analysis.results.quantitative_measurements} />
                )}

                {analysis.results?.graphological_features && (
                  <FeatureExplorer features={analysis.results.graphological_features} />
                )}

                {analysis.results?.deep_dive_sections && (
                  <DeepDiveAccordion sections={analysis.results.deep_dive_sections} />
                )}

                {analysis.results?.gestalt_synthesis && analysis.results.gestalt_synthesis.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Zap className="w-8 h-8 text-yellow-400" aria-hidden="true" />
                        סינתזה גשטאלטית
                      </h2>
                      <Badge className="bg-yellow-600 text-white">
                        Gestalt Graphology
                      </Badge>
                    </div>
                    {analysis.results.gestalt_synthesis.map((syn, idx) => (
                      <GestaltCard key={idx} synthesis={syn} index={idx} />
                    ))}
                  </div>
                )}

                {analysis.results?.insights && analysis.results.insights.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                          <Sparkles className="w-8 h-8 text-purple-400" aria-hidden="true" />
                          תובנות עמוקות
                        </h2>
                        <Badge className="bg-yellow-600 text-white">
                          תיאורטי
                        </Badge>
                      </div>
                    </div>

                    <InsightsFilter 
                      insights={analysis.results.insights}
                      onFilterChange={setFilteredInsights}
                    />

                    <div role="list" aria-label="רשימת תובנות">
                      {(filteredInsights || analysis.results.insights).map((insight, idx) => (
                        <div key={idx} className="relative" role="listitem">
                          <div className="absolute top-4 left-4 z-10 print:hidden">
                            <SavedInsights insight={insight} analysisId={analysis.id} />
                          </div>
                          <ExplainableInsight insight={insight} showProvenance={isPremium} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(analysis.results?.strengths || analysis.results?.growth_areas) && (
                  <StrengthsGrowthGrid 
                    strengths={analysis.results.strengths}
                    growthAreas={analysis.results.growth_areas}
                  />
                )}

                {(analysis.results?.career_recommendations || analysis.results?.relationship_style) && (
                  <div className="grid md:grid-cols-2 gap-6">
                    {analysis.results.career_recommendations && (
                      <Card className="bg-blue-900/50 border-blue-700/30">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-blue-200 mb-4">💼 קריירה</h3>
                          <Badge className="bg-yellow-600 text-white mb-4">תיאורטי</Badge>
                          <ul className="space-y-2" role="list">
                            {analysis.results.career_recommendations.map((career, idx) => (
                              <li key={idx} className="flex items-center gap-2 bg-blue-800/30 rounded-lg p-3">
                                <span className="text-blue-300 text-xl" aria-hidden="true">✓</span>
                                <span className="text-blue-100">{career}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    {analysis.results.relationship_style && (
                      <Card className="bg-pink-900/50 border-pink-700/30">
                        <CardContent className="p-6">
                          <h3 className="text-2xl font-bold text-pink-200 mb-4">💕 יחסים</h3>
                          <Badge className="bg-yellow-600 text-white mb-4">תיאורטי</Badge>
                          <p className="text-pink-100 leading-relaxed whitespace-pre-wrap">{analysis.results.relationship_style}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {analysis.results?.health_indicators && (
                  <HealthIndicatorsCard healthData={analysis.results.health_indicators} />
                )}

                {analysis.results?.disclaimer && (
                  <Card className="bg-red-900/60 border-red-600/70 border-2" role="note" aria-labelledby="limitations-title">
                    <CardContent className="p-8">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-10 h-10 text-red-200 shrink-0 mt-1" aria-hidden="true" />
                        <div className="flex-1">
                          <h3 id="limitations-title" className="text-2xl font-bold text-red-100 mb-4">⚖️ הצהרת מגבלות</h3>
                          <div className="bg-red-800/40 rounded-xl p-6">
                            <p className="text-red-50 leading-relaxed whitespace-pre-wrap text-base">
                              {analysis.results.disclaimer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {analysis.results?.scientific_references && (
                  <Card className="bg-gray-900/50 border-gray-700/30">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-gray-200 mb-4">📚 מקורות ({analysis.results.scientific_references.length})</h3>
                      <div className="grid md:grid-cols-2 gap-2" role="list">
                        {analysis.results.scientific_references.map((ref, idx) => (
                          <div key={idx} className="text-gray-300 text-sm bg-gray-800/30 rounded-lg p-3" role="listitem">
                            {idx + 1}. {ref}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <GraphologyReminder />

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-green-500 text-green-300 hover:bg-green-800/30 text-lg px-8 py-4"
                    aria-label="ניתוח חדש"
                  >
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