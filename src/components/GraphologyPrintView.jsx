import React from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function GraphologyPrintView({ analysis, userName }) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Button
        onClick={handlePrint}
        variant="outline"
        className="border-purple-600 text-purple-300 hover:bg-purple-800/30 print:hidden"
      >
        <Printer className="w-5 h-5 ml-2" />
        הדפס
      </Button>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 2cm;
          }

          body {
            background: white !important;
            color: black !important;
          }

          .print-section {
            page-break-inside: avoid;
            margin-bottom: 1cm;
          }

          .print-header {
            border-bottom: 3px solid #6B21A8;
            padding-bottom: 1cm;
            margin-bottom: 1cm;
          }

          .no-print {
            display: none !important;
          }

          h1, h2, h3 {
            color: #6B21A8 !important;
            page-break-after: avoid;
          }

          .chart, .radar-chart {
            break-inside: avoid;
          }
        }
      `}</style>

      <div className="hidden print:block bg-white text-black p-8">
        <div className="print-header">
          <h1 className="text-4xl font-bold text-purple-900 mb-2">
            ניתוח גרפולוגי - גרפו-לוגוס
          </h1>
          <p className="text-gray-600 text-lg mb-4">מבוסס על 140+ מקורות מחקר</p>
          {userName && <p className="text-gray-700">עבור: {userName}</p>}
          <p className="text-gray-500 text-sm">
            תאריך: {format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: he })}
          </p>
        </div>

        {analysis.image_quality_assessment && (
          <div className="print-section">
            <h2 className="text-2xl font-bold mb-3">הערכת איכות תמונה</h2>
            <p>ציון כללי: {Math.round(analysis.image_quality_assessment.overall_score * 100)}%</p>
          </div>
        )}

        {analysis.authenticity_assessment && (
          <div className="print-section">
            <h2 className="text-2xl font-bold mb-3">אימות אותנטיות (FDE - מדעי)</h2>
            <p className="text-sm leading-relaxed">
              {analysis.authenticity_assessment.forensic_report}
            </p>
            {!analysis.authenticity_assessment.is_natural && (
              <div className="bg-red-100 border-2 border-red-600 rounded p-4 mt-3">
                <p className="font-bold text-red-900">⚠️ זיוף חשוד!</p>
              </div>
            )}
          </div>
        )}

        {analysis.form_niveau && (
          <div className="print-section">
            <h2 className="text-2xl font-bold mb-3">
              Formniveau: {analysis.form_niveau.score}/10
            </h2>
            <div className="bg-yellow-50 border border-yellow-600 rounded p-3 mb-3">
              <p className="text-sm">{analysis.form_niveau.theoretical_note}</p>
            </div>
            <p className="text-sm leading-relaxed">{analysis.form_niveau.interpretation}</p>
          </div>
        )}

        {analysis.personality_snapshot && (
          <div className="print-section">
            <h2 className="text-2xl font-bold mb-3">{analysis.personality_snapshot.title}</h2>
            <p className="text-sm leading-relaxed">{analysis.personality_snapshot.summary}</p>
          </div>
        )}

        {analysis.personality_snapshot?.big_five_comparison && (
          <div className="print-section">
            <h2 className="text-2xl font-bold mb-3">Big Five Comparison (Garoot 2021)</h2>
            <div className="grid grid-cols-5 gap-4 mb-3">
              <div className="text-center border rounded p-2">
                <p className="text-xs mb-1">פתיחות</p>
                <p className="text-lg font-bold">{analysis.personality_snapshot.big_five_comparison.openness}%</p>
              </div>
              <div className="text-center border rounded p-2">
                <p className="text-xs mb-1">מצפוניות</p>
                <p className="text-lg font-bold">{analysis.personality_snapshot.big_five_comparison.conscientiousness}%</p>
              </div>
              <div className="text-center border rounded p-2">
                <p className="text-xs mb-1">מוחצנות</p>
                <p className="text-lg font-bold">{analysis.personality_snapshot.big_five_comparison.extraversion}%</p>
              </div>
              <div className="text-center border rounded p-2">
                <p className="text-xs mb-1">נעימות</p>
                <p className="text-lg font-bold">{analysis.personality_snapshot.big_five_comparison.agreeableness}%</p>
              </div>
              <div className="text-center border rounded p-2">
                <p className="text-xs mb-1">יציבות</p>
                <p className="text-lg font-bold">{100 - analysis.personality_snapshot.big_five_comparison.neuroticism}%</p>
              </div>
            </div>
            <div className="bg-yellow-50 border border-yellow-600 rounded p-3">
              <p className="text-xs">{analysis.personality_snapshot.big_five_comparison.garoot_disclaimer}</p>
            </div>
          </div>
        )}

        {analysis.insights && (
          <div className="print-section">
            <h2 className="text-2xl font-bold mb-4">תובנות עמוקות ({analysis.insights.length})</h2>
            {analysis.insights.slice(0, 5).map((insight, idx) => (
              <div key={idx} className="mb-6 border-b pb-4">
                <h3 className="text-xl font-bold mb-2">{insight.title}</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {insight.content.substring(0, 500)}...
                </p>
                {insight.provenance?.sources && (
                  <p className="text-xs text-gray-600 mt-2">
                    מקורות: {insight.provenance.sources.slice(0, 2).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {analysis.disclaimer && (
          <div className="print-section bg-red-50 border-2 border-red-600 rounded p-4">
            <h2 className="text-xl font-bold mb-3 text-red-900">⚖️ הצהרת מגבלות מדעיות</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {analysis.disclaimer.substring(0, 800)}...
            </p>
          </div>
        )}

        <div className="mt-8 pt-4 border-t text-center text-xs text-gray-500">
          <p>מסע פנימה - גרפו-לוגוס • לבידור וחינוך בלבד • לא אבחון מדעי</p>
          <p className="mt-1">נוצר ב: {format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: he })}</p>
        </div>
      </div>
    </>
  );
}