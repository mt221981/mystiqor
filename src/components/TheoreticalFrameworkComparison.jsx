import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, Info, Brain } from "lucide-react";

/**
 * TheoreticalFrameworkComparison
 * מציג השוואה בין מסגרות תיאורטיות שונות
 * ומדגיש אי-התאמות בין הממצאים
 */
export default function TheoreticalFrameworkComparison({ theoreticalAlignment, discrepancies = [] }) {
  if (!theoreticalAlignment) {
    return null;
  }

  const frameworks = [
    {
      name: "Jung",
      key: "jungian",
      icon: "🎭",
      description: "פסיכולוגיה אנליטית - ארכיטיפים ותת-מודע קולקטיבי",
      color: "from-violet-600 to-purple-600"
    },
    {
      name: "Freud",
      key: "freudian",
      icon: "🧠",
      description: "פסיכואנליזה - מנגנוני הגנה ודחפים לא מודעים",
      color: "from-amber-600 to-orange-600"
    },
    {
      name: "Bowlby",
      key: "bowlby",
      icon: "🤝",
      description: "תיאוריית התקשרות - קשרים מוקדמים ודפוסי יחסים",
      color: "from-blue-600 to-cyan-600"
    }
  ];

  const overallScore = theoreticalAlignment.overall || 
    ((theoreticalAlignment.jungian + theoreticalAlignment.freudian + theoreticalAlignment.bowlby) / 3);

  const getScoreLabel = (score) => {
    if (score >= 0.9) return { label: "התאמה מצוינת", color: "text-green-400" };
    if (score >= 0.8) return { label: "התאמה טובה", color: "text-blue-400" };
    if (score >= 0.7) return { label: "התאמה סבירה", color: "text-yellow-400" };
    return { label: "התאמה חלקית", color: "text-orange-400" };
  };

  return (
    <Card className="bg-gradient-to-br from-gray-900/80 to-indigo-900/80 backdrop-blur-xl border-indigo-700/50">
      <CardContent className="p-6 md:p-8">
        <div className="flex items-start gap-3 mb-6">
          <Brain className="w-8 h-8 text-indigo-400 shrink-0" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              אימות תיאורטי צולב
            </h2>
            <p className="text-indigo-200 text-sm">
              השוואת הממצאים מול מסגרות תיאורטיות מובילות בפסיכולוגיה
            </p>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-indigo-950/50 rounded-xl p-6 mb-6 border border-indigo-700/30">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-white mb-2">
              {Math.round(overallScore * 100)}%
            </div>
            <p className={`text-lg font-semibold ${getScoreLabel(overallScore).color}`}>
              {getScoreLabel(overallScore).label}
            </p>
          </div>
          <Progress value={overallScore * 100} className="h-3" />
        </div>

        {/* Individual Framework Scores */}
        <div className="space-y-4 mb-6">
          {frameworks.map((framework) => {
            const score = theoreticalAlignment[framework.key] || 0;
            const scoreInfo = getScoreLabel(score);
            
            return (
              <div key={framework.key} className="bg-gray-900/50 rounded-lg p-5 border border-gray-700/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 bg-gradient-to-br ${framework.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {framework.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{framework.name}</h3>
                      <p className="text-gray-400 text-xs">{framework.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {Math.round(score * 100)}%
                    </div>
                    <Badge className={`${scoreInfo.color} bg-transparent border-0 text-xs`}>
                      {scoreInfo.label}
                    </Badge>
                  </div>
                </div>
                <Progress value={score * 100} className="h-2" />
              </div>
            );
          })}
        </div>

        {/* Chen 2023 Meta-Analysis */}
        {theoreticalAlignment.chen_2023 && (
          <div className="bg-purple-950/40 rounded-lg p-5 border border-purple-700/50 mb-6">
            <div className="flex items-start gap-3">
              <Info className="w-6 h-6 text-purple-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-purple-200 font-bold mb-2">
                  📊 Chen et al. (2023) - מטא-אנליזה
                </h4>
                <p className="text-purple-100 text-sm leading-relaxed">
                  {theoreticalAlignment.chen_2023}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Discrepancies */}
        {discrepancies.length > 0 && (
          <div className="bg-orange-950/40 rounded-lg p-5 border-2 border-orange-700/50">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
              <div>
                <h4 className="text-orange-200 font-bold text-lg mb-2">
                  ⚠️ אי-התאמות שזוהו
                </h4>
                <p className="text-orange-100 text-xs mb-4">
                  מקרים בהם הממצאים הכמותיים לא מתיישבים באופן מלא עם התיאוריות. 
                  זה לא בהכרח מעיד על בעיה, אלא על צורך בבדיקה מעמיקה יותר.
                </p>
              </div>
            </div>
            <ul className="space-y-3">
              {discrepancies.map((discrepancy, idx) => (
                <li key={idx} className="bg-orange-900/30 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold shrink-0">{idx + 1}.</span>
                    <p className="text-orange-100 text-sm leading-relaxed">{discrepancy}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation */}
        <div className="bg-blue-950/30 rounded-lg p-5 border border-blue-700/30 mt-6">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-6 h-6 text-blue-400 shrink-0 mt-1" />
            <div>
              <h4 className="text-blue-200 font-bold mb-2">
                💡 מה זה אומר?
              </h4>
              <p className="text-blue-100 text-sm leading-relaxed">
                ציוני ההתאמה מראים עד כמה הממצאים הכמותיים מהציורים שלך מתיישבים עם 
                תיאוריות פסיכולוגיות מוכרות. ציון גבוה (מעל 80%) מעיד על עקביות חזקה 
                בין המדדים האובייקטיביים לבין הידע התיאורטי המצטבר. אי-התאמות יכולות 
                להצביע על ייחודיות אישית או על צורך בהעמקה נוספת.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}