import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar as CalendarIcon, Moon, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

// Helper function to safely extract string from potential objects
function safeString(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    // If it's an object, try to extract a meaningful string
    if (value.title) return safeString(value.title);
    if (value.name) return safeString(value.name);
    if (value.text) return safeString(value.text);
    // Last resort - stringify it
    return JSON.stringify(value);
  }
  return String(value);
}

export default function UpcomingTrendsWidget() {
  const { data: astroEvents = [], isLoading } = useQuery({
    queryKey: ['upcomingAstroEvents'],
    queryFn: async () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 30);
      
      const events = await base44.entities.AstroEvent.filter({
        event_date: { 
          $gte: now.toISOString().split('T')[0],
          $lte: futureDate.toISOString().split('T')[0]
        }
      }, 'event_date', 10);
      
      return events;
    },
    staleTime: 60 * 60 * 1000 // 1 שעה
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['upcomingReminders'],
    queryFn: async () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 7);
      
      const reminders = await base44.entities.UserReminder.filter({
        status: 'pending',
        remind_date: {
          $gte: now.toISOString(),
          $lte: futureDate.toISOString()
        }
      }, 'remind_date', 5);
      
      return reminders;
    },
    staleTime: 5 * 60 * 1000 // 5 דקות
  });

  if (isLoading) {
    return (
      <Card className="bg-indigo-900/30 border-indigo-700/30 animate-pulse">
        <CardContent className="p-6">
          <div className="h-32" />
        </CardContent>
      </Card>
    );
  }

  const upcomingItems = [
    ...astroEvents.map(e => ({
      type: 'astro',
      title: safeString(e.title),
      date: new Date(e.event_date),
      impact: e.impact_level,
      icon: Moon
    })),
    ...reminders.map(r => ({
      type: 'reminder',
      title: safeString(r.title),
      date: new Date(r.remind_date),
      icon: CalendarIcon
    }))
  ].sort((a, b) => a.date - b.date).slice(0, 5);

  if (upcomingItems.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-xl border-indigo-700/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-400" />
            <h3 className="text-white text-xl font-bold">אירועים קרובים</h3>
          </div>

          <div className="space-y-3">
            {upcomingItems.map((item, idx) => {
              const Icon = item.icon;
              const daysUntil = Math.ceil((item.date - new Date()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={idx} className="bg-indigo-950/50 rounded-lg p-4 border border-indigo-700/30">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-indigo-800/50 rounded-lg flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-indigo-300" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-sm mb-1">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        <span className="text-indigo-300 text-xs">
                          {item.date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' })}
                        </span>
                        {daysUntil === 0 ? (
                          <Badge className="bg-yellow-700 text-white text-xs">היום!</Badge>
                        ) : daysUntil === 1 ? (
                          <Badge className="bg-orange-700 text-white text-xs">מחר</Badge>
                        ) : (
                          <span className="text-gray-400 text-xs">בעוד {daysUntil} ימים</span>
                        )}
                        {item.impact === 'high' && (
                          <Badge className="bg-red-700 text-white text-xs">
                            <AlertCircle className="w-3 h-3 ml-1" />
                            חשוב
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <Link to={createPageUrl("AstroCalendar")}>
            <Button className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 border-indigo-500">
              לוח השנה המלא
              <ArrowLeft className="w-4 h-4 mr-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  );
}