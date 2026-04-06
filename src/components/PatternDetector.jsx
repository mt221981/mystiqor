import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PatternDetector({ moodEntries = [], goals = [] }) {
  const patterns = useMemo(() => {
    if (moodEntries.length < 3) return [];

    const detected = [];

    // Detect mood patterns
    const recentMoods = moodEntries.slice(0, 7);
    const avgMood = recentMoods.reduce((sum, m) => sum + (m.mood_score || 5), 0) / recentMoods.length;

    if (avgMood > 7) {
      detected.push({
        type: "positive",
        title: "מגמה חיובית במצב רוח",
        description: "מצב הרוח שלך עולה בימים האחרונים 📈",
        icon: TrendingUp,
        color: "text-green-400"
      });
    } else if (avgMood < 4) {
      detected.push({
        type: "warning",
        title: "ירידה במצב רוח",
        description: "שים לב - מצב הרוח נמוך בתקופה האחרונה",
        icon: AlertCircle,
        color: "text-yellow-400"
      });
    }

    // Detect goal patterns
    const activeGoals = goals.filter(g => g.status === 'active');
    if (activeGoals.length > 5) {
      detected.push({
        type: "info",
        title: "יעדים רבים",
        description: `יש לך ${activeGoals.length} יעדים פעילים - שקול להתמקד`,
        icon: Calendar,
        color: "text-blue-400"
      });
    }

    return detected;
  }, [moodEntries, goals]);

  if (patterns.length === 0) return null;

  return (
    <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          דפוסים שזיהיתי
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patterns.map((pattern, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-purple-700/30"
          >
            <div className="flex items-start gap-3">
              <pattern.icon className={`w-5 h-5 ${pattern.color} shrink-0 mt-1`} />
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{pattern.title}</h4>
                <p className="text-gray-300 text-sm">{pattern.description}</p>
              </div>
              <Badge className={`${
                pattern.type === 'positive' ? 'bg-green-600' :
                pattern.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
              }`}>
                {pattern.type === 'positive' ? '✅' : pattern.type === 'warning' ? '⚠️' : 'ℹ️'}
              </Badge>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}