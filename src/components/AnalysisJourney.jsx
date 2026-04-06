import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Brain, Eye, Star, Compass, Layers } from "lucide-react";

const JOURNEY_STEPS = [
  {
    icon: Heart,
    title: "פותח את הלב",
    message: "מתחבר לנשמה שלך...",
    color: "from-pink-500 to-rose-500",
    deepMessage: "כל נקודה בגופך מספרת סיפור"
  },
  {
    icon: Eye,
    title: "רואה את הנסתר",
    message: "חודר לשכבות הנסתרות שלך...",
    color: "from-cyan-500 to-blue-500",
    deepMessage: "מגלה את הדפוסים שלך"
  },
  {
    icon: Brain,
    title: "מנתח בעומק",
    message: "משלב חכמה עתיקה עם ידע מודרני...",
    color: "from-purple-500 to-indigo-500",
    deepMessage: "כל דרך מגלה חלק אחר"
  },
  {
    icon: Layers,
    title: "משלב את החוטים",
    message: "שוזר את כל מה שמצאתי...",
    color: "from-amber-500 to-orange-500",
    deepMessage: "הכל מתחבר לתמונה אחת"
  },
  {
    icon: Compass,
    title: "מאיר את הדרך",
    message: "מכין לך את המפה...",
    color: "from-yellow-500 to-amber-500",
    deepMessage: "כל תובנה היא מפתח"
  },
  {
    icon: Star,
    title: "מוכן!",
    message: "הכל מחכה לך...",
    color: "from-purple-500 to-pink-500",
    deepMessage: "אתה עומד לגלות את האמת שלך"
  }
];

export default function AnalysisJourney({ 
  isAnalyzing, 
  onComplete,
  userName = "חבר יקר"
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isAnalyzing) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const stepDuration = 3000;
    const totalSteps = JOURNEY_STEPS.length;
    
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= totalSteps) {
          clearInterval(stepInterval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 1000);
          return totalSteps - 1;
        }
        return next;
      });
    }, stepDuration);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (totalSteps * 100);
        return Math.min(prev + increment, 100);
      });
    }, stepDuration / 100);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, [isAnalyzing, onComplete]);

  if (!isAnalyzing) return null;

  const currentStepData = JOURNEY_STEPS[currentStep];
  const IconComponent = currentStepData.icon;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 p-4 bg-gradient-to-br from-black via-purple-950/50 to-black"
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -50, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: Math.random() * 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-2 border-purple-500/30"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-2 border-pink-500/30"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5
        }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative max-w-2xl w-full mx-auto h-full flex items-center justify-center"
      >
        <div className="bg-gradient-to-br from-gray-900/90 via-purple-900/80 to-gray-900/90 rounded-3xl p-8 md:p-12 border-2 border-purple-500/50 shadow-2xl backdrop-blur-xl">
          <motion.div
            key={currentStep}
            initial={{ scale: 0, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="mb-8"
          >
            <div className={`w-28 h-28 mx-auto bg-gradient-to-br ${currentStepData.color} rounded-full flex items-center justify-center shadow-2xl relative`}>
              <motion.div
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                    '0 0 60px rgba(168, 85, 247, 0.8)',
                    '0 0 20px rgba(168, 85, 247, 0.4)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full"
              />
              <IconComponent className="w-14 h-14 text-white relative z-10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-6"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              {userName} 💫
            </h2>
            <p className="text-purple-200 text-lg md:text-xl italic">
              {currentStepData.deepMessage}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-8"
            >
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                {currentStepData.title}
              </h3>
              <p className="text-purple-200 text-lg md:text-xl">
                {currentStepData.message}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="relative mb-6">
            <div className="h-4 bg-gray-800/50 rounded-full overflow-hidden border border-purple-700/30">
              <motion.div
                className={`h-full bg-gradient-to-r ${currentStepData.color} relative`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/30"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </motion.div>
            </div>
            <div className="mt-3 text-center">
              <span className="text-purple-300 text-lg font-bold">
                {Math.round(progress)}%
              </span>
              <span className="text-purple-400 text-sm mr-2">
                שלב {currentStep + 1} מתוך {JOURNEY_STEPS.length}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-2 mb-6">
            {JOURNEY_STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                className={`h-2 rounded-full transition-all ${
                  idx < currentStep 
                    ? `w-8 bg-gradient-to-r ${step.color}` 
                    : idx === currentStep
                    ? `w-12 bg-gradient-to-r ${step.color}`
                    : 'w-2 bg-gray-700'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: idx * 0.1 }}
              />
            ))}
          </div>

          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-center"
          >
            <Heart className="w-8 h-8 text-pink-400 mx-auto" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-purple-300 text-sm mt-6 italic"
          >
            "כשאתה מכיר את עצמך, הכל נהיר יותר"
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}