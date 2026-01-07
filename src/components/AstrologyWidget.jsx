import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stars, ArrowLeft, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

/**
 * ASTROLOGY WIDGET
 * Widget להצגת קריאות אסטרולוגיות אחרונות בדאשבורד
 */

const READING_TYPE_CONFIG = {
  natal_chart: { icon: "✨", label: "מפת לידה", color: "purple" },
  monthly_forecast: { icon: "📅", label: "תחזית", color: "blue" },
  relationship_dynamics: { icon: "💕", label: "יחסים", color: "pink" },
  career_potential: { icon: "💼", label: "קריירה", color: "amber" },
  specific_question: { icon: "❓", label: "שאלה", color: "violet" },
  transit_report: { icon: "🌊", label: "מעברים", color: "teal" }
};

export default function AstrologyWidget() {
  const { data: readings = [], isLoading } = useQuery({
    queryKey: ['recentAstrologyReadings'],
    queryFn: async () => {
      const allReadings = await base44.entities.AstrologyReading.list('-generated_date', 5);
      return allReadings || [];
    },
    staleTime: 5 * 60 * 1000
  });

  if (isLoading) {
    return (
      <Card className="bg-indigo-900/30 border-indigo-700/30 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32" />
        </CardContent>
      </Card>
    );
  }

  if (readings.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border-indigo-700/30">
        <CardContent className="p-6">
          <div className="text-center">
            <Stars className="w-12 h-12 text-indigo-400 mx-auto mb-3 opacity-50" />
            <h3 className="text-white font-bold text-lg mb-2">קריאות אסטרולוגיות</h3>
            <p className="text-indigo-300 text-sm mb-4">
              קבל קריאות מותאמות אישית מה-AI
            </p>
            <Link to={createPageUrl("AstrologyReadings")}>
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Stars className="w-4 h-4 ml-2" />
                צור קריאה ראשונה
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-indigo-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Stars className="w-6 h-6 text-indigo-400" />
              <h3 className="text-white text-xl font-bold">קריאות אסטרולוגיות</h3>
            </div>
            <Badge className="bg-indigo-700 text-white">
              {readings.length} קריאות
            </Badge>
          </div>

          <div className="space-y-3 mb-4">
            {readings.slice(0, 3).map((reading) => {
              const config = READING_TYPE_CONFIG[reading.reading_type] || READING_TYPE_CONFIG.natal_chart;
              
              return (
                <div 
                  key={reading.id} 
                  className="bg-indigo-950/50 rounded-lg p-3 border border-indigo-700/30 hover:border-indigo-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{config.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-white font-semibold text-sm line-clamp-1 flex-1">
                          {reading.title}
                        </h4>
                        <Badge className={`bg-${config.color}-700 text-white text-xs shrink-0`}>
                          {config.label}
                        </Badge>
                      </div>
                      <p className="text-indigo-300 text-xs line-clamp-2">
                        {reading.summary}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-indigo-400 text-xs">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(reading.generated_date).toLocaleDateString('he-IL', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Stats */}
          {readings.length > 3 && (
            <div className="mb-4 pt-4 border-t border-indigo-700/30">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-xl font-bold text-white">+{readings.length - 3}</div>
                  <div className="text-indigo-300 text-xs">קריאות נוספות</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">
                    {Math.round(readings.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / readings.length)}%
                  </div>
                  <div className="text-indigo-300 text-xs">דיוק ממוצע</div>
                </div>
              </div>
            </div>
          )}

          {/* Action Button */}
          <Link to={createPageUrl("AstrologyReadings")}>
            <Button className="w-full bg-indigo-600 hover:bg-indigo-700 border-indigo-500">
              ראה את כל הקריאות
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}