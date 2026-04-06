import React from "react";
import { motion } from "framer-motion";
import { Moon, Stars } from "lucide-react";

export default function LoadingSpinner({ message = "טוען...", size = "default" }) {
  const sizeClasses = {
    small: "w-8 h-8",
    default: "w-16 h-16",
    large: "w-24 h-24"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {/* Animated icon */}
        <div className="relative mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className={`${sizeClasses[size]} mx-auto`}
          >
            <div className="relative w-full h-full">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full opacity-20 blur-xl" />
              <Moon className="w-full h-full text-purple-400" />
            </div>
          </motion.div>

          {/* Orbiting stars */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0"
          >
            <Stars className="w-6 h-6 text-yellow-400 absolute top-0 left-1/2 -translate-x-1/2" />
          </motion.div>
        </div>

        {/* Loading text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-2xl text-white font-bold mb-4"
        >
          {message}
        </motion.p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-3 h-3 bg-purple-500 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}