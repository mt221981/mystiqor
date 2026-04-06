import React from "react";
import { BookmarkCheck } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import SavedInsights from "@/components/SavedInsights";
import { usePageView } from "@/components/Analytics";

export default function SavedGraphologyInsights() {
  usePageView('SavedGraphologyInsights');

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="תובנות שמורות"
          description="התובנות הגרפולוגיות שבחרת לשמור"
          icon={BookmarkCheck}
          iconGradient="from-yellow-600 to-amber-600"
        />

        <SavedInsights />
      </div>
    </div>
  );
}