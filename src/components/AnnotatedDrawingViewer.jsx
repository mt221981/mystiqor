
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ZoomIn, ZoomOut, Eye, EyeOff, Layers,
  AlertTriangle, CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ANNOTATED DRAWING VIEWER
 * מציג את הציור עם הדגשות ויזואליות של ממצאים
 */

export default function AnnotatedDrawingViewer({ 
  imageUrl, 
  analysisResults,
  drawingType = 'person'
}) {
  const [zoom, setZoom] = useState(1);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [activeAnnotation, setActiveAnnotation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFullscreen, setShowFullscreen] = useState(false);

  // Generate annotations from analysis results
  const annotations = generateAnnotations(analysisResults, drawingType);

  const filteredAnnotations = selectedCategory === 'all' 
    ? annotations 
    : annotations.filter(a => a.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'הכל', icon: Layers, color: 'bg-gray-600' },
    { id: 'positive', name: '😊 חיובי', icon: CheckCircle, color: 'bg-green-600' },
    { id: 'concern', name: '💭 מעניין', icon: AlertTriangle, color: 'bg-orange-600' },
    { id: 'anxiety', name: '⚠️ לשים לב', icon: AlertTriangle, color: 'bg-red-600' }
  ];

  return (
    <div className="space-y-4">
      <Card className="bg-gray-900/80 border-purple-700/30">
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-white text-3xl mb-2">
              🔍 הציור שלך עם הסברים
            </CardTitle>
            <p className="text-purple-200 text-lg">
              העבר עכבר על נקודה צבעונית כדי להבין מה מצאנו
            </p>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Simple Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                size="lg"
                variant={selectedCategory === cat.id ? "default" : "outline"}
                className={`${selectedCategory === cat.id ? cat.color : ''} text-lg`}
              >
                {cat.name}
                {cat.id !== 'all' && (
                  <Badge className="mr-2 bg-white/30 text-lg">
                    {annotations.filter(a => a.category === cat.id).length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-3">
            <Button
              onClick={() => setShowAnnotations(!showAnnotations)}
              size="lg"
              variant={showAnnotations ? "default" : "outline"}
              className={`${showAnnotations ? 'bg-purple-600' : ''} text-lg`}
            >
              {showAnnotations ? <Eye className="w-5 h-5 ml-1" /> : <EyeOff className="w-5 h-5 ml-1" />}
              {showAnnotations ? 'הסתר הסברים' : 'הצג הסברים'}
            </Button>
            <Button
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              size="lg"
              variant="outline"
              className="text-lg"
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button
              onClick={() => setZoom(Math.min(3, zoom + 0.25))}
              size="lg"
              variant="outline"
              className="text-lg"
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
          </div>

          {/* Drawing with Annotations */}
          <div className="relative bg-white rounded-2xl overflow-hidden">
            <div 
              className="relative inline-block w-full"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                transition: 'transform 0.3s ease'
              }}
            >
              <img
                src={imageUrl}
                alt="הציור שלך"
                className="w-full h-auto"
                style={{ maxHeight: '600px', objectFit: 'contain' }}
              />

              {/* Annotations Overlay */}
              {showAnnotations && (
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 10 }}
                >
                  {filteredAnnotations.map((annotation, idx) => (
                    <g key={idx}>
                      {annotation.type === 'circle' && (
                        <>
                          <circle
                            cx={`${annotation.x}%`}
                            cy={`${annotation.y}%`}
                            r={annotation.radius || '5%'}
                            fill={annotation.color}
                            opacity="0.3"
                            className="pointer-events-auto cursor-pointer hover:opacity-50 transition-opacity"
                            onClick={() => setActiveAnnotation(annotation)}
                          />
                          <circle
                            cx={`${annotation.x}%`}
                            cy={`${annotation.y}%`}
                            r={annotation.radius || '5%'}
                            fill="none"
                            stroke={annotation.color}
                            strokeWidth="4"
                            opacity="0.9"
                            strokeDasharray="8,8"
                            className="pointer-events-none"
                          >
                            <animate
                              attributeName="r"
                              values={`${annotation.radius || 5}%;${(annotation.radius || 5) + 2}%;${annotation.radius || 5}%`}
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        </>
                      )}

                      {annotation.type === 'rectangle' && (
                        <rect
                          x={`${annotation.x}%`}
                          y={`${annotation.y}%`}
                          width={`${annotation.width}%`}
                          height={`${annotation.height}%`}
                          fill={annotation.color}
                          opacity="0.3"
                          stroke={annotation.color}
                          strokeWidth="4"
                          strokeDasharray="8,8"
                          className="pointer-events-auto cursor-pointer hover:opacity-50 transition-opacity"
                          onClick={() => setActiveAnnotation(annotation)}
                        />
                      )}

                      {annotation.type === 'arrow' && (
                        <>
                          <defs>
                            <marker
                              id={`arrow-${idx}`}
                              markerWidth="12"
                              markerHeight="12"
                              refX="10"
                              refY="6"
                              orient="auto"
                            >
                              <path d="M2,2 L2,10 L10,6 z" fill={annotation.color} />
                            </marker>
                          </defs>
                          <line
                            x1={`${annotation.x1}%`}
                            y1={`${annotation.y1}%`}
                            x2={`${annotation.x2}%`}
                            y2={`${annotation.y2}%`}
                            stroke={annotation.color}
                            strokeWidth="4"
                            markerEnd={`url(#arrow-${idx})`}
                            opacity="0.9"
                            className="pointer-events-auto cursor-pointer hover:opacity-100"
                            onClick={() => setActiveAnnotation(annotation)}
                          />
                        </>
                      )}

                      {/* Label */}
                      {annotation.label && (
                        <text
                          x={`${annotation.labelX || annotation.x}%`}
                          y={`${annotation.labelY || annotation.y - 8}%`}
                          fill="white"
                          fontSize="18"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="pointer-events-none"
                          style={{ 
                            filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.9))',
                            stroke: annotation.color,
                            strokeWidth: '1px',
                            paintOrder: 'stroke'
                          }}
                        >
                          {annotation.label}
                        </text>
                      )}
                    </g>
                  ))}
                </svg>
              )}
            </div>

            {/* Zoom indicator */}
            <div className="absolute bottom-4 left-4 bg-black/80 text-white px-4 py-2 rounded-xl text-lg font-bold">
              {Math.round(zoom * 100)}%
            </div>
          </div>

          {/* Simple Explanation of Active Annotation */}
          <AnimatePresence>
            {activeAnnotation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 border-0"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-white text-2xl font-bold flex-1">
                    {activeAnnotation.title}
                  </h3>
                  <Button
                    onClick={() => setActiveAnnotation(null)}
                    variant="ghost"
                    className="text-white text-xl"
                  >
                    ✕
                  </Button>
                </div>

                <div className="space-y-4">
                  <p className="text-white text-xl leading-relaxed">
                    {activeAnnotation.detailedExplanation || activeAnnotation.description}
                  </p>

                  {activeAnnotation.psychologicalMeaning && (
                    <div className="bg-white/10 rounded-xl p-4">
                      <p className="text-white text-lg">
                        <strong>💭 מה זה אומר:</strong> {activeAnnotation.psychologicalMeaning}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List of All Findings (Simplified) */}
          {showAnnotations && filteredAnnotations.length > 0 && (
            <div>
              <h4 className="text-white font-bold text-2xl mb-4 text-center">
                מה מצאנו בציור ({filteredAnnotations.length})
              </h4>
              <div className="grid md:grid-cols-2 gap-3">
                {filteredAnnotations.map((annotation, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`p-4 rounded-xl cursor-pointer transition-all ${
                      activeAnnotation === annotation 
                        ? 'bg-purple-600 scale-105' 
                        : 'bg-gray-800/70 hover:bg-gray-700/70'
                    }`}
                    onClick={() => setActiveAnnotation(annotation)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-5 h-5 rounded-full shrink-0"
                        style={{ backgroundColor: annotation.color }}
                      />
                      <span className="text-white font-semibold text-lg flex-1">
                        {annotation.title}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setShowFullscreen(false)}
          >
            <div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <img
                src={imageUrl}
                alt="הציור שלך"
                className="max-w-full max-h-full object-contain"
              />
              <Button
                onClick={() => setShowFullscreen(false)}
                size="lg"
                className="absolute top-4 left-4 bg-red-600 hover:bg-red-700 text-xl"
              >
                ✕ סגור
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * GENERATE ANNOTATIONS FROM ANALYSIS
 * יוצר הדגשות ויזואליות על בסיס תוצאות הניתוח
 */
function generateAnnotations(analysisResults, drawingType) {
  if (!analysisResults) return [];

  const annotations = [];
  const gf = analysisResults.graphic_features || {};
  const content = analysisResults.content_analysis || {};
  const koppitz = analysisResults.koppitz_indicators || {};

  // === SIZE ANNOTATIONS ===
  if (gf.size_analysis) {
    const size = gf.size_analysis.overall_size;
    if (size === 'very_small' || size === 'small') {
      annotations.push({
        type: 'rectangle',
        x: 35,
        y: 35,
        width: 30,
        height: 40,
        color: '#FFA500',
        category: 'concern',
        title: 'גודל קטן',
        label: '📏 קטן',
        labelX: 50,
        labelY: 30,
        description: 'הציור קטן יחסית - עשוי להעיד על ביטחון עצמי נמוך או ביישנות',
        evidence: gf.size_analysis.interpretation,
        psychologicalMeaning: 'הקטנה עצמית, תחושת "אני קטן בעולם גדול"',
        sources: 'Machover (1949), Koppitz (1968)'
      });
    } else if (size === 'very_large') {
      annotations.push({
        type: 'rectangle',
        x: 10,
        y: 10,
        width: 80,
        height: 80,
        color: '#FF6600',
        category: 'concern',
        title: 'גודל גדול מאוד',
        label: '📏 גדול',
        description: 'הציור גדול מאוד - עשוי להעיד על גרנדיוזיות או פיצוי על נחיתות פנימית',
        evidence: gf.size_analysis.interpretation,
        sources: 'Machover (1949)'
      });
    }
  }

  // === PLACEMENT ANNOTATIONS ===
  if (gf.placement_analysis) {
    const vPos = gf.placement_analysis.vertical_position;
    const hPos = gf.placement_analysis.horizontal_position;

    if (vPos === 'top') {
      annotations.push({
        type: 'arrow',
        x1: 50,
        y1: 15,
        x2: 50,
        y2: 5,
        color: '#00BFFF',
        category: 'concern',
        title: 'מיקום גבוה',
        description: 'הציור גבוה בדף - שאפתנות, אידיאליזם, או נטייה לפנטזיה',
        evidence: gf.placement_analysis.interpretation,
        psychologicalMeaning: 'שאיפה להישגים גבוהים, אולי ניתוק מהמציאות',
        sources: 'Hammer (1958)'
      });
    } else if (vPos === 'bottom') {
      annotations.push({
        type: 'arrow',
        x1: 50,
        y1: 85,
        x2: 50,
        y2: 95,
        color: '#8B4513',
        category: 'concern',
        title: 'מיקום נמוך',
        description: 'הציור נמוך בדף - עשוי להעיד על דיכאון, פסימיות או חוסר ביטחון',
        evidence: gf.placement_analysis.interpretation,
        psychologicalMeaning: 'תחושת "למטה", מדוכא, קרוב לקרקע',
        sources: 'Machover (1949), Hammer (1958)'
      });
    }

    if (hPos === 'far_left') {
      annotations.push({
        type: 'arrow',
        x1: 15,
        y1: 50,
        x2: 5,
        y2: 50,
        color: '#9370DB',
        category: 'concern',
        title: 'שמאל - עבר',
        description: 'ציור בצד שמאל - עיסוק בעבר, רגרסיה או תלות',
        evidence: gf.placement_analysis.interpretation,
        sources: 'Jolles (1952)'
      });
    } else if (hPos === 'far_right') {
      annotations.push({
        type: 'arrow',
        x1: 85,
        y1: 50,
        x2: 95,
        y2: 50,
        color: '#32CD32',
        category: 'positive',
        title: 'ימין - עתיד',
        description: 'ציור בצד ימין - פניה אל העתיד, אופטימיות',
        evidence: gf.placement_analysis.interpretation,
        sources: 'Jolles (1952)'
      });
    }
  }

  // === SHADING ANNOTATIONS (ANXIETY!) ===
  if (gf.shading && gf.shading.shading_present) {
    const areas = gf.shading.shading_areas || [];
    
    areas.forEach((area, idx) => {
      let position = { x: 50, y: 50 };
      
      // Approximate positions based on area name
      if (area.includes('פנים') || area.includes('face')) {
        position = { x: 50, y: 20 };
      } else if (area.includes('גוף') || area.includes('body')) {
        position = { x: 50, y: 50 };
      } else if (area.includes('ידיים') || area.includes('hands')) {
        position = { x: 35, y: 55 };
      }

      annotations.push({
        type: 'circle',
        x: position.x,
        y: position.y,
        radius: 8,
        color: '#FF0000',
        category: 'anxiety',
        title: `הצללה ב${area}`,
        label: '🌑',
        description: `הצללה באזור ${area} - סימן מובהק לחרדה!`,
        evidence: `זוהתה הצללה ברמת ${gf.shading.shading_intensity}`,
        psychologicalMeaning: `חרדה ספציפית לגבי ${area}. ההצללה היא ניסיון לא-מודע "לכסות" את האזור המדאיג`,
        sources: 'Hammer (1958), Machover (1949) - Shading = Anxiety',
        detailedExplanation: gf.shading.interpretation
      });
    });
  }

  // === OMISSIONS (PERSON) ===
  if (drawingType === 'person' && content.person_analysis) {
    const omitted = content.person_analysis.body_parts_omitted || [];
    
    omitted.forEach((part, idx) => {
      let position = { x: 50, y: 50 };
      let label = '❌';
      
      if (part.includes('ידיים') || part.includes('hands')) {
        position = { x: 30, y: 55 };
        label = '🫱❌';
      } else if (part.includes('רגליים') || part.includes('feet') || part.includes('legs')) {
        position = { x: 50, y: 85 };
        label = '🦵❌';
      } else if (part.includes('עיניים') || part.includes('eyes')) {
        position = { x: 50, y: 18 };
        label = '👁️❌';
      } else if (part.includes('פה') || part.includes('mouth')) {
        position = { x: 50, y: 23 };
        label = '👄❌';
      }

      annotations.push({
        type: 'circle',
        x: position.x,
        y: position.y,
        radius: 7,
        color: '#DC143C',
        category: 'anxiety',
        title: `השמטה: ${part}`,
        label: label,
        description: `חסר ${part} - השמטה משמעותית!`,
        evidence: `${part} לא מופיע בציור`,
        psychologicalMeaning: getOmissionMeaning(part),
        sources: 'Koppitz (1968) - Emotional Indicator',
        detailedExplanation: `השמטת ${part} היא אחד מ-30 האינדיקטורים הרגשיים של קופיץ. זה מעיד על קונפליקט או חרדה באזור זה.`
      });
    });
  }

  // === KOPPITZ INDICATORS ===
  if (koppitz.indicators_found && koppitz.indicators_found.length > 0) {
    // Add general Koppitz marker
    annotations.push({
      type: 'circle',
      x: 90,
      y: 10,
      radius: 5,
      color: '#FFD700',
      category: 'concern',
      title: `${koppitz.total_indicators} אינדיקטורים של Koppitz`,
      label: '🔬',
      labelX: 90,
      labelY: 8,
      description: `זוהו ${koppitz.total_indicators} אינדיקטורים רגשיים מתוך 30`,
      evidence: koppitz.indicators_found.map(i => i.indicator_name).join(', '),
      psychologicalMeaning: koppitz.interpretation,
      sources: 'Koppitz (1968)',
      detailedExplanation: `רמת מצוקה: ${koppitz.emotional_disturbance_risk}. ${koppitz.interpretation}`
    });
  }

  // === HOUSE SPECIFIC ===
  if (drawingType === 'house' && content.house_analysis) {
    const house = content.house_analysis;

    if (!house.has_windows) {
      annotations.push({
        type: 'rectangle',
        x: 40,
        y: 40,
        width: 20,
        height: 15,
        color: '#FF4500',
        category: 'anxiety',
        title: 'אין חלונות',
        label: '🪟❌',
        description: 'הבית ללא חלונות - בידוד חברתי, התנתקות',
        evidence: 'לא זוהו חלונות בציור הבית',
        psychologicalMeaning: 'קושי בקשר עם העולם החיצון, סגירות',
        sources: 'Guo et al. (2023) - מנבא הפרעות חשיבה',
        detailedExplanation: house.interpretation
      });
    }

    if (!house.has_door) {
      annotations.push({
        type: 'rectangle',
        x: 45,
        y: 60,
        width: 10,
        height: 20,
        color: '#FF4500',
        category: 'anxiety',
        title: 'אין דלת',
        label: '🚪❌',
        description: 'הבית ללא דלת - קושי בנגישות, פחד מקשר',
        psychologicalMeaning: 'חוסר נגישות רגשית, קושי להיכנס ולצאת מיחסים',
        sources: 'Buck (1948), Hammer (1958)'
      });
    }

    if (!house.has_chimney) {
      annotations.push({
        type: 'rectangle',
        x: 65,
        y: 15,
        width: 8,
        height: 12,
        color: '#FFA500',
        category: 'concern',
        title: 'אין ארובה',
        label: '🏭❌',
        description: 'אין ארובה - עשוי להעיד על חוסר חום רגשי במשפחה',
        psychologicalMeaning: 'תפיסת המשפחה כקרה, חסרת חום',
        sources: 'Buck (1948)'
      });
    }
  }

  // === TREE SPECIFIC ===
  if (drawingType === 'tree' && content.tree_analysis) {
    const tree = content.tree_analysis;

    if (!tree.has_roots) {
      annotations.push({
        type: 'arrow',
        x1: 50,
        y1: 90,
        x2: 50,
        y2: 98,
        color: '#8B4513',
        category: 'concern',
        title: 'אין שורשים',
        description: 'העץ ללא שורשים - חוסר שייכות, ניתוק מהמקור',
        psychologicalMeaning: 'תחושת "אין לי שורשים", חוסר יציבות רגשית',
        sources: 'Koch (1952)',
        detailedExplanation: tree.interpretation
      });
    }

    if (tree.tree_vitality === 'dead' || tree.tree_vitality === 'dying') {
      annotations.push({
        type: 'circle',
        x: 50,
        y: 30,
        radius: 15,
        color: '#8B0000',
        category: 'anxiety',
        title: 'עץ מת/גווע',
        label: '🍂',
        description: 'העץ נראה מת או גווע - סימן לדיכאון או חוסר חיוניות',
        evidence: `עץ בסטטוס: ${tree.tree_vitality}`,
        psychologicalMeaning: 'תחושת "מוות פנימי", אובדן חיוניות, דיכאון',
        sources: 'Guo et al. (2023) - מנבא דיכאון',
        detailedExplanation: tree.interpretation
      });
    }

    if (tree.branch_characteristics && tree.branch_characteristics.includes('חד')) {
      annotations.push({
        type: 'circle',
        x: 65,
        y: 40,
        radius: 8,
        color: '#FF0000',
        category: 'anxiety',
        title: 'ענפים חדים',
        label: '🌿⚠️',
        description: 'ענפים חדים/קוצניים - סימן לתוקפנות או עוינות',
        evidence: tree.branch_characteristics,
        psychologicalMeaning: 'הגנתיות, עוינות - "אל תתקרב"',
        sources: 'Guo et al. (2023) - מאפיין מנבא תוקפנות'
      });
    }
  }

  // === LINE PRESSURE ===
  if (gf.line_pressure) {
    const pressure = gf.line_pressure.pressure_level;
    
    if (pressure === 'very_heavy') {
      annotations.push({
        type: 'circle',
        x: 20,
        y: 50,
        radius: 10,
        color: '#B22222',
        category: 'concern',
        title: 'לחץ כבד מאוד',
        label: '✏️⚡',
        labelX: 20,
        labelY: 45,
        description: 'לחץ קו כבד מאוד - אנרגיה גבוהה, מתח, אפשרית תוקפנות',
        evidence: gf.line_pressure.interpretation,
        psychologicalMeaning: 'מתח פנימי, אנרגיה עודפת, או כעס מודחק',
        sources: 'Machover (1949), Hammer (1958)'
      });
    } else if (pressure === 'very_light') {
      annotations.push({
        type: 'circle',
        x: 80,
        y: 50,
        radius: 10,
        color: '#4682B4',
        category: 'concern',
        title: 'לחץ קל מאוד',
        label: '✏️💤',
        description: 'לחץ קו קל מאוד - אנרגיה נמוכה, עשוי להעיד על דיכאון',
        evidence: gf.line_pressure.interpretation,
        psychologicalMeaning: 'עייפות, חוסר אנרגיה, אולי דיכאון',
        sources: 'Machover (1949)'
      });
    }
  }

  // === TREMULOUS LINES ===
  if (gf.line_quality && gf.line_quality.tremor_present) {
    annotations.push({
      type: 'circle',
      x: 70,
      y: 60,
      radius: 12,
      color: '#FF6347',
      category: 'anxiety',
      title: 'קווים רועדים',
      label: '〰️',
      description: 'קווים רועדים - סימן ברור לחרדה, פחד או מתח',
      evidence: gf.line_quality.interpretation,
      psychologicalMeaning: 'חרדה פנימית, פחד, חוסר ביטחון עמוק',
      sources: 'Koppitz (1968) - Emotional Indicator #8',
      detailedExplanation: 'קווים רועדים הם אחד מ-30 האינדיקטורים של קופיץ. הם מעידים על מתח נפשי, חרדה או פחד.'
    });
  }

  // === ERASURES ===
  if (gf.erasures_corrections) {
    const count = gf.erasures_corrections.erasure_count;
    if (count === 'many' || count === 'excessive') {
      annotations.push({
        type: 'circle',
        x: 15,
        y: 15,
        radius: 6,
        color: '#FF8C00',
        category: 'concern',
        title: 'מחיקות רבות',
        label: '🧹',
        labelX: 15,
        labelY: 12,
        description: `${count === 'excessive' ? 'מחיקות מוגזמות' : 'מחיקות רבות'} - חרדה, פרפקציוניזם`,
        evidence: gf.erasures_corrections.interpretation,
        psychologicalMeaning: 'חוסר שביעות רצון, צורך ב"מושלם", חרדה מטעויות',
        sources: 'Koppitz (1968)',
        detailedExplanation: `אזורים שנמחקו: ${(gf.erasures_corrections.areas_erased || []).join(', ')}`
      });
    }
  }

  // === POSITIVE ANNOTATIONS ===
  if (gf.detail_level && (gf.detail_level.detail_amount === 'rich' || gf.detail_level.detail_amount === 'adequate')) {
    annotations.push({
      type: 'circle',
      x: 85,
      y: 15,
      radius: 6,
      color: '#32CD32',
      category: 'positive',
      title: 'רמת פירוט טובה',
      label: '✓',
      labelX: 85,
      labelY: 12,
      description: 'רמת פירוט עשירה - יצירתיות, תשומת לב, עשירות פנימית',
      evidence: gf.detail_level.interpretation,
      psychologicalMeaning: 'עולם פנימי עשיר, דמיון, יכולת תפיסה טובה',
      sources: 'Machover (1949)'
    });
  }

  return annotations;
}

/**
 * GET OMISSION MEANING
 */
function getOmissionMeaning(part) {
  const meanings = {
    'ידיים': 'חוסר אונים, תחושת "אני לא יכול לעשות דברים", בעיה חברתית',
    'hands': 'חוסר אונים, תחושת "אני לא יכול לעשות דברים", בעיה חברתית',
    'רגליים': 'חוסר יציבות, תלותיות, חוסר ביטחון בעתיד',
    'legs': 'חוסר יציבות, תלותיות, חוסר ביטחון בעתיד',
    'feet': 'חוסר יציבות, תלותיות',
    'עיניים': 'הימנעות מראייה, הכחשה, "אני לא רוצה לראות"',
    'eyes': 'הימנעות מראייה, הכחשה',
    'פה': 'קושי בתקשורת, דיכוי ביטוי, "אי אפשר להגיד"',
    'mouth': 'קושי בתקשורת, דיכוי ביטוי',
    'אף': 'ביישנות קיצונית, חוסר אונים',
    'nose': 'ביישנות קיצונית',
    'צוואר': 'הפרדה בין חשיבה (ראש) לרגש (גוף)',
    'neck': 'הפרדה בין חשיבה לרגש'
  };

  for (const [key, meaning] of Object.entries(meanings)) {
    if (part.includes(key)) return meaning;
  }

  return 'קונפליקט או חרדה באזור זה';
}
