
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Info, BookOpen, Sparkles, ChevronDown, ChevronUp, Target, Heart, Briefcase, Compass, Zap, CheckCircle, AlertTriangle, Brain, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TAG_TRANSLATIONS = {
  personality: "אישיות",
  career: "קריירה",
  relationships: "יחסים",
  health: "בריאות",
  timing: "תזמון",
  challenge: "אתגר",
  strength: "חוזק",
  recommendation: "המלצה",
  spiritual: "רוחניות",
  creative: "יצירתיות"
};

const getHebrewTag = (tag) => TAG_TRANSLATIONS[tag] || tag;

const INSIGHT_TYPE_COLORS = {
  personality: "bg-purple-100 text-purple-800 border-purple-300",
  career: "bg-blue-100 text-blue-800 border-blue-300",
  relationships: "bg-pink-100 text-pink-800 border-pink-300",
  health: "bg-red-100 text-red-800 border-red-300",
  timing: "bg-green-100 text-green-800 border-green-300",
  challenge: "bg-orange-100 text-orange-800 border-orange-300",
  strength: "bg-emerald-100 text-emerald-800 border-emerald-300",
  recommendation: "bg-indigo-100 text-indigo-800 border-indigo-300",
  spiritual: "bg-violet-100 text-violet-800 border-violet-300",
  creative: "bg-amber-100 text-amber-800 border-amber-300"
};

