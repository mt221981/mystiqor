
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Award, Zap, Users, Heart, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * PSYCHOLOGICAL PROFILE CHART
 * גרף אינטראקטיבי של הפרופיל הפסיכולוגי עם drill-down לראיות
 */

const PROFILE_DIMENSIONS = {
  self_esteem: {
    name: 'איך אתה מרגיש לגבי עצמך',
    icon: Award,
    color: '#3B82F6',
    gradient: 'from-blue-600 to-cyan-600',
    description: 'ביטחון עצמי והערכה עצמית'
  },
  anxiety_level: {
    name: 'רמת המתח והדאגות',
    icon: Zap,
    color: '#F59E0B',
    gradient: 'from-yellow-600 to-orange-600',
    description: 'מתח וחרדה רגשית',
    inverted: true
  },
  social_orientation: {
    name: 'איך אתה עם אנשים',
    icon: Users,
    color: '#10B981',
    gradient: 'from-green-600 to-emerald-600',
    description: 'מוחצן או מופנם'
  },
  emotional_control: {
    name: 'שליטה ברגשות',
    icon: Heart,
    color: '#EC4899',
    gradient: 'from-pink-600 to-rose-600',
    description: 'יכולת לשלוט ברגשות'
  }
};

export default function PsychologicalProfileChart({ psychologicalProfile }) {
  const [selectedDimension, setSelectedDimension] = useState(null);

  if (!psychologicalProfile) return null;

  const profileData = Object.entries(psychologicalProfile)
    .filter(([key, value]) => value && value.score !== undefined)
    .map(([key, value]) => {
      const config = PROFILE_DIMENSIONS[key];
      const displayScore = config?.inverted ? 10 - value.score : value.score;
      
      return {
        key,
        config,
        displayScore,
        data: value
      };
    });

  return (
    <Card className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 border-indigo-700/30">
      <CardHeader>
        <CardTitle className="text-white text-3xl text-center mb-2">
          💫 התכונות שלך
        </CardTitle>
        <p className="text-purple-200 text-center text-lg">
          לחץ על תכונה כדי להבין איך הגענו למסקנה הזאת
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Simple Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {profileData.map(({ key, config, displayScore, data }) => {
            const isExpanded = selectedDimension === key;
            const Icon = config.icon;
            const percentage = displayScore * 10;

            return (
              <motion.div
                key={key}
                layout
                className="cursor-pointer"
                onClick={() => setSelectedDimension(isExpanded ? null : key)}
              >
                <Card className={`bg-gradient-to-br ${config.gradient} bg-opacity-30 border-2 transition-all ${
                  isExpanded ? 'border-white shadow-2xl scale-105' : 'border-white/30 hover:border-white/60'
                }`}>
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Icon className="w-8 h-8 text-white shrink-0" />
                        <h4 className="text-white font-bold text-xl leading-tight">
                          {config.name}
                        </h4>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white">{displayScore}</div>
                        <div className="text-white/70 text-sm">מתוך 10</div>
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="mb-4">
                      <div className="h-4 bg-gray-800/50 rounded-full overflow-hidden">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-white via-white/90 to-white/70 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                        />
                      </div>
                    </div>

                    {/* Short Description */}
                    {!isExpanded && (
                      <p className="text-white text-base leading-relaxed">
                        {data.interpretation?.substring(0, 120)}...
                      </p>
                    )}

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 mt-4"
                        >
                          {/* Full Explanation */}
                          <div className="bg-white/10 rounded-xl p-4">
                            <p className="text-white text-lg leading-relaxed">
                              {data.interpretation}
                            </p>
                          </div>

                          {/* Evidence from Drawing */}
                          {data.supporting_signs && data.supporting_signs.length > 0 && (
                            <div className="bg-indigo-900/40 rounded-xl p-4">
                              <p className="text-indigo-200 font-semibold mb-3 text-lg">
                                🎨 איך ראינו את זה בציור שלך:
                              </p>
                              <ul className="space-y-2">
                                {data.supporting_signs.map((sign, idx) => (
                                  <li key={idx} className="flex items-start gap-2 text-indigo-100 text-base">
                                    <span className="text-indigo-400 text-xl">•</span>
                                    <span className="leading-relaxed">{sign}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Click Hint */}
                    <div className="mt-3 text-center">
                      <span className="text-white/50 text-sm">
                        {isExpanded ? '👆 לחץ שוב לסגירה' : '👆 לחץ לפירוט'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Simple Explanation */}
        <Card className="bg-blue-900/30 border-blue-700/50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
              <div>
                <h4 className="text-blue-200 font-bold mb-2 text-xl">איך לקרוא:</h4>
                <ul className="text-blue-100 text-lg space-y-2 leading-relaxed">
                  <li>• <strong>ציון גבוה (8-10):</strong> תכונה חזקה שלך</li>
                  <li>• <strong>ציון בינוני (4-7):</strong> מאוזן</li>
                  <li>• <strong>ציון נמוך (1-3):</strong> תחום לשיפור</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
