import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Target, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function StrengthsGrowthGrid({ strengths, growthAreas }) {
  if (!strengths && !growthAreas) return null;

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {strengths && strengths.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl border-green-700/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-green-200">נקודות חוזק</h3>
                  <p className="text-green-300 text-sm">מה שאתה טוב בו (תיאורטי)</p>
                </div>
              </div>
              
              <div className="grid gap-3">
                {strengths.map((strength, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 bg-green-800/30 rounded-lg p-4 hover:bg-green-800/40 transition-colors"
                  >
                    <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                    <p className="text-green-100 leading-relaxed flex-1">{strength}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 bg-green-800/20 border border-green-700/30 rounded-lg p-4">
                <p className="text-green-200 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  <span>מבוסס על ניתוח תיאורטי של {strengths.length} מאפייני כתב</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {growthAreas && growthAreas.length > 0 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Card className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 backdrop-blur-xl border-amber-700/30">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-amber-200">תחומי צמיחה</h3>
                  <p className="text-amber-300 text-sm">איפה אפשר לשפר (תיאורטי)</p>
                </div>
              </div>
              
              <div className="grid gap-3">
                {growthAreas.map((area, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-3 bg-amber-800/30 rounded-lg p-4 hover:bg-amber-800/40 transition-colors"
                  >
                    <div className="text-amber-400 text-xl shrink-0 mt-0.5">→</div>
                    <p className="text-amber-100 leading-relaxed flex-1">{area}</p>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 bg-amber-800/20 border border-amber-700/30 rounded-lg p-4">
                <p className="text-amber-200 text-sm flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>המלצות לפיתוח אישי מבוססות תיאוריה</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}