import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Eye, 
  MousePointer, 
  Clock,
  BarChart3
} from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { BarChart, Bar, PieChart as RePieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";
import { he } from "date-fns/locale";

const COLORS = ['#9333ea', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState(7); // Last 7 days

  // Fetch analytics events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['analytics', dateRange],
    queryFn: async () => {
      const startDate = subDays(new Date(), dateRange).toISOString();
      const allEvents = await base44.entities.AnalyticsEvent.list('-created_date', 1000);
      return allEvents.filter(e => new Date(e.created_date) >= new Date(startDate));
    },
    staleTime: 60000 // 1 minute
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    const pageViews = events.filter(e => e.event_type === 'page_view').length;
    const uniqueSessions = new Set(events.map(e => e.session_id)).size;
    const toolUsages = events.filter(e => e.event_type === 'tool_used').length;
    const avgTimeSpent = events
      .filter(e => e.event_type === 'time_spent')
      .reduce((sum, e) => sum + (e.metadata?.duration_seconds || 0), 0) / 
      (events.filter(e => e.event_type === 'time_spent').length || 1);
    
    const conversions = events.filter(e => e.event_type === 'conversion').length;
    const conversionRate = uniqueSessions > 0 ? (conversions / uniqueSessions * 100).toFixed(2) : 0;

    return {
      pageViews,
      uniqueSessions,
      toolUsages,
      avgTimeSpent: Math.round(avgTimeSpent),
      conversions,
      conversionRate
    };
  }, [events]);

  // Page views by page
  const pageViewsData = useMemo(() => {
    const counts = {};
    events
      .filter(e => e.event_type === 'page_view')
      .forEach(e => {
        const page = e.metadata?.page_name || e.page;
        counts[page] = (counts[page] || 0) + 1;
      });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }, [events]);

  // Tool usage distribution
  const toolUsageData = useMemo(() => {
    const counts = {};
    events
      .filter(e => e.event_type === 'tool_used')
      .forEach(e => {
        const tool = e.metadata?.tool_type || 'Unknown';
        counts[tool] = (counts[tool] || 0) + 1;
      });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }));
  }, [events]);

  // Daily activity
  const dailyActivityData = useMemo(() => {
    const days = {};
    
    for (let i = dateRange - 1; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'dd/MM', { locale: he });
      days[date] = { date, pageViews: 0, tools: 0 };
    }
    
    events.forEach(e => {
      const date = format(new Date(e.created_date), 'dd/MM', { locale: he });
      if (days[date]) {
        if (e.event_type === 'page_view') days[date].pageViews++;
        if (e.event_type === 'tool_used') days[date].tools++;
      }
    });
    
    return Object.values(days);
  }, [events, dateRange]);

  // Event types distribution
  const eventTypesData = useMemo(() => {
    const counts = {};
    events.forEach(e => {
      counts[e.event_type] = (counts[e.event_type] || 0) + 1;
    });
    
    return Object.entries(counts)
      .map(([name, value]) => ({ 
        name: name.replace(/_/g, ' '), 
        value 
      }));
  }, [events]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black flex items-center justify-center">
        <Activity className="w-12 h-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="אנליטיקס ותובנות"
          description="מעקב אחר ביצועים והתנהגות משתמשים"
          icon={BarChart3}
          iconGradient="from-blue-600 to-cyan-600"
        />

        {/* Date range selector */}
        <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30 mb-8">
          <CardContent className="p-6">
            <div className="flex gap-3">
              {[7, 14, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setDateRange(days)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    dateRange === days
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {days} ימים אחרונים
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl border-blue-700/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Eye className="w-8 h-8 text-blue-400" />
                  <Badge className="bg-blue-600/30 text-blue-200">צפיות</Badge>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {metrics.pageViews.toLocaleString()}
                </div>
                <p className="text-blue-300">צפיות בדפים</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-purple-700/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-8 h-8 text-purple-400" />
                  <Badge className="bg-purple-600/30 text-purple-200">משתמשים</Badge>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {metrics.uniqueSessions.toLocaleString()}
                </div>
                <p className="text-purple-300">סשנים ייחודיים</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl border-green-700/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <MousePointer className="w-8 h-8 text-green-400" />
                  <Badge className="bg-green-600/30 text-green-200">פעולות</Badge>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {metrics.toolUsages.toLocaleString()}
                </div>
                <p className="text-green-300">שימושים בכלים</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-amber-900/50 to-orange-900/50 backdrop-blur-xl border-amber-700/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Clock className="w-8 h-8 text-amber-400" />
                  <Badge className="bg-amber-600/30 text-amber-200">זמן</Badge>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {metrics.avgTimeSpent}s
                </div>
                <p className="text-amber-300">זמן ממוצע בדף</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-pink-900/50 to-rose-900/50 backdrop-blur-xl border-pink-700/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-pink-400" />
                  <Badge className="bg-pink-600/30 text-pink-200">המרות</Badge>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {metrics.conversions}
                </div>
                <p className="text-pink-300">המרות ({metrics.conversionRate}%)</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-indigo-900/50 to-blue-900/50 backdrop-blur-xl border-indigo-700/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-indigo-400" />
                  <Badge className="bg-indigo-600/30 text-indigo-200">אירועים</Badge>
                </div>
                <div className="text-4xl font-bold text-white mb-2">
                  {events.length.toLocaleString()}
                </div>
                <p className="text-indigo-300">סה"כ אירועים</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Daily activity */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
            <CardHeader>
              <CardTitle className="text-white">פעילות יומית</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="pageViews" stroke="#3b82f6" name="צפיות" strokeWidth={2} />
                  <Line type="monotone" dataKey="tools" stroke="#10b981" name="שימוש בכלים" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Page views distribution */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
            <CardHeader>
              <CardTitle className="text-white">דפים פופולריים</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={pageViewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#9333ea" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* More charts */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Tool usage */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
            <CardHeader>
              <CardTitle className="text-white">שימוש בכלים</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={toolUsageData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {toolUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Event types */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-purple-700/30">
            <CardHeader>
              <CardTitle className="text-white">סוגי אירועים</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventTypesData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9ca3af" />
                  <YAxis dataKey="name" type="category" stroke="#9ca3af" width={120} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="value" fill="#ec4899" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}