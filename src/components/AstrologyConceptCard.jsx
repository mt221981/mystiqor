import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Lightbulb, BookOpen, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ASTROLOGY CONCEPT CARD
 * כרטיס להצגת מושג אסטרולוגי עם דוגמאות
 */

const CONCEPTS_LIBRARY = {
  houses: {
    title: "12 הבתים האסטרולוגיים",
    emoji: "🏠",
    color: "from-blue-600 to-cyan-600",
    brief: "הבתים מייצגים תחומי חיים שונים - מהזהות האישית ועד לרוחניות",
    detailed: `הבתים הם חלוקה של השמיים ל-12 אזורים, כל אחד אחראי על תחום חיים אחר:

**בתים אישיים (1-4):**
• בית 1 (Ascendant): האני, המסכה החיצונית, איך אחרים רואים אותך
• בית 2: כסף, ערכים, רכוש, מה חשוב לך
• בית 3: תקשורת, אחים, למידה, סביבה קרובה
• בית 4 (IC): בית, משפחה, שורשים, העבר

**בתים חברתיים (5-8):**
• בית 5: יצירתיות, רומנטיקה, ילדים, הנאה
• בית 6: עבודה, שירות, בריאות, שגרה
• בית 7 (Descendant): שותפויות, נישואין, האחר
• בית 8: טרנספורמציה, מיניות, משאבים משותפים, מוות/לידה מחדש

**בתים אוניברסליים (9-12):**
• בית 9: פילוסופיה, נסיעות רחוקות, השכלה גבוהה
• בית 10 (MC/Midheaven): קריירה, מוניטין, הישגים, ייעוד
• בית 11: חברים, קהילה, חלומות, רשתות
• בית 12: תת-מודע, רוחניות, בדידות, צורבים נסתרים`,
    examples: [
      "כוכב בבית 1: משפיע על האישיות החיצונית",
      "כוכב בבית 7: משפיע על יחסים ושותפויות",
      "כוכב בבית 10: משפיע על הקריירה"
    ]
  },
  aspects: {
    title: "אספקטים - קשרים בין כוכבים",
    emoji: "🔗",
    color: "from-purple-600 to-pink-600",
    brief: "אספקטים הם זוויות ספציפיות בין כוכבים שיוצרות קשרים אנרגטיים",
    detailed: `אספקטים הם הזוויות בין הכוכבים במפת הלידה. הם מראים איך האנרגיות של הכוכבים מדברות אחת עם השנייה.

**אספקטים מייג'ורים (Major Aspects):**

• **Conjunction (0°) - חיבור ☌**
  - שני כוכבים באותו מקום
  - מיזוג אנרגיות, השפעה חזקה מאוד
  - דוגמה: Sun ☌ Mercury = חשיבה וזהות מאוחדות

• **Opposition (180°) - ניגוד ☍**
  - כוכבים מנוגדים זה לזה
  - מתח דינמי, צורך באיזון
  - דוגמה: Moon ☍ Saturn = מתח בין רגשות למשמעת

• **Trine (120°) - טריגון △**
  - הרמוניה טבעית, זרימה
  - כישרונות טבעיים, קלות
  - דוגמה: Venus △ Mars = משיכה רומנטית קלה

• **Square (90°) - ריבוע □**
  - מתח יוצר, אתגר
  - דוחף לפעולה ושינוי
  - דוגמה: Mars □ Pluto = עוצמה אינטנסיבית

• **Sextile (60°) - סקסטיל ⚹**
  - הזדמנות, תמיכה עדינה
  - צריך פעולה לממש
  - דוגמה: Sun ⚹ Jupiter = הזדמנויות לצמיחה

**אספקטים מינוריים:**
• Quincunx (150°) - אי-נוחות, התאמה נדרשת
• Semi-sextile (30°) - קשר עדין`,
    examples: [
      "Venus Trine Mars: משיכה רומנטית טבעית",
      "Sun Square Saturn: אתגרים באגו ובביטחון",
      "Moon Sextile Jupiter: אופטימיות רגשית"
    ]
  },
  retrograde: {
    title: "רטרוגרד - תנועה לאחור",
    emoji: "⟲",
    color: "from-indigo-600 to-purple-600",
    brief: "כוכב רטרוגרדי נראה כאילו הוא נע לאחור (אופטית), ומביא אנרגיה פנימית",
    detailed: `כוכב רטרוגרדי הוא כוכב שנראה (מכדור הארץ) כאילו הוא נע לאחור בשמיים. זו אשליה אופטית, אבל באסטרולוגיה יש לה משמעות עמוקה.

**מה קורה כשכוכב רטרוגרדי:**

• **האנרגיה הופכת פנימה**
  - במקום להתבטא החוצה, היא עובדת בפנים
  - זמן לעיבוד, הבנה, תיקון

• **Mercury Retrograde (הכי מפורסם) ☿⟲**
  - 3-4 פעמים בשנה, ~3 שבועות כל פעם
  - תקשורת, טכנולוגיה, נסיעות - אתגרים
  - עצה: אל תחתום חוזים, אל תקנה אלקטרוניקה
  - כן לעשות: סקירה, תיקונים, חידוש קשרים ישנים

• **Venus Retrograde ♀⟲**
  - כל ~18 חודשים, ~40 יום
  - ניסיון מחדש של ערכים ויחסים
  - זמן להבין מה באמת חשוב לך באהבה

• **Mars Retrograde ♂⟲**
  - כל שנתיים, ~80 יום
  - אנרגיה נופלת, מוטיבציה פנימית
  - זמן לתכנון, לא לפעולה

• **כוכבים חיצוניים (Jupiter-Pluto)**
  - רטרוגרדיים חצי שנה בכל שנה
  - השפעה על תהליכים עמוקים וארוכי טווח

**רטרוגרד נטאלי (במפת לידה):**
אם נולדת עם כוכב רטרוגרדי - האנרגיה שלו תמיד פנימית ויותר עמוקה.`,
    examples: [
      "נולדת עם Mercury Retrograde: חשיבה עמוקה ופנימית",
      "Venus Retrograde בעבר: חזרה לאקס",
      "Mars Retrograde: עייפות, מוטיבציה נמוכה"
    ]
  },
  transits: {
    title: "מעברים (Transits)",
    emoji: "🌊",
    color: "from-teal-600 to-cyan-600",
    brief: "מעברים הם מיקומי הכוכבים הנוכחיים ביחס למפת הלידה שלך",
    detailed: `מעברים (Transits) הם אחת הטכניקות החזקות ביותר לחיזוי ותזמון באסטרולוגיה.

**מה זה מעבר:**
כוכב בשמיים **עכשיו** עושה aspect לכוכב במפת הלידה שלך (natal).

**דוגמה:**
• **Natal Sun שלך:** Aries 15° (קבוע, נשאר לנצח)
• **Transiting Jupiter עכשיו:** Aries 14°
• **→ Jupiter conjunct Sun!**
  - הזדמנות לצמיחה
  - ביטחון עצמי גבוה
  - הרחבה והצלחה

**מהירות כוכבים = משך ההשפעה:**

**Fast (ימים-שבועות):**
• Moon: 2-3 ימים
• Sun: שבוע
• Mercury/Venus/Mars: שבועיים-חודש

**Slow (חודשים-שנים):**
• Jupiter: חודש-3 חודשים
• Saturn: 3-9 חודשים (עם רטרוגרד)
• Uranus/Neptune/Pluto: שנה-3 שנים!

**שלבי מעבר:**
1. **Applying** (3-7 ימים לפני exact): האנרגיה בונה
2. **Exact** (±1°): השיא - אירועים קורים!
3. **Separating** (3-7 ימים אחרי): אינטגרציה והבנה

**רטרוגרדים = 3 גלים:**
כוכב רטרוגרדי עובר 3 פעמים על אותה נקודה:
1. Direct: אירוע ראשוני
2. Retrograde: עיבוד פנימי
3. Direct שוב: השלמה

**למה מעברים חשובים:**
הם **המפה** של מתי דברים קורים!`,
    examples: [
      "Saturn conjunct Sun: מבחן זהות, אחריות",
      "Jupiter trine Venus: הזדמנות באהבה/כסף",
      "Uranus square natal Moon: שינוי פתאומי ברגשות"
    ]
  },
  synastry: {
    title: "Synastry - ניתוח התאמה",
    emoji: "💕",
    color: "from-pink-600 to-rose-600",
    brief: "Synastry בוחן את האספקטים בין מפת הלידה שלך למפה של אדם אחר",
    detailed: `Synastry הוא אומנות ניתוח ההתאמה בין שני אנשים על ידי השוואת מפות הלידה.

**איך זה עובד:**

**שלב 1: שים מפה על מפה**
• מפת הלידה שלך
• מפת הלידה של בן/בת הזוג
• בדוק אספקטים בין הכוכבים

**שלב 2: נתח אספקטים מרכזיים**

**א. Sun-Moon aspects:**
• Sun person מאיר את Moon person
• Moon person תומך ב-Sun person
• Trine/Sextile: הרמוניה טבעית ✓
• Square/Opposition: מתח, צורך באיזון ⚠️

**ב. Venus-Mars aspects:**
• המשיכה הרומנטית/מינית!
• Conjunction/Trine: חשק חזק 🔥
• Square: משיכה עם מתח ⚡
• Sextile: משיכה משחקית ✨

**ג. Moon-Moon aspects:**
• התאימות הרגשית
• באותו אלמנט: מבינים אחד את השני ❤️
• באלמנטים לא תואמים: אתגר רגשי

**ד. Mercury-Mercury:**
• איך אתם מתקשרים
• Trine: דיבורים זורמים 💬
• Square: אי-הבנות 🤔

**ה. Saturn aspects:**
• המחויבות והיציבות
• Saturn על personal planets: רציני, יציב, אחראי
• יותר מדי Saturn: קשיחות, מרחק 🧊

**ו. Pluto aspects:**
• האינטנסיביות
• Pluto-Venus: אהבה אובססיבית 🔥
• Pluto-Mars: משיכה מגנטית
• Pluto-Moon: עומק רגשי עד כאב

**שלב 3: House Overlays**
• כוכבי אחד נופלים על בתים של השני
• דוגמה: Venus שלך בבית 7 שלו = אתה מעורר בו רצון לשותפות

**כללי אצבע:**
• 5+ aspects חיוביים: התאמה טובה
• Sun-Moon harmony: הכרח ליחסים ארוכים
• Venus-Mars: הכרח למשיכה
• Saturn: הכרח למחויבות`,
    examples: [
      "Moon Trine Venus: אמפתיה והבנה",
      "Mars Square Mars: מתחרים אחד בשני",
      "Venus Conjunct Ascendant: משיכה ממבט ראשון"
    ]
  },
  composite: {
    title: "Composite Chart - המפה המשותפת",
    emoji: "🌟",
    color: "from-yellow-600 to-amber-600",
    brief: "Composite Chart היא מפה שמייצגת את היחסים עצמם כישות נפרדת",
    detailed: `ה-Composite Chart שונה מ-Synastry!

**Synastry:** שתי מפות נפרדות ששמים אחת על השנייה
**Composite:** מפה **חדשה** שנוצרת ממיצוע המיקומים

**איך בונים Composite:**

כל כוכב = midpoint (נקודת אמצע) בין שני האנשים:

• Sun שלך: Aries 10°
• Sun שלו: Gemini 10°
• **→ Composite Sun: Taurus 10°** (נקודת האמצע)

**מה זה אומר:**

**Composite Sun:** מהות היחסים, הייעוד המשותף
• בAries: יחסים אנרגטיים, פעילים
• בCancer: יחסים מטפחים, משפחתיים
• בית 10: היחסים מכוונים להישגים משותפים

**Composite Moon:** הצרכים הרגשיים של היחסים
• בTaurus: צורך ביציבות, נוחות, חושניות
• בית 4: צורך בבית משותף, שורשים

**Composite Venus:** איך היחסים מביעים אהבה
• בGemini: דרך שיחות, שיתוף רעיונות
• בית 5: דרך כיף, יצירתיות, ילדים

**Composite Saturn:** האתגר הגדול
• בית 7: האתגר הוא המחויבות עצמה
• Square Composite Sun: קושי ליצור זהות משותפת
• Trine Composite Moon: המחויבות תומכת ברגשות

**למה Composite חשוב:**
הוא מראה **מי היחסים** - לא מי אתם בנפרד!`,
    examples: [
      "Composite Sun בית 10: זוג מכוון קריירה",
      "Composite Moon ב-Pisces: רגישות רבה",
      "Composite Saturn בית 7: יחסים רציניים"
    ]
  }
};

