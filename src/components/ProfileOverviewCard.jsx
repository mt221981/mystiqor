import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Edit, Calendar, MapPin, Clock, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

/**
 * PROFILE OVERVIEW CARD
 * כרטיס מרכזי המציג את פרטי הפרופיל של המשתמש
 * עם גישה מהירה לעריכה
 */

export default function ProfileOverviewCard({ userProfile, user }) {
  if (!userProfile && !user) {
    return (
      <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700/30">
        <CardContent className="p-8 text-center">
          <User className="w-16 h-16 text-blue-300 mx-auto mb-4" />
          <h3 className="text-white text-xl font-bold mb-2">הפרופיל שלך</h3>
          <p className="text-blue-200 mb-4">
            השלם את הפרופיל שלך כדי לקבל ניתוחים מדויקים יותר
          </p>
          <Link to={createPageUrl('EditProfile')}>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 ml-2" />
              השלם פרופיל
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const displayName = userProfile?.full_name_hebrew || user?.full_name || "משתמש יקר";
  const firstName = displayName.split(' ')[0];
  const hasBirthTime = userProfile?.birth_time && userProfile.birth_time !== '';
  const hasBirthPlace = userProfile?.birth_place_name && userProfile.birth_place_name !== '';
  
  // Calculate profile completeness
  const totalFields = 6;
  let completedFields = 0;
  if (userProfile?.full_name_hebrew) completedFields++;
  if (userProfile?.birth_date) completedFields++;
  if (userProfile?.birth_time) completedFields++;
  if (userProfile?.birth_place_name) completedFields++;
  if (userProfile?.gender) completedFields++;
  if (user?.email) completedFields++;
  
  const completeness = Math.round((completedFields / totalFields) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-r from-indigo-900/60 to-purple-900/60 backdrop-blur-xl border-2 border-indigo-600/50 shadow-2xl overflow-hidden relative">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        
        <CardContent className="p-6 md:p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Profile Info */}
            <div className="flex items-start gap-4 flex-1">
              {/* Avatar */}
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <User className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  שלום, {firstName}! 👋
                </h2>
                <p className="text-indigo-200 mb-3">
                  {user?.email}
                </p>

                {/* Profile Details */}
                <div className="space-y-2 mb-4">
                  {userProfile?.birth_date && (
                    <div className="flex items-center gap-2 text-indigo-100">
                      <Calendar className="w-4 h-4 text-indigo-300" />
                      <span className="text-sm">
                        {new Date(userProfile.birth_date).toLocaleDateString('he-IL', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  {hasBirthTime && (
                    <div className="flex items-center gap-2 text-indigo-100">
                      <Clock className="w-4 h-4 text-indigo-300" />
                      <span className="text-sm">שעת לידה: {userProfile.birth_time}</span>
                    </div>
                  )}

                  {hasBirthPlace && (
                    <div className="flex items-center gap-2 text-indigo-100">
                      <MapPin className="w-4 h-4 text-indigo-300" />
                      <span className="text-sm">{userProfile.birth_place_name}</span>
                    </div>
                  )}
                </div>

                {/* Completeness Badge */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-indigo-800/50 rounded-full h-2 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${completeness}%` }}
                    />
                  </div>
                  <Badge className={`${
                    completeness === 100 ? 'bg-green-600' : 
                    completeness >= 66 ? 'bg-yellow-600' : 
                    'bg-orange-600'
                  } text-white font-semibold`}>
                    {completeness}%
                  </Badge>
                </div>
                
                {completeness < 100 && (
                  <p className="text-indigo-300 text-xs mt-2">
                    💡 השלם את הפרופיל לניתוחים מדויקים יותר
                  </p>
                )}
              </div>
            </div>

            {/* Edit Button */}
            <div className="w-full md:w-auto">
              <Link to={createPageUrl('EditProfile')}>
                <Button 
                  className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg px-6 py-3 h-auto"
                >
                  <Edit className="w-5 h-5 ml-2" />
                  <span className="text-base">ערוך פרופיל</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          {userProfile?.birth_date && (
            <div className="mt-6 pt-6 border-t border-indigo-700/50">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {new Date().getFullYear() - new Date(userProfile.birth_date).getFullYear()}
                  </div>
                  <div className="text-indigo-300 text-xs">גיל</div>
                </div>
                
                {userProfile?.gender && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {userProfile.gender === 'male' ? '♂️' : userProfile.gender === 'female' ? '♀️' : '⚧️'}
                    </div>
                    <div className="text-indigo-300 text-xs">מגדר</div>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {hasBirthTime ? '✓' : '✗'}
                  </div>
                  <div className="text-indigo-300 text-xs">שעת לידה</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {hasBirthPlace ? '✓' : '✗'}
                  </div>
                  <div className="text-indigo-300 text-xs">מקום לידה</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}