import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function SmartRecommendations({ profile, goals = [], moodEntries = [], analyses = [], className }) {
  const recommendations = useMemo(() => {
    const recs = [];

    // Recommend based on profile completion
    if (!profile || !profile.birth_time) {
      recs.push({
        title: "השלם את הפרופיל שלך",
        description: "הוסף שעת לידה לקבלת ניתוח אסטרולוגי מדויק",
        action: "השלם פרופיל",
        link: createPageUrl("EditProfile"),
        priority: "high"
      });
    }

    // Recommend based on mood entries
    if (moodEntries.length === 0) {
      recs.push({
        title: "התחל מעקב מצב רוח",
        description: "תעד את מצב הרוח שלך ותקבל תובנות מבוססות AI",
        action: "התחל מעקב",
        link: createPageUrl("MoodTracker"),
        priority: "medium"
      });
    }

    // Recommend based on goals
    if (goals.length === 0) {
      recs.push({
        title: "הגדר יעד ראשון",
        description: "צור יעד אישי והמערכת תעזור לך להשיג אותו",
        action: "צור יעד",
        link: createPageUrl("MyGoals"),
        priority: "high"
      });
    }

    // Recommend analyses based on profile preferences
    if (profile?.preferred_disciplines?.includes('numerology') && !analyses.some(a => a.tool_type === 'numerology')) {
      recs.push({
        title: "נסה ניתוח נומרולוגי",
        description: "גלה את המספרים המשמעותיים בחייך",
        action: "התחל ניתוח",
        link: createPageUrl("Numerology"),
        priority: "medium"
      });
    }

    return recs.slice(0, 3); // Top 3 recommendations
  }, [profile, goals, moodEntries, analyses]);

  if (recommendations.length === 0) return null;

  return (
    <Card className={`bg-gradient-to-br from-pink-900/50 to-purple-900/50 border-pink-700/50 ${className}`}>
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-pink-400" />
          המלצות מותאמות אישית
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-gray-800/50 rounded-lg p-4 border border-pink-700/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{rec.title}</h4>
                <p className="text-gray-300 text-sm mb-3">{rec.description}</p>
                <Link to={rec.link}>
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                    {rec.action}
                    <ArrowLeft className="w-4 h-4 mr-2" />
                  </Button>
                </Link>
              </div>
              {rec.priority === 'high' && (
                <span className="text-2xl">⭐</span>
              )}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}