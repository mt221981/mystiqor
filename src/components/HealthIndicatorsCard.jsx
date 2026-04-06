import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Heart, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function HealthIndicatorsCard({ healthData }) {
  if (!healthData) return null;

  const hasAnyIndicators = 
    (healthData.trauma_signs && healthData.trauma_signs.length > 0) ||
    (healthData.depression_signs && healthData.depression_signs.length > 0) ||
    (healthData.anxiety_signs && healthData.anxiety_signs.length > 0) ||
    (healthData.stress_indicators && healthData.stress_indicators.length > 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-red-900/50 to-rose-900/50 backdrop-blur-xl border-red-700/30">
        <CardContent className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-rose-600 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-red-200 mb-2">אינדיקטורים לרווחה</h3>
              <Badge className="bg-red-700 text-white mb-3">
                לא אבחון רפואי!
              </Badge>
              
              {healthData.medical_disclaimer && (
                <div className="bg-red-800/40 border-2 border-red-600/50 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <Shield className="w-5 h-5 text-red-300 shrink-0 mt-0.5" />
                    <p className="text-red-100 text-sm font-semibold leading-relaxed">
                      {healthData.medical_disclaimer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {hasAnyIndicators && (
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              {healthData.trauma_signs && healthData.trauma_signs.length > 0 && (
                <div className="bg-red-800/30 rounded-lg p-4">
                  <h4 className="text-red-200 font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    סימני טראומה
                  </h4>
                  <ul className="space-y-1">
                    {healthData.trauma_signs.map((sign, idx) => (
                      <li key={idx} className="text-red-100 text-sm">• {sign}</li>
                    ))}
                  </ul>
                </div>
              )}

              {healthData.depression_signs && healthData.depression_signs.length > 0 && (
                <div className="bg-blue-900/30 rounded-lg p-4">
                  <h4 className="text-blue-200 font-bold mb-2">דיכאון</h4>
                  <ul className="space-y-1">
                    {healthData.depression_signs.map((sign, idx) => (
                      <li key={idx} className="text-blue-100 text-sm">• {sign}</li>
                    ))}
                  </ul>
                </div>
              )}

              {healthData.anxiety_signs && healthData.anxiety_signs.length > 0 && (
                <div className="bg-yellow-900/30 rounded-lg p-4">
                  <h4 className="text-yellow-200 font-bold mb-2">חרדה</h4>
                  <ul className="space-y-1">
                    {healthData.anxiety_signs.map((sign, idx) => (
                      <li key={idx} className="text-yellow-100 text-sm">• {sign}</li>
                    ))}
                  </ul>
                </div>
              )}

              {healthData.stress_indicators && healthData.stress_indicators.length > 0 && (
                <div className="bg-orange-900/30 rounded-lg p-4">
                  <h4 className="text-orange-200 font-bold mb-2">מתח</h4>
                  <ul className="space-y-1">
                    {healthData.stress_indicators.map((sign, idx) => (
                      <li key={idx} className="text-orange-100 text-sm">• {sign}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {healthData.overall_assessment && (
            <div className="bg-red-800/20 rounded-xl p-6">
              <h4 className="text-red-200 font-semibold mb-3">סיכום כללי:</h4>
              <p className="text-red-100 leading-relaxed">
                {healthData.overall_assessment}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}