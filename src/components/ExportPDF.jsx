import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

export default function ExportPDF({ analysis, variant = "outline", size = "icon" }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Call the PDF generation function
      const response = await base44.functions.invoke('generatePDF', {
        analysisId: analysis.id
      });

      // Create blob from response
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `masa-pnima-${analysis.tool_type}-${Date.now()}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('הקובץ הורד בהצלחה! 📄');
    } catch (error) {
      console.error('PDF export failed:', error);
      toast.error('אירעה שגיאה בייצוא ה-PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      onClick={handleExport}
      disabled={isExporting}
      className="border-green-600 text-green-400 hover:bg-green-900/30"
      title="ייצוא ל-PDF"
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
    </Button>
  );
}