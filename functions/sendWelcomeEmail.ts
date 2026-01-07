import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request
    const { userEmail, userName, planType, billingCycle, trialDays } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'Missing userEmail' }, { status: 400 });
    }

    const planNames = {
      free: 'חינם',
      basic: 'בסיסי',
      premium: 'פרימיום',
      enterprise: 'עסקי'
    };

    const planName = planNames[planType] || 'חינם';
    const isFreePlan = planType === 'free';

    // Email content
    const subject = isFreePlan 
      ? '🎉 ברוכים הבאים למסע פנימה!'
      : `🎉 ברוכים הבאים לחבילת ${planName}!`;

    const body = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; border-radius: 20px;">
        <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">🌙</span>
            </div>
            <h1 style="color: #667eea; margin: 0; font-size: 32px;">מסע פנימה</h1>
            <p style="color: #764ba2; margin: 10px 0 0; font-size: 16px;">חוכמה מיסטית</p>
          </div>

          <!-- Welcome Message -->
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 style="color: #333; font-size: 28px; margin: 0 0 15px;">
              ${isFreePlan ? 'ברוכים הבאים!' : `ברוכים הבאים לחבילת ${planName}! 🎊`}
            </h2>
            <p style="color: #666; font-size: 18px; line-height: 1.6; margin: 0;">
              ${userName ? `שלום ${userName},` : 'שלום,'}<br/>
              ${isFreePlan 
                ? 'שמחים שהצטרפת למשפחת מסע פנימה! אנחנו כאן כדי לעזור לך לגלות את הפוטנציאל המיסטי שלך.'
                : `תודה שבחרת בחבילת ${planName}! אנחנו נרגשים להתחיל את המסע המיסטי שלך.`
              }
            </p>
          </div>

          ${!isFreePlan && trialDays > 0 ? `
          <!-- Trial Info -->
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; text-align: center;">
            <h3 style="color: white; margin: 0 0 10px; font-size: 20px;">🎁 תקופת ניסיון חינם</h3>
            <p style="color: white; margin: 0; font-size: 16px;">
              יש לך ${trialDays} ימים של גישה מלאה בחינם!<br/>
              התשלום הראשון יתבצע רק ב-${new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toLocaleDateString('he-IL')}
            </p>
          </div>
          ` : ''}

          <!-- Benefits -->
          <div style="margin: 30px 0;">
            <h3 style="color: #667eea; font-size: 22px; margin: 0 0 20px; text-align: center;">
              ${isFreePlan ? 'מה תוכל לעשות:' : 'מה קיבלת:'}
            </h3>
            <div style="background: #f8f9ff; border-radius: 12px; padding: 20px;">
              ${isFreePlan ? `
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">3 ניתוחים מיסטיים בחודש</span>
                </div>
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">גישה לכל הכלים המיסטיים</span>
                </div>
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">שמירת היסטוריה אישית</span>
                </div>
                <div style="display: flex; align-items: start;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">ייצוא תוצאות בסיסי</span>
                </div>
              ` : `
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">${planType === 'basic' ? '20 ניתוחים בחודש' : 'ניתוחים ללא הגבלה! ✨'}</span>
                </div>
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">פרשנויות AI מתקדמות</span>
                </div>
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">השוואה בין ניתוחים</span>
                </div>
                <div style="display: flex; align-items: start; margin-bottom: 15px;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">ייצוא PDF מקצועי</span>
                </div>
                <div style="display: flex; align-items: start;">
                  <span style="color: #4ade80; font-size: 20px; margin-left: 10px;">✓</span>
                  <span style="color: #333; font-size: 16px;">עדיפות בתמיכה</span>
                </div>
              `}
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${req.headers.get('origin') || 'https://app.base44.app'}/Home" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              🚀 התחל את המסע שלך
            </a>
          </div>

          <!-- Tips -->
          <div style="background: #fff3cd; border-right: 4px solid #ffc107; border-radius: 8px; padding: 20px; margin: 30px 0;">
            <h4 style="color: #856404; margin: 0 0 10px; font-size: 18px;">💡 טיפ למתחילים:</h4>
            <p style="color: #856404; margin: 0; font-size: 14px; line-height: 1.6;">
              ${isFreePlan 
                ? 'מומלץ להתחיל מניתוח נומרולוגי - הוא מספק בסיס מצוין להבנת האישיות והייעוד שלך.'
                : 'נסה את כל הכלים המיסטיים כדי לקבל תמונה שלמה ומעמיקה על עצמך!'
              }
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px;">
              יש שאלות? אנחנו כאן בשבילך! 💜
            </p>
            <p style="color: #999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} מסע פנימה - חוכמה מיסטית
            </p>
          </div>

        </div>
      </div>
    `;

    // Send email
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: userEmail,
      subject: subject,
      body: body,
      from_name: 'מסע פנימה'
    });

    return Response.json({ 
      success: true,
      message: 'Welcome email sent successfully'
    });

  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return Response.json({ 
      error: 'Failed to send email',
      details: error.message 
    }, { status: 500 });
  }
});