import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronDown, ChevronUp, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LEARNING_RESOURCES = [
  {
    category: "מחקרים מדעיים קריטיים",
    items: [
      {
        title: "Dean (1992) - The Bottom Line: Effect Size",
        description: "מטא-אנליזה מקיפה המראה תקפות כמעט אפסית של גרפולוגיה",
        type: "מדעי",
        importance: "קריטי"
      },
      {
        title: "Garoot (2021) - Automated Graphology",
        description: "מחקר דוקטורט על 1,066 דגימות עם למידת מכונה. מתאמים חלשים-בינוניים",
        type: "מחקר",
        importance: "חשוב"
      },
      {
        title: "PNAS (2022) - Forensic Handwriting",
        description: "סקירה שיטתית של FDE - החלק המדעי היחיד בגרפולוגיה",
        type: "מדעי",
        importance: "קריטי"
      }
    ]
  },
  {
    category: "תיאוריות גרפולוגיות קלאסיות",
    items: [
      {
        title: "Klages (1917) - Handschrift und Charakter",
        description: "מייסד תיאוריית Formniveau - רמת הצורה והאינטגרציה הנפשית",
        type: "תיאוריה",
        importance: "יסודי"
      },
      {
        title: "Pulver (1931) - Symbolik der Handschrift",
        description: "תיאוריית סמליות המרחב - שוליים, אזורים ומשמעויות פסיכולוגיות",
        type: "תיאוריה",
        importance: "יסודי"
      },
      {
        title: "Crépieux-Jamin (1885) - L'Écriture et le Caractère",
        description: "חלוץ הניתוח ההוליסטי (גשטאלט) - המכלול חשוב מהחלקים",
        type: "תיאוריה",
        importance: "יסודי"
      }
    ]
  },
  {
    category: "מודלים פסיכולוגיים",
    items: [
      {
        title: "Big Five (OCEAN)",
        description: "המודל המדעי המוכח לאישיות - הסטנדרט בפסיכולוגיה המודרנית",
        type: "מדעי",
        importance: "קריטי"
      },
      {
        title: "Jung - Archetypes",
        description: "ארכיטיפים יונגיאניים - דפוסים פסיכולוגיים אוניברסליים",
        type: "תיאוריה",
        importance: "רקע"
      }
    ]
  }
];

export default function GraphologyLearnMore() {
  const [expandedCategory, setExpandedCategory] = useState(null);

  return (
    <Card className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 backdrop-blur-xl border-indigo-700/30">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="w-8 h-8 text-indigo-300" />
          <h3 className="text-3xl font-bold text-white">למד עוד על גרפולוגיה</h3>
        </div>

        <div className="space-y-4">
          {LEARNING_RESOURCES.map((category, catIdx) => {
            const isExpanded = expandedCategory === catIdx;

            return (
              <div key={catIdx} className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-700/30">
                <button
                  onClick={() => setExpandedCategory(isExpanded ? null : catIdx)}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Info className="w-5 h-5 text-indigo-300" />
                    <h4 className="text-xl font-bold text-indigo-200">{category.category}</h4>
                    <Badge className="bg-indigo-700 text-white">
                      {category.items.length}
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-indigo-300" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-indigo-300" />
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-gray-700/30"
                    >
                      <div className="p-4 space-y-3">
                        {category.items.map((item, itemIdx) => (
                          <div 
                            key={itemIdx}
                            className="bg-gray-800/40 rounded-lg p-4 hover:bg-gray-800/60 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h5 className="text-white font-bold flex-1">{item.title}</h5>
                              <div className="flex gap-2">
                                <Badge className={
                                  item.type === 'מדעי' ? 'bg-green-700 text-white' :
                                  item.type === 'מחקר' ? 'bg-blue-700 text-white' :
                                  'bg-yellow-700 text-white'
                                }>
                                  {item.type}
                                </Badge>
                                {item.importance === 'קריטי' && (
                                  <Badge className="bg-red-700 text-white">
                                    קריטי
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">
                              {item.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-4">
          <p className="text-yellow-200 text-sm flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              הניתוח שלנו מבוסס על 140+ מקורות אלו ועוד. חשוב להבין את ההבדל בין תיאוריות היסטוריות לבין מחקר מדעי מוכח.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}