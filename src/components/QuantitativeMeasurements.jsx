import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Ruler, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function QuantitativeMeasurements({ measurements }) {
  if (!measurements) return null;

  const measurementItems = [
    {
      label: "זווית נטייה",
      value: measurements.slant_degrees_exact,
      unit: "מעלות",
      icon: "🔄",
      color: "blue"
    },
    {
      label: "גובה אזור אמצעי",
      value: measurements.middle_zone_mm_exact,
      unit: "מ\"מ",
      icon: "📏",
      color: "purple"
    },
    {
      label: "לחץ כתיבה",
      value: measurements.pressure_scale_1_10,
      unit: "/10",
      icon: "💪",
      color: "orange"
    },
    {
      label: "ריווח אותיות",
      value: measurements.spacing_letters_mm_avg,
      unit: "מ\"מ",
      icon: "↔️",
      color: "green"
    },
    {
      label: "ריווח מילים",
      value: measurements.spacing_words_mm_avg,
      unit: "מ\"מ",
      icon: "⬌",
      color: "teal"
    },
    {
      label: "ריווח שורות",
      value: measurements.spacing_lines_mm_avg,
      unit: "מ\"מ",
      icon: "☰",
      color: "cyan"
    },
    {
      label: "ציון קצב",
      value: measurements.rhythm_score_1_10,
      unit: "/10",
      icon: "🎵",
      color: "pink"
    },
    {
      label: "אחוז קישוריות",
      value: measurements.connectivity_percentage,
      unit: "%",
      icon: "🔗",
      color: "indigo"
    },
    {
      label: "יחס אזור עליון",
      value: measurements.upper_zone_ratio,
      unit: "×",
      icon: "⬆️",
      color: "violet"
    },
    {
      label: "יחס אזור תחתון",
      value: measurements.lower_zone_ratio,
      unit: "×",
      icon: "⬇️",
      color: "rose"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-gray-900/60 to-slate-900/60 backdrop-blur-xl border-gray-700/30">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Ruler className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">מדידות כמותיות</h3>
              <p className="text-gray-400 text-sm">נתונים מדודים אובייקטיבית</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {measurementItems.map((item, idx) => {
              if (item.value === undefined || item.value === null) return null;
              
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`bg-${item.color}-900/30 border-2 border-${item.color}-700/40 rounded-xl p-4 text-center hover:scale-105 transition-transform`}
                >
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-gray-300 text-xs mb-2">{item.label}</div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
                  </div>
                  <div className="text-gray-400 text-xs">{item.unit}</div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 bg-blue-900/20 border border-blue-700/30 rounded-lg p-4">
            <p className="text-blue-200 text-sm flex items-start gap-2">
              <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                מדידות אלו מבוססות על ניתוח ויזואלי של התמונה. הן מספקות בסיס אובייקטיבי לפרשנויות התיאורטיות.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}