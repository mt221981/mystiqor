import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, BellOff, Clock, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "./EnhancedToast";

export default function GraphologyReminder() {
  const [showForm, setShowForm] = useState(false);
  const [remindDate, setRemindDate] = useState('');
  const queryClient = useQueryClient();

  const createReminderMutation = useMutation({
    mutationFn: async (date) => {
      return await base44.entities.UserReminder.create({
        reminder_type: 'analysis_review',
        title: 'ניתוח גרפולוגיה חוזר',
        description: 'הגיע הזמן לבצע ניתוח גרפולוגיה נוסף ולראות איך התפתחת!',
        remind_date: date,
        is_recurring: false,
        status: 'pending'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      EnhancedToast.success('תזכורת נקבעה!', '🔔');
      setShowForm(false);
      setRemindDate('');
    }
  });

  const handleCreateReminder = () => {
    if (!remindDate) {
      EnhancedToast.error('נא לבחור תאריך', '');
      return;
    }

    const reminderDate = new Date(remindDate);
    if (reminderDate < new Date()) {
      EnhancedToast.error('התאריך חייב להיות בעתיד', '');
      return;
    }

    createReminderMutation.mutate(reminderDate.toISOString());
  };

  const suggestReminderDate = (months) => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date.toISOString().split('T')[0];
  };

  return (
    <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 backdrop-blur-xl border-amber-700/30">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 text-amber-300" />
            <h3 className="text-xl font-bold text-amber-200">תזכורת לניתוח חוזר</h3>
          </div>
          <Button
            size="sm"
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {showForm ? <BellOff className="w-4 h-4 ml-1" /> : <Plus className="w-4 h-4 ml-1" />}
            {showForm ? 'ביטול' : 'הוסף תזכורת'}
          </Button>
        </div>

        <p className="text-amber-100 text-sm mb-4">
          כתב היד משתנה עם הזמן! קבע תזכורת לניתוח חוזר כדי לעקוב אחר התפתחותך האישית.
        </p>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-amber-800/30 rounded-lg p-4 space-y-4">
                <div>
                  <label className="text-amber-200 text-sm mb-2 block">בחר תאריך:</label>
                  <Input
                    type="date"
                    value={remindDate}
                    onChange={(e) => setRemindDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="bg-amber-900/30 border-amber-600/50 text-white"
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRemindDate(suggestReminderDate(1))}
                    className="border-amber-600 text-amber-300 hover:bg-amber-800/30"
                  >
                    בעוד חודש
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRemindDate(suggestReminderDate(3))}
                    className="border-amber-600 text-amber-300 hover:bg-amber-800/30"
                  >
                    בעוד 3 חודשים
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRemindDate(suggestReminderDate(6))}
                    className="border-amber-600 text-amber-300 hover:bg-amber-800/30"
                  >
                    בעוד 6 חודשים
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setRemindDate(suggestReminderDate(12))}
                    className="border-amber-600 text-amber-300 hover:bg-amber-800/30"
                  >
                    בעוד שנה
                  </Button>
                </div>

                <Button
                  onClick={handleCreateReminder}
                  disabled={!remindDate || createReminderMutation.isPending}
                  className="w-full bg-amber-600 hover:bg-amber-700"
                >
                  <Clock className="w-4 h-4 ml-2" />
                  שמור תזכורת
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-4 bg-amber-800/20 rounded-lg p-3">
          <p className="text-amber-200 text-xs flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>מומלץ לבצע ניתוח חוזר אחת ל-3-6 חודשים כדי לזהות שינויים משמעותיים</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}