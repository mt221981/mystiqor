import React from "react";
import { Palette } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import DrawingComparison from "@/components/DrawingComparison";

export default function CompareDrawingAnalyses() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-950 via-purple-950 to-pink-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="השוואת ניתוחי ציורים 🎨"
          description="עקוב אחר ההתפתחות והצמיחה האישית שלך לאורך זמן"
          icon={Palette}
          iconGradient="from-pink-600 to-purple-600"
        />

        <DrawingComparison />
      </div>
    </div>
  );
}