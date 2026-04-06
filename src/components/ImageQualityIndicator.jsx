import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, AlertCircle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const QUALITY_FACTORS = [
  { key: 'clarity', label: 'בהירות', icon: '👁️' },
  { key: 'lighting', label: 'תאורה', icon: '💡' },
  { key: 'angle', label: 'זווית', icon: '📐' },
  { key: 'text_amount', label: 'כמות טקסט', icon: '📝' },
  { key: 'background', label: 'רקע', icon: '🖼️' },
  { key: 'completeness', label: 'שלמות', icon: '✓' }
];

export default function ImageQualityIndicator({ quality }) {
  if (!quality) return null;

  const overallScore = Math.round(quality.overall_score * 100);
  const isGood = overallScore >= 80;
  const isMedium = overallScore >= 60 && overallScore < 80;
  const isPoor = overallScore < 60;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className={`backdrop-blur-xl border-2 ${
        isGood ? 'bg-green-900/50 border-green-600' :
        isMedium ? 'bg-yellow-900/50 border-yellow-600' :
        'bg-red-900/50 border-red-600'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <ImageIcon className={`w-8 h-8 ${
                isGood ? 'text-green-300' :
                isMedium ? 'text-yellow-300' :
                'text-red-300'
              }`} />
              <div>
                <h3 className="text-2xl font-bold text-white">איכות תמונה</h3>
                <p className="text-gray-300 text-sm">הערכה אובייקטיבית</p>
              </div>
            </div>
            <Badge className={`text-2xl px-6 py-2 ${
              isGood ? 'bg-green-700 text-white' :
              isMedium ? 'bg-yellow-700 text-white' :
              'bg-red-700 text-white'
            }`}>
              {overallScore}%
            </Badge>
          </div>

          <Progress value={overallScore} className="h-3 mb-6" />

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {QUALITY_FACTORS.map((factor, idx) => {
              const score = quality[factor.key];
              if (score === undefined) return null;

              const factorPercent = Math.round(score * 100);
              const isFactorGood = factorPercent >= 70;

              return (
                <motion.div
                  key={factor.key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`rounded-lg p-4 border ${
                    isFactorGood 
                      ? 'bg-green-900/30 border-green-700/50' 
                      : 'bg-yellow-900/30 border-yellow-700/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{factor.icon}</span>
                      <span className="text-white text-sm font-semibold">{factor.label}</span>
                    </div>
                    {isFactorGood ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                    )}
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {factorPercent}%
                  </div>
                </motion.div>
              );
            })}
          </div>

          {quality.improvement_suggestions && quality.improvement_suggestions.length > 0 && (
            <div className="bg-blue-900/30 border border-blue-700/30 rounded-lg p-4">
              <h4 className="text-blue-200 font-bold mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                המלצות לשיפור:
              </h4>
              <ul className="space-y-2">
                {quality.improvement_suggestions.map((suggestion, idx) => (
                  <li key={idx} className="text-blue-100 text-sm flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {quality.pen_type && (
            <div className="mt-4 text-center">
              <Badge variant="outline" className="bg-gray-800 text-gray-300 border-gray-600">
                סוג עט: {quality.pen_type}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}