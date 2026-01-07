import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Heart, TrendingUp, User, Info, BookOpen, AlertTriangle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import { MysticalLoader } from "@/components/LoadingStates";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import ExplainableInsight from "@/components/ExplainableInsight";
import ConfidenceBadge from "@/components/ConfidenceBadge";

export default function Compatibility() {
  const [step, setStep] = useState(1);
  const [compatibilityType, setCompatibilityType] = useState("romantic");
  const [person1Data, setPerson1Data] = useState({
    name: "",
    birthDate: "",
    birthTime: ""
  });
  const [person2Data, setPerson2Data] = useState({
    name: "",
    birthDate: "",
    birthTime: ""
  });
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const queryClient = useQueryClient();
  const { incrementUsage, subscription } = useSubscription();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  const { data: guestProfiles } = useQuery({
    queryKey: ['guestProfiles'],
    queryFn: () => base44.entities.GuestProfile.list(),
    initialData: []
  });

  const analyzeCompatibilityMutation = useMutation({
    mutationFn: async ({ person1, person2, compType }) => {
      const prompt = `אתה מומחה עולמי בניתוח התאמה זוגית/עסקית/משפחתית, משלב נומרולוגיה, אסטרולוגיה, קבלה ופסיכולוגיה יונגיאנית.

**עקרונות יסוד קריטיים:**

1. **פוטנציאלים של מערכת יחסים**: הניתוח מתאר **פוטנציאלים ודינמיקות** של המערכת, לא גורל קבוע. הבחירה ועבודת הזוג/שותפים משפיעה באופן עצום.

2. **התמודדות עם אפקט פורר**:
   - הימנע מהצהרות כלליות ("אתם זוג מתאים")
   - היה **ספציפי**: "מספר נתיב החיים 3 של אדם 1 ביחד עם מספר 6 של אדם 2 יוצרים..."
   - כל תובנה מעוגנת ב**נתונים ספציפיים של שני האנשים**

3. **ניתוח השוואתי מעמיק**:
   - **עקביות**: איפה האנרגיות משלימות/תומכות?
   - **חיכוכים**: איפה יש פוטנציאל לקונפליקט?
   - **הזדמנויות לצמיחה**: מה כל אחד יכול ללמוד מהשני?

4. **מבוסס מדע ומחקר**:
   - התבסס על מחקרי נומרולוגיה, אסטרולוגיה וסינרגיה
   - הכר בגבולות הידע
   - ציין מקורות כשאפשר

5. **איזון - חוזקות ואתגרים**:
   - אל תהיה רק חיובי או שלילי
   - הצג את **שני הצדדים**: "יש אתגר ב-X, אך זה יכול להיות הזדמנות ל-Y"

---

**נתונים:**

**אדם 1:**
- שם: ${person1.name}
- תאריך לידה: ${person1.birthDate}
${person1.birthTime ? `- שעת לידה: ${person1.birthTime}` : ''}

**אדם 2:**
- שם: ${person2.name}
- תאריך לידה: ${person2.birthDate}
${person2.birthTime ? `- שעת לידה: ${person2.birthTime}` : ''}

**סוג ההתאמה:** ${compType === 'romantic' ? 'זוגית/רומנטית' : compType === 'business' ? 'עסקית' : compType === 'friendship' ? 'חברות' : 'משפחתית'}

---

**בצע ניתוח מפורט הכולל:**

1. **חישובי נומרולוגיה**:
   - מספר נתיב חיים לכל אחד
   - מספר ביטוי (אם יש שם מלא)
   - התאמה נומרולוגית (0-100)

2. **חישובי אסטרולוגיה** (אם יש שעות לידה):
   - מזלות שמש
   - התאמה אלמנטלית
   - אספקטים אפשריים

3. **ציון התאמה כולל** (0-100) עם הסבר מפורט

4. **תחומי עוצמה במערכת היחסים** - 3-5 תחומים עם תיאור

5. **אתגרים פוטנציאליים** - 3-5 אתגרים עם הסבר והמלצות

6. **המלצות מעשיות** - 5-7 המלצות ספציפיות לחיזוק המערכת

7. **תובנות עמוקות (insights)** - 5-8 תובנות:
   - title
   - content (150-200 מילים)
   - insight_type: synergy/challenge/growth_opportunity/communication_style/conflict_resolution/shared_purpose
   - confidence (0-1)
   - weight (0-1)
   - provenance מלא
   - tags

8. **אזהרת אפקט פורר**: הסבר שהניתוח מבוסס על נתונים **ספציפיים** של שני האנשים

**החזר JSON מובנה.**`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            numerology_analysis: {
              type: "object",
              properties: {
                person1_life_path: { type: "number" },
                person2_life_path: { type: "number" },
                compatibility_score: { type: "number", minimum: 0, maximum: 100 },
                interpretation: { type: "string" }
              }
            },
            astrology_analysis: {
              type: "object",
              properties: {
                person1_sun_sign: { type: "string" },
                person2_sun_sign: { type: "string" },
                element_harmony: { type: "string" },
                compatibility_score: { type: "number", minimum: 0, maximum: 100 },
                interpretation: { type: "string" }
              }
            },
            overall_compatibility_score: { type: "number", minimum: 0, maximum: 100 },
            overall_summary: { type: "string" },
            strength_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  area: { type: "string" },
                  description: { type: "string" },
                  specific_evidence: { type: "array", items: { type: "string" } }
                }
              }
            },
            challenge_areas: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  challenge: { type: "string" },
                  description: { type: "string" },
                  recommendations: { type: "array", items: { type: "string" } }
                }
              }
            },
            practical_recommendations: {
              type: "array",
              items: { type: "string" }
            },
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string" },
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
            barnum_effect_disclaimer: { type: "string" },
            confidence_level: { type: "number", minimum: 0, maximum: 1 }
          }
        }
      });

      return result;
    }
  });

  const saveCompatibilityMutation = useMutation({
    mutationFn: (data) => base44.entities.CompatibilityAnalysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compatibilityAnalyses'] });
    }
  });

  const handleAnalyze = async () => {
    if (!person1Data.name || !person1Data.birthDate || !person2Data.name || !person2Data.birthDate) {
      toast.error('נא למלא את כל השדות הנדרשים');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await analyzeCompatibilityMutation.mutateAsync({
        person1: person1Data,
        person2: person2Data,
        compType: compatibilityType
      });

      setResults(result);

      const confidence = Math.round((result.confidence_level || 0.85) * 100);

      await saveCompatibilityMutation.mutateAsync({
        person1_name: person1Data.name,
        person2_name: person2Data.name,
        person1_data: person1Data,
        person2_data: person2Data,
        compatibility_type: compatibilityType,
        overall_score: result.overall_compatibility_score,
        numerology_compatibility: result.numerology_analysis,
        astrology_compatibility: result.astrology_analysis,
        strengths: result.strength_areas?.map(s => s.area) || [],
        challenges: result.challenge_areas?.map(c => c.challenge) || [],
        recommendations: result.practical_recommendations || [],
        detailed_analysis: result.overall_summary,
        confidence_score: confidence
      });

      await incrementUsage();

      setStep(2);
      toast.success('ניתוח ההתאמה הושלם! 💕');
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      toast.error('אירעה שגיאה בניתוח');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadFromProfile = (profileData, targetPerson) => {
    if (targetPerson === 1) {
      setPerson1Data({
        name: profileData.full_name_hebrew || profileData.full_name || '',
        birthDate: profileData.birth_date || '',
        birthTime: profileData.birth_time || ''
      });
    } else {
      setPerson2Data({
        name: profileData.full_name || profileData.full_name_hebrew || '',
        birthDate: profileData.birth_date || '',
        birthTime: profileData.birth_time || ''
      });
    }
  };

  if (isAnalyzing) {
    return <MysticalLoader message="בודק את ההתאמה ביניכם..." />;
  }

  const isPremium = subscription && ['premium', 'enterprise'].includes(subscription.plan_type);

  return (
    <SubscriptionGuard toolName="ניתוח התאמה">
      <div className="min-h-screen bg-gradient-to-br from-pink-950 via-rose-950 to-pink-900 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="התאמה בזוגיות"
            description="גלו את הפוטנציאל המשותף שלכם"
            icon={Users}
            iconGradient="from-pink-500 to-rose-500"
          />

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {/* Educational Card */}
                <Card className="bg-pink-900/50 backdrop-blur-xl border-pink-700/50 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <BookOpen className="w-6 h-6 text-pink-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-pink-200 font-bold text-lg mb-3">איך זה עובד?</h3>
                        <div className="space-y-2 text-pink-100 text-sm leading-relaxed">
                          <p>
                            ניתוח התאמה משלב <strong>נומרולוגיה ואסטרולוגיה</strong> כדי לבחון את 
                            הדינמיקות והפוטנציאלים של מערכת היחסים ביניכם.
                          </p>
                          <p className="mt-2">
                            <strong className="text-yellow-300">חשוב להבין:</strong> הניתוח מציג <strong>פוטנציאלים</strong> 
                            של המערכת, לא גורל קבוע. <strong>עבודת הזוג</strong> והמחויבות שלכם הן המכריעות.
                          </p>
                          <p className="mt-2">
                            נבחן <strong>חוזקות</strong> (איפה אתם משלימים), <strong>אתגרים</strong> (איפה צריך 
                            תשומת לב), ו<strong>הזדמנויות לצמיחה</strong> משותפת.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 backdrop-blur-xl border-2 border-pink-700 shadow-2xl">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-white mb-6 text-center">
                      מי אתם?
                    </h2>

                    {/* Compatibility Type */}
                    <div className="mb-8">
                      <Label className="text-white text-lg mb-3 block">סוג ההתאמה:</Label>
                      <Select value={compatibilityType} onValueChange={setCompatibilityType}>
                        <SelectTrigger className="bg-pink-800/30 border-pink-700 text-white text-lg h-14">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="romantic">זוגית/רומנטית 💕</SelectItem>
                          <SelectItem value="business">עסקית 💼</SelectItem>
                          <SelectItem value="friendship">חברות 🤝</SelectItem>
                          <SelectItem value="family">משפחתית 👨‍👩‍👧</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Person 1 */}
                      <div className="space-y-4 bg-pink-800/20 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <User className="w-6 h-6" />
                          אדם ראשון
                        </h3>

                        {/* Load from profile buttons */}
                        {userProfile && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => loadFromProfile(userProfile, 1)}
                            className="w-full border-pink-600 text-pink-200 hover:bg-pink-800/30 mb-4"
                          >
                            טען מהפרופיל שלי
                          </Button>
                        )}

                        <div className="space-y-3">
                          <Label className="text-white">שם מלא:</Label>
                          <Input
                            value={person1Data.name}
                            onChange={(e) => setPerson1Data({...person1Data, name: e.target.value})}
                            placeholder="למשל: דני כהן"
                            className="bg-pink-800/30 border-pink-700 text-white"
                            dir="rtl"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-white">תאריך לידה:</Label>
                          <Input
                            type="date"
                            value={person1Data.birthDate}
                            onChange={(e) => setPerson1Data({...person1Data, birthDate: e.target.value})}
                            className="bg-pink-800/30 border-pink-700 text-white"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-white">שעת לידה (אופציונלי):</Label>
                          <Input
                            type="time"
                            value={person1Data.birthTime}
                            onChange={(e) => setPerson1Data({...person1Data, birthTime: e.target.value})}
                            className="bg-pink-800/30 border-pink-700 text-white"
                          />
                        </div>
                      </div>

                      {/* Person 2 */}
                      <div className="space-y-4 bg-rose-800/20 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                          <User className="w-6 h-6" />
                          אדם שני
                        </h3>

                        {/* Load from guest profiles */}
                        {guestProfiles.length > 0 && (
                          <Select onValueChange={(value) => {
                            const profile = guestProfiles.find(p => p.id === value);
                            if (profile) loadFromProfile(profile, 2);
                          }}>
                            <SelectTrigger className="w-full border-rose-600 text-rose-200 bg-rose-800/30 mb-4">
                              <SelectValue placeholder="טען מפרופיל אורח" />
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

                        <div className="space-y-3">
                          <Label className="text-white">שם מלא:</Label>
                          <Input
                            value={person2Data.name}
                            onChange={(e) => setPerson2Data({...person2Data, name: e.target.value})}
                            placeholder="למשל: שרה לוי"
                            className="bg-rose-800/30 border-rose-700 text-white"
                            dir="rtl"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-white">תאריך לידה:</Label>
                          <Input
                            type="date"
                            value={person2Data.birthDate}
                            onChange={(e) => setPerson2Data({...person2Data, birthDate: e.target.value})}
                            className="bg-rose-800/30 border-rose-700 text-white"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label className="text-white">שעת לידה (אופציונלי):</Label>
                          <Input
                            type="time"
                            value={person2Data.birthTime}
                            onChange={(e) => setPerson2Data({...person2Data, birthTime: e.target.value})}
                            className="bg-rose-800/30 border-rose-700 text-white"
                          />
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleAnalyze}
                      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white text-xl py-7 mt-8"
                    >
                      <Heart className="w-6 h-6 ml-2" />
                      בדוק את ההתאמה
                    </Button>
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
                {/* Header Card */}
                <Card className="bg-gradient-to-r from-pink-900/50 to-rose-900/50 backdrop-blur-xl border-pink-700/30">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">
                      💕 ניתוח ההתאמה שלכם 💕
                    </h2>
                    <div className="text-2xl text-pink-200 mb-2">
                      {person1Data.name} & {person2Data.name}
                    </div>
                    <Badge className="bg-pink-700 text-white text-lg px-6 py-2">
                      {compatibilityType === 'romantic' && 'זוגיות רומנטית'}
                      {compatibilityType === 'business' && 'שותפות עסקית'}
                      {compatibilityType === 'friendship' && 'חברות'}
                      {compatibilityType === 'family' && 'קשר משפחתי'}
                    </Badge>
                    <div className="flex justify-center gap-4 mt-6">
                      <ConfidenceBadge
                        score={results.confidence_level}
                        details={{
                          input_quality: 1.0,
                          calculation_confidence: results.confidence_level || 0.85,
                          data_completeness: (person1Data.birthTime && person2Data.birthTime) ? 1.0 : 0.8,
                          notes: "ניתוח מבוסס נומרולוגיה ואסטרולוגיה"
                        }}
                        size="large"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Barnum Effect Disclaimer */}
                {results.barnum_effect_disclaimer && (
                  <Card className="bg-blue-900/50 border-blue-700/50">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <Info className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                        <div>
                          <h3 className="text-blue-200 font-bold text-lg mb-2">חשוב לדעת</h3>
                          <p className="text-blue-100 text-sm leading-relaxed">
                            {results.barnum_effect_disclaimer}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Overall Score */}
                <Card className="bg-gradient-to-br from-pink-600 to-rose-600 border-none shadow-2xl">
                  <CardContent className="p-12 text-center">
                    <div className="text-8xl font-bold text-white mb-4">
                      {results.overall_compatibility_score}%
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">ציון התאמה כולל</h3>
                    <p className="text-xl text-pink-100 leading-relaxed">
                      {results.overall_summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Numerology & Astrology Analysis */}
                <div className="grid md:grid-cols-2 gap-6">
                  {results.numerology_analysis && (
                    <ResultCard title="🔢 נומרולוגיה" gradient="from-purple-900/50 to-indigo-900/50">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-purple-200">מספר נתיב חיים:</span>
                          <Badge className="bg-purple-700 text-white">
                            {results.numerology_analysis.person1_life_path} & {results.numerology_analysis.person2_life_path}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-purple-200">התאמה נומרולוגית:</span>
                          <Badge className="bg-purple-700 text-white text-lg">
                            {results.numerology_analysis.compatibility_score}%
                          </Badge>
                        </div>
                        <p className="text-white leading-relaxed mt-4">
                          {results.numerology_analysis.interpretation}
                        </p>
                      </div>
                    </ResultCard>
                  )}

                  {results.astrology_analysis && (
                    <ResultCard title="⭐ אסטרולוגיה" gradient="from-indigo-900/50 to-blue-900/50">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-indigo-200">מזלות שמש:</span>
                          <Badge className="bg-indigo-700 text-white">
                            {results.astrology_analysis.person1_sun_sign} & {results.astrology_analysis.person2_sun_sign}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-indigo-200">התאמה אסטרולוגית:</span>
                          <Badge className="bg-indigo-700 text-white text-lg">
                            {results.astrology_analysis.compatibility_score}%
                          </Badge>
                        </div>
                        <p className="text-white leading-relaxed mt-4">
                          {results.astrology_analysis.interpretation}
                        </p>
                      </div>
                    </ResultCard>
                  )}
                </div>

                {/* Strength Areas */}
                {results.strength_areas && results.strength_areas.length > 0 && (
                  <ResultCard title="💪 תחומי עוצמה במערכת" gradient="from-green-900/50 to-emerald-700/50" icon={CheckCircle}>
                    <div className="space-y-6">
                      {results.strength_areas.map((strength, idx) => (
                        <div key={idx} className="bg-green-800/30 rounded-xl p-6">
                          <h3 className="text-2xl font-bold text-green-200 mb-3">{strength.area}</h3>
                          <p className="text-green-100 leading-relaxed mb-4">{strength.description}</p>
                          {strength.specific_evidence && strength.specific_evidence.length > 0 && (
                            <div className="border-t border-green-700/30 pt-4">
                              <p className="text-green-200 text-sm mb-2">ראיות ספציפיות:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {strength.specific_evidence.map((evidence, i) => (
                                  <li key={i} className="text-green-100 text-sm">{evidence}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Challenge Areas */}
                {results.challenge_areas && results.challenge_areas.length > 0 && (
                  <ResultCard title="⚡ אתגרים פוטנציאליים" gradient="from-amber-900/50 to-orange-700/50" icon={AlertTriangle}>
                    <div className="space-y-6">
                      {results.challenge_areas.map((challenge, idx) => (
                        <div key={idx} className="bg-amber-800/30 rounded-xl p-6">
                          <h3 className="text-2xl font-bold text-amber-200 mb-3">{challenge.challenge}</h3>
                          <p className="text-amber-100 leading-relaxed mb-4">{challenge.description}</p>
                          {challenge.recommendations && challenge.recommendations.length > 0 && (
                            <div className="bg-amber-900/30 rounded-lg p-4">
                              <p className="text-amber-200 font-semibold mb-2">המלצות:</p>
                              <ul className="list-disc list-inside space-y-1">
                                {challenge.recommendations.map((rec, i) => (
                                  <li key={i} className="text-amber-100 text-sm">{rec}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Deep Insights */}
                {results.insights && results.insights.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-3xl font-bold text-white">💎 תובנות עמוקות</h2>
                    {results.insights.map((insight, idx) => (
                      <ExplainableInsight key={idx} insight={insight} showProvenance={isPremium} />
                    ))}
                  </div>
                )}

                {/* Practical Recommendations */}
                {results.practical_recommendations && results.practical_recommendations.length > 0 && (
                  <ResultCard title="🌱 המלצות מעשיות" gradient="from-teal-900/50 to-cyan-700/50" icon={TrendingUp}>
                    <ul className="space-y-4">
                      {results.practical_recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-teal-800/30 rounded-lg p-4">
                          <span className="text-teal-400 font-bold text-lg shrink-0">{idx + 1}.</span>
                          <span className="text-teal-100 leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </ResultCard>
                )}

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => {
                      setStep(1);
                      setResults(null);
                    }}
                    variant="outline"
                    className="border-pink-500 text-pink-300 hover:bg-pink-800/30 text-lg px-8 py-4"
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