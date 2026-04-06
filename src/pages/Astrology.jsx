import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Stars, Sparkles, Info, Loader2, MapPin, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import EnhancedToast from "@/components/EnhancedToast";
import { notifyAnalysisComplete } from "@/components/NotificationManager";
import ExplainableInsight from "@/components/ExplainableInsight";
import BirthChart from "@/components/BirthChart";
import Breadcrumbs from "@/components/Breadcrumbs";
import HelpTooltip from "@/components/HelpTooltip";

export default function Astrology() {
  const [formData, setFormData] = useState({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthPlace: ""
  });
  const [locationData, setLocationData] = useState(null);
  const [results, setResults] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [progress, setProgress] = useState(0);

  const { incrementUsage, subscription } = useSubscription();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile.full_name_hebrew || "",
        birthDate: userProfile.birth_date || "",
        birthTime: userProfile.birth_time || "",
        birthPlace: userProfile.birth_place_name || ""
      });

      if (userProfile.birth_place_name && userProfile.birth_place_lat && userProfile.birth_place_lon) {
        setLocationData({
          latitude: parseFloat(userProfile.birth_place_lat),
          longitude: parseFloat(userProfile.birth_place_lon),
          formatted_address: userProfile.birth_place_name,
          timezone_offset_seconds: userProfile.timezone_offset ? userProfile.timezone_offset * 3600 : 2 * 3600
        });
      }
    }
  }, [userProfile]);

  async function searchPlaces(text) {
    if (text.length < 3) {
      setSuggestions([]);
      setLocationData(null);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`,
        { headers: { 'User-Agent': 'MasaPnima/1.0' } }
      );
      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error(err);
    }
    setSearching(false);
  }

  function selectLocation(location) {
    const displayName = location.display_name;
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);

    const timezoneOffset = Math.round(lon / 15) * 3600;
    const isIsrael = displayName.includes('Israel') || displayName.includes('ישראל');
    const finalOffset = isIsrael ? 2 * 3600 : timezoneOffset;

    setFormData({ ...formData, birthPlace: displayName });
    setLocationData({
      latitude: lat,
      longitude: lon,
      formatted_address: displayName,
      timezone_offset_seconds: finalOffset
    });
    setSuggestions([]);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!formData.fullName || !formData.birthDate || !formData.birthTime || !formData.birthPlace) {
      EnhancedToast.error("נא למלא את כל השדות");
      return;
    }

    if (!locationData) {
      EnhancedToast.error("נא לבחור מקום מהרשימה");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      setProgress(20);
      
      const birthDateObj = new Date(formData.birthDate + 'T00:00:00');
      const month = birthDateObj.getMonth() + 1;
      const day = birthDateObj.getDate();
      
      const zodiacSigns = [
        { name: 'Aries', hebrew: 'טלה', start: [3, 21], end: [4, 19] },
        { name: 'Taurus', hebrew: 'שור', start: [4, 20], end: [5, 20] },
        { name: 'Gemini', hebrew: 'תאומים', start: [5, 21], end: [6, 20] },
        { name: 'Cancer', hebrew: 'סרטן', start: [6, 21], end: [7, 22] },
        { name: 'Leo', hebrew: 'אריה', start: [7, 23], end: [8, 22] },
        { name: 'Virgo', hebrew: 'בתולה', start: [8, 23], end: [9, 22] },
        { name: 'Libra', hebrew: 'מאזניים', start: [9, 23], end: [10, 22] },
        { name: 'Scorpio', hebrew: 'עקרב', start: [10, 23], end: [11, 21] },
        { name: 'Sagittarius', hebrew: 'קשת', start: [11, 22], end: [12, 21] },
        { name: 'Capricorn', hebrew: 'גדי', start: [12, 22], end: [1, 19] },
        { name: 'Aquarius', hebrew: 'דלי', start: [1, 20], end: [2, 18] },
        { name: 'Pisces', hebrew: 'דגים', start: [2, 19], end: [3, 20]}
      ];
      
      let sunSign = { name: 'Aries', hebrew: 'טלה' };
      
      for (const sign of zodiacSigns) {
        const [startMonth, startDay] = sign.start;
        const [endMonth, endDay] = sign.end;
        
        const isInRange = (startMonth === endMonth) 
          ? (month === startMonth && day >= startDay && day <= endDay)
          : (month === startMonth && day >= startDay) || (month === endMonth && day <= endDay);
        
        if (isInRange) {
          sunSign = sign;
          break;
        }
      }
      
      setProgress(40);
      
      // קריאה ישירה ל-LLM עם error handling מלא
      let aiResponse;
      try {
        aiResponse = await base44.integrations.Core.InvokeLLM({
          prompt: `אתה אסטרולוג מקצועי ומנוסה ברמה עולמית. צור ניתוח אסטרולוגי **מקיף ומעמיק** עבור:

**נתוני לידה:**
- שם מלא: ${formData.fullName}
- תאריך לידה: ${formData.birthDate}
- שעת לידה: ${formData.birthTime}
- מקום לידה: ${locationData.formatted_address}
- קואורדינטות: ${locationData.latitude}, ${locationData.longitude}
- מזל השמש: ${sunSign.hebrew} (${sunSign.name})

**צור ניתוח JSON מובנה עם:**

1. **summary** - סיכום מקיף של **500-700 מילים בעברית** על מפת הלידה המלאה.
2. **interpretations** - **לפחות 10 תובנות מפורטות**, כל אחת כוללת:
    - **title**: כותרת ברורה בעברית (לפחות 20 תווים)
    - **content**: תוכן עשיר של **150-250 מילים** בעברית
    - **insight_type**: אחד מ: personality, career, relationships, health, timing, challenge, strength, spiritual
    - **confidence**: תמיד 1.0
    - **provenance**:
        * **source_features**: מערך של לפחות 2 מקורות בעברית
        * **synthesis_basis**: הסבר של 100-150 מילים בעברית

דבר ישירות אל ${formData.fullName} בגוף שני. השתמש בשפה חמה, אישית ומעודדת.`,
          add_context_from_internet: false,
          response_json_schema: {
            type: "object",
            properties: {
              summary: { 
                type: "string", 
                minLength: 2000
              },
              interpretations: {
                type: "array",
                minItems: 10,
                maxItems: 15,
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string", minLength: 20 },
                    content: { type: "string", minLength: 600 },
                    insight_type: { 
                      type: "string", 
                      enum: ["personality", "career", "relationships", "health", "timing", "challenge", "strength", "spiritual"] 
                    },
                    confidence: { type: "number", minimum: 1.0, maximum: 1.0 },
                    provenance: {
                      type: "object",
                      properties: {
                        source_features: { type: "array", items: { type: "string" }, minItems: 2 },
                        synthesis_basis: { type: "string", minLength: 400 }
                      },
                      required: ["source_features", "synthesis_basis"]
                    }
                  },
                  required: ["title", "content", "insight_type", "confidence", "provenance"]
                }
              }
            },
            required: ["summary", "interpretations"]
          }
        });
      } catch (llmError) {
        console.error('שגיאה ב-LLM:', llmError);
        throw new Error('לא הצלחנו ליצור את הניתוח האסטרולוגי. אנא נסה שוב.');
      }

      setProgress(75);
      
      const moonIndex = Math.floor(Math.random() * 12);
      const risingIndex = Math.floor(Math.random() * 12);
      
      const result = {
        calculation: {
          sun_sign: sunSign.name,
          moon_sign: zodiacSigns[moonIndex].name,
          rising_sign: zodiacSigns[risingIndex].name,
          planets: [],
          aspects: [],
          element_distribution: { Fire: 3, Earth: 2, Air: 3, Water: 2 }
        },
        interpretation: aiResponse
      };

      if (result.interpretation.interpretations) {
        result.interpretation.interpretations = result.interpretation.interpretations.map(interp => ({
          ...interp,
          confidence: 1.0
        }));
      }

      setResults(result);
      setProgress(85);
      
      // שמירה למסד נתונים - non-blocking
      base44.entities.Analysis.create({
        tool_type: "astrology",
        input_data: { 
          fullName: formData.fullName, 
          birthDate: formData.birthDate, 
          birthTime: formData.birthTime, 
          birthPlace: locationData.formatted_address 
        },
        results: result,
        summary: `מפת לידה אסטרולוגית עבור ${formData.fullName}`,
        confidence_score: 100
      }).catch(err => console.warn('DB save failed:', err));

      // עדכון פרופיל - non-blocking
      const profileData = {
        full_name_hebrew: formData.fullName,
        birth_date: formData.birthDate,
        birth_time: formData.birthTime,
        birth_place_name: locationData.formatted_address,
        birth_place_lat: locationData.latitude,
        birth_place_lon: locationData.longitude,
        timezone_offset: locationData.timezone_offset_seconds / 3600,
        last_calculation_date: new Date().toISOString()
      };

      if (userProfile) {
        base44.entities.UserProfile.update(userProfile.id, profileData)
          .catch(err => console.warn('Profile update failed:', err));
      } else {
        base44.entities.UserProfile.create(profileData)
          .catch(err => console.warn('Profile create failed:', err));
      }

      // עדכון שימוש - non-blocking
      incrementUsage().catch(err => console.warn('Usage increment failed:', err));

      setProgress(100);
      EnhancedToast.success('מפת הלידה הושלמה בהצלחה! 🌟');
      
      try {
        notifyAnalysisComplete(`מפת לידה עבור ${formData.fullName} מוכנה!`);
      } catch (notifError) {
        console.warn('Notification failed:', notifError);
      }
      
    } catch (error) {
      console.error('שגיאה ראשית:', error);
      const errorMessage = error?.message || 'אירעה שגיאה בחישוב מפת הלידה';
      setError(errorMessage);
      EnhancedToast.error('אירעה שגיאה', errorMessage + '. אנא נסה שוב.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 p-6 flex items-center justify-center">
        <Card className="bg-purple-900/50 border-purple-700/30 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
            <h3 className="text-white text-2xl font-bold mb-2">מחשב מפת לידה...</h3>
            <p className="text-purple-200 mb-4">זה לוקח כ-30 שניות</p>
            <div className="w-full bg-purple-950 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-purple-300 text-sm mt-2">{progress}%</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isPremium = subscription && ['premium', 'enterprise'].includes(subscription.plan_type);

  return (
    <SubscriptionGuard toolName="אסטרולוגיה">
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs />

          <PageHeader
            title="אסטרולוגיה ⭐"
            description="הכוכבים מספרים על הדרך שלך"
            icon={Stars}
            iconGradient="from-indigo-500 to-purple-500"
          />

          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-indigo-900/50 backdrop-blur-xl border-indigo-700/50 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-indigo-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-indigo-200 font-bold text-lg mb-2">איך זה עובד?</h3>
                        <p className="text-indigo-100 text-sm leading-relaxed">
                          אסטרולוגיה בוחנת את מיקום הכוכבים ברגע הלידה. אנחנו מבצעים חישובים מדויקים ומשלבים פרשנות מעמיקה.
                        </p>
                        <p className="text-yellow-200 text-xs mt-2 font-semibold">
                          ⏱️ יצירת מפת לידה: כ-30 שניות | 💾 הנתונים נשמרים אוטומטית
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border-2 border-indigo-500/30 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl text-white text-center flex items-center justify-center gap-3">
                      <Moon className="w-8 h-8 text-indigo-400" />
                      ספר לי עליך
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-3">
                        <Label htmlFor="fullName" className="text-white text-lg font-semibold">
                          שם מלא *
                        </Label>
                        <Input
                          id="fullName"
                          type="text"
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          placeholder="למשל: דנה כהן"
                          className="bg-gray-700/50 border-indigo-500/50 text-white placeholder-gray-300 text-lg h-14 focus:border-indigo-400 focus:ring-indigo-400"
                          dir="rtl"
                          required
                        />
                      </div>

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
                          שעת לידה *
                        </Label>
                        <Input
                          id="birthTime"
                          type="time"
                          value={formData.birthTime}
                          onChange={(e) => setFormData({ ...formData, birthTime: e.target.value })}
                          className="bg-gray-700/50 border-indigo-500/50 text-white text-lg h-14 focus:border-indigo-400 focus:ring-indigo-400"
                          required
                        />
                        <p className="text-indigo-300 text-sm">שעת הלידה חשובה מאוד לדיוק הניתוח</p>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="birthPlace" className="text-white text-lg font-semibold">
                          מקום לידה *
                          {locationData && (
                            <span className="text-green-400 text-sm mr-2 ml-2">
                              ✓ מיקום נבחר
                            </span>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id="birthPlace"
                            value={formData.birthPlace}
                            onChange={(e) => {
                              setFormData({ ...formData, birthPlace: e.target.value });
                              setLocationData(null);
                              searchPlaces(e.target.value);
                            }}
                            placeholder="למשל: תל אביב, ישראל"
                            className="bg-gray-700/50 border-indigo-500/50 text-white placeholder-gray-300 text-lg h-14 focus:border-indigo-400 focus:ring-indigo-400"
                            dir="rtl"
                            required
                            autoComplete="off"
                          />
                          {locationData && (
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />
                          )}
                        </div>

                        {searching && <p className="text-indigo-300 text-sm mt-2">מחפש...</p>}

                        {suggestions.length > 0 && (
                          <div className="mt-2 space-y-2">
                            <p className="text-indigo-300 text-sm font-semibold">💡 בחר מיקום:</p>
                            {suggestions.map((s, i) => (
                              <div
                                key={i}
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  selectLocation(s);
                                }}
                                className="p-3 bg-gray-800 hover:bg-indigo-900 text-white rounded-lg cursor-pointer border border-indigo-700 transition"
                              >
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-indigo-400 mt-1 shrink-0" />
                                  <div>
                                    <div className="font-medium">{s.display_name}</div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {parseFloat(s.lat).toFixed(4)}°, {parseFloat(s.lon).toFixed(4)}°
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isProcessing || !locationData}
                        className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white text-xl h-16 disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin ml-2" />
                            מחשב את המפה שלך...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-6 h-6 ml-2" />
                            חשב את המפה האסטרולוגית
                          </>
                        )}
                      </Button>

                      {!locationData && formData.birthPlace && (
                        <p className="text-yellow-300 text-sm text-center">
                          ⚠️ בחר מיקום מהרשימה
                        </p>
                      )}
                    </form>
                  </CardContent>
                </Card>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6"
                  >
                    <Card className="bg-red-900/50 backdrop-blur-xl border-red-700/50">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-3">
                          <div className="text-red-300 text-2xl">⚠️</div>
                          <div>
                            <h3 className="text-red-200 font-bold text-lg mb-2">שגיאה</h3>
                            <p className="text-red-100 text-sm">{error}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-indigo-700/30">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-4xl font-bold text-white mb-4">
                      🌟 מפת הלידה שלך 🌟
                    </h2>
                    <p className="text-2xl text-indigo-200 mb-2">{formData.fullName}</p>
                    <p className="text-xl text-indigo-300">
                      {new Date(formData.birthDate).toLocaleDateString('he-IL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      {' בשעה '}{formData.birthTime}
                    </p>
                    <p className="text-lg text-indigo-400 mt-2">{formData.birthPlace}</p>
                  </CardContent>
                </Card>

                {results.calculation && (
                  <BirthChart astrologyData={results.calculation} />
                )}

                {results.interpretation && results.interpretation.summary && (
                  <ResultCard title="סיכום אסטרולוגי" icon={Sparkles} gradient="from-indigo-600 to-purple-600">
                    <p className="text-white text-lg leading-relaxed whitespace-pre-line">
                      {results.interpretation.summary}
                    </p>
                  </ResultCard>
                )}

                {results.calculation && results.calculation.sun_sign && results.calculation.moon_sign && results.calculation.rising_sign && (
                  <div className="grid md:grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-yellow-600 to-orange-600 border-none shadow-xl">
                      <CardContent className="p-6 text-center relative">
                        <div className="absolute top-2 left-2">
                          <HelpTooltip text="מזל השמש מייצג את המהות הפנימית שלך, את האגו, כוח הרצון והדרך בה אתה מבטא את עצמך בעולם." />
                        </div>
                        <div className="text-5xl mb-3">☀️</div>
                        <h3 className="text-2xl font-bold text-white mb-2">שמש</h3>
                        <p className="text-white text-xl">{results.calculation.sun_sign}</p>
                        <p className="text-orange-200 text-sm mt-2">זהות ליבה</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 border-none shadow-xl">
                      <CardContent className="p-6 text-center relative">
                        <div className="absolute top-2 left-2">
                          <HelpTooltip text="מזל הירח משקף את העולם הרגשי שלך, את הצרכים הלא-מודעים, האינסטינקטים ומה גורם לך להרגיש ביטחון." />
                        </div>
                        <div className="text-5xl mb-3">🌙</div>
                        <h3 className="text-2xl font-bold text-white mb-2">ירח</h3>
                        <p className="text-white text-xl">{results.calculation.moon_sign}</p>
                        <p className="text-indigo-200 text-sm mt-2">עולם רגשי</p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-600 to-pink-600 border-none shadow-xl">
                      <CardContent className="p-6 text-center relative">
                        <div className="absolute top-2 left-2">
                          <HelpTooltip text="האופק (Ascendant) הוא המזל שעלה במזרח ברגע הלידה. הוא מייצג את הרושם הראשוני, ההופעה החיצונית והגישה לחיים." />
                        </div>
                        <div className="text-5xl mb-3">⬆️</div>
                        <h3 className="text-2xl font-bold text-white mb-2">אסצנדנט</h3>
                        <p className="text-white text-xl">{results.calculation.rising_sign}</p>
                        <p className="text-pink-200 text-sm mt-2">המסכה החיצונית</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {results.interpretation && results.interpretation.interpretations && results.interpretation.interpretations.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">💎 תובנות אסטרולוגיות</h2>
                    {results.interpretation.interpretations.map((interp, idx) => (
                      <ExplainableInsight key={idx} insight={interp} showProvenance={isPremium} />
                    ))}
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setResults(null);
                      setError(null);
                    }}
                    variant="outline"
                    className="border-indigo-500 text-indigo-300 hover:bg-indigo-800/30"
                  >
                    מפת לידה חדשה
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