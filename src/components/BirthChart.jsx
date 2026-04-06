import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, MessageCircle, BookOpen, Loader2, ExternalLink } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

/**
 * מפה אסטרולוגית אינטראקטיבית - Birth Chart
 * עם hover tooltips, click handlers, AI explanations מיידיות
 */

const ZODIAC_SIGNS = {
  'Aries': { emoji: '♈', color: '#FF4444', name: 'טלה', element: 'אש' },
  'Taurus': { emoji: '♉', color: '#44FF44', name: 'שור', element: 'אדמה' },
  'Gemini': { emoji: '♊', color: '#FFFF44', name: 'תאומים', element: 'אוויר' },
  'Cancer': { emoji: '♋', color: '#4444FF', name: 'סרטן', element: 'מים' },
  'Leo': { emoji: '♌', color: '#FF8800', name: 'אריה', element: 'אש' },
  'Virgo': { emoji: '♍', color: '#88FF88', name: 'בתולה', element: 'אדמה' },
  'Libra': { emoji: '♎', color: '#FF44FF', name: 'מאזניים', element: 'אוויר' },
  'Scorpio': { emoji: '♏', color: '#880088', name: 'עקרב', element: 'מים' },
  'Sagittarius': { emoji: '♐', color: '#8844FF', name: 'קשת', element: 'אש' },
  'Capricorn': { emoji: '♑', color: '#448888', name: 'גדי', element: 'אדמה' },
  'Aquarius': { emoji: '♒', color: '#44FFFF', name: 'דלי', element: 'אוויר' },
  'Pisces': { emoji: '♓', color: '#4488FF', name: 'דגים', element: 'מים' }
};

const PLANET_SYMBOLS = {
  sun: { symbol: '☉', name: 'שמש', color: '#FFD700', meaning: 'זהות הליבה והיצירתיות' },
  moon: { symbol: '☽', name: 'ירח', color: '#C0C0C0', meaning: 'רגשות ואינטואיציה' },
  mercury: { symbol: '☿', name: 'מרקורי', color: '#FFA500', meaning: 'תקשורת וחשיבה' },
  venus: { symbol: '♀', name: 'ונוס', color: '#FF69B4', meaning: 'אהבה וערכים' },
  mars: { symbol: '♂', name: 'מאדים', color: '#FF0000', meaning: 'אנרגיה ופעולה' },
  jupiter: { symbol: '♃', name: 'צדק', color: '#4169E1', meaning: 'צמיחה והרחבה' },
  saturn: { symbol: '♄', name: 'שבתאי', color: '#8B4513', meaning: 'אחריות ומשמעת' },
  uranus: { symbol: '♅', name: 'אורנוס', color: '#00CED1', meaning: 'שינוי וחידוש' },
  neptune: { symbol: '♆', name: 'נפטון', color: '#4B0082', meaning: 'רוחניות וחלומות' },
  pluto: { symbol: '♇', name: 'פלוטו', color: '#8B0000', meaning: 'טרנספורמציה' }
};

const ASPECT_TYPES = {
  'Conjunction': { name: 'חיבור', color: '#FFD700', strength: 1.0, meaning: 'מיזוג אנרגיות' },
  'Opposition': { name: 'ניגוד', color: '#FF0000', strength: 0.9, meaning: 'מתח דינמי' },
  'Trine': { name: 'טריגון', color: '#00FF00', strength: 0.8, meaning: 'הרמוניה זורמת' },
  'Square': { name: 'ריבוע', color: '#FF6600', strength: 0.7, meaning: 'אתגר יוצר' },
  'Sextile': { name: 'סקסטיל', color: '#00AAFF', strength: 0.6, meaning: 'הזדמנות' },
  'Quincunx': { name: 'קווינקונקס', color: '#888888', strength: 0.4, meaning: 'התאמה נדרשת' },
  'Semi-sextile': { name: 'חצי-סקסטיל', color: '#AAAAAA', strength: 0.3, meaning: 'קשר עדין' }
};

