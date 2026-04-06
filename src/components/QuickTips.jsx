import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

const TIPS = {
  Numerology: [
    "💡 השתמש בשמך המלא כפי שמופיע בתעודת הזהות לתוצאות מדויקות",
    "🎯 גימטריה החרחי היא השיטה המסורתית והמדויקת ביותר בעברית",
    "✨ מספר מסלול החיים הוא המספר החשוב ביותר בנומרולוגיה"
  ],
  Palmistry: [
    "📸 צלם את כף היד בתאורה טבעית ובצורה ישרה",
    "🖐️ כף היד הדומיננטית (ימין או שמאל) מייצגת את ההווה והעתיד",
    "✨ קו החיים לא מציין אורך חיים, אלא איכות חיים"
  ],
  Graphology: [
    "✍️ כתוב בצורה טבעית - אל תנסה לשפר את הכתב",
    "📝 כתוב 5-7 שורות לפחות לניתוח מדויק",
    "💡 השתמש בעט רגיל על נייר לבן רגיל"
  ],
  Astrology: [
    "🌟 שעת הלידה המדויקת חיונית לחישוב האסנדנט",
    "📍 מיקום הלידה משפיע על מיקום הבתים האסטרולוגיים",
    "✨ Big Three (שמש, ירח, אסנדנט) הם הבסיס לניתוח אסטרולוגי"
  ],
  Tarot: [
    "🃏 התמקד בשאלה ספציפית לקבלת תשובה ברורה",
    "🎯 קריאת 3 קלפים מתאימה לשאלות כלליות",
    "✨ הטארוט מציע הכוונה, לא חיזוי קבוע בלתי ניתן לשינוי"
  ]
};

export default function QuickTips({ page }) {
  const tips = TIPS[page];

  if (!tips || tips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="mb-8"
    >
      <Card className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 backdrop-blur-xl border-blue-700/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl mb-3">💡 טיפים מהירים</h3>
              <ul className="space-y-2">
                {tips.map((tip, idx) => (
                  <li key={idx} className="text-blue-200 leading-relaxed">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}