import React, { useState } from "react";
import { Info, BookOpen, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GRAPHOLOGY_TERMS = {
  "formniveau": {
    term: "Formniveau",
    definition: "רמת הצורה - מושג מרכזי בגרפולוגיה שפותח על ידי Ludwig Klages. מעריך את רמת האינטגרציה הנפשית והבגרות הפסיכולוגית לפי טענתו.",
    importance: "תיאורטי - לא ניתן למדידה אובייקטיבית",
    source: "Klages, Ludwig (1917)",
    link: null
  },
  "gestalt": {
    term: "Gestalt Graphology",
    definition: "גישה הוליסטית לניתוח כתב יד שמסתכלת על המכלול ולא רק על מאפיינים בודדים. מחפשת דפוסים ויחסים בין מאפיינים שונים.",
    importance: "מתודולוגיה מקצועית מבוססת Crépieux-Jamin",
    source: "Crépieux-Jamin (1885)",
    link: null
  },
  "fde": {
    term: "FDE (Forensic Document Examination)",
    definition: "בדיקה פורנזית של מסמכים - התחום המדעי היחיד בגרפולוגיה. משמש לזיהוי זיופים ואימות חתימות.",
    importance: "מדעי - דיוק 95%+",
    source: "PNAS 2022, SWGDOC Standards",
    link: null
  },
  "garoot": {
    term: "מחקר Garoot (2021)",
    definition: "מחקר דוקטורט שבדק מתאמים בין כתב יד לבין Big Five באמצעות למידת מכונה על 1,066 דגימות. מצא מתאמים חלשים-בינוניים.",
    importance: "מחקר אקדמי - מתאמים חלשים מדי לחיזוי אמין",
    source: "Garoot, A. (2021) - Concordia University",
    link: null
  },
  "big_five": {
    term: "Big Five (OCEAN)",
    definition: "מודל פסיכולוגי מדעי מוכר המודד אישיות בחמישה ממדים: פתיחות, מצפוניות, מוחצנות, נעימות, ויציבות רגשית.",
    importance: "מודל מדעי מוכח - הסטנדרט בפסיכולוגיה",
    source: "NEO-PI-R, McCrae & Costa",
    link: null
  },
  "slant": {
    term: "Slant (זווית נטייה)",
    definition: "הזווית של האותיות ביחס לאנכי. נמדדת במעלות. לפי תיאוריות גרפולוגיות, משקפת ביטוי רגשי ומוחצנות.",
    importance: "מתאם חלש עם Extraversion (ρ≈0.15) ו-Agreeableness (ρ≈0.4)",
    source: "Saudek, Garoot 2021",
    link: null
  },
  "pressure": {
    term: "Pressure (לחץ כתיבה)",
    definition: "עוצמת הלחץ על הנייר. נמדד לפי עובי הקו ועומק החריצה. לפי תיאוריות, משקף אנרגיה רגשית וחיוניות.",
    importance: "מתאם חלש עם Extraversion (ρ≈0.15)",
    source: "Pulver, Garoot 2021",
    link: null
  },
  "baseline": {
    term: "Baseline (קו בסיס)",
    definition: "קו דמיוני המחבר את תחתית האותיות. יכול להיות עולה, יורד, ישר או גלי. לפי תיאוריות, משקף מצב רוח ויציבות.",
    importance: "מתאם חלש מאוד עם Emotional Stability (ρ≈0.1)",
    source: "Roman, Garoot 2021",
    link: null
  },
  "connectivity": {
    term: "Connectivity (קישוריות)",
    definition: "מידת החיבור בין אותיות במילה. גבוה = אותיות מחוברות, נמוך = אותיות מנותקות. לפי תיאוריות, משקף לוגיקה מול אינטואיציה.",
    importance: "קשור ל-Conscientiousness",
    source: "Klages, Garoot 2021",
    link: null
  },
  "zones": {
    term: "Zones (אזורים)",
    definition: "שלושה אזורים באות: עליון (רוחניות), אמצעי (אגו), תחתון (גשמיות). מבוסס על תיאוריית Pulver על סמליות המרחב.",
    importance: "תיאורטי - Pulver 1931",
    source: "Pulver, Max (1931)",
    link: null
  }
};

export default function GraphologyTooltip({ term, children }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const termData = GRAPHOLOGY_TERMS[term.toLowerCase()];

  if (!termData) return children;

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="border-b border-dotted border-purple-400 cursor-help"
      >
        {children}
        <Info className="w-3 h-3 inline mr-1 text-purple-400" />
      </span>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 mb-2 w-80 z-50"
          >
            <div className="bg-gray-900 border-2 border-purple-600 rounded-xl p-4 shadow-2xl">
              <div className="flex items-start gap-2 mb-3">
                <BookOpen className="w-5 h-5 text-purple-400 shrink-0 mt-0.5" />
                <h4 className="text-purple-300 font-bold text-lg">{termData.term}</h4>
              </div>

              <p className="text-gray-200 text-sm leading-relaxed mb-3">
                {termData.definition}
              </p>

              <div className="bg-purple-900/30 rounded-lg p-3 mb-3">
                <p className="text-purple-200 text-xs font-semibold mb-1">
                  {termData.importance.includes('מדעי') ? '✅' : '⚠️'} חשיבות:
                </p>
                <p className="text-purple-100 text-xs">
                  {termData.importance}
                </p>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-gray-400 text-xs">
                  📚 {termData.source}
                </p>
                {termData.link && (
                  <a
                    href={termData.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 text-xs flex items-center gap-1"
                  >
                    קרא עוד <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
}

export function TermGlossary() {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {Object.values(GRAPHOLOGY_TERMS).map((term, idx) => (
        <div key={idx} className="bg-gray-900/50 border border-purple-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h4 className="text-purple-300 font-bold">{term.term}</h4>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed mb-2">
            {term.definition}
          </p>
          <p className="text-gray-500 text-xs">
            📚 {term.source}
          </p>
        </div>
      ))}
    </div>
  );
}