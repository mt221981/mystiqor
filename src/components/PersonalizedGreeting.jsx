import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Sun, Moon } from 'lucide-react';

const greetings = {
  morning: {
    text: "בוקר טוב",
    icon: Sun,
    color: "from-amber-400 to-orange-500",
    time: "בוקר מקסים"
  },
  afternoon: {
    text: "צהריים טובים", 
    icon: Sun,
    color: "from-yellow-400 to-amber-500",
    time: "אחר הצהריים נעים"
  },
  evening: {
    text: "ערב טוב",
    icon: Moon,
    color: "from-indigo-400 to-purple-500",
    time: "ערב נעים"
  },
  night: {
    text: "לילה טוב",
    icon: Moon,
    color: "from-purple-500 to-indigo-600",
    time: "לילה שקט"
  }
};

export default function PersonalizedGreeting({ userName }) {
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return greetings.morning;
    if (hour >= 12 && hour < 17) return greetings.afternoon;
    if (hour >= 17 && hour < 21) return greetings.evening;
    return greetings.night;
  }, []);

  const Icon = greeting.icon;
  const displayName = userName?.split(' ')[0] || "חבר יקר";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${greeting.color} flex items-center justify-center shadow-lg`}>
            <Icon className="w-8 h-8 text-white" />
          </div>
        </motion.div>
        
        <div className="text-center">
          <h2 className={`text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${greeting.color} mb-1`}>
            {greeting.text}, {displayName}!
          </h2>
          <p className="text-purple-300 text-sm md:text-base flex items-center gap-2 justify-center">
            <Sparkles className="w-4 h-4" />
            {greeting.time}
          </p>
        </div>
      </div>
    </motion.div>
  );
}