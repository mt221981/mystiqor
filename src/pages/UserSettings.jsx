import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Bell, 
  Globe, 
  Eye, 
  Shield, 
  Crown,
  Save,
  Loader2,
  Moon,
  Sun,
  Monitor
} from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import useSubscription from "@/components/useSubscription";

export default function UserSettings() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const { subscription } = useSubscription();

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  const [settings, setSettings] = useState({
    preferred_language: 'he',
    notification_settings: {
      daily_insights: true,
      astro_events: true,
      reminders: true,
      analysis_complete: true,
      goal_updates: true,
      email_notifications: true,
      push_notifications: false
    },
    display_settings: {
      theme: 'dark',
      compact_mode: false,
      show_confidence_scores: true,
      show_provenance: true
    },
    privacy_settings: {
      profile_visibility: 'private',
      analysis_history_visible: false,
      allow_data_for_research: false
    }
  });

  useEffect(() => {
    if (userProfile) {
      setSettings({
        preferred_language: userProfile.preferred_language || 'he',
        notification_settings: userProfile.notification_settings || settings.notification_settings,
        display_settings: userProfile.display_settings || settings.display_settings,
        privacy_settings: userProfile.privacy_settings || settings.privacy_settings
      });
    }
  }, [userProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      EnhancedToast.success('ההגדרות נשמרו בהצלחה! ✅');
    },
    onError: (error) => {
      EnhancedToast.error('שגיאה בשמירת ההגדרות');
      console.error(error);
    }
  });

  const handleSave = async () => {
    if (!userProfile) {
      EnhancedToast.error('לא נמצא פרופיל משתמש');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfileMutation.mutateAsync({
        id: userProfile.id,
        data: settings
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNotificationSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      notification_settings: {
        ...prev.notification_settings,
        [key]: value
      }
    }));
  };

  const updateDisplaySetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      display_settings: {
        ...prev.display_settings,
        [key]: value
      }
    }));
  };

  const updatePrivacySetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      privacy_settings: {
        ...prev.privacy_settings,
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return <LoadingSpinner message="טוען הגדרות..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/40 to-slate-950 p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="הגדרות ⚙️"
          description="התאם את החוויה שלך באפליקציה"
          icon={Settings}
          iconGradient="from-blue-500 to-purple-500"
        />

        <div className="space-y-6">
          {/* Language Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-blue-800/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-blue-400" />
                  <div>
                    <CardTitle className="text-white text-2xl">שפה ואזור</CardTitle>
                    <CardDescription className="text-gray-300">בחר את השפה המועדפת שלך</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white text-lg font-semibold">שפת הממשק</Label>
                    <p className="text-gray-400 text-sm mt-1">השפה שבה יוצג האפליקציה</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={settings.preferred_language === 'he' ? 'default' : 'outline'}
                      className={settings.preferred_language === 'he' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-gray-600 text-gray-300'}
                      onClick={() => setSettings({ ...settings, preferred_language: 'he' })}
                    >
                      עברית 🇮🇱
                    </Button>
                    <Button
                      variant={settings.preferred_language === 'en' ? 'default' : 'outline'}
                      className={settings.preferred_language === 'en' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'border-gray-600 text-gray-300'}
                      onClick={() => setSettings({ ...settings, preferred_language: 'en' })}
                    >
                      English 🇺🇸
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-900/30 border border-yellow-600/50 rounded-lg p-4">
                  <p className="text-yellow-200 text-sm">
                    💡 <strong>שים לב:</strong> כרגע האפליקציה תומכת רק בעברית. תמיכה באנגלית תגיע בקרוב!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-purple-800/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Bell className="w-6 h-6 text-purple-400" />
                  <div>
                    <CardTitle className="text-white text-2xl">התראות</CardTitle>
                    <CardDescription className="text-gray-300">בחר אילו התראות לקבל</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">תובנות יומיות</Label>
                    <p className="text-gray-400 text-sm mt-1">קבל תובנה מיסטית מדי יום</p>
                  </div>
                  <Switch
                    checked={settings.notification_settings.daily_insights}
                    onCheckedChange={(checked) => updateNotificationSetting('daily_insights', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">אירועים אסטרולוגיים</Label>
                    <p className="text-gray-400 text-sm mt-1">התראות על ירח מלא, רטרוגרדים ועוד</p>
                  </div>
                  <Switch
                    checked={settings.notification_settings.astro_events}
                    onCheckedChange={(checked) => updateNotificationSetting('astro_events', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">תזכורות אישיות</Label>
                    <p className="text-gray-400 text-sm mt-1">תזכורות שהגדרת למטרות ומעקב</p>
                  </div>
                  <Switch
                    checked={settings.notification_settings.reminders}
                    onCheckedChange={(checked) => updateNotificationSetting('reminders', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">ניתוח הושלם</Label>
                    <p className="text-gray-400 text-sm mt-1">קבל התראה כשניתוח מסתיים</p>
                  </div>
                  <Switch
                    checked={settings.notification_settings.analysis_complete}
                    onCheckedChange={(checked) => updateNotificationSetting('analysis_complete', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">עדכוני יעדים</Label>
                    <p className="text-gray-400 text-sm mt-1">התראות על התקדמות ביעדים</p>
                  </div>
                  <Switch
                    checked={settings.notification_settings.goal_updates}
                    onCheckedChange={(checked) => updateNotificationSetting('goal_updates', checked)}
                  />
                </div>

                <div className="border-t border-gray-700 pt-4 mt-4">
                  <p className="text-gray-400 text-sm font-semibold mb-4">ערוצי התראות:</p>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl mb-3">
                    <div>
                      <Label className="text-white font-semibold">התראות במייל</Label>
                      <p className="text-gray-400 text-sm mt-1">שלח התראות לכתובת המייל שלך</p>
                    </div>
                    <Switch
                      checked={settings.notification_settings.email_notifications}
                      onCheckedChange={(checked) => updateNotificationSetting('email_notifications', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                    <div>
                      <Label className="text-white font-semibold">התראות Push</Label>
                      <p className="text-gray-400 text-sm mt-1">התראות בדפדפן או באפליקציה</p>
                    </div>
                    <Switch
                      checked={settings.notification_settings.push_notifications}
                      onCheckedChange={(checked) => updateNotificationSetting('push_notifications', checked)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Display Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-indigo-800/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Eye className="w-6 h-6 text-indigo-400" />
                  <div>
                    <CardTitle className="text-white text-2xl">תצוגה</CardTitle>
                    <CardDescription className="text-gray-300">התאם את מראה האפליקציה</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <Label className="text-white text-lg font-semibold mb-3 block">ערכת נושא</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={settings.display_settings.theme === 'dark' ? 'default' : 'outline'}
                      className={settings.display_settings.theme === 'dark'
                        ? 'bg-indigo-600 hover:bg-indigo-700 flex-1'
                        : 'border-gray-600 text-gray-300 flex-1'}
                      onClick={() => updateDisplaySetting('theme', 'dark')}
                    >
                      <Moon className="w-4 h-4 ml-2" />
                      כהה
                    </Button>
                    <Button
                      variant={settings.display_settings.theme === 'light' ? 'default' : 'outline'}
                      className={settings.display_settings.theme === 'light'
                        ? 'bg-indigo-600 hover:bg-indigo-700 flex-1'
                        : 'border-gray-600 text-gray-300 flex-1'}
                      onClick={() => updateDisplaySetting('theme', 'light')}
                    >
                      <Sun className="w-4 h-4 ml-2" />
                      בהיר
                    </Button>
                    <Button
                      variant={settings.display_settings.theme === 'auto' ? 'default' : 'outline'}
                      className={settings.display_settings.theme === 'auto'
                        ? 'bg-indigo-600 hover:bg-indigo-700 flex-1'
                        : 'border-gray-600 text-gray-300 flex-1'}
                      onClick={() => updateDisplaySetting('theme', 'auto')}
                    >
                      <Monitor className="w-4 h-4 ml-2" />
                      אוטומטי
                    </Button>
                  </div>
                  <p className="text-gray-400 text-sm mt-2">
                    💡 כרגע רק מצב כהה זמין
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">מצב קומפקטי</Label>
                    <p className="text-gray-400 text-sm mt-1">הצג יותר תוכן במסך</p>
                  </div>
                  <Switch
                    checked={settings.display_settings.compact_mode}
                    onCheckedChange={(checked) => updateDisplaySetting('compact_mode', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">הצג ציוני דיוק</Label>
                    <p className="text-gray-400 text-sm mt-1">הצג את רמת הבטחון בניתוחים</p>
                  </div>
                  <Switch
                    checked={settings.display_settings.show_confidence_scores}
                    onCheckedChange={(checked) => updateDisplaySetting('show_confidence_scores', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">הצג מקורות</Label>
                    <p className="text-gray-400 text-sm mt-1">הצג מאיפה מגיעות התובנות (Provenance)</p>
                  </div>
                  <Switch
                    checked={settings.display_settings.show_provenance}
                    onCheckedChange={(checked) => updateDisplaySetting('show_provenance', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-green-800/40">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6 text-green-400" />
                  <div>
                    <CardTitle className="text-white text-2xl">פרטיות ואבטחה</CardTitle>
                    <CardDescription className="text-gray-300">שלוט במידע האישי שלך</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-800/50 rounded-xl">
                  <Label className="text-white text-lg font-semibold mb-3 block">נראות פרופיל</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={settings.privacy_settings.profile_visibility === 'private' ? 'default' : 'outline'}
                      className={settings.privacy_settings.profile_visibility === 'private'
                        ? 'bg-green-600 hover:bg-green-700 flex-1'
                        : 'border-gray-600 text-gray-300 flex-1'}
                      onClick={() => updatePrivacySetting('profile_visibility', 'private')}
                    >
                      🔒 פרטי
                    </Button>
                    <Button
                      variant={settings.privacy_settings.profile_visibility === 'friends' ? 'default' : 'outline'}
                      className={settings.privacy_settings.profile_visibility === 'friends'
                        ? 'bg-green-600 hover:bg-green-700 flex-1'
                        : 'border-gray-600 text-gray-300 flex-1'}
                      onClick={() => updatePrivacySetting('profile_visibility', 'friends')}
                    >
                      👥 חברים
                    </Button>
                    <Button
                      variant={settings.privacy_settings.profile_visibility === 'public' ? 'default' : 'outline'}
                      className={settings.privacy_settings.profile_visibility === 'public'
                        ? 'bg-green-600 hover:bg-green-700 flex-1'
                        : 'border-gray-600 text-gray-300 flex-1'}
                      onClick={() => updatePrivacySetting('profile_visibility', 'public')}
                    >
                      🌍 ציבורי
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">שתף היסטוריית ניתוחים</Label>
                    <p className="text-gray-400 text-sm mt-1">אפשר לאחרים לראות את הניתוחים שלך</p>
                  </div>
                  <Switch
                    checked={settings.privacy_settings.analysis_history_visible}
                    onCheckedChange={(checked) => updatePrivacySetting('analysis_history_visible', checked)}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-xl">
                  <div>
                    <Label className="text-white font-semibold">תרום לתיקון</Label>
                    <p className="text-gray-400 text-sm mt-1">אפשר שימוש בנתונים אנונימיים למחקר ושיפור</p>
                  </div>
                  <Switch
                    checked={settings.privacy_settings.allow_data_for_research}
                    onCheckedChange={(checked) => updatePrivacySetting('allow_data_for_research', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Subscription Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-2 border-purple-700/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  <div>
                    <CardTitle className="text-white text-2xl">המנוי שלי</CardTitle>
                    <CardDescription className="text-purple-200">נהל את המנוי והתשלומים שלך</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-purple-950/50 rounded-xl p-6 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-purple-200 text-sm mb-1">חבילה נוכחית:</p>
                      <p className="text-white text-2xl font-bold">
                        {subscription?.plan_type === 'free' && '🆓 חינם'}
                        {subscription?.plan_type === 'basic' && '⚡ בסיסי'}
                        {subscription?.plan_type === 'premium' && '👑 פרימיום'}
                        {subscription?.plan_type === 'enterprise' && '🏢 עסקי'}
                      </p>
                    </div>
                    <div className="text-left">
                      <p className="text-purple-200 text-sm mb-1">סטטוס:</p>
                      <p className="text-green-400 text-xl font-bold">
                        {subscription?.status === 'active' ? '✅ פעיל' : '❌ לא פעיל'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Link to={createPageUrl('ManageSubscription')} className="flex-1">
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">
                        נהל מנוי
                      </Button>
                    </Link>
                    {subscription?.plan_type === 'free' && (
                      <Link to={createPageUrl('Pricing')} className="flex-1">
                        <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                          שדרג עכשיו 🚀
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>

                <p className="text-purple-200 text-sm text-center">
                  לשאלות או בעיות במנוי, צור קשר עם התמיכה
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="sticky bottom-6 z-10"
          >
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl h-16 shadow-2xl"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-6 h-6 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6 ml-2" />
                  שמור הגדרות
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}