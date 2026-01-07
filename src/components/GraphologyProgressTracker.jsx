import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { motion } from "framer-motion";

export default function GraphologyProgressTracker() {
  const { data: analyses, isLoading } = useQuery({
    queryKey: ['graphology_history'],
    queryFn: async () => {
      const results = await base44.entities.Analysis.filter({ tool_type: 'graphology' });
      return results
        .filter(a => a.results?.form_niveau?.score && a.results?.personality_snapshot?.big_five_comparison)
        .sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    },
    initialData: []
  });

  if (isLoading || analyses.length < 2) return null;

  const chartData = analyses.map((analysis, idx) => ({
    date: format(new Date(analysis.created_date), 'dd/MM', { locale: he }),
    fullDate: format(new Date(analysis.created_date), 'dd MMMM yyyy', { locale: he }),
    formniveau: analysis.results.form_niveau.score,
    openness: analysis.results.personality_snapshot.big_five_comparison.openness,
    conscientiousness: analysis.results.personality_snapshot.big_five_comparison.conscientiousness,
    extraversion: analysis.results.personality_snapshot.big_five_comparison.extraversion,
    agreeableness: analysis.results.personality_snapshot.big_five_comparison.agreeableness,
    stability: 100 - analysis.results.personality_snapshot.big_five_comparison.neuroticism
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-xl border-indigo-700/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-indigo-300" />
              <div>
                <h3 className="text-2xl font-bold text-white">מעקב התפתחות</h3>
                <p className="text-indigo-300 text-sm">{analyses.length} ניתוחים לאורך זמן</p>
              </div>
            </div>
            <Badge className="bg-blue-700 text-white">
              <Activity className="w-4 h-4 ml-1" />
              ניתוח מגמות
            </Badge>
          </div>

          <div className="mb-8">
            <h4 className="text-xl font-bold text-indigo-200 mb-4">📊 Formniveau לאורך זמן</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#D1D5DB' }}
                />
                <YAxis 
                  domain={[0, 10]} 
                  stroke="#9CA3AF"
                  tick={{ fill: '#D1D5DB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '2px solid #6366F1',
                    borderRadius: '8px'
                  }}
                  labelStyle={{ color: '#C7D2FE' }}
                  itemStyle={{ color: '#E0E7FF' }}
                />
                <Line
                  type="monotone"
                  dataKey="formniveau"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', r: 6 }}
                  activeDot={{ r: 8 }}
                  name="Formniveau"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h4 className="text-xl font-bold text-blue-200 mb-4">📈 Big Five לאורך זמן</h4>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  tick={{ fill: '#D1D5DB' }}
                />
                <YAxis 
                  domain={[0, 100]} 
                  stroke="#9CA3AF"
                  tick={{ fill: '#D1D5DB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: '2px solid #3B82F6',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="openness" stroke="#F59E0B" strokeWidth={2} name="פתיחות" />
                <Line type="monotone" dataKey="conscientiousness" stroke="#3B82F6" strokeWidth={2} name="מצפוניות" />
                <Line type="monotone" dataKey="extraversion" stroke="#EF4444" strokeWidth={2} name="מוחצנות" />
                <Line type="monotone" dataKey="agreeableness" stroke="#10B981" strokeWidth={2} name="נעימות" />
                <Line type="monotone" dataKey="stability" stroke="#8B5CF6" strokeWidth={2} name="יציבות" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>
                הגרפים מבוססים על ניתוחים תיאורטיים. שינויים עשויים לשקף התפתחות אישית או שונות במדגם הכתב.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}