
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Maximize2,
  Zap, Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";


/**
 * GRAPHIC FEATURES BREAKDOWN
 * פירוט ויזואלי של כל המאפיינים הגרפיים
 */

const FEATURE_CONFIGS = {
  size_analysis: {
    icon: Maximize2,
    name: 'גודל הציור',
    color: '#3B82F6',
    scale: {
      very_small: { value: 10, color: '#EF4444', meaning: 'קטן מאוד - ביטחון נמוך' },
      small: { value: 30, color: '#F59E0B', meaning: 'קטן - ביישנות' },
      medium: { value: 50, color: '#10B981', meaning: 'בינוני - מאוזן' },
      large: { value: 70, color: '#F59E0B', meaning: 'גדול - ביטחון גבוה' },
      very_large: { value: 90, color: '#EF4444', meaning: 'גדול מאוד - גרנדיוזיות' }
    }
  },
  line_pressure: {
    icon: Zap,
    name: 'לחץ הקו',
    color: '#F59E0B',
    scale: {
      very_light: { value: 10, color: '#60A5FA', meaning: 'קל מאוד - דיכאון?' },
      light: { value: 30, color: '#93C5FD', meaning: 'קל - עדינות' },
      medium: { value: 50, color: '#10B981', meaning: 'בינוני - תקין' },
      heavy: { value: 70, color: '#F59E0B', meaning: 'כבד - מתח' },
      very_heavy: { value: 90, color: '#EF4444', meaning: 'כבד מאוד - תוקפנות?' }
    }
  },
  detail_level: {
    icon: Layers,
    name: 'רמת פירוט',
    color: '#8B5CF6',
    scale: {
      minimal: { value: 10, color: '#EF4444', meaning: 'מינימלי - דיכאון?' },
      sparse: { value: 30, color: '#F59E0B', meaning: 'דל - מעט' },
      adequate: { value: 50, color: '#10B981', meaning: 'מספק - תקין' },
      rich: { value: 70, color: '#3B82F6', meaning: 'עשיר - יצירתי' },
      excessive: { value: 90, color: '#F59E0B', meaning: 'מוגזם - אובססיבי?' }
    }
  }
};

export default function GraphicFeaturesBreakdown({ graphicFeatures }) {
  const [expandedFeature, setExpandedFeature] = useState(null);

  if (!graphicFeatures) return null;

  // Build data for visualization
  const featuresData = Object.entries(FEATURE_CONFIGS)
    .filter(([key]) => graphicFeatures[key])
    .map(([key, config]) => {
      const featureData = graphicFeatures[key];
      const mainValue = featureData.overall_size || featureData.pressure_level || featureData.detail_amount;
      const scaleInfo = config.scale[mainValue];

      return {
        key,
        config,
        data: featureData,
        value: scaleInfo?.value || 50,
        color: scaleInfo?.color || '#888888',
        meaning: scaleInfo?.meaning || '',
        mainValue
      };
    });

  return (
    <Card className="bg-gray-900/80 border-purple-700/30">
      <CardHeader>
        <div className="text-center">
          <CardTitle className="text-white text-3xl mb-2">
            📐 המאפיינים של הציור שלך
          </CardTitle>
          <p className="text-purple-200 text-lg">
            לחץ על מאפיין כדי להבין מה הוא אומר עליך
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature Cards - Big and Simple */}
        <div className="grid md:grid-cols-3 gap-4">
          {featuresData.map((feature) => {
            const Icon = feature.config.icon;
            const isExpanded = expandedFeature === feature.key;

            return (
              <motion.div
                key={feature.key}
                layout
                className="cursor-pointer"
                onClick={() => setExpandedFeature(isExpanded ? null : feature.key)}
              >
                <Card className={`transition-all ${
                  isExpanded 
                    ? 'bg-purple-600 border-purple-400 scale-105' 
                    : 'bg-gray-800/70 border-gray-700 hover:border-purple-600'
                } border-2`}>
                  <CardContent className="p-6">
                    {/* Icon and Name */}
                    <div className="text-center mb-4">
                      <Icon className="w-12 h-12 text-white mx-auto mb-2" />
                      <h4 className="text-white font-bold text-xl">{feature.config.name}</h4>
                    </div>

                    {/* Value */}
                    <div className="text-center mb-4">
                      <div 
                        className="inline-block px-6 py-3 rounded-full text-white font-bold text-2xl"
                        style={{ backgroundColor: feature.color }}
                      >
                        {feature.mainValue}
                      </div>
                    </div>

                    {/* Visual Bar */}
                    <div className="h-3 bg-gray-700 rounded-full overflow-hidden mb-3">
                      <div 
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ 
                          width: `${feature.value}%`,
                          backgroundColor: feature.color
                        }}
                      />
                    </div>

                    {/* Simple Meaning */}
                    <p className="text-gray-200 text-center text-base font-semibold">
                      {feature.meaning}
                    </p>

                    {/* Expanded */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-white/20"
                        >
                          <p className="text-white text-base leading-relaxed">
                            {feature.data.interpretation}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Click Hint */}
                    <div className="mt-3 text-center">
                      <span className="text-white/50 text-sm">
                        👆 {isExpanded ? 'לחץ לסגירה' : 'לחץ להסבר'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Erasures Card (if present) */}
        {graphicFeatures.erasures_corrections && graphicFeatures.erasures_corrections.erasure_count !== 'none' && (
          <Card className="bg-orange-900/40 border-orange-700/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <span className="text-5xl">🧹</span>
                <div className="flex-1">
                  <h4 className="text-orange-200 font-bold text-2xl mb-2">מחיקות בציור</h4>
                  <p className="text-orange-100 text-lg leading-relaxed">
                    {graphicFeatures.erasures_corrections.interpretation}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Shading Card (if present) */}
        {graphicFeatures.shading && graphicFeatures.shading.shading_present && (
          <Card className="bg-red-900/40 border-red-700/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <span className="text-5xl">🌑</span>
                <div className="flex-1">
                  <h4 className="text-red-200 font-bold text-2xl mb-2">הצללות בציור</h4>
                  <p className="text-red-100 text-lg leading-relaxed mb-3">
                    {graphicFeatures.shading.interpretation}
                  </p>
                  <div className="bg-red-800/30 rounded-xl p-4">
                    <p className="text-red-100 text-base">
                      <strong>💡 טוב לדעת:</strong> הצללות בציור הן תגובה טבעית למתח. 
                      אם אתה מרגיש מתח - זה תקין, ואפשר לעבוד על זה.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
