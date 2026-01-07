import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, History, Moon, Hash, Hand, PenTool, Stars, Layers, HelpCircle, Sun, Briefcase, Heart, User, Activity, Crown, CreditCard, Menu, BookOpen, Video, Users, Sparkles, Calendar as CalendarIcon, Gift, Palette, TrendingUp, Clock, GitCompare, Target, FileText, GraduationCap, ChevronDown, ChevronUp, Settings, Compass, Edit, Bell } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import useSubscription from "@/components/useSubscription";
import NotificationManager from "@/components/NotificationManager";
import EnhancedPWA from "@/components/EnhancedPWA";
import EnhancedAccessibility from "@/components/EnhancedAccessibility";
import { ThemeProvider } from "@/components/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageToggle from "@/components/LanguageToggle";

// הכלים הבסיסיים - מוצגים תמיד
const basicTools = [
  { title: "דף הבית", url: createPageUrl("Home"), icon: Home },
  { title: "הדשבורד שלי 📊", url: createPageUrl("Dashboard"), icon: Activity },
  { title: "נומרולוגיה", url: createPageUrl("Numerology"), icon: Hash },
  { title: "אסטרולוגיה", url: createPageUrl("Astrology"), icon: Stars },
  { title: "כף יד", url: createPageUrl("Palmistry"), icon: Hand },
  { title: "גרפולוגיה", url: createPageUrl("Graphology"), icon: PenTool },
  { title: "ניתוח ציור", url: createPageUrl("DrawingAnalysis"), icon: Palette },
  { title: "קלפי טארוט", url: createPageUrl("Tarot"), icon: Layers },
  { title: "שאל שאלה", url: createPageUrl("AskQuestion"), icon: HelpCircle },
];

// כלים מיוחדים - מוצגים רק כשמרחיבים
const advancedTools = [
  { title: "המסעות שלי 🧭", url: createPageUrl("JourneyDashboard"), icon: Compass },
  { title: "התזכורות שלי 🔔", url: createPageUrl("Notifications"), icon: Bell },
  { title: "קריאות אסטרולוגיות ✨", url: createPageUrl("AstrologyReadings"), icon: BookOpen },
  { title: "ניתוח חלומות 🌙", url: createPageUrl("DreamAnalysis"), icon: Moon },
  { title: "מעקב מצב רוח 📊", url: createPageUrl("MoodTracker"), icon: Activity },
  { title: "ניתוח יחסים 💕", url: createPageUrl("RelationshipAnalysis"), icon: Heart },
  { title: "Synastry - יחסים 💕", url: createPageUrl("Synastry"), icon: Heart },
  { title: "Solar Return ☀️", url: createPageUrl("SolarReturn"), icon: Sun },
  { title: "מעברים אסטרולוגיים", url: createPageUrl("Transits"), icon: TrendingUp },
  { title: "כלי תזמון", url: createPageUrl("TimingTools"), icon: Clock },
  { title: "מנתח מסמכים 🤖", url: createPageUrl("DocumentAnalyzer"), icon: FileText },
  { title: "שילוב של הכלים ✨", url: createPageUrl("MysticSynthesis"), icon: Sparkles },
  { title: "תובנות יומיות ✨", url: createPageUrl("DailyInsights"), icon: Sparkles },
  { title: "ניתוח אישיות", url: createPageUrl("PersonalityAnalysis"), icon: User },
  { title: "ייעוץ בעבודה", url: createPageUrl("CareerGuidance"), icon: Briefcase },
  { title: "יחסים ואהבה", url: createPageUrl("Relationships"), icon: Heart },
  { title: "התאמה בזוגיות", url: createPageUrl("Compatibility"), icon: Users },
  { title: "המאמן שלי", url: createPageUrl("AICoach"), icon: Sparkles },
  { title: "המורה לאסטרולוגיה 🎓", url: createPageUrl("AstrologyTutor"), icon: GraduationCap },
  { title: "המורה לניתוח ציורים 🎨", url: createPageUrl("DrawingTutor"), icon: Palette },
  { title: "היומן שלי", url: createPageUrl("Journal"), icon: BookOpen },
  { title: "היעדים שלי 🎯", url: createPageUrl("MyGoals"), icon: Target },
  { title: "לוח שנה", url: createPageUrl("AstroCalendar"), icon: CalendarIcon },
  { title: "הזמן חברים", url: createPageUrl("Referrals"), icon: Gift },
];

