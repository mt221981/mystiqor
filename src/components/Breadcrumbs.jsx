import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, Home } from "lucide-react";

const PAGE_NAMES = {
  "Home": "דף הבית",
  "Numerology": "נומרולוגיה",
  "Palmistry": "כף יד",
  "Graphology": "גרפולוגיה",
  "DrawingAnalysis": "ניתוח ציור",
  "Astrology": "אסטרולוגיה",
  "Tarot": "קלפי טארוט",
  "MyAnalyses": "הניתוחים שלי",
  "CompareAnalyses": "השוואה",
  "CompareDrawingAnalyses": "השוואת ציורים",
  "Pricing": "מחירים",
  "ManageSubscription": "ניהול מנוי",
  "EditProfile": "הפרטים שלי",
  "ManageProfiles": "אנשים נוספים",
  "AICoach": "המאמן שלי",
  "Journal": "היומן שלי",
  "MysticSynthesis": "שילוב הכלים",
  "Compatibility": "התאמה",
  "AstroCalendar": "לוח שנה",
  "Referrals": "הזמן חברים",
  "Transits": "מעברים אסטרולוגיים",
  "TimingTools": "כלי תזמון",
  "SolarReturn": "Solar Return",
  "SavedGraphologyInsights": "תובנות שמורות"
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  
  if (pathParts.length === 0 || pathParts[0] === 'Home') {
    return null; // לא מציגים breadcrumbs בדף הבית
  }

  const pageName = pathParts[pathParts.length - 1];
  const pageTitle = PAGE_NAMES[pageName] || pageName;

  return (
    <div className="flex items-center gap-2 text-sm mb-4 px-2">
      <Link 
        to={createPageUrl("Home")} 
        className="flex items-center gap-1 text-purple-300 hover:text-purple-100 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span>דף הבית</span>
      </Link>
      <ChevronLeft className="w-4 h-4 text-purple-500" />
      <span className="text-white font-semibold">{pageTitle}</span>
    </div>
  );
}