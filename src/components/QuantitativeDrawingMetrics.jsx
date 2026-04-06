import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Eye, Activity, Layers, Target, Ruler, Zap, TrendingUp, Brain, BookOpen, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function QuantitativeDrawingMetrics({ features, drawingName }) {
  const [showPsychContext, setShowPsychContext] = useState(false);

  if (!features) return null;

  const { 
    advanced_line_analysis, 
    line_quality, 
    pressure_inference, 
    size_and_position, 
    elements, 
    general_features, 
    image_quality, 
    forgery_detection,
    psychological_indicators,
    theoretical_cross_validation
  } = features;

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    if (score >= 40) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-900/30 border-green-700/50";
    if (score >= 60) return "bg-yellow-900/30 border-yellow-700/50";
    if (score >= 40) return "bg-orange-900/30 border-orange-700/50";
    return "bg-red-900/30 border-red-700/50";
  };

  const PsychologicalContextCard = ({ context, title, icon: Icon }) => {
    if (!context) return null;

    return (
      <AnimatePresence>
        {showPsychContext && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 bg-indigo-950/50 border border-indigo-700/30 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-5 h-5 text-indigo-300" />
              <h5 className="text-indigo-200 font-bold">{title}</h5>
            </div>
            
            {context.jungian_interpretation && (
              <div className="mb-3 bg-purple-900/30 rounded p-3">
                <p className="text-purple-300 text-sm font-semibold mb-1">🎭 פרשנות יונגיאנית:</p>
                <p className="text-purple-100 text-sm leading-relaxed">{context.jungian_interpretation}</p>
              </div>
            )}

            {context.freudian_interpretation && (
              <div className="mb-3 bg-amber-900/30 rounded p-3">
                <p className="text-amber-300 text-sm font-semibold mb-1">🛡️ פרשנות פרוידיאנית:</p>
                <p className="text-amber-100 text-sm leading-relaxed">{context.freudian_interpretation}</p>
              </div>
            )}

            {context.attachment_implications && (
              <div className="mb-3 bg-blue-900/30 rounded p-3">
                <p className="text-blue-300 text-sm font-semibold mb-1">🤝 השלכות התקשרות:</p>
                <p className="text-blue-100 text-sm leading-relaxed">{context.attachment_implications}</p>
              </div>
            )}

            {context.dominant_archetypes_suggested && context.dominant_archetypes_suggested.length > 0 && (
              <div className="mb-3">
                <p className="text-violet-300 text-sm font-semibold mb-2">ארכיטיפים דומיננטיים:</p>
                <div className="flex flex-wrap gap-2">
                  {context.dominant_archetypes_suggested.map((arch, i) => (
                    <Badge key={i} className="bg-violet-700 text-white">{arch}</Badge>
                  ))}
                </div>
              </div>
            )}

            {context.defense_mechanisms_inferred && context.defense_mechanisms_inferred.length > 0 && (
              <div className="mb-3">
                <p className="text-orange-300 text-sm font-semibold mb-2">מנגנוני הגנה משוערים:</p>
                <div className="flex flex-wrap gap-2">
                  {context.defense_mechanisms_inferred.map((def, i) => (
                    <Badge key={i} className="bg-orange-700 text-white">{def}</Badge>
                  ))}
                </div>
              </div>
            )}

            {context.red_flags && context.red_flags.length > 0 && (
              <div className="mb-3 bg-red-900/30 rounded p-2">
                <p className="text-red-300 text-xs font-semibold">⚠️ סימני אזהרה:</p>
                <ul className="text-red-100 text-xs space-y-1 mt-1">
                  {context.red_flags.map((flag, i) => (
                    <li key={i}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {context.green_flags && context.green_flags.length > 0 && (
              <div className="mb-3 bg-green-900/30 rounded p-2">
                <p className="text-green-300 text-xs font-semibold">✓ אינדיקטורים חיוביים:</p>
                <ul className="text-green-100 text-xs space-y-1 mt-1">
                  {context.green_flags.map((flag, i) => (
                    <li key={i}>• {flag}</li>
                  ))}
                </ul>
              </div>
            )}

            {context.theoretical_support && context.theoretical_support.length > 0 && (
              <div className="bg-gray-900/50 rounded p-2">
                <p className="text-gray-300 text-xs font-semibold mb-1">📚 תמיכה תיאורטית:</p>
                <ul className="text-gray-400 text-xs space-y-1">
                  {context.theoretical_support.map((sup, i) => (
                    <li key={i}>{sup}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-xl border-2 border-indigo-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Ruler className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">מדדים כמותיים - {drawingName}</h3>
                <p className="text-indigo-200 text-sm">מדידות מתקדמות + הקשר פסיכולוגי</p>
              </div>
            </div>
            
            <Button
              onClick={() => setShowPsychContext(!showPsychContext)}
              variant="outline"
              className="border-purple-600 text-purple-300 hover:bg-purple-900/30"
              size="sm"
            >
              <Brain className="w-4 h-4 ml-1" />
              {showPsychContext ? 'הסתר הקשר' : 'הצג הקשר פסיכולוגי'}
              {showPsychContext ? <ChevronUp className="w-4 h-4 mr-1" /> : <ChevronDown className="w-4 h-4 mr-1" />}
            </Button>
          </div>

          {/* Advanced Line Analysis */}
          {advanced_line_analysis && (
            <>
              {/* Pressure Analysis */}
              {advanced_line_analysis.pressure_analysis && (
                <div className="mb-6">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    ניתוח לחץ מתקדם
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`rounded-lg p-4 border ${getScoreBg(advanced_line_analysis.pressure_analysis.consistency_score)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">עקביות לחץ</span>
                        <Badge className={getScoreColor(advanced_line_analysis.pressure_analysis.consistency_score)}>
                          {advanced_line_analysis.pressure_analysis.consistency_score}/100
                        </Badge>
                      </div>
                      <Progress value={advanced_line_analysis.pressure_analysis.consistency_score} className="h-2" />
                      <p className="text-gray-400 text-xs mt-2">
                        {advanced_line_analysis.pressure_analysis.consistency_score >= 80 ? '✓ לחץ עקבי ויציב' :
                         advanced_line_analysis.pressure_analysis.consistency_score >= 60 ? '~ שינויים קלים בלחץ' :
                         '⚠️ לחץ משתנה מאוד'}
                      </p>
                    </div>

                    <div className="rounded-lg p-4 border bg-purple-900/30 border-purple-700/50">
                      <div className="text-center mb-2">
                        <Badge className="bg-purple-700 text-white text-lg px-4 py-1">
                          {advanced_line_analysis.pressure_analysis.inferred_level}
                        </Badge>
                      </div>
                      <p className="text-purple-200 text-sm text-center">רמת לחץ משוערת</p>
                      <div className="text-purple-300 text-xs mt-2 text-center">
                        {advanced_line_analysis.pressure_analysis.hotspots_detected && '⚠️ זוהו נקודות לחץ חזק'}
                      </div>
                    </div>
                  </div>
                  
                  <PsychologicalContextCard 
                    context={advanced_line_analysis.pressure_analysis.psychological_context}
                    title="הקשר פסיכולוגי - לחץ ועקביות"
                    icon={Brain}
                  />
                  
                  <div className="mt-3 bg-purple-950/50 rounded p-3 text-purple-100 text-xs">
                    ⚠️ היסק מתמונה סטטית בלבד (מבוסס כהות ורוחב קו), לא מדידה ישירה
                  </div>
                </div>
              )}

              {/* Smoothness Analysis */}
              {advanced_line_analysis.smoothness_analysis && (
                <div className="mb-6">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    ניתוח חלקות וזרימה
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className={`rounded-lg p-4 border ${getScoreBg(advanced_line_analysis.smoothness_analysis.smoothness_index)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">חלקות קו</span>
                        <Badge className={getScoreColor(advanced_line_analysis.smoothness_analysis.smoothness_index)}>
                          {advanced_line_analysis.smoothness_analysis.smoothness_index}/100
                        </Badge>
                      </div>
                      <Progress value={advanced_line_analysis.smoothness_analysis.smoothness_index} className="h-2" />
                    </div>

                    <div className={`rounded-lg p-4 border ${getScoreBg(100 - advanced_line_analysis.smoothness_analysis.shakiness_score)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">רעידות</span>
                        <Badge className={getScoreColor(100 - advanced_line_analysis.smoothness_analysis.shakiness_score)}>
                          {advanced_line_analysis.smoothness_analysis.shakiness_score}/100
                        </Badge>
                      </div>
                      <Progress value={advanced_line_analysis.smoothness_analysis.shakiness_score} className="h-2" />
                    </div>

                    <div className={`rounded-lg p-4 border ${getScoreBg(advanced_line_analysis.smoothness_analysis.continuity_score)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">רציפות</span>
                        <Badge className={getScoreColor(advanced_line_analysis.smoothness_analysis.continuity_score)}>
                          {advanced_line_analysis.smoothness_analysis.continuity_score}/100
                        </Badge>
                      </div>
                      <Progress value={advanced_line_analysis.smoothness_analysis.continuity_score} className="h-2" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 text-center">
                      <p className="text-blue-200 text-sm mb-1">איכות זרימה</p>
                      <Badge className="bg-blue-700 text-white">
                        {advanced_line_analysis.smoothness_analysis.flow_quality}
                      </Badge>
                    </div>
                    
                    <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-3 text-center">
                      <p className="text-blue-200 text-sm mb-1">תדירות רעידות</p>
                      <Badge className="bg-blue-700 text-white">
                        {advanced_line_analysis.smoothness_analysis.tremor_frequency}
                      </Badge>
                    </div>
                  </div>

                  <PsychologicalContextCard 
                    context={advanced_line_analysis.smoothness_analysis.psychological_context}
                    title="הקשר פסיכולוגי - חלקות וזרימה"
                    icon={Brain}
                  />
                </div>
              )}

              {/* Hesitation Analysis */}
              {advanced_line_analysis.hesitation_analysis && (
                <div className="mb-6">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    ניתוח היסוסים וביטחון
                  </h4>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className={`rounded-lg p-4 border ${getScoreBg(advanced_line_analysis.hesitation_analysis.confidence_index)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">ביטחון בציור</span>
                        <Badge className={getScoreColor(advanced_line_analysis.hesitation_analysis.confidence_index)}>
                          {advanced_line_analysis.hesitation_analysis.confidence_index}/100
                        </Badge>
                      </div>
                      <Progress value={advanced_line_analysis.hesitation_analysis.confidence_index} className="h-2" />
                      <p className="text-gray-400 text-xs mt-2">
                        {advanced_line_analysis.hesitation_analysis.confidence_index >= 80 ? '✓ ביטחון גבוה' :
                         advanced_line_analysis.hesitation_analysis.confidence_index >= 60 ? '~ ביטחון בינוני' :
                         '⚠️ היסוסים רבים'}
                      </p>
                    </div>

                    <div className="rounded-lg p-4 border bg-yellow-900/30 border-yellow-700/50">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {advanced_line_analysis.hesitation_analysis.hesitation_count || 0}
                          </div>
                          <div className="text-gray-400 text-xs">היסוסים</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">
                            {advanced_line_analysis.hesitation_analysis.correction_marks_count || 0}
                          </div>
                          <div className="text-gray-400 text-xs">תיקונים</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {advanced_line_analysis.hesitation_analysis.hesitation_locations && 
                   advanced_line_analysis.hesitation_analysis.hesitation_locations.length > 0 && (
                    <div className="mt-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm mb-2">מיקומי היסוס:</p>
                      <div className="flex flex-wrap gap-2">
                        {advanced_line_analysis.hesitation_analysis.hesitation_locations.map((loc, idx) => (
                          <Badge key={idx} className="bg-yellow-700 text-white text-xs">
                            {loc}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <PsychologicalContextCard 
                    context={advanced_line_analysis.hesitation_analysis.psychological_context}
                    title="הקשר פסיכולוגי - היסוסים והגנות"
                    icon={Brain}
                  />

                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {advanced_line_analysis.hesitation_analysis.line_retracing_detected && (
                      <Badge className="bg-orange-700 text-white text-xs">חזרה על קווים</Badge>
                    )}
                    {advanced_line_analysis.hesitation_analysis.erasure_attempts > 0 && (
                      <Badge className="bg-red-700 text-white text-xs">
                        {advanced_line_analysis.hesitation_analysis.erasure_attempts} מחיקות
                      </Badge>
                    )}
                    {advanced_line_analysis.hesitation_analysis.false_starts > 0 && (
                      <Badge className="bg-orange-700 text-white text-xs">
                        {advanced_line_analysis.hesitation_analysis.false_starts} התחלות שגויות
                      </Badge>
                    )}
                    <Badge className="bg-blue-700 text-white text-xs">
                      סיום: {advanced_line_analysis.hesitation_analysis.termination_quality}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Advanced Metrics */}
              {advanced_line_analysis.advanced_metrics && (
                <div className="mb-6">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                    מדדים מתקדמים נוספים
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className={`rounded-lg p-4 border ${getScoreBg(advanced_line_analysis.advanced_metrics.pen_control_score)}`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">שליטה בעט</span>
                        <Badge className={getScoreColor(advanced_line_analysis.advanced_metrics.pen_control_score)}>
                          {advanced_line_analysis.advanced_metrics.pen_control_score}/100
                        </Badge>
                      </div>
                      <Progress value={advanced_line_analysis.advanced_metrics.pen_control_score} className="h-2" />
                    </div>

                    <div className="rounded-lg p-4 border bg-cyan-900/30 border-cyan-700/50 text-center">
                      <p className="text-cyan-200 text-sm mb-1">מהירות משוערת</p>
                      <Badge className="bg-cyan-700 text-white">
                        {advanced_line_analysis.advanced_metrics.speed_inference}
                      </Badge>
                    </div>

                    {advanced_line_analysis.advanced_metrics.micro_tremor_detected && (
                      <div className="rounded-lg p-4 border bg-red-900/30 border-red-700/50">
                        <p className="text-red-200 text-sm">⚠️ רעידות מיקרו זוהו</p>
                        <p className="text-red-300 text-xs mt-1">יש לשקול בדיקה רפואית אם חוזר</p>
                      </div>
                    )}
                  </div>

                  <PsychologicalContextCard 
                    context={advanced_line_analysis.advanced_metrics.psychological_context}
                    title="הקשר פסיכולוגי - מהירות ושליטה"
                    icon={Brain}
                  />
                </div>
              )}
            </>
          )}

          {/* Size and Position with Psychological Context */}
          {size_and_position && (
            <div className="mb-6">
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Layers className="w-5 h-5 text-pink-400" />
                גודל, מיקום וסמליות
              </h4>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`rounded-lg p-4 border ${getScoreBg(size_and_position.occupancy_percentage)}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">תפוסת דף</span>
                    <Badge className={getScoreColor(size_and_position.occupancy_percentage)}>
                      {size_and_position.occupancy_percentage}%
                    </Badge>
                  </div>
                  <Progress value={size_and_position.occupancy_percentage} className="h-2" />
                  {size_and_position.occupancy_percentage < 40 && (
                    <p className="text-orange-300 text-xs mt-2">⚠️ קטן מדי (OR=3.02-5.71)</p>
                  )}
                </div>

                <div className="rounded-lg p-4 border bg-pink-900/30 border-pink-700/50">
                  <p className="text-pink-200 text-sm mb-2">מיקום בדף:</p>
                  <div className="flex gap-2 justify-center">
                    <Badge className="bg-pink-700 text-white">
                      {size_and_position.horizontal_position}
                    </Badge>
                    <Badge className="bg-pink-700 text-white">
                      {size_and_position.vertical_position}
                    </Badge>
                  </div>
                </div>
              </div>

              <PsychologicalContextCard 
                context={size_and_position.psychological_context}
                title="הקשר ארכיטיפלי - גודל ומיקום"
                icon={Brain}
              />
            </div>
          )}

          {/* Elements with Psychological Context */}
          {elements && (
            <div className="mb-6">
              <h4 className="text-white font-bold mb-3">🔍 אלמנטים ספציפיים + משמעות</h4>
              
              {elements.house && (
                <div className="mb-4 bg-indigo-900/30 border border-indigo-700/30 rounded-lg p-4">
                  <h5 className="text-indigo-200 font-bold mb-3">🏠 בית</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    <Badge className={elements.house.has_door ? "bg-green-700" : "bg-red-700"}>
                      {elements.house.has_door ? "✓" : "✗"} דלת {!elements.house.has_door && "(OR=4.52)"}
                    </Badge>
                    <Badge className={elements.house.has_windows ? "bg-green-700" : "bg-red-700"}>
                      {elements.house.has_windows ? "✓" : "✗"} חלונות {!elements.house.has_windows && "(OR=3.09)"}
                    </Badge>
                    {elements.house.number_of_windows > 0 && (
                      <Badge className="bg-blue-700">{elements.house.number_of_windows} חלונות</Badge>
                    )}
                  </div>
                  <PsychologicalContextCard 
                    context={elements.house.psychological_context}
                    title="פרשנות פסיכולוגית - הבית"
                    icon={Eye}
                  />
                </div>
              )}

              {elements.tree && (
                <div className="mb-4 bg-green-900/30 border border-green-700/30 rounded-lg p-4">
                  <h5 className="text-green-200 font-bold mb-3">🌳 עץ</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    <Badge className={elements.tree.has_roots ? "bg-green-700" : "bg-orange-700"}>
                      {elements.tree.has_roots ? "✓ שורשים (OR=4.35)" : "✗ אין שורשים"}
                    </Badge>
                    {elements.tree.has_damage_scars && (
                      <Badge className="bg-red-700">⚠️ צלקות/פגיעות</Badge>
                    )}
                    {elements.tree.crown_to_trunk_ratio && (
                      <Badge className="bg-green-700">יחס צמרת:גזע {elements.tree.crown_to_trunk_ratio.toFixed(2)}</Badge>
                    )}
                  </div>
                  <PsychologicalContextCard 
                    context={elements.tree.psychological_context}
                    title="פרשנות פסיכולוגית - העץ"
                    icon={Eye}
                  />
                </div>
              )}

              {elements.person && (
                <div className="mb-4 bg-purple-900/30 border border-purple-700/30 rounded-lg p-4">
                  <h5 className="text-purple-200 font-bold mb-3">👤 אדם</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                    <Badge className={elements.person.has_face_features ? "bg-green-700" : "bg-red-700"}>
                      {elements.person.has_face_features ? "✓" : "✗"} פנים {!elements.person.has_face_features && "(OR=2.71)"}
                    </Badge>
                    <Badge className={elements.person.has_arms ? "bg-green-700" : "bg-red-700"}>
                      {elements.person.has_arms ? "✓" : "✗"} ידיים {!elements.person.has_arms && "(OR=1.82)"}
                    </Badge>
                    {elements.person.head_to_body_ratio && (
                      <Badge className={elements.person.head_to_body_ratio < 4 || elements.person.head_to_body_ratio > 9 ? "bg-orange-700" : "bg-green-700"}>
                        יחס ראש:גוף 1:{elements.person.head_to_body_ratio.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                  <PsychologicalContextCard 
                    context={elements.person.psychological_context}
                    title="פרשנות פסיכולוגית - האדם"
                    icon={Eye}
                  />
                </div>
              )}

              {elements.person_action && (
                <div className="bg-cyan-900/30 border border-cyan-700/30 rounded-lg p-4">
                  <h5 className="text-cyan-200 font-bold mb-3">🏃 אדם בתנועה</h5>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Badge className={elements.person_action.has_visible_action ? "bg-green-700" : "bg-red-700"}>
                      {elements.person_action.has_visible_action ? "✓ תנועה נראית" : "✗ אין תנועה (OR=2.96)"}
                    </Badge>
                    {elements.person_action.action_type && (
                      <Badge className="bg-cyan-700">סוג: {elements.person_action.action_type}</Badge>
                    )}
                  </div>
                  <PsychologicalContextCard 
                    context={elements.person_action.psychological_context}
                    title="פרשנות פסיכולוגית - תנועה וסוכנות"
                    icon={Eye}
                  />
                </div>
              )}
            </div>
          )}

          {/* NEW: Psychological Indicators Section */}
          {psychological_indicators && psychological_indicators.length > 0 && (
            <div className="mb-6">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-400" />
                אינדיקטורים פסיכולוגיים - קישור ישיר למדדים כמותיים
              </h4>
              <div className="space-y-4">
                {psychological_indicators.map((indicator, idx) => {
                  const categoryColors = {
                    ego_strength: "purple",
                    attachment: "blue",
                    anxiety: "orange",
                    depression: "red",
                    self_esteem: "green",
                    aggression: "red",
                    trauma: "red",
                    defense_mechanisms: "amber",
                    interpersonal: "cyan"
                  };
                  
                  const color = categoryColors[indicator.category] || "gray";
                  
                  return (
                    <Card key={idx} className={`bg-${color}-900/40 border-${color}-700/50`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className={`text-${color}-200 font-bold text-lg mb-1`}>
                              {indicator.indicator_name}
                            </h5>
                            <Badge className={`bg-${color}-700 text-white`}>
                              {indicator.category}
                            </Badge>
                          </div>
                          <Badge className="bg-white/20 text-white">
                            ביטחון: {Math.round((indicator.confidence || 0.9) * 100)}%
                          </Badge>
                        </div>

                        <div className="bg-gray-900/50 rounded p-3 mb-3">
                          <p className="text-gray-300 text-xs font-semibold mb-2">📊 ראיות כמותיות:</p>
                          <ul className="space-y-1">
                            {indicator.quantitative_evidence.map((ev, i) => (
                              <li key={i} className="text-gray-200 text-xs">• {ev}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="mb-3">
                          <p className={`text-${color}-300 text-sm font-semibold mb-1`}>הערכה:</p>
                          <p className={`text-${color}-100 text-sm`}>{indicator.assessment}</p>
                        </div>

                        <div className="bg-indigo-900/30 rounded p-3 mb-3">
                          <p className="text-indigo-300 text-xs font-semibold mb-1">📚 בסיס תיאורטי:</p>
                          <p className="text-indigo-100 text-xs leading-relaxed">{indicator.theoretical_basis}</p>
                        </div>

                        {indicator.OR_value && indicator.OR_value !== "N/A" && (
                          <Badge className="bg-yellow-700 text-white mb-3">
                            OR Value: {indicator.OR_value}
                          </Badge>
                        )}

                        <div className="bg-blue-900/30 rounded p-3">
                          <p className="text-blue-300 text-xs font-semibold mb-1">💡 משמעות קלינית:</p>
                          <p className="text-blue-100 text-xs leading-relaxed">{indicator.clinical_significance}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* NEW: Theoretical Cross-Validation Section */}
          {theoretical_cross_validation && (
            <div className="mb-6">
              <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-yellow-400" />
                אימות תיאורטי צולב (Cross-Validation)
              </h4>
              
              <div className="space-y-4">
                {/* Jungian */}
                {theoretical_cross_validation.jungian_consistency && (
                  <Card className="bg-violet-900/40 border-violet-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-violet-200 font-bold">🎭 עקביות יונגיאנית</h5>
                        <Badge className={`${theoretical_cross_validation.jungian_consistency.score >= 0.9 ? 'bg-green-700' : theoretical_cross_validation.jungian_consistency.score >= 0.75 ? 'bg-yellow-700' : 'bg-orange-700'} text-white`}>
                          {Math.round(theoretical_cross_validation.jungian_consistency.score * 100)}%
                        </Badge>
                      </div>
                      <p className="text-violet-100 text-sm mb-3 leading-relaxed">
                        {theoretical_cross_validation.jungian_consistency.notes}
                      </p>
                      {theoretical_cross_validation.jungian_consistency.discrepancies.length > 0 && (
                        <div className="bg-orange-900/30 rounded p-2">
                          <p className="text-orange-300 text-xs font-semibold mb-1">⚠️ אי-התאמות:</p>
                          <ul className="space-y-1">
                            {theoretical_cross_validation.jungian_consistency.discrepancies.map((disc, i) => (
                              <li key={i} className="text-orange-100 text-xs">• {disc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Freudian */}
                {theoretical_cross_validation.freudian_consistency && (
                  <Card className="bg-amber-900/40 border-amber-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-amber-200 font-bold">🛡️ עקביות פרוידיאנית</h5>
                        <Badge className={`${theoretical_cross_validation.freudian_consistency.score >= 0.9 ? 'bg-green-700' : theoretical_cross_validation.freudian_consistency.score >= 0.75 ? 'bg-yellow-700' : 'bg-orange-700'} text-white`}>
                          {Math.round(theoretical_cross_validation.freudian_consistency.score * 100)}%
                        </Badge>
                      </div>
                      <p className="text-amber-100 text-sm mb-3 leading-relaxed">
                        {theoretical_cross_validation.freudian_consistency.notes}
                      </p>
                      {theoretical_cross_validation.freudian_consistency.discrepancies.length > 0 && (
                        <div className="bg-orange-900/30 rounded p-2">
                          <p className="text-orange-300 text-xs font-semibold mb-1">⚠️ אי-התאמות:</p>
                          <ul className="space-y-1">
                            {theoretical_cross_validation.freudian_consistency.discrepancies.map((disc, i) => (
                              <li key={i} className="text-orange-100 text-xs">• {disc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Attachment */}
                {theoretical_cross_validation.attachment_consistency && (
                  <Card className="bg-blue-900/40 border-blue-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-blue-200 font-bold">🤝 עקביות תיאורית ההתקשרות</h5>
                        <Badge className={`${theoretical_cross_validation.attachment_consistency.score >= 0.9 ? 'bg-green-700' : theoretical_cross_validation.attachment_consistency.score >= 0.75 ? 'bg-yellow-700' : 'bg-orange-700'} text-white`}>
                          {Math.round(theoretical_cross_validation.attachment_consistency.score * 100)}%
                        </Badge>
                      </div>
                      <p className="text-blue-100 text-sm mb-3 leading-relaxed">
                        {theoretical_cross_validation.attachment_consistency.notes}
                      </p>
                      {theoretical_cross_validation.attachment_consistency.discrepancies.length > 0 && (
                        <div className="bg-orange-900/30 rounded p-2">
                          <p className="text-orange-300 text-xs font-semibold mb-1">⚠️ אי-התאמות:</p>
                          <ul className="space-y-1">
                            {theoretical_cross_validation.attachment_consistency.discrepancies.map((disc, i) => (
                              <li key={i} className="text-orange-100 text-xs">• {disc}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Chen 2023 Indicators */}
                {theoretical_cross_validation.chen_2023_indicators && (
                  <Card className="bg-red-900/40 border-red-700/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-red-200 font-bold">📊 Chen et al. (2023) - 39 אינדיקטורים</h5>
                        <Badge className={`${
                          theoretical_cross_validation.chen_2023_indicators.overall_risk_level === 'minimal' || theoretical_cross_validation.chen_2023_indicators.overall_risk_level === 'low' ? 'bg-green-700' :
                          theoretical_cross_validation.chen_2023_indicators.overall_risk_level === 'moderate' ? 'bg-yellow-700' :
                          'bg-red-700'
                        } text-white`}>
                          {theoretical_cross_validation.chen_2023_indicators.overall_risk_level}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="bg-gray-900/50 rounded p-2 text-center">
                          <div className="text-xl font-bold text-white">
                            {theoretical_cross_validation.chen_2023_indicators.total_OR_indicators_detected}
                          </div>
                          <div className="text-gray-400 text-xs">זוהו</div>
                        </div>
                        <div className="bg-red-900/30 rounded p-2 text-center">
                          <div className="text-xl font-bold text-red-300">
                            {theoretical_cross_validation.chen_2023_indicators.high_risk_indicators?.length || 0}
                          </div>
                          <div className="text-red-400 text-xs">סיכון גבוה</div>
                        </div>
                        <div className="bg-green-900/30 rounded p-2 text-center">
                          <div className="text-xl font-bold text-green-300">
                            {theoretical_cross_validation.chen_2023_indicators.protective_indicators?.length || 0}
                          </div>
                          <div className="text-green-400 text-xs">מגן</div>
                        </div>
                      </div>

                      {theoretical_cross_validation.chen_2023_indicators.high_risk_indicators && theoretical_cross_validation.chen_2023_indicators.high_risk_indicators.length > 0 && (
                        <div className="bg-red-950/50 rounded p-3 mb-3">
                          <p className="text-red-300 text-xs font-semibold mb-2">🔴 אינדיקטורי סיכון גבוה:</p>
                          <ul className="space-y-1">
                            {theoretical_cross_validation.chen_2023_indicators.high_risk_indicators.map((ind, i) => (
                              <li key={i} className="text-red-100 text-xs">• {ind}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <p className="text-red-100 text-sm leading-relaxed">
                        {theoretical_cross_validation.chen_2023_indicators.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Overall Alignment */}
                <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-700/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-white font-bold">🎯 התאמה תיאורטית כוללת</h5>
                      <Badge className={`${theoretical_cross_validation.overall_theoretical_alignment >= 0.9 ? 'bg-green-700' : theoretical_cross_validation.overall_theoretical_alignment >= 0.75 ? 'bg-yellow-700' : 'bg-orange-700'} text-white text-lg px-4 py-1`}>
                        {Math.round(theoretical_cross_validation.overall_theoretical_alignment * 100)}%
                      </Badge>
                    </div>
                    
                    {theoretical_cross_validation.major_discrepancies && theoretical_cross_validation.major_discrepancies.length > 0 && (
                      <div className="bg-red-950/50 rounded p-3 mb-3 border border-red-700">
                        <p className="text-red-300 text-sm font-semibold mb-2">⚠️ אי-התאמות משמעותיות לבדיקה:</p>
                        <ul className="space-y-2">
                          {theoretical_cross_validation.major_discrepancies.map((disc, i) => (
                            <li key={i} className="text-red-100 text-sm">🔍 {disc}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="bg-purple-950/50 rounded p-3">
                      <p className="text-purple-300 text-sm font-semibold mb-1">ביטחון בפרשנות:</p>
                      <div className="flex items-center gap-3">
                        <Progress value={Math.round(theoretical_cross_validation.confidence_in_interpretation * 100)} className="flex-1" />
                        <span className="text-white font-bold">
                          {Math.round(theoretical_cross_validation.confidence_in_interpretation * 100)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="mt-6 bg-indigo-900/20 border border-indigo-700/30 rounded-lg p-4">
            <p className="text-indigo-200 text-sm flex items-start gap-2">
              <Eye className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                המדדים הכמותיים והפרשנויות הפסיכולוגיות המשולבות מספקים תמונה הוליסטית ומבוססת מדעית. כל פרשנות מגובה במדדים כמותיים, אינדיקטורים עם OR values, ותיאוריות פסיכולוגיות מבוססות. האימות הצולב מבטיח עקביות בין הגישות התיאורטיות השונות.
              </span>
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}