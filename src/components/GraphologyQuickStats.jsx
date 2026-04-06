import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Clock, FileText, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function GraphologyQuickStats({ analysis }) {
  if (!analysis) return null;

  const stats = [
    {
      icon: Award,
      label: "Formniveau",
      value: `${analysis.results?.form_niveau?.score || 0}/10`,
      color: "purple",
      description: analysis.results?.form_niveau?.qualitative_assessment || ''
    },
    {
      icon: FileText,
      label: "תובנות",
      value: analysis.insights_count || 0,
      color: "blue",
      description: "תובנות עמוקות"
    },
    {
      icon: TrendingUp,
      label: "ביטחון",
      value: `${analysis.confidence_score || 0}%`,
      color: "green",
      description: "רמת דיוק כללית"
    },
    {
      icon: Clock,
      label: "זמן עיבוד",
      value: analysis.processing_time_ms ? `${(analysis.processing_time_ms / 1000).toFixed(1)}s` : '-',
      color: "amber",
      description: "משך הניתוח"
    },
    {
      icon: Zap,
      label: "מאפיינים",
      value: "23",
      color: "indigo",
      description: "מאפייני כתב"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className={`bg-${stat.color}-900/40 border-${stat.color}-700/40 hover:scale-105 transition-transform`}>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center">
                  <div className={`w-12 h-12 bg-${stat.color}-700 rounded-xl flex items-center justify-center mb-3`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-gray-300 text-xs mb-1">{stat.label}</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 text-xs">
                    {stat.description}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}