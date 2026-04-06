import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompare, TrendingUp, TrendingDown, Minus, ArrowRight, Calendar, Palette, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Progress } from "@/components/ui/progress";

export default function DrawingComparison() {
  const [selectedAnalysis1, setSelectedAnalysis1] = useState(null);
  const [selectedAnalysis2, setSelectedAnalysis2] = useState(null);

  const { data: analyses, isLoading } = useQuery({
    queryKey: ['drawing_analyses'],
    queryFn: async () => {
      const allAnalyses = await base44.entities.Analysis.filter({ tool_type: 'drawing' });
      return allAnalyses.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    },
    initialData: []
  });

  const analysis1 = analyses.find(a => a.id === selectedAnalysis1);
  const analysis2 = analyses.find(a => a.id === selectedAnalysis2);

  const compareAdvancedMetrics = () => {
    if (!analysis1?.input_data?.quantitative_features || !analysis2?.input_data?.quantitative_features) {
      return null;
    }

    const qf1 = analysis1.input_data.quantitative_features;
    const qf2 = analysis2.input_data.quantitative_features;

    // מיזוג כל המדדים מכל הציורים
    const allMetrics = [];

    Object.keys(qf1).forEach(drawingId => {
      const f1 = qf1[drawingId];
      const f2 = qf2[drawingId];

      if (!f1 || !f2) return;

      // מדדי לחץ וחלקות
      if (f1.advanced_line_analysis && f2.advanced_line_analysis) {
        const a1 = f1.advanced_line_analysis;
        const a2 = f2.advanced_line_analysis;

        if (a1.pressure_analysis && a2.pressure_analysis) {
          allMetrics.push({
            drawing: drawingId,
            metric: "עקביות לחץ",
            value1: a1.pressure_analysis.consistency_score,
            value2: a2.pressure_analysis.consistency_score,
            unit: "/100",
            change: a2.pressure_analysis.consistency_score - a1.pressure_analysis.consistency_score
          });
        }

        if (a1.smoothness_analysis && a2.smoothness_analysis) {
          allMetrics.push({
            drawing: drawingId,
            metric: "חלקות קו",
            value1: a1.smoothness_analysis.smoothness_index,
            value2: a2.smoothness_analysis.smoothness_index,
            unit: "/100",
            change: a2.smoothness_analysis.smoothness_index - a1.smoothness_analysis.smoothness_index
          });

          allMetrics.push({
            drawing: drawingId,
            metric: "רעידות",
            value1: a1.smoothness_analysis.shakiness_score,
            value2: a2.smoothness_analysis.shakiness_score,
            unit: "/100",
            change: a2.smoothness_analysis.shakiness_score - a1.smoothness_analysis.shakiness_score,
            inverse: true // רעידות נמוכות = טוב
          });
        }

        if (a1.hesitation_analysis && a2.hesitation_analysis) {
          allMetrics.push({
            drawing: drawingId,
            metric: "ביטחון בציור",
            value1: a1.hesitation_analysis.confidence_index,
            value2: a2.hesitation_analysis.confidence_index,
            unit: "/100",
            change: a2.hesitation_analysis.confidence_index - a1.hesitation_analysis.confidence_index
          });

          allMetrics.push({
            drawing: drawingId,
            metric: "סימני היסוס",
            value1: a1.hesitation_analysis.hesitation_count,
            value2: a2.hesitation_analysis.hesitation_count,
            unit: "",
            change: a2.hesitation_analysis.hesitation_count - a1.hesitation_analysis.hesitation_count,
            inverse: true
          });
        }

        if (a1.advanced_metrics && a2.advanced_metrics) {
          allMetrics.push({
            drawing: drawingId,
            metric: "שליטה בעט",
            value1: a1.advanced_metrics.pen_control_score,
            value2: a2.advanced_metrics.pen_control_score,
            unit: "/100",
            change: a2.advanced_metrics.pen_control_score - a1.advanced_metrics.pen_control_score
          });
        }
      }

      // מדדים בסיסיים
      if (f1.size_and_position && f2.size_and_position) {
        allMetrics.push({
          drawing: drawingId,
          metric: "תפוסת דף",
          value1: f1.size_and_position.occupancy_percentage,
          value2: f2.size_and_position.occupancy_percentage,
          unit: "%",
          change: f2.size_and_position.occupancy_percentage - f1.size_and_position.occupancy_percentage
        });
      }
    });

    return allMetrics;
  };

  const compareThemes = () => {
    if (!analysis1?.results?.psychological_themes || !analysis2?.results?.psychological_themes) {
      return null;
    }

    const themes1 = analysis1.results.psychological_themes || [];
    const themes2 = analysis2.results.psychological_themes || [];

    const common = themes1.filter(t => themes2.includes(t));
    const removed = themes1.filter(t => !themes2.includes(t));
    const added = themes2.filter(t => !themes1.includes(t));

    return { common, removed, added };
  };

  const getTrendIcon = (change, inverse = false) => {
    const isPositive = inverse ? change < 0 : change > 0;
    if (Math.abs(change) < 1) return <Minus className="w-5 h-5 text-gray-400" />;
    if (isPositive) return <TrendingUp className="w-5 h-5 text-green-400" />;
    return <TrendingDown className="w-5 h-5 text-red-400" />;
  };

  const getTrendColor = (change, inverse = false) => {
    const isPositive = inverse ? change < 0 : change > 0;
    if (Math.abs(change) < 1) return 'bg-gray-700';
    if (isPositive) return 'bg-green-700';
    return 'bg-red-700';
  };

  const metrics = compareAdvancedMetrics();
  const themes = compareThemes();

  if (isLoading) {
    return <div className="text-white text-center p-8">טוען ניתוחים...</div>;
  }

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-pink-900/50 to-purple-900/50 backdrop-blur-xl border-pink-700/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <GitCompare className="w-8 h-8 text-pink-300" />
            <h2 className="text-3xl font-bold text-white">השוואת ניתוחי ציורים</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-pink-200 text-sm mb-2 block">ניתוח ראשון (לפני)</label>
              <Select value={selectedAnalysis1} onValueChange={setSelectedAnalysis1}>
                <SelectTrigger className="bg-pink-900/50 border-pink-600/50 text-white">
                  <SelectValue placeholder="בחר ניתוח..." />
                </SelectTrigger>
                <SelectContent>
                  {analyses.map((analysis) => (
                    <SelectItem key={analysis.id} value={analysis.id}>
                      {format(new Date(analysis.created_date), 'dd/MM/yyyy HH:mm', { locale: he })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {analysis1 && (
                <div className="mt-3 p-3 bg-pink-900/30 rounded-lg">
                  <Badge className="bg-pink-700 text-white mb-2">
                    <Calendar className="w-3 h-3 ml-1" />
                    {format(new Date(analysis1.created_date), 'dd MMMM yyyy', { locale: he })}
                  </Badge>
                  {analysis1.confidence_score && (
                    <p className="text-pink-200 text-sm">
                      ציון ביטחון: {analysis1.confidence_score}%
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
                  {analysis2.confidence_score && (
                    <p className="text-purple-200 text-sm">
                      ציון ביטחון: {analysis2.confidence_score}%
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
          {metrics && metrics.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-blue-900/50 border-blue-700/30">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-blue-200 mb-6 flex items-center gap-2">
                    <Activity className="w-6 h-6" />
                    מדדים כמותיים מתקדמים
                  </h3>
                  <div className="space-y-4">
                    {metrics.map((m, idx) => (
                      <div key={idx} className="bg-blue-950/50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <span className="text-blue-100 font-semibold">{m.metric}</span>
                            <span className="text-blue-300 text-xs mr-2">({m.drawing})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {getTrendIcon(m.change, m.inverse)}
                            <Badge className={getTrendColor(m.change, m.inverse)}>
                              {m.change > 0 ? '+' : ''}{m.change.toFixed(1)}{m.unit}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center">
                          <div className="text-center">
                            <p className="text-pink-300 text-xs mb-1">לפני</p>
                            <p className="text-2xl font-bold text-white">
                              {m.value1?.toFixed(1)}{m.unit}
                            </p>
                            {m.unit === "/100" && (
                              <Progress value={m.value1} className="h-1 mt-2" />
                            )}
                          </div>
                          <div className="flex justify-center">
                            <ArrowRight className="w-6 h-6 text-gray-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-purple-300 text-xs mb-1">אחרי</p>
                            <p className="text-2xl font-bold text-white">
                              {m.value2?.toFixed(1)}{m.unit}
                            </p>
                            {m.unit === "/100" && (
                              <Progress value={m.value2} className="h-1 mt-2" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {themes && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-purple-900/50 border-purple-700/30">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-purple-200 mb-6">🧠 נושאים פסיכולוגיים</h3>
                  
                  {themes.common.length > 0 && (
                    <div className="mb-4">
                      <p className="text-purple-300 font-semibold mb-2">נושאים משותפים (נמשכים):</p>
                      <div className="flex flex-wrap gap-2">
                        {themes.common.map((theme, idx) => (
                          <Badge key={idx} className="bg-gray-700 text-white">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {themes.added.length > 0 && (
                    <div className="mb-4">
                      <p className="text-green-300 font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        נושאים חדשים שהופיעו:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {themes.added.map((theme, idx) => (
                          <Badge key={idx} className="bg-green-700 text-white">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {themes.removed.length > 0 && (
                    <div>
                      <p className="text-orange-300 font-semibold mb-2 flex items-center gap-2">
                        <TrendingDown className="w-4 h-4" />
                        נושאים שנעלמו:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {themes.removed.map((theme, idx) => (
                          <Badge key={idx} className="bg-orange-700 text-white">
                            {theme}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {analysis1.input_data?.drawings && analysis2.input_data?.drawings && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="bg-gray-900/50 border-gray-700/30">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-gray-200 mb-6 flex items-center gap-2">
                    <Palette className="w-6 h-6" />
                    השוואת ציורים
                  </h3>
                  {analysis1.input_data.drawings.map((drawing1, idx) => {
                    const drawing2 = analysis2.input_data.drawings[idx];
                    if (!drawing2) return null;
                    
                    return (
                      <div key={idx} className="mb-6">
                        <h4 className="text-white font-bold mb-3">{drawing1.task_name}</h4>
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-pink-300 text-sm mb-2 text-center">לפני</p>
                            <img src={drawing1.url} alt={`לפני - ${drawing1.task_name}`} className="w-full rounded-lg border-2 border-pink-600/50" />
                          </div>
                          <div>
                            <p className="text-purple-300 text-sm mb-2 text-center">אחרי</p>
                            <img src={drawing2.url} alt={`אחרי - ${drawing2.task_name}`} className="w-full rounded-lg border-2 border-purple-600/50" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
              יש לך {analyses.length} ניתוחי ציורים זמינים
            </p>
          </CardContent>
        </Card>
      )}

      {analyses.length < 2 && (
        <Card className="bg-yellow-900/50 border-yellow-700/30">
          <CardContent className="p-8 text-center">
            <p className="text-yellow-200 text-lg">
              נדרשים לפחות 2 ניתוחים כדי להשוות. בצע ניתוח נוסף כדי לעקוב אחר התפתחות לאורך זמן.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}