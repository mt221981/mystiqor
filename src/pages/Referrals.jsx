import { useState, useEffect, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gift, Users, Share2, Copy, CheckCircle, Mail } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function Referrals() {
  const queryClient = useQueryClient();
  const [referralCode, setReferralCode] = useState("");
  const [shareEmail, setShareEmail] = useState("");

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000
  });

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }, '-created_date', 50),
    enabled: !!user,
    initialData: [],
    staleTime: 30000
  });

  useEffect(() => {
    if (user && !referralCode) {
      const code = `MASAPNIMA-${user.email.split('@')[0].toUpperCase()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      setReferralCode(code);
      
      base44.entities.Referral.filter({ referral_code: code }).then(existing => {
        if (existing.length === 0) {
          base44.entities.Referral.create({
            referrer_email: user.email,
            referral_code: code,
            status: 'pending'
          }).catch(() => {});
        }
      });
    }
  }, [user, referralCode]);

  const referralLink = useMemo(() => 
    `${window.location.origin}?ref=${referralCode}`,
    [referralCode]
  );

  const completedReferrals = useMemo(() => 
    referrals.filter(r => r.status === 'completed' || r.status === 'rewarded'),
    [referrals]
  );

  const totalRewards = useMemo(() => 
    completedReferrals.reduce((sum, r) => sum + (r.reward_value || 0), 0),
    [completedReferrals]
  );

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(referralLink);
    EnhancedToast.success('הקישור הועתק!', 'שתף עם חברים וקבל ניתוחים חינם');
  }, [referralLink]);

  const shareViaEmail = useCallback(async () => {
    if (!shareEmail) {
      EnhancedToast.error('נא להזין כתובת מייל');
      return;
    }

    try {
      await base44.integrations.Core.SendEmail({
        to: shareEmail,
        subject: 'הזמנה למסע פנימה - גלה את עצמך! 🌟',
        body: `היי!
        
${user?.full_name || 'חבר'} הזמין אותך להצטרף למסע פנימה - פלטפורמה מיסטית לגילוי עצמי.

🎁 הירשם דרך הקישור המיוחד שלו וקבל 3 ניתוחים חינם:
${referralLink}

גלה את סודות הנומרולוגיה, אסטרולוגיה, טארוט ועוד!

בברכה,
צוות מסע פנימה`
      });

      await base44.entities.Referral.create({
        referrer_email: user.email,
        referred_email: shareEmail,
        referral_code: referralCode,
        status: 'pending',
        reward_type: 'free_analyses',
        reward_value: 3
      });

      EnhancedToast.success('ההזמנה נשלחה!');
      setShareEmail("");
      queryClient.invalidateQueries({ queryKey: ['referrals'] });
    } catch (error) {
      EnhancedToast.error('אירעה שגיאה בשליחת ההזמנה');
    }
  }, [shareEmail, user, referralLink, referralCode, queryClient]);

  const shareOnWhatsApp = useCallback(() => {
    const message = `היי! 🌟\n\nהצטרף אליי למסע פנימה - פלטפורמה מיסטית מדהימה לגילוי עצמי!\n\n🎁 הירשם דרך הקישור שלי וקבל 3 ניתוחים חינם:\n${referralLink}\n\nנומרולוגיה, אסטרולוגיה, טארוט ועוד...`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  }, [referralLink]);

  const shareOnFacebook = useCallback(() => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  }, [referralLink]);

  if (isLoading) {
    return <LoadingSpinner message="טוען..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-green-950/30 to-black p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="הזמן חברים"
          description="שתף את מסע פנימה וקבל ניתוחים חינם"
          icon={Gift}
          iconGradient="from-green-600 to-emerald-600"
        />

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl border-green-700/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-green-300 text-sm">סה"כ הזמנות</p>
                    <p className="text-white text-3xl font-bold">{referrals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl border-blue-700/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-300 text-sm">הזמנות מושלמות</p>
                    <p className="text-white text-3xl font-bold">{completedReferrals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-purple-700/30">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-purple-300 text-sm">ניתוחים שהרווחת</p>
                    <p className="text-white text-3xl font-bold">{totalRewards}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card className="bg-green-900/30 backdrop-blur-xl border-green-700/30 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-2xl">הקישור האישי שלך</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-3">
              <Input
                value={referralLink}
                readOnly
                className="bg-green-800/30 border-green-600/50 text-white flex-1"
                dir="ltr"
              />
              <Button
                onClick={copyToClipboard}
                className="bg-green-600 hover:bg-green-700"
              >
                <Copy className="w-5 h-5 ml-2" />
                העתק
              </Button>
            </div>

            <div className="bg-green-800/20 rounded-xl p-6">
              <h3 className="text-green-300 font-bold mb-3 text-lg">
                🎁 איך זה עובד?
              </h3>
              <ul className="space-y-2 text-green-200">
                <li className="flex items-start gap-2">
                  <span>1️⃣</span>
                  <span>שתף את הקישור האישי שלך עם חברים</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>2️⃣</span>
                  <span>החבר שלך נרשם ומבצע את הניתוח הראשון</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>3️⃣</span>
                  <span>אתה מקבל 3 ניתוחים חינם! 🎉</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>4️⃣</span>
                  <span>גם החבר שלך מקבל 3 ניתוחים חינם!</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-white font-bold text-lg">שיתוף מהיר</h3>
              
              <div className="grid md:grid-cols-2 gap-3">
                <Button
                  onClick={shareOnWhatsApp}
                  className="bg-green-600 hover:bg-green-700 h-12"
                >
                  <Share2 className="w-5 h-5 ml-2" />
                  WhatsApp
                </Button>
                
                <Button
                  onClick={shareOnFacebook}
                  className="bg-blue-600 hover:bg-blue-700 h-12"
                >
                  <Share2 className="w-5 h-5 ml-2" />
                  Facebook
                </Button>
              </div>

              <div className="flex gap-3">
                <Input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="מייל של חבר להזמנה..."
                  className="bg-green-800/30 border-green-600/50 text-white flex-1"
                  dir="rtl"
                />
                <Button
                  onClick={shareViaEmail}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Mail className="w-5 h-5 ml-2" />
                  שלח
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-900/30 backdrop-blur-xl border-green-700/30">
          <CardHeader>
            <CardTitle className="text-white text-2xl">ההזמנות שלך</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Gift className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <p className="text-green-200 text-lg">עדיין לא הזמנת אף אחד</p>
                <p className="text-green-300 text-sm mt-2">התחל לשתף והרווח ניתוחים חינם!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between p-4 bg-green-800/20 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-semibold">
                        {referral.referred_email || 'טרם נרשם'}
                      </p>
                      <p className="text-green-300 text-sm">
                        נשלח: {format(new Date(referral.created_date), 'dd/MM/yyyy', { locale: he })}
                      </p>
                    </div>
                    <Badge className={
                      referral.status === 'completed' || referral.status === 'rewarded'
                        ? 'bg-green-600 text-white'
                        : 'bg-yellow-600 text-white'
                    }>
                      {referral.status === 'completed' || referral.status === 'rewarded' ? '✓ הושלם' : '⏳ ממתין'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}