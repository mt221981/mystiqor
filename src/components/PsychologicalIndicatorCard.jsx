import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, TrendingUp, AlertCircle, CheckCircle, Info } from "lucide-react";

/**
 * PsychologicalIndicatorCard
 * מציג קישור ישיר בין מדד כמותי לאינדיקטור פסיכולוגי
 * כולל OR values, מסגרת תיאורטית, וחשיבות קלינית
 */
export default function PsychologicalIndicatorCard({ indicator }) {
  const categoryIcons = {
    ego_strength: Brain,
    attachment: CheckCircle,
    anxiety: AlertCircle,
    depression: TrendingUp,
    self_esteem: CheckCircle,
    aggression: AlertCircle,
    trauma: AlertCircle,
    defense_mechanisms: Brain,
    interpersonal: CheckCircle,
    archetypal: Brain
  };

  const categoryColors = {
    ego_strength: "from-purple-600 to-indigo-600",
    attachment: "from-blue-600 to-cyan-600",
    anxiety: "from-orange-600 to-red-600",
    depression: "from-gray-600 to-blue-600",
    self_esteem: "from-green-600 to-emerald-600",
    aggression: "from-red-600 to-pink-600",
    trauma: "from-amber-600 to-orange-600",
    defense_mechanisms: "from-violet-600 to-purple-600",
    interpersonal: "from-teal-600 to-cyan-600",
    archetypal: "from-indigo-600 to-purple-600"
  };

  const categoryLabels = {
    ego_strength: "חוזק אגו",
    attachment: "התקשרות",
    anxiety: "חרדה",
    depression: "דיכאון",
    self_esteem: "הערכה עצמית",
    aggression: "תוקפנות",
    trauma: "טראומה",
    defense_mechanisms: "מנגנוני הגנה",
    interpersonal: "בין-אישי",
    archetypal: "ארכיטיפי"
  };

  const Icon = categoryIcons[indicator.category] || Info;
  const gradient = categoryColors[indicator.category] || "from-gray-600 to-gray-800";
  const categoryLabel = categoryLabels[indicator.category] || indicator.category;

  const confidenceColor = indicator.confidence >= 0.9 ? "text-green-400" : 
                          indicator.confidence >= 0.8 ? "text-blue-400" : 
                          indicator.confidence >= 0.7 ? "text-yellow-400" : "text-orange-400";

  return (
    <Card className="bg-gray-900/80 backdrop-blur-xl border-gray-700/50 hover:border-purple-500/50 transition-all">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center shadow-lg shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{indicator.indicator_name}</h3>
              <Badge className="bg-gray-800 text-gray-300 text-xs mt-1">
                {categoryLabel}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-lg font-bold ${confidenceColor}`}>
              {Math.round((indicator.confidence || 0.85) * 100)}%
            </div>
            <p className="text-gray-400 text-xs">ביטחון</p>
          </div>
        </div>

        {/* Assessment */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
          <p className="text-white font-semibold mb-2">🎯 הערכה:</p>
          <p className="text-gray-300 text-sm">{indicator.assessment}</p>
        </div>

        {/* Quantitative Evidence */}
        <div className="mb-4">
          <p className="text-purple-300 font-semibold text-sm mb-2">📊 ראיות כמותיות:</p>
          <div className="space-y-1">
            {indicator.quantitative_evidence?.map((evidence, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                <p className="text-gray-300 text-xs">{evidence}</p>
              </div>
            ))}
          </div>
        </div>

        {/* OR Value */}
        {indicator.OR_value && indicator.OR_value !== "N/A" && (
          <div className="bg-orange-950/40 rounded-lg p-3 mb-4 border border-orange-700/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <p className="text-orange-300 font-semibold text-xs">Odds Ratio (OR):</p>
            </div>
            <p className="text-orange-100 text-sm">{indicator.OR_value}</p>
          </div>
        )}

        {/* Theoretical Basis */}
        <div className="bg-indigo-950/40 rounded-lg p-3 mb-4">
          <p className="text-indigo-300 font-semibold text-xs mb-2">🔬 בסיס תיאורטי:</p>
          <p className="text-indigo-100 text-xs leading-relaxed">{indicator.theoretical_basis}</p>
        </div>

        {/* Archetype Connection */}
        {indicator.archetype_connection && (
          <div className="bg-violet-950/40 rounded-lg p-3 mb-4">
            <p className="text-violet-300 font-semibold text-xs mb-2">🎭 קישור לארכיטיפ:</p>
            <p className="text-violet-100 text-xs">{indicator.archetype_connection}</p>
          </div>
        )}

        {/* Attachment Connection */}
        {indicator.attachment_connection && (
          <div className="bg-blue-950/40 rounded-lg p-3 mb-4">
            <p className="text-blue-300 font-semibold text-xs mb-2">🤝 קישור להתקשרות:</p>
            <p className="text-blue-100 text-xs">{indicator.attachment_connection}</p>
          </div>
        )}

        {/* Clinical Significance */}
        <div className="bg-purple-950/30 rounded-lg p-3 border-l-4 border-purple-500">
          <p className="text-purple-300 font-semibold text-xs mb-2">⚕️ משמעות קלינית:</p>
          <p className="text-purple-100 text-xs leading-relaxed">{indicator.clinical_significance}</p>
        </div>
      </CardContent>
    </Card>
  );
}