import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Crown, CreditCard, AlertCircle, CheckCircle, Loader2, XCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useSubscription from "@/components/useSubscription";

export default function ManageSubscription() {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  
  const { subscription, isLoading, planInfo } = useSubscription();

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await base44.functions.invoke('cancelSubscription', {});
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      EnhancedToast.success('המנוי בוטל', 'המנוי יישאר פעיל עד תום התקופה ששולמה');
    },
    onError: (error) => {
      console.error('Cancel error:', error);
      EnhancedToast.error('שגיאה בביטול המנוי');
    }
  });

  const handleCancelSubscription = async () => {
    if (window.confirm('האם אתה בטוח שברצונך לבטל את המנוי? המנוי יישאר פעיל עד תום התקופה ששולמה.')) {
      setIsProcessing(true);
      cancelMutation.mutate(undefined, {
        onSettled: () => setIsProcessing(false)
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="ניהול המנוי"
            description="נהל את המנוי והתשלומים שלך"
            icon={CreditCard}
          />
          
          <Card className="bg-gray-900/80 border-purple-700">
            <CardContent className="p-12 text-center">
              <Crown className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-4">אין לך מנוי פעיל</h3>
              <p className="text-gray-400 mb-6">התחל מנוי כדי לנצל את כל התכונות</p>
              <Link to={createPageUrl("Pricing")}>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Crown className="w-5 h-5 ml-2" />
                  צפה במחירים
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const statusConfig = {
    trial: { icon: Clock, color: 'text-blue-400', bg: 'bg-blue-900/20', label: 'תקופת ניסיון' },
    active: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-900/20', label: 'פעיל' },
    cancelled: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-900/20', label: 'מבוטל' },
    expired: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-900/20', label: 'פג תוקף' }
  };

  const currentStatus = statusConfig[subscription.status] || statusConfig.active;
  const StatusIcon = currentStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="ניהול המנוי"
          description="נהל את המנוי והתשלומים שלך"
          icon={CreditCard}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-2 border-purple-500">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  המנוי הנוכחי שלך
                </div>
                <Badge className={`${currentStatus.bg} ${currentStatus.color} border-0`}>
                  <StatusIcon className="w-4 h-4 ml-1" />
                  {currentStatus.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-purple-300 text-sm mb-1">תוכנית</p>
                  <p className="text-white text-2xl font-bold">{planInfo?.name}</p>
                </div>
                
                {subscription.trial_end_date && subscription.status === 'trial' && (
                  <div>
                    <p className="text-purple-300 text-sm mb-1">תקופת ניסיון עד</p>
                    <p className="text-white text-lg">
                      {new Date(subscription.trial_end_date).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                )}

                {subscription.start_date && (
                  <div>
                    <p className="text-purple-300 text-sm mb-1">תאריך התחלה</p>
                    <p className="text-white text-lg">
                      {new Date(subscription.start_date).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                )}

                {subscription.end_date && (
                  <div>
                    <p className="text-purple-300 text-sm mb-1">תאריך סיום</p>
                    <p className="text-white text-lg">
                      {new Date(subscription.end_date).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                )}
              </div>

              {planInfo.analyses !== -1 && (
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-purple-200">ניתוחים החודש</p>
                    <p className="text-white font-bold">
                      {subscription.analyses_used || 0} / {planInfo.analyses}
                    </p>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${Math.min((subscription.analyses_used || 0) / planInfo.analyses * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {subscription.cancel_at_period_end && (
                <Alert className="bg-yellow-900/30 border-yellow-700">
                  <AlertCircle className="h-4 w-4 text-yellow-400" />
                  <AlertDescription className="text-yellow-200">
                    המנוי שלך יבוטל בתאריך {new Date(subscription.end_date).toLocaleDateString('he-IL')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <Card className="bg-gray-900/80 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">שדרוג או שינוי תוכנית</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">רוצה לשדרג או לשנות את התוכנית שלך?</p>
              <Link to={createPageUrl("Pricing")}>
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Crown className="w-4 h-4 ml-2" />
                  צפה בתוכניות
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/80 border-red-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">ביטול מנוי</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-400 mb-4">המנוי יישאר פעיל עד תום התקופה ששולמה</p>
              <Button
                onClick={handleCancelSubscription}
                disabled={isProcessing || subscription.cancel_at_period_end}
                variant="outline"
                className="w-full border-red-700 text-red-400 hover:bg-red-900/30"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    מבטל...
                  </>
                ) : subscription.cancel_at_period_end ? (
                  'המנוי כבר מבוטל'
                ) : (
                  <>
                    <XCircle className="w-4 h-4 ml-2" />
                    בטל מנוי
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}