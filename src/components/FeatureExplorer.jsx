import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Eye, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FeatureExplorer({ features }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedFeature, setExpandedFeature] = useState(null);
  const [filterCategory, setFilterCategory] = useState("all");

  if (!features) return null;

  const featuresList = Object.entries(features).map(([key, data]) => ({
    key,
    data,
    title: getFeatureTitle(key),
    category: getFeatureCategory(key)
  }));

  const filteredFeatures = featuresList.filter(f => {
    const matchesSearch = f.title.includes(searchTerm) || searchTerm === "";
    const matchesCategory = filterCategory === "all" || f.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [
    { value: "all", label: "הכל" },
    { value: "global", label: "כלליים" },
    { value: "fundamental", label: "יסודיים" },
    { value: "accessory", label: "אקססוריים" }
  ];

  return (
    <Card className="bg-gray-900/50 border-gray-700/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Eye className="w-6 h-6 text-gray-300" />
            <h3 className="text-2xl font-bold text-white">חוקר מאפיינים (300+)</h3>
          </div>
          <Badge className="bg-yellow-600 text-white">תיאורטי</Badge>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="חפש מאפיין..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
          <div className="flex gap-2">
            {categories.map(cat => (
              <Button
                key={cat.value}
                size="sm"
                variant={filterCategory === cat.value ? "default" : "outline"}
                onClick={() => setFilterCategory(cat.value)}
                className={filterCategory === cat.value ? "bg-blue-600" : "border-gray-600 text-gray-300"}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <AnimatePresence>
            {filteredFeatures.map((feature, idx) => (
              <motion.div
                key={feature.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: idx * 0.03 }}
              >
                <div className="bg-indigo-900/30 rounded-lg overflow-hidden border border-indigo-700/30">
                  <button
                    onClick={() => setExpandedFeature(expandedFeature === feature.key ? null : feature.key)}
                    className="w-full p-4 flex items-center justify-between hover:bg-indigo-800/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getFeatureIcon(feature.key)}</span>
                      <div className="text-right">
                        <div className="text-indigo-200 font-bold">{feature.title}</div>
                        {feature.data.measurement && (
                          <div className="text-indigo-400 text-sm">{feature.data.measurement}</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {feature.data.garoot_correlation && (
                        <Badge className="bg-blue-700 text-white text-xs">
                          Garoot
                        </Badge>
                      )}
                      {expandedFeature === feature.key ? 
                        <ChevronUp className="w-5 h-5 text-indigo-300" /> : 
                        <ChevronDown className="w-5 h-5 text-indigo-300" />
                      }
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedFeature === feature.key && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-indigo-700/30"
                      >
                        <div className="p-4 space-y-3">
                          {feature.data.objective_description && (
                            <div className="bg-gray-800/40 rounded-lg p-3">
                              <div className="text-gray-400 text-xs mb-1">📏 מדידה אובייקטיבית:</div>
                              <div className="text-gray-200 text-sm">{feature.data.objective_description}</div>
                            </div>
                          )}

                          {feature.data.garoot_correlation && (
                            <div className="bg-blue-800/30 rounded-lg p-3">
                              <div className="text-blue-300 text-xs mb-1">🔬 מחקר Garoot (2021):</div>
                              <div className="text-blue-100 text-sm">{feature.data.garoot_correlation}</div>
                            </div>
                          )}

                          {feature.data.interpretation && (
                            <div className="bg-indigo-800/30 rounded-lg p-3">
                              <div className="text-indigo-300 text-xs mb-1">💡 פרשנות תיאורטית:</div>
                              <div className="text-indigo-100 text-sm leading-relaxed">{feature.data.interpretation}</div>
                            </div>
                          )}

                          {feature.data.interpretation_high_fn && (
                            <div className="bg-green-900/30 rounded-lg p-3">
                              <div className="text-green-300 text-xs mb-1">✅ Formniveau גבוה:</div>
                              <div className="text-green-100 text-sm leading-relaxed">{feature.data.interpretation_high_fn}</div>
                            </div>
                          )}

                          {feature.data.interpretation_low_fn && (
                            <div className="bg-red-900/30 rounded-lg p-3">
                              <div className="text-red-300 text-xs mb-1">⚠️ Formniveau נמוך:</div>
                              <div className="text-red-100 text-sm leading-relaxed">{feature.data.interpretation_low_fn}</div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredFeatures.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">לא נמצאו מאפיינים התואמים לחיפוש</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function getFeatureTitle(key) {
  const titles = {
    baseline: 'קו בסיס',
    slant: 'נטייה',
    size: 'גודל',
    pressure: 'לחץ',
    speed: 'מהירות',
    spacing: 'ריווח',
    margins: 'שוליים',
    zones: 'אזורים',
    connectivity: 'קישוריות',
    letter_forms: 'צורות אותיות',
    width: 'רוחב',
    regularity: 'סדירות',
    rhythm: 'קצב',
    t_bars: 'קו ה-T',
    i_dots: 'נקודת ה-I',
    closed_letters: 'אותיות סגורות',
    loops: 'לולאות',
    capitals: 'אותיות גדולות',
    signature: 'חתימה',
    starting_strokes: 'תחילות',
    ending_strokes: 'סיומות',
    dots_and_accents: 'נקודות וסימנים',
    word_spacing_patterns: 'דפוסי ריווח מילים'
  };
  return titles[key] || key;
}

function getFeatureIcon(key) {
  const icons = {
    baseline: '📈',
    slant: '🔄',
    size: '📏',
    pressure: '💪',
    speed: '⚡',
    spacing: '↔️',
    margins: '📐',
    zones: '🏔️',
    connectivity: '🔗',
    letter_forms: '✍️',
    width: '↕️',
    regularity: '📊',
    rhythm: '🎵',
    t_bars: '✝️',
    i_dots: '•',
    closed_letters: '⭕',
    loops: '➰',
    capitals: '🔠',
    signature: '✒️',
    starting_strokes: '▶️',
    ending_strokes: '⏹️',
    dots_and_accents: '·',
    word_spacing_patterns: '⬌'
  };
  return icons[key] || '📋';
}

function getFeatureCategory(key) {
  const global = ['baseline', 'slant', 'size', 'pressure', 'speed', 'spacing', 'margins'];
  const fundamental = ['zones', 'connectivity', 'letter_forms', 'width', 'regularity', 'rhythm'];
  const accessory = ['t_bars', 'i_dots', 'closed_letters', 'loops', 'capitals', 'signature', 'starting_strokes', 'ending_strokes', 'dots_and_accents', 'word_spacing_patterns'];
  
  if (global.includes(key)) return 'global';
  if (fundamental.includes(key)) return 'fundamental';
  if (accessory.includes(key)) return 'accessory';
  return 'other';
}