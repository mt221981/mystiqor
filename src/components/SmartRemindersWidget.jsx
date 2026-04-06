import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Bell, Clock, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "./EnhancedToast";

const REMINDER_TYPE_CONFIG = {
  astro_event: { color: "purple", emoji: "🌙", label: "אירוע אסטרולוגי" },
  journal_entry: { color: "blue", emoji: "📔", label: "רשימה ביומן" },
  analysis_review: { color: "green", emoji: "🔍", label: "סקירת ניתוח" },
  daily_forecast: { color: "amber", emoji: "☀️", label: "תחזית יומית" },
  custom: { color: "pink", emoji: "✨", label: "תזכורת אישית" }
};

export default function SmartRemindersWidget() {
  const queryClient = useQueryClient();

  const { data: upcomingReminders = [] } = useQuery({
    queryKey: ['upcoming_reminders'],
    queryFn: async () => {
      try {
        const now = new Date().toISOString();
        const next7Days = new Date();
        next7Days.setDate(next7Days.getDate() + 7);
        
        const reminders = await base44.entities.UserReminder.filter(
          { 
            status: 'pending',
            remind_date: { $gte: now, $lte: next7Days.toISOString() }
          },
          'remind_date',
          5
        );
        return reminders || [];
      } catch (error) {
        console.error('Failed to fetch reminders:', error);
        return [];
      }
    },
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1
  });

  const dismissReminderMutation = useMutation({
    mutationFn: (id) => base44.entities.UserReminder.update(id, { status: 'dismissed' }),
    onSuccess: () => {
      queryClient.invalidateQueries(['upcoming_reminders']);
      EnhancedToast.success('התזכורת נמחקה');
    },
    onError: (error) => {
      console.error('Failed to dismiss reminder:', error);
      EnhancedToast.error('שגיאה בדחיית התזכורת');
    }
  });

  if (!upcomingReminders || upcomingReminders.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-amber-900/40 to-orange-900/40 border-2 border-amber-600/50">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2">
          <Bell className="w-6 h-6 text-amber-400" />
          תזכורות קרובות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence>
          {upcomingReminders.map((reminder, idx) => {
            const config = REMINDER_TYPE_CONFIG[reminder.reminder_type] || REMINDER_TYPE_CONFIG.custom;
            const remindDate = new Date(reminder.remind_date);
            const isToday = remindDate.toDateString() === new Date().toDateString();

            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-4 rounded-lg border-2 ${
                  isToday
                    ? 'bg-amber-950/60 border-amber-500/50'
                    : 'bg-gray-800/50 border-gray-600/30'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{config.emoji}</span>
                      <Badge className="bg-purple-600 text-white text-xs">
                        {config.label}
                      </Badge>
                      {isToday && (
                        <Badge className="bg-red-600 text-white text-xs">
                          היום!
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-white font-semibold mb-1">
                      {reminder.title}
                    </h4>
                    {reminder.description && (
                      <p className="text-gray-300 text-sm mb-2">
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-gray-400 text-xs">
                      <Clock className="w-3 h-3" />
                      {remindDate.toLocaleDateString('he-IL', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <Button
                    onClick={() => dismissReminderMutation.mutate(reminder.id)}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}