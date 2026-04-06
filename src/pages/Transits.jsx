import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, AlertCircle, Zap, Moon, RefreshCw, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import { MysticalLoader } from "@/components/LoadingStates";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";

export default function Transits() {
  const [transits, setTransits] = useState(null);
  const [interpretation, setInterpretation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const queryClient = useQueryClient();
  
  const { incrementUsage } = useSubscription();

  // Get user's natal chart
  const { data: analyses } = useQuery({
    queryKey: ['previousAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 100),
    initialData: []
  });

  const astrologyAnalysis = analyses.find(a => a.tool_type === 'astrology');
  const hasNatalChart = !!astrologyAnalysis;

  const calculateTransitsMutation = useMutation({
    mutationFn: async ({ natalChart }) => {
      const response = await base44.functions.invoke('calculateTransits', {
        natal_chart: natalChart,
        target_date: new Date().toISOString()
      });
      return response.data;
    }
  });

  const interpretTransitsMutation = useMutation({
    mutationFn: async (transitData) => {
      const response = await base44.functions.invoke('interpretTransits', {
        transit_data: transitData
      });
      return response.data;
    }
  });

  const handleCalculate = async () => {
    if (!hasNatalChart) {
      toast.error('קודם צריך לעשות ניתוח אסטרולוגי', {
        description: 'עבור לדף אסטרולוגיה וצור את מפת הלידה שלך'
      });
      return;
    }

    setIsCalculating(true);

    try {
      // Calculate transits
      const transitData = await calculateTransitsMutation.mutateAsync({
        natalChart: astrologyAnalysis.results
      });
      
      setTransits(transitData);

      // Interpret transits
      const interpretationResult = await interpretTransitsMutation.mutateAsync(transitData);
      
      setInterpretation(interpretationResult);

      // Save analysis
      await base44.entities.Analysis.create({
        tool_type: "astrology",
        input_data: { 
          type: "transits",
          target_date: new Date().toISOString()
        },
        results: {
          transits: transitData,
          interpretation: interpretationResult
        },
        summary: "ניתוח מעברים אסטרולוגיים",
        confidence_score: 100
      });

      await incrementUsage();

      toast.success('המעברים חושבו בהצלחה! 🌟');
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      toast.error('אירעה שגיאה בחישוב');
      console.error(error);
    } finally {
      setIsCalculating(false);
    }
  };

  if (isCalculating) {
    return <MysticalLoader message="מחשב מעברים אסטרולוגיים נוכחיים..." />;
  }

  const getAspectColor = (aspectType) => {
    const colors = {
      'Conjunction': 'from-purple-600 to-purple-800',
      'Opposition': 'from-red-600 to-red-800',
      'Trine': 'from-green-600 to-green-800',
      'Square': 'from-orange-600 to-orange-800',
      'Sextile': 'from-blue-600 to-blue-800'
    };
    return colors[aspectType] || 'from-gray-600 to-gray-800';
  };

  const getAspectIcon = (aspectType) => {
    const icons = {
      'Conjunction': '☌',
      'Opposition': '☍',
      'Trine': '△',
      'Square': '□',
      'Sextile': '⚹'
    };
    return icons[aspectType] || '○';
  };

  return (
    <SubscriptionGuard toolName="מעברים אסטרולוגיים">
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="מעברים אסטרולוגיים 🌙"
            description="ניתוח התנועות האסטרולוגיות הנוכחיות והשפעתן עליך"
            icon={TrendingUp}
            iconGradient="from-purple-500 via-pink-500 to-purple-500"
          />

          <AnimatePresence mode="wait">
            {!transits ? (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {!hasNatalChart && (
                  <Card className="bg-amber-900/50 border-amber-700 mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-1" />
                        <div>
                          <h3 className="text-amber-200 font-bold text-lg mb-2">נדרשת מפת לידה</h3>
                          <p className="text-amber-300 mb-4">
                            כדי לחשב את המעברים האסטרולוגיים, קודם צריך ליצור את מפת הלידה שלך.
                          </p>
                          <Button
                            onClick={() => window.location.href = '/astrology'}
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            עבור לאסטרולוגיה
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-2 border-purple-700 shadow-2xl">
                  <CardContent className="p-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl"
                    >
                      <TrendingUp className="w-12 h-12 text-white" />
                    </motion.div>

                    <h2 className="text-4xl font-bold text-white mb-4">
                      מה קורה עכשיו?
                    </h2>

                    <p className="text-xl text-purple-200 mb-6">
                      גלה את התנועות האסטרולוגיות הנוכחיות והשפעתן על חייך
                    </p>

                    <div className="bg-indigo-900/50 rounded-xl p-6 mb-8 max-w-2xl mx-auto">
                      <h3 className="text-indigo-200 font-bold text-lg mb-4">מה כלול בניתוח?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-right">
                        <div className="flex items-start gap-3">
                          <Calendar className="w-5 h-5 text-indigo-300 shrink-0 mt-1" />
                          <div>
                            <p className="text-indigo-100 font-semibold">מעברים נוכחיים</p>
                            <p className="text-indigo-300 text-sm">כל הכוכבים והמיקומים שלהם היום</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Zap className="w-5 h-5 text-indigo-300 shrink-0 mt-1" />
                          <div>
                            <p className="text-indigo-100 font-semibold">אספקטים</p>
                            <p className="text-indigo-300 text-sm">קשרים בין כוכבי המעבר למפת הלידה</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Moon className="w-5 h-5 text-indigo-300 shrink-0 mt-1" />
                          <div>
                            <p className="text-indigo-100 font-semibold">תנאים מיוחדים</p>
                            <p className="text-indigo-300 text-sm">Void of Course Moon, Mercury Retrograde</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <TrendingUp className="w-5 h-5 text-indigo-300 shrink-0 mt-1" />
                          <div>
                            <p className="text-indigo-100 font-semibold">פרשנות מעמיקה</p>
                            <p className="text-indigo-300 text-sm">ניתוח של כל מעבר והמלצות פרקטיות</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={handleCalculate}
                      disabled={!hasNatalChart}
                      className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white text-xl px-12 py-7 shadow-2xl disabled:opacity-50"
                    >
                      <RefreshCw className="w-7 h-7 ml-2" />
                      חשב מעברים נוכחיים
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
                {/* Header */}
                <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-purple-700/30">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-4xl font-bold text-white mb-2">
                          המעברים שלך היום 🌙
                        </h2>
                        <p className="text-purple-200 text-lg">
                          {new Date(transits.target_date).toLocaleDateString('he-IL', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <Button onClick={handleCalculate} variant="outline" className="border-purple-400">
                        <RefreshCw className="w-5 h-5 ml-2" />
                        רענן
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-purple-800/30 rounded-lg p-4">
                        <p className="text-purple-300 text-sm">סה"כ מעברים</p>
                        <p className="text-white text-2xl font-bold">{transits.metadata.total_transits}</p>
                      </div>
                      <div className="bg-indigo-800/30 rounded-lg p-4">
                        <p className="text-indigo-300 text-sm">מעברים חזקים</p>
                        <p className="text-white text-2xl font-bold">{transits.transits.length}</p>
                      </div>
                      {transits.special_conditions.void_of_course_moon && (
                        <div className="bg-amber-800/30 rounded-lg p-4 col-span-2">
                          <div className="flex items-center gap-2">
                            <Moon className="w-5 h-5 text-amber-400" />
                            <p className="text-amber-200 font-semibold">Void of Course Moon</p>
                          </div>
                          <p className="text-amber-300 text-sm">הירח נטול מהלך</p>
                        </div>
                      )}
                      {transits.special_conditions.mercury_retrograde && (
                        <div className="bg-red-800/30 rounded-lg p-4 col-span-2">
                          <div className="flex items-center gap-2">
                            <RefreshCw className="w-5 h-5 text-red-400" />
                            <p className="text-red-200 font-semibold">Mercury Retrograde</p>
                          </div>
                          <p className="text-red-300 text-sm">מרקורי רטרוגרדי</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Current Planets */}
                <ResultCard title="🌌 מיקומי הכוכבים היום" gradient="from-indigo-900/50 to-purple-900/50">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {Object.entries(transits.transiting_planets).map(([planet, data]) => (
                      <div key={planet} className="bg-indigo-800/30 rounded-lg p-4">
                        <p className="text-indigo-300 font-semibold mb-1">{planet}</p>
                        <p className="text-white">{data.sign}</p>
                        <p className="text-indigo-400 text-sm">{data.longitude.toFixed(2)}°</p>
                      </div>
                    ))}
                  </div>
                </ResultCard>

                {/* Overall Summary */}
                {interpretation && (
                  <>
                    <ResultCard title="📊 סיכום כללי" gradient="from-purple-900/50 to-pink-900/50">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-3">האנרגיה הכללית</h3>
                          <p className="text-purple-100 text-lg leading-relaxed">{interpretation.current_energy}</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-green-900/30 rounded-xl p-6">
                            <h4 className="text-green-200 font-bold text-xl mb-4 flex items-center gap-2">
                              <Zap className="w-6 h-6" />
                              הזדמנויות
                            </h4>
                            <ul className="space-y-3">
                              {interpretation.top_opportunities.map((opp, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <ChevronRight className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                  <span className="text-green-100">{opp}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="bg-orange-900/30 rounded-xl p-6">
                            <h4 className="text-orange-200 font-bold text-xl mb-4 flex items-center gap-2">
                              <AlertCircle className="w-6 h-6" />
                              אתגרים
                            </h4>
                            <ul className="space-y-3">
                              {interpretation.top_challenges.map((chal, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <ChevronRight className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                                  <span className="text-orange-100">{chal}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="bg-purple-900/30 rounded-xl p-6">
                          <h4 className="text-purple-200 font-bold text-xl mb-3">💡 המלצה מרכזית</h4>
                          <p className="text-purple-100 text-lg leading-relaxed">{interpretation.main_advice}</p>
                        </div>

                        <div className="bg-indigo-900/30 rounded-xl p-6">
                          <h4 className="text-indigo-200 font-bold text-xl mb-3">📝 הסיכום המלא</h4>
                          <p className="text-indigo-100 leading-relaxed whitespace-pre-line">{interpretation.overall_summary}</p>
                        </div>
                      </div>
                    </ResultCard>

                    {/* Individual Transits */}
                    <div className="space-y-6">
                      <h2 className="text-3xl font-bold text-white flex items-center gap-2">
                        <TrendingUp className="w-8 h-8 text-purple-400" />
                        ניתוח מפורט של כל מעבר
                      </h2>
                      {interpretation.transit_interpretations.map((transit, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className={`bg-gradient-to-r ${getAspectColor(transit.transit_info.aspect)} backdrop-blur-xl border-2 border-white/20`}>
                            <CardHeader>
                              <div className="flex justify-between items-start flex-wrap gap-4">
                                <div className="flex items-center gap-3">
                                  <div className="text-4xl">{getAspectIcon(transit.transit_info.aspect)}</div>
                                  <div>
                                    <CardTitle className="text-white text-2xl">{transit.title}</CardTitle>
                                    <p className="text-white/80 mt-1">
                                      {transit.transit_info.transiting_planet} {transit.transit_info.aspect} Natal {transit.transit_info.natal_planet}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  <Badge className="bg-white/20 text-white">
                                    Orb: {transit.transit_info.orb}°
                                  </Badge>
                                  {transit.transit_info.duration_estimate && (
                                    <Badge className="bg-white/20 text-white">
                                      {transit.transit_info.duration_estimate}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="bg-white/10 rounded-lg p-4">
                                <p className="text-white leading-relaxed whitespace-pre-line">{transit.content}</p>
                              </div>

                              {transit.affected_areas && transit.affected_areas.length > 0 && (
                                <div>
                                  <p className="text-white/80 font-semibold mb-2">תחומים מושפעים:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {transit.affected_areas.map((area, i) => (
                                      <Badge key={i} variant="outline" className="bg-white/10 border-white/30 text-white">
                                        {area}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {transit.action_items && transit.action_items.length > 0 && (
                                <div className="bg-white/10 rounded-lg p-4">
                                  <p className="text-white font-semibold mb-3">✅ פעולות מומלצות:</p>
                                  <ul className="space-y-2">
                                    {transit.action_items.map((action, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <ChevronRight className="w-5 h-5 text-white shrink-0 mt-0.5" />
                                        <span className="text-white/90">{action}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {transit.timing && (
                                <div className="bg-white/10 rounded-lg p-4">
                                  <p className="text-white/80 font-semibold mb-2">⏰ תזמון:</p>
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                    {transit.timing.phase && (
                                      <div>
                                        <p className="text-white/60">שלב:</p>
                                        <p className="text-white">{transit.timing.phase}</p>
                                      </div>
                                    )}
                                    {transit.timing.peak_date && (
                                      <div>
                                        <p className="text-white/60">שיא:</p>
                                        <p className="text-white">{new Date(transit.timing.peak_date).toLocaleDateString('he-IL')}</p>
                                      </div>
                                    )}
                                    {transit.timing.effect_duration && (
                                      <div>
                                        <p className="text-white/60">משך:</p>
                                        <p className="text-white">{transit.timing.effect_duration}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </div>
                  </>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={() => {
                      setTransits(null);
                      setInterpretation(null);
                    }}
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-800/30 text-lg px-8 py-4"
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