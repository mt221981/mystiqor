import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Pause, RotateCcw, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ANIMATED DRAWING INSTRUCTIONS
 * הדרכה מונפשת לכל משימת ציור
 */

const ANIMATION_SEQUENCES = {
  person: [
    { step: 1, instruction: "התחל עם ציור עיגול לראש", path: "M 150,100 a 40,40 0 1,0 80,0 a 40,40 0 1,0 -80,0", duration: 1000 },
    { step: 2, instruction: "הוסף פנים: עיניים, אף, פה", path: "M 165,95 L 165,100 M 175,95 L 175,100 M 170,105 L 170,115 M 160,120 L 180,120", duration: 1500 },
    { step: 3, instruction: "צייר גוף - קו או מלבן", path: "M 170,140 L 170,240", duration: 800 },
    { step: 4, instruction: "הוסף זרועות", path: "M 170,160 L 140,200 M 170,160 L 200,200", duration: 1000 },
    { step: 5, instruction: "הוסף ידיים", path: "M 140,200 a 10,10 0 1,0 0,1 M 200,200 a 10,10 0 1,0 0,1", duration: 800 },
    { step: 6, instruction: "צייר רגליים", path: "M 170,240 L 150,300 M 170,240 L 190,300", duration: 1000 },
    { step: 7, instruction: "הוסף כפות רגליים", path: "M 150,300 L 145,305 M 190,300 L 195,305", duration: 800 },
    { step: 8, instruction: "הוסף פרטים: שיער, בגדים וכו'", path: "M 150,80 Q 130,70 150,60 Q 170,70 190,60 Q 210,70 190,80", duration: 1500 }
  ],
  tree: [
    { step: 1, instruction: "התחל עם ציור שורשים (אופציונלי)", path: "M 200,350 Q 180,370 160,380 M 200,350 Q 220,370 240,380", duration: 1200 },
    { step: 2, instruction: "צייר גזע העץ", path: "M 185,350 L 180,200 M 215,350 L 220,200", duration: 1000 },
    { step: 3, instruction: "הוסף ענפים", path: "M 200,250 L 160,220 M 200,250 L 240,220 M 200,230 L 170,200 M 200,230 L 230,200", duration: 1500 },
    { step: 4, instruction: "צייר צמרת/עלווה", path: "M 200,180 Q 150,150 150,200 Q 150,160 180,140 Q 200,120 220,140 Q 250,160 250,200 Q 250,150 200,180 Z", duration: 2000 },
    { step: 5, instruction: "הוסף פרטים: עלים, פירות, קשרים בגזע", path: "M 195,270 a 5,8 0 1,0 10,0 M 165,185 a 3,5 0 1,0 0,1 M 235,195 a 3,5 0 1,0 0,1", duration: 1500 }
  ],
  house: [
    { step: 1, instruction: "התחל עם קו אדמה", path: "M 100,350 L 300,350", duration: 600 },
    { step: 2, instruction: "צייר קירות הבית", path: "M 120,350 L 120,220 L 280,220 L 280,350", duration: 1200 },
    { step: 3, instruction: "הוסף גג", path: "M 115,220 L 200,150 L 285,220", duration: 1000 },
    { step: 4, instruction: "צייר דלת", path: "M 180,350 L 180,280 L 220,280 L 220,350", duration: 800 },
    { step: 5, instruction: "הוסף חלונות", path: "M 135,260 L 165,260 L 165,290 L 135,290 Z M 235,260 L 265,260 L 265,290 L 235,290 Z", duration: 1200 },
    { step: 6, instruction: "הוסף ארובה (אופציונלי)", path: "M 240,180 L 240,140 L 260,140 L 260,180", duration: 800 },
    { step: 7, instruction: "הוסף פרטים: שביל, גדר, עשן וכו'", path: "M 200,350 L 200,380 M 245,135 Q 250,120 255,105", duration: 1500 }
  ]
};

export default function DrawingTaskInstructions({ taskType = 'person', onStart }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const sequence = ANIMATION_SEQUENCES[taskType] || ANIMATION_SEQUENCES.person;

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      if (currentStep < sequence.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsPlaying(false);
      }
    }, sequence[currentStep].duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, sequence]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <Card className="bg-indigo-900/50 border-indigo-700/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-xl">
            🎬 הדגמה אנימציה
          </h3>
          <div className="flex gap-2">
            <Button
              onClick={handlePlayPause}
              size="sm"
              variant="outline"
              className="border-indigo-500 text-indigo-200"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              onClick={handleReset}
              size="sm"
              variant="outline"
              className="border-indigo-500 text-indigo-200"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Animation Display */}
        <div className="bg-white rounded-lg p-4 relative overflow-hidden" style={{ minHeight: '400px' }}>
          <svg viewBox="0 0 400 400" className="w-full h-auto">
            {/* Draw all completed steps */}
            {sequence.slice(0, currentStep + 1).map((step, idx) => (
              <motion.path
                key={idx}
                d={step.path}
                fill="none"
                stroke="#000000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: step.duration / 1000, ease: "easeInOut" }}
              />
            ))}
          </svg>

          {/* Current instruction overlay */}
          {isPlaying && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg p-3"
            >
              <p className="text-white text-sm font-semibold text-center">
                שלב {currentStep + 1}: {sequence[currentStep].instruction}
              </p>
            </motion.div>
          )}
        </div>

        {/* Steps Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-200 text-sm font-semibold">התקדמות:</span>
            <span className="text-indigo-300 text-sm">
              {currentStep + 1} / {sequence.length}
            </span>
          </div>
          <div className="flex gap-1">
            {sequence.map((step, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-all ${
                  idx <= currentStep ? 'bg-green-500' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {sequence.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 p-2 rounded transition-all ${
                idx === currentStep 
                  ? 'bg-indigo-700/50 border border-indigo-500' 
                  : idx < currentStep
                  ? 'bg-green-900/30'
                  : 'bg-gray-800/30'
              }`}
            >
              {idx < currentStep ? (
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
              ) : (
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 ${
                  idx === currentStep ? 'border-indigo-400 bg-indigo-500' : 'border-gray-500'
                }`} />
              )}
              <span className={`text-sm ${
                idx <= currentStep ? 'text-white font-semibold' : 'text-gray-400'
              }`}>
                {step.instruction}
              </span>
            </div>
          ))}
        </div>

        {/* Start Drawing Button */}
        {onStart && (
          <Button
            onClick={onStart}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Pencil className="w-5 h-5 ml-2" />
            התחל לצייר עכשיו
          </Button>
        )}
      </CardContent>
    </Card>
  );
}