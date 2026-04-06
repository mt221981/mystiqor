import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function DailyForecast() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="תחזית יומית"
          description="התכונה בשדרוג"
          icon={Construction}
          iconGradient="from-yellow-600 to-orange-600"
        />

        <Card className="bg-yellow-900/30 border-yellow-700/50">
          <CardContent className="p-12 text-center">
            <Construction className="w-20 h-20 text-yellow-300 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">
              התכונה בשדרוג טכני 🔧
            </h2>
            <p className="text-yellow-100 text-lg mb-6 leading-relaxed">
              אנחנו משדרגים את מערכת התחזיות היומיות.
              בינתיים, תוכל ליהנות מהתובנות היומיות המותאמות אישית!
            </p>
            <Link 
              to={createPageUrl("DailyInsights")}
              className="inline-block bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all"
            >
              ✨ עבור לתובנות יומיות
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}