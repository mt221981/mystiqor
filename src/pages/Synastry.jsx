import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Heart, Users, Sparkles, MapPin, Info, TrendingUp, MessageCircle, Flame } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import EnhancedToast from "@/components/EnhancedToast";
import { notifyAnalysisComplete } from "@/components/NotificationManager";
import LoadingSpinner from "@/components/LoadingSpinner";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function Synastry() {
  const [person1Data, setPerson1Data] = useState({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    locationData: null
  });
  
  const [person2Data, setPerson2Data] = useState({
    fullName: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    locationData: null
  });

  const [searchingP1, setSearchingP1] = useState(false);
  const [searchingP2, setSearchingP2] = useState(false);
  const [suggestionsP1, setSuggestionsP1] = useState([]);
  const [suggestionsP2, setSuggestionsP2] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");

  const { incrementUsage } = useSubscription();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  const { data: guestProfiles = [] } = useQuery({
    queryKey: ['guestProfiles'],
    queryFn: () => base44.entities.GuestProfile.filter({ is_active: true })
  });

  async function searchPlaces(text, person) {
    if (text.length < 3) {
      if (person === 1) setSuggestionsP1([]);
      else setSuggestionsP2([]);
      return;
    }
    
    if (person === 1) setSearchingP1(true);
    else setSearchingP2(true);

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&limit=5`,
        { headers: { 'User-Agent': 'MasaPnima/1.0' } }
      );
      const data = await res.json();
      if (person === 1) setSuggestionsP1(data);
      else setSuggestionsP2(data);
    } catch (err) {
      console.error(err);
    }
    
    if (person === 1) setSearchingP1(false);
    else setSearchingP2(false);
  }

  function selectLocation(location, person) {
    const displayName = location.display_name;
    const lat = parseFloat(location.lat);
    const lon = parseFloat(location.lon);
    const isIsrael = displayName.includes('Israel') || displayName.includes('ישראל');
    const timezoneOffset = isIsrael ? 2 * 3600 : Math.round(lon / 15) * 3600;
    
    const locationData = {
      latitude: lat,
      longitude: lon,
      formatted_address: displayName,
      timezone_offset_seconds: timezoneOffset
    };

    if (person === 1) {
      setPerson1Data(prev => ({ ...prev, birthPlace: displayName, locationData }));
      setSuggestionsP1([]);
    } else {
      setPerson2Data(prev => ({ ...prev, birthPlace: displayName, locationData }));
      setSuggestionsP2([]);
    }
  }

  function loadFromProfile(profile, person) {
    const data = {
      fullName: profile.full_name_hebrew || profile.full_name || '',
      birthDate: profile.birth_date || '',
      birthTime: profile.birth_time || '',
      birthPlace: profile.birth_place_name || '',
      locationData: profile.birth_place_lat && profile.birth_place_lon ? {
        latitude: profile.birth_place_lat,
        longitude: profile.birth_place_lon,
        formatted_address: profile.birth_place_name,
        timezone_offset_seconds: (profile.timezone_offset || 2) * 3600
      } : null
    };

    if (person === 1) {
      setPerson1Data(data);
    } else {
      setPerson2Data(data);
    }
    
    EnhancedToast.success('פרופיל נטען!', `נתוני ${profile.full_name_hebrew || profile.full_name} הועתקו`);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!person1Data.fullName || !person1Data.birthDate || !person1Data.birthTime || !person1Data.locationData) {
      EnhancedToast.error("נא למלא את כל השדות של אדם 1");
      return;
    }

    if (!person2Data.fullName || !person2Data.birthDate || !person2Data.birthTime || !person2Data.locationData) {
      EnhancedToast.error("נא למלא את כל השדות של אדם 2");
      return;
    }

    setIsProcessing(true);
    setLoadingMessage("מחשב מפת לידה לאדם 1...");

    try {
      // Calculate chart for person 1
      const calc1Response = await base44.functions.invoke('calculateAstrology', {
        birth_date: person1Data.birthDate,
        birth_time: person1Data.birthTime,
        birth_place_name: person1Data.locationData.formatted_address,
        birth_place_lat: person1Data.locationData.latitude,
        birth_place_lon: person1Data.locationData.longitude,
        timezone_offset_seconds: person1Data.locationData.timezone_offset_seconds
      });

      if (calc1Response.data.error) {
        throw new Error(calc1Response.data.error);
      }

      setLoadingMessage("מחשב מפת לידה לאדם 2...");

      // Calculate chart for person 2
      const calc2Response = await base44.functions.invoke('calculateAstrology', {
        birth_date: person2Data.birthDate,
        birth_time: person2Data.birthTime,
        birth_place_name: person2Data.locationData.formatted_address,
        birth_place_lat: person2Data.locationData.latitude,
        birth_place_lon: person2Data.locationData.longitude,
        timezone_offset_seconds: person2Data.locationData.timezone_offset_seconds
      });

      if (calc2Response.data.error) {
        throw new Error(calc2Response.data.error);
      }

      setLoadingMessage("מנתח את ההתאמה ביניכם (כ-2 דקות)...");

      // Get Synastry interpretation
      const interpResponse = await base44.functions.invoke('interpretAstrology', {
        calculation_data: calc1Response.data,
        person2_data: {
          birth_date: person2Data.birthDate,
          birth_time: person2Data.birthTime,
          birth_place_name: person2Data.locationData.formatted_address,
          birth_place_lat: person2Data.locationData.latitude,
          birth_place_lon: person2Data.locationData.longitude,
          timezone_offset_seconds: person2Data.locationData.timezone_offset_seconds
        }
      });

      if (interpResponse.data.error) {
        throw new Error(interpResponse.data.error);
      }

      setResults({
        person1: {
          name: person1Data.fullName,
          chart: calc1Response.data
        },
        person2: {
          name: person2Data.fullName,
          chart: calc2Response.data
        },
        synastry: interpResponse.data.synastry_lite,
        full_interpretation: interpResponse.data
      });

      // Save analysis
      await base44.entities.Analysis.create({
        tool_type: "astrology",
        input_data: {
          person1: person1Data,
          person2: person2Data,
          synastry: true
        },
        results: {
          person1_chart: calc1Response.data,
          person2_chart: calc2Response.data,
          synastry: interpResponse.data.synastry_lite
        },
        summary: `ניתוח Synastry - ${person1Data.fullName} & ${person2Data.fullName}`,
        confidence_score: interpResponse.data.synastry_lite?.compatibility_score || 100
      });

      await incrementUsage();
      EnhancedToast.success('ניתוח ההתאמה הושלם! 💕');
      notifyAnalysisComplete(`Synastry - ${person1Data.fullName} & ${person2Data.fullName}`, 
        interpResponse.data.synastry_lite?.compatibility_score || 100);

    } catch (error) {
      console.error('[Synastry] Error:', error);
      EnhancedToast.error('אירעה שגיאה', error.message);
    } finally {
      setIsProcessing(false);
      setLoadingMessage("");
    }
  }

  if (isProcessing) {
    return <LoadingSpinner message={loadingMessage} />;
  }

  return (
    <SubscriptionGuard toolName="Synastry">
      <div className="min-h-screen bg-gradient-to-br from-pink-950 via-purple-950 to-rose-950 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <Breadcrumbs />
          
          <PageHeader
            title="Synastry - ניתוח יחסים"
            description="גלו את ההתאמה האסטרולוגית ביניכם 💕"
            icon={Heart}
            iconGradient="from-pink-600 to-rose-600"
          />

          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-pink-900/50 backdrop-blur-xl border-pink-700/50 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-pink-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-pink-200 font-bold text-lg mb-2">מה זה Synastry?</h3>
                        <p className="text-pink-100 text-sm leading-relaxed">
                          Synastry הוא ניתוח אסטרולוגי המשווה בין שתי מפות לידה. 
                          ה-AI שלנו בודק את האינטראקציות בין הכוכבים של שני האנשים וחושף:
                          דינמיקות יחסים, חוזקות, אתגרים, והמלצות מעשיות.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Person 1 */}
                  <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-purple-800/50">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white flex items-center gap-3">
                        <Users className="w-8 h-8 text-purple-400" />
                        אדם ראשון
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Load from profile */}
                      {(userProfile || guestProfiles.length > 0) && (
                        <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-700/30">
                          <Label className="text-blue-200 text-sm mb-2 block">טען מפרופיל:</Label>
                          <div className="flex gap-2 flex-wrap">
                            {userProfile && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => loadFromProfile(userProfile, 1)}
                                className="border-blue-600 text-blue-200"
                              >
                                הפרופיל שלי
                              </Button>
                            )}
                            {guestProfiles.length > 0 && (
                              <Select onValueChange={(value) => {
                                const profile = guestProfiles.find(p => p.id === value);
                                if (profile) loadFromProfile(profile, 1);
                              }}>
                                <SelectTrigger className="flex-1 border-blue-600 text-blue-200">
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

                      <div>
                        <Label className="text-white text-lg font-bold">שם מלא</Label>
                        <Input
                          value={person1Data.fullName}
                          onChange={(e) => setPerson1Data({...person1Data, fullName: e.target.value})}
                          placeholder="למשל: דני כהן"
                          className="bg-gray-800/50 text-white text-lg h-14 rounded-xl border-purple-700"
                          dir="rtl"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-white text-lg font-bold">תאריך לידה</Label>
                          <Input
                            type="date"
                            value={person1Data.birthDate}
                            onChange={(e) => setPerson1Data({...person1Data, birthDate: e.target.value})}
                            className="bg-gray-800/50 text-white text-lg h-14 rounded-xl border-purple-700"
                            required
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label className="text-white text-lg font-bold">שעת לידה</Label>
                          <Input
                            type="time"
                            value={person1Data.birthTime}
                            onChange={(e) => setPerson1Data({...person1Data, birthTime: e.target.value})}
                            className="bg-gray-800/50 text-white text-lg h-14 rounded-xl border-purple-700"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white text-lg font-bold">
                          מקום לידה
                          {person1Data.locationData && <span className="text-green-400 text-sm mr-2">✓ מיקום נבחר</span>}
                        </Label>
                        <div className="relative">
                          <Input
                            value={person1Data.birthPlace}
                            onChange={(e) => {
                              setPerson1Data({...person1Data, birthPlace: e.target.value, locationData: null});
                              searchPlaces(e.target.value, 1);
                            }}
                            placeholder="למשל: תל אביב, ישראל"
                            className="bg-gray-800/50 text-white text-lg h-14 rounded-xl border-purple-700"
                            dir="rtl"
                            required
                            autoComplete="off"
                          />
                          {person1Data.locationData && <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />}
                        </div>
                        {searchingP1 && <p className="text-purple-300 text-sm mt-2">מחפש...</p>}
                        {suggestionsP1.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {suggestionsP1.map((s, i) => (
                              <div
                                key={i}
                                onMouseDown={(e) => { e.preventDefault(); selectLocation(s, 1); }}
                                className="p-3 bg-gray-800 hover:bg-purple-900 text-white rounded-lg cursor-pointer border border-purple-700 transition"
                              >
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-purple-400 mt-1 shrink-0" />
                                  <div className="font-medium">{s.display_name}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Person 2 */}
                  <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-pink-800/50">
                    <CardHeader>
                      <CardTitle className="text-2xl text-white flex items-center gap-3">
                        <Heart className="w-8 h-8 text-pink-400" />
                        אדם שני
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {guestProfiles.length > 0 && (
                        <div className="bg-pink-900/30 rounded-lg p-4 border border-pink-700/30">
                          <Label className="text-pink-200 text-sm mb-2 block">טען מפרופיל אורח:</Label>
                          <Select onValueChange={(value) => {
                            const profile = guestProfiles.find(p => p.id === value);
                            if (profile) loadFromProfile(profile, 2);
                          }}>
                            <SelectTrigger className="w-full border-pink-600 text-pink-200">
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

                      <div>
                        <Label className="text-white text-lg font-bold">שם מלא</Label>
                        <Input
                          value={person2Data.fullName}
                          onChange={(e) => setPerson2Data({...person2Data, fullName: e.target.value})}
                          placeholder="למשל: מיכל לוי"
                          className="bg-gray-800/50 text-white text-lg h-14 rounded-xl border-pink-700"
                          dir="rtl"
                          required
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <Label className="text-white text-lg font-bold">תאריך לידה</Label>
                          <Input
                            type="date"
                            value={person2Data.birthDate}
                            onChange={(e) => setPerson2Data({...person2Data, birthDate: e.target.value})}
                            className="bg-gray-800/50 text-white text-lg h-14 rounded-xl border-pink-700"
                            required
                            max={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label className="text-white text-lg font-bold">שעת לידה</Label>
                          <Input
                            type="time"
                            value={person2Data.birthTime}
                            onChange={(e) => setPerson2Data({...person2Data, birthTime: e.target.value})}
                            className="bg-gray-800/50 text-white text-lg h-14 rounded-xl border-pink-700"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-white text-lg font-bold">
                          מקום לידה
                          {person2Data.locationData && <span className="text-green-400 text-sm mr-2">✓ מיקום נבחר</span>}
                        </Label>
                        <div className="relative">
                          <Input
                            value={person2Data.birthPlace}
                            onChange={(e) => {
                              setPerson2Data({...person2Data, birthPlace: e.target.value, locationData: null});
                              searchPlaces(e.target.value, 2);
                            }}
                            placeholder="למשל: ירושלים, ישראל"
                            className="bg-gray-800/50 text-white text-lg h-14 rounded-xl border-pink-700"
                            dir="rtl"
                            required
                            autoComplete="off"
                          />
                          {person2Data.locationData && <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-400" />}
                        </div>
                        {searchingP2 && <p className="text-pink-300 text-sm mt-2">מחפש...</p>}
                        {suggestionsP2.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {suggestionsP2.map((s, i) => (
                              <div
                                key={i}
                                onMouseDown={(e) => { e.preventDefault(); selectLocation(s, 2); }}
                                className="p-3 bg-gray-800 hover:bg-pink-900 text-white rounded-lg cursor-pointer border border-pink-700 transition"
                              >
                                <div className="flex items-start gap-2">
                                  <MapPin className="w-4 h-4 text-pink-400 mt-1 shrink-0" />
                                  <div className="font-medium">{s.display_name}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Button
                    type="submit"
                    disabled={!person1Data.locationData || !person2Data.locationData}
                    className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 hover:from-pink-700 hover:via-rose-700 hover:to-pink-700 text-white text-xl h-16 shadow-2xl rounded-xl"
                  >
                    <Sparkles className="w-6 h-6 ml-3" />
                    נתח את ההתאמה ביניכם
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Header */}
                <Card className="bg-gradient-to-r from-pink-900/50 to-rose-900/50 backdrop-blur-xl border-pink-700/30">
                  <CardContent className="p-8 text-center">
                    <div className="flex items-center justify-center gap-6 mb-6">
                      <div className="text-center">
                        <div className="text-4xl mb-2">💜</div>
                        <h3 className="text-2xl font-bold text-white">{results.person1.name}</h3>
                        <p className="text-pink-200">{results.person1.chart.sun_sign} ☀️ {results.person1.chart.moon_sign} 🌙</p>
                      </div>
                      <Heart className="w-16 h-16 text-pink-400 animate-pulse" />
                      <div className="text-center">
                        <div className="text-4xl mb-2">💜</div>
                        <h3 className="text-2xl font-bold text-white">{results.person2.name}</h3>
                        <p className="text-pink-200">{results.person2.chart.sun_sign} ☀️ {results.person2.chart.moon_sign} 🌙</p>
                      </div>
                    </div>

                    {results.synastry?.compatibility_score && (
                      <div>
                        <p className="text-pink-200 text-lg mb-2">ציון התאמה כללי</p>
                        <div className="text-7xl font-bold text-white mb-4">
                          {results.synastry.compatibility_score}%
                        </div>
                        <Badge className={`text-lg px-6 py-2 ${
                          results.synastry.compatibility_score >= 80 ? 'bg-green-600' :
                          results.synastry.compatibility_score >= 60 ? 'bg-blue-600' :
                          results.synastry.compatibility_score >= 40 ? 'bg-yellow-600' :
                          'bg-orange-600'
                        }`}>
                          {results.synastry.compatibility_score >= 80 && '🌟 התאמה מצוינת'}
                          {results.synastry.compatibility_score >= 60 && results.synastry.compatibility_score < 80 && '✨ התאמה טובה'}
                          {results.synastry.compatibility_score >= 40 && results.synastry.compatibility_score < 60 && '⚖️ התאמה בינונית'}
                          {results.synastry.compatibility_score < 40 && '⚠️ מאתגר'}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Element Harmony */}
                {results.synastry?.element_harmony && (
                  <ResultCard title="הרמוניית יסודות" icon={Sparkles} gradient="from-purple-600 to-indigo-600">
                    <p className="text-white text-lg leading-relaxed">
                      {results.synastry.element_harmony}
                    </p>
                  </ResultCard>
                )}

                {/* Sun-Sun Dynamic */}
                {results.synastry?.sun_sun_dynamic && (
                  <ResultCard title="דינמיקת השמשות - זהות הליבה" icon={TrendingUp} gradient="from-yellow-600 to-orange-600">
                    <div className="flex items-center justify-center gap-8 mb-6">
                      <div className="text-center">
                        <div className="text-6xl mb-2">☀️</div>
                        <p className="text-yellow-200 text-xl font-bold">{results.person1.chart.sun_sign}</p>
                        <p className="text-yellow-300 text-sm">{results.person1.name}</p>
                      </div>
                      <div className="text-4xl">↔️</div>
                      <div className="text-center">
                        <div className="text-6xl mb-2">☀️</div>
                        <p className="text-yellow-200 text-xl font-bold">{results.person2.chart.sun_sign}</p>
                        <p className="text-yellow-300 text-sm">{results.person2.name}</p>
                      </div>
                    </div>
                    <p className="text-white text-lg leading-relaxed">
                      {results.synastry.sun_sun_dynamic}
                    </p>
                  </ResultCard>
                )}

                {/* Moon-Moon Dynamic */}
                {results.synastry?.moon_moon_dynamic && (
                  <ResultCard title="דינמיקת הירחות - צרכים רגשיים" icon={Heart} gradient="from-blue-600 to-indigo-600">
                    <div className="flex items-center justify-center gap-8 mb-6">
                      <div className="text-center">
                        <div className="text-6xl mb-2">🌙</div>
                        <p className="text-blue-200 text-xl font-bold">{results.person1.chart.moon_sign}</p>
                        <p className="text-blue-300 text-sm">{results.person1.name}</p>
                      </div>
                      <div className="text-4xl">↔️</div>
                      <div className="text-center">
                        <div className="text-6xl mb-2">🌙</div>
                        <p className="text-blue-200 text-xl font-bold">{results.person2.chart.moon_sign}</p>
                        <p className="text-blue-300 text-sm">{results.person2.name}</p>
                      </div>
                    </div>
                    <p className="text-white text-lg leading-relaxed">
                      {results.synastry.moon_moon_dynamic}
                    </p>
                  </ResultCard>
                )}

                {/* Venus-Mars Chemistry */}
                {results.synastry?.venus_mars_chemistry && (
                  <ResultCard title="כימיה ומשיכה - ונוס ומאדים" icon={Flame} gradient="from-pink-600 to-rose-600">
                    <p className="text-white text-lg leading-relaxed">
                      {results.synastry.venus_mars_chemistry}
                    </p>
                  </ResultCard>
                )}

                {/* Communication & Emotional */}
                <div className="grid md:grid-cols-2 gap-6">
                  {results.synastry?.communication_style && (
                    <Card className="bg-indigo-900/50 border-indigo-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <MessageCircle className="w-6 h-6 text-indigo-300" />
                          <h3 className="text-indigo-200 font-bold text-lg">סגנון תקשורת</h3>
                        </div>
                        <p className="text-indigo-100 leading-relaxed">
                          {results.synastry.communication_style}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {results.synastry?.emotional_compatibility && (
                    <Card className="bg-purple-900/50 border-purple-700/30">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <Heart className="w-6 h-6 text-purple-300" />
                          <h3 className="text-purple-200 font-bold text-lg">התאמה רגשית</h3>
                        </div>
                        <p className="text-purple-100 leading-relaxed">
                          {results.synastry.emotional_compatibility}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Strengths */}
                {results.synastry?.strengths && results.synastry.strengths.length > 0 && (
                  <ResultCard title="החוזקות שלכם" icon={TrendingUp} gradient="from-green-600 to-emerald-600">
                    <div className="space-y-3">
                      {results.synastry.strengths.map((strength, idx) => (
                        <div key={idx} className="bg-green-950/40 rounded-lg p-4">
                          <p className="text-green-100 leading-relaxed flex items-start gap-2">
                            <span className="text-green-400 font-bold">✓</span>
                            {strength}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Challenges */}
                {results.synastry?.challenges && results.synastry.challenges.length > 0 && (
                  <ResultCard title="אתגרים לעבוד עליהם" icon={TrendingUp} gradient="from-orange-600 to-amber-600">
                    <div className="space-y-3">
                      {results.synastry.challenges.map((challenge, idx) => (
                        <div key={idx} className="bg-orange-950/40 rounded-lg p-4">
                          <p className="text-orange-100 leading-relaxed flex items-start gap-2">
                            <span className="text-orange-400 font-bold">⚠️</span>
                            {challenge}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                {/* Long-term potential */}
                {results.synastry?.long_term_potential && (
                  <ResultCard title="פוטנציאל לטווח ארוך" icon={Heart} gradient="from-purple-600 to-pink-600">
                    <p className="text-white text-lg leading-relaxed">
                      {results.synastry.long_term_potential}
                    </p>
                  </ResultCard>
                )}

                {/* Recommendations */}
                {results.synastry?.recommendations && results.synastry.recommendations.length > 0 && (
                  <ResultCard title="המלצות לחיזוק היחסים" icon={Sparkles} gradient="from-blue-600 to-cyan-600">
                    <div className="space-y-3">
                      {results.synastry.recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-blue-950/40 rounded-lg p-4">
                          <p className="text-blue-100 leading-relaxed flex items-start gap-2">
                            <span className="text-blue-400 font-bold">{idx + 1}.</span>
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ResultCard>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setResults(null);
                      setPerson1Data({ fullName: "", birthDate: "", birthTime: "", birthPlace: "", locationData: null });
                      setPerson2Data({ fullName: "", birthDate: "", birthTime: "", birthPlace: "", locationData: null });
                    }}
                    variant="outline"
                    className="border-pink-500 text-pink-300 hover:bg-pink-800/30"
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