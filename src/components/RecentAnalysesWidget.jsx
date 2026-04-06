import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { History, Hash, Hand, PenTool, Stars, Layers, Palette, FileText, HelpCircle, Sparkles, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * RECENT ANALYSES WIDGET
 * ווידג'ט המציג את הניתוחים האחרונים של המשתמש
 */

const toolIcons = {
  numerology: Hash,
  astrology: Stars,
  palmistry: Hand,
  graphology: PenTool,
  tarot: Layers,
  drawing: Palette,
  document_analyzer: FileText,
  question: HelpCircle,
  combined: Sparkles
};

const toolLabels = {
  numerology: "נומרולוגיה",
  astrology: "אסטרולוגיה",
  palmistry: "כף יד",
  graphology: "גרפולוגיה",
  tarot: "טארוט",
  drawing: "ניתוח ציור",
  document_analyzer: "ניתוח מסמך",
  question: "שאלה",
  combined: "משולב"
};

const toolColors = {
  numerology: "from-purple-600 to-pink-600",
  astrology: "from-indigo-600 to-purple-600",
  palmistry: "from-blue-600 to-cyan-600",
  graphology: "from-green-600 to-teal-600",
  tarot: "from-amber-600 to-orange-600",
  drawing: "from-rose-600 to-pink-600",
  document_analyzer: "from-violet-600 to-purple-600",
  question: "from-yellow-600 to-orange-600",
  combined: "from-purple-600 via-pink-600 to-purple-600"
};

export default function RecentAnalysesWidget({ analyses = [] }) {
  if (!analyses || analyses.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-gray-900/50 to-purple-900/50 border-purple-700/30">
        <CardContent className="p-8 text-center">
          <History className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">עוד לא התחלת</h3>
          <p className="text-purple-200 mb-4">
            הניתוחים שלך יופיעו כאן
          </p>
          <Link to={createPageUrl('Numerology')}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4 ml-2" />
              בוא נתחיל בניתוח
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  // Take only the 5 most recent
  const recentAnalyses = analyses.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="bg-gradient-to-br from-gray-900/60 to-blue-900/60 backdrop-blur-xl border-2 border-blue-600/50 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-2xl flex items-center gap-3">
              <History className="w-8 h-8 text-blue-400" />
              הניתוחים האחרונים
            </CardTitle>
            <Link to={createPageUrl('MyAnalyses')}>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-blue-300 hover:text-white hover:bg-blue-800/30"
              >
                ראה הכל →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentAnalyses.map((analysis, idx) => {
            const ToolIcon = toolIcons[analysis.tool_type] || Sparkles;
            const gradient = toolColors[analysis.tool_type] || "from-purple-600 to-pink-600";
            const label = toolLabels[analysis.tool_type] || analysis.tool_type;

            return (
              <motion.div
                key={analysis.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gray-800/50 rounded-xl p-4 border border-blue-700/30 hover:border-blue-500/50 hover:bg-gray-800/70 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <ToolIcon className="w-6 h-6 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-white font-semibold truncate">
                        {analysis.summary || label}
                      </h4>
                      <Badge className="bg-blue-600/30 text-blue-200 text-xs shrink-0">
                        {label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-blue-300">
                      <span>
                        📅 {new Date(analysis.created_date).toLocaleDateString('he-IL', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      {analysis.confidence_score && (
                        <span className="text-green-400">
                          ✓ {analysis.confidence_score}%
                        </span>
                      )}
                      {analysis.insights_count && (
                        <span className="text-yellow-400">
                          💎 {analysis.insights_count}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowLeft className="w-5 h-5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            );
          })}

          {/* Summary Stats */}
          <div className="pt-4 mt-4 border-t border-blue-700/30">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">
                  {analyses.length}
                </div>
                <div className="text-blue-300 text-xs">סך הכל</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {new Set(analyses.map(a => a.tool_type)).size}
                </div>
                <div className="text-blue-300 text-xs">כלים שונים</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {analyses.filter(a => 
                    new Date(a.created_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                  ).length}
                </div>
                <div className="text-blue-300 text-xs">השבוע</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}