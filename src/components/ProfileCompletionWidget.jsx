import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const COMPLETION_CHECKS = [
  { field: 'full_name_hebrew', text: 'שם מלא', score: 15 },
  { field: 'birth_date', text: 'תאריך לידה', score: 20 },
  { field: 'birth_time', text: 'שעת לידה', score: 15, hint: '(חשוב לאסטרולוגיה)' },
  { field: ['birth_place_name', 'birth_place_lat', 'birth_place_lon'], text: 'מקום לידה מדויק', score: 15 },
  { field: 'preferred_disciplines', text: 'תחומי עניין', score: 15, isArray: true },
  { field: 'focus_areas', text: 'תחומי מיקוד', score: 10, isArray: true },
  { field: 'personal_goals', text: 'יעדים אישיים', score: 10, isArray: true }
];

export default function ProfileCompletionWidget({ profile }) {
  if (!profile) return null;

  const calculateCompletionScore = () => {
    let totalScore = 0;
    const checks = COMPLETION_CHECKS.map(check => {
      let completed = false;
      
      if (Array.isArray(check.field)) {
        completed = check.field.every(f => profile[f]);
      } else if (check.isArray) {
        completed = profile[check.field]?.length > 0;
      } else {
        completed = !!profile[check.field];
      }

      if (completed) totalScore += check.score;

      return {
        text: check.hint ? `${check.text} ${check.hint}` : check.text,
        completed
      };
    });

    return { score: totalScore, checks };
  };

  const { score, checks } = calculateCompletionScore();
  const isComplete = score === 100;

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-600/50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-white mb-2">
              הפרופיל שלך מושלם! 🎉
            </h3>
            <p className="text-green-200">
              כל הנתונים מלאים - אתה מוכן לחוויה מלאה ומדויקת
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-orange-900/40 to-amber-900/40 border-2 border-amber-600/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-xl flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              השלם את הפרופיל שלך
            </CardTitle>
            <div className="text-3xl font-bold text-white">
              {score}%
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={score} className="h-3" />
          
          <div className="space-y-2">
            {checks.map((check, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-2 text-sm ${
                  check.completed ? 'text-green-300' : 'text-amber-200'
                }`}
              >
                {check.completed ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
                <span>{check.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-950/50 rounded-lg p-4">
            <p className="text-amber-100 text-sm mb-3">
              💡 פרופיל מלא מאפשר ניתוחים מדויקים יותר ותובנות עמוקות יותר
            </p>
            <Link to={createPageUrl("EditProfile")}>
              <Button className="w-full bg-amber-600 hover:bg-amber-700">
                השלם פרופיל
                <ArrowLeft className="w-4 h-4 mr-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}