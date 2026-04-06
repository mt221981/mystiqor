import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function EnhancedEmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  gradient = "from-purple-600 to-pink-600"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 text-center"
      role="status"
      aria-live="polite"
    >
      <div className={`w-32 h-32 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center mb-8 shadow-2xl relative`}>
        {Icon && <Icon className="w-16 h-16 text-white" aria-hidden="true" />}
        <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" aria-hidden="true" />
      </div>
      
      <h2 className="text-3xl font-bold text-white mb-4">
        {title}
      </h2>
      
      {description && (
        <p className="text-purple-200 text-lg mb-8 max-w-md">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className={`bg-gradient-to-r ${gradient} hover:opacity-90 text-white text-xl px-12 py-6 shadow-xl`}
        >
          <Sparkles className="w-6 h-6 ml-2" aria-hidden="true" />
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}