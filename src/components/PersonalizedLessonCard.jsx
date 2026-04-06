import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

/**
 * PERSONALIZED LESSON CARD
 * כרטיס שיעור מותאם אישית על סמך ממצאי הניתוח
 */

export default function PersonalizedLessonCard({ 
  suggestion, 
  index,
  onClick 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`bg-gradient-to-br ${suggestion.color} border-2 border-white/30 cursor-pointer hover:border-white/60 hover:scale-105 transition-all`}
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="text-4xl">{suggestion.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-white font-bold text-xl">{suggestion.title}</h4>
                <Badge className="bg-yellow-500 text-black text-xs">
                  <Sparkles className="w-3 h-3 ml-1" />
                  מותאם לך
                </Badge>
              </div>
              <p className="text-white/80 text-base mb-3 leading-relaxed">
                {suggestion.description}
              </p>
              {suggestion.finding && (
                <div className="bg-black/20 rounded-lg p-3 mb-3">
                  <p className="text-white text-sm">
                    <strong>🔍 מה מצאנו:</strong> {suggestion.finding}
                  </p>
                </div>
              )}
              {suggestion.why_relevant && (
                <div className="bg-white/10 rounded-lg p-3">
                  <p className="text-white/90 text-sm">
                    <strong>💡 למה זה חשוב לך:</strong> {suggestion.why_relevant}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <Button
            className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
            size="lg"
          >
            <ArrowLeft className="w-5 h-5 ml-2" />
            למד על זה עכשיו
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}