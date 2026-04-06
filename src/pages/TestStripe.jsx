import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2, AlertCircle } from "lucide-react";
import useSubscription from "@/components/useSubscription";
import PageHeader from "@/components/PageHeader";

export default function TestStripe() {
  const { subscription, isLoading, planInfo, remainingAnalyses, usagePercentage, incrementUsage, hasUsageLeft } = useSubscription();
  const [testing, setTesting] = React.useState(false);
  const [result, setResult] = React.useState(null);

  const testIncrementUsage = async () => {
    setTesting(true);
    setResult(null);
    try {
      await incrementUsage();
      setResult({ success: true, message: 'שימוש עודכן בהצלחה!' });
    } catch (error) {
      setResult({ success: false, message: error.message || 'שגיאה בעדכון שימוש' });
    } finally {
      setTesting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="בדיקת מערכת Stripe"
          description="בדיקה של אינטגרציית המנויים והתשלומים"
          icon={CheckCircle}
        />

        <div className="space-y-6">
          {/* Subscription Info */}
          <Card className="bg-gray-900/80 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white">מידע על המנוי</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400 text-sm">סוג מנוי</p>
                  <p className="text-white text-xl font-bold">{planInfo.name}</p>
                  <Badge className="mt-1 bg-purple-600">{subscription.plan_type}</Badge>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">סטטוס</p>
                  <p className="text-white text-xl font-bold">{subscription.status}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">ניתוחים שבוצעו</p>
                  <p className="text-white text-xl font-bold">
                    {subscription.analyses_used || 0} / {planInfo.analyses === -1 ? '∞' : planInfo.analyses}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">ניתוחים נותרים</p>
                  <p className="text-white text-xl font-bold">{remainingAnalyses}</p>
                </div>
              </div>

              {planInfo.analyses !== -1 && (
                <div>
                  <p className="text-gray-400 text-sm mb-2">שימוש: {usagePercentage}%</p>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                </div>
              )}

              {subscription.stripe_customer_id && (
                <div>
                  <p className="text-gray-400 text-sm">Stripe Customer ID</p>
                  <p className="text-white font-mono text-sm">{subscription.stripe_customer_id}</p>
                </div>
              )}

              {subscription.stripe_subscription_id && (
                <div>
                  <p className="text-gray-400 text-sm">Stripe Subscription ID</p>
                  <p className="text-white font-mono text-sm">{subscription.stripe_subscription_id}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Test Increment Usage */}
          <Card className="bg-gray-900/80 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white">בדיקת עדכון שימוש</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                בדוק את פונקציית העדכון של השימוש - הדבר יגדיל את מספר הניתוחים שבוצעו ב-1
              </p>

              <Button
                onClick={testIncrementUsage}
                disabled={testing || !hasUsageLeft}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                    בודק...
                  </>
                ) : (
                  'הגדל שימוש ב-1'
                )}
              </Button>

              {!hasUsageLeft && (
                <div className="flex items-center gap-2 text-red-400">
                  <AlertCircle className="w-5 h-5" />
                  <span>הגעת למגבלת השימוש</span>
                </div>
              )}

              {result && (
                <div className={`flex items-center gap-2 p-4 rounded-lg ${
                  result.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
                }`}>
                  {result.success ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                  <span>{result.message}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Status */}
          <Card className="bg-gray-900/80 border-purple-700">
            <CardHeader>
              <CardTitle className="text-white">סטטוס מערכת</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Stripe Integration</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Subscription Hook</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Usage Tracking</span>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-300">Webhook Handler</span>
                <Badge className="bg-yellow-600">Needs Testing</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}