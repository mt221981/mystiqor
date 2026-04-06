import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { jsPDF } from 'npm:jspdf@2.5.1';

const addHebrewFont = (doc) => {
  doc.setLanguage("he");
};

const addHeader = (doc, toolName, pageWidth) => {
  doc.setFillColor(75, 0, 130);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setFillColor(147, 51, 234);
  doc.circle(pageWidth - 25, 20, 12, 'F');
  
  doc.setFillColor(255, 255, 255);
  doc.circle(pageWidth - 25, 20, 8, 'F');
  doc.setFillColor(147, 51, 234);
  doc.circle(pageWidth - 22, 18, 7, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.text('מסע פנימה', 20, 25, { align: 'left' });
  
  doc.setFontSize(12);
  doc.setTextColor(200, 200, 255);
  doc.text(toolName, 20, 32, { align: 'left' });
  
  doc.setTextColor(0, 0, 0);
};

const addFooter = (doc, pageNum, totalPages, pageWidth, pageHeight) => {
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  
  doc.text(
    `עמוד ${pageNum} מתוך ${totalPages}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
  
  doc.text(
    'נוצר על ידי מסע פנימה',
    pageWidth / 2,
    pageHeight - 5,
    { align: 'center' }
  );
  
  doc.setFillColor(147, 51, 234);
  doc.circle(20, pageHeight - 7, 1, 'F');
  doc.circle(pageWidth - 20, pageHeight - 7, 1, 'F');
};

const addSectionTitle = (doc, title, y, pageWidth) => {
  doc.setFillColor(245, 243, 255);
  doc.rect(15, y - 5, pageWidth - 30, 12, 'F');
  
  doc.setFontSize(14);
  doc.setTextColor(75, 0, 130);
  doc.setFont(undefined, 'bold');
  doc.text(title, 20, y + 3, { align: 'left' });
  doc.setFont(undefined, 'normal');
  doc.setTextColor(0, 0, 0);
  
  return y + 15;
};

const addWrappedText = (doc, text, x, y, maxWidth, lineHeight = 7) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y, { align: 'right', maxWidth });
  return y + (lines.length * lineHeight);
};

const generateNumerologyPDF = (doc, analysis, pageWidth, pageHeight) => {
  let y = 50;
  
  y = addSectionTitle(doc, '🌟 סיכום כללי', y, pageWidth);
  doc.setFontSize(11);
  
  if (analysis.results?.interpretation?.summary) {
    y = addWrappedText(doc, analysis.results.interpretation.summary, pageWidth - 20, y, pageWidth - 40);
  }
  
  y += 10;
  
  y = addSectionTitle(doc, '🔢 המספרים המרכזיים שלך', y, pageWidth);
  
  const calc = analysis.results?.calculation;
  if (calc) {
    const numbers = [
      { name: 'מספר מסלול חיים', value: calc.life_path?.number, color: [147, 51, 234] },
      { name: 'מספר גורל', value: calc.destiny?.number, color: [59, 130, 246] },
      { name: 'מספר נשמה', value: calc.soul?.number, color: [236, 72, 153] },
      { name: 'מספר אישיות', value: calc.personality?.number, color: [251, 146, 60] }
    ];
    
    numbers.forEach((num) => {
      if (num.value) {
        doc.setFillColor(...num.color);
        doc.circle(pageWidth - 30, y + 5, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(String(num.value), pageWidth - 30, y + 7, { align: 'center' });
        
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.setFont(undefined, 'normal');
        doc.text(num.name, pageWidth - 50, y + 7, { align: 'right' });
        
        y += 18;
      }
    });
  }
  
  if (analysis.results?.interpretation?.interpretations) {
    y += 5;
    analysis.results.interpretation.interpretations.forEach((interp) => {
      if (y > pageHeight - 40) {
        doc.addPage();
        addHeader(doc, 'נומרולוגיה', pageWidth);
        y = 50;
      }
      
      y = addSectionTitle(doc, interp.title, y, pageWidth);
      doc.setFontSize(10);
      y = addWrappedText(doc, interp.content, pageWidth - 20, y, pageWidth - 40);
      
      if (interp.keywords && interp.keywords.length > 0) {
        doc.setFillColor(245, 243, 255);
        const keywordText = interp.keywords.join(' • ');
        const keywordLines = doc.splitTextToSize(keywordText, pageWidth - 50);
        doc.rect(20, y, pageWidth - 40, keywordLines.length * 6 + 4, 'F');
        doc.setFontSize(9);
        doc.setTextColor(75, 0, 130);
        doc.text(keywordLines, pageWidth - 25, y + 5, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        y += keywordLines.length * 6 + 10;
      }
      
      y += 5;
    });
  }
  
  return y;
};

const generatePalmistryPDF = (doc, analysis, pageWidth, pageHeight) => {
  let y = 50;
  
  if (analysis.image_url) {
    y = addSectionTitle(doc, '🖐️ תמונת כף היד שלך', y, pageWidth);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('(תמונת כף היד מוצגת כאן)', pageWidth / 2, y + 30, { align: 'center' });
    y += 70;
    doc.setTextColor(0, 0, 0);
  }
  
  y = addSectionTitle(doc, '🌟 הקריאה שלך', y, pageWidth);
  if (analysis.results?.overall_summary) {
    doc.setFontSize(11);
    y = addWrappedText(doc, analysis.results.overall_summary, pageWidth - 20, y, pageWidth - 40);
  }
  
  y += 10;
  
  if (analysis.results?.major_lines) {
    const lines = [
      { name: '❤️ קו החיים', content: analysis.results.major_lines.life_line },
      { name: '🧠 קו הראש', content: analysis.results.major_lines.head_line },
      { name: '💕 קו הלב', content: analysis.results.major_lines.heart_line },
      { name: '⭐ קו הגורל', content: analysis.results.major_lines.fate_line }
    ];
    
    lines.forEach(line => {
      if (line.content) {
        if (y > pageHeight - 50) {
          doc.addPage();
          addHeader(doc, 'קריאת כף יד', pageWidth);
          y = 50;
        }
        
        y = addSectionTitle(doc, line.name, y, pageWidth);
        doc.setFontSize(10);
        y = addWrappedText(doc, line.content, pageWidth - 20, y, pageWidth - 40);
        y += 8;
      }
    });
  }
  
  if (analysis.results?.strengths && analysis.results.strengths.length > 0) {
    if (y > pageHeight - 60) {
      doc.addPage();
      addHeader(doc, 'קריאת כף יד', pageWidth);
      y = 50;
    }
    
    y = addSectionTitle(doc, '💪 חוזקות', y, pageWidth);
    doc.setFontSize(10);
    analysis.results.strengths.forEach(strength => {
      if (y > pageHeight - 30) {
        doc.addPage();
        addHeader(doc, 'קריאת כף יד', pageWidth);
        y = 50;
      }
      doc.text('✓', pageWidth - 20, y, { align: 'right' });
      y = addWrappedText(doc, strength, pageWidth - 30, y, pageWidth - 50);
      y += 3;
    });
    y += 5;
  }
  
  if (analysis.results?.challenges && analysis.results.challenges.length > 0) {
    if (y > pageHeight - 60) {
      doc.addPage();
      addHeader(doc, 'קריאת כף יד', pageWidth);
      y = 50;
    }
    
    y = addSectionTitle(doc, '⚠️ אתגרים', y, pageWidth);
    doc.setFontSize(10);
    analysis.results.challenges.forEach(challenge => {
      if (y > pageHeight - 30) {
        doc.addPage();
        addHeader(doc, 'קריאת כף יד', pageWidth);
        y = 50;
      }
      doc.text('•', pageWidth - 20, y, { align: 'right' });
      y = addWrappedText(doc, challenge, pageWidth - 30, y, pageWidth - 50);
      y += 3;
    });
  }
  
  return y;
};

const generateTarotPDF = (doc, analysis, pageWidth, pageHeight) => {
  let y = 50;
  
  if (analysis.input_data?.question) {
    y = addSectionTitle(doc, '❓ השאלה שלך', y, pageWidth);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    y = addWrappedText(doc, analysis.input_data.question, pageWidth - 20, y, pageWidth - 40);
    doc.setFont(undefined, 'normal');
    y += 10;
  }
  
  if (analysis.results?.cards) {
    y = addSectionTitle(doc, '🃏 הקלפים שנמשכו', y, pageWidth);
    
    analysis.results.cards.forEach((card) => {
      if (y > pageHeight - 60) {
        doc.addPage();
        addHeader(doc, 'טארוט', pageWidth);
        y = 50;
      }
      
      doc.setFillColor(251, 146, 60);
      doc.rect(20, y - 3, pageWidth - 40, 10, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(`${card.position}: ${card.name_hebrew}`, pageWidth - 25, y + 3, { align: 'right' });
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
      y += 12;
      
      doc.setFontSize(10);
      y = addWrappedText(doc, card.interpretation, pageWidth - 20, y, pageWidth - 40);
      
      if (card.advice) {
        doc.setTextColor(75, 0, 130);
        doc.text('עצה:', pageWidth - 20, y + 5, { align: 'right' });
        doc.setTextColor(0, 0, 0);
        y = addWrappedText(doc, card.advice, pageWidth - 20, y + 12, pageWidth - 40);
      }
      
      y += 10;
    });
  }
  
  if (analysis.results?.overall_message) {
    if (y > pageHeight - 50) {
      doc.addPage();
      addHeader(doc, 'טארוט', pageWidth);
      y = 50;
    }
    
    y = addSectionTitle(doc, '💫 המסר הכללי', y, pageWidth);
    doc.setFontSize(11);
    y = addWrappedText(doc, analysis.results.overall_message, pageWidth - 20, y, pageWidth - 40);
  }
  
  return y;
};

const generateGenericPDF = (doc, analysis, pageWidth, pageHeight) => {
  let y = 50;
  y = addSectionTitle(doc, '🌟 הניתוח שלך', y, pageWidth);
  doc.setFontSize(11);
  const summaryText = analysis.summary || 'ניתוח מיסטי מעמיק';
  y = addWrappedText(doc, summaryText, pageWidth - 20, y, pageWidth - 40);
  return y;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisId } = await req.json();

    if (!analysisId) {
      return Response.json({ error: 'Analysis ID required' }, { status: 400 });
    }

    const analyses = await base44.entities.Analysis.filter({ id: analysisId });
    
    if (analyses.length === 0) {
      return Response.json({ error: 'Analysis not found' }, { status: 404 });
    }

    const analysis = analyses[0];

    if (analysis.created_by !== user.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    addHebrewFont(doc);

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const toolNames = {
      numerology: 'נומרולוגיה',
      palmistry: 'קריאת כף יד',
      graphology: 'גרפולוגיה',
      astrology: 'אסטרולוגיה',
      tarot: 'טארוט'
    };

    const toolName = toolNames[analysis.tool_type] || 'ניתוח מיסטי';

    addHeader(doc, toolName, pageWidth);

    // Generate content based on tool type
    const toolType = analysis.tool_type;
    if (toolType === 'numerology') {
      generateNumerologyPDF(doc, analysis, pageWidth, pageHeight);
    } else if (toolType === 'palmistry') {
      generatePalmistryPDF(doc, analysis, pageWidth, pageHeight);
    } else if (toolType === 'tarot') {
      generateTarotPDF(doc, analysis, pageWidth, pageHeight);
    } else {
      generateGenericPDF(doc, analysis, pageWidth, pageHeight);
    }

    // Add footer to all pages
    const totalPages = doc.internal.pages.length - 1;
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(doc, i, totalPages, pageWidth, pageHeight);
    }

    // Generate PDF as array buffer
    const pdfBytes = doc.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="masa-pnima-${analysis.tool_type}-${Date.now()}.pdf"`
      }
    });

  } catch (error) {
    console.error('PDF generation failed:', error);
    return Response.json({ 
      error: 'Failed to generate PDF',
      details: error.message 
    }, { status: 500 });
  }
});