export default function AstrologyConceptCard({ conceptId, userChart, onAskMore }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const concept = CONCEPTS_LIBRARY[conceptId];
  if (!concept) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`bg-gradient-to-r ${concept.color} bg-opacity-20 border-2 backdrop-blur-xl`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl">{concept.emoji}</div>
              <div>
                <CardTitle className="text-white text-xl">{concept.title}</CardTitle>
                <p className="text-indigo-200 text-sm mt-1">{concept.brief}</p>
              </div>
            </div>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              variant="ghost"
              size="sm"
              className="text-white"
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
          </div>
        </CardHeader>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <CardContent className="space-y-4">
                {/* Detailed Explanation */}
                <div className="bg-white/10 rounded-lg p-4">
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    הסבר מפורט:
                  </h4>
                  <p className="text-white text-sm leading-relaxed whitespace-pre-line">
                    {concept.detailed}
                  </p>
                </div>

                {/* Examples */}
                {concept.examples && (
                  <div className="bg-purple-900/30 rounded-lg p-4">
                    <h4 className="text-purple-200 font-bold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      דוגמאות:
                    </h4>
                    <ul className="space-y-1">
                      {concept.examples.map((example, idx) => (
                        <li key={idx} className="text-purple-100 text-sm flex items-start gap-2">
                          <span className="text-purple-400">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Ask More Button */}
                {onAskMore && (
                  <Button
                    onClick={() => onAskMore(concept.title)}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    <HelpCircle className="w-4 h-4 ml-2" />
                    שאל את המורה שאלה על {concept.title}
                  </Button>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export { CONCEPTS_LIBRARY };