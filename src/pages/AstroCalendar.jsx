import { useState, useMemo, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Moon, Sun, Zap, Bell, AlertCircle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import { he } from "date-fns/locale";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import LoadingSpinner from "@/components/LoadingSpinner";

const EVENT_ICONS = {
  full_moon: { icon: Moon, color: "text-yellow-400", gradient: "from-yellow-600 to-orange-600" },
  new_moon: { icon: Moon, color: "text-purple-400", gradient: "from-purple-600 to-indigo-600" },
  mercury_retrograde: { icon: Zap, color: "text-red-400", gradient: "from-red-600 to-pink-600" },
  planet_transit: { icon: TrendingUp, color: "text-blue-400", gradient: "from-blue-600 to-cyan-600" },
  zodiac_change: { icon: Sun, color: "text-amber-400", gradient: "from-amber-600 to-orange-600" },
  eclipse: { icon: AlertCircle, color: "text-orange-400", gradient: "from-orange-600 to-red-600" }
};

const IMPACT_COLORS = {
  low: "bg-blue-900/50 text-blue-200",
  medium: "bg-purple-900/50 text-purple-200",
  high: "bg-orange-900/50 text-orange-200",
  critical: "bg-red-900/50 text-red-200"
};

const generateSampleEvents = (month) => {
  const start = startOfMonth(month);
  
  return [
    {
      id: '1',
      event_type: 'full_moon',
      event_date: addDays(start, 14).toISOString(),
      title: 'ירח מלא באריה',
      description: 'זמן מצוין לביטוי עצמי ויצירתיות',
      zodiac_sign: 'אריה',
      impact_level: 'high',
      recommendations: ['בטא את עצמך', 'היה אמיץ', 'קבל החלטות חשובות'],
      affected_areas: ['יצירתיות', 'מערכות יחסים', 'ביטחון עצמי']
    },
    {
      id: '2',
      event_type: 'mercury_retrograde',
      event_date: addDays(start, 7).toISOString(),
      title: 'מרקורי רטרוגרדי',
      description: 'שים לב לתקשורת ולחוזים',
      zodiac_sign: 'תאומים',
      impact_level: 'critical',
      recommendations: ['היזהר בחוזים', 'בדוק הכל פעמיים', 'גבה קבצים'],
      affected_areas: ['תקשורת', 'נסיעות', 'טכנולוגיה']
    },
    {
      id: '3',
      event_type: 'zodiac_change',
      event_date: addDays(start, 20).toISOString(),
      title: 'השמש עוברת לבתולה',
      description: 'זמן לארגון ושיפור',
      zodiac_sign: 'בתולה',
      impact_level: 'medium',
      recommendations: ['התארגן', 'שפר הרגלים', 'תכנן קדימה'],
      affected_areas: ['בריאות', 'עבודה', 'שגרה']
    }
  ];
};

export default function AstroCalendar() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['astro-events', currentMonth.getMonth()],
    queryFn: async () => generateSampleEvents(currentMonth),
    initialData: [],
    staleTime: 300000
  });

  const { data: reminders = [] } = useQuery({
    queryKey: ['user-reminders'],
    queryFn: () => base44.entities.UserReminder.filter({ status: 'pending' }, 'remind_date', 50),
    initialData: [],
    staleTime: 60000
  });

  const createReminderMutation = useMutation({
    mutationFn: (data) => base44.entities.UserReminder.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-reminders'] });
      EnhancedToast.success('התזכורת נוצרה בהצלחה!');
    }
  });

  const handleSetReminder = useCallback((event) => {
    createReminderMutation.mutate({
      reminder_type: 'astro_event',
      title: event.title,
      description: event.description,
      remind_date: new Date(new Date(event.event_date).getTime() - 24 * 60 * 60 * 1000).toISOString(),
      related_event_id: event.id
    });
  }, [createReminderMutation]);

  const monthDays = useMemo(() => 
    eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth)
    }),
    [currentMonth]
  );

  const getEventsForDay = useCallback((day) => 
    events.filter(event => isSameDay(new Date(event.event_date), day)),
    [events]
  );

  if (isLoading) {
    return <LoadingSpinner message="טוען לוח שנה..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/30 to-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="לוח שנה אסטרולוגי"
          description="עקוב אחר אירועים קוסמיים חשובים"
          icon={CalendarIcon}
          iconGradient="from-indigo-600 to-purple-600"
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="bg-indigo-900/30 backdrop-blur-xl border-indigo-700/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-2xl">
                    {format(currentMonth, 'MMMM yyyy', { locale: he })}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                      variant="outline"
                      size="sm"
                      className="border-indigo-500 text-indigo-300"
                    >
                      ←
                    </Button>
                    <Button
                      onClick={() => setCurrentMonth(new Date())}
                      variant="outline"
                      size="sm"
                      className="border-indigo-500 text-indigo-300"
                    >
                      היום
                    </Button>
                    <Button
                      onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                      variant="outline"
                      size="sm"
                      className="border-indigo-500 text-indigo-300"
                    >
                      →
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
                    <div key={day} className="text-center text-indigo-300 font-bold p-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {monthDays.map((day, idx) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.05 }}
                        className={`min-h-[80px] p-2 rounded-lg border ${
                          isToday
                            ? 'bg-indigo-700/50 border-indigo-400'
                            : dayEvents.length > 0
                            ? 'bg-indigo-800/30 border-indigo-600/50'
                            : 'bg-indigo-900/20 border-indigo-800/30'
                        } cursor-pointer`}
                      >
                        <div className="text-white text-sm font-bold mb-1">
                          {format(day, 'd')}
                        </div>
                        {dayEvents.map((event, i) => {
                          const eventConfig = EVENT_ICONS[event.event_type];
                          return (
                            <div
                              key={i}
                              onClick={() => setSelectedEvent(event)}
                              className="text-xs truncate mb-1"
                            >
                              <span className={eventConfig?.color || 'text-white'}>
                                {event.title}
                              </span>
                            </div>
                          );
                        })}
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {selectedEvent && (
              <Card className="bg-indigo-900/30 backdrop-blur-xl border-indigo-700/30">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center gap-2">
                      {(() => {
                        const Icon = EVENT_ICONS[selectedEvent.event_type]?.icon;
                        return Icon ? <Icon className="w-5 h-5" /> : null;
                      })()}
                      {selectedEvent.title}
                    </CardTitle>
                    <Button
                      onClick={() => setSelectedEvent(null)}
                      variant="ghost"
                      size="sm"
                      className="text-gray-400"
                    >
                      ✕
                    </Button>
                  </div>
                  <Badge className={IMPACT_COLORS[selectedEvent.impact_level]}>
                    עוצמה: {selectedEvent.impact_level}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-indigo-300 text-sm mb-1">
                      {format(new Date(selectedEvent.event_date), 'dd MMMM yyyy', { locale: he })}
                    </p>
                    <p className="text-white leading-relaxed">
                      {selectedEvent.description}
                    </p>
                  </div>

                  {selectedEvent.recommendations && (
                    <div className="bg-indigo-800/30 rounded-lg p-4">
                      <h4 className="text-indigo-300 font-bold mb-2">המלצות:</h4>
                      <ul className="space-y-1">
                        {selectedEvent.recommendations.map((rec, i) => (
                          <li key={i} className="text-indigo-200 text-sm">• {rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedEvent.affected_areas && (
                    <div>
                      <h4 className="text-indigo-300 font-bold mb-2">תחומים מושפעים:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.affected_areas.map((area, i) => (
                          <Badge key={i} className="bg-indigo-700 text-white">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSetReminder(selectedEvent)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600"
                    disabled={createReminderMutation.isPending}
                  >
                    <Bell className="w-4 h-4 ml-2" />
                    הגדר תזכורת
                  </Button>
                </CardContent>
              </Card>
            )}

            <Card className="bg-indigo-900/30 backdrop-blur-xl border-indigo-700/30">
              <CardHeader>
                <CardTitle className="text-white">אירועים קרובים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {events.slice(0, 5).map((event) => {
                  const eventConfig = EVENT_ICONS[event.event_type];
                  const Icon = eventConfig?.icon;
                  
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEvent(event)}
                      className="flex items-start gap-3 p-3 bg-indigo-800/20 rounded-lg cursor-pointer hover:bg-indigo-800/30 transition-colors"
                    >
                      {Icon && (
                        <div className={`w-10 h-10 bg-gradient-to-br ${eventConfig.gradient} rounded-full flex items-center justify-center shrink-0`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">{event.title}</p>
                        <p className="text-indigo-300 text-xs">
                          {format(new Date(event.event_date), 'dd MMM', { locale: he })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}