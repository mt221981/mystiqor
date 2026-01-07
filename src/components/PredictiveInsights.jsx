import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { TrendingUp, Brain } from "lucide-react";
import { motion } from "framer-motion";

export default function PredictiveInsights({ moodEntries = [], goals = [] }) {
  const prediction = useMemo(() => {
    if (moodEntries.length < 5) return null;

    // Simple trend prediction based on recent moods
    const recent = moodEntries.slice(0, 7);
    const data = recent.reverse().map((m, idx) => ({
      day: idx + 1,
      mood: m.mood_score || 5
    }));

    // Calculate trend
    const avgRecent = recent.reduce((sum, m) => sum + (m.mood_score || 5), 0) / recent.length;
    const trend = avgRecent > 6 ? 'עולה' : avgRecent < 4 ? 'יורדת' : 'יציבה';

    // Predict next 3 days (simple linear extrapolation)
    const lastTwo = data.slice(-2);
    if (lastTwo.length === 2) {
      const slope = lastTwo[1].mood - lastTwo[0].mood;
      for (let i = 1; i <= 3; i++) {
        data.push({
          day: data.length + 1,
          mood: Math.max(1, Math.min(10, lastTwo[1].mood + slope * i)),
          predicted: true
        });
      }
    }

    return { data, trend, avgRecent };
  }, [moodEntries]);

  if (!prediction) return null;

  return (
    <Card className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 border-indigo-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          תחזית מצב רוח
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={prediction.data}>
              <XAxis 
                dataKey="day" 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                domain={[0, 10]} 
                stroke="#9CA3AF" 
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: '#1F2937', 
                  border: '1px solid #374151', 
                  borderRadius: '8px',
                  color: '#F3F4F6'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#6366F1" 
                strokeWidth={2}
                dot={{ fill: '#6366F1' }}
                strokeDasharray={(d) => d.predicted ? '5 5' : '0'}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="mt-4 bg-indigo-950/50 rounded-lg p-3 border border-indigo-700/30">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              <span className="text-white font-semibold text-sm">מגמה: {prediction.trend}</span>
            </div>
            <p className="text-gray-300 text-xs">
              {prediction.trend === 'עולה' 
                ? 'מצב הרוח שלך משתפר - המשך כך! 🌟'
                : prediction.trend === 'יורדת'
                ? 'שים לב לירידה במצב רוח - אולי כדאי לדבר עם מישהו'
                : 'מצב הרוח שלך יציב - זה מצוין!'
              }
            </p>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}