import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import EnhancedToast from "./EnhancedToast";

export default function GraphologyExportPDF({ analysis, userName }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await base44.functions.invoke('generatePDF', {
        title: "ניתוח גרפולוגי - גרפו-לוגוס",
        subtitle: userName ? `עבור ${userName}` : "",
        content: formatAnalysisForPDF(analysis),
        includeImages: analysis.image_url ? [analysis.image_url] : []
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `graphology-analysis-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      EnhancedToast.success('PDF הורד בהצלחה!', 'הניתוח המלא שלך מוכן');
    } catch (error) {
      EnhancedToast.error('שגיאה בייצוא', error.message);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isExporting}
      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-5 h-5 ml-2 animate-spin" />
          מייצא...
        </>
      ) : (
        <>
          <Download className="w-5 h-5 ml-2" />
          ייצא ל-PDF
        </>
      )}
    </Button>
  );
}

function formatAnalysisForPDF(analysis) {
  let content = [];

  if (analysis.image_quality_assessment) {
    content.push({
      heading: "הערכת איכות תמונה",
      text: `ציון כללי: ${Math.round(analysis.image_quality_assessment.overall_score * 100)}%`
    });
  }

  if (analysis.authenticity_assessment) {
    content.push({
      heading: "אימות אותנטיות (FDE)",
      text: analysis.authenticity_assessment.forensic_report || "הכתב נראה אותנטי"
    });
  }

  if (analysis.form_niveau) {
    content.push({
      heading: `Formniveau - ${analysis.form_niveau.score}/10`,
      text: analysis.form_niveau.interpretation
    });
  }

  if (analysis.personality_snapshot) {
    content.push({
      heading: analysis.personality_snapshot.title,
      text: analysis.personality_snapshot.summary
    });
  }

  if (analysis.insights) {
    analysis.insights.forEach((insight, idx) => {
      content.push({
        heading: `תובנה ${idx + 1}: ${insight.title}`,
        text: insight.content
      });
    });
  }

  if (analysis.disclaimer) {
    content.push({
      heading: "הצהרת מגבלות מדעיות",
      text: analysis.disclaimer
    });
  }

  return content;
}