
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * KOPPITZ INDICATORS VISUALIZATION
 * תצוגה ויזואלית של 30 האינדיקטורים הרגשיים
 */

const KOPPITZ_GROUPS = {
  omissions: {
    name: 'קבוצה A - השמטות',
    emoji: '❌',
    color: 'from-red-600 to-pink-600',
    description: 'חלקי גוף חיוניים שחסרים',
    maxIndicators: 7
  },
  line_quality: {
    name: 'קבוצה B - איכות קו',
    emoji: '〰️',
    color: 'from-orange-600 to-amber-600',
    description: 'בעיות באיכות הקווים',
    maxIndicators: 3
  },
  special: {
    name: 'קבוצה C - מאפיינים מיוחדים',
    emoji: '⚡',
    color: 'from-yellow-600 to-orange-600',
    description: 'סימנים פסיכולוגיים מיוחדים',
    maxIndicators: 20
  }
};

const RISK_LEVELS = {
  low: {
    color: 'bg-green-600',
    text: 'נמוכה',
    emoji: '✅',
    description: '0-1 אינדיקטורים - תקין'
  },
  moderate: {
    color: 'bg-yellow-600',
    text: 'בינונית',
    emoji: '⚠️',
    description: '2-3 אינדיקטורים - מצוקה אפשרית'
  },
  high: {
    color: 'bg-orange-600',
    text: 'גבוהה',
    emoji: '⚠️⚠️',
    description: '4-5 אינדיקטורים - מצוקה משמעותית'
  },
  very_high: {
    color: 'bg-red-600',
    text: 'גבוהה מאוד',
    emoji: '🚨',
    description: '6+ אינדיקטורים - מצוקה חמורה'
  }
};

export default function KoppitzIndicatorsVisualization({ koppitzData }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!koppitzData || koppitzData.total_indicators === 0) {
    return (
      <Card className="bg-gradient-to-r from-green-600 to-emerald-600 border-0">
        <CardContent className="p-8 text-center">
          <div className="text-7xl mb-4">✅</div>
          <h3 className="text-white text-3xl font-bold mb-3">
            נהדר! הכל נראה טוב
          </h3>
          <p className="text-white text-xl leading-relaxed">
            לא מצאנו סימני מתח או דאגה מיוחדים בציור שלך
          </p>
        </CardContent>
      </Card>
    );
  }

  const { total_indicators, emotional_disturbance_risk } = koppitzData;
  const riskLevel = RISK_LEVELS[emotional_disturbance_risk] || RISK_LEVELS.moderate;

  // Determine friendly message
  let friendlyMessage = '';
  let friendlyTitle = '';

  if (emotional_disturbance_risk === 'low') {
    friendlyTitle = 'הכל בסדר';
    friendlyMessage = 'יש כמה דברים קטנים לשים לב אליהם, אבל בסך הכל אתה במצב טוב 😊';
  } else if (emotional_disturbance_risk === 'moderate') {
    friendlyTitle = 'יש כמה דברים לשים לב';
    friendlyMessage = 'ראינו כמה סימנים שאולי יש לך קצת מתח או דאגות. זה לגמרי תקין, ואפשר לעבוד על זה 💪';
  } else if (emotional_disturbance_risk === 'high') {
    friendlyTitle = 'כדאי לשים לב';
    friendlyMessage = 'נראה שיש לך כמה דברים שמעסיקים אותך. אל תדאג - זיהוי זה הצעד הראשון לשיפור! 🌱';
  } else {
    friendlyTitle = 'חשוב לשים לב';
    friendlyMessage = 'הציור שלך מראה שיש לך כמה דברים שמטרידים אותך. זה חשוב לדעת, ומומלץ לדבר עם מישהו שיכול לעזור 🤝';
  }

  return (
    <div className="space-y-4">
      {/* Main Friendly Card */}
      <Card className={`border-0 ${
        emotional_disturbance_risk === 'low' ? 'bg-gradient-to-r from-green-600 to-emerald-600' :
        emotional_disturbance_risk === 'moderate' ? 'bg-gradient-to-r from-yellow-600 to-orange-600' :
        emotional_disturbance_risk === 'high' ? 'bg-gradient-to-r from-orange-600 to-red-600' :
        'bg-gradient-to-r from-red-600 to-pink-600'
      }`}>
        <CardContent className="p-8">
          <div className="text-center mb-6">
            <div className="text-7xl mb-4">{riskLevel.emoji}</div>
            <h3 className="text-white text-3xl font-bold mb-3">{friendlyTitle}</h3>
            <p className="text-white text-xl leading-relaxed max-w-2xl mx-auto">
              {friendlyMessage}
            </p>
          </div>

          {total_indicators > 0 && (
            <div className="bg-white/10 rounded-2xl p-6 text-center">
              <p className="text-white text-lg mb-2">
                מצאנו <strong className="text-2xl">{total_indicators}</strong> סימנים בציור
              </p>
              <Button
                onClick={() => setShowDetails(!showDetails)}
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/20 text-lg mt-4"
              >
                {showDetails ? 'הסתר פירוט' : 'הצג פירוט מקצועי'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Details (Collapsed by Default) */}
      <AnimatePresence>
        {showDetails && koppitzData.indicators_found && koppitzData.indicators_found.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="bg-gray-900/80 border-purple-700/30 mt-4"> {/* Added mt-4 for spacing */}
              <CardHeader>
                <CardTitle className="text-white text-2xl text-center">
                  📋 הסימנים שמצאנו (פירוט מקצועי)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {koppitzData.indicators_found.map((indicator, idx) => (
                  <div key={idx} className="bg-gray-800/50 rounded-xl p-4">
                    <h4 className="text-white font-semibold text-lg mb-2">
                      {idx + 1}. {indicator.indicator_name}
                    </h4>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {indicator.description}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Research Note */}
            <Card className="bg-blue-900/30 border-blue-700/50 mt-4"> {/* Added mt-4 for spacing */}
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <Info className="w-6 h-6 text-blue-300 shrink-0 mt-1" />
                  <p className="text-blue-100 text-base leading-relaxed">
                    <strong>למה זה מדויק?</strong> הניתוח מבוסס על מחקר מדעי של ד"ר אליזבת קופיץ (1968)
                    שנבדק על מאות ילדים ומצא קשרים ברורים בין הסימנים הללו למצב רגשי.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
