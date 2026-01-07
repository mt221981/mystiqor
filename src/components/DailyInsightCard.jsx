import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Lightbulb, TrendingUp, AlertCircle, Heart, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// 🛡️ SAFE STRING EXTRACTOR - handles ANY data type
const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'כן' : 'לא';
  
  // Handle arrays - extract first string
  if (Array.isArray(value)) {
    for (const item of value) {
      const str = safeString(item, '');
      if (str) return str;
    }
    return fallback;
  }
  
  // Handle objects - try common keys first
  if (typeof value === 'object') {
    const keys = ['text', 'value', 'content', 'message', 'title', 'description'];
    for (const key of keys) {
      if (value[key]) {
        const str = safeString(value[key], '');
        if (str) return str;
      }
    }
    
    // Try first available key
    const objKeys = Object.keys(value);
    if (objKeys.length > 0) {
      return safeString(value[objKeys[0]], fallback);
    }
  }
  
  return fallback;
};

const getMoodIcon = (mood) => {
  const icons = {
    inspiring: Sparkles,
    reflective: Heart,
    empowering: TrendingUp,
    cautionary: AlertCircle,
    celebratory: CheckCircle2
  };
  return icons[mood] || Sparkles;
};

const getMoodGradient = (mood) => {
  const gradients = {
    inspiring: "from-purple-600 to-pink-600",
    reflective: "from-blue-600 to-cyan-600",
    empowering: "from-green-600 to-emerald-600",
    cautionary: "from-orange-600 to-amber-600",
    celebratory: "from-yellow-500 to-orange-500"
  };
  return gradients[mood] || "from-purple-600 to-pink-600";
};

const getFocusIcon = (focusArea) => {
  const icons = {
    strength: TrendingUp,
    growth: Sparkles,
    challenge: AlertCircle,
    opportunity: Lightbulb,
    reflection: Heart,
    action: CheckCircle2
  };
  return icons[focusArea] || Sparkles;
};

export default function DailyInsightCard({ insight, onView }) {
  if (!insight) return null;

  // 🛡️ SAFELY extract all fields
  const title = safeString(insight.insight_title, 'תובנה יומית');
  const content = safeString(insight.insight_content, 'התובנה שלך מוכנה...');
  const tip = safeString(insight.actionable_tip, 'פעל לפי האינטואיציה שלך');
  const mood = insight.mood || 'inspiring';
  const focusArea = insight.focus_area || 'reflection';

  const MoodIcon = getMoodIcon(mood);
  const FocusIcon = getFocusIcon(focusArea);
  const gradient = getMoodGradient(mood);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="cursor-pointer"
      onClick={() => onView?.(insight)}
    >
      <Card className={`bg-gradient-to-br ${gradient} border-none shadow-2xl hover:scale-[1.02] transition-all`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <MoodIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl text-white line-clamp-2">
                  {title}
                </CardTitle>
              </div>
            </div>
            <Badge className="bg-white/30 text-white shrink-0">
              <FocusIcon className="w-3 h-3 ml-1" />
              {focusArea}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-white/90 leading-relaxed line-clamp-3">
            {content}
          </p>
          
          {tip && (
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-200 shrink-0 mt-0.5" />
                <p className="text-white/90 text-sm leading-relaxed">
                  {tip}
                </p>
              </div>
            </div>
          )}

          {insight.confidence_score && (
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>דיוק: {Math.round(insight.confidence_score * 100)}%</span>
              {insight.insight_date && (
                <span>{new Date(insight.insight_date).toLocaleDateString('he-IL')}</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}