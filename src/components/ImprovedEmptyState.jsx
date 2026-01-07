import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

export default function ImprovedEmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  illustration
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardContent className="p-12 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20,
              delay: 0.1 
            }}
          >
            {illustration ? (
              <div className="mb-6">{illustration}</div>
            ) : (
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center">
                <Icon className="w-10 h-10 text-purple-400" />
              </div>
            )}
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white text-2xl font-bold mb-3"
          >
            {title}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-gray-400 max-w-md mx-auto mb-6 leading-relaxed"
          >
            {description}
          </motion.p>

          {(actionLabel || secondaryActionLabel) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              {actionLabel && (
                <Button
                  onClick={onAction}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Sparkles className="w-4 h-4 ml-2" />
                  {actionLabel}
                </Button>
              )}
              {secondaryActionLabel && (
                <Button
                  onClick={onSecondaryAction}
                  variant="outline"
                  className="border-gray-600 hover:bg-gray-800"
                >
                  {secondaryActionLabel}
                </Button>
              )}
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}