import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Hash, Stars, Hand, PenTool, Layers, Palette, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const TOOL_CONFIG = {
  numerology: { name: "נומרולוגיה", icon: Hash, color: "purple" },
  astrology: { name: "אסטרולוגיה", icon: Stars, color: "indigo" },
  palmistry: { name: "כף יד", icon: Hand, color: "blue" },
  graphology: { name: "גרפולוגיה", icon: PenTool, color: "green" },
  tarot: { name: "טארוט", icon: Layers, color: "amber" },
  drawing: { name: "ניתוח ציור", icon: Palette, color: "pink" },
  combined: { name: "סינתזה", icon: Sparkles, color: "purple" }
};

export default function AnalysisTimeline({ analyses }) {
  if (!analyses || analyses.length === 0) return null;

  // קיבוץ לפי חודשים
  const groupedByMonth = analyses.reduce((acc, analysis) => {
    const date = new Date(analysis.created_date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthLabel = date.toLocaleDateString('he-IL', { year: 'numeric', month: 'long' });
    
    if (!acc[monthKey]) {
      acc[monthKey] = {
        label: monthLabel,
        analyses: []
      };
    }
    acc[monthKey].analyses.push(analysis);
    return acc;
  }, {});

  const sortedMonths = Object.entries(groupedByMonth).sort((a, b) => b[0].localeCompare(a[0]));

  return (
    <div className="space-y-8">
      {sortedMonths.map(([monthKey, { label, analyses: monthAnalyses }]) => (
        <div key={monthKey}>
          <h3 className="text-xl font-bold text-white mb-4 sticky top-0 bg-black/80 backdrop-blur-sm py-2 z-10">
            📅 {label}
          </h3>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute right-6 top-0 bottom-0 w-1 bg-purple-700/30" />
            
            <div className="space-y-6">
              {monthAnalyses.map((analysis, idx) => {
                const tool = TOOL_CONFIG[analysis.tool_type] || TOOL_CONFIG.combined;
                const Icon = tool.icon;
                const date = new Date(analysis.created_date);
                
                return (
                  <motion.div
                    key={analysis.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="relative pr-16"
                  >
                    {/* Timeline dot */}
                    <div className={`absolute right-4 w-5 h-5 bg-${tool.color}-600 rounded-full border-4 border-black z-10`} />
                    
                    <Card className={`bg-gray-900/60 backdrop-blur-xl border-${tool.color}-700/50 hover:border-${tool.color}-500 transition-all cursor-pointer`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-12 h-12 bg-gradient-to-br from-${tool.color}-600 to-${tool.color}-700 rounded-xl flex items-center justify-center shrink-0`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge className={`bg-${tool.color}-700 text-white text-xs`}>
                                {tool.name}
                              </Badge>
                              <span className="text-gray-400 text-xs">
                                {date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                              </span>
                            </div>
                            <h4 className="text-white font-semibold mb-1">
                              {analysis.summary}
                            </h4>
                            {analysis.confidence_score && (
                              <Badge className="bg-green-900/50 text-green-300 border-green-600/50 text-xs">
                                ✓ דיוק: {analysis.confidence_score}%
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}