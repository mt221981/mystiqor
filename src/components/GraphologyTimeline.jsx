import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle } from "lucide-react";
import { motion } from "framer-motion";

const ANALYSIS_STEPS = [
  { id: 1, title: "העלאת תמונה", icon: "📸" },
  { id: 2, title: "בדיקת איכות", icon: "🔍" },
  { id: 3, title: "זיהוי זיופים (FDE)", icon: "🛡️" },
  { id: 4, title: "Formniveau", icon: "🎯" },
  { id: 5, title: "מדידות כמותיות", icon: "📏" },
  { id: 6, title: "ניתוח מאפיינים", icon: "🔬" },
  { id: 7, title: "Big Five", icon: "📊" },
  { id: 8, title: "תובנות עמוקות", icon: "💎" }
];

export default function GraphologyTimeline({ currentStep = 1 }) {
  return (
    <Card className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 backdrop-blur-xl border-indigo-700/30">
      <CardContent className="p-6">
        <h3 className="text-xl font-bold text-white mb-6 text-center">מסע הניתוח</h3>
        
        <div className="relative">
          <div className="absolute top-6 right-0 left-0 h-1 bg-gray-700">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / ANALYSIS_STEPS.length) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
            />
          </div>

          <div className="relative flex justify-between">
            {ANALYSIS_STEPS.map((step, idx) => {
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const isPending = currentStep < step.id;

              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2 ${
                    isCompleted 
                      ? 'bg-green-600 border-green-400' 
                      : isCurrent 
                      ? 'bg-purple-600 border-purple-400 animate-pulse' 
                      : 'bg-gray-700 border-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : isCurrent ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <span className="text-2xl">{step.icon}</span>
                      </motion.div>
                    ) : (
                      <Circle className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                  <div className={`text-xs text-center max-w-[80px] ${
                    isCompleted 
                      ? 'text-green-300 font-semibold' 
                      : isCurrent 
                      ? 'text-purple-200 font-bold' 
                      : 'text-gray-400'
                  }`}>
                    {step.title}
                  </div>
                  {isCurrent && (
                    <Badge className="bg-purple-600 text-white text-xs mt-1">
                      בתהליך
                    </Badge>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}