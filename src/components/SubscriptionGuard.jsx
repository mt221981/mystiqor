import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Crown, Sparkles, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useSubscription from "./useSubscription";

const PLAN_FEATURES = {
  free: {
    analyses: 3,
    features: ["3 ניתוחים בחודש", "גישה לכל הכלים", "שמירת תוצאות"]
  },
  basic: {
    analyses: 20,
    features: ["20 ניתוחים בחודש", "גישה לכל הכלים", "ייצוא PDF", "תמיכה בסיסית"]
  },
  premium: {
    analyses: -1,
    features: ["ניתוחים ללא הגבלה", "ייעוץ AI מתקדם", "פרופילי אורחים", "גישה לכל התכונות", "תמיכה מועדפת", "גישה מוקדמת לתכונות חדשות"]
  },
  enterprise: {
    analyses: -1,
    features: ["כל מה שב-פרמיום", "ניתוחים משולבים", "API גישה", "תמיכה ייעודית", "התאמות אישיות"]
  }
};

export default function SubscriptionGuard({ children, toolName = "כלי זה" }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const { 
    subscription, 
    isLoading, 
    planInfo, 
    remainingAnalyses,
    usagePercentage,
    canUseAnalysis
  } = useSubscription();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 flex items-center justify-center">
        <Card className="bg-purple-900/50 border-purple-700/30">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-xl">בודק את המנוי שלך...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!canUseAnalysis()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-950 via-purple-950 to-red-900 p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <Card className="bg-gradient-to-br from-red-900/80 to-purple-900/80 backdrop-blur-xl border-red-600/50 border-2 shadow-2xl">
            <CardContent className="p-12">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lock className="w-12 h-12 text-white" />
                </div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  הגעת למגבלת הניתוחים
                </h1>
                <p className="text-red-200 text-xl mb-6">
                  השתמשת בכל {planInfo?.analyses} הניתוחים החודשיים שלך
                </p>
              </div>

              <div className="bg-purple-900/40 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-purple-200 font-semibold">המנוי שלך:</span>
                  <Badge className="bg-gray-700 text-white text-lg px-4 py-1">
                    {planInfo?.name}
                  </Badge>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-purple-300">שימוש החודש</span>
                    <span className="text-white font-bold">{subscription?.analyses_used || 0} / {planInfo?.analyses}</span>
                  </div>
                  <div className="w-full bg-purple-950 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-red-500 to-rose-500 h-3 rounded-full transition-all"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h3 className="text-2xl font-bold text-white text-center mb-6">
                  מה כולל המנוי הבא?
                </h3>
                {PLAN_FEATURES.premium.features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 bg-purple-900/30 rounded-lg p-4"
                  >
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    <span className="text-white">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <Link to={createPageUrl("Pricing")}>
                <Button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-xl h-16">
                  <Crown className="w-6 h-6 ml-2" />
                  שדרג עכשיו לבלתי מוגבל
                  <ArrowLeft className="w-6 h-6 mr-2" />
                </Button>
              </Link>

              <p className="text-center text-purple-300 mt-6">
                💜 או חכה עד {subscription?.last_reset_date 
                  ? new Date(new Date(subscription.last_reset_date).setMonth(new Date(subscription.last_reset_date).getMonth() + 1)).toLocaleDateString('he-IL', { day: 'numeric', month: 'long' })
                  : 'תחילת החודש הבא'
                } לאיפוס המכסה
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return children;
}