const HOUSE_MEANINGS = {
  1: 'האני, המסכה החיצונית',
  2: 'כסף, ערכים, רכוש',
  3: 'תקשורת, אחים, למידה',
  4: 'בית, משפחה, שורשים',
  5: 'יצירתיות, רומנטיקה, ילדים',
  6: 'עבודה, שירות, בריאות',
  7: 'שותפויות, יחסים, נישואין',
  8: 'טרנספורמציה, מיניות, משאבים משותפים',
  9: 'פילוסופיה, נסיעות, השכלה גבוהה',
  10: 'קריירה, מוניטין, הישגים',
  11: 'חברים, קהילה, חלומות',
  12: 'תת-מודע, רוחניות, בדידות'
};

export default function BirthChart({ astrologyData, showTooltips = true }) {
  const [selectedElement, setSelectedElement] = useState(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [relatedReadings, setRelatedReadings] = useState([]);

  if (!astrologyData || !astrologyData.planets) {
    return null;
  }

  const { planets, ascendant, aspects, houses } = astrologyData;

  // חישוב מיקום כוכב על המעגל
  const getPlanetPosition = (longitude, radius) => {
    const angle = (longitude - 90) * (Math.PI / 180);
    return {
      x: 250 + radius * Math.cos(angle),
      y: 250 + radius * Math.sin(angle)
    };
  };

  // Handle element click with AI explanation
  const handleElementClick = async (elementType, elementData) => {
    setSelectedElement({ type: elementType, data: elementData });
    setIsExplaining(true);
    setAiExplanation(null);
    setRelatedReadings([]);

    try {
      // Generate AI explanation
      const explanation = await generateAIExplanation(elementType, elementData, astrologyData);
      setAiExplanation(explanation);

      // Find related readings
      const readings = await findRelatedReadings(elementType, elementData);
      setRelatedReadings(readings);
    } catch (error) {
      console.error('Error generating explanation:', error);
      setAiExplanation({
        title: 'שגיאה',
        content: 'לא הצלחנו ליצור הסבר. נסה שוב.',
        quick_insight: null
      });
    } finally {
      setIsExplaining(false);
    }
  };

  const handleCloseDialog = () => {
    setSelectedElement(null);
    setAiExplanation(null);
    setRelatedReadings([]);
  };

  const handleAskTutor = () => {
    if (!selectedElement) return;
    
    const question = buildQuestionForTutor(selectedElement.type, selectedElement.data);
    
    // Navigate to tutor with pre-filled question
    const tutorUrl = createPageUrl('AstrologyTutor');
    window.location.href = `${tutorUrl}?question=${encodeURIComponent(question)}`;
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-xl border-indigo-700/30">
        <CardHeader>
          <CardTitle className="text-2xl text-white flex items-center gap-2">
            <span className="text-3xl">🌌</span>
            מפת הלידה האינטראקטיבית שלך
          </CardTitle>
          <p className="text-indigo-200">
            העבר עכבר לפרטים • <strong>לחץ לניתוח AI מיידי</strong> • שאל את המורה שאלות
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-6">
            {/* המפה עצמה */}
            <div className="flex-1">
              <TooltipProvider delayDuration={100}>
                <svg 
                  viewBox="0 0 500 500" 
                  className="w-full h-auto bg-gray-900/50 rounded-xl border-2 border-indigo-600/30"
                >
                  <defs>
                    <radialGradient id="wheelGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                      <stop offset="0%" stopColor="#312e81" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#1e1b4b" stopOpacity="0.8" />
                    </radialGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>

                  {/* רקע ועיגולים */}
                  <circle cx="250" cy="250" r="240" fill="url(#wheelGradient)" stroke="#4F46E5" strokeWidth="2" />
                  <circle cx="250" cy="250" r="200" fill="none" stroke="#6366F1" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
                  <circle cx="250" cy="250" r="160" fill="none" stroke="#818CF8" strokeWidth="1" opacity="0.3" />

                  {/* מעגל כוכבי לכת */}
                  <circle
                    cx="250"
                    cy="250"
                    r="160"
                    fill="none"
                    stroke="#818CF8"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                  />

                  {/* קווי חלוקה למזלות (12 קווים) + מספרי בתים */}
                  {[...Array(12)].map((_, i) => {
                    const angle = (i * 30 - 90) * (Math.PI / 180);
                    const x1 = 250 + 160 * Math.cos(angle);
                    const y1 = 250 + 160 * Math.sin(angle);
                    const x2 = 250 + 240 * Math.cos(angle);
                    const y2 = 250 + 240 * Math.sin(angle);
                    
                    const houseNumAngle = ((i * 30 - 90 + 15)) * (Math.PI / 180);
                    const houseX = 250 + 135 * Math.cos(houseNumAngle);
                    const houseY = 250 + 135 * Math.sin(houseNumAngle);
                    
                    const houseNumber = i + 1;
                    const houseMeaning = HOUSE_MEANINGS[houseNumber];
                    
                    return (
                      <g key={i}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="#6366F1"
                          strokeWidth="1"
                          opacity="0.5"
                        />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <text
                              x={houseX}
                              y={houseY}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="12"
                              fill="#A5B4FC"
                              fontWeight="bold"
                              className="cursor-pointer hover:fill-yellow-300 transition-colors"
                              onClick={() => handleElementClick('house', { number: houseNumber, meaning: houseMeaning })}
                            >
                              {houseNumber}
                            </text>
                          </TooltipTrigger>
                          {showTooltips && (
                            <TooltipContent className="bg-indigo-900 border-indigo-600">
                              <p className="font-bold text-white">בית {houseNumber}</p>
                              <p className="text-indigo-200 text-sm">{houseMeaning}</p>
                              <p className="text-indigo-300 text-xs mt-1">👆 לחץ לניתוח AI</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </g>
                    );
                  })}

                  {/* סמלי מזלות */}
                  {Object.entries(ZODIAC_SIGNS).map(([sign, data], i) => {
                    const angle = (i * 30 - 90 + 15) * (Math.PI / 180);
                    const x = 250 + 220 * Math.cos(angle);
                    const y = 250 + 220 * Math.sin(angle);
                    return (
                      <text
                        key={sign}
                        x={x}
                        y={y}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="24"
                        fill={data.color}
                        className="pointer-events-none"
                      >
                        {data.emoji}
                      </text>
                    );
                  })}

                  {/* קווי Aspects - רק המייג'ורים החזקים */}
                  {aspects && aspects.filter(a => a.is_major && a.strength > 0.6).slice(0, 8).map((aspect, idx) => {
                    const planet1 = planets.find(p => p.name.toLowerCase() === aspect.planet1.toLowerCase());
                    const planet2 = planets.find(p => p.name.toLowerCase() === aspect.planet2.toLowerCase());
                    if (!planet1 || !planet2) return null;

                    const pos1 = getPlanetPosition(parseFloat(planet1.longitude), 170);
                    const pos2 = getPlanetPosition(parseFloat(planet2.longitude), 170);

                    const aspectInfo = ASPECT_TYPES[aspect.type];
                    const color = aspectInfo?.color || '#888888';
                    const opacity = (aspect.strength || 0.5) * 0.6;

                    return (
                      <Tooltip key={idx}>
                        <TooltipTrigger asChild>
                          <line
                            x1={pos1.x}
                            y1={pos1.y}
                            x2={pos2.x}
                            y2={pos2.y}
                            stroke={color}
                            strokeWidth="2"
                            opacity={opacity}
                            strokeDasharray={aspect.type === 'Opposition' ? '5,5' : aspect.type === 'Square' ? '3,3' : '0'}
                            className="cursor-pointer hover:opacity-100 transition-opacity"
                            onClick={() => handleElementClick('aspect', aspect)}
                          />
                        </TooltipTrigger>
                        {showTooltips && (
                          <TooltipContent className="bg-purple-900 border-purple-600">
                            <p className="font-bold text-white">
                              {PLANET_SYMBOLS[aspect.planet1.toLowerCase()]?.name} {aspectInfo?.name} {PLANET_SYMBOLS[aspect.planet2.toLowerCase()]?.name}
                            </p>
                            <p className="text-purple-200 text-sm">{aspectInfo?.meaning}</p>
                            <p className="text-purple-300 text-xs">עוצמה: {Math.round(aspect.strength * 100)}%</p>
                            <p className="text-yellow-300 text-xs mt-1">👆 לחץ לניתוח מעמיק</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })}

                  {/* כוכבי הלכת */}
                  {planets && planets.map((planet, idx) => {
                    const position = getPlanetPosition(parseFloat(planet.longitude), 170);
                    const planetData = PLANET_SYMBOLS[planet.name.toLowerCase()];
                    if (!planetData) return null;

                    const zodiacData = ZODIAC_SIGNS[planet.sign];

                    return (
                      <g key={idx}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <g
                              className="cursor-pointer hover:scale-110 transition-transform origin-center"
                              style={{ transformBox: 'fill-box' }}
                              onClick={() => handleElementClick('planet', { ...planet, ...planetData })}
                            >
                              <circle
                                cx={position.x}
                                cy={position.y}
                                r="12"
                                fill={planetData.color}
                                stroke="#FFF"
                                strokeWidth="2"
                                filter="drop-shadow(0 0 4px rgba(0,0,0,0.5))"
                              />
                              <text
                                x={position.x}
                                y={position.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fontSize="14"
                                fill="#FFF"
                                fontWeight="bold"
                              >
                                {planetData.symbol}
                              </text>
                            </g>
                          </TooltipTrigger>
                          {showTooltips && (
                            <TooltipContent className="bg-indigo-900 border-indigo-600">
                              <p className="font-bold text-white">{planetData.name} ב{zodiacData?.name}</p>
                              <p className="text-indigo-200 text-sm">{planetData.meaning}</p>
                              <p className="text-indigo-300 text-xs">בית {planet.house}</p>
                              <p className="text-yellow-300 text-xs mt-1">👆 לחץ לניתוח AI מלא</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </g>
                    );
                  })}

                  {/* Ascendant (אופק עולה) - קו זהב */}
                  {ascendant && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <g
                          className="cursor-pointer"
                          onClick={() => handleElementClick('ascendant', ascendant)}
                        >
                          <line
                            x1="250"
                            y1="250"
                            x2="490"
                            y2="250"
                            stroke="#FFD700"
                            strokeWidth="4"
                          />
                          <text
                            x="465"
                            y="235"
                            textAnchor="end"
                            fontSize="16"
                            fill="#FFD700"
                            fontWeight="bold"
                          >
                            ASC
                          </text>
                          <text
                            x="465"
                            y="270"
                            textAnchor="end"
                            fontSize="12"
                            fill="#FFD700"
                          >
                            {ZODIAC_SIGNS[ascendant.sign]?.name}
                          </text>
                        </g>
                      </TooltipTrigger>
                      {showTooltips && (
                        <TooltipContent className="bg-yellow-900 border-yellow-600">
                          <p className="font-bold text-white">אסצנדנט - {ZODIAC_SIGNS[ascendant.sign]?.name}</p>
                          <p className="text-yellow-200 text-sm">המסכה החיצונית שלך</p>
                          <p className="text-yellow-300 text-xs mt-1">👆 לחץ לניתוח AI</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )}

                  {/* MC (Midheaven) */}
                  {houses && houses[9] && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <g
                          className="cursor-pointer"
                          onClick={() => handleElementClick('midheaven', houses[9])}
                        >
                          <line
                            x1="250"
                            y1="250"
                            x2="250"
                            y2="10"
                            stroke="#C0C0C0"
                            strokeWidth="3"
                          />
                          <text
                            x="250"
                            y="25"
                            textAnchor="middle"
                            fontSize="14"
                            fill="#C0C0C0"
                            fontWeight="bold"
                          >
                            MC
                          </text>
                        </g>
                      </TooltipTrigger>
                      {showTooltips && (
                        <TooltipContent className="bg-gray-800 border-gray-600">
                          <p className="font-bold text-white">Midheaven - {ZODIAC_SIGNS[houses[9].sign]?.name}</p>
                          <p className="text-gray-200 text-sm">הקריירה והייעוד שלך</p>
                          <p className="text-yellow-300 text-xs mt-1">👆 לחץ לניתוח AI</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  )}

                  {/* מרכז */}
                  <circle
                    cx="250"
                    cy="250"
                    r="5"
                    fill="#FFF"
                  />
                </svg>
              </TooltipProvider>
            </div>

            {/* מקרא משופר */}
            <div className="lg:w-72 space-y-4">
              {/* כוכבי לכת */}
              <div>
                <h3 className="text-white font-bold mb-3 text-lg flex items-center gap-2">
                  🪐 כוכבי לכת
                </h3>
                <div className="space-y-2">
                  {planets && planets.slice(0, 7).map((planet, idx) => {
                    const planetData = PLANET_SYMBOLS[planet.name.toLowerCase()];
                    const zodiacData = ZODIAC_SIGNS[planet.sign];
                    if (!planetData || !zodiacData) return null;

                    return (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between text-sm bg-indigo-900/30 rounded-lg p-2 cursor-pointer hover:bg-indigo-800/50 transition-all hover:scale-105"
                        onClick={() => handleElementClick('planet', { ...planet, ...planetData })}
                      >
                        <div className="flex items-center gap-2">
                          <span style={{ color: planetData.color }} className="text-xl">{planetData.symbol}</span>
                          <span className="text-gray-300">{planetData.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{zodiacData.emoji}</span>
                          <div className="text-left">
                            <div className="text-gray-400 text-xs">{zodiacData.name}</div>
                            <div className="text-gray-500 text-xs">בית {planet.house}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* נקודות מיוחדות */}
              {ascendant && (
                <div>
                  <h3 className="text-white font-bold mb-3 text-lg flex items-center gap-2">
                    ⭐ נקודות מיוחדות
                  </h3>
                  <div className="space-y-2">
                    <div 
                      className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-700/50 cursor-pointer hover:bg-yellow-800/40 transition-all hover:scale-105"
                      onClick={() => handleElementClick('ascendant', ascendant)}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-yellow-400 font-bold">ASC</span>
                        <span className="text-yellow-200 text-sm">אסצנדנט</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{ZODIAC_SIGNS[ascendant.sign]?.emoji}</span>
                        <span className="text-yellow-100">{ZODIAC_SIGNS[ascendant.sign]?.name}</span>
                      </div>
                    </div>

                    {houses && houses[9] && (
                      <div 
                        className="bg-gray-700/30 rounded-lg p-3 border border-gray-600/50 cursor-pointer hover:bg-gray-600/40 transition-all hover:scale-105"
                        onClick={() => handleElementClick('midheaven', houses[9])}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-gray-300 font-bold">MC</span>
                          <span className="text-gray-200 text-sm">קריירה</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{ZODIAC_SIGNS[houses[9].sign]?.emoji}</span>
                          <span className="text-gray-100">{ZODIAC_SIGNS[houses[9].sign]?.name}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* יסודות */}
              {astrologyData.element_distribution && (
                <div>
                  <h3 className="text-white font-bold mb-3 text-lg flex items-center gap-2">
                    🔥 יסודות
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-red-400">🔥 אש</span>
                      <span className="text-white font-bold">{astrologyData.element_distribution.Fire || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-400">🌍 אדמה</span>
                      <span className="text-white font-bold">{astrologyData.element_distribution.Earth || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400">💨 אוויר</span>
                      <span className="text-white font-bold">{astrologyData.element_distribution.Air || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400">💧 מים</span>
                      <span className="text-white font-bold">{astrologyData.element_distribution.Water || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Explanation Dialog */}
      <Dialog open={!!selectedElement} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-indigo-950 to-purple-950 border-indigo-600">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              {getElementTitle(selectedElement)}
            </DialogTitle>
            <DialogDescription className="text-indigo-200">
              ניתוח AI מותאם אישית למפת הלידה שלך
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {isExplaining ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-purple-400 animate-spin mb-4" />
                <p className="text-white">יוצר ניתוח מעמיק...</p>
              </div>
            ) : aiExplanation ? (
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Quick Insight */}
                  {aiExplanation.quick_insight && (
                    <div className="bg-yellow-900/30 rounded-lg p-4 border border-yellow-600/30">
                      <h4 className="text-yellow-200 font-bold mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        תובנה מהירה:
                      </h4>
                      <p className="text-yellow-100 text-lg font-semibold">
                        {aiExplanation.quick_insight}
                      </p>
                    </div>
                  )}

                  {/* Main Explanation */}
                  <div className="bg-indigo-900/30 rounded-lg p-4 border border-indigo-600/30">
                    <h4 className="text-indigo-200 font-bold mb-3">📖 הסבר מפורט:</h4>
                    <p className="text-white leading-relaxed whitespace-pre-line">
                      {aiExplanation.content}
                    </p>
                  </div>

                  {/* How This Affects You */}
                  {aiExplanation.personal_impact && (
                    <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-600/30">
                      <h4 className="text-purple-200 font-bold mb-3">🎯 איך זה משפיע עליך:</h4>
                      <p className="text-purple-100 leading-relaxed">
                        {aiExplanation.personal_impact}
                      </p>
                    </div>
                  )}

                  {/* Actionable Advice */}
                  {aiExplanation.advice && aiExplanation.advice.length > 0 && (
                    <div className="bg-green-900/30 rounded-lg p-4 border border-green-600/30">
                      <h4 className="text-green-200 font-bold mb-3">💡 עצות מעשיות:</h4>
                      <ul className="space-y-2">
                        {aiExplanation.advice.map((tip, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-green-100">
                            <span className="text-green-400 shrink-0">✓</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Related Readings */}
                  {relatedReadings && relatedReadings.length > 0 && (
                    <div className="bg-pink-900/30 rounded-lg p-4 border border-pink-600/30">
                      <h4 className="text-pink-200 font-bold mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        קריאות קשורות:
                      </h4>
                      <div className="space-y-2">
                        {relatedReadings.map((reading) => (
                          <Link
                            key={reading.id}
                            to={createPageUrl('AstrologyReadings')}
                            className="block"
                          >
                            <div className="bg-pink-800/30 rounded p-3 hover:bg-pink-700/40 transition-all">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-pink-100 font-semibold text-sm">{reading.title}</p>
                                  <p className="text-pink-200 text-xs">{reading.summary?.substring(0, 80)}...</p>
                                </div>
                                <ExternalLink className="w-4 h-4 text-pink-300" />
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      onClick={handleAskTutor}
                      className="flex-1 bg-purple-600 hover:bg-purple-700"
                    >
                      <MessageCircle className="w-4 h-4 ml-2" />
                      שאל את המורה על זה
                    </Button>
                    <Button
                      onClick={handleCloseDialog}
                      variant="outline"
                      className="flex-1"
                    >
                      סגור
                    </Button>
                  </div>
                </motion.div>
              </AnimatePresence>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Helper function to get element title
function getElementTitle(selectedElement) {
  if (!selectedElement) return '';
  
  const { type, data } = selectedElement;
  
  switch (type) {
    case 'planet':
      return `${data.name} ב${ZODIAC_SIGNS[data.sign]?.name} (בית ${data.house})`;
    case 'aspect':
      return `${PLANET_SYMBOLS[data.planet1.toLowerCase()]?.name} ${ASPECT_TYPES[data.type]?.name} ${PLANET_SYMBOLS[data.planet2.toLowerCase()]?.name}`;
    case 'house':
      return `בית ${data.number} - ${data.meaning}`;
    case 'ascendant':
      return `אסצנדנט ב${ZODIAC_SIGNS[data.sign]?.name}`;
    case 'midheaven':
      return `Midheaven ב${ZODIAC_SIGNS[data.sign]?.name}`;
    default:
      return 'אלמנט אסטרולוגי';
  }
}

// Helper to build question for tutor
function buildQuestionForTutor(type, data) {
  switch (type) {
    case 'planet':
      return `הסבר לי בפירוט על ${data.name} ב${ZODIAC_SIGNS[data.sign]?.name} בבית ${data.house} במפת הלידה שלי`;
    case 'aspect':
      return `מה המשמעות של ${data.planet1} ${data.type} ${data.planet2} במפת הלידה שלי?`;
    case 'house':
      return `הסבר לי על בית ${data.number} ואיך הוא משפיע עליי`;
    case 'ascendant':
      return `מה המשמעות של אסצנדנט ב${ZODIAC_SIGNS[data.sign]?.name}?`;
    case 'midheaven':
      return `הסבר לי על Midheaven ב${ZODIAC_SIGNS[data.sign]?.name} והקריירה שלי`;
    default:
      return 'ספר לי עוד על האלמנט הזה במפת הלידה שלי';
  }
}

// Generate AI explanation
async function generateAIExplanation(type, data, fullChart) {
  const prompt = buildExplanationPrompt(type, data, fullChart);
  
  const response = await base44.integrations.Core.InvokeLLM({
    prompt,
    add_context_from_internet: false,
    response_json_schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        quick_insight: { 
          type: "string",
          minLength: 50,
          maxLength: 150,
          description: "One-liner insight"
        },
        content: { 
          type: "string",
          minLength: 300,
          maxLength: 600,
          description: "Detailed explanation"
        },
        personal_impact: {
          type: "string",
          minLength: 200,
          maxLength: 400,
          description: "How this specifically affects the user"
        },
        advice: {
          type: "array",
          minItems: 3,
          maxItems: 5,
          items: { type: "string" },
          description: "Actionable tips"
        }
      },
      required: ["title", "quick_insight", "content", "personal_impact", "advice"]
    }
  });

  return response;
}

// Build explanation prompt
function buildExplanationPrompt(type, data, fullChart) {
  const chartContext = `
מפת הלידה המלאה:
- Sun: ${fullChart.sun_sign}
- Moon: ${fullChart.moon_sign}
- Ascendant: ${fullChart.rising_sign}
${fullChart.planets ? fullChart.planets.map(p => `- ${p.name}: ${p.sign} בבית ${p.house}`).join('\n') : ''}
`;

  let specificPrompt = '';

  switch (type) {
    case 'planet':
      specificPrompt = `
הסבר בפירוט על:
**${data.name} ב${ZODIAC_SIGNS[data.sign]?.name} בבית ${data.house}**

כלול:
1. מה ${data.name} מייצג באסטרולוגיה
2. מה ${ZODIAC_SIGNS[data.sign]?.name} מוסיף לכוכב
3. מה בית ${data.house} אומר על איפה זה מתבטא
4. איך זה משפיע על המשתמש הספציפי הזה
5. 3-5 עצות מעשיות
`;
      break;

    case 'aspect':
      specificPrompt = `
הסבר בפירוט על האספקט:
**${data.planet1} ${data.type} ${data.planet2}**
- עוצמה: ${data.strength}
- Orb: ${data.orb}°

כלול:
1. מה כל כוכב מייצג
2. מה ${data.type} אומר על הקשר ביניהם
3. איך זה יוצר דינמיקה פסיכולוגית
4. איך זה משפיע על חיי המשתמש
5. עצות לעבודה עם האספקט הזה
`;
      break;

    case 'house':
      specificPrompt = `
הסבר על בית ${data.number}:
**${data.meaning}**

כלול:
1. מה בית ${data.number} מייצג
2. אילו כוכבים יש לו בבית הזה (אם יש)
3. איך זה משפיע על תחום החיים הזה
4. עצות מעשיות
`;
      break;

    case 'ascendant':
      specificPrompt = `
הסבר על:
**אסצנדנט ב${ZODIAC_SIGNS[data.sign]?.name}**

כלול:
1. מה זה אסצנדנט ולמה הוא חשוב
2. מה ${ZODIAC_SIGNS[data.sign]?.name} מוסיף
3. איך אנשים רואים את המשתמש
4. ההבדל בין Sun/Moon/Ascendant
5. עצות לעבודה עם האסצנדנט
`;
      break;

    case 'midheaven':
      specificPrompt = `
הסבר על:
**Midheaven (MC) ב${ZODIAC_SIGNS[data.sign]?.name}**

כלול:
1. מה זה Midheaven
2. מה ${ZODIAC_SIGNS[data.sign]?.name} אומר על הקריירה
3. הכיוונים המקצועיים המתאימים
4. איך להגשים את הפוטנציאל
`;
      break;
  }

  return `${chartContext}

${specificPrompt}

**סגנון:**
- חם ואישי (דבר ישירות אל המשתמש)
- פשוט אך מקצועי
- עם דוגמאות מהחיים
- 300-600 מילים בלבד (תמציתי!)
- עצות מעשיות

החזר JSON מובנה.`;
}

// Find related readings
async function findRelatedReadings(type, data) {
  try {
    const allReadings = await base44.entities.AstrologyReading.list('-generated_date', 20);
    
    // Filter based on element type
    let relevantReadings = [];
    
    if (type === 'planet') {
      const planetName = data.name.toLowerCase();
      
      // Look for readings that mention this planet
      relevantReadings = allReadings.filter(reading => {
        const tags = reading.tags || [];
        const keyThemes = reading.key_themes || [];
        
        return tags.some(tag => tag.includes(planetName)) ||
               keyThemes.some(theme => theme.toLowerCase().includes(planetName)) ||
               (planetName === 'sun' && ['natal_chart', 'personality_analysis'].includes(reading.reading_type)) ||
               (planetName === 'moon' && ['natal_chart', 'relationship_dynamics'].includes(reading.reading_type)) ||
               (planetName === 'venus' && ['relationship_dynamics', 'compatibility'].includes(reading.reading_type)) ||
               (planetName === 'mars' && ['career_potential'].includes(reading.reading_type));
      });
    } else if (type === 'aspect') {
      // Look for readings that might discuss this aspect
      relevantReadings = allReadings.filter(reading => 
        reading.reading_type === 'natal_chart' || 
        reading.reading_type === 'compatibility'
      );
    } else if (type === 'house') {
      const houseNum = data.number;
      
      if (houseNum === 7 || houseNum === 5 || houseNum === 8) {
        relevantReadings = allReadings.filter(r => r.reading_type === 'relationship_dynamics');
      } else if (houseNum === 10 || houseNum === 6 || houseNum === 2) {
        relevantReadings = allReadings.filter(r => r.reading_type === 'career_potential');
      }
    }

    return relevantReadings.slice(0, 3);
  } catch (error) {
    console.error('Error finding related readings:', error);
    return [];
  }
}