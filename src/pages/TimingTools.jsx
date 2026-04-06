import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Sparkles, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import PageHeader from "@/components/PageHeader";
import ResultCard from "@/components/ResultCard";
import { MysticalLoader } from "@/components/LoadingStates";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";

export default function TimingTools() {
  const [activityType, setActivityType] = useState('business_launch');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const { incrementUsage } = useSubscription();

  const { data: analyses } = useQuery({
    queryKey: ['previousAnalyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 100),
    initialData: []
  });

  const astrologyAnalysis = analyses.find(a => a.tool_type === 'astrology');
  const hasNatalChart = !!astrologyAnalysis;

  const findBestDaysMutation = useMutation({
    mutationFn: async ({ activity, start, end, natal }) => {
      const response = await base44.functions.invoke('findBestDays', {
        activity_type: activity,
        start_date: start,
        end_date: end,
        natal_chart: natal
      });
      return response.data;
    }
  });

  const handleAnalyze = async () => {
    if (!hasNatalChart) {
      toast.error('נדרשת מפת לידה', {
        description: 'עבור תחילה לדף אסטרולוגיה'
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await findBestDaysMutation.mutateAsync({
        activity: activityType,
        start: startDate,
        end: endDate,
        natal: astrologyAnalysis.results
      });

      setResults(result);

      await base44.entities.Analysis.create({
        tool_type: "astrology",
        input_data: {
          type: "timing",
          activity_type: activityType,
          date_range: { start: startDate, end: endDate }
        },
        results: result,
        summary: `מציאת ימים מיטיבים ל${getActivityName(activityType)}`,
        confidence_score: 90
      });

      await incrementUsage();

      toast.success('הניתוח הושלם! ✨');
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      toast.error('אירעה שגיאה');
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getActivityName = (type) => {
    const names = {
      'business_launch': 'השקת עסק',
      'relationship_start': 'התחלת מערכת יחסים',
      'contract_signing': 'חתימת חוזה',
      'surgery': 'ניתוח רפואי',
      'travel': 'נסיעה',
      'creative_project': 'פרויקט יצירתי',
      'job_interview': 'ראיון עבודה',
      'marriage': 'חתונה'
    };
    return names[type] || type;
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'from-green-600 to-green-800';
    if (score >= 60) return 'from-blue-600 to-blue-800';
    if (score >= 40) return 'from-yellow-600 to-yellow-800';
    return 'from-red-600 to-red-800';
  };

  if (isAnalyzing) {
    return <MysticalLoader message="סורק את השמיים ומוצא את הימים המיטיבים ביותר..." />;
  }

  return (
    <SubscriptionGuard toolName="כלי תזמון">
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="כלי תזמון אסטרולוגי ⏰"
            description="מצא את הימים המיטיבים ביותר לפעילויות חשובות"
            icon={Clock}
            iconGradient="from-purple-500 via-pink-500 to-purple-500"
          />

          <AnimatePresence mode="wait">
            {!results ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-2 border-purple-700 shadow-2xl">
                  <CardHeader>
                    <CardTitle className="text-white text-2xl">בחר פעילות וטווח תאריכים</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <label className="text-purple-200 font-semibold mb-2 block">סוג הפעילות</label>
                      <Select value={activityType} onValueChange={setActivityType}>
                        <SelectTrigger className="bg-purple-900/30 border-purple-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="business_launch">השקת עסק / מיזם</SelectItem>
                          <SelectItem value="relationship_start">התחלת מערכת יחסים</SelectItem>
                          <SelectItem value="contract_signing">חתימת חוזה</SelectItem>
                          <SelectItem value="surgery">ניתוח רפואי</SelectItem>
                          <SelectItem value="travel">נסיעה</SelectItem>
                          <SelectItem value="creative_project">פרויקט יצירתי</SelectItem>
                          <SelectItem value="job_interview">ראיון עבודה</SelectItem>
                          <SelectItem value="marriage">חתונה</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-purple-200 font-semibold mb-2 block">מתאריך</label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="bg-purple-900/30 border-purple-600 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-purple-200 font-semibold mb-2 block">עד תאריך</label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="bg-purple-900/30 border-purple-600 text-white"
                        />
                      </div>
                    </div>

                    {!hasNatalChart && (
                      <Card className="bg-amber-900/50 border-amber-700">
                        <CardContent className="p-4">
                          <p className="text-amber-200 text-sm">
                            💡 הניתוח יהיה כללי. למיקוד אישי, צור קודם מפת לידה בדף אסטרולוגיה.
                          </p>
                        </CardContent>
                      </Card>
                    )}

                    <Button
                      onClick={handleAnalyze}
                      className="w-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 hover:from-purple-600 hover:via-pink-600 hover:to-purple-600 text-white text-xl py-6"
                    >
                      <Sparkles className="w-6 h-6 ml-2" />
                      מצא את הימים המיטיבים
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
                {/* Summary */}
                <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-purple-700/30">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-white mb-4">
                      ✨ תוצאות ל{getActivityName(activityType)}
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-purple-800/30 rounded-lg p-4">
                        <p className="text-purple-300 text-sm">ימים נותחו</p>
                        <p className="text-white text-2xl font-bold">{results.total_days_analyzed}</p>
                      </div>
                      <div className="bg-green-800/30 rounded-lg p-4">
                        <p className="text-green-300 text-sm">ימים מיטיבים</p>
                        <p className="text-white text-2xl font-bold">{results.best_days.length}</p>
                      </div>
                      <div className="bg-indigo-800/30 rounded-lg p-4">
                        <p className="text-indigo-300 text-sm">המלצה עליונה</p>
                        <p className="text-white text-xl font-bold">
                          {new Date(results.recommendation.date).toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Best Days */}
                <ResultCard title="🌟 הימים המיטיבים ביותר" gradient="from-green-900/50 to-emerald-700/50" icon={CheckCircle}>
                  <div className="space-y-4">
                    {results.best_days.map((day, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`bg-gradient-to-r ${getScoreColor(day.score)} rounded-xl p-6 border-2 border-white/20`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-white text-3xl font-bold">#{idx + 1}</span>
                              <h3 className="text-white text-2xl font-bold">
                                {new Date(day.date).toLocaleDateString('he-IL', { 
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </h3>
                            </div>
                            <p className="text-white/80">ירח ב{day.moon_sign}</p>
                          </div>
                          <Badge className="bg-white text-black text-xl px-4 py-2">
                            {day.score}/100
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          {day.favorable_factors.length > 0 && (
                            <div className="bg-white/10 rounded-lg p-4">
                              <p className="text-white font-semibold mb-2 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-300" />
                                גורמים חיוביים
                              </p>
                              <ul className="space-y-1">
                                {day.favorable_factors.map((factor, i) => (
                                  <li key={i} className="text-white/90 text-sm">✓ {factor}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {day.unfavorable_factors.length > 0 && (
                            <div className="bg-white/10 rounded-lg p-4">
                              <p className="text-white font-semibold mb-2 flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-300" />
                                גורמים שליליים
                              </p>
                              <ul className="space-y-1">
                                {day.unfavorable_factors.map((factor, i) => (
                                  <li key={i} className="text-white/90 text-sm">✗ {factor}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {(day.void_moon || day.mercury_retro) && (
                          <div className="mt-4 flex gap-2 flex-wrap">
                            {day.void_moon && (
                              <Badge className="bg-amber-700 text-white">
                                🌑 Void Moon
                              </Badge>
                            )}
                            {day.mercury_retro && (
                              <Badge className="bg-red-700 text-white">
                                ⟲ Mercury Retro
                              </Badge>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </ResultCard>

                {/* Worst Days */}
                <ResultCard title="⚠️ ימים להימנע מהם" gradient="from-red-900/50 to-orange-700/50" icon={XCircle}>
                  <div className="space-y-4">
                    {results.worst_days.map((day, idx) => (
                      <div key={idx} className="bg-red-800/30 rounded-lg p-5 border border-red-700/30">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-white text-xl font-bold">
                            {new Date(day.date).toLocaleDateString('he-IL', { 
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </h4>
                          <Badge className="bg-red-600 text-white">
                            {day.score}/100
                          </Badge>
                        </div>
                        <p className="text-red-200 mb-3">ירח ב{day.moon_sign}</p>
                        {day.unfavorable_factors.length > 0 && (
                          <div className="space-y-1">
                            {day.unfavorable_factors.map((factor, i) => (
                              <p key={i} className="text-red-100 text-sm">✗ {factor}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ResultCard>

                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => setResults(null)}
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-800/30 text-lg px-8 py-4"
                  >
                    חיפוש חדש
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