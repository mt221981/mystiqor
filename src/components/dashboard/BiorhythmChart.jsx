import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';

export default function BiorhythmChart({ birthDate }) {
  const data = useMemo(() => {
    if (!birthDate) return [];
    
    const today = new Date();
    const birth = new Date(birthDate);
    const dataPoints = [];
    
    // Generate data for next 14 days
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const diffTime = Math.abs(date - birth);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      dataPoints.push({
        date: date.toLocaleDateString('he-IL', { day: 'numeric', month: 'short' }),
        physical: Math.sin(2 * Math.PI * diffDays / 23) * 100,
        emotional: Math.sin(2 * Math.PI * diffDays / 28) * 100,
        intellectual: Math.sin(2 * Math.PI * diffDays / 33) * 100,
      });
    }
    return dataPoints;
  }, [birthDate]);

  if (!birthDate) return null;

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-purple-500/30 shadow-xl overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Activity className="w-5 h-5 text-green-400" />
            ביו-ריתמוס אישי
          </CardTitle>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1 text-green-400"><div className="w-2 h-2 rounded-full bg-green-400"></div>פיזי (23 יום)</span>
            <span className="flex items-center gap-1 text-red-400"><div className="w-2 h-2 rounded-full bg-red-400"></div>רגשי (28 יום)</span>
            <span className="flex items-center gap-1 text-blue-400"><div className="w-2 h-2 rounded-full bg-blue-400"></div>שכלי (33 יום)</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <ReferenceLine y={0} stroke="#4B5563" strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide domain={[-100, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: '#F3F4F6', marginBottom: '4px' }}
              />
              <Line type="monotone" dataKey="physical" stroke="#4ADE80" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="emotional" stroke="#F87171" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="intellectual" stroke="#60A5FA" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          הגרף מציג את המחזורים הטבעיים שלך לשבועיים הקרובים. מעל הקו - אנרגיה גבוהה, מתחת - זמן למנוחה.
        </p>
      </CardContent>
    </Card>
  );
}