export default function ExplainableInsight({ insight, showProvenance = true }) {
  const [showSources, setShowSources] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);

  if (!insight) return null;

  const {
    title,
    content,
    insight_type,
    confidence,
    weight,
    provenance,
    tags = [],
    strengths = [],
    challenges = [],
    actionable_advice = [],
    psychological_connection,
    ancient_wisdom,
    archetype,
    jungian_profile,
    keywords,
    psychological_depth,
    career_paths,
    relationships,
    life_purpose,
    spiritual_path
  } = insight;

  const colorClass = INSIGHT_TYPE_COLORS[insight_type] || "bg-gray-100 text-gray-800 border-gray-300";
  
  const isDeepInsight = psychological_depth || strengths?.length > 0 || challenges?.length > 0 || archetype;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      role="article"
      aria-label={`תובנה: ${title}`}
    >
      <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border-2 border-purple-600/40 hover:border-purple-400/60 transition-all shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-800/70 to-gray-900/70">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {insight_type && (
                  <Badge className={colorClass}>
                    {getHebrewTag(insight_type)}
                  </Badge>
                )}
                {confidence !== undefined && (
                  <Badge className="bg-blue-600/80 text-blue-100 border-blue-500/50">
                    דיוק: {Math.round(confidence * 100)}%
                  </Badge>
                )}
                {weight !== undefined && weight > 0.85 && (
                  <Badge className="bg-yellow-600/80 text-yellow-100 border-yellow-500/50">
                    <Sparkles className="w-3 h-3 ml-1" />
                    חשוב מאוד
                  </Badge>
                )}
              </div>
              <CardTitle className="text-gray-50 text-xl md:text-2xl drop-shadow-sm">
                {title}
              </CardTitle>
              {archetype && (
                <p className="text-purple-200 text-sm mt-2 italic">
                  🎭 {archetype}
                </p>
              )}
              {jungian_profile && (
                <p className="text-indigo-200 text-xs mt-1">
                  {jungian_profile}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-gray-900/60">
          <div className="text-gray-100 text-base md:text-lg leading-relaxed mb-4 space-y-4">
            {content && typeof content === 'string' && content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="leading-relaxed">
                {paragraph}
              </p>
            ))}
            {(!content || typeof content !== 'string') && (
              <p className="text-purple-300 text-sm italic">אין תוכן זמין</p>
            )}
          </div>

          {keywords && keywords.length > 0 && (
            <div className="mb-4">
              <p className="text-purple-300 text-sm font-semibold mb-2">🔑 מילות מפתח:</p>
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw, idx) => (
                  <Badge key={idx} variant="outline" className="bg-purple-900/30 text-purple-200 border-purple-600/50">
                    {kw}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Strengths Section - Enhanced */}
          {strengths && strengths.length > 0 && (
            <div className="bg-green-900/40 rounded-lg p-4 mb-4 border border-green-700/30">
              <p className="text-green-100 text-sm font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                נקודות חוזק ({strengths.length}):
              </p>
              <ul className="space-y-1">
                {strengths.map((str, idx) => (
                  <li key={idx} className="text-green-50 text-sm">✓ {str}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges Section - Enhanced */}
          {challenges && challenges.length > 0 && (
            <div className="bg-orange-900/40 rounded-lg p-4 mb-4 border border-orange-700/30">
              <p className="text-orange-100 text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                אתגרים להתמודדות ({challenges.length}):
              </p>
              <ul className="space-y-1">
                {challenges.map((ch, idx) => (
                  <li key={idx} className="text-orange-50 text-sm">→ {ch}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Actionable Advice Section */}
          {actionable_advice && actionable_advice.length > 0 && (
            <div className="mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvice(!showAdvice)}
                className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-900/30 mb-3 w-full justify-between"
                aria-expanded={showAdvice}
              >
                <span className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  עצות מעשיות ({actionable_advice.length})
                </span>
                {showAdvice ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>

              <AnimatePresence>
                {showAdvice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-700/30"
                  >
                    <ul className="space-y-2">
                      {actionable_advice.map((advice, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-cyan-100 text-sm">
                          <span className="text-cyan-400 font-bold shrink-0">{idx + 1}.</span>
                          <span>{advice}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Psychological Connection - Enhanced */}
          {psychological_connection && (
            <div className="bg-indigo-900/40 rounded-lg p-4 mb-4 border border-indigo-700/30">
              <p className="text-indigo-100 text-sm font-semibold mb-2 flex items-center gap-2">
                <Brain className="w-4 h-4" />
                קשר לפסיכולוגיה מודרנית:
              </p>
              <p className="text-indigo-50 text-sm leading-relaxed">
                {psychological_connection}
              </p>
            </div>
          )}

          {/* Ancient Wisdom - Enhanced */}
          {ancient_wisdom && (
            <div className="bg-amber-900/40 rounded-lg p-4 mb-4 border border-amber-700/30">
              <p className="text-amber-100 text-sm font-semibold mb-2 flex items-center gap-2">
                <Star className="w-4 h-4" />
                חוכמה עתיקה:
              </p>
              <p className="text-amber-50 text-sm leading-relaxed">
                {ancient_wisdom}
              </p>
            </div>
          )}

          {psychological_depth && (
            <div className="bg-indigo-900/40 rounded-lg p-4 mb-4 border border-indigo-700/30">
              <p className="text-indigo-100 text-sm font-semibold mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                עומק פסיכולוגי:
              </p>
              <p className="text-indigo-50 text-sm leading-relaxed">
                {psychological_depth}
              </p>
            </div>
          )}

          {career_paths && career_paths.length > 0 && (
            <div className="bg-blue-900/40 rounded-lg p-4 mb-4 border border-blue-700/30">
              <p className="text-blue-100 text-sm font-semibold mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                מסלולי קריירה מומלצים:
              </p>
              <div className="flex flex-wrap gap-2">
                {career_paths.map((career, idx) => (
                  <Badge key={idx} className="bg-blue-800 text-blue-100">
                    {career}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {relationships && (
            <div className="bg-pink-900/40 rounded-lg p-4 mb-4 border border-pink-700/30">
              <p className="text-pink-100 text-sm font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-4 h-4" />
                דינמיקת יחסים:
              </p>
              <p className="text-pink-50 text-sm leading-relaxed">
                {relationships}
              </p>
            </div>
          )}

          {life_purpose && (
            <div className="bg-violet-900/40 rounded-lg p-4 mb-4 border border-violet-700/30">
              <p className="text-violet-100 text-sm font-semibold mb-2 flex items-center gap-2">
                <Compass className="w-4 h-4" />
                ייעוד חיים:
              </p>
              <p className="text-violet-50 text-sm leading-relaxed">
                {life_purpose}
              </p>
            </div>
          )}

          {showProvenance && provenance && (provenance.source_features?.length > 0 || provenance.sources?.length > 0) && (
            <div className="pt-6 mt-6 border-t border-purple-600/30">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSources(!showSources)}
                className="text-purple-200 hover:text-purple-100 hover:bg-purple-900/30 mb-4"
                aria-expanded={showSources}
                aria-controls="insight-sources"
              >
                <BookOpen className="w-4 h-4 ml-1" />
                {showSources ? 'הסתר מקורות' : 'הצג מקורות ידע'}
                {showSources ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
              </Button>

              <AnimatePresence>
                {showSources && (
                  <motion.div
                    id="insight-sources"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    {provenance.source_features && provenance.source_features.length > 0 && (
                      <div className="bg-indigo-900/40 rounded-lg p-4 border border-indigo-600/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="w-5 h-5 text-indigo-200" />
                          <h4 className="text-indigo-100 font-bold">על מה זה מבוסס:</h4>
                        </div>
                        <ul className="space-y-2" role="list">
                          {provenance.source_features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-indigo-300 mt-1">•</span>
                              <span className="text-indigo-50">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {provenance.synthesis_basis && (
                      <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-600/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Sparkles className="w-5 h-5 text-purple-200" />
                          <h4 className="text-purple-100 font-bold">הסבר השילוב:</h4>
                        </div>
                        <p className="text-purple-50 text-sm leading-relaxed">
                          {provenance.synthesis_basis}
                        </p>
                      </div>
                    )}

                    {provenance.rule_description && (
                      <div className="bg-blue-900/40 rounded-lg p-4 border border-blue-600/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Info className="w-5 h-5 text-blue-200" />
                          <h4 className="text-blue-100 font-bold">הסבר מפורט:</h4>
                        </div>
                        <p className="text-blue-50 text-sm leading-relaxed">
                          {provenance.rule_description}
                        </p>
                      </div>
                    )}

                    {provenance.sources && provenance.sources.length > 0 && (
                      <div className="bg-purple-900/40 rounded-lg p-4 border border-purple-600/30">
                        <div className="flex items-center gap-2 mb-3">
                          <BookOpen className="w-5 h-5 text-purple-200" />
                          <h4 className="text-purple-100 font-bold">מקורות ידע:</h4>
                        </div>
                        <ul className="space-y-2" role="list">
                          {provenance.sources.map((source, idx) => (
                            <li key={idx} className="text-purple-50 text-sm">
                              📚 {source}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {tags && tags.length > 0 && (
            <div className="mt-4 pt-4 border-t border-purple-700/30">
              <p className="text-purple-300 text-xs font-semibold mb-2">🏷️ תגיות:</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-600/30 text-xs">
                    {getHebrewTag(tag)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
