import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Sparkles, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import { usePageView } from "@/components/Analytics";
import useSubscription from "@/components/useSubscription";

const PLANS = [
  {
    id: 'free',
    name: 'חינמי',
    price: 0,
    period: 'לתמיד',
    icon: Sparkles,
    gradient: 'from-gray-700 to-gray-800',
    features: [
      '3 ניתוחים בחודש',
      'גישה לכלים בסיסיים',
      'פרופיל אחד',
      'תמיכה קהילתית'
    ],
    limitations: ['ללא AI מתקדם', 'ללא גישה להיסטוריה מלאה']
  },
  {
    id: 'basic',
    name: 'בסיסי',
    price: 49,
    period: 'חודש',
    icon: Zap,
    gradient: 'from-blue-600 to-cyan-600',
    popular: true,
    features: [
      '20 ניתוחים בחודש',
      'כל הכלים המיסטיים',
      '3 פרופילי אורח',
      'AI Coach בסיסי',
      'היסטוריה מלאה',
      'תמיכה במייל'
    ]
  },
  {
    id: 'premium',
    name: 'פרימיום',
    price: 99,
    period: 'חודש',
    icon: Crown,
    gradient: 'from-purple-600 to-pink-600',
    features: [
      '♾️ ניתוחים ללא הגבלה',
      'כל התכונות',
      'ללא הגבלת אורחים',
      'AI Coach מתקדם',
      'תובנות חיזוי',
      'קואצ\'ינג אישי',
      'גישה מוקדמת לתכונות חדשות',
      'תמיכה עדיפות'
    ],
    badge: 'הכי פופולרי'
  }
];

export default function Pricing() {
  usePageView('Pricing');
  const [loadingPlan, setLoadingPlan] = useState(null);
  const { subscription, isLoading: subLoading } = useSubscription();

  const checkoutMutation = useMutation({
    mutationFn: async (planId) => {
      const response = await base44.functions.invoke('createCheckoutSession', {
        planId,
        successUrl: `${window.location.origin}/subscription-success`,
        cancelUrl: `${window.location.origin}/pricing`
      });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error) => {
      EnhancedToast.error('שגיאה ביצירת תשלום');
      console.error(error);
      setLoadingPlan(null);
    }
  });

  const handleSelectPlan = async (planId) => {
    if (planId === 'free') {
      EnhancedToast.info('אתה כבר במנוי החינמי!');
      return;
    }

    setLoadingPlan(planId);
    checkoutMutation.mutate(planId);
  };

  const currentPlanId = subscription?.plan_type || 'free';

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="בחר את התוכנית המתאימה לך"
          description="כל התוכניות כוללות גישה מלאה לכלים המיסטיים שלנו"
          icon={Crown}
          iconGradient="from-purple-600 to-pink-600"
        />

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-4 py-1">
                    ⭐ הכי פופולרי
                  </Badge>
                </div>
              )}

              <Card className={`h-full bg-gray-900/80 border-2 ${
                plan.popular ? 'border-yellow-500 shadow-2xl shadow-yellow-500/20' : 'border-gray-700'
              } ${currentPlanId === plan.id ? 'ring-2 ring-green-500' : ''}`}>
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-center text-white text-2xl">
                    {plan.name}
                  </CardTitle>
                  <div className="text-center mt-4">
                    {plan.price === 0 ? (
                      <div className="text-4xl font-black text-white">חינם</div>
                    ) : (
                      <>
                        <div className="text-5xl font-black text-white">
                          ₪{plan.price}
                        </div>
                        <div className="text-gray-400 text-sm mt-1">/{plan.period}</div>
                      </>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                        <span className="text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                    {plan.limitations?.map((limitation, i) => (
                      <div key={i} className="flex items-start gap-3 opacity-50">
                        <span className="text-gray-500 text-sm">✗ {limitation}</span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan.id)}
                    disabled={loadingPlan === plan.id || subLoading || currentPlanId === plan.id}
                    className={`w-full mt-6 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                        : `bg-gradient-to-r ${plan.gradient}`
                    } text-white font-bold py-6 text-lg`}
                  >
                    {loadingPlan === plan.id ? (
                      <>
                        <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                        מעביר לתשלום...
                      </>
                    ) : currentPlanId === plan.id ? (
                      'התוכנית הנוכחית שלך ✓'
                    ) : plan.price === 0 ? (
                      'התחל חינם'
                    ) : (
                      'שדרג עכשיו'
                    )}
                  </Button>

                  {currentPlanId === plan.id && (
                    <p className="text-center text-green-400 text-sm">
                      ✓ פעיל כעת
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            כל המנויים מגיעים עם תקופת ניסיון של 7 ימים • ניתן לבטל בכל עת
          </p>
        </div>
      </div>
    </div>
  );
}