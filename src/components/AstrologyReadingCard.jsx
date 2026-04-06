
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Stars, Calendar, Heart, Briefcase, HelpCircle, TrendingUp,
  ChevronDown, ChevronUp, Sparkles, Clock, Target, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BirthChart from "@/components/BirthChart";

/**
 * ASTROLOGY READING CARD
 * כרטיס המציג קריאה אסטרולוגית בודדת עם מפת לידה אינטראקטיבית
 */

const READING_TYPE_CONFIG = {
  natal_chart: {
    icon: Stars,
    label: "מפת לידה",
    color: "from-purple-600 to-indigo-600",
    emoji: "✨"
  },
  monthly_forecast: {
    icon: Calendar,
    label: "תחזית חודשית",
    color: "from-blue-600 to-cyan-600",
    emoji: "📅"
  },
  yearly_forecast: {
    icon: TrendingUp,
    label: "תחזית שנתית",
    color: "from-green-600 to-emerald-600",
    emoji: "📈"
  },
  transit_report: {
    icon: TrendingUp,
    label: "דוח מעברים",
    color: "from-teal-600 to-cyan-600",
    emoji: "🌊"
  },
  compatibility: {
    icon: Users,
    label: "התאמה זוגית",
    color: "from-pink-600 to-rose-600",
    emoji: "💕"
  },
  relationship_dynamics: {
    icon: Heart,
    label: "דינמיקות יחסים",
    color: "from-rose-600 to-pink-600",
    emoji: "💖"
  },
  career_potential: {
    icon: Briefcase,
    label: "פוטנציאל מקצועי",
    color: "from-amber-600 to-orange-600",
    emoji: "💼"
  },
  specific_question: {
    icon: HelpCircle,
    label: "שאלה ספציפית",
    color: "from-violet-600 to-purple-600",
    emoji: "❓"
  }
};

