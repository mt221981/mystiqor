import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Parse request
    const { userEmail, userName, amount, currency, planType, errorMessage } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'Missing userEmail' }, { status: 400 });
    }

    const planNames = {
      basic: 'בסיסי',
      premium: 'פרימיום',
      enterprise: 'עסקי'
    };

    const planName = planNames[planType] || planType;

    // Email content
    const subject = '❌ התשלום נכשל - נדרשת פעולה';

    const body = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px 20px; border-radius: 20px;">
        <div style="background: white; border-radius: 15px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
          
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px;">❌</span>
            </div>
            <h1 style="color: #dc2626; margin: 0; font-size: 28px;">התשלום נכשל</h1>
          </div>

          <!-- Message -->
          <div style="background: #fee2e2; border-right: 4px solid #dc2626; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            <p style="color: #991b1b; font-size: 16px; margin: 0 0 15px;">
              ${userName ? `שלום ${userName},` : 'שלום,'}
            </p>
            <p style="color: #991b1b; font-size: 16px; margin: 0; line-height: 1.6;">
              הניסיון לחייב את כרטיס האשראי שלך עבור חבילת <strong>${planName}</strong> נכשל.
            </p>
          </div>

          <!-- Payment Details -->
          <div style="background: #f9fafb; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #374151; margin: 0 0 15px; font-size: 18px;">פרטי התשלום:</h3>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">סכום:</span>
              <span style="color: #111827; font-weight: bold;">${amount} ${currency}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #e5e7eb;">
              <span style="color: #6b7280;">חבילה:</span>
              <span style="color: #111827; font-weight: bold;">${planName}</span>
            </div>
            ${errorMessage ? `
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #6b7280;">סיבה:</span>
              <span style="color: #dc2626; font-weight: bold;">${errorMessage}</span>
            </div>
            ` : ''}
          </div>

          <!-- Why This Happened -->
          <div style="margin-bottom: 30px;">
            <h3 style="color: #374151; margin: 0 0 15px; font-size: 18px;">למה זה קרה?</h3>
            <div style="background: #fffbeb; border-radius: 8px; padding: 15px;">
              <ul style="margin: 0; padding: 0 0 0 20px; color: #92400e; font-size: 14px; line-height: 1.8;">
                <li>יתרה לא מספקת בכרטיס</li>
                <li>כרטיס פג תוקף</li>
                <li>פרטי כרטיס שגויים</li>
                <li>הבנק חסם את העסקה</li>
              </ul>
            </div>
          </div>

          <!-- What Happens Now -->
          <div style="background: #e0e7ff; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
            <h3 style="color: #3730a3; margin: 0 0 15px; font-size: 18px;">מה קורה עכשיו?</h3>
            <p style="color: #3730a3; font-size: 14px; margin: 0; line-height: 1.8;">
              ⏱️ ננסה לחייב את הכרטיס שוב בעוד מספר ימים<br/>
              ⚠️ אם התשלום ימשיך להיכשל, המנוי שלך עלול להתבטל<br/>
              📧 תקבל עדכון נוסף בכל שינוי
            </p>
          </div>

          <!-- Action Required -->
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; color: white; text-align: center;">
            <h3 style="margin: 0 0 15px; font-size: 20px;">🔧 פעולה נדרשת</h3>
            <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6;">
              כדי להמשיך ליהנות מחבילת ${planName}, נא לעדכן את פרטי התשלום שלך או להשתמש בכרטיס אחר.
            </p>
            <a href="${req.headers.get('origin') || 'https://app.base44.app'}/ManageSubscription" 
               style="display: inline-block; background: white; color: #667eea; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: bold;">
              עדכן פרטי תשלום
            </a>
          </div>

          <!-- Support -->
          <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; text-align: center;">
            <h4 style="color: #166534; margin: 0 0 10px; font-size: 16px;">💚 צריך עזרה?</h4>
            <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.6;">
              אם אתה נתקל בבעיה או צריך סיוע, אנחנו כאן בשבילך!<br/>
              פנה אלינו ונעזור לפתור את הבעיה במהירות.
            </p>
          </div>

          <!-- Footer -->
          <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 2px solid #e5e7eb;">
            <p style="color: #999; font-size: 14px; margin: 0 0 10px;">
              מסע פנימה - חוכמה מיסטית 💜
            </p>
            <p style="color: #999; font-size: 12px; margin: 0;">
              © ${new Date().getFullYear()} כל הזכויות שמורות
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
      message: 'Payment failed email sent successfully'
    });

  } catch (error) {
    console.error('Failed to send payment failed email:', error);
    return Response.json({ 
      error: 'Failed to send email',
      details: error.message 
    }, { status: 500 });
  }
});