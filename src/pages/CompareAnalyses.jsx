import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, TrendingUp, TrendingDown, Minus, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";
import LoadingSpinner from "@/components/LoadingSpinner";
import { usePageView } from "@/components/Analytics";

const TOOL_CONFIG = {
  numerology: { name: "נומרולוגיה", color: "purple" },
  palmistry: { name: "קריאת כף יד", color: "blue" },
  graphology: { name: "גרפולוגיה", color: "indigo" },
  astrology: { name: "אסטרולוגיה", color: "blue" },
  tarot: { name: "טארוט", color: "amber" }
};

export default function CompareAnalyses() {
  usePageView('CompareAnalyses');
  
  const [selectedAnalysis1, setSelectedAnalysis1] = useState(null);
  const [selectedAnalysis2, setSelectedAnalysis2] = useState(null);

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['analyses'],
    queryFn: () => base44.entities.Analysis.list('-created_date', 50),
    initialData: []
  });

  const analysis1 = analyses.find(a => a.id === selectedAnalysis1);
  const analysis2 = analyses.find(a => a.id === selectedAnalysis2);

  const compareNumerology = (a1, a2) => {
    if (!a1?.results?.calculation || !a2?.results?.calculation) return null;

    const comparisons = [];
    const c1 = a1.results.calculation;
    const c2 = a2.results.calculation;

    if (c1.life_path && c2.life_path) {
      comparisons.push({
        field: "מסלול חיים",
        value1: c1.life_path.number,
        value2: c2.life_path.number,
        trend: c1.life_path.number === c2.life_path.number ? 'same' : 'different'
      });
    }

    if (c1.destiny && c2.destiny) {
      comparisons.push({
        field: "גורל",
        value1: c1.destiny.number,
        value2: c2.destiny.number,
        trend: c1.destiny.number === c2.destiny.number ? 'same' : 'different'
      });
    }

    if (c1.soul && c2.soul) {
      comparisons.push({
        field: "נשמה",
        value1: c1.soul.number,
        value2: c2.soul.number,
        trend: c1.soul.number === c2.soul.number ? 'same' : 'different'
      });
    }

    if (c1.personality && c2.personality) {
      comparisons.push({
        field: "אישיות",
        value1: c1.personality.number,
        value2: c2.personality.number,
        trend: c1.personality.number === c2.personality.number ? 'same' : 'different'
      });
    }

    return comparisons;
  };

  const compareAstrology = (a1, a2) => {
    if (!a1?.results?.calculation || !a2?.results?.calculation) return null;

    const comparisons = [];
    const c1 = a1.results.calculation;
    const c2 = a2.results.calculation;

    const sun1 = c1.planets?.find(p => p.name === 'sun');
    const sun2 = c2.planets?.find(p => p.name === 'sun');
    
    if (sun1 && sun2) {
      comparisons.push({
        field: "מזל השמש",
        value1: sun1.sign_hebrew,
        value2: sun2.sign_hebrew,
        trend: sun1.sign_hebrew === sun2.sign_hebrew ? 'same' : 'different'
      });
    }

    const moon1 = c1.planets?.find(p => p.name === 'moon');
    const moon2 = c2.planets?.find(p => p.name === 'moon');
    
    if (moon1 && moon2) {
      comparisons.push({
        field: "מזל הירח",
        value1: moon1.sign_hebrew,
        value2: moon2.sign_hebrew,
        trend: moon1.sign_hebrew === moon2.sign_hebrew ? 'same' : 'different'
      });
    }

    if (c1.ascendant && c2.ascendant) {
      comparisons.push({
        field: "האסנדנט",
        value1: c1.ascendant.sign_hebrew,
        value2: c2.ascendant.sign_hebrew,
        trend: c1.ascendant.sign_hebrew === c2.ascendant.sign_hebrew ? 'same' : 'different'
      });
    }

    return comparisons;
  };

  const getComparisons = () => {
    if (!analysis1 || !analysis2) return null;

    if (analysis1.tool_type !== analysis2.tool_type) {
      return { error: "לא ניתן להשוות ניתוחים מסוגים שונים" };
    }

    if (analysis1.tool_type === 'numerology') {
      return { type: 'numerology', data: compareNumerology(analysis1, analysis2) };
    }

    if (analysis1.tool_type === 'astrology') {
      return { type: 'astrology', data: compareAstrology(analysis1, analysis2) };
    }

    return { error: "השוואה זמינה רק לנומרולוגיה ואסטרולוגיה כרגע" };
  };

  const comparisons = getComparisons();

  const getTrendIcon = (trend) => {
    if (trend === 'same') return <Minus className="w-5 h-5 text-gray-400" />;
    if (trend === 'up') return <TrendingUp className="w-5 h-5 text-green-400" />;
    if (trend === 'down') return <TrendingDown className="w-5 h-5 text-red-400" />;
    return <ArrowRight className="w-5 h-5 text-blue-400" />;
  };

  if (isLoading) {
    return <LoadingSpinner message="טוען ניתוחים..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/30 to-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="השוואת ניתוחים"
          description="השווה בין ניתוחים שונים וגלה תובנות חדשות"
          icon={GitCompare}
          iconGradient="from-indigo-600 to-purple-600"
        />

        {/* Selection */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card className="bg-gray-900/80 backdrop-blur-xl border-indigo-700/30">
            <CardHeader>
              <CardTitle className="text-white text-xl">ניתוח ראשון</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAnalysis1} onValueChange={setSelectedAnalysis1}>
                <SelectTrigger className="bg-gray-800 border-indigo-600/50 text-white">
                  <SelectValue placeholder="בחר ניתוח..." />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((analysis) => (
                    <SelectItem key={analysis.id} value={analysis.id}>
                      {TOOL_CONFIG[analysis.tool_type]?.name} - {format(new Date(analysis.created_date), 'dd/MM/yyyy', { locale: he })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {analysis1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-indigo-900/30 rounded-lg border border-indigo-700/30"
                >
                  <Badge className="bg-indigo-900/50 text-indigo-200 mb-2">
                    {TOOL_CONFIG[analysis1.tool_type]?.name}
                  </Badge>
                  <p className="text-white font-semibold mb-1">{analysis1.summary}</p>
                  <p className="text-indigo-300 text-sm">
                    {format(new Date(analysis1.created_date), 'dd MMMM yyyy', { locale: he })}
                  </p>
                  {analysis1.confidence_score && (
                    <Badge className="bg-green-900/50 text-green-200 mt-2">
                      דיוק: {analysis1.confidence_score}%
                    </Badge>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
            <CardHeader>
              <CardTitle className="text-white text-xl">ניתוח שני</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedAnalysis2} onValueChange={setSelectedAnalysis2}>
                <SelectTrigger className="bg-gray-800 border-purple-600/50 text-white">
                  <SelectValue placeholder="בחר ניתוח..." />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((analysis) => (
                    <SelectItem key={analysis.id} value={analysis.id}>
                      {TOOL_CONFIG[analysis.tool_type]?.name} - {format(new Date(analysis.created_date), 'dd/MM/yyyy', { locale: he })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {analysis2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 p-4 bg-purple-900/30 rounded-lg border border-purple-700/30"
                >
                  <Badge className="bg-purple-900/50 text-purple-200 mb-2">
                    {TOOL_CONFIG[analysis2.tool_type]?.name}
                  </Badge>
                  <p className="text-white font-semibold mb-1">{analysis2.summary}</p>
                  <p className="text-purple-300 text-sm">
                    {format(new Date(analysis2.created_date), 'dd MMMM yyyy', { locale: he })}
                  </p>
                  {analysis2.confidence_score && (
                    <Badge className="bg-green-900/50 text-green-200 mt-2">
                      דיוק: {analysis2.confidence_score}%
                    </Badge>
                  )}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Results */}
        {comparisons && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {comparisons.error ? (
              <Card className="bg-red-900/30 backdrop-blur-xl border-red-700/30">
                <CardContent className="p-8 text-center">
                  <p className="text-red-200 text-lg">{comparisons.error}</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-indigo-700/30 mb-8">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-white mb-4 text-center flex items-center justify-center gap-3">
                      <Sparkles className="w-8 h-8 text-yellow-400" />
                      תוצאות ההשוואה
                      <Sparkles className="w-8 h-8 text-yellow-400" />
                    </h2>
                    <p className="text-center text-indigo-200 text-lg">
                      השוואה בין {TOOL_CONFIG[analysis1.tool_type]?.name} ניתוחים
                    </p>
                  </CardContent>
                </Card>

                {comparisons.data && comparisons.data.length > 0 ? (
                  <div className="space-y-4">
                    {comparisons.data.map((comp, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="bg-gray-900/80 backdrop-blur-xl border-indigo-700/30">
                          <CardContent className="p-6">
                            <div className="grid md:grid-cols-3 gap-6 items-center">
                              {/* First Value */}
                              <div className="text-center">
                                <p className="text-indigo-300 text-sm mb-2">{comp.field}</p>
                                <div className="text-4xl font-bold text-white bg-indigo-900/30 rounded-xl p-4">
                                  {comp.value1}
                                </div>
                              </div>

                              {/* Trend */}
                              <div className="flex justify-center">
                                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center">
                                  {getTrendIcon(comp.trend)}
                                </div>
                              </div>

                              {/* Second Value */}
                              <div className="text-center">
                                <p className="text-purple-300 text-sm mb-2">{comp.field}</p>
                                <div className="text-4xl font-bold text-white bg-purple-900/30 rounded-xl p-4">
                                  {comp.value2}
                                </div>
                              </div>
                            </div>

                            <div className="mt-4 text-center">
                              {comp.trend === 'same' ? (
                                <Badge className="bg-green-900/50 text-green-200 border-green-600/50">
                                  ✓ זהה בשני הניתוחים
                                </Badge>
                              ) : (
                                <Badge className="bg-blue-900/50 text-blue-200 border-blue-600/50">
                                  ↔ שינוי בין הניתוחים
                                </Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/30">
                    <CardContent className="p-12 text-center">
                      <p className="text-gray-400 text-lg">אין נתונים להשוואה</p>
                    </CardContent>
                  </Card>
                )}

                {/* Summary */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8"
                >
                  <Card className="bg-purple-900/30 backdrop-blur-xl border-purple-700/30">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl">💡 תובנות</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-purple-200 leading-relaxed text-lg">
                        השוואה בין ניתוחים יכולה לעזור לזהות דפוסים, שינויים לאורך זמן, 
                        ותובנות מעמיקות יותר על האישיות והגורל שלך. שים לב לדפוסים חוזרים 
                        ולשינויים משמעותיים בין הניתוחים.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </>
            )}
          </motion.div>
        )}

        {!comparisons && (
          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
            <CardContent className="p-16 text-center">
              <GitCompare className="w-24 h-24 text-purple-400 mx-auto mb-6 opacity-50" />
              <h3 className="text-2xl font-bold text-white mb-4">
                בחר שני ניתוחים להשוואה
              </h3>
              <p className="text-purple-200 text-lg">
                השוואה זמינה לניתוחי נומרולוגיה ואסטרולוגיה
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}