import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  PlayCircle, 
  Book, 
  Sparkles, 
  Clock,
  CheckCircle,
  Hash,
  Hand,
  Stars,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { FadeIn } from "@/components/PageTransition";

const tutorials = [
  {
    id: "getting-started",
    title: "התחלה מהירה",
    description: "למד את היסודות והתחל את המסע המיסטי שלך",
    duration: "5 דקות",
    level: "מתחילים",
    icon: Sparkles,
    gradient: "from-purple-600 to-pink-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    steps: [
      "הירשם לחשבון חינם",
      "בחר את הכלי הראשון שלך",
      "הזן את הפרטים הדרושים",
      "קבל את הניתוח שלך",
      "שמור ושתף את התוצאות"
    ]
  },
  {
    id: "numerology-guide",
    title: "מדריך נומרולוגיה",
    description: "הבן את המשמעות של המספרים בחייך",
    duration: "8 דקות",
    level: "מתחילים",
    icon: Hash,
    gradient: "from-blue-600 to-cyan-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    steps: [
      "למד על שיטות חישוב שונות",
      "הבן את משמעות כל מספר",
      "גלה את מספר החיים שלך",
      "פענח את מספר הגורל",
      "התאם את התובנות לחייך"
    ]
  },
  {
    id: "palmistry-basics",
    title: "יסודות קריאת כף יד",
    description: "למד לזהות קווים ולפרש משמעויות",
    duration: "10 דקות",
    level: "בינוני",
    icon: Hand,
    gradient: "from-green-600 to-emerald-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    steps: [
      "הכר את קווי היד העיקריים",
      "למד על קו החיים",
      "הבן את קו הלב",
      "פענח את קו הראש",
      "זהה סימנים מיוחדים"
    ]
  },
  {
    id: "astrology-intro",
    title: "מבוא לאסטרולוגיה",
    description: "גלה את השפעת הכוכבים על חייך",
    duration: "12 דקות",
    level: "בינוני",
    icon: Stars,
    gradient: "from-indigo-600 to-purple-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    steps: [
      "הבן את מזל השמש שלך",
      "למד על מזל הירח",
      "גלה את האסנדנט שלך",
      "הכר את הבתים האסטרולוגיים",
      "פענח את מפת הלידה"
    ]
  },
  {
    id: "tarot-reading",
    title: "קריאת טארוט למתחילים",
    description: "למד לקרוא ולפרש קלפי טארוט",
    duration: "15 דקות",
    level: "מתקדם",
    icon: Layers,
    gradient: "from-amber-600 to-orange-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    steps: [
      "הכר את חפיסת הטארוט",
      "למד את הארקנה הגדולה",
      "הבן את הארקנה הקטנה",
      "בחר פריסה מתאימה",
      "פרש את הקלפים בהקשר"
    ]
  },
  {
    id: "advanced-techniques",
    title: "טכניקות מתקדמות",
    description: "שלב בין מספר כלים לתובנות עמוקות",
    duration: "20 דקות",
    level: "מתקדם",
    icon: Sparkles,
    gradient: "from-rose-600 to-pink-600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    steps: [
      "שלב נומרולוגיה ואסטרולוגיה",
      "השווה בין ניתוחים שונים",
      "זהה דפוסים חוזרים",
      "העמק את ההבנה האישית",
      "החל את התובנות בחיי היומיום"
    ]
  }
];

const faqs = [
  {
    q: "כמה זמן לוקח ניתוח?",
    a: "רוב הניתוחים לוקחים 2-3 דקות. ניתוחים מורכבים יותר כמו אסטרולוגיה יכולים לקחת עד 5 דקות."
  },
  {
    q: "האם הניתוחים מדויקים?",
    a: "הניתוחים שלנו משלבים חוכמה עתיקה עם AI מתקדם לדיוק גבוה. רמת הדיוק מוצגת בכל ניתוח."
  },
  {
    q: "האם אני צריך ידע מוקדם?",
    a: "בכלל לא! הממשק שלנו מותאם למתחילים לחלוטין. המדריכים שלנו יעזרו לך להתחיל."
  },
  {
    q: "כמה ניתוחים אני יכול לעשות?",
    a: "בחבילה החינמית: 3 ניתוחים בחודש. בחבילות בתשלום: 20 או ללא הגבלה בהתאם לתוכנית."
  },
  {
    q: "האם אני יכול לשמור את הניתוחים?",
    a: "כן! כל הניתוחים נשמרים אוטומטית ב'הניתוחים שלי' ואתה יכול לצפות בהם בכל עת."
  },
  {
    q: "איך אני יכול לשפר את הדיוק?",
    a: "הקפד למלא פרטים מדויקים (תאריך לידה, שעה, מקום). צלם תמונות איכותיות לקריאת כף יד וגרפולוגיה."
  }
];

export default function Tutorials() {
  const [selectedTutorial, setSelectedTutorial] = useState(null);
  const [completedTutorials, setCompletedTutorials] = useState(
    JSON.parse(localStorage.getItem('completed_tutorials') || '[]')
  );

  const handleComplete = (tutorialId) => {
    const updated = [...completedTutorials, tutorialId];
    setCompletedTutorials(updated);
    localStorage.setItem('completed_tutorials', JSON.stringify(updated));
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "מתחילים": return "bg-green-900/50 text-green-200";
      case "בינוני": return "bg-blue-900/50 text-blue-200";
      case "מתקדם": return "bg-purple-900/50 text-purple-200";
      default: return "bg-gray-900/50 text-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="מדריכים וטיוטוריאלים"
          description="למד את כל מה שצריך לדעת על הכלים המיסטיים"
          icon={Book}
          iconGradient="from-purple-600 to-pink-600"
        />

        {!selectedTutorial ? (
          <>
            {/* Progress */}
            <FadeIn>
              <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-white font-bold text-xl mb-1">ההתקדמות שלך</h3>
                      <p className="text-purple-300">
                        השלמת {completedTutorials.length} מתוך {tutorials.length} מדריכים
                      </p>
                    </div>
                    <div className="text-4xl font-bold text-purple-400">
                      {Math.round((completedTutorials.length / tutorials.length) * 100)}%
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedTutorials.length / tutorials.length) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 h-4 rounded-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </FadeIn>

            {/* Tutorials Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {tutorials.map((tutorial, idx) => {
                const Icon = tutorial.icon;
                const isCompleted = completedTutorials.includes(tutorial.id);

                return (
                  <motion.div
                    key={tutorial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    whileHover={{ y: -5 }}
                  >
                    <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30 hover:border-purple-600/50 transition-all h-full relative overflow-hidden group">
                      {isCompleted && (
                        <div className="absolute top-4 left-4 z-10">
                          <CheckCircle className="w-8 h-8 text-green-400" />
                        </div>
                      )}

                      <div className={`absolute inset-0 bg-gradient-to-br ${tutorial.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                      <CardHeader>
                        <div className={`w-16 h-16 bg-gradient-to-br ${tutorial.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-xl`}>
                          <Icon className="w-8 h-8 text-white" />
                        </div>

                        <CardTitle className="text-white text-xl mb-3">
                          {tutorial.title}
                        </CardTitle>

                        <p className="text-purple-300 text-sm leading-relaxed mb-4">
                          {tutorial.description}
                        </p>

                        <div className="flex gap-2 flex-wrap">
                          <Badge className={getLevelColor(tutorial.level)}>
                            {tutorial.level}
                          </Badge>
                          <Badge variant="outline" className="border-purple-600/50 text-purple-300">
                            <Clock className="w-3 h-3 ml-1" />
                            {tutorial.duration}
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent>
                        <Button
                          onClick={() => setSelectedTutorial(tutorial)}
                          className={`w-full ${
                            isCompleted 
                              ? 'bg-gray-700 hover:bg-gray-600'
                              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                          }`}
                        >
                          <PlayCircle className="w-5 h-5 ml-2" />
                          {isCompleted ? 'צפה שוב' : 'התחל ללמוד'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* FAQ */}
            <FadeIn delay={0.5}>
              <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
                <CardHeader>
                  <CardTitle className="text-white text-2xl">שאלות נפוצות</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {faqs.map((faq, i) => (
                    <div key={i} className="border-b border-gray-800 last:border-0 pb-6 last:pb-0">
                      <h4 className="text-white font-bold text-lg mb-2">{faq.q}</h4>
                      <p className="text-purple-300 leading-relaxed">{faq.a}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </FadeIn>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Video Player */}
            <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
              <CardContent className="p-0">
                <div className="aspect-video bg-black rounded-t-xl overflow-hidden">
                  <iframe
                    src={selectedTutorial.videoUrl}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-white mb-2">
                        {selectedTutorial.title}
                      </h2>
                      <p className="text-purple-300 mb-4">
                        {selectedTutorial.description}
                      </p>
                      <div className="flex gap-2">
                        <Badge className={getLevelColor(selectedTutorial.level)}>
                          {selectedTutorial.level}
                        </Badge>
                        <Badge variant="outline" className="border-purple-600/50 text-purple-300">
                          <Clock className="w-3 h-3 ml-1" />
                          {selectedTutorial.duration}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleComplete(selectedTutorial.id)}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={completedTutorials.includes(selectedTutorial.id)}
                    >
                      <CheckCircle className="w-5 h-5 ml-2" />
                      {completedTutorials.includes(selectedTutorial.id) ? 'הושלם' : 'סמן כהושלם'}
                    </Button>
                    <Button
                      onClick={() => setSelectedTutorial(null)}
                      variant="outline"
                      className="border-purple-600 text-purple-300"
                    >
                      חזור למדריכים
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps */}
            <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
              <CardHeader>
                <CardTitle className="text-white">שלבים למעקב</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedTutorial.steps.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-4 bg-purple-900/20 rounded-lg p-4"
                    >
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                        {i + 1}
                      </div>
                      <p className="text-purple-200">{step}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}