import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, Sun, Sparkles, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import LoadingSpinner from "@/components/LoadingSpinner";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import ExplainableInsight from "@/components/ExplainableInsight";
import ConfidenceBadge from "@/components/ConfidenceBadge";
import BirthChart from "@/components/BirthChart";

export default function SolarReturn() {
  const [targetYear, setTargetYear] = useState(new Date().getFullYear());
  const [solarReturn, setSolarReturn] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();
  
  const { incrementUsage, subscription } = useSubscription();

  const { data: profile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const profiles = await base44.entities.UserProfile.filter({
        created_by: user.email
      });
      return profiles[0] || null;
    }
  });

  const { data: natalCalc } = useQuery({
    queryKey: ['natalCalc'],
    queryFn: async () => {
      const user = await base44.auth.me();
      const calcs = await base44.entities.AstrologyCalculation.filter({
        created_by: user.email
      });
      return calcs[0] || null;
    },
    enabled: !!profile
  });

  const calculateSolarReturnMutation = useMutation({
    mutationFn: async ({ natalSunLon, birthDate, lat, lon, year }) => {
      const response = await base44.functions.invoke('calculateSolarReturn', {
        natal_sun_longitude: natalSunLon,
        birth_date: birthDate,
        birth_place_lat: lat,
        birth_place_lon: lon,
        target_year: year
      });
      return response.data;
    }
  });

  const interpretSolarReturnMutation = useMutation({
    mutationFn: async ({ solarReturnData, natalData }) => {
      const response = await base44.functions.invoke('interpretSolarReturn', {
        solar_return_data: solarReturnData,
        natal_data: natalData
      });
      return response.data;
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    }
  });

  const handleCalculate = async () => {
    if (!profile) {
      EnhancedToast.error('נא למלא את הפרופיל שלך קודם');
      return;
    }

    if (!natalCalc || !natalCalc.planets) {
      EnhancedToast.error('נא לחשב את המפה הנטאלית שלך קודם (דף אסטרולוגיה)');
      return;
    }

    setIsCalculating(true);

    try {
      // Calculate Solar Return
      const srData = await calculateSolarReturnMutation.mutateAsync({
        natalSunLon: natalCalc.planets.find(p => p.name === 'Sun').longitude,
        birthDate: profile.birth_date,
        lat: profile.birth_place_lat,
        lon: profile.birth_place_lon,
        year: targetYear
      });

      setSolarReturn(srData);

      // Interpret
      const interp = await interpretSolarReturnMutation.mutateAsync({
        solarReturnData: srData,
        natalData: {
          planets: natalCalc.planets.reduce((acc, p) => {
            acc[p.name] = { longitude: p.longitude, sign: p.sign };
            return acc;
          }, {}),
          sun_sign: natalCalc.sun_sign,
          moon_sign: natalCalc.moon_sign,
          rising_sign: natalCalc.rising_sign
        }
      });

      setInterpretation(interp);

      // Save
      await saveAnalysisMutation.mutateAsync({
        tool_type: "astrology",
        input_data: { 
          target_year: targetYear,
          solar_return_type: true,
          natal_sun: natalCalc.planets.find(p => p.name === 'Sun').longitude
        },
        results: {
          solar_return: srData,
          interpretation: interp
        },
        summary: `Solar Return לשנת ${targetYear}`,
        confidence_score: Math.round((interp.confidence_level || 0.9) * 100)
      });

      await incrementUsage();

      EnhancedToast.success('המפה השנתית שלך מוכנה! ☀️');
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      EnhancedToast.error('אירעה שגיאה בחישוב');
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleReset = () => {
    setSolarReturn(null);
    setInterpretation(null);
  };

  if (isCalculating) {
    return <LoadingSpinner message="מחשב את מפת יום ההולדת השנתית שלך..." />;
  }

  const isPremium = subscription && ['premium', 'enterprise'].includes(subscription.plan_type);

  return (
    <SubscriptionGuard toolName="Solar Return">
      <div className="min-h-screen bg-gradient-to-br from-yellow-950 via-orange-950 to-yellow-900 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Solar Return ☀️"
            description="מפת יום ההולדת השנתית שלך"
            icon={Sun}
            iconGradient="from-yellow-500 to-orange-500"
          />

          <AnimatePresence mode="wait">
            {!interpretation ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* הסבר */}
                <Card className="bg-orange-900/50 border-orange-700/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-orange-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-orange-200 font-bold text-lg mb-2">מה זה Solar Return?</h3>
                        <p className="text-orange-100 text-sm leading-relaxed mb-3">
                          Solar Return הוא הרגע המדויק שבו השמש חוזרת למיקום שהייתה בו כשנולדת. 
                          זה קורה פעם בשנה (בערך ביום ההולדת שלך), וזו "מפת הדרכים" שלך לשנה הקרובה.
                        </p>
                        <p className="text-orange-200 text-xs">
                          📚 מבוסס על: Mary Fortier Shea (1976), Alexandre Volguine (1937)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Year Selection */}
                <Card className="bg-orange-900/50 border-orange-700/30">
                  <CardContent className="p-6">
                    <Label className="text-white text-lg mb-3 block">באיזו שנה אתה רוצה לראות?</Label>
                    <div className="flex gap-4 items-end">
                      <div className="flex-1">
                        <Input
                          type="number"
                          min={1900}
                          max={2100}
                          value={targetYear}
                          onChange={(e) => setTargetYear(parseInt(e.target.value))}
                          className="bg-orange-800/30 border-orange-600 text-white text-xl"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setTargetYear(new Date().getFullYear())}
                          variant="outline"
                          className="border-orange-500 text-orange-200"
                        >
                          השנה
                        </Button>
                        <Button
                          onClick={() => setTargetYear(new Date().getFullYear() + 1)}
                          variant="outline"
                          className="border-orange-500 text-orange-200"
                        >
                          השנה הבאה
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Calculate Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleCalculate}
                    disabled={!profile || !natalCalc}
                    className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white text-xl px-12 py-6"
                  >
                    <Calendar className="w-6 h-6 ml-2" />
                    חשב Solar Return ל-{targetYear}
                    <Sparkles className="w-6 h-6 mr-2" />
                  </Button>
                </div>

                {(!profile || !natalCalc) && (
                  <Card className="bg-red-900/30 border-red-700/30">
                    <CardContent className="p-4">
                      <p className="text-red-200 text-sm text-center">
                        {!profile ? '⚠️ נא למלא את הפרופיל שלך בדף "הפרטים שלי"' : '⚠️ נא לחשב את המפה הנטאלית שלך בדף "אסטרולוגיה"'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Main Summary */}
                <Card className="bg-gradient-to-r from-yellow-900/50 to-orange-900/50 backdrop-blur-xl border-yellow-700/30">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-white mb-4 text-center">
                      ☀️ השנה שלך: {interpretation.solar_return_year} ☀️
                    </h2>
                    
                    <div className="flex justify-center mb-6">
                      <ConfidenceBadge 
                        score={interpretation.confidence_level || 0.9} 
                        size="large"
                        details={{
                          input_quality: 1.0,
                          calculation_confidence: interpretation.confidence_level || 0.9,
                          data_completeness: 1.0,
                          notes: "חישוב מדויק של רגע החזרת השמש"
                        }}
                      />
                    </div>

                    {interpretation.yearly_theme && (
                      <div className="bg-yellow-800/30 rounded-xl p-6 border border-yellow-700/30 mb-4">
                        <h3 className="text-xl font-bold text-yellow-200 mb-2">🎯 נושא השנה:</h3>
                        <p className="text-white text-2xl font-bold">{interpretation.yearly_theme}</p>
                      </div>
                    )}

                    {interpretation.overall_summary && (
                      <div className="bg-orange-800/30 rounded-xl p-6 border border-orange-700/30">
                        <p className="text-white text-lg leading-relaxed whitespace-pre-line">
                          {interpretation.overall_summary}
                        </p>
                      </div>
                    )}

                    {interpretation.major_focus_areas && interpretation.major_focus_areas.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-xl font-bold text-yellow-200 mb-3">🎯 תחומי מיקוד מרכזיים:</h3>
                        <div className="flex flex-wrap gap-2">
                          {interpretation.major_focus_areas.map((area, idx) => (
                            <Badge key={idx} className="bg-yellow-700 text-white text-base px-4 py-2">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Solar Return Chart Visualization */}
                {solarReturn && (
                  <Card className="bg-yellow-900/30 border-yellow-700/30">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-white mb-6 text-center">
                        🌟 המפה האסטרולוגית של {targetYear}
                      </h2>
                      
                      <div className="mb-6 text-center">
                        <p className="text-yellow-200 text-lg">
                          ⏰ רגע מדויק: {new Date(solarReturn.solar_return_moment).toLocaleString('he-IL')}
                        </p>
                        <p className="text-yellow-300 text-sm mt-2">
                          דיוק: ±{solarReturn.accuracy.toFixed(4)}°
                        </p>
                      </div>

                      <BirthChart 
                        planets={Object.entries(solarReturn.planets).map(([name, data]) => ({
                          name,
                          longitude: data.longitude,
                          sign: data.sign
                        }))}
                        houses={solarReturn.houses?.houses || []}
                        ascendant={solarReturn.houses?.ascendant}
                      />

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-red-800/30 rounded-lg p-4 text-center">
                          <p className="text-red-300 text-sm">🔥 Fire</p>
                          <p className="text-white text-2xl font-bold">{solarReturn.element_distribution?.fire || 0}</p>
                        </div>
                        <div className="bg-green-800/30 rounded-lg p-4 text-center">
                          <p className="text-green-300 text-sm">🌍 Earth</p>
                          <p className="text-white text-2xl font-bold">{solarReturn.element_distribution?.earth || 0}</p>
                        </div>
                        <div className="bg-blue-800/30 rounded-lg p-4 text-center">
                          <p className="text-blue-300 text-sm">🌬️ Air</p>
                          <p className="text-white text-2xl font-bold">{solarReturn.element_distribution?.air || 0}</p>
                        </div>
                        <div className="bg-cyan-800/30 rounded-lg p-4 text-center">
                          <p className="text-cyan-300 text-sm">💧 Water</p>
                          <p className="text-white text-2xl font-bold">{solarReturn.element_distribution?.water || 0}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* House Interpretations */}
                {interpretation.house_interpretations && interpretation.house_interpretations.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">🏠 הבתים - תחומי החיים שלך השנה</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {interpretation.house_interpretations
                        .filter(h => h.importance === 'high' || h.planets_in_house?.length > 0)
                        .map((house, idx) => (
                        <Card key={idx} className={`${
                          house.importance === 'high' 
                            ? 'bg-gradient-to-r from-yellow-900/70 to-orange-900/70 border-yellow-600' 
                            : 'bg-orange-900/50 border-orange-700/30'
                        }`}>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                              <h3 className="text-xl font-bold text-yellow-200">
                                בית {house.house_number} - {house.house_name}
                              </h3>
                              {house.importance === 'high' && (
                                <Badge className="bg-yellow-600 text-white">
                                  <Sparkles className="w-3 h-3 ml-1" />
                                  חשוב
                                </Badge>
                              )}
                            </div>
                            
                            {house.planets_in_house && house.planets_in_house.length > 0 && (
                              <div className="flex gap-2 mb-3 flex-wrap">
                                {house.planets_in_house.map((planet, i) => (
                                  <Badge key={i} className="bg-orange-700 text-white">
                                    {planet}
                                  </Badge>
                                ))}
                              </div>
                            )}
                            
                            <p className="text-white leading-relaxed">
                              {house.interpretation}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Major Aspects */}
                {interpretation.major_aspects && interpretation.major_aspects.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">✨ אספקטים חשובים</h2>
                    <div className="space-y-4">
                      {interpretation.major_aspects.map((aspect, idx) => (
                        <Card key={idx} className="bg-purple-900/50 border-purple-700/30">
                          <CardContent className="p-6">
                            <h3 className="text-xl font-bold text-purple-200 mb-2">
                              {aspect.aspect_description}
                            </h3>
                            <p className="text-white mb-3 leading-relaxed">
                              {aspect.interpretation}
                            </p>
                            {aspect.timing && (
                              <p className="text-purple-300 text-sm mb-2">
                                ⏰ <strong>מתי:</strong> {aspect.timing}
                              </p>
                            )}
                            {aspect.advice && (
                              <div className="bg-purple-800/30 rounded-lg p-3 mt-3">
                                <p className="text-purple-100 text-sm">💡 {aspect.advice}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deep Insights */}
                {interpretation.insights && interpretation.insights.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">💎 תובנות עמוקות לשנה</h2>
                    {interpretation.insights.map((insight, idx) => (
                      <ExplainableInsight key={idx} insight={insight} showProvenance={isPremium} />
                    ))}
                  </div>
                )}

                {/* Important Months */}
                {interpretation.important_months && interpretation.important_months.length > 0 && (
                  <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-700/30">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-white mb-6">📅 חודשים חשובים</h2>
                      <div className="grid md:grid-cols-2 gap-4">
                        {interpretation.important_months.map((month, idx) => (
                          <div key={idx} className="bg-indigo-800/30 rounded-lg p-4">
                            <h4 className="text-xl font-bold text-indigo-200 mb-2">{month.month}</h4>
                            <p className="text-indigo-100 text-sm mb-2"><strong>למה:</strong> {month.reason}</p>
                            <p className="text-white text-sm">{month.what_to_do}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Practical Advice */}
                {interpretation.practical_advice && interpretation.practical_advice.length > 0 && (
                  <Card className="bg-green-900/50 border-green-700/30">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold text-white mb-6">🌟 עצות מעשיות לשנה</h2>
                      <div className="space-y-3">
                        {interpretation.practical_advice.map((advice, idx) => (
                          <div key={idx} className="flex items-start gap-3 bg-green-800/30 rounded-lg p-4">
                            <span className="text-green-400 text-xl shrink-0">{idx + 1}.</span>
                            <p className="text-white leading-relaxed">{advice}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-orange-500 text-orange-300 hover:bg-orange-800/30 text-lg px-8 py-4"
                  >
                    חשב שנה אחרת
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