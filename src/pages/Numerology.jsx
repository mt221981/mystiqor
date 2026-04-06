import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Sparkles, Hash, Heart, User, Info, X, AlertCircle, Users, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import EnhancedToast from "@/components/EnhancedToast";
import EnhancedSuccessCelebration from "@/components/EnhancedSuccessCelebration";
import { notifyAnalysisComplete } from "@/components/NotificationManager";
import ExplainableInsight from "@/components/ExplainableInsight";
import PersonalizedGreeting from "@/components/PersonalizedGreeting";
import AnalysisJourney from "@/components/AnalysisJourney";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import { usePageView, useTimeTracking, trackAnalysisComplete } from "@/components/Analytics";
import { useCachedQuery, CACHE_TIMES } from "@/components/CachedQuery";
import Breadcrumbs from "@/components/Breadcrumbs";
import HelpTooltip from "@/components/HelpTooltip";

// Memoized sub-components for performance
const NumberCard = React.memo(({ number, title, subtitle, gradient, onClick, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    onClick={onClick}
    className="cursor-pointer"
  >
    <Card className={`bg-gradient-to-br ${gradient} border-none shadow-xl hover:shadow-2xl hover:scale-105 transition-all`}>
      <CardContent className="p-6">
        <div className="text-6xl md:text-7xl font-bold text-white mb-4 text-center">
          {number}
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 text-center">{title}</h3>
        <p className="text-white/80 text-center text-sm md:text-base">
          {subtitle}
        </p>
        <p className="text-white/60 text-xs text-center mt-3 font-semibold">
          👆 לחץ לפרטים מלאים
        </p>
      </CardContent>
    </Card>
  </motion.div>
));

const CompatibilityScoreCard = React.memo(({ person1, person2, score, gradient = "from-pink-600 to-rose-600" }) => (
  <Card className={`bg-gradient-to-r ${gradient} backdrop-blur-xl border-2 border-pink-700 shadow-2xl`}>
    <CardContent className="p-6 md:p-8">
      <div className="text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-4 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-full flex items-center justify-center shadow-2xl">
          <Users className="w-10 h-10 md:w-12 md:h-12 text-white" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          ניתוח ההתאמה שלכם! 💕
        </h2>
        <div className="text-xl text-pink-200 mb-4">
          {person1.name} & {person2.name}
        </div>
        <div className="text-6xl md:text-7xl font-bold text-white mb-2">
          {score}%
        </div>
        <p className="text-pink-200 text-lg">ציון התאמה כללי</p>
      </div>
    </CardContent>
  </Card>
));

export default function Numerology() {
  const [mode, setMode] = useState('personal');
  const [formData, setFormData] = useState({ 
    fullName: "", 
    birthDate: "",
    person2: { fullName: "", birthDate: "" }
  });
  const [formErrors, setFormErrors] = useState({});
  const [results, setResults] = useState(null);
  const [compatibilityResults, setCompatibilityResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  const [selectedNumber, setSelectedNumber] = useState(null);

  const { incrementUsage, subscription } = useSubscription();

  usePageView('Numerology');
  useTimeTracking('Numerology');

  const { data: user } = useCachedQuery(
    ['currentUser'],
    () => base44.auth.me(),
    { staleTime: CACHE_TIMES.VERY_LONG }
  );

  const { data: userProfile } = useCachedQuery(
    ['userProfile'],
    async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    },
    { staleTime: CACHE_TIMES.LONG }
  );

  const { data: guestProfiles = [] } = useQuery({
    queryKey: ['guestProfiles'],
    queryFn: () => base44.entities.GuestProfile.filter({ is_active: true }),
    staleTime: CACHE_TIMES.MEDIUM,
    initialData: []
  });

  const calculateMutation = useMutation({
    mutationFn: async (data) => {
      console.log('🔵 Starting numerology analysis with data:', data);
      
      // חישוב מקומי של כל המספרים
      const [year, month, day] = data.birthDate.split('-').map(Number);
      const currentYear = new Date().getFullYear();
      
      // פונקציות עזר
      const reduceToSingleDigit = (num) => {
        if (num === 11 || num === 22 || num === 33) return num;
        while (num > 9) {
          num = String(num).split('').reduce((sum, digit) => sum + parseInt(digit, 10), 0);
        }
        return num;
      };
      
      const calculateLifePath = (d, m, y) => {
        const dayReduced = reduceToSingleDigit(d);
        const monthReduced = reduceToSingleDigit(m);
        const yearReduced = reduceToSingleDigit(y);
        return reduceToSingleDigit(dayReduced + monthReduced + yearReduced);
      };
      
      const cleanHebrewText = (text) => {
        if (!text) return '';
        return text.replace(/[\u0591-\u05C7]/g, '').replace(/[״׳־]/g, '').replace(/\s+/g, '').trim();
      };
      
      const GEMATRIA = {
        'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
        'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
        'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100, 'ר': 200,
        'ש': 300, 'ת': 400
      };
      
      const HEBREW_VOWELS = ['א', 'ה', 'ו', 'י', 'ע'];
      
      const calculateGematria = (text) => {
        let sum = 0;
        for (const char of text) {
          sum += GEMATRIA[char] || 0;
        }
        return sum;
      };
      
      // חישובים
      const lifePathNumber = calculateLifePath(day, month, year);
      const personalYear = reduceToSingleDigit(reduceToSingleDigit(day) + reduceToSingleDigit(month) + reduceToSingleDigit(currentYear));
      
      const cleanName = cleanHebrewText(data.fullName);
      const destinyValue = calculateGematria(cleanName);
      const destinyNumber = reduceToSingleDigit(destinyValue);
      
      const vowels = cleanName.split('').filter(c => HEBREW_VOWELS.includes(c)).join('');
      const soulValue = calculateGematria(vowels);
      const soulNumber = reduceToSingleDigit(soulValue);
      
      const consonants = cleanName.split('').filter(c => !HEBREW_VOWELS.includes(c) && GEMATRIA[c]).join('');
      const personalityValue = calculateGematria(consonants);
      const personalityNumber = reduceToSingleDigit(personalityValue);
      
      const age = currentYear - year;
      const firstCycleEnd = 36 - lifePathNumber;
      const firstCycleNumber = reduceToSingleDigit(month);
      const secondCycleEnd = firstCycleEnd + 9;
      const secondCycleNumber = reduceToSingleDigit(day);
      const thirdCycleNumber = reduceToSingleDigit(year);
      
      let currentCycle;
      if (age < firstCycleEnd) {
        currentCycle = { number: firstCycleNumber, name: 'מחזור ראשון', endsAt: firstCycleEnd };
      } else if (age < secondCycleEnd) {
        currentCycle = { number: secondCycleNumber, name: 'מחזור שני', endsAt: secondCycleEnd };
      } else {
        currentCycle = { number: thirdCycleNumber, name: 'מחזור שלישי', endsAt: null };
      }
      
      const calculation = {
        life_path: { number: lifePathNumber },
        destiny: { number: destinyNumber, name: cleanName },
        soul: { number: soulNumber },
        personality: { number: personalityNumber },
        personal_year: { number: personalYear },
        cycles: {
          firstCycle: { number: firstCycleNumber, endsAt: firstCycleEnd },
          secondCycle: { number: secondCycleNumber, endsAt: secondCycleEnd },
          thirdCycle: { number: thirdCycleNumber, endsAt: null },
          currentCycle
        },
        pinnacles: {
          first: reduceToSingleDigit(month + day),
          second: reduceToSingleDigit(day + year),
          third: reduceToSingleDigit(reduceToSingleDigit(month + day) + reduceToSingleDigit(day + year)),
          fourth: reduceToSingleDigit(month + year)
        },
        challenges: {
          first: Math.abs(reduceToSingleDigit(month) - reduceToSingleDigit(day)),
          second: Math.abs(reduceToSingleDigit(day) - reduceToSingleDigit(year)),
          third: Math.abs(Math.abs(reduceToSingleDigit(month) - reduceToSingleDigit(day)) - Math.abs(reduceToSingleDigit(day) - reduceToSingleDigit(year))),
          fourth: Math.abs(reduceToSingleDigit(month) - reduceToSingleDigit(year))
        }
      };
      
      // יצירת פרומפט ל-AI
      const aiPrompt = `אתה מומחה נומרולוגיה. צור ניתוח מעמיק עבור ${data.fullName}:

**מספרים:**
- Life Path: ${lifePathNumber}
- Destiny: ${destinyNumber}
- Soul: ${soulNumber}
- Personality: ${personalityNumber}
- Personal Year: ${personalYear}

צור סיכום (200-400 מילים), סינתזת ייעוד חיים (200-400 מילים), ולפחות 12 תובנות מעמיקות.
כל תובנה צריכה להכיל: כותרת, תוכן (100-200 מילים), 3-5 חוזקות, 2-4 אתגרים, 5-8 עצות מעשיות, קשר לפסיכולוגיה, קשר לחוכמה עתיקה.
כתוב בעברית בשפה חמה ואישית.`;

      try {
        const interpretation = await base44.integrations.Core.InvokeLLM({
          prompt: aiPrompt,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { type: "string" },
              life_purpose_synthesis: { type: "string" },
              confidence_level: { type: "number", minimum: 1.0, maximum: 1.0 },
              interpretations: {
                type: "array",
                minItems: 12,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    content: { type: "string" },
                    insight_type: { 
                      type: "string", 
                      enum: ["life_path", "destiny", "soul_urge", "personality", "personal_year", "life_cycle", "pinnacle", "life_challenge", "combination"] 
                    },
                    confidence: { type: "number", minimum: 1.0, maximum: 1.0 },
                    weight: { type: "number", minimum: 0.85, maximum: 1.0 },
                    strengths: { type: "array", items: { type: "string" } },
                    challenges: { type: "array", items: { type: "string" } },
                    actionable_advice: { type: "array", items: { type: "string" } },
                    psychological_connection: { type: "string" },
                    ancient_wisdom: { type: "string" },
                    provenance: {
                      type: "object",
                      properties: {
                        source_features: { type: "array", items: { type: "string" } },
                        rule_description: { type: "string" },
                        sources: { type: "array", items: { type: "string" } },
                        synthesis_basis: { type: "string" }
                      }
                    },
                    tags: { type: "array", items: { type: "string" } }
                  },
                  required: ["title", "content", "insight_type", "confidence", "weight", "strengths", "challenges", "actionable_advice", "psychological_connection", "ancient_wisdom", "provenance", "tags"]
                }
              }
            },
            required: ["summary", "life_purpose_synthesis", "confidence_level", "interpretations"]
          }
        });

        return {
          calculation,
          interpretation: {
            ...interpretation,
            confidence_level: 1.0,
            interpretations: (interpretation.interpretations || []).map(i => ({ ...i, confidence: 1.0 }))
          },
          features: []
        };
      } catch (aiError) {
        console.error('❌ AI interpretation failed:', aiError);
        
        // Fallback
        return {
          calculation,
          interpretation: {
            summary: `${data.fullName}, המספרים שלך מגלים אישיות ייחודית. מספר מסלול החיים ${lifePathNumber}, מספר הגורל ${destinyNumber}, ומספר הנשמה ${soulNumber}. אלה מספרים חזקים שמראים על אדם עם פוטנציאל גבוה.`,
            life_purpose_synthesis: `הייעוד שלך בחיים קשור למספר ${lifePathNumber}. זהו מסע של צמיחה, למידה ומימוש עצמי. השילוב בין המספרים שלך מצביע על דרך ייחודית שרק אתה יכול ללכת.`,
            confidence_level: 1.0,
            interpretations: [
              {
                title: `מסלול החיים שלך - מספר ${lifePathNumber}`,
                content: `מספר ${lifePathNumber} הוא מסלול החיים שלך. זה המספר הכי חשוב בנומרולוגיה, והוא מגדיר את המסע שלך בעולם הזה.`,
                insight_type: "life_path",
                confidence: 1.0,
                weight: 1.0,
                strengths: ["אינטואיציה חזקה", "יכולת למידה", "חוזק פנימי"],
                challenges: ["צורך באיזון", "למידה מתמדת"],
                actionable_advice: ["האזן לאינטואיציה שלך", "למד כל יום משהו חדש", "אמן על החוזק הפנימי שלך"],
                psychological_connection: "הנומרולוגיה מתחברת לפסיכולוגיה העמוקה של האדם",
                ancient_wisdom: "חכמת המספרים עתיקת יומין",
                provenance: {
                  source_features: [`life_path_${lifePathNumber}`],
                  rule_description: "מבוסס על חישוב תאריך הלידה",
                  sources: ["Dan Millman - The Life You Were Born to Live"],
                  synthesis_basis: "שילוב בין יום, חודש ושנת הלידה"
                },
                tags: ["life_path", "core_number"]
              }
            ]
          },
          features: []
        };
      }
    }
  });

  const compatibilityMutation = useMutation({
    mutationFn: async ({ person1, person2 }) => {
      const result = await base44.functions.invoke('calculateNumerologyCompatibility', {
        person1,
        person2
      });
      return result.data;
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
  });

  const saveFeaturesMutation = useMutation({
    mutationFn: (data) => base44.functions.invoke('saveFeatures', data),
    retry: false
  });

  const loadFromProfile = (profileData, targetPerson = 1) => {
    const data = {
      fullName: profileData.full_name_hebrew || profileData.full_name || '',
      birthDate: profileData.birth_date || ''
    };

    if (targetPerson === 1) {
      setFormData(prev => ({ ...prev, ...data }));
      setFormErrors(prevErrors => ({ ...prevErrors, fullName: null, birthDate: null }));
      EnhancedToast.success('פרופיל נטען! ✅', `נתוני ${profileData.full_name_hebrew || profileData.full_name} הועתקו`);
    } else {
      setFormData(prev => ({ ...prev, person2: data }));
      setFormErrors(prevErrors => ({ ...prevErrors, person2FullName: null, person2BirthDate: null }));
      EnhancedToast.success('פרופיל נטען! ✅', `נתוני ${profileData.full_name} הועתקו`);
    }
  };

  const validateHebrewName = (name) => {
    if (!name || name.trim().length === 0) return "נא להזין שם";
    if (name.trim().length < 2) return "השם קצר מדי";
    if (!/[\u0590-\u05FF]/.test(name)) return "נא להזין שם בעברית";
    return null;
  };

  const validateBirthDate = (date) => {
    if (!date) return "נא להזין תאריך לידה";
    const birthDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birthDate.setHours(0, 0, 0, 0);

    if (birthDate > today) return "תאריך לידה לא יכול להיות בעתיד";
    
    const minValidDate = new Date();
    minValidDate.setFullYear(minValidDate.getFullYear() - 120);
    if (birthDate < minValidDate) return "תאריך לידה לא הגיוני (מאוד ישן)";

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (mode === 'personal') {
      const nameError = validateHebrewName(formData.fullName);
      const dateError = validateBirthDate(formData.birthDate);

      setFormErrors({ fullName: nameError, birthDate: dateError });

      if (nameError || dateError) {
        EnhancedToast.error("יש שגיאות בטופס", "נא לתקן ולנסות שוב 💖");
        return;
      }

      setIsProcessing(true);
      setAnalysisStartTime(Date.now());

      try {
        console.log('🔵 Starting numerology analysis for:', formData);
        
        const { calculation, interpretation, features } = await calculateMutation.mutateAsync(formData);
        
        console.log('🟢 Analysis complete:', { calculation, interpretation, features });
        
        setResults({ calculation, interpretation, features });

        const overallConfidence = interpretation.confidence_level || 1.0;
        const confidenceScore = Math.round(overallConfidence * 100);

        let analysisRecord = null;
        try {
          analysisRecord = await saveAnalysisMutation.mutateAsync({
            tool_type: "numerology",
            input_data: formData,
            results: { calculation, interpretation },
            summary: `ניתוח נומרולוגי מעמיק עבור ${formData.fullName}`,
            confidence_score: confidenceScore,
            confidence_breakdown: {
              input_quality: 1.0,
              calculation_confidence: 1.0,
              data_completeness: 1.0
            },
            provenance: {
              rules_applied: interpretation.interpretations?.map(i => i.provenance?.rule_description).filter(Boolean) || [],
              features_used: features.map(f => f.feature_key),
              llm_enhanced: true,
              version: '4.0.0'
            },
            processing_time_ms: Date.now() - analysisStartTime,
            insights_count: interpretation.interpretations?.length || 0,
            tags: ['numerology', 'core_numbers', formData.fullName.split(' ')[0]]
          });

          // Try to save features (non-critical)
          if (features && features.length > 0 && analysisRecord) {
            saveFeaturesMutation.mutate({
              analysis_id: analysisRecord.id,
              tool_type: 'numerology',
              features: features.map(f => ({
                feature_key: f.feature_key,
                feature_value: f.feature_value,
                numeric_value: f.numeric_value,
                confidence: f.confidence,
                weight: f.weight,
                source: f.source,
                category: f.category || 'core_number',
                provenance: f.provenance || {
                  method: 'חישוב תאריך לידה ושם',
                  calculation_steps: ['המרת שם למספרים', 'צמצום לספרה בודדת'],
                  references: ['דקוז - מפתח הנומרולוגיה לנפש הפנימית']
                },
                tags: f.tags || ['ליבה', 'אישיות']
              }))
            });
          }
        } catch (saveError) {
          console.log('שמירת ניתוח נכשלה (לא קריטי):', saveError);
        }

        try {
          await incrementUsage();
        } catch (usageError) {
          console.log('עדכון שימוש נכשל:', usageError);
        }

        const duration = Math.floor((Date.now() - analysisStartTime) / 1000);
        trackAnalysisComplete('numerology', duration, confidenceScore, {
          insights_count: interpretation.interpretations?.length || 0,
          rules_applied: interpretation.interpretations?.length || 0
        }).catch(() => {});

        setShowSuccess(true);
        notifyAnalysisComplete("נומרולוגיה", confidenceScore);
        
        setTimeout(() => setShowSuccess(false), 3000);

      } catch (error) {
        console.error('❌ Numerology analysis error:', error);
        setIsProcessing(false);
        if (error.message === 'Usage limit reached') return;
        
        EnhancedToast.error('אירעה שגיאה בניתוח', error.response?.data?.message || error.message || 'אנא נסה שוב');
      } finally {
        setIsProcessing(false);
      }
    } else { // Compatibility mode
      const errors = {
        fullName: validateHebrewName(formData.fullName),
        birthDate: validateBirthDate(formData.birthDate),
        person2FullName: validateHebrewName(formData.person2.fullName),
        person2BirthDate: validateBirthDate(formData.person2.birthDate)
      };

      setFormErrors(errors);

      if (Object.values(errors).some(e => e)) {
        EnhancedToast.error("יש שגיאות בטופס", "נא למלא את כל הפרטים 💖");
        return;
      }

      setIsProcessing(true);
      setAnalysisStartTime(Date.now());

      try {
        const compResult = await compatibilityMutation.mutateAsync({
          person1: { fullName: formData.fullName, birthDate: formData.birthDate },
          person2: { fullName: formData.person2.fullName, birthDate: formData.person2.birthDate }
        });

        setCompatibilityResults(compResult);

        await incrementUsage();

        const duration = Math.floor((Date.now() - analysisStartTime) / 1000);
        await trackAnalysisComplete('numerology_compatibility', duration, compResult.compatibility.overall_compatibility_score);

        setShowSuccess(true);
        notifyAnalysisComplete("התאמה נומרולוגית", compResult.compatibility.overall_compatibility_score);
        
        setTimeout(() => setShowSuccess(false), 3000);

      } catch (error) {
        if (error.message === 'Usage limit reached') return;
        EnhancedToast.error('אירעה שגיאה', error.message);
        console.error(error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getInsightsForNumber = (numberType, numberValue) => {
    if (!results?.interpretation?.interpretations) return [];
    
    // Filter by insight_type directly if numberValue is not crucial for type (like cycles, pinnacles)
    // Or filter by presence of the numberValue in provenance source_features if applicable.
    return results.interpretation.interpretations.filter(insight => 
      insight.insight_type === numberType ||
      insight.provenance?.source_features?.some(sf => 
        sf.includes(numberType) || (numberValue !== null && sf.includes(String(numberValue)))
      )
    );
  };

  const firstName = formData.fullName?.split(' ')[0] || userProfile?.full_name_hebrew?.split(' ')[0] || "חבר יקר";

  const isPremium = subscription && ['premium', 'enterprise'].includes(subscription.plan_type);

  if (showSuccess && (results || compatibilityResults)) {
    return (
      <EnhancedSuccessCelebration
        title={`${firstName}, מעולה! ✨`}
        message={mode === 'personal' ? "מה שגיליתי עליך מוכן - זה רק בשבילך" : "ניתוח ההתאמה מוכן!"}
        score={mode === 'personal' 
          ? Math.round((results.interpretation.confidence_level || 1.0) * 100)
          : compatibilityResults.compatibility.overall_compatibility_score
        }
        onContinue={() => setShowSuccess(false)}
      />
    );
  }

  return (
    <SubscriptionGuard toolName="נומרולוגיה">
      <AnalysisJourney 
        isAnalyzing={isProcessing}
        userName={firstName}
      />

      <AnimatePresence>
        {selectedNumber && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNumber(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-purple-900 border-2 border-purple-500 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between border-b-2 border-purple-400 z-10">
                <div className="flex items-center gap-4">
                  <div className="text-6xl font-bold text-white">
                    {selectedNumber.number}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedNumber.title}</h3>
                    <p className="text-purple-100">{selectedNumber.subtitle}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedNumber(null)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  aria-label="סגור"
                >
                  <X className="w-6 h-6" />
                </Button>
              </div>
              
              <div className="p-6 space-y-6">
                {selectedNumber.insights?.length > 0 ? (
                  selectedNumber.insights.map((insight, idx) => (
                    <ExplainableInsight 
                      key={idx} 
                      insight={insight}
                      showProvenance={isPremium}
                    />
                  ))
                ) : (
                  <Card className="bg-purple-800/30 border-purple-600/50">
                    <CardContent className="p-6 text-center">
                      <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                      <p className="text-purple-200 text-lg">
                        עוד רגע אוסיף תובנות מעמיקות למספר הזה...
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-4 md:p-6 lg:p-12">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs />
          
          <PageHeader
            title="נומרולוגיה 🔢"
            description="המספרים שלך מספרים עליך"
            icon={Hash}
            iconGradient="from-purple-500 to-pink-500"
          />

          {!results && !compatibilityResults && <PersonalizedGreeting userName={user?.full_name} />}

          <AnimatePresence mode="wait">
            {!results && !compatibilityResults ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-indigo-950/90 backdrop-blur-xl border-indigo-500/50 mb-6 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-indigo-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-white font-bold text-lg mb-2">איך זה עובד?</h3>
                        <p className="text-gray-100 text-sm leading-relaxed font-medium">
                          נומרולוגיה היא חכמה עתיקה שמאמינה שלכל מספר יש משמעות רוחנית. השם ותאריך הלידה שלך נושאים בתוכם קוד ייחודי שמגלה את תכונות האישיות, הכישרונות והייעוד שלך.
                        </p>
                        <p className="text-yellow-300 text-xs mt-2 font-bold">
                          💡 חשוב: הניתוח מציג פוטנציאלים ונטיות, לא גורל קבוע.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/50 mb-6">
                  <CardContent className="p-6">
                    <h3 className="text-white text-xl font-bold mb-4 text-center">מה תרצה לעשות?</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button
                        onClick={() => setMode('personal')}
                        className={`h-24 text-lg transition-all ${
                          mode === 'personal'
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-xl scale-105 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                        }`}
                      >
                        <User className="w-6 h-6 ml-2" />
                        ניתוח אישי
                      </Button>
                      <Button
                        onClick={() => setMode('compatibility')}
                        className={`h-24 text-lg transition-all ${
                          mode === 'compatibility'
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 shadow-xl scale-105 text-white'
                            : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
                        }`}
                      >
                        <Users className="w-6 h-6 ml-2" />
                        התאמה בין שניים
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border-2 border-purple-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-white text-center flex items-center justify-center gap-3">
                      <User className="w-8 h-8 text-purple-400" />
                      ספר לי עליך
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Person 1 Fields */}
                      <div className="space-y-6">
                        {/* Load Profile Button for Person 1 */}
                        {(userProfile || guestProfiles.length > 0) && (
                          <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/30">
                            <Label className="text-blue-200 text-sm mb-2 block">
                              💡 טען מפרופיל שמור:
                            </Label>
                            <div className="flex gap-2 flex-wrap">
                              {userProfile && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => loadFromProfile(userProfile, 1)}
                                  className="flex-1 border-blue-600 text-blue-200 hover:bg-blue-900/30"
                                >
                                  <User className="w-4 h-4 ml-1" />
                                  הפרופיל שלי
                                </Button>
                              )}
                              {guestProfiles.length > 0 && (
                                <Select onValueChange={(value) => {
                                  const profile = guestProfiles.find(p => p.id === value);
                                  if (profile) loadFromProfile(profile, 1);
                                }}>
                                  <SelectTrigger className="flex-1 border-blue-600 text-blue-200 bg-blue-900/20">
                                    <SelectValue placeholder="פרופיל אורח..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {guestProfiles.map(profile => (
                                      <SelectItem key={profile.id} value={profile.id}>
                                        {profile.full_name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <div className="space-y-3">
                          <Label htmlFor="fullName" className="text-white text-lg font-semibold">
                            שם מלא בעברית *
                          </Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => {
                              setFormData({ ...formData, fullName: e.target.value });
                              if (formErrors.fullName) {
                                setFormErrors({ ...formErrors, fullName: "" });
                              }
                            }}
                            placeholder="למשל: משה כהן"
                            className="bg-gray-700/50 border-purple-500/50 text-white placeholder-gray-300 text-lg h-14 focus:border-purple-400 focus:ring-purple-400"
                            dir="rtl"
                            required
                          />
                          {formErrors.fullName && (
                            <p className="text-red-400 text-sm">
                              {formErrors.fullName}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="birthDate" className="text-white text-lg font-semibold">
                            תאריך לידה *
                          </Label>
                          <Input
                            id="birthDate"
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) => {
                              setFormData({ ...formData, birthDate: e.target.value });
                              if (formErrors.birthDate) {
                                setFormErrors({ ...formErrors, birthDate: "" });
                              }
                            }}
                            className="bg-gray-700/50 border-purple-500/50 text-white text-lg h-14 focus:border-purple-400 focus:ring-purple-400"
                            max={new Date().toISOString().split('T')[0]}
                            min="1900-01-01"
                            required
                          />
                          {formErrors.birthDate && (
                            <p className="text-red-400 text-sm">
                              {formErrors.birthDate}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Person 2 Fields (Compatibility Mode) */}
                      {mode === 'compatibility' && (
                        <div className="space-y-6 p-6 bg-pink-900/30 rounded-xl border-2 border-pink-500/30">
                          <h3 className="text-xl font-bold text-white text-center">פרטי האדם השני</h3>

                          {guestProfiles.length > 0 && (
                            <div className="bg-pink-900/30 rounded-lg p-4 border border-pink-700/30">
                              <Label className="text-pink-200 text-sm mb-2 block">
                                💡 טען מפרופיל אורח:
                              </Label>
                              <Select onValueChange={(value) => {
                                const profile = guestProfiles.find(p => p.id === value);
                                if (profile) loadFromProfile(profile, 2);
                              }}>
                                <SelectTrigger className="w-full border-pink-600 text-pink-200 bg-pink-900/20">
                                  <SelectValue placeholder="בחר פרופיל..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {guestProfiles.map(profile => (
                                    <SelectItem key={profile.id} value={profile.id}>
                                      {profile.full_name}
                                    </SelectItem>
                                  ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                            
                            <div className="space-y-3">
                              <Label htmlFor="person2Name" className="text-white text-lg font-semibold">
                                שם מלא בעברית *
                              </Label>
                              <Input
                                id="person2Name"
                                value={formData.person2?.fullName || ''}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    person2: { ...formData.person2, fullName: e.target.value }
                                  });
                                  if (formErrors.person2FullName) {
                                    setFormErrors({ ...formErrors, person2FullName: "" });
                                  }
                                }}
                                placeholder="למשל: שרה לוי"
                                className="bg-gray-700/50 border-pink-500/50 text-white placeholder-gray-300 text-lg h-14 focus:border-pink-400 focus:ring-pink-400"
                                dir="rtl"
                                required={mode === 'compatibility'}
                              />
                              {formErrors.person2FullName && (
                                <p className="text-red-400 text-sm">{formErrors.person2FullName}</p>
                              )}
                            </div>

                            <div className="space-y-3">
                              <Label htmlFor="person2BirthDate" className="text-white text-lg font-semibold">
                                תאריך לידה *
                              </Label>
                              <Input
                                id="person2BirthDate"
                                type="date"
                                value={formData.person2?.birthDate || ''}
                                onChange={(e) => {
                                  setFormData({
                                    ...formData,
                                    person2: { ...formData.person2, birthDate: e.target.value }
                                  });
                                  if (formErrors.person2BirthDate) {
                                    setFormErrors({ ...formErrors, person2BirthDate: "" });
                                  }
                                }}
                                className="bg-gray-700/50 border-pink-500/50 text-white text-lg h-14 focus:border-pink-400 focus:ring-pink-400"
                                max={new Date().toISOString().split('T')[0]}
                                min="1900-01-01"
                                required={mode === 'compatibility'}
                              />
                              {formErrors.person2BirthDate && (
                                <p className="text-red-400 text-sm">{formErrors.person2BirthDate}</p>
                              )}
                            </div>
                          </div>
                        )}

                        <Button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-xl h-16 disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <>
                              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin ml-2" />
                              מחשב...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-6 h-6 ml-2" />
                              {mode === 'personal' ? 'חשב את המספרים שלי' : 'חשב התאמה'}
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : results ? (
                <motion.div
                  key="results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6 md:space-y-8"
                >
                  {/* Header */}
                  <Card className="bg-gradient-to-r from-purple-900/50 via-pink-900/50 to-purple-900/50 backdrop-blur-xl border-2 border-purple-700 shadow-2xl">
                    <CardContent className="p-6 md:p-8 text-center">
                      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                        {firstName}, זה אתה! ✨
                      </h2>
                      <p className="text-xl text-purple-200 mb-2">{formData.fullName}</p>
                      <ConfidenceBadge score={100} />
                    </CardContent>
                  </Card>

                  {/* Life Purpose */}
                  {results.interpretation.life_purpose_synthesis && (
                    <ResultCard title="הייעוד שלך בחיים 🎯" gradient="from-yellow-600 to-amber-600">
                      <p className="text-white text-lg leading-relaxed">
                        {results.interpretation.life_purpose_synthesis}
                      </p>
                    </ResultCard>
                  )}

                  {/* Summary */}
                  {results.interpretation.summary && (
                    <ResultCard title={`${firstName}, הנה מה שגיליתי עליך`} gradient="from-purple-600 to-pink-600">
                      <p className="text-white text-lg leading-relaxed">
                        {results.interpretation.summary}
                      </p>
                    </ResultCard>
                  )}

                  {/* Core Numbers */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    {results.calculation.life_path && (
                      <NumberCard
                        number={results.calculation.life_path.number}
                        title={
                          <div className="flex items-center justify-center gap-2">
                            הדרך שלך בחיים
                            <HelpTooltip text="מספר נתיב החיים נחשב למספר החשוב ביותר בנומרולוגיה. הוא חושף את המתווה הכללי של חייך, את ההזדמנויות והאתגרים שתפגוש." />
                          </div>
                        }
                        subtitle="המספר שמגדיר למה אתה פה"
                        gradient="from-purple-600 to-purple-800"
                        onClick={() => setSelectedNumber({
                          number: results.calculation.life_path.number,
                          title: "הדרך שלך בחיים",
                          subtitle: "המספר שמגדיר למה אתה פה",
                          insights: getInsightsForNumber('life_path', results.calculation.life_path.number)
                        })}
                        delay={0.1}
                      />
                    )}

                    {results.calculation.destiny && (
                      <NumberCard
                        number={results.calculation.destiny.number}
                        title={
                          <div className="flex items-center justify-center gap-2">
                            מספר הגורל
                            <HelpTooltip text="מחושב מהשם המלא שלך. מספר הגורל (או הביטוי) מייצג את הכישרונות הטבעיים שלך ואת מה שבאת לעולם כדי להשיג ולבטא." />
                          </div>
                        }
                        subtitle="מה אתה כאן לבטא"
                        gradient="from-pink-600 to-pink-800"
                        onClick={() => setSelectedNumber({
                          number: results.calculation.destiny.number,
                          title: "מספר הגורל",
                          subtitle: "מה אתה כאן לבטא",
                          insights: getInsightsForNumber('destiny', results.calculation.destiny.number)
                        })}
                        delay={0.2}
                      />
                    )}

                    {results.calculation.soul && (
                      <NumberCard
                        number={results.calculation.soul.number}
                        title={
                          <div className="flex items-center justify-center gap-2">
                            דחף הנשמה
                            <HelpTooltip text="מחושב מתנועות השם שלך. מספר זה חושף את הרצונות העמוקים ביותר, המניעים הפנימיים ומה באמת גורם לך אושר." />
                          </div>
                        }
                        subtitle="מה הנשמה רוצה"
                        gradient="from-indigo-600 to-indigo-800"
                        onClick={() => setSelectedNumber({
                          number: results.calculation.soul.number,
                          title: "דחף הנשמה",
                          subtitle: "מה הנשמה רוצה",
                          insights: getInsightsForNumber('soul_urge', results.calculation.soul.number)
                        })}
                        delay={0.3}
                      />
                    )}

                    {results.calculation.personality && (
                      <NumberCard
                        number={results.calculation.personality.number}
                        title={
                          <div className="flex items-center justify-center gap-2">
                            האישיות החיצונית
                            <HelpTooltip text="מחושב מעיצורי השם. זהו 'כרטיס הביקור' שלך - הרושם הראשוני שאתה משאיר על אחרים וכיצד העולם החיצוני תופס אותך." />
                          </div>
                        }
                        subtitle="איך אחרים רואים אותך"
                        gradient="from-blue-600 to-blue-800"
                        onClick={() => setSelectedNumber({
                          number: results.calculation.personality.number,
                          title: "האישיות החיצונית",
                          subtitle: "איך אחרים רואים אותך",
                          insights: getInsightsForNumber('personality', results.calculation.personality.number)
                        })}
                        delay={0.4}
                      />
                    )}

                    {results.calculation.personal_year && (
                      <NumberCard
                        number={results.calculation.personal_year.number}
                        title="השנה האישית"
                        subtitle={`שנה ${results.calculation.personal_year.number} במחזור`}
                        gradient="from-green-600 to-teal-600"
                        onClick={() => setSelectedNumber({
                          number: results.calculation.personal_year.number,
                          title: "השנה האישית שלך",
                          subtitle: `שנה ${results.calculation.personal_year.number} במחזור`,
                          insights: getInsightsForNumber('personal_year', results.calculation.personal_year.number)
                        })}
                        delay={0.5}
                      />
                    )}
                  </div>

                  {/* Cycles, Pinnacles, Challenges */}
                  {(results.calculation.cycles || results.calculation.pinnacles || results.calculation.challenges) && (
                    <div className="space-y-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                        📅 מחזורים, פסגות ואתגרים
                      </h2>

                      {results.calculation.cycles?.currentCycle && (
                        <ResultCard title={`מחזור נוכחי: ${results.calculation.cycles.currentCycle.name} - מספר ${results.calculation.cycles.currentCycle.number}`} gradient="from-indigo-900/60 to-blue-900/60">
                          <div className="bg-indigo-950/50 rounded-lg p-4 mb-4">
                            <div className="text-5xl font-bold text-white text-center mb-2">
                              {results.calculation.cycles.currentCycle.number}
                            </div>
                            <p className="text-indigo-200 text-center">{results.calculation.cycles.currentCycle.name}</p>
                          </div>
                          {getInsightsForNumber('life_cycle', results.calculation.cycles.currentCycle.number).slice(0, 1).map((insight, idx) => (
                            <ExplainableInsight key={idx} insight={insight} showProvenance={isPremium} />
                          ))}
                        </ResultCard>
                      )}

                      {results.calculation.pinnacles && (
                        <ResultCard title="הפסגות - 4 תקופות מרכזיות" gradient="from-purple-900/60 to-violet-900/60">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {Object.entries(results.calculation.pinnacles).map(([key, value], idx) => (
                              <div key={key} className="bg-purple-950/50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                                <p className="text-purple-300 text-xs">פסגה {idx + 1}</p>
                              </div>
                            ))}
                          </div>
                          {getInsightsForNumber('pinnacle', null).slice(0, 1).map((insight, idx) => (
                            <ExplainableInsight key={idx} insight={insight} showProvenance={isPremium} />
                          ))}
                        </ResultCard>
                      )}

                      {results.calculation.challenges && (
                        <ResultCard title="האתגרים - 4 מבחנים" gradient="from-orange-900/60 to-red-900/60">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {Object.entries(results.calculation.challenges).map(([key, value], idx) => (
                              <div key={key} className="bg-orange-950/50 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white mb-1">{value}</div>
                                <p className="text-orange-300 text-xs">אתגר {idx + 1}</p>
                              </div>
                            ))}
                          </div>
                          {getInsightsForNumber('life_challenge', null).slice(0, 1).map((insight, idx) => (
                            <ExplainableInsight key={idx} insight={insight} showProvenance={isPremium} />
                          ))}
                        </ResultCard>
                      )}
                    </div>
                  )}

                  {/* All Insights */}
                  {results.interpretation.interpretations?.length > 0 && (
                    <div className="space-y-6">
                      <h2 className="text-2xl md:text-3xl font-bold text-white text-center">
                        {firstName}, בוא נצלול עמוק 💎
                      </h2>
                      <p className="text-purple-200 text-center text-lg">
                        הכנתי לך {results.interpretation.interpretations.length} תובנות מעמיקות
                      </p>
                      {results.interpretation.interpretations.map((insight, idx) => (
                        <ExplainableInsight 
                          key={idx} 
                          insight={insight}
                          showProvenance={isPremium}
                        />
                      ))}
                    </div>
                  )}

                  <div className="flex justify-center pt-6">
                    <Button
                      onClick={() => {
                        setResults(null);
                        setFormData({ fullName: "", birthDate: "", person2: { fullName: "", birthDate: "" } });
                        setSelectedNumber(null);
                        setFormErrors({});
                      }}
                      className="bg-gray-800 text-white border-2 border-purple-700 hover:bg-gray-700 text-lg px-8 py-6 rounded-xl"
                    >
                      <Heart className="w-5 h-5 ml-2" />
                      בוא נבדוק עוד מישהו
                    </Button>
                  </div>
                </motion.div>
              ) : compatibilityResults && (
                <motion.div
                  key="compatibility-results"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <CompatibilityScoreCard
                    person1={compatibilityResults.person1}
                    person2={compatibilityResults.person2}
                    score={compatibilityResults.compatibility.overall_compatibility_score}
                  />

                  {compatibilityResults.compatibility.overall_summary && (
                    <ResultCard title="סיכום כללי" icon={Heart} gradient="from-pink-900/60 to-rose-900/60">
                      <p className="text-white text-lg leading-relaxed">
                        {compatibilityResults.compatibility.overall_summary}
                      </p>
                    </ResultCard>
                  )}

                  {compatibilityResults.compatibility.life_path_compatibility && (
                    <ResultCard title="התאמת מסלול חיים" icon={Hash} gradient="from-purple-900/60 to-indigo-900/60">
                      <div className="flex items-center justify-center gap-8 mb-6">
                        <div className="text-center">
                          <div className="text-5xl font-bold text-white mb-2">
                            {compatibilityResults.person1.life_path}
                          </div>
                          <p className="text-purple-300">{compatibilityResults.person1.name}</p>
                        </div>
                        <Heart className="w-10 h-10 text-pink-400" />
                        <div className="text-center">
                          <div className="text-5xl font-bold text-white mb-2">
                            {compatibilityResults.person2.life_path}
                          </div>
                          <p className="text-purple-300">{compatibilityResults.person2.name}</p>
                        </div>
                      </div>
                      <div className="bg-purple-950/50 rounded-lg p-6">
                        <div className="text-3xl font-bold text-white mb-4 text-center">
                          {compatibilityResults.compatibility.life_path_compatibility.score}%
                        </div>
                        <p className="text-purple-100 leading-relaxed">
                          {compatibilityResults.compatibility.life_path_compatibility.analysis}
                        </p>
                      </div>
                    </ResultCard>
                  )}

                  {compatibilityResults.compatibility.shared_strengths?.length > 0 && (
                    <ResultCard title="חוזקות משותפות" icon={TrendingUp} gradient="from-green-900/60 to-emerald-900/60">
                      <div className="space-y-4">
                        {compatibilityResults.compatibility.shared_strengths.map((strength, idx) => (
                          <div key={idx} className="bg-green-950/40 rounded-lg p-5">
                            <h3 className="text-green-200 font-bold text-lg mb-2">✓ {strength.strength}</h3>
                            <p className="text-green-100 leading-relaxed mb-3">{strength.description}</p>
                            {strength.how_to_leverage && (
                              <div className="bg-green-900/40 rounded p-3">
                                <p className="text-green-300 text-sm font-semibold mb-1">איך למנף:</p>
                                <p className="text-green-100 text-sm">{strength.how_to_leverage}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ResultCard>
                  )}

                  {compatibilityResults.compatibility.potential_challenges?.length > 0 && (
                    <ResultCard title="אתגרים פוטנציאליים" icon={AlertCircle} gradient="from-orange-900/60 to-amber-900/60">
                      <div className="space-y-4">
                        {compatibilityResults.compatibility.potential_challenges.map((challenge, idx) => (
                          <div key={idx} className="bg-orange-950/40 rounded-lg p-5">
                            <h3 className="text-orange-200 font-bold text-lg mb-2">⚠️ {challenge.challenge}</h3>
                            <p className="text-orange-100 leading-relaxed mb-3">{challenge.description}</p>
                            {challenge.how_to_overcome && (
                              <div className="bg-orange-900/40 rounded p-3">
                                <p className="text-orange-300 text-sm font-semibold mb-1">איך להתגבר:</p>
                                <p className="text-orange-100 text-sm">{challenge.how_to_overcome}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </ResultCard>
                  )}

                  {compatibilityResults.compatibility.practical_advice?.length > 0 && (
                    <ResultCard title="עצות מעשיות" icon={Sparkles} gradient="from-blue-900/60 to-cyan-900/60">
                      <ul className="space-y-3">
                        {compatibilityResults.compatibility.practical_advice.map((advice, idx) => (
                          <li key={idx} className="flex items-start gap-3 bg-blue-950/40 rounded-lg p-4">
                            <span className="text-blue-400 font-bold shrink-0">{idx + 1}.</span>
                            <span className="text-blue-100">{advice}</span>
                          </li>
                        ))}
                      </ul>
                    </ResultCard>
                  )}

                  {compatibilityResults.compatibility.life_areas_analysis && (
                    <div className="grid md:grid-cols-2 gap-6">
                      {compatibilityResults.compatibility.life_areas_analysis.communication && (
                        <Card className="bg-indigo-900/50 border-indigo-700/30">
                          <CardContent className="p-6">
                            <h3 className="text-indigo-200 font-bold text-lg mb-3">💬 תקשורת</h3>
                            <p className="text-indigo-100 leading-relaxed">
                              {compatibilityResults.compatibility.life_areas_analysis.communication}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      {compatibilityResults.compatibility.life_areas_analysis.romance && (
                        <Card className="bg-pink-900/50 border-pink-700/30">
                          <CardContent className="p-6">
                            <h3 className="text-pink-200 font-bold text-lg mb-3">💖 רומנטיקה</h3>
                            <p className="text-pink-100 leading-relaxed">
                              {compatibilityResults.compatibility.life_areas_analysis.romance}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                      {compatibilityResults.compatibility.life_areas_analysis.work_collaboration && (
                        <Card className="bg-blue-900/50 border-blue-700/30">
                          <CardContent className="p-6">
                            <h3 className="text-blue-200 font-bold text-lg mb-3">💼 עבודה משותפת</h3>
                            <p className="text-blue-100 leading-relaxed">
                              {compatibilityResults.compatibility.life_areas_analysis.work_collaboration}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}

                  {compatibilityResults.compatibility.long_term_potential && (
                    <ResultCard title="פוטנציאל לטווח ארוך" icon={TrendingUp} gradient="from-violet-900/60 to-purple-900/60">
                      <div className="bg-violet-950/50 rounded-lg p-6 mb-4">
                        <Badge className={`text-lg px-4 py-2 ${
                          compatibilityResults.compatibility.long_term_potential.prognosis === 'excellent' ? 'bg-green-600' :
                          compatibilityResults.compatibility.long_term_potential.prognosis === 'very_good' ? 'bg-blue-600' :
                          compatibilityResults.compatibility.long_term_potential.prognosis === 'good' ? 'bg-cyan-600' :
                          compatibilityResults.compatibility.long_term_potential.prognosis === 'moderate' ? 'bg-yellow-600' :
                          'bg-orange-600'
                        } text-white`}>
                          {compatibilityResults.compatibility.long_term_potential.prognosis === 'excellent' && '🌟 מצוין'}
                          {compatibilityResults.compatibility.long_term_potential.prognosis === 'very_good' && '✨ טוב מאוד'}
                          {compatibilityResults.compatibility.long_term_potential.prognosis === 'good' && '👍 טוב'}
                          {compatibilityResults.compatibility.long_term_potential.prognosis === 'moderate' && '⚖️ בינוני'}
                          {compatibilityResults.compatibility.long_term_potential.prognosis === 'challenging' && '⚠️ מאתגר'}
                        </Badge>
                      </div>
                      <p className="text-white leading-relaxed text-lg mb-4">
                        {compatibilityResults.compatibility.long_term_potential.analysis}
                      </p>
                      {compatibilityResults.compatibility.long_term_potential.key_success_factors?.length > 0 && (
                        <div className="bg-green-950/40 rounded-lg p-4">
                          <p className="text-green-300 font-semibold mb-2">🔑 גורמי הצלחה:</p>
                          <ul className="space-y-1">
                            {compatibilityResults.compatibility.long_term_potential.key_success_factors.map((factor, idx) => (
                              <li key={idx} className="text-green-100 text-sm">✓ {factor}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </ResultCard>
                  )}

                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        setCompatibilityResults(null);
                        setFormData({ fullName: "", birthDate: "", person2: { fullName: "", birthDate: "" } });
                        setFormErrors({});
                      }}
                      className="bg-gray-800 text-white border-2 border-pink-700 hover:bg-gray-700 text-lg px-8 py-6 rounded-xl"
                    >
                      <Users className="w-5 h-5 ml-2" />
                      בדוק התאמה חדשה
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