import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import EnhancedToast from "./EnhancedToast";
import { 
  Heart, 
  Target, 
  Sparkles, 
  ArrowLeft, 
  ArrowRight,
  Hash,
  Stars,
  Hand,
  PenTool,
  Layers,
  CheckCircle,
  Loader2,
  Moon
} from "lucide-react";

const STEPS = [
  { id: 1, title: "ברוכים הבאים", icon: Heart },
  { id: 2, title: "ספר לי עליך", icon: Target },
  { id: 3, title: "מה מעניין אותך", icon: Sparkles },
  { id: 4, "title": "בוא נתחיל", icon: CheckCircle }
];

const DISCIPLINES = [
  { id: "numerology", name: "נומרולוגיה", description: "המספרים שלך", icon: Hash, color: "purple" },
  { id: "astrology", name: "אסטרולוגיה", description: "הכוכבים שלך", icon: Stars, color: "indigo" },
  { id: "palmistry", name: "כף יד", description: "הקווים בידיים", icon: Hand, color: "blue" },
  { id: "graphology", name: "גרפולוגיה", description: "הכתב שלך", icon: PenTool, color: "green" },
  { id: "tarot", name: "טארוט", description: "הקלפים", icon: Layers, color: "amber" },
  { id: "drawing_analysis", name: "ניתוח ציורים", description: "הציורים שלך", icon: PenTool, color: "pink" }
];

const FOCUS_AREAS = [
  { id: "career", name: "קריירה ועבודה", emoji: "💼" },
  { id: "relationships", name: "יחסים ואהבה", emoji: "❤️" },
  { id: "personal_growth", name: "התפתחות אישית", emoji: "🌱" },
  { id: "spirituality", name: "רוחניות", emoji: "🙏" },
  { id: "health", name: "בריאות ואיזון", emoji: "💪" },
  { id: "creativity", name: "יצירתיות", emoji: "🎨" },
  { id: "life_purpose", name: "ייעוד וחזון", emoji: "🌟" }
];

export default function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    full_name_hebrew: "",
    birth_date: "",
    birth_time: "",
    birth_place_name: "",
    preferred_disciplines: [],
    focus_areas: [],
    personal_goals: []
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleDiscipline = (id) => {
    setFormData(prev => ({
      ...prev,
      preferred_disciplines: prev.preferred_disciplines.includes(id)
        ? prev.preferred_disciplines.filter(d => d !== id)
        : [...prev.preferred_disciplines, id]
    }));
  };

  const toggleFocusArea = (id) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(id)
        ? prev.focus_areas.filter(f => f !== id)
        : [...prev.focus_areas, id]
    }));
  };

  const handleComplete = async () => {
    if (!formData.full_name_hebrew || !formData.birth_date) {
      EnhancedToast.error("נא למלא את כל השדות הנדרשים");
      return;
    }

    if (formData.preferred_disciplines.length === 0) {
      EnhancedToast.error("בחר לפחות כלי אחד שמעניין אותך");
      return;
    }

    if (formData.focus_areas.length === 0) {
      EnhancedToast.error("בחר לפחות תחום אחד שמעניין אותך");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create user profile
      const profileData = {
        ...formData,
        onboarding_completed: true,
        profile_completion_score: calculateCompletionScore(formData),
        ai_suggestions_enabled: true
      };

      await base44.entities.UserProfile.create(profileData);

      // Generate first personalized journey
      try {
        await base44.functions.invoke('generatePersonalizedJourney', {
          journey_type: 'daily',
          focus_area: formData.focus_areas[0]
        });
      } catch (journeyError) {
        console.warn('Failed to generate journey:', journeyError);
        // Continue even if journey generation fails
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });

      EnhancedToast.success('ברוך הבא למסע! 🎉', 'כל המידע נשמר בהצלחה');

      // Reload to show home page
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('Onboarding error:', error);
      EnhancedToast.error('שגיאה בשמירת הנתונים', 'אנא נסה שוב');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCompletionScore = (data) => {
    let score = 0;
    if (data.full_name_hebrew) score += 20;
    if (data.birth_date) score += 20;
    if (data.birth_time) score += 10;
    if (data.preferred_disciplines.length > 0) score += 25;
    if (data.focus_areas.length > 0) score += 25;
    return score;
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true;
      case 2:
        return formData.full_name_hebrew && formData.birth_date;
      case 3:
        return formData.preferred_disciplines.length > 0 && formData.focus_areas.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-pink-950 to-purple-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 1 + 'px',
              height: Math.random() * 3 + 1 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl w-full relative z-10">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isComplete = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1">
                  <motion.div
                    className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                      isComplete 
                        ? 'bg-green-500' 
                        : isActive 
                        ? 'bg-purple-500' 
                        : 'bg-gray-700'
                    }`}
                    animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <span className={`text-xs md:text-sm text-center ${
                    isActive ? 'text-white font-bold' : 'text-gray-300'
                  }`}>
                    {step.title}
                  </span>
                  {idx < STEPS.length - 1 && (
                    <div className={`hidden md:block absolute h-1 top-6 ${
                      isComplete ? 'bg-green-500' : 'bg-gray-700'
                    }`} 
                    style={{ 
                      left: `${(idx / STEPS.length) * 100 + 8}%`, 
                      width: `${100 / STEPS.length - 8}%` 
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="bg-gray-900/90 backdrop-blur-xl border-2 border-purple-600/50 shadow-2xl">
              <CardHeader>
                <CardTitle className="text-3xl md:text-4xl text-white text-center">
                  {currentStep === 1 && "שלום! איזה כיף שהגעת 💜"}
                  {currentStep === 2 && "בוא נכיר 🌟"}
                  {currentStep === 3 && "מה מושך אותך? ✨"}
                  {currentStep === 4 && "אתה מוכן להתחיל! 🚀"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8">
                {/* Step 1: Welcome */}
                {currentStep === 1 && (
                  <div className="text-center space-y-6">
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="inline-block"
                    >
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-6">
                        <Moon className="w-16 h-16 text-white" />
                      </div>
                    </motion.div>
                    <h2 className="text-2xl md:text-3xl text-white font-bold mb-4">
                      ברוכים הבאים למסע פנימה
                    </h2>
                    <p className="text-xl text-purple-200 leading-relaxed max-w-2xl mx-auto">
                      המקום שלך לגלות מי אתה באמת, להבין את הדרך שלך, ולהתחבר לעצמך בצורה עמוקה יותר
                    </p>
                    <div className="bg-purple-900/40 rounded-xl p-6 mt-8">
                      <p className="text-purple-100 text-lg">
                        בעוד כמה דקות תקבל מסע אישי מותאם בדיוק בשבילך 🎯
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 2: Basic Info */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <p className="text-purple-200 text-center text-lg mb-8">
                      בוא נתחיל בבסיס - מי אתה ומתי נולדת
                    </p>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-white text-lg font-semibold mb-2 block">
                          איך קוראים לך? *
                        </Label>
                        <Input
                          id="name"
                          value={formData.full_name_hebrew}
                          onChange={(e) => setFormData({ ...formData, full_name_hebrew: e.target.value })}
                          placeholder="השם המלא שלך בעברית"
                          className="bg-gray-800 border-purple-500 text-white text-lg h-14"
                          dir="rtl"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="birthdate" className="text-white text-lg font-semibold mb-2 block">
                          מתי נולדת? *
                        </Label>
                        <Input
                          id="birthdate"
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="bg-gray-800 border-purple-500 text-white text-lg h-14"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="birthtime" className="text-white text-lg font-semibold mb-2 block">
                          באיזה שעה נולדת? (לא חובה)
                        </Label>
                        <Input
                          id="birthtime"
                          type="time"
                          value={formData.birth_time}
                          onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                          className="bg-gray-800 border-purple-500 text-white text-lg h-14"
                        />
                        <p className="text-purple-300 text-sm mt-2">
                          💡 שעת הלידה חשובה לניתוחים אסטרולוגיים מדויקים
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="birthplace" className="text-white text-lg font-semibold mb-2 block">
                          איפה נולדת? (לא חובה)
                        </Label>
                        <Input
                          id="birthplace"
                          value={formData.birth_place_name || ''}
                          onChange={(e) => setFormData({ ...formData, birth_place_name: e.target.value })}
                          placeholder="למשל: תל אביב, ישראל"
                          className="bg-gray-800 border-purple-500 text-white text-lg h-14"
                          dir="rtl"
                        />
                        <p className="text-purple-300 text-sm mt-2">
                          🌍 מקום הלידה חשוב לחישובים אסטרולוגיים מדויקים
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Preferences */}
                {currentStep === 3 && (
                  <div className="space-y-8">
                    {/* Disciplines */}
                    <div>
                      <h3 className="text-white text-2xl font-bold mb-4 text-center">
                        אילו כלים מעניינים אותך?
                      </h3>
                      <p className="text-purple-200 text-center mb-6">
                        בחר לפחות כלי אחד (אפשר יותר!)
                      </p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {DISCIPLINES.map((discipline) => {
                          const Icon = discipline.icon;
                          const isSelected = formData.preferred_disciplines.includes(discipline.id);
                          
                          return (
                            <motion.button
                              key={discipline.id}
                              onClick={() => toggleDiscipline(discipline.id)}
                              className={`p-6 rounded-xl border-2 transition-all text-right ${
                                isSelected
                                  ? `bg-${discipline.color}-600 border-${discipline.color}-400`
                                  : 'bg-gray-800 border-gray-600 hover:border-purple-500'
                              }`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <div className="flex items-start gap-3">
                                <Icon className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-purple-400'}`} />
                                <div className="flex-1">
                                  <h4 className="text-white font-bold text-lg mb-1">{discipline.name}</h4>
                                  <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                                    {discipline.description}
                                  </p>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="w-6 h-6 text-white" />
                                )}
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Focus Areas */}
                    <div>
                      <h3 className="text-white text-2xl font-bold mb-4 text-center">
                        על מה אתה רוצה להתמקד?
                      </h3>
                      <p className="text-purple-200 text-center mb-6">
                        בחר את התחומים שהכי חשובים לך
                      </p>
                      <div className="grid md:grid-cols-2 gap-3">
                        {FOCUS_AREAS.map((area) => {
                          const isSelected = formData.focus_areas.includes(area.id);
                          
                          return (
                            <motion.button
                              key={area.id}
                              onClick={() => toggleFocusArea(area.id)}
                              className={`p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                isSelected
                                  ? 'bg-pink-600 border-pink-400'
                                  : 'bg-gray-800 border-gray-600 hover:border-pink-500'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="text-3xl">{area.emoji}</span>
                              <span className="text-white font-semibold text-lg flex-1 text-right">
                                {area.name}
                              </span>
                              {isSelected && (
                                <CheckCircle className="w-5 h-5 text-white" />
                              )}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Ready */}
                {currentStep === 4 && (
                  <div className="text-center space-y-6">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
                    </motion.div>
                    <h2 className="text-3xl text-white font-bold mb-4">
                      מעולה! אתה מוכן להתחיל 🎉
                    </h2>
                    <div className="bg-purple-900/40 rounded-xl p-6 space-y-4">
                      <p className="text-purple-100 text-xl">
                        עכשיו אנחנו יוצרים בשבילך:
                      </p>
                      <ul className="text-purple-200 text-lg space-y-2">
                        <li>✨ מסע אישי מותאם בדיוק בשבילך</li>
                        <li>🎯 המלצות על כלים שיתאימו לך</li>
                        <li>💡 תובנות יומיות מבוססות על הפרופיל שלך</li>
                        <li>🌟 מעקב אחרי ההתקדמות שלך</li>
                      </ul>
                    </div>
                    <p className="text-purple-300 text-lg">
                      לוקח כמה שניות... 🚀
                    </p>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-purple-700">
                  {currentStep > 1 && (
                    <Button
                      onClick={handleBack}
                      variant="outline"
                      className="border-purple-500 text-purple-300 hover:bg-purple-900"
                      disabled={isSubmitting}
                    >
                      <ArrowRight className="w-5 h-5 ml-2" />
                      חזור
                    </Button>
                  )}
                  
                  <div className="flex-1" />

                  {currentStep < STEPS.length ? (
                    <Button
                      onClick={handleNext}
                      disabled={!canProceed() || isSubmitting}
                      className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
                    >
                      המשך
                      <ArrowLeft className="w-5 h-5 mr-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleComplete}
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                          יוצר את המסע שלך...
                        </>
                      ) : (
                        <>
                          בוא נתחיל! 🚀
                          <Sparkles className="w-5 h-5 mr-2" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}