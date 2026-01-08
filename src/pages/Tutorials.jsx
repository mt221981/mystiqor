import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, Star, PlayCircle, Lock, CheckCircle2, Calculator, Sun, Palette } from "lucide-react";
import { motion } from "framer-motion";
import InteractiveTutorial from "@/components/learning/InteractiveTutorial";
import TutorChat from "@/components/learning/TutorChat";

// Mock Data for Learning Paths (In real app, fetch from DB/Config)
const LEARNING_PATHS = {
  numerology: {
    id: "numerology",
    title: "מסלול הנומרולוגיה",
    description: "גלה את סודות המספרים והשפעתם על חייך",
    icon: Calculator,
    color: "purple",
    modules: [
      {
        id: "num_101",
        title: "יסודות הנומרולוגיה",
        description: "הכרות עם המספרים 1-9 והמשמעות האנרגטית שלהם",
        duration: "15 דקות",
        steps: [
          { id: "1", title: "מהי נומרולוגיה?", content: "נומרולוגיה היא חקר המשמעות הנסתרת של מספרים...", interaction: "חשוב על תאריך הלידה שלך. האם יש מספר שחוזר על עצמו?" },
          { id: "2", title: "מספרי המאסטר", content: "מספרים כמו 11, 22 ו-33 נחשבים למספרי מאסטר בעלי תדר גבוה...", interaction: null },
          { id: "3", title: "חישוב שביל הגורל", content: "שביל הגורל הוא המספר החשוב ביותר במפה הנומרולוגית שלך...", interaction: "נסה לחשב את שביל הגורל שלך כעת." }
        ]
      },
      {
        id: "num_102",
        title: "מספרי המאסטר",
        description: "העמקה למספרים 11, 22, 33",
        duration: "20 דקות",
        isLocked: true
      }
    ]
  },
  astrology: {
    id: "astrology",
    title: "מסלול האסטרולוגיה",
    description: "הבנת שפת הכוכבים והמזלות",
    icon: Sun,
    color: "indigo",
    modules: [
      {
        id: "astro_101",
        title: "12 המזלות",
        description: "סקירה של הארכיטיפים המרכזיים בגלגל המזלות",
        duration: "25 דקות",
        steps: [
           { id: "1", title: "יסודות: אש, אדמה, אוויר ומים", content: "כל מזל שייך לאחד מארבעת היסודות...", interaction: null }
        ]
      }
    ]
  }
};

export default function TutorialsPage() {
  const [activeTab, setActiveTab] = useState("numerology");
  const [activeModule, setActiveModule] = useState(null);

  const currentPath = LEARNING_PATHS[activeTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6 md:p-12 pb-24">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center justify-center p-3 bg-indigo-500/10 rounded-full mb-4"
          >
            <GraduationCap className="w-8 h-8 text-indigo-400" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            מרכז הלמידה
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            העמק את הידע שלך, למד טכניקות חדשות ופתח את האינטואיציה שלך בעזרת מסלולי למידה מותאמים אישית.
          </p>
        </div>

        {activeModule ? (
          /* Active Tutorial View */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Button 
              variant="ghost" 
              onClick={() => setActiveModule(null)}
              className="mb-6 text-slate-400 hover:text-white"
            >
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה למסלולים
            </Button>
            <div className="grid lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2">
                 <InteractiveTutorial 
                    module={activeModule} 
                    onComplete={() => alert("כל הכבוד! סיימת את המודול.")} 
                 />
               </div>
               <div className="lg:col-span-1">
                 <TutorChat discipline={activeTab} />
               </div>
            </div>
          </motion.div>
        ) : (
          /* Learning Paths View */
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-bold text-slate-300 px-2">מסלולי למידה</h3>
              <div className="space-y-2">
                {Object.values(LEARNING_PATHS).map((path) => (
                  <button
                    key={path.id}
                    onClick={() => setActiveTab(path.id)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl transition-all text-right ${
                      activeTab === path.id 
                        ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/50 text-white' 
                        : 'bg-slate-900/50 hover:bg-slate-800 text-slate-400 border border-transparent'
                    }`}
                  >
                    <path.icon className={`w-5 h-5 ${activeTab === path.id ? 'text-purple-400' : 'text-slate-500'}`} />
                    <span className="font-medium">{path.title}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <h4 className="font-bold text-white mb-2">יש לך שאלה?</h4>
                <p className="text-sm text-slate-400 mb-4">ה-AI שלנו כאן לעזור לך להבין כל מושג מיסטי.</p>
                <TutorChat discipline="general" />
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8">
                  <h2 className="text-3xl font-bold text-white mb-2">{currentPath.title}</h2>
                  <p className="text-slate-400">{currentPath.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {currentPath.modules.map((module, idx) => (
                    <Card 
                      key={module.id} 
                      className={`bg-slate-900/80 border-slate-800 transition-all ${
                        !module.isLocked ? 'hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer group' : 'opacity-75'
                      }`}
                      onClick={() => !module.isLocked && setActiveModule(module)}
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start mb-2">
                          <span className="bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded-md font-mono">
                            מודול {idx + 1}
                          </span>
                          {module.isLocked ? (
                            <Lock className="w-5 h-5 text-slate-600" />
                          ) : (
                            <PlayCircle className="w-8 h-8 text-purple-500 group-hover:scale-110 transition-transform" />
                          )}
                        </div>
                        <CardTitle className="text-xl text-white group-hover:text-purple-300 transition-colors">
                          {module.title}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {module.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                           <span className="flex items-center gap-1">
                             <BookOpen className="w-4 h-4" />
                             {module.steps?.length || 0} שיעורים
                           </span>
                           <span>•</span>
                           <span>{module.duration}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}