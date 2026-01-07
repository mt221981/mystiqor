import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, TrendingUp, TrendingDown, Minus, ArrowRight, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from "recharts";

export default function GraphologyComparison() {
  const [selectedAnalysis1, setSelectedAnalysis1] = useState(null);
  const [selectedAnalysis2, setSelectedAnalysis2] = useState(null);

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['graphology_analyses'],
    queryFn: async () => {
      const allAnalyses = await base44.entities.Analysis.filter({ tool_type: 'graphology' });
      return allAnalyses.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    initialData: []
  });

  const analysis1 = analyses.find(a => a.id === selectedAnalysis1);
  const analysis2 = analyses.find(a => a.id === selectedAnalysis2);

  const compareQuantitativeMeasurements = () => {
    if (!analysis1?.results?.quantitative_measurements || !analysis2?.results?.quantitative_measurements) {
      return null;
    }

    const m1 = analysis1.results.quantitative_measurements;
    const m2 = analysis2.results.quantitative_measurements;

    return [
      {
        metric: "זווית נטייה",
        value1: m1.slant_degrees_exact,
        value2: m2.slant_degrees_exact,
        unit: "°",
        change: m2.slant_degrees_exact - m1.slant_degrees_exact
      },
      {
        metric: "גובה אזור אמצעי",
        value1: m1.middle_zone_mm_exact,
        value2: m2.middle_zone_mm_exact,
        unit: "מ\"מ",
        change: m2.middle_zone_mm_exact - m1.middle_zone_mm_exact
      },
      {
        metric: "לחץ כתיבה",
        value1: m1.pressure_scale_1_10,
        value2: m2.pressure_scale_1_10,
        unit: "/10",
        change: m2.pressure_scale_1_10 - m1.pressure_scale_1_10
      },
      {
        metric: "ריווח מילים",
        value1: m1.spacing_words_mm_avg,
        value2: m2.spacing_words_mm_avg,
        unit: "מ\"מ",
        change: m2.spacing_words_mm_avg - m1.spacing_words_mm_avg
      },
      {
        metric: "ציון קצב",
        value1: m1.rhythm_score_1_10,
        value2: m2.rhythm_score_1_10,
        unit: "/10",
        change: m2.rhythm_score_1_10 - m1.rhythm_score_1_10
      }
    ];
  };

  const compareBigFive = () => {
    if (!analysis1?.results?.personality_snapshot?.big_five_comparison || 
        !analysis2?.results?.personality_snapshot?.big_five_comparison) {
      return null;
    }

    const b1 = analysis1.results.personality_snapshot.big_five_comparison;
    const b2 = analysis2.results.personality_snapshot.big_five_comparison;

    return [
      { dimension: "פתיחות", value1: b1.openness, value2: b2.openness },
      { dimension: "מצפוניות", value1: b1.conscientiousness, value2: b2.conscientiousness },
      { dimension: "מוחצנות", value1: b1.extraversion, value2: b2.extraversion },
      { dimension: "נעימות", value1: b1.agreeableness, value2: b2.agreeableness },
      { dimension: "יציבות", value1: 100 - b1.neuroticism, value2: 100 - b2.neuroticism }
    ];
  };

  const compareFormniveau = () => {
    if (!analysis1?.results?.form_niveau || !analysis2?.results?.form_niveau) {
      return null;
    }

    return {
      score1: analysis1.results.form_niveau.score,
      score2: analysis2.results.form_niveau.score,
      change: analysis2.results.form_niveau.score - analysis1.results.form_niveau.score
    };
  };

  const getTrendIcon = (change) => {
    if (Math.abs(change) < 0.5) return <Minus className="w-5 h-5 text-gray-400" />;
    if (change > 0) return <TrendingUp className="w-5 h-5 text-green-400" />;
    return <TrendingDown className="w-5 h-5 text-red-400" />;
  };

  const measurements = compareQuantitativeMeasurements();
  const bigFive = compareBigFive();
  const formniveau = compareFormniveau();

  if (isLoading) {
    return <div className="text-white text-center p-8">טוען ניתוחים...</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-indigo-700/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <GitCompare className="w-8 h-8 text-indigo-300" />
            <h2 className="text-3xl font-bold text-white">השוואת ניתוחי גרפולוגיה</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-indigo-200 text-sm mb-2 block">ניתוח ראשון (לפני)</label>
              <Select value={selectedAnalysis1} onValueChange={setSelectedAnalysis1}>
                <SelectTrigger className="bg-indigo-900/50 border-indigo-600/50 text-white">
                  <SelectValue placeholder="בחר ניתוח..." />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((analysis) => (
                    <SelectItem key={analysis.id} value={analysis.id}>
                      {format(new Date(analysis.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                      {analysis.summary && ` - ${analysis.summary.substring(0, 30)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {analysis1 && (
                <div className="mt-3 p-3 bg-indigo-900/30 rounded-lg">
                  <Badge className="bg-indigo-700 text-white mb-2">
                    <Calendar className="w-3 h-3 ml-1" />
                    {format(new Date(analysis1.created_date), 'dd MMMM yyyy', { locale: he })}
                  </Badge>
                  {analysis1.results?.form_niveau && (
                    <p className="text-indigo-200 text-sm">
                      Formniveau: {analysis1.results.form_niveau.score}/10
                    </p>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-purple-200 text-sm mb-2 block">ניתוח שני (אחרי)</label>
              <Select value={selectedAnalysis2} onValueChange={setSelectedAnalysis2}>
                <SelectTrigger className="bg-purple-900/50 border-purple-600/50 text-white">
                  <SelectValue placeholder="בחר ניתוח..." />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((analysis) => (
                    <SelectItem key={analysis.id} value={analysis.id}>
                      {format(new Date(analysis.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                      {analysis.summary && ` - ${analysis.summary.substring(0, 30)}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {analysis2 && (
                <div className="mt-3 p-3 bg-purple-900/30 rounded-lg">
                  <Badge className="bg-purple-700 text-white mb-2">
                    <Calendar className="w-3 h-3 ml-1" />
                    {format(new Date(analysis2.created_date), 'dd MMMM yyyy', { locale: he })}
                  </Badge>
                  {analysis2.results?.form_niveau && (
                    <p className="text-purple-200 text-sm">
                      Formniveau: {analysis2.results.form_niveau.score}/10
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {analysis1 && analysis2 && (
        <>
          {formniveau && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-purple-900/50 border-purple-700/30">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-purple-200 mb-6">📊 Formniveau</h3>
                  <div className="grid md:grid-cols-3 gap-6 items-center">
                    <div className="text-center">
                      <p className="text-indigo-300 text-sm mb-2">לפני</p>
                      <div className="text-6xl font-bold text-white bg-indigo-900/30 rounded-xl p-6">
                        {formniveau.score1}
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center">
                        {getTrendIcon(formniveau.change)}
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-purple-300 text-sm mb-2">אחרי</p>
                      <div className="text-6xl font-bold text-white bg-purple-900/30 rounded-xl p-6">
                        {formniveau.score2}
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-center">
                    <Badge className={`text-lg ${
                      Math.abs(formniveau.change) < 0.5 ? 'bg-gray-700' :
                      formniveau.change > 0 ? 'bg-green-700' : 'bg-red-700'
                    }`}>
                      {formniveau.change > 0 ? '+' : ''}{formniveau.change.toFixed(1)} נקודות
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {bigFive && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-blue-900/50 border-blue-700/30">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-blue-200 mb-6">📈 Big Five - לפני ואחרי</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <RadarChart data={bigFive}>
                      <PolarGrid stroke="#4B5563" />
                      <PolarAngleAxis 
                        dataKey="dimension" 
                        tick={{ fill: '#93C5FD', fontSize: 14, fontWeight: 'bold' }}
                      />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar
                        name="לפני"
                        dataKey="value1"
                        stroke="#818CF8"
                        fill="#818CF8"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <Radar
                        name="אחרי"
                        dataKey="value2"
                        stroke="#A78BFA"
                        fill="#A78BFA"
                        fillOpacity={0.5}
                        strokeWidth={2}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {measurements && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gray-900/50 border-gray-700/30">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-gray-200 mb-6">📏 מדידות כמותיות</h3>
                  <div className="space-y-4">
                    {measurements.map((m, idx) => (
                      <div key={idx} className="bg-gray-800/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-gray-300 font-semibold">{m.metric}</span>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(m.change)}
                            <Badge className={`${
                              Math.abs(m.change) < 0.5 ? 'bg-gray-700' :
                              m.change > 0 ? 'bg-green-700' : 'bg-red-700'
                            }`}>
                              {m.change > 0 ? '+' : ''}{m.change.toFixed(1)}{m.unit}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <p className="text-indigo-300 text-xs mb-1">לפני</p>
                            <p className="text-2xl font-bold text-white">
                              {m.value1?.toFixed(1)}{m.unit}
                            </p>
                          </div>
                          <div className="flex justify-center">
                            <ArrowRight className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-purple-300 text-xs mb-1">אחרי</p>
                            <p className="text-2xl font-bold text-white">
                              {m.value2?.toFixed(1)}{m.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {analysis1.image_url && analysis2.image_url && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gray-900/50 border-gray-700/30">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-gray-200 mb-6">🖼️ תמונות כתב היד</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-indigo-300 text-sm mb-2 text-center">לפני</p>
                      <img src={analysis1.image_url} alt="לפני" className="w-full rounded-lg" />
                    </div>
                    <div>
                      <p className="text-purple-300 text-sm mb-2 text-center">אחרי</p>
                      <img src={analysis2.image_url} alt="אחרי" className="w-full rounded-lg" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </>
      )}

      {!analysis1 && !analysis2 && analyses.length > 0 && (
        <Card className="bg-gray-900/50 border-gray-700/30">
          <CardContent className="p-12 text-center">
            <GitCompare className="w-24 h-24 text-gray-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">
              בחר שני ניתוחים להשוואה
            </h3>
            <p className="text-gray-400 text-lg">
              יש לך {analyses.length} ניתוחי גרפולוגיה זמינים
            </p>
          </CardContent>
        </Card>
      )}

      {analyses.length < 2 && (
        <Card className="bg-yellow-900/50 border-yellow-700/30">
          <CardContent className="p-8 text-center">
            <p className="text-yellow-200 text-lg">
              נדרשים לפחות 2 ניתוחים כדי להשוות. בצע ניתוח נוסף כדי לראות שינויים לאורך זמן.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}