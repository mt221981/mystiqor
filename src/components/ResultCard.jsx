import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ResultCard({ 
  title, 
  children, 
  icon: Icon, 
  gradient = "from-purple-600 to-pink-600",
  glowColor = "rgba(168, 85, 247, 0.25)",
  badge,
  delay = 0
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card 
        className="bg-gray-900/90 backdrop-blur-xl border-2 border-purple-700/40 hover:border-purple-500/60 transition-all overflow-hidden"
        style={{
          boxShadow: `0 8px 32px -8px ${glowColor}`
        }}
      >
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
        </div>

        <CardHeader className="relative z-10 bg-gradient-to-r from-gray-800/50 to-gray-900/50">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg ring-2 ring-purple-400/20`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              )}
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-50">
                {title}
              </CardTitle>
            </div>
            {badge && (
              <div>{badge}</div>
            )}
          </div>
        </CardHeader>
        <CardContent className="relative z-10 bg-gray-900/50">
          <div className="prose prose-invert prose-purple max-w-none prose-headings:text-gray-100 prose-p:text-gray-200 prose-strong:text-gray-100 prose-a:text-purple-300 prose-code:text-gray-100">
            {children}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}