import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function GestaltCard({ synthesis, index }) {
  if (!synthesis) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-gradient-to-br from-amber-900/50 to-yellow-900/50 backdrop-blur-xl border-amber-700/30 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-yellow-600 rounded-xl flex items-center justify-center shrink-0">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-2xl font-bold text-amber-200">
                  {synthesis.contradiction_summary}
                </h3>
                <Badge className="bg-yellow-600 text-white">
                  Gestalt
                </Badge>
              </div>
              {synthesis.psychological_dynamic && (
                <p className="text-amber-300 text-sm italic">
                  {synthesis.psychological_dynamic}
                </p>
              )}
            </div>
          </div>

          <div className="bg-amber-800/30 rounded-xl p-6 mb-4">
            <p className="text-amber-100 leading-relaxed whitespace-pre-wrap text-lg">
              {synthesis.detailed_interpretation}
            </p>
          </div>

          {synthesis.involved_features && synthesis.involved_features.length > 0 && (
            <div className="mb-4">
              <p className="text-amber-300 text-sm font-semibold mb-2">🔗 מאפיינים מעורבים:</p>
              <div className="flex flex-wrap gap-2">
                {synthesis.involved_features.map((feat, i) => (
                  <Badge key={i} className="bg-amber-700 text-white">
                    {feat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {synthesis.dominant_subdominant_analysis && (
            <div className="bg-yellow-800/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-200 text-sm font-semibold mb-1">
                📊 ניתוח דומיננטיות:
              </p>
              <p className="text-yellow-100 text-sm leading-relaxed">
                {synthesis.dominant_subdominant_analysis}
              </p>
            </div>
          )}

          {synthesis.example_manifestation && (
            <div className="bg-amber-800/20 border border-amber-700/40 rounded-lg p-4">
              <p className="text-amber-300 text-xs font-semibold mb-1">
                💡 דוגמה מהחיים:
              </p>
              <p className="text-amber-100 text-sm leading-relaxed">
                {synthesis.example_manifestation}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}