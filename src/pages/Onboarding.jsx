import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, User, Clock, CheckCircle, Info, Shield, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import EnhancedToast from "@/components/EnhancedToast";
import PageHeader from "@/components/PageHeader";

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    full_name_hebrew: "",
    birth_date: "",
    birth_time: "",
    birth_place_name: "",
    birth_place_lat: null,
    birth_place_lon: null,
    timezone_offset: 2,
    gender: "",
    has_consented_to_terms: false,
    has_understood_potentials: false
  });

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: existingProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user
  });

  useEffect(() => {
    if (existingProfile) {
      navigate(createPageUrl("Home"));
    }
  }, [existingProfile]);

  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.UserProfile.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
    }
  });

  const createSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + 7);

      return await base44.entities.Subscription.create({
        plan_type: "free",
        status: "trial",
        trial_end_date: trialEndDate.toISOString(),
        analyses_limit: 3,
        analyses_used: 0,
        guest_profiles_limit: 1,
        guest_profiles_used: 0,
        auto_renew: false
      });
    }
  });

  const handleNext = () => {
    if (step === 1) {
      if (!formData.full_name_hebrew || !formData.birth_date) {
        EnhancedToast.error('נא למלא את כל השדות הנדרשים');
        return;
      }
    }
    
    if (step === 2) {
      if (!formData.birth_place_name) {
        EnhancedToast.error('נא להזין מקום לידה');
        return;
      }
    }

    if (step === 3) {
      if (!formData.has_consented_to_terms || !formData.has_understood_potentials) {
        EnhancedToast.error('נא לאשר את ההסכמות');
        return;
      }
    }

    setStep(step + 1);
  };

  const handleSubmit = async () => {
    try {
      await createProfileMutation.mutateAsync({
        ...formData,
        consent_date: new Date().toISOString()
      });

      await createSubscriptionMutation.mutateAsync();

      EnhancedToast.success('הפרופיל שלך נוצר בהצלחה! 🎉', {
        description: 'מתחילים את המסע...'
      });

      setTimeout(() => {
        navigate(createPageUrl("Home"));
      }, 1500);
    } catch (error) {
      EnhancedToast.error('אירעה שגיאה ביצירת הפרופיל');
      console.error(error);
    }
  };

  const handlePlaceSearch = async (query) => {
    if (!query || query.length < 3) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const results = await response.json();
      
      if (results.length > 0) {
        const place = results[0];
        setFormData({
          ...formData,
          birth_place_name: place.display_name,
          birth_place_lat: parseFloat(place.lat),
          birth_place_lon: parseFloat(place.lon)
        });
      }
    } catch (error) {
      console.error('Place search error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="ברוך הבא למסע פנימה"
          description="בואו נכיר אותך טוב יותר"
          icon={User}
          iconGradient="from-purple-500 to-indigo-500"
        />

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                  s <= step
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-gray-800 border-gray-600 text-gray-400'
                }`}
              >
                {s < step ? <CheckCircle className="w-6 h-6" /> : s}
              </div>
            ))}
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-purple-900/50 backdrop-blur-xl border-purple-700/50">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">בואו נתחיל - מי אתה?</h3>
                  
                  <div>
                    <Label className="text-purple-200 mb-2">שם מלא בעברית</Label>
                    <Input
                      value={formData.full_name_hebrew}
                      onChange={(e) => setFormData({ ...formData, full_name_hebrew: e.target.value })}
                      placeholder="לדוגמה: יוסף כהן"
                      className="bg-purple-800/30 border-purple-600 text-white"
                      dir="rtl"
                    />
                  </div>

                  <div>
                    <Label className="text-purple-200 mb-2">תאריך לידה</Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-3 w-5 h-5 text-purple-400" />
                      <Input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                        className="bg-purple-800/30 border-purple-600 text-white pr-10"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-purple-200 mb-2">שעת לידה (אופציונלי - אך חשוב לאסטרולוגיה)</Label>
                    <div className="relative">
                      <Clock className="absolute right-3 top-3 w-5 h-5 text-purple-400" />
                      <Input
                        type="time"
                        value={formData.birth_time}
                        onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                        className="bg-purple-800/30 border-purple-600 text-white pr-10"
                      />
                    </div>
                    <p className="text-purple-300 text-xs mt-2">
                      שעת לידה מדויקת נדרשת לחישוב האסצנדנט והבתים באסטרולוגיה
                    </p>
                  </div>

                  <Button
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-lg py-6"
                  >
                    המשך
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-indigo-900/50 backdrop-blur-xl border-indigo-700/50">
                <CardContent className="p-8 space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">איפה נולדת?</h3>
                  
                  <div>
                    <Label className="text-indigo-200 mb-2">מקום לידה</Label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 w-5 h-5 text-indigo-400" />
                      <Input
                        value={formData.birth_place_name}
                        onChange={(e) => {
                          setFormData({ ...formData, birth_place_name: e.target.value });
                          handlePlaceSearch(e.target.value);
                        }}
                        placeholder="לדוגמה: תל אביב, ישראל"
                        className="bg-indigo-800/30 border-indigo-600 text-white pr-10"
                      />
                    </div>
                    <p className="text-indigo-300 text-xs mt-2">
                      מקום הלידה נדרש לחישובים אסטרולוגיים מדויקים
                    </p>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 border-indigo-500 text-indigo-300 hover:bg-indigo-800/30"
                    >
                      חזור
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      המשך
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Ethics & Consent - NEW ENHANCED */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <Card className="bg-blue-900/50 backdrop-blur-xl border-blue-700/50">
                <CardContent className="p-8 space-y-6">
                  <div className="flex items-start gap-3 mb-6">
                    <Shield className="w-8 h-8 text-blue-300 shrink-0 mt-1" />
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">חשוב לדעת לפני שממשיכים</h3>
                      <p className="text-blue-200 text-sm">
                        אנחנו מאמינים בשקיפות מלאה ובגישה אתית לניתוח אישיות
                      </p>
                    </div>
                  </div>

                  {/* Anti-Barnum Effect Education */}
                  <div className="bg-yellow-900/30 border-2 border-yellow-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-300 shrink-0 mt-1" />
                      <div>
                        <h4 className="text-yellow-200 font-bold text-lg mb-3">🎯 מה זה "אפקט ברנום" (Barnum Effect)?</h4>
                        <p className="text-yellow-100 text-sm leading-relaxed mb-3">
                          <strong>אפקט ברנום</strong> הוא תופעה פסיכולוגית שבה אנשים מאמינים שתיאורים כלליים ועמומים 
                          (כמו "אתה אדם חברותי אך לפעמים אתה צריך זמן לעצמך") מתארים אותם באופן אישי, 
                          למרות שהם יכולים להתאים לכמעט כולם.
                        </p>
                        <div className="bg-yellow-800/30 rounded-lg p-4">
                          <p className="text-yellow-200 font-semibold text-sm mb-2">איך אנחנו נמנעים מזה?</p>
                          <ul className="text-yellow-100 text-xs space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                              <span>כל תובנה מבוססת על <strong>לפחות 2-3 נתונים ספציפיים שלך</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                              <span>אנחנו מציינים <strong>בדיוק</strong> אילו נתונים תמכו בכל תובנה</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                              <span>אנחנו מזהים <strong>סתירות</strong> בין כלים ומסבירים אותן</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                              <span>אנחנו מציגים <strong>מקורות מדעיים</strong> לכל טענה</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Potentials Not Destiny */}
                  <div className="bg-purple-900/30 border-2 border-purple-700/50 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-purple-300 shrink-0 mt-1" />
                      <div>
                        <h4 className="text-purple-200 font-bold text-lg mb-3">🌟 פוטנציאלים, לא גורל קבוע</h4>
                        <p className="text-purple-100 text-sm leading-relaxed mb-3">
                          הניתוחים שלנו (נומרולוגיה, אסטרולוגיה, כף יד, גרפולוגיה, טארוט) מציגים 
                          <strong> פוטנציאלים ונטיות</strong>, לא גורל חתום מראש.
                        </p>
                        <div className="bg-purple-800/30 rounded-lg p-4">
                          <p className="text-purple-200 font-semibold text-sm mb-2">מה זה אומר?</p>
                          <ul className="text-purple-100 text-xs space-y-2">
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 shrink-0">✓</span>
                              <span><strong>הבחירה החופשית שלך</strong> והסביבה משפיעים באופן מכריע</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 shrink-0">✓</span>
                              <span>הניתוח מראה <strong>כיוונים אפשריים</strong>, לא דרך מוכתבת</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="text-purple-400 shrink-0">✓</span>
                              <span>אתה יכול <strong>לפתח, לשנות ולהתפתח</strong> בכל רגע</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Consent Checkboxes */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-blue-800/30 rounded-lg p-4">
                      <Checkbox
                        checked={formData.has_understood_potentials}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, has_understood_potentials: checked })
                        }
                        className="mt-1"
                      />
                      <label className="text-blue-100 text-sm leading-relaxed cursor-pointer">
                        אני מבין/ה שהניתוחים מציגים <strong>פוטנציאלים ונטיות</strong>, לא גורל קבוע מראש, 
                        ושהבחירה החופשית והסביבה שלי משפיעות באופן מכריע על חיי.
                      </label>
                    </div>

                    <div className="flex items-start gap-3 bg-blue-800/30 rounded-lg p-4">
                      <Checkbox
                        checked={formData.has_consented_to_terms}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, has_consented_to_terms: checked })
                        }
                        className="mt-1"
                      />
                      <label className="text-blue-100 text-sm leading-relaxed cursor-pointer">
                        אני מסכים/ה לתנאי השימוש ומדיניות הפרטיות, ומבין/ה שהניתוחים מבוססים על 
                        <strong> הנתונים האישיים והספציפיים שלי</strong> ולא על תיאורים כלליים.
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 border-blue-500 text-blue-300 hover:bg-blue-800/30"
                    >
                      חזור
                    </Button>
                    <Button
                      onClick={handleNext}
                      disabled={!formData.has_consented_to_terms || !formData.has_understood_potentials}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white disabled:opacity-50"
                    >
                      המשך
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 4: Completion */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl border-green-700/50">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
                  <h3 className="text-3xl font-bold text-white mb-4">מוכן להתחיל!</h3>
                  <p className="text-green-100 text-lg mb-8">
                    עכשיו אפשר להתחיל את המסע - לחקור את עצמך דרך הכלים המיסטיים המדויקים שלנו
                  </p>
                  
                  <Button
                    onClick={handleSubmit}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xl px-12 py-7 shadow-2xl"
                  >
                    בואו נתחיל! 🚀
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}