// כלים של היסטוריה והשוואה
const historyTools = [
  { title: "מה ראיתי עד עכשיו", url: createPageUrl("MyAnalyses"), icon: History },
  { title: "השוואה", url: createPageUrl("CompareAnalyses"), icon: Activity },
  { title: "השוואת ציורים", url: createPageUrl("CompareDrawingAnalyses"), icon: GitCompare },
];

const accountItems = [
  { title: "הפרופיל שלי 👤", url: createPageUrl("UserProfile"), icon: User },
  { title: "עריכת פרטים", url: createPageUrl("EditProfile"), icon: Edit },
  { title: "הגדרות", url: createPageUrl("UserSettings"), icon: Settings },
  { title: "אנשים נוספים", url: createPageUrl("ManageProfiles"), icon: Users },
];

const learningItems = [
  { title: "הדרכות", url: createPageUrl("Tutorials"), icon: Video },
  { title: "מאמרים", url: createPageUrl("Blog"), icon: BookOpen },
  { title: "תובנות שמורות", url: createPageUrl("SavedGraphologyInsights"), icon: BookOpen },
];

export default function Layout({ children }) {
  const location = useLocation();
  const [showAdvancedTools, setShowAdvancedTools] = useState(false);
  
  const {
    subscription,
    isLoading,
    planInfo,
    usagePercentage,
  } = useSubscription();

  return (
    <ThemeProvider>
      <SidebarProvider>
        <EnhancedAccessibility />
        <NotificationManager />
        <EnhancedPWA />
        
        <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-950 via-purple-950 to-indigo-950 relative overflow-hidden transition-colors" dir="rtl" lang="he">
          {/* ENHANCED BACKGROUND WITH BETTER CONTRAST */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent" />
          
          {/* SUBTLE ANIMATED STARS - reduced opacity for better contrast */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30" aria-hidden="true">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white rounded-full animate-pulse"
                style={{
                  width: Math.random() * 2 + 1 + 'px',
                  height: Math.random() * 2 + 1 + 'px',
                  top: Math.random() * 100 + '%',
                  left: Math.random() * 100 + '%',
                  animationDelay: Math.random() * 5 + 's',
                  animationDuration: Math.random() * 3 + 2 + 's',
                  opacity: Math.random() * 0.5 + 0.3,
                }}
              />
            ))}
          </div>

          {/* SUBTLE GLOWING ORBS - reduced for better readability */}
          <div className="absolute top-20 left-20 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-3xl animate-pulse" aria-hidden="true" />
          <div className="absolute bottom-20 right-20 w-[400px] h-[400px] bg-pink-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} aria-hidden="true" />
          
          <Sidebar side="right" className="border-l-2 border-purple-500/50 bg-gradient-to-b from-gray-900/95 via-purple-950/95 to-gray-900/95 shadow-2xl z-50 overflow-y-auto backdrop-blur-xl">
            <SidebarHeader className="border-b border-purple-500/30 p-4 lg:p-6 bg-gray-900/90 backdrop-blur-xl sticky top-0 z-10">
              <Link to={createPageUrl("Home")} className="block" aria-label="חזרה לדף הבית">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3 lg:gap-4">
                    <div className="relative w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl" style={{ boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)' }}>
                      <Moon className="w-6 h-6 lg:w-9 lg:h-9 text-white" />
                    </div>
                    <div>
                      <h2 className="font-black text-2xl lg:text-3xl bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">מסע פנימה</h2>
                      <p className="text-sm lg:text-base text-purple-200 font-semibold">המסע שלך להכרה עצמית ✨</p>
                    </div>
                  </div>
                </div>
              </Link>
              
              <div className="flex gap-2">
                <ThemeToggle />
                <LanguageToggle />
              </div>

              {!isLoading && subscription && planInfo && (
                <div className="mt-4">
                  <Link to={createPageUrl("Pricing")} aria-label={`מנוי נוכחי: ${planInfo?.name}`}>
                    <div className={`rounded-2xl p-4 border-2 transition-all hover:scale-105 shadow-xl ${
                      subscription.plan_type === 'free'
                        ? 'bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-gray-500/50'
                        : subscription.plan_type === 'premium' || subscription.plan_type === 'enterprise'
                        ? 'bg-gradient-to-r from-purple-900/80 to-pink-900/80 border-purple-400/50 shadow-purple-500/30'
                        : 'bg-gradient-to-r from-blue-900/80 to-cyan-900/80 border-blue-400/50 shadow-blue-500/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Crown className={`w-5 h-5 ${
                            subscription.plan_type === 'free' ? 'text-gray-300' : 'text-yellow-400'
                          }`} />
                          <span className="text-white font-black text-base">{planInfo?.name}</span>
                        </div>
                        <CreditCard className={`w-5 h-5 ${
                          subscription.plan_type === 'free' ? 'text-gray-300' : 'text-purple-200'
                        }`} />
                      </div>
                      
                      {(subscription.plan_type === 'free' || subscription.plan_type === 'basic') && planInfo.analyses !== -1 ? (
                        <>
                          <div className="flex justify-between items-center text-xs lg:text-sm mb-2">
                            <span className="text-white font-bold">
                              {subscription.analyses_used || 0} / {planInfo.analyses}
                            </span>
                            <span className="text-purple-100">ניתוחים</span>
                          </div>
                          <Progress 
                            value={usagePercentage} 
                            className="h-3"
                            aria-label={`שימוש: ${usagePercentage}%`}
                          />
                          {subscription.plan_type === 'free' && (
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs mt-2">
                              ✨ שדרג לבלי גבול
                            </Badge>
                          )}
                        </>
                      ) : (
                        <div className="text-center">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold">
                            ♾️ כמה שתרצה
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              )}
            </SidebarHeader>
            
            <SidebarContent className="p-3 lg:p-4 bg-gray-900/40 backdrop-blur-xl">
              {/* הכלים הבסיסיים */}
              <SidebarGroup>
                <SidebarGroupLabel className="text-sm font-black text-purple-200 uppercase tracking-wider px-3 py-2 mb-2">
                  🎯 הכלים שלנו
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu role="navigation" aria-label="תפריט ראשי">
                    {basicTools.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-300 rounded-xl mb-2 border ${
                            location.pathname === item.url 
                              ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg border-purple-400/50 scale-105' 
                              : 'text-gray-100 border-purple-800/30 bg-gray-800/50 hover:bg-purple-900/40 hover:border-purple-500/50 hover:scale-102 hover:text-white'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-current={location.pathname === item.url ? 'page' : undefined}
                          >
                            <item.icon className="w-5 h-5" aria-hidden="true" />
                            <span className="font-bold text-base">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* כפתור להצגת כלים מיוחדים */}
              <div className="px-3 mb-2">
                <button
                  onClick={() => setShowAdvancedTools(!showAdvancedTools)}
                  className={`w-full justify-between transition-all duration-300 rounded-xl border h-auto py-4 px-4 flex items-center shadow-lg ${
                    showAdvancedTools
                      ? 'bg-gradient-to-r from-pink-600/90 to-rose-600/90 text-white shadow-lg border-pink-400/50 scale-105'
                      : 'text-gray-100 border-pink-800/30 bg-gray-800/50 hover:bg-pink-900/40 hover:border-pink-500/50 hover:scale-102'
                  }`}
                >
                  <span className="flex items-center gap-2 font-black text-base">
                    <Sparkles className="w-5 h-5" />
                    ✨ כלים מיוחדים
                    <Badge className="bg-white/20 text-white text-xs font-bold">
                      {advancedTools.length}
                    </Badge>
                  </span>
                  {showAdvancedTools ? (
                    <ChevronUp className="w-6 h-6" />
                  ) : (
                    <ChevronDown className="w-6 h-6" />
                  )}
                </button>
              </div>

              {/* כלים מיוחדים - מוצגים רק כשמרחיבים */}
              {showAdvancedTools && (
                <SidebarGroup>
                  <SidebarGroupContent>
                    <SidebarMenu role="navigation" aria-label="כלים מתקדמים">
                      {advancedTools.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            className={`transition-all duration-300 rounded-xl mb-2 border ${
                              location.pathname === item.url 
                                ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg border-purple-400/50 scale-105' 
                                : 'text-gray-100 border-purple-800/30 bg-gray-800/50 hover:bg-purple-900/40 hover:border-purple-500/50 hover:scale-102 hover:text-white'
                            }`}
                          >
                            <Link 
                              to={item.url} 
                              className="flex items-center gap-3 px-4 py-3"
                              aria-current={location.pathname === item.url ? 'page' : undefined}
                            >
                              <item.icon className="w-5 h-5" aria-hidden="true" />
                              <span className="font-bold text-base">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}

              {/* היסטוריה והשוואה */}
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-sm font-black text-emerald-200 uppercase tracking-wider px-3 py-2 mb-2">
                  ⏳ ההיסטוריה שלי
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu role="navigation" aria-label="היסטוריה">
                    {historyTools.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-300 rounded-xl mb-2 border ${
                            location.pathname === item.url
                              ? 'bg-gradient-to-r from-green-600/90 to-emerald-600/90 text-white shadow-lg border-green-400/50 scale-105' 
                              : 'text-gray-100 border-green-800/30 bg-gray-800/50 hover:bg-green-900/40 hover:border-green-500/50 hover:scale-102'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-current={location.pathname === item.url ? 'page' : undefined}
                          >
                            <item.icon className="w-5 h-5" aria-hidden="true" />
                            <span className="font-bold text-base">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* החשבון שלי */}
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-sm font-black text-indigo-200 uppercase tracking-wider px-3 py-2 mb-2">
                  👤 החשבון שלי
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu role="navigation" aria-label="תפריט חשבון">
                    {accountItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-300 rounded-xl mb-2 border ${
                            location.pathname === item.url
                              ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg border-indigo-400/50 scale-105' 
                              : 'text-gray-100 border-indigo-800/30 bg-gray-800/50 hover:bg-indigo-900/40 hover:border-indigo-500/50 hover:scale-102'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-current={location.pathname === item.url ? 'page' : undefined}
                          >
                            <item.icon className="w-5 h-5" aria-hidden="true" />
                            <span className="font-bold text-base">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* ללמוד עוד */}
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-sm font-black text-amber-200 uppercase tracking-wider px-3 py-2 mb-2">
                  📚 ללמוד עוד
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu role="navigation" aria-label="תפריט למידה">
                    {learningItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`transition-all duration-300 rounded-xl mb-2 border ${
                            location.pathname === item.url
                              ? 'bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white shadow-lg border-amber-400/50 scale-105' 
                            : 'text-gray-100 border-amber-800/30 bg-gray-800/50 hover:bg-amber-900/40 hover:border-amber-500/50 hover:scale-102'
                          }`}
                        >
                          <Link 
                            to={item.url} 
                            className="flex items-center gap-3 px-4 py-3"
                            aria-current={location.pathname === item.url ? 'page' : undefined}
                          >
                            <item.icon className="w-5 h-5" aria-hidden="true" />
                            <span className="font-bold text-base">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {/* המנוי שלי */}
              <SidebarGroup className="mt-4">
                <SidebarGroupLabel className="text-sm font-black text-pink-200 uppercase tracking-wider px-3 py-2 mb-2">
                  💎 המנוי שלי
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu role="navigation" aria-label="תפריט מנוי">
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-300 rounded-xl mb-2 border ${
                          location.pathname === createPageUrl("Pricing")
                            ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg border-purple-400/50 scale-105' 
                            : 'text-gray-100 border-purple-800/30 bg-gray-800/50 hover:bg-purple-900/40 hover:border-purple-500/50 hover:scale-102'
                        }`}
                      >
                        <Link 
                          to={createPageUrl("Pricing")} 
                          className="flex items-center gap-3 px-4 py-3"
                          aria-current={location.pathname === createPageUrl("Pricing") ? 'page' : undefined}
                        >
                          <Crown className="w-5 h-5" aria-hidden="true" />
                          <span className="font-bold text-base">המחירים</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-300 rounded-xl mb-2 border ${
                          location.pathname === createPageUrl("ManageSubscription")
                            ? 'bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white shadow-lg border-purple-400/50 scale-105' 
                            : 'text-gray-100 border-purple-800/30 bg-gray-800/50 hover:bg-purple-900/40 hover:border-purple-500/50 hover:scale-102'
                        }`}
                      >
                        <Link 
                          to={createPageUrl("ManageSubscription")} 
                          className="flex items-center gap-3 px-4 py-3"
                          aria-current={location.pathname === createPageUrl("ManageSubscription") ? 'page' : undefined}
                        >
                          <CreditCard className="w-5 h-5" aria-hidden="true" />
                          <span className="font-bold text-base">ניהול המנוי</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex-1 flex flex-col overflow-hidden relative z-10" role="main" id="main-content">
            <header className="bg-gradient-to-r from-gray-900/95 via-purple-950/95 to-gray-900/95 border-b border-purple-500/30 shadow-2xl px-4 py-4 lg:px-6 lg:py-5 md:hidden sticky top-0 z-20 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <SidebarTrigger 
                  className="hover:bg-purple-900/50 p-3 rounded-xl transition-colors text-white border border-purple-500/50 shadow-lg"
                  aria-label="פתח/סגור תפריט"
                  data-sidebar-trigger
                >
                  <Menu className="w-6 h-6" aria-hidden="true" />
                </SidebarTrigger>
                <h1 className="text-2xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">מסע פנימה</h1>
              </div>
            </header>

            <div className="flex-1 overflow-auto">
              {children}
            </div>
          </main>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;600;700;800;900&family=Heebo:wght@300;400;600;700;800;900&display=swap');
            
            * {
              font-family: 'Assistant', 'Heebo', sans-serif !important;
            }
            
            .sr-only {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border-width: 0;
            }
            
            /* Improved text contrast */
            ::selection {
              background-color: rgba(168, 85, 247, 0.3);
              color: white;
            }
            
            /* Better scrollbar */
            ::-webkit-scrollbar {
              width: 10px;
              height: 10px;
            }
            
            ::-webkit-scrollbar-track {
              background: rgba(0, 0, 0, 0.2);
              border-radius: 10px;
            }
            
            ::-webkit-scrollbar-thumb {
              background: rgba(168, 85, 247, 0.5);
              border-radius: 10px;
            }
            
            ::-webkit-scrollbar-thumb:hover {
              background: rgba(168, 85, 247, 0.7);
            }
            
            @media (max-width: 768px) {
              html {
                overflow-y: scroll;
                -webkit-overflow-scrolling: touch;
              }
            }
            
            @supports (-webkit-touch-callout: none) {
              .min-h-screen {
                min-height: -webkit-fill-available;
              }
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
              * {
                border-width: 2px !important;
              }
            }

            /* Reduced motion support */
            @media (prefers-reduced-motion: reduce) {
              * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
            }

            /* Enhanced focus visible for accessibility */
            *:focus-visible {
              outline: 3px solid #A78BFA;
              outline-offset: 3px;
              box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.2);
            }

            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.5; }
            }
          `}</style>
        </div>
      </SidebarProvider>
    </ThemeProvider>
  );
}