export default function AstrologyReadingCard({ reading, astrologyData, onViewFull, compact = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const sectionRefs = useRef({});

  if (!reading) return null;

  const config = READING_TYPE_CONFIG[reading.reading_type] || READING_TYPE_CONFIG.natal_chart;
  const Icon = config.icon;

  // Handle element click from birth chart
  const handleChartElementClick = (elementType, elementData) => {
    let sectionId = '';
    
    switch (elementType) {
      case 'planet':
        const planetName = elementData.name.toLowerCase();
        if (planetName === 'sun') sectionId = 'sun_interpretation';
        else if (planetName === 'moon') sectionId = 'moon_interpretation';
        else if (planetName === 'mercury') sectionId = 'mercury_interpretation';
        else if (planetName === 'venus') sectionId = 'venus_interpretation';
        else if (planetName === 'mars') sectionId = 'mars_interpretation';
        break;
      case 'ascendant':
        sectionId = 'ascendant_interpretation';
        break;
      case 'aspect':
        sectionId = 'aspects_interpretation';
        break;
      case 'house':
        sectionId = `house_${elementData.number}`;
        break;
    }

    if (sectionId) {
      if (!isExpanded) {
        setIsExpanded(true);
        setTimeout(() => {
          sectionRefs.current[sectionId]?.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
          setActiveSection(sectionId);
        }, 300);
      } else {
        sectionRefs.current[sectionId]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
        setActiveSection(sectionId);
      }
      
      // Remove highlight after 3 seconds
      setTimeout(() => setActiveSection(null), 3000);
    }
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.02 }}
        className="cursor-pointer"
        onClick={onViewFull}
      >
        <Card className={`bg-gradient-to-br ${config.color} border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{config.emoji}</div>
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-sm line-clamp-1">{reading.title}</h3>
                <p className="text-white/80 text-xs line-clamp-1">{reading.summary}</p>
              </div>
              <Badge className="bg-white/20 text-white text-xs shrink-0">
                {config.label}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const interpretation = reading.full_interpretation || {};
  const showBirthChart = reading.reading_type === 'natal_chart' && astrologyData;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-indigo-900/60 to-purple-900/60 backdrop-blur-xl border-2 border-indigo-600/50 shadow-2xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className={`w-16 h-16 bg-gradient-to-br ${config.color} rounded-2xl flex items-center justify-center shadow-xl shrink-0`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className="bg-indigo-600 text-white">{config.label}</Badge>
                  {reading.confidence_score && (
                    <Badge className="bg-green-600 text-white text-xs">
                      דיוק: {reading.confidence_score}%
                    </Badge>
                  )}
                  {reading.reading_type === 'compatibility' && interpretation.overall_compatibility_score && (
                    <Badge className="bg-pink-600 text-white text-xs">
                      התאמה: {interpretation.overall_compatibility_score}%
                    </Badge>
                  )}
                  {reading.reading_type === 'compatibility' && interpretation.relationship_archetype && (
                    <Badge className="bg-purple-600 text-white text-xs">
                      {getArchetypeEmoji(interpretation.relationship_archetype)} {getArchetypeHebrew(interpretation.relationship_archetype)}
                    </Badge>
                  )}
                  {reading.ai_metadata?.enhanced && (
                    <Badge className="bg-yellow-600 text-white text-xs">
                      ✨ ניתוח מתקדם
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-white text-2xl mb-2">{reading.title}</CardTitle>
                {reading.summary && (
                  <p className="text-indigo-200 text-sm leading-relaxed">{reading.summary}</p>
                )}
              </div>
            </div>
            <div className="text-center bg-white/10 rounded-lg p-3 shrink-0">
              <Calendar className="w-6 h-6 text-white mx-auto mb-1" />
              <p className="text-white text-xs">
                {new Date(reading.generated_date).toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Interactive Birth Chart for Natal Charts */}
          {showBirthChart && (
            <>
              <BirthChart 
                astrologyData={astrologyData}
                onElementClick={handleChartElementClick}
                showTooltips={true}
              />
              
              {/* Quick Tips */}
              <div className="bg-gradient-to-r from-purple-800/30 to-pink-800/30 rounded-lg p-4 border border-purple-600/30">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-yellow-400 shrink-0" />
                  <div>
                    <h4 className="text-white font-bold mb-2">💡 המפה שלך חיה!</h4>
                    <p className="text-purple-100 text-sm leading-relaxed">
                      לחץ על כל כוכב, אספקט או בית במפה כדי לקבל <strong>ניתוח AI מיידי</strong> המותאם אישית למפה שלך. 
                      כל לחיצה תיתן לך הסבר מפורט, תובנות אישיות, ועצות מעשיות - ותקשר אותך לקריאות הרלוונטיות!
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Overview */}
          {(interpretation.overview || interpretation.yearly_overview || interpretation.period_overview) && (
            <div className="bg-indigo-900/30 rounded-lg p-4 border border-indigo-600/30">
              <h4 className="text-indigo-200 font-bold mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                סקירה כללית:
              </h4>
              <p className="text-white leading-relaxed whitespace-pre-line">
                {interpretation.overview || interpretation.yearly_overview || interpretation.period_overview}
              </p>
            </div>
          )}

          {/* Compatibility Score Visual */}
          {reading.reading_type === 'compatibility' && interpretation.overall_compatibility_score && (
            <div className="bg-pink-900/30 rounded-lg p-6 border border-pink-600/30">
              <div className="text-center mb-4">
                <h4 className="text-pink-200 font-bold text-lg mb-2">ציון התאמה כללי</h4>
                <div className="text-6xl font-bold text-white mb-2">
                  {interpretation.overall_compatibility_score}%
                </div>
                <Progress value={interpretation.overall_compatibility_score} className="h-3" />
              </div>
              {interpretation.relationship_archetype && (
                <div className="text-center bg-pink-800/30 rounded-lg p-3 mt-4">
                  <p className="text-pink-100 font-semibold text-sm">ארכיטיפ היחסים:</p>
                  <p className="text-white text-lg">
                    {getArchetypeEmoji(interpretation.relationship_archetype)} {getArchetypeHebrew(interpretation.relationship_archetype)}
                  </p>
                </div>
              )}
              {interpretation.attraction_factors && (
                <p className="text-pink-100 text-sm text-center mt-4">
                  {interpretation.attraction_factors}
                </p>
              )}
            </div>
          )}

          {/* Key Themes */}
          {reading.key_themes && reading.key_themes.length > 0 && (
            <div>
              <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-400" />
                תמות מרכזיות:
              </h4>
              <div className="flex flex-wrap gap-2">
                {reading.key_themes.map((theme, idx) => (
                  <Badge key={idx} className="bg-purple-700 text-white">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Advice */}
          {reading.actionable_advice && reading.actionable_advice.length > 0 && (
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-600/30">
              <h4 className="text-green-200 font-bold mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                עצות מעשיות:
              </h4>
              <ul className="space-y-2">
                {reading.actionable_advice.slice(0, isExpanded ? undefined : 3).map((advice, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-green-100">
                    <span className="text-green-400 shrink-0 mt-1">✓</span>
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
              {reading.actionable_advice.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-green-300 hover:text-green-100 mt-2"
                >
                  {isExpanded ? (
                    <>הצג פחות <ChevronUp className="w-4 h-4 mr-1" /></>
                  ) : (
                    <>הצג עוד ({reading.actionable_advice.length - 3}) <ChevronDown className="w-4 h-4 mr-1" /></>
                  )}
                </Button>
              )}
            </div>
          )}

          {/* Detailed Sections (type-specific) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Natal Chart Sections */}
                {reading.reading_type === 'natal_chart' && (
                  <>
                    {interpretation.sun_interpretation && (
                      <div 
                        ref={el => sectionRefs.current['sun_interpretation'] = el}
                        className={activeSection === 'sun_interpretation' ? 'section-highlight' : ''}
                      >
                        <DetailSection
                          title={interpretation.sun_interpretation.title || "מזל השמש"}
                          content={interpretation.sun_interpretation.content}
                          icon="☀️"
                          color="from-yellow-600 to-orange-600"
                          extraContent={
                            <>
                              {interpretation.sun_interpretation.strengths && (
                                <div className="mt-3">
                                  <p className="text-white font-semibold mb-2">💪 חוזקות:</p>
                                  <ul className="list-disc list-inside text-white/90 space-y-1">
                                    {interpretation.sun_interpretation.strengths.map((s, i) => (
                                      <li key={i}>{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {interpretation.sun_interpretation.challenges && (
                                <div className="mt-3">
                                  <p className="text-white font-semibold mb-2">⚠️ אתגרים:</p>
                                  <ul className="list-disc list-inside text-white/90 space-y-1">
                                    {interpretation.sun_interpretation.challenges.map((c, i) => (
                                      <li key={i}>{c}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          }
                        />
                      </div>
                    )}
                    {interpretation.moon_interpretation && (
                      <div 
                        ref={el => sectionRefs.current['moon_interpretation'] = el}
                        className={activeSection === 'moon_interpretation' ? 'section-highlight' : ''}
                      >
                        <DetailSection
                          title={interpretation.moon_interpretation.title || "מזל הירח"}
                          content={interpretation.moon_interpretation.content}
                          icon="🌙"
                          color="from-blue-600 to-indigo-600"
                          extraContent={
                            <>
                              {interpretation.moon_interpretation.emotional_needs && (
                                <div className="mt-3">
                                  <p className="text-white font-semibold mb-2">💖 צרכים רגשיים:</p>
                                  <ul className="list-disc list-inside text-white/90 space-y-1">
                                    {interpretation.moon_interpretation.emotional_needs.map((n, i) => (
                                      <li key={i}>{n}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {interpretation.moon_interpretation.self_care && (
                                <div className="mt-3">
                                  <p className="text-white font-semibold mb-2">🛁 טיפול עצמי:</p>
                                  <ul className="list-disc list-inside text-white/90 space-y-1">
                                    {interpretation.moon_interpretation.self_care.map((c, i) => (
                                      <li key={i}>{c}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </>
                          }
                        />
                      </div>
                    )}
                    {interpretation.ascendant_interpretation && (
                      <div 
                        ref={el => sectionRefs.current['ascendant_interpretation'] = el}
                        className={activeSection === 'ascendant_interpretation' ? 'section-highlight' : ''}
                      >
                        <DetailSection
                          title={interpretation.ascendant_interpretation.title || "הצועד"}
                          content={interpretation.ascendant_interpretation.content}
                          icon="⬆️"
                          color="from-purple-600 to-pink-600"
                        />
                      </div>
                    )}

                    {interpretation.personal_planets && interpretation.personal_planets.map((planet, idx) => (
                      <div 
                        key={idx} 
                        ref={el => sectionRefs.current[`${planet.planet.toLowerCase()}_interpretation`] = el}
                        className={activeSection === `${planet.planet.toLowerCase()}_interpretation` ? 'section-highlight' : ''}
                      >
                        <DetailSection
                          title={planet.planet}
                          content={planet.interpretation}
                          icon={planet.planet === 'Mercury' ? '☿' : planet.planet === 'Venus' ? '♀' : '♂'}
                          color="from-indigo-600 to-purple-600"
                        />
                      </div>
                    ))}

                    {interpretation.key_themes && interpretation.key_themes.map((theme, idx) => (
                      <div key={idx} className="bg-purple-900/30 rounded-lg p-4 border border-purple-600/30">
                        <h5 className="text-purple-200 font-bold mb-2 text-lg">✨ {theme.theme}</h5>
                        <p className="text-purple-100 mb-3">{theme.description}</p>
                        {theme.how_to_work_with && (
                          <div className="bg-purple-800/30 rounded p-3">
                            <p className="text-purple-200 font-semibold text-sm mb-1">איך לעבוד עם זה:</p>
                            <p className="text-purple-100 text-sm">{theme.how_to_work_with}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}

                {/* Enhanced Yearly Forecast Sections */}
                {reading.reading_type === 'yearly_forecast' && (
                  <>
                    {/* Year Theme & Energy */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {interpretation.year_theme && (
                        <div className="bg-green-900/30 rounded-lg p-4 border border-green-600/30 text-center">
                          <h4 className="text-green-200 font-bold text-xl mb-2">🎯 נושא השנה</h4>
                          <p className="text-green-100 text-lg">{interpretation.year_theme}</p>
                        </div>
                      )}
                      {interpretation.energy_tone && (
                        <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-600/30 text-center">
                          <h4 className="text-purple-200 font-bold text-xl mb-2">⚡ טון אנרגטי</h4>
                          <p className="text-purple-100 text-lg capitalize">{interpretation.energy_tone}</p>
                        </div>
                      )}
                    </div>

                    {/* Turning Points */}
                    {interpretation.turning_points && (
                      <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-600/30">
                        <h4 className="text-amber-200 font-bold text-xl mb-3">🔄 נקודות מפנה משמעותיות:</h4>
                        <div className="space-y-3">
                          {interpretation.turning_points.map((point, idx) => (
                            <div key={idx} className="bg-amber-800/30 rounded p-3">
                              <p className="text-amber-100 font-bold">{point.month}</p>
                              <p className="text-amber-200 text-sm">{point.description}</p>
                              <p className="text-amber-300 text-xs mt-1">💫 {point.significance}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quarterly Forecast - Enhanced */}
                    {interpretation.quarterly_forecast && (
                      <div className="space-y-4">
                        <h4 className="text-white font-bold text-2xl">📅 תחזית מפורטת לפי רבעונים:</h4>
                        {interpretation.quarterly_forecast.map((quarter, idx) => (
                          <div key={idx} className="bg-emerald-900/30 rounded-lg p-5 border-2 border-emerald-600/40">
                            <h5 className="text-emerald-200 font-bold text-xl mb-3">
                              {quarter.quarter} ({quarter.months})
                            </h5>
                            <p className="text-emerald-100 mb-4 leading-relaxed">{quarter.energy}</p>
                            
                            {/* Major Transits for Quarter */}
                            {quarter.major_transits && quarter.major_transits.length > 0 && (
                              <div className="bg-emerald-800/30 rounded-lg p-3 mb-3">
                                <p className="text-emerald-300 font-semibold text-sm mb-2">🌊 מעברים מרכזיים:</p>
                                {quarter.major_transits.map((transit, i) => (
                                  <div key={i} className="text-xs text-emerald-100 mb-2">
                                    <span className="font-semibold">{transit.transit}</span> ({transit.dates})
                                    <p className="text-emerald-200 mt-1">{transit.impact}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="grid md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-emerald-300 font-semibold text-sm mb-2">✨ הזדמנויות:</p>
                                <ul className="list-disc list-inside text-emerald-100 text-sm space-y-1">
                                  {quarter.opportunities?.map((opp, i) => <li key={i}>{opp}</li>)}
                                </ul>
                              </div>
                              <div>
                                <p className="text-amber-300 font-semibold text-sm mb-2">⚠️ אתגרים:</p>
                                <ul className="list-disc list-inside text-amber-100 text-sm space-y-1">
                                  {quarter.challenges?.map((ch, i) => <li key={i}>{ch}</li>)}
                                </ul>
                              </div>
                            </div>
                            
                            {quarter.advice && (
                              <div className="mt-3 bg-emerald-700/30 rounded p-3">
                                <p className="text-emerald-100 text-sm">💡 {quarter.advice}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Life Areas - Enhanced with Quarterly Breakdown */}
                    {interpretation.life_areas && (
                      <div className="space-y-4">
                        <h4 className="text-white font-bold text-2xl">🎯 תחומי חיים - ניתוח מעמיק:</h4>
                        
                        {/* Career */}
                        {interpretation.life_areas.career && (
                          <div className="bg-amber-900/30 rounded-lg p-5 border-2 border-amber-600/40">
                            <h5 className="text-amber-200 font-bold text-xl mb-3">💼 קריירה ופרנסה</h5>
                            <p className="text-amber-100 mb-4 leading-relaxed">{interpretation.life_areas.career.overview}</p>
                            
                            {interpretation.life_areas.career.quarterly_breakdown && (
                              <div className="grid md:grid-cols-2 gap-3 mb-3">
                                {Object.entries(interpretation.life_areas.career.quarterly_breakdown).map(([q, content]) => (
                                  <div key={q} className="bg-amber-800/30 rounded p-3">
                                    <p className="text-amber-200 font-semibold text-xs mb-1">
                                      {q === 'q1' && 'רבעון 1 (ינואר-מרץ)'}
                                      {q === 'q2' && 'רבעון 2 (אפריל-יוני)'}
                                      {q === 'q3' && 'רבעון 3 (יולי-ספטמבר)'}
                                      {q === 'q4' && 'רבעון 4 (אוקטובר-דצמבר)'}
                                    </p>
                                    <p className="text-amber-100 text-xs">{content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            {interpretation.life_areas.career.best_timing && (
                              <div className="bg-green-800/30 rounded p-3">
                                <p className="text-green-200 font-semibold text-sm">🚀 התזמון הטוב ביותר:</p>
                                <p className="text-green-100 text-sm">{interpretation.life_areas.career.best_timing}</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Relationships */}
                        {interpretation.life_areas.relationships && (
                          <div className="bg-pink-900/30 rounded-lg p-5 border-2 border-pink-600/40">
                            <h5 className="text-pink-200 font-bold text-xl mb-3">💕 יחסים ואהבה</h5>
                            <p className="text-pink-100 mb-4 leading-relaxed">{interpretation.life_areas.relationships.overview}</p>
                            
                            {interpretation.life_areas.relationships.quarterly_breakdown && (
                              <div className="grid md:grid-cols-2 gap-3 mb-3">
                                {Object.entries(interpretation.life_areas.relationships.quarterly_breakdown).map(([q, content]) => (
                                  <div key={q} className="bg-pink-800/30 rounded p-3">
                                    <p className="text-pink-200 font-semibold text-xs mb-1">
                                      {q === 'q1' && 'רבעון 1'}
                                      {q === 'q2' && 'רבעון 2'}
                                      {q === 'q3' && 'רבעון 3'}
                                      {q === 'q4' && 'רבעון 4'}
                                    </p>
                                    <p className="text-pink-100 text-xs">{content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="grid md:grid-cols-2 gap-3">
                              {interpretation.life_areas.relationships.single_advice && (
                                <div className="bg-pink-700/30 rounded p-3">
                                  <p className="text-pink-200 font-semibold text-sm">💘 לרווקים:</p>
                                  <p className="text-pink-100 text-xs">{interpretation.life_areas.relationships.single_advice}</p>
                                </div>
                              )}
                              {interpretation.life_areas.relationships.coupled_advice && (
                                <div className="bg-pink-700/30 rounded p-3">
                                  <p className="text-pink-200 font-semibold text-sm">💑 לזוגות:</p>
                                  <p className="text-pink-100 text-xs">{interpretation.life_areas.relationships.coupled_advice}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Health & Wellbeing */}
                        {interpretation.life_areas.health && (
                          <div className="bg-blue-900/30 rounded-lg p-5 border-2 border-blue-600/40">
                            <h5 className="text-blue-200 font-bold text-xl mb-3">💪 בריאות וחיוניות</h5>
                            <p className="text-blue-100 mb-4 leading-relaxed">{interpretation.life_areas.health.overview}</p>
                            
                            {interpretation.life_areas.health.quarterly_breakdown && (
                              <div className="grid md:grid-cols-2 gap-3">
                                {Object.entries(interpretation.life_areas.health.quarterly_breakdown).map(([q, content]) => (
                                  <div key={q} className="bg-blue-800/30 rounded p-3">
                                    <p className="text-blue-200 font-semibold text-xs mb-1">
                                      {q === 'q1' && 'רבעון 1'}
                                      {q === 'q2' && 'רבעון 2'}
                                      {q === 'q3' && 'רבעון 3'}
                                      {q === 'q4' && 'רבעון 4'}
                                    </p>
                                    <p className="text-blue-100 text-xs">{content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Personal Growth */}
                        {interpretation.life_areas.personal_growth && (
                          <div className="bg-purple-900/30 rounded-lg p-5 border-2 border-purple-600/40">
                            <h5 className="text-purple-200 font-bold text-xl mb-3">🌱 צמיחה אישית ורוחניות</h5>
                            <p className="text-purple-100 mb-4 leading-relaxed">{interpretation.life_areas.personal_growth.overview}</p>
                            
                            {interpretation.life_areas.personal_growth.quarterly_breakdown && (
                              <div className="grid md:grid-cols-2 gap-3 mb-3">
                                {Object.entries(interpretation.life_areas.personal_growth.quarterly_breakdown).map(([q, content]) => (
                                  <div key={q} className="bg-purple-800/30 rounded p-3">
                                    <p className="text-purple-200 font-semibold text-xs mb-1">
                                      {q === 'q1' && 'רבעון 1'}
                                      {q === 'q2' && 'רבעון 2'}
                                      {q === 'q3' && 'רבעון 3'}
                                      {q === 'q4' && 'רבעון 4'}
                                    </p>
                                    <p className="text-purple-100 text-xs">{content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            
                            <div className="grid md:grid-cols-2 gap-3">
                              {interpretation.life_areas.personal_growth.spiritual_practices && (
                                <div className="bg-purple-700/30 rounded p-3">
                                  <p className="text-purple-200 font-semibold text-sm mb-2">🧘 פרקטיקות רוחניות:</p>
                                  <ul className="text-purple-100 text-xs space-y-1">
                                    {interpretation.life_areas.personal_growth.spiritual_practices.map((p, i) => (
                                      <li key={i}>• {p}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {interpretation.life_areas.personal_growth.learning_opportunities && (
                                <div className="bg-purple-700/30 rounded p-3">
                                  <p className="text-purple-200 font-semibold text-sm mb-2">📚 הזדמנויות למידה:</p>
                                  <ul className="text-purple-100 text-xs space-y-1">
                                    {interpretation.life_areas.personal_growth.learning_opportunities.map((o, i) => (
                                      <li key={i}>• {o}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {interpretation.key_months && (
                      <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-600/30">
                        <h4 className="text-yellow-200 font-bold mb-3">⭐ חודשים חשובים:</h4>
                        <div className="space-y-2">
                          {interpretation.key_months.map((month, idx) => (
                            <div key={idx} className="bg-yellow-800/30 rounded p-3">
                              <p className="text-yellow-100 font-bold">{month.month}</p>
                              <p className="text-yellow-200 text-sm">{month.why_important}</p>
                              <p className="text-yellow-300 text-xs mt-1">💡 {month.what_to_do}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Enhanced Transit Report Sections */}
                {reading.reading_type === 'transit_report' && (
                  <>
                    {/* Top Influences */}
                    {interpretation.top_influences && (
                      <div className="bg-indigo-900/30 rounded-lg p-4 border border-indigo-600/30">
                        <h4 className="text-indigo-200 font-bold mb-3">⭐ ההשפעות המרכזיות בתקופה:</h4>
                        <div className="space-y-2">
                          {interpretation.top_influences.map((inf, idx) => (
                            <div key={idx} className="bg-indigo-800/30 rounded p-3">
                              <p className="text-indigo-100 font-bold text-sm">{inf.transit}</p>
                              <p className="text-indigo-200 text-xs">{inf.why_significant}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Major Transits - Enhanced with Timing */}
                    {interpretation.major_transits && (
                      <div className="space-y-3">
                        <h4 className="text-white font-bold text-2xl">🌊 מעברים משמעותיים - ניתוח מעמיק:</h4>
                        {interpretation.major_transits.map((transit, idx) => (
                          <div key={idx} className="bg-teal-900/30 rounded-lg p-5 border-2 border-teal-600/40">
                            <div className="flex items-start justify-between mb-3">
                              <h5 className="text-teal-200 font-bold text-lg">{transit.transit_name}</h5>
                              <Badge className="bg-teal-700 text-white text-xs">
                                {transit.exact_date ? new Date(transit.exact_date).toLocaleDateString('he-IL') : transit.duration}
                              </Badge>
                            </div>
                            
                            {/* Transit Details */}
                            <div className="bg-teal-800/30 rounded p-3 mb-3 text-xs text-teal-100">
                              <p><strong>מעביר:</strong> {transit.transiting_planet}</p>
                              <p><strong>נטאלי:</strong> {transit.natal_planet} בבית {transit.house}</p>
                              <p><strong>אספקט:</strong> {transit.aspect}</p>
                              {transit.applying_period && <p><strong>התקרבות:</strong> {transit.applying_period}</p>}
                              {transit.separating_period && <p><strong>התרחקות:</strong> {transit.separating_period}</p>}
                              {transit.total_influence_period && <p><strong>השפעה כוללת:</strong> {transit.total_influence_period}</p>}
                            </div>
                            
                            <p className="text-teal-100 mb-4 text-sm leading-relaxed">{transit.interpretation}</p>
                            
                            {/* Actionable Advice with Timing */}
                            {transit.actionable_advice && (
                              <div className="space-y-3">
                                {transit.actionable_advice.timing_breakdown && (
                                  <div className="bg-teal-800/30 rounded p-3">
                                    <p className="text-teal-200 font-semibold text-sm mb-2">⏰ תזמון מדויק:</p>
                                    {transit.actionable_advice.timing_breakdown.map((timing, i) => (
                                      <div key={i} className="text-xs text-teal-100 mb-2">
                                        <span className="font-semibold">{timing.dates}</span> ({timing.phase})
                                        <p className="text-teal-200 mt-1">→ {timing.what_to_do}</p>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                
                                <div className="grid md:grid-cols-2 gap-3">
                                  {transit.actionable_advice.do_list && (
                                    <div className="bg-green-800/30 rounded p-3">
                                      <p className="text-green-300 font-semibold text-sm mb-2">✓ מה לעשות:</p>
                                      <ul className="text-green-100 text-xs space-y-1">
                                        {transit.actionable_advice.do_list.map((item, i) => (
                                          <li key={i}>• {item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                  {transit.actionable_advice.avoid_list && (
                                    <div className="bg-red-800/30 rounded p-3">
                                      <p className="text-red-300 font-semibold text-sm mb-2">✗ מה להימנע:</p>
                                      <ul className="text-red-100 text-xs space-y-1">
                                        {transit.actionable_advice.avoid_list.map((item, i) => (
                                          <li key={i}>• {item}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <div className="grid md:grid-cols-2 gap-3 mt-3">
                              {transit.opportunities && transit.opportunities.length > 0 && (
                                <div>
                                  <p className="text-green-300 font-semibold text-sm mb-1">✨ הזדמנויות:</p>
                                  <ul className="list-disc list-inside text-green-100 text-xs">
                                    {transit.opportunities.map((opp, i) => <li key={i}>{opp}</li>)}
                                  </ul>
                                </div>
                              )}
                              {transit.challenges && transit.challenges.length > 0 && (
                                <div>
                                  <p className="text-amber-300 font-semibold text-sm mb-1">⚠️ אתגרים:</p>
                                  <ul className="list-disc list-inside text-amber-100 text-xs">
                                    {transit.challenges.map((ch, i) => <li key={i}>{ch}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {interpretation.timing_guidance && (
                      <div className="grid md:grid-cols-3 gap-4">
                        {interpretation.timing_guidance.best_action_periods && (
                          <div className="bg-green-900/30 rounded-lg p-3 border border-green-600/30">
                            <h5 className="text-green-200 font-bold mb-2 text-sm">🚀 תקופות לפעולה</h5>
                            <div className="space-y-2">
                              {interpretation.timing_guidance.best_action_periods.map((period, i) => (
                                <div key={i} className="text-xs">
                                  <p className="text-green-100 font-semibold">{period.dates}</p>
                                  <p className="text-green-200">{period.what_to_do}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {interpretation.timing_guidance.caution_periods && (
                          <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-600/30">
                            <h5 className="text-amber-200 font-bold mb-2 text-sm">⚠️ תקופות זהירות</h5>
                            <div className="space-y-2">
                              {interpretation.timing_guidance.caution_periods.map((period, i) => (
                                <div key={i} className="text-xs">
                                  <p className="text-amber-100 font-semibold">{period.dates}</p>
                                  <p className="text-amber-200">{period.what_to_avoid}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {interpretation.timing_guidance.reflection_periods && (
                          <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-600/30">
                            <h5 className="text-purple-200 font-bold mb-2 text-sm">🧘 תקופות הרהור</h5>
                            <div className="space-y-2">
                              {interpretation.timing_guidance.reflection_periods.map((period, i) => (
                                <div key={i} className="text-xs">
                                  <p className="text-purple-100 font-semibold">{period.dates}</p>
                                  <p className="text-purple-200">{period.what_to_focus_on}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Enhanced Compatibility Sections */}
                {reading.reading_type === 'compatibility' && (
                  <>
                    {/* Composite Chart Analysis - NEW */}
                    {interpretation.composite_analysis && (
                      <div className="space-y-3">
                        <h4 className="text-white font-bold text-2xl">🌟 ניתוח Composite Chart (המפה המשותפת):</h4>
                        <p className="text-indigo-200 text-sm mb-4">
                          הComposite Chart מייצג את היחסים עצמם כישות נפרדת - לא את שני האנשים, אלא את מה שנוצר ביניהם.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          {/* Composite Sun */}
                          {interpretation.composite_analysis.composite_sun && (
                            <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-600/30">
                              <h5 className="text-yellow-200 font-bold mb-2">
                                ☀️ Composite Sun ב{interpretation.composite_analysis.composite_sun.sign}
                                {interpretation.composite_analysis.composite_sun.house && ` (בית ${interpretation.composite_analysis.composite_sun.house})`}
                              </h5>
                              <p className="text-yellow-100 text-sm mb-2">{interpretation.composite_analysis.composite_sun.interpretation}</p>
                              <div className="bg-yellow-800/30 rounded p-2">
                                <p className="text-yellow-200 text-xs font-semibold">🎯 הייעוד המשותף:</p>
                                <p className="text-yellow-100 text-xs">{interpretation.composite_analysis.composite_sun.relationship_purpose}</p>
                              </div>
                            </div>
                          )}

                          {/* Composite Moon */}
                          {interpretation.composite_analysis.composite_moon && (
                            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600/30">
                              <h5 className="text-blue-200 font-bold mb-2">
                                🌙 Composite Moon ב{interpretation.composite_analysis.composite_moon.sign}
                                {interpretation.composite_analysis.composite_moon.house && ` (בית ${interpretation.composite_analysis.composite_moon.house})`}
                              </h5>
                              <p className="text-blue-100 text-sm mb-2">{interpretation.composite_analysis.composite_moon.interpretation}</p>
                              <div className="bg-blue-800/30 rounded p-2">
                                <p className="text-blue-200 text-xs font-semibold">💖 צרכים רגשיים:</p>
                                <p className="text-blue-100 text-xs">{interpretation.composite_analysis.composite_moon.emotional_needs}</p>
                              </div>
                            </div>
                          )}

                          {/* Composite Saturn */}
                          {interpretation.composite_analysis.composite_saturn && (
                            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600/30 md:col-span-2">
                              <h5 className="text-gray-200 font-bold mb-2">
                                🪐 Composite Saturn ב{interpretation.composite_analysis.composite_saturn.sign}
                                {interpretation.composite_analysis.composite_saturn.house && ` (בית ${interpretation.composite_analysis.composite_saturn.house})`}
                              </h5>
                              <p className="text-gray-100 text-sm mb-3">{interpretation.composite_analysis.composite_saturn.interpretation}</p>
                              <div className="grid md:grid-cols-2 gap-3">
                                <div className="bg-gray-700/30 rounded p-2">
                                  <p className="text-amber-200 text-xs font-semibold">⚠️ האתגר המרכזי:</p>
                                  <p className="text-gray-100 text-xs">{interpretation.composite_analysis.composite_saturn.relationship_challenge}</p>
                                </div>
                                <div className="bg-gray-700/30 rounded p-2">
                                  <p className="text-green-200 text-xs font-semibold">🌱 הדרך לבגרות:</p>
                                  <p className="text-gray-100 text-xs">{interpretation.composite_analysis.composite_saturn.path_to_maturity}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Synastry Analysis */}
                    {interpretation.synastry_analysis && (
                      <div className="space-y-3">
                        <h4 className="text-white font-bold text-2xl">🔗 ניתוח Synastry (אספקטים בין המפות):</h4>
                        {interpretation.synastry_analysis.map((aspect, idx) => (
                          <div key={idx} className={`rounded-lg p-4 border-2 ${
                            aspect.influence === 'positive' ? 'bg-green-900/30 border-green-600/40' :
                            aspect.influence === 'challenging' ? 'bg-red-900/30 border-red-600/40' :
                            aspect.influence === 'transformative' ? 'bg-purple-900/30 border-purple-600/40' :
                            'bg-gray-800/30 border-gray-600/30'
                          }`}>
                            <div className="flex items-start justify-between mb-2">
                              <h5 className={`font-bold ${
                                aspect.influence === 'positive' ? 'text-green-200' :
                                aspect.influence === 'challenging' ? 'text-red-200' :
                                aspect.influence === 'transformative' ? 'text-purple-200' :
                                'text-gray-200'
                              }`}>
                                {aspect.aspect_name} - {aspect.planets}
                              </h5>
                              {aspect.orb !== undefined && (
                                <Badge className="bg-white/10 text-white text-xs">
                                  Orb: {aspect.orb.toFixed(1)}°
                                </Badge>
                              )}
                            </div>
                            <p className={`text-sm mb-3 leading-relaxed ${
                              aspect.influence === 'positive' ? 'text-green-100' :
                              aspect.influence === 'challenging' ? 'text-red-100' :
                              aspect.influence === 'transformative' ? 'text-purple-100' :
                              'text-gray-100'
                            }`}>
                              {aspect.interpretation}
                            </p>
                            {aspect.impact_on_relationship && (
                              <div className="bg-black/20 rounded p-2 mb-2">
                                <p className="text-white text-xs font-semibold">💫 השפעה על היחסים:</p>
                                <p className="text-white/80 text-xs">{aspect.impact_on_relationship}</p>
                              </div>
                            )}
                            {aspect.how_to_enhance && (
                              <div className="bg-white/10 rounded p-2">
                                <p className="text-white text-xs font-semibold">✨ איך לחזק:</p>
                                <p className="text-white/80 text-xs">{aspect.how_to_enhance}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Enhanced Strengths */}
                    {interpretation.strengths && (
                      <div className="bg-green-900/30 rounded-lg p-5 border-2 border-green-600/40">
                        <h4 className="text-green-200 font-bold text-xl mb-4">💪 חוזקות ביחסים:</h4>
                        <div className="space-y-3">
                          {interpretation.strengths.map((strength, idx) => (
                            <div key={idx} className="bg-green-800/30 rounded p-3">
                              <p className="text-green-100 font-semibold">{strength.area}</p>
                              <p className="text-green-200 text-sm mb-2">{strength.description}</p>
                              {strength.supporting_factors && (
                                <div className="flex flex-wrap gap-1">
                                  {strength.supporting_factors.map((factor, i) => (
                                    <Badge key={i} className="bg-green-700 text-white text-xs">
                                      {factor}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Enhanced Challenges */}
                    {interpretation.challenges && (
                      <div className="bg-orange-900/30 rounded-lg p-5 border-2 border-orange-600/40">
                        <h4 className="text-orange-200 font-bold text-xl mb-4">⚠️ אתגרים ביחסים:</h4>
                        <div className="space-y-4">
                          {interpretation.challenges.map((challenge, idx) => (
                            <div key={idx} className="bg-orange-800/30 rounded p-4">
                              <p className="text-orange-100 font-semibold mb-2">{challenge.area}</p>
                              <p className="text-orange-200 text-sm mb-2">{challenge.description}</p>
                              {challenge.manifestation && (
                                <div className="bg-orange-700/30 rounded p-2 mb-2">
                                  <p className="text-orange-200 text-xs font-semibold">🎭 איך זה מתבטא:</p>
                                  <p className="text-orange-100 text-xs">{challenge.manifestation}</p>
                                </div>
                              )}
                              <div className="bg-green-800/30 rounded p-2 mb-2">
                                <p className="text-green-200 text-xs font-semibold">💡 איך להתגבר:</p>
                                <p className="text-green-100 text-xs">{challenge.how_to_overcome}</p>
                              </div>
                              {challenge.growth_potential && (
                                <div className="bg-purple-700/30 rounded p-2">
                                  <p className="text-purple-200 text-xs font-semibold">🌱 פוטנציאל צמיחה:</p>
                                  <p className="text-purple-100 text-xs">{challenge.growth_potential}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {interpretation.life_area_compatibility && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {Object.entries(interpretation.life_area_compatibility).map(([area, data]) => (
                          <div key={area} className="bg-pink-900/30 rounded-lg p-4 border border-pink-600/30">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-pink-200 font-bold text-sm">
                                {area === 'romance_intimacy' && '💕 רומנטיקה'}
                                {area === 'communication_intellect' && '💬 תקשורת'}
                                {area === 'values_lifestyle' && '⚖️ ערכים'}
                                {area === 'family_home' && '🏠 משפחה'}
                              </h5>
                              <Badge className="bg-pink-700 text-white text-xs">
                                {data.score}%
                              </Badge>
                            </div>
                            <Progress value={data.score} className="h-2 mb-2" />
                            <p className="text-pink-100 text-xs">{data.analysis}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Monthly Forecast Sections */}
                {reading.reading_type === 'monthly_forecast' && interpretation.life_areas && (
                  <div className="grid md:grid-cols-2 gap-4">
                    {Object.entries(interpretation.life_areas).map(([area, content]) => (
                      <div key={area} className="bg-blue-900/30 rounded-lg p-4 border border-blue-600/30">
                        <h5 className="text-blue-200 font-bold mb-2">
                          {area === 'career' && '💼 קריירה'}
                          {area === 'relationships' && '💕 יחסים'}
                          {area === 'health' && '💪 בריאות'}
                          {area === 'spirituality' && '🧘 רוחניות'}
                        </h5>
                        <p className="text-blue-100 text-sm leading-relaxed">{content}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Relationship Dynamics */}
                {reading.reading_type === 'relationship_dynamics' && interpretation.ideal_partner && (
                  <div className="bg-pink-900/30 rounded-lg p-4 border border-pink-600/30">
                    <h5 className="text-pink-200 font-bold mb-3">💕 בן/בת הזוג האידיאלי/ת:</h5>
                    {interpretation.ideal_partner.qualities && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {interpretation.ideal_partner.qualities.map((quality, idx) => (
                          <Badge key={idx} className="bg-pink-700 text-white">
                            {quality}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {interpretation.ideal_partner.what_attracts_you && (
                      <p className="text-pink-100 text-sm">{interpretation.ideal_partner.what_attracts_you}</p>
                    )}
                  </div>
                )}

                {/* Career Potential */}
                {reading.reading_type === 'career_potential' && interpretation.ideal_careers && (
                  <div className="bg-amber-900/30 rounded-lg p-4 border border-amber-600/30">
                    <h5 className="text-amber-200 font-bold mb-3">💼 קריירות מומלצות:</h5>
                    <div className="space-y-2">
                      {interpretation.ideal_careers.map((career, idx) => (
                        <div key={idx} className="bg-amber-800/30 rounded p-2">
                          <p className="text-amber-100 font-semibold">{career.career}</p>
                          <p className="text-amber-200 text-xs">{career.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Add highlight effect to active section */}
                <style>{`
                  .section-highlight {
                    animation: highlight-pulse 2s ease-in-out;
                  }
                  
                  @keyframes highlight-pulse {
                    0%, 100% { box-shadow: 0 0 0 0 rgba(251, 191, 36, 0); }
                    50% { box-shadow: 0 0 0 8px rgba(251, 191, 36, 0.4); }
                  }
                `}</style>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Full View */}
          <div className="flex gap-3">
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="outline"
              className="flex-1 border-indigo-500 text-indigo-200 hover:bg-indigo-900/30"
            >
              {isExpanded ? (
                <>הסתר פרטים <ChevronUp className="w-4 h-4 mr-2" /></>
              ) : (
                <>ראה פרטים מלאים <ChevronDown className="w-4 h-4 mr-2" /></>
              )}
            </Button>
            {onViewFull && (
              <Button
                onClick={onViewFull}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
              >
                <Stars className="w-4 h-4 ml-2" />
                דף מלא
              </Button>
            )}
          </div>

          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-indigo-300 pt-4 border-t border-indigo-700/30">
            <div className="flex items-center gap-2">
              <Clock className="w-3 h-3" />
              <span>
                נוצר ב-{new Date(reading.generated_date).toLocaleDateString('he-IL', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </span>
            </div>
            {reading.ai_metadata?.processing_time_ms && (
              <span>זמן עיבוד: {(reading.ai_metadata.processing_time_ms / 1000).toFixed(1)}s</span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper component for detailed sections
function DetailSection({ title, content, icon, color, extraContent }) {
  return (
    <div className={`bg-gradient-to-r ${color} bg-opacity-20 rounded-lg p-4 border border-white/10`}>
      <h5 className="text-white font-bold mb-3 flex items-center gap-2">
        <span className="text-2xl">{icon}</span>
        {title}
      </h5>
      <p className="text-white/90 text-sm leading-relaxed whitespace-pre-line">
        {content}
      </p>
      {extraContent && extraContent}
    </div>
  );
}

function getArchetypeEmoji(archetype) {
  const emojis = {
    passionate: '🔥',
    companionate: '🤝',
    karmic: '♾️',
    transformative: '🦋',
    spiritual: '🙏',
    playful: '🎭',
    stable: '🏛️',
    challenging: '⚔️'
  };
  return emojis[archetype] || '💫';
}

function getArchetypeHebrew(archetype) {
  const hebrew = {
    passionate: 'תשוקתי',
    companionate: 'חברי',
    karmic: 'קרמי',
    transformative: 'טרנספורמטיבי',
    spiritual: 'רוחני',
    playful: 'משחקי',
    stable: 'יציב',
    challenging: 'מאתגר'
  };
  return hebrew[archetype] || archetype;
}
