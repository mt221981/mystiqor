import React from "react";
import { base44 } from "@/api/base44Client";
import { useUserDataQuery } from "@/components/CachedQuery";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Award, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function ProgressTracker() {
  const { data: analyses } = useUserDataQuery(
    ['allAnalyses'],
    () => base44.entities.Analysis.list('-created_date', 1000)
  );

  if (!analyses || analyses.length === 0) return null;

  const toolsUsed = new Set(analyses.map(a => a.tool_type)).size;
  const totalAnalyses = analyses.length;
  
  // חישוב ממוצע ציוני ביטחון
  const avgConfidence = analyses.reduce((sum, a) => sum + (a.confidence_score || 0), 0) / totalAnalyses;

  // מטרות
  const goals = [
    { name: "מתחיל", target: 3, icon: "🌱" },
    { name: "חוקר", target: 10, icon: "🔍" },
    { name: "מומחה", target: 25, icon: "⭐" },
    { name: "מאסטר", target: 50, icon: "👑" }
  ];

  const currentGoal = goals.find(g => totalAnalyses < g.target) || goals[goals.length - 1];
  const progressToGoal = (totalAnalyses / currentGoal.target) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-purple-300" />
            <h3 className="text-2xl font-bold text-white">המסע שלך במספרים</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-950/50 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-white mb-1">{totalAnalyses}</div>
              <div className="text-purple-300 text-sm">ניתוחים כוללים</div>
            </div>

            <div className="bg-pink-950/50 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-white mb-1">{toolsUsed}</div>
              <div className="text-pink-300 text-sm">כלים שניסית</div>
            </div>

            <div className="bg-indigo-950/50 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-white mb-1">{Math.round(avgConfidence)}%</div>
              <div className="text-indigo-300 text-sm">ממוצע ביטחון</div>
            </div>
          </div>

          <div className="bg-purple-950/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-300" />
                <span className="text-white font-semibold">המטרה הבאה: {currentGoal.name} {currentGoal.icon}</span>
              </div>
              <Badge className="bg-purple-700 text-white">
                {totalAnalyses}/{currentGoal.target}
              </Badge>
            </div>
            <Progress value={Math.min(progressToGoal, 100)} className="h-3" />
            
            {progressToGoal >= 100 && (
              <div className="mt-3 flex items-center justify-center gap-2 text-yellow-300 animate-pulse">
                <Award className="w-5 h-5" />
                <span className="font-bold">מזל טוב! השגת את המטרה! 🎉</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}