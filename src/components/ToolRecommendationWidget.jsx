import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Hash, Stars, Hand, PenTool, Layers, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const TOOL_CONFIG = {
  numerology: {
    name: "נומרולוגיה",
    icon: Hash,
    page: "Numerology",
    gradient: "from-purple-600 to-pink-600",
    emoji: "🔢"
  },
  astrology: {
    name: "אסטרולוגיה",
    icon: Stars,
    page: "Astrology",
    gradient: "from-indigo-600 to-purple-600",
    emoji: "⭐"
  },
  palmistry: {
    name: "כף יד",
    icon: Hand,
    page: "Palmistry",
    gradient: "from-blue-600 to-cyan-600",
    emoji: "🖐️"
  },
  graphology: {
    name: "גרפולוגיה",
    icon: PenTool,
    page: "Graphology",
    gradient: "from-green-600 to-emerald-600",
    emoji: "✍️"
  },
  tarot: {
    name: "טארוט",
    icon: Layers,
    page: "Tarot",
    gradient: "from-amber-600 to-orange-600",
    emoji: "🃏"
  },
  drawing: {
    name: "ניתוח ציורים",
    icon: PenTool,
    page: "DrawingAnalysis",
    gradient: "from-pink-600 to-rose-600",
    emoji: "🎨"
  },
  journal: {
    name: "יומן",
    icon: BookOpen,
    page: "Journal",
    gradient: "from-violet-600 to-purple-600",
    emoji: "📔"
  }
};

export default function ToolRecommendationWidget({ recommendedTools = [], reason = "" }) {
  if (!recommendedTools || recommendedTools.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <Card className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-indigo-600/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-yellow-400" />
            <h3 className="text-white text-xl font-bold">כלים מומלצים עבורך</h3>
          </div>
          
          {reason && (
            <p className="text-indigo-200 text-sm mb-4 leading-relaxed">
              {reason}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-3">
            {recommendedTools.map((toolKey, idx) => {
              const tool = TOOL_CONFIG[toolKey];
              if (!tool) return null;

              const Icon = tool.icon;

              return (
                <Link key={toolKey} to={createPageUrl(tool.page)}>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className={`bg-gradient-to-br ${tool.gradient} border-none hover:scale-105 transition-all cursor-pointer`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-bold">{tool.name}</h4>
                            <p className="text-white/80 text-xs">{tool.emoji}</p>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-white/80" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}