import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, CheckCircle, Clock, Sparkles, Trash2, Calendar, Target, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import ImprovedToast from "@/components/ImprovedToast";
import { SkeletonList } from "@/components/SkeletonLoader";
import ImprovedEmptyState from "@/components/ImprovedEmptyState";
import { usePageView } from "@/components/Analytics";

const REMINDER_TYPE_CONFIG = {
  astro_event: { icon: Moon, color: "purple", label: "אירוע אסטרולוגי" },
  journal_entry: { icon: Calendar, color: "blue", label: "רשימה ביומן" },
  analysis_review: { icon: Sparkles, color: "green", label: "סקירת ניתוח" },
  daily_forecast: { icon: Bell, color: "amber", label: "תחזית יומית" },
  custom: { icon: Target, color: "pink", label: "תזכורת אישית" }
};

export default function Notifications() {
  usePageView('Notifications');
  
  const [selectedTab, setSelectedTab] = useState("pending");
  const queryClient = useQueryClient();

  const { data: pendingReminders = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pending_reminders'],
    queryFn: async () => {
      const reminders = await base44.entities.UserReminder.filter(
        { status: 'pending' },
        'remind_date',
        50
      );
      return reminders || [];
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const { data: dismissedReminders = [], isLoading: dismissedLoading } = useQuery({
    queryKey: ['dismissed_reminders'],
    queryFn: async () => {
      const reminders = await base44.entities.UserReminder.filter(
        { status: 'dismissed' },
        '-updated_date',
        30
      );
      return reminders || [];
    },
    enabled: selectedTab === 'dismissed',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });

  const { data: sentReminders = [], isLoading: sentLoading } = useQuery({
    queryKey: ['sent_reminders'],
    queryFn: async () => {
      const reminders = await base44.entities.UserReminder.filter(
        { status: 'sent' },
        '-updated_date',
        30
      );
      return reminders || [];
    },
    enabled: selectedTab === 'sent',
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000
  });

  const updateReminderMutation = useMutation({
    mutationFn: ({ id, status }) => base44.entities.UserReminder.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending_reminders']);
      queryClient.invalidateQueries(['dismissed_reminders']);
      queryClient.invalidateQueries(['sent_reminders']);
      queryClient.invalidateQueries(['upcoming_reminders']);
      ImprovedToast.magic('התזכורת עודכנה', 'הפעולה בוצעה בהצלחה');
    },
    onError: (error) => {
      console.error('Failed to update reminder:', error);
      ImprovedToast.error('שגיאה בעדכון', 'לא הצלחנו לעדכן את התזכורת');
    }
  });

  const deleteReminderMutation = useMutation({
    mutationFn: (id) => base44.entities.UserReminder.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['pending_reminders']);
      queryClient.invalidateQueries(['dismissed_reminders']);
      queryClient.invalidateQueries(['sent_reminders']);
      queryClient.invalidateQueries(['upcoming_reminders']);
      ImprovedToast.success('התזכורת נמחקה');
    },
    onError: (error) => {
      console.error('Failed to delete reminder:', error);
      ImprovedToast.error('שגיאה במחיקה', 'לא הצלחנו למחוק את התזכורת');
    }
  });

  const ReminderCard = React.memo(({ reminder, showActions = true }) => {
    const config = REMINDER_TYPE_CONFIG[reminder.reminder_type] || REMINDER_TYPE_CONFIG.custom;
    const Icon = config.icon;
    const remindDate = new Date(reminder.remind_date);
    const isPast = remindDate < new Date();
    const isToday = remindDate.toDateString() === new Date().toDateString();

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -20 }}
        layout
      >
        <Card className={`border-2 transition-all ${
          isToday
            ? 'bg-amber-950/40 border-amber-600/50'
            : isPast && reminder.status === 'pending'
            ? 'bg-red-950/30 border-red-600/40'
            : 'bg-gray-800/50 border-gray-700/30'
        }`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  isToday ? 'bg-amber-600' : 'bg-purple-600'
                }`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="bg-purple-700 text-white text-xs">
                      {config.label}
                    </Badge>
                    {isToday && (
                      <Badge className="bg-red-600 text-white text-xs">
                        היום!
                      </Badge>
                    )}
                    {reminder.is_recurring && (
                      <Badge className="bg-blue-600 text-white text-xs">
                        חוזר
                      </Badge>
                    )}
                    {isPast && reminder.status === 'pending' && (
                      <Badge className="bg-red-500 text-white text-xs">
                        פספס
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-white font-bold mb-1 text-lg">
                    {reminder.title}
                  </h3>
                  
                  {reminder.description && (
                    <p className="text-gray-300 text-sm mb-3 leading-relaxed">
                      {reminder.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Clock className="w-4 h-4" />
                    {remindDate.toLocaleDateString('he-IL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {showActions && (
                <div className="flex flex-col gap-2 shrink-0">
                  {reminder.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => updateReminderMutation.mutate({ id: reminder.id, status: 'sent' })}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="w-4 h-4 ml-1" />
                        בוצע
                      </Button>
                      <Button
                        onClick={() => updateReminderMutation.mutate({ id: reminder.id, status: 'dismissed' })}
                        size="sm"
                        variant="outline"
                        className="border-gray-600"
                      >
                        דחה
                      </Button>
                    </>
                  )}
                  <Button
                    onClick={() => deleteReminderMutation.mutate(reminder.id)}
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  });

  const isLoading = pendingLoading || dismissedLoading || sentLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
        <div className="max-w-5xl mx-auto">
          <PageHeader
            title="התזכורות שלי 🔔"
            description="נהל את כל התזכורות והתראות החכמות שלך"
            icon={Bell}
            iconGradient="from-purple-600 to-pink-600"
          />
          <SkeletonList rows={5} />
        </div>
      </div>
    );
  }

  const totalPending = pendingReminders.length;
  const todayReminders = pendingReminders.filter(r => 
    new Date(r.remind_date).toDateString() === new Date().toDateString()
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="התזכורות שלי 🔔"
          description="נהל את כל התזכורות והתראות החכמות שלך"
          icon={Bell}
          iconGradient="from-purple-600 to-pink-600"
        />

        {/* Quick Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 border-purple-700">
            <CardContent className="p-6 text-center">
              <Bell className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <div className="text-4xl font-bold text-white">{totalPending}</div>
              <p className="text-purple-300">תזכורות ממתינות</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 border-amber-700">
            <CardContent className="p-6 text-center">
              <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <div className="text-4xl font-bold text-white">{todayReminders}</div>
              <p className="text-amber-300">להיום</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-700">
            <CardContent className="p-6 text-center">
              <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <div className="text-4xl font-bold text-white">{sentReminders.length}</div>
              <p className="text-green-300">בוצעו</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab} dir="rtl">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900 mb-6">
            <TabsTrigger value="pending" className="data-[state=active]:bg-purple-600">
              ממתינות ({totalPending})
            </TabsTrigger>
            <TabsTrigger value="sent" className="data-[state=active]:bg-green-600">
              בוצעו ({sentReminders.length})
            </TabsTrigger>
            <TabsTrigger value="dismissed" className="data-[state=active]:bg-gray-600">
              נדחו ({dismissedReminders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingReminders.length === 0 ? (
              <ImprovedEmptyState
                icon={Bell}
                title="אין תזכורות ממתינות"
                description="כל התזכורות טופלו! אתה במצב מעולה 🎉"
              />
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {pendingReminders.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sent">
            {sentReminders.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">אין תזכורות שבוצעו</h3>
                  <p className="text-gray-400">התזכורות שתסמן כבוצעו יופיעו כאן</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {sentReminders.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} showActions={false} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="dismissed">
            {dismissedReminders.length === 0 ? (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardContent className="p-12 text-center">
                  <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white text-xl font-bold mb-2">אין תזכורות שנדחו</h3>
                  <p className="text-gray-400">תזכורות שתבחר לדחות יופיעו כאן</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {dismissedReminders.map((reminder) => (
                    <ReminderCard key={reminder.id} reminder={reminder} showActions={false} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}