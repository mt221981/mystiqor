import React from "react";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Info } from "lucide-react";
import { motion } from "framer-motion";

export default function BigFiveRadarChart({ bigFiveData, garoot_disclaimer }) {
  if (!bigFiveData) return null;

  const data = [
    {
      dimension: "פתיחות",
      value: bigFiveData.openness || 50,
      fullMark: 100,
      rho: "ρ≈0.3"
    },
    {
      dimension: "מצפוניות",
      value: bigFiveData.conscientiousness || 50,
      fullMark: 100,
      rho: "ρ≈0.3"
    },
    {
      dimension: "מוחצנות",
      value: bigFiveData.extraversion || 50,
      fullMark: 100,
      rho: "ρ≈0.15"
    },
    {
      dimension: "נעימות",
      value: bigFiveData.agreeableness || 50,
      fullMark: 100,
      rho: "ρ≈0.45"
    },
    {
      dimension: "יציבות",
      value: 100 - (bigFiveData.neuroticism || 50),
      fullMark: 100,
      rho: "ρ≈0.1"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl border-blue-700/30">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-blue-200 flex items-center gap-2">
              <Activity className="w-7 h-7" />
              השוואה ל-Big Five (Garoot 2021)
            </h3>
            <Badge className="bg-yellow-600 text-white">
              מבוסס מחקר (מתאמים חלשים)
            </Badge>
          </div>

          {garoot_disclaimer && (
            <div className="bg-yellow-800/20 border border-yellow-600/40 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-yellow-300 shrink-0 mt-0.5" />
                <p className="text-yellow-100 text-sm leading-relaxed">
                  {garoot_disclaimer}
                </p>
              </div>
            </div>
          )}

          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={data}>
              <PolarGrid stroke="#4B5563" />
              <PolarAngleAxis 
                dataKey="dimension" 
                tick={{ fill: '#93C5FD', fontSize: 14, fontWeight: 'bold' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Radar
                name="ציון"
                dataKey="value"
                stroke="#3B82F6"
                fill="#3B82F6"
                fillOpacity={0.6}
                strokeWidth={3}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '2px solid #3B82F6',
                  borderRadius: '12px',
                  padding: '12px'
                }}
                labelStyle={{ color: '#93C5FD', fontWeight: 'bold', marginBottom: '8px' }}
                itemStyle={{ color: '#DBEAFE' }}
                formatter={(value, name, props) => {
                  return [
                    <div key="tooltip">
                      <div className="font-bold text-lg">{value}%</div>
                      <div className="text-xs text-gray-400 mt-1">{props.payload.rho}</div>
                    </div>,
                    props.payload.dimension
                  ];
                }}
              />
            </RadarChart>
          </ResponsiveContainer>

          <div className="grid grid-cols-5 gap-3 mt-6">
            {data.map((item) => (
              <div key={item.dimension} className="bg-blue-800/30 rounded-lg p-3 text-center">
                <div className="text-blue-200 text-xs mb-1">{item.dimension}</div>
                <div className="text-2xl font-bold text-white mb-1">{item.value}%</div>
                <div className="text-xs text-blue-400">{item.rho}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}