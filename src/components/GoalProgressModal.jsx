import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, AlertTriangle, Lightbulb, Clock, TrendingUp, Loader2, Brain } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import EnhancedToast from "./EnhancedToast";

export default function GoalProgressModal({ goal, isOpen, onClose, onAnalysisComplete }) {
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeProgress = async () => {
    if (!goal?.id) {
      EnhancedToast.error('שגיאה: חסר מזהה יעד');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await base44.functions.invoke('analyzeGoalProgress', { goal_id: goal.id });
      if (response.data?.success) {
        setAnalysis(response.data.analysis);
        onAnalysisComplete?.();
        EnhancedToast.success('ניתוח הושלם! 🎯');
      } else {
        throw new Error(response.data?.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      EnhancedToast.error('שגיאה בניתוח', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    return {
      high: "bg-red-600",
      medium: "bg-amber-600",
      low: "bg-blue-600"
    }[severity] || "bg-gray-600";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-purple-700">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-400" />
            ניתוח התקדמות: {goal?.goal_title}
          </DialogTitle>
        </DialogHeader>

        {!analysis ? (
          <div className="py-12 text-center">
            <Sparkles className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-3">
              נתח את ההתקדמות ביעד
            </h3>
            <p className="text-gray-300 mb-6 max-w-xl mx-auto">
              AI יבדוק למה היעד לא מתקדם ויציע פתרונות מעשיים ומותאמים אישית
            </p>
            <Button
              onClick={analyzeProgress}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg px-8 h-12"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  מנתח...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 ml-2" />
                  התחל ניתוח
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Motivational Message */}
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-purple-700">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-400 shrink-0" />
                  <div>
                    <h4 className="text-purple-100 font-bold mb-2">💬 הודעה מהמאמן שלך</h4>
                    <p className="text-purple-200 leading-relaxed">
                      {analysis.motivational_message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Root Cause */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-6">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-400" />
                  הסיבה המרכזית
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {analysis.root_cause_analysis}
                </p>
              </CardContent>
            </Card>

            {/* Obstacles */}
            <div>
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                המכשולים העיקריים
              </h4>
              <div className="grid gap-3">
                {analysis.main_obstacles?.map((obstacle, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Badge className={`${getSeverityColor(obstacle.severity)} shrink-0`}>
                            {obstacle.severity === 'high' ? 'גבוה' : obstacle.severity === 'medium' ? 'בינוני' : 'נמוך'}
                          </Badge>
                          <div className="flex-1">
                            <h5 className="text-white font-semibold mb-1">{obstacle.obstacle}</h5>
                            <p className="text-gray-400 text-sm mb-2">{obstacle.description}</p>
                            <p className="text-purple-300 text-xs">
                              🧠 {obstacle.psychological_root}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Action Steps */}
            <div>
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-400" />
                פעולות מומלצות
              </h4>
              <div className="space-y-3">
                {analysis.action_steps?.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`border-2 ${
                      step.priority === 'high' 
                        ? 'bg-red-950/30 border-red-700/50' 
                        : step.priority === 'medium'
                        ? 'bg-amber-950/30 border-amber-700/50'
                        : 'bg-blue-950/30 border-blue-700/50'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            step.priority === 'high' 
                              ? 'bg-red-600' 
                              : step.priority === 'medium'
                              ? 'bg-amber-600'
                              : 'bg-blue-600'
                          }`}>
                            <span className="text-white font-bold text-sm">{idx + 1}</span>
                          </div>
                          <div className="flex-1">
                            <h5 className="text-white font-semibold mb-2">{step.step}</h5>
                            <p className="text-gray-400 text-sm mb-2">
                              💡 {step.why_this_helps}
                            </p>
                            <div className="flex items-center gap-3 text-xs">
                              <div className="flex items-center gap-1 text-gray-400">
                                <Clock className="w-3 h-3" />
                                {step.estimated_time}
                              </div>
                              {step.obstacle_addressed && (
                                <Badge className="bg-purple-700 text-xs">
                                  פותר: {step.obstacle_addressed}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Success Prediction */}
            <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700">
              <CardContent className="p-6">
                <h4 className="text-green-100 font-bold mb-3 flex items-center gap-2">
                  🎯 מה יקרה אם תפעל
                </h4>
                <p className="text-green-200 leading-relaxed mb-3">
                  {analysis.success_prediction?.if_user_acts}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="text-green-300">
                    ⏱️ זמן צפוי: {analysis.success_prediction?.timeframe}
                  </div>
                  <Badge className="bg-green-700">
                    סיכוי הצלחה: {Math.round((analysis.success_prediction?.confidence || 0.8) * 100)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              סגור
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}