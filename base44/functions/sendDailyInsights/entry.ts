import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

/**
 * DAILY INSIGHTS BATCH SENDER
 * פונקציה לשליחת תובנות יומיות לכל המשתמשים
 * להפעלה דרך Cron Job פעם ביום (למשל 8:00 בבוקר)
 * 
 * הערה: פונקציה זו משתמשת ב-Service Role כדי לגשת לכל המשתמשים
 * היא מיועדת להפעלה אוטומטית, לא על ידי משתמשים
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // אימות - ניתן להוסיף כאן בדיקת secret key למניעת שימוש לא מורשה
    const { secret_key } = await req.json().catch(() => ({}));
    
    const expectedSecret = Deno.env.get('DAILY_INSIGHTS_SECRET');
    if (expectedSecret && secret_key !== expectedSecret) {
      return Response.json({ 
        error: 'Unauthorized - invalid secret key' 
      }, { status: 401 });
    }

    // שליפת כל המשתמשים עם מנוי פעיל (דורש Service Role)
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      status: 'active'
    });

    const results = {
      total_users: subscriptions.length,
      insights_created: 0,
      notifications_sent: 0,
      errors: []
    };

    // עבור כל משתמש
    for (const subscription of subscriptions) {
      try {
        const userEmail = subscription.created_by;

        // בדיקה אם המשתמש כבר קיבל תובנה היום
        const today = new Date().toISOString().split('T')[0];
        const existingInsights = await base44.asServiceRole.entities.DailyInsight.filter({
          created_by: userEmail,
          insight_date: today
        });

        if (existingInsights.length > 0) {
          continue; // כבר יש תובנה - מדלגים
        }

        // יצירת תובנה למשתמש זה
        // נשתמש בפונקציה generateDailyInsight אבל דרך Service Role
        const insightResponse = await base44.asServiceRole.functions.invoke('generateDailyInsight', {});
        
        if (insightResponse.data.success && insightResponse.data.insight) {
          results.insights_created++;

          // שליחת אימייל עם התובנה
          try {
            const insight = insightResponse.data.insight;
            
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: userEmail,
              subject: `✨ ${insight.insight_title}`,
              body: `
                <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1e1b4b 0%, #7e22ce 100%); padding: 40px 20px; border-radius: 20px;">
                  <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 15px; padding: 30px; border: 2px solid rgba(251,191,36,0.3);">
                    <h1 style="color: #fbbf24; font-size: 28px; margin-bottom: 10px; text-align: center;">
                      ☀️ התובנה היומית שלך
                    </h1>
                    <p style="color: #fde68a; text-align: center; margin-bottom: 30px; font-size: 16px;">
                      ${new Date().toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    
                    <div style="background: rgba(251,191,36,0.1); border-radius: 12px; padding: 20px; margin-bottom: 25px; border: 1px solid rgba(251,191,36,0.3);">
                      <h2 style="color: #ffffff; font-size: 24px; margin-bottom: 15px;">
                        ${insight.insight_title}
                      </h2>
                      <p style="color: #fde68a; font-size: 18px; line-height: 1.6;">
                        ${insight.insight_content}
                      </p>
                    </div>

                    <div style="background: rgba(251,146,60,0.2); border-radius: 12px; padding: 20px; border: 2px solid rgba(251,146,60,0.4);">
                      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <span style="font-size: 24px;">💡</span>
                        <h3 style="color: #fed7aa; font-size: 16px; margin: 0;">הטיפ המעשי שלך להיום:</h3>
                      </div>
                      <p style="color: #fef3c7; font-size: 16px; line-height: 1.5; margin: 0;">
                        ${insight.actionable_tip}
                      </p>
                    </div>

                    <div style="text-align: center; margin-top: 30px;">
                      <a href="${Deno.env.get('APP_URL') || 'https://app.base44.com'}" 
                         style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; padding: 15px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px;">
                        צפה בפרטים המלאים ←
                      </a>
                    </div>

                    <p style="color: #d8b4fe; text-align: center; margin-top: 25px; font-size: 14px;">
                      💜 מסע פנימה - המסע שלך להכרה עצמית
                    </p>
                  </div>
                </div>
              `
            });

            // עדכון שהתראה נשלחה
            await base44.asServiceRole.entities.DailyInsight.update(insight.id, {
              delivered_via_notification: true,
              notification_sent_date: new Date().toISOString()
            });

            results.notifications_sent++;
          } catch (emailError) {
            console.error('Error sending email to', userEmail, emailError);
            results.errors.push({
              user: userEmail,
              error: 'Email failed: ' + emailError.message
            });
          }
        }
      } catch (userError) {
        console.error('Error processing user:', userError);
        results.errors.push({
          user: subscription.created_by,
          error: userError.message
        });
      }
    }

    return Response.json({
      success: true,
      results
    });

  } catch (error) {
    console.error('Error in batch send:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});