import React from "react";
import { motion } from "framer-motion";

export default function PageHeader({ 
  title, 
  description, 
  icon: Icon, 
  iconGradient = "from-purple-600 to-pink-600",
  titleGradient = "from-purple-300 via-pink-300 to-purple-300",
  badge
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-10 md:mb-14"
    >
      {/* Icon with enhanced contrast */}
      {Icon && (
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 3, -3, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="inline-block mb-6"
        >
          <div 
            className={`w-20 h-20 md:w-24 md:h-24 mx-auto bg-gradient-to-br ${iconGradient} rounded-2xl flex items-center justify-center shadow-2xl ring-2 ring-purple-400/30`}
            style={{
              boxShadow: '0 0 40px rgba(168, 85, 247, 0.4)'
            }}
          >
            <Icon className="w-10 h-10 md:w-12 md:h-12 text-white drop-shadow-lg" />
          </div>
        </motion.div>
      )}

      {/* Title with better contrast */}
      <h1 className={`text-4xl md:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r ${titleGradient} mb-4 leading-tight px-4 drop-shadow-sm`}>
        {title}
      </h1>

      {/* Badge */}
      {badge && (
        <div className="mb-4">
          {badge}
        </div>
      )}

      {/* Description with improved readability */}
      {description && (
        <p className="text-lg md:text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed px-4 drop-shadow-sm">
          {description}
        </p>
      )}
    </motion.div>
  );
}