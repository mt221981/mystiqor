import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request
    const { userEmail, userName, analysesUsed, analysesLimit, planType } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'Missing userEmail' }, { status: 400 });
    }

    const remaining = analysesLimit - analysesUsed;
    const percentage = Math.round((analysesUsed / analysesLimit) * 100);

    const planNames = {
      free: 'חינם',
      basic: 'בסיסי'
    };

    const planName = planNames[planType] || 'חינם';

    // Email content
    const subject = remaining === 0 
      ? '⚠️ הגעת למגבלת הניתוחים החודשית'
      : `⚠️ נותרו לך ${remaining} ניתוחים החודש`;

    const body = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 20px; border-radius: 20px;">
        <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">⚠️</span>
            </div>
            <h1 style="color: #f59e0b; margin: 0; font-size: 28px;">
              ${remaining === 0 ? 'הגעת למגבלה החודשית' : 'המכסה שלך עומדת להיגמר'}
            </h1>
          </div>

          <!-- Usage Stats -->
          <div style="background: #fef3c7; border-radius: 12px; padding: 25px; margin-bottom: 30px; text-align: center;">
            <p style="color: #92400e; font-size: 16px; margin: 0 0 15px;">
              ${userName ? `שלום ${userName},` : 'שלום,'}
            </p>
            <div style="font-size: 48px; font-weight: bold; color: #f59e0b; margin: 15px 0;">
              ${analysesUsed} / ${analysesLimit}
            </div>
            <p style="color: #92400e; font-size: 18px; margin: 0;">
              ${remaining === 0 
                ? 'השתמשת בכל הניתוחים שלך החודש'
                : `נותרו לך עוד ${remaining} ניתוחים`
              }
            </p>
            
            <!-- Progress Bar -->
            <div style="background: #fde68a; height: 12px; border-radius: 6px; margin: 20px 0; overflow: hidden;">
              <div style="background: linear-gradient(90deg, #f59e0b 0%, #dc2626 100%); height: 100%; width: ${percentage}%; border-radius: 6px; transition: width 0.3s;"></div>
            </div>
          </div>

          ${remaining === 0 ? `
          <!-- Out of Analyses -->
          <div style="background: #fee2e2; border-right: 4px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #991b1b; margin: 0 0 10px; font-size: 20px;">😔 אין ניתוחים נוספים</h3>
            <p style="color: #991b1b; margin: 0; font-size: 16px; line-height: 1.6;">
              הגעת למגבלת הניתוחים בחבילת ${planName}. כדי להמשיך להשתמש בכלים המיסטיים, שדרג לחבילה מתקדמת יותר!
            </p>
          </div>
          ` : `
          <!-- Low Analyses Warning -->
          <div style="background: #fef3c7; border-right: 4px solid #f59e0b; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #92400e; margin: 0 0 10px; font-size: 20px;">⏰ המכסה עומדת להיגמר</h3>
            <p style="color: #92400e; margin: 0; font-size: 16px; line-height: 1.6;">
              נותרו לך רק ${remaining} ניתוחים נוספים החודש. שקול לשדרג כדי ליהנות מניתוחים ללא הגבלה!
            </p>
          </div>
          `}

          <!-- Upgrade Options -->
          <div style="margin: 30px 0;">
            <h3 style="color: #667eea; font-size: 22px; margin: 0 0 20px; text-align: center;">
              💎 שדרג והמשך את המסע
            </h3>
            
            <!-- Premium Plan -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin-bottom: 15px; color: white;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; font-size: 24px;">👑 פרימיום</h4>
                <div style="text-align: left;">
                  <div style="font-size: 32px; font-weight: bold;">₪99</div>
                  <div style="font-size: 14px; opacity: 0.9;">לחודש</div>
                </div>
              </div>
              <div style="font-size: 16px; opacity: 0.95; line-height: 1.8;">
                ✨ ניתוחים ללא הגבלה<br/>
                🎯 פרשנויות AI מתקדמות<br/>
                📊 השוואה בין ניתוחים<br/>
                💼 עדיפות בתמיכה
              </div>
            </div>

            <!-- Basic Plan -->
            <div style="background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%); border-radius: 12px; padding: 25px; color: white;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="margin: 0; font-size: 24px;">⚡ בסיסי</h4>
                <div style="text-align: left;">
                  <div style="font-size: 32px; font-weight: bold;">₪49</div>
                  <div style="font-size: 14px; opacity: 0.9;">לחודש</div>
                </div>
              </div>
              <div style="font-size: 16px; opacity: 0.95; line-height: 1.8;">
                📈 20 ניתוחים בחודש<br/>
                🔮 כל הכלים המיסטיים<br/>
                📄 ייצוא PDF מתקדם<br/>
                💬 תמיכה במייל
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${req.headers.get('origin') || 'https://app.base44.app'}/Pricing" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 40px; border-radius: 30px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              🚀 שדרג עכשיו
            </a>
          </div>

          <!-- Reset Info -->
          <div style="background: #e0e7ff; border-radius: 8px; padding: 15px; text-align: center; margin: 20px 0;">
            <p style="color: #4338ca; margin: 0; font-size: 14px;">
              💡 המכסה החודשית שלך תתאפס ב-1 לחודש הבא
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
      message: 'Usage limit email sent successfully'
    });

  } catch (error) {
    console.error('Failed to send usage limit email:', error);
    return Response.json({ 
      error: 'Failed to send email',
      details: error.message 
    }, { status: 500 });
  }
});