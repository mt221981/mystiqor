import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Hash, Sparkles, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * NUMEROLOGY SUMMARY CARD
 * כרטיס המציג את מספרי הליבה הנומרולוגיים של המשתמש
 * + השנה האישית הנוכחית
 */

export default function NumerologySummaryCard({ numerologyAnalysis }) {
  if (!numerologyAnalysis) {
    return (
      <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 border-purple-700/30">
        <CardContent className="p-8 text-center">
          <Hash className="w-16 h-16 text-purple-300 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">הניתוח הנומרולוגי שלך</h3>
          <p className="text-purple-200 mb-4">
            עוד לא ביצעת ניתוח נומרולוגי
          </p>
          <Link to={createPageUrl('Numerology')}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4 ml-2" />
              בוא נתחיל
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const calculation = numerologyAnalysis.results?.calculation;
  
  if (!calculation) {
    return null;
  }

  const coreNumbers = [
    {
      number: calculation.life_path?.number,
      title: "מסלול חיים",
      subtitle: "הדרך שלך בחיים",
      gradient: "from-purple-600 to-purple-800",
      icon: "🛤️"
    },
    {
      number: calculation.destiny?.number,
      title: "גורל",
      subtitle: "מה אתה כאן לבטא",
      gradient: "from-pink-600 to-pink-800",
      icon: "⭐"
    },
    {
      number: calculation.soul?.number,
      title: "דחף נשמה",
      subtitle: "מה הנשמה רוצה",
      gradient: "from-indigo-600 to-indigo-800",
      icon: "💫"
    },
    {
      number: calculation.personality?.number,
      title: "אישיות",
      subtitle: "איך אחרים רואים",
      gradient: "from-blue-600 to-blue-800",
      icon: "👤"
    }
  ].filter(n => n.number !== undefined);

  const personalYear = calculation.personal_year?.number;
  const currentYear = new Date().getFullYear();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Card className="bg-gradient-to-br from-purple-900/60 to-pink-900/60 backdrop-blur-xl border-2 border-purple-600/50 shadow-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white text-2xl flex items-center gap-3">
              <Hash className="w-8 h-8 text-purple-400" />
              המספרים שלך
            </CardTitle>
            <Link to={createPageUrl('Numerology')}>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-purple-300 hover:text-white hover:bg-purple-800/30"
              >
                ראה מלא →
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Core Numbers Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {coreNumbers.map((item, idx) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-gradient-to-br ${item.gradient} rounded-xl p-4 text-center hover:scale-105 transition-transform cursor-pointer`}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                  {item.number}
                </div>
                <div className="text-white font-semibold text-sm mb-1">
                  {item.title}
                </div>
                <div className="text-white/70 text-xs">
                  {item.subtitle}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Personal Year Section */}
          {personalYear && (
            <div className="bg-gradient-to-r from-green-900/50 to-teal-900/50 rounded-xl p-6 border-2 border-green-600/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">השנה האישית שלך</h3>
                    <p className="text-green-200 text-sm">שנת {currentYear}</p>
                  </div>
                </div>
                <div className="text-5xl font-bold text-white">
                  {personalYear}
                </div>
              </div>

              <div className="bg-green-800/30 rounded-lg p-4">
                <p className="text-green-100 font-semibold mb-2">
                  {getPersonalYearTheme(personalYear)}
                </p>
                <p className="text-green-200 text-sm leading-relaxed">
                  {getPersonalYearDescription(personalYear)}
                </p>
              </div>
            </div>
          )}

          {/* Quick Insight */}
          {numerologyAnalysis.results?.interpretation?.summary && (
            <div className="bg-purple-800/30 rounded-lg p-4 border border-purple-600/50">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400 shrink-0 mt-1" />
                <div>
                  <p className="text-purple-200 text-sm leading-relaxed line-clamp-3">
                    {numerologyAnalysis.results.interpretation.summary}
                  </p>
                  <Link to={createPageUrl('Numerology')}>
                    <button className="text-purple-300 hover:text-purple-100 text-xs mt-2 underline">
                      קרא עוד
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Analysis Date */}
          <div className="text-center">
            <p className="text-purple-300 text-xs">
              ניתוח אחרון: {new Date(numerologyAnalysis.created_date).toLocaleDateString('he-IL', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Helper functions for Personal Year themes
function getPersonalYearTheme(year) {
  const themes = {
    1: "שנה של התחלות חדשות 🌱",
    2: "שנה של שיתוף פעולה ויחסים 🤝",
    3: "שנה של יצירתיות וביטוי עצמי 🎨",
    4: "שנה של יציבות ועבודה קשה 🏗️",
    5: "שנה של שינויים והרפתקאות 🌍",
    6: "שנה של אחריות ומשפחה 🏠",
    7: "שנה של הרהור והתבוננות פנימית 🧘",
    8: "שנה של הצלחה כלכלית וכוח אישי 💰",
    9: "שנה של השלמה ושחרור 🎭"
  };
  return themes[year] || `שנה אישית ${year}`;
}

function getPersonalYearDescription(year) {
  const descriptions = {
    1: "זהו זמן מצוין להתחלות חדשות, לקחת יזמות ולהוביל. השנה מזמנת אותך להיות עצמאי ולסמן כיוון חדש.",
    2: "שנה זו מדגישה שיתוף פעולה, דיפלומטיה ויחסים. הקדש זמן לבניית קשרים משמעותיים ולעבודת צוות.",
    3: "שנה של יצירתיות, תקשורת וביטוי עצמי. הגיע הזמן להביע את עצמך באמנות, כתיבה או דיבור.",
    4: "שנה של עבודה קשה, יציבות ובניית בסיסים חזקים. התמקד בארגון, משמעת ובניית מבנים ארוכי טווח.",
    5: "שנה מלאת שינויים, הרפתקאות וחופש. היה פתוח לחוויות חדשות, נסיעות ושינויים בלתי צפויים.",
    6: "שנה של אחריות, משפחה ודאגה לאחרים. התמקד בבית, במערכות יחסים ובחובות כלפי אהובים.",
    7: "שנה של הרהור פנימי, למידה וחיפוש רוחני. הקדש זמן לעצמך, ללמוד ולהתבונן פנימה.",
    8: "שנה של הצלחה מקצועית, כוח אישי והישגים כלכליים. התמקד בקריירה, עסקים ומימוש יעדים גדולים.",
    9: "שנה של השלמה, שחרור ומסירה. סיים פרויקטים ישנים, שחרר מה שלא משרת אותך והתכונן להתחלה חדשה."
  };
  return descriptions[year] || "שנה ייחודית עם אנרגיה מיוחדת משלה.";
}