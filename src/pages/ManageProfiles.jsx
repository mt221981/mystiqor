import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Trash2, Edit, User, Crown, StickyNote, Calendar, MapPin, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import LoadingSpinner from "@/components/LoadingSpinner";
import useSubscription from "@/components/useSubscription";

export default function ManageProfiles() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [expandedNotes, setExpandedNotes] = useState({});
  const { subscription, planInfo, remainingGuestProfiles, canCreateGuestProfile } = useSubscription();

  const [formData, setFormData] = useState({
    full_name: "",
    relationship: "friend",
    birth_date: "",
    birth_time: "",
    birth_place_name: "",
    birth_place_lat: null,
    birth_place_lon: null,
    gender: "",
    notes: ""
  });

  const { data: guestProfiles = [], isLoading } = useQuery({
    queryKey: ['guestProfiles'],
    queryFn: async () => {
      return await base44.entities.GuestProfile.filter({ is_active: true }, '-created_date');
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data) => {
      const profile = await base44.entities.GuestProfile.create(data);
      
      // Increment guest profiles counter
      if (subscription) {
        await base44.entities.Subscription.update(subscription.id, {
          guest_profiles_used: (subscription.guest_profiles_used || 0) + 1
        });
      }
      
      return profile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      EnhancedToast.success('פרופיל נוסף בהצלחה! 👤', 'עכשיו תוכל לטעון אותו בניתוחים');
      resetForm();
    },
    onError: () => {
      EnhancedToast.error('שגיאה בהוספת פרופיל');
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.GuestProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestProfiles'] });
      EnhancedToast.success('פרופיל עודכן! ✅');
      resetForm();
    }
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id) => {
      await base44.entities.GuestProfile.update(id, { is_active: false });
      
      // Decrement counter
      if (subscription) {
        await base44.entities.Subscription.update(subscription.id, {
          guest_profiles_used: Math.max(0, (subscription.guest_profiles_used || 0) - 1)
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guestProfiles'] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      EnhancedToast.success('פרופיל הוסר');
    }
  });

  const resetForm = () => {
    setFormData({
      full_name: "",
      relationship: "friend",
      birth_date: "",
      birth_time: "",
      birth_place_name: "",
      birth_place_lat: null,
      birth_place_lon: null,
      gender: "",
      notes: ""
    });
    setShowForm(false);
    setEditingProfile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.full_name || !formData.birth_date) {
      EnhancedToast.error('נא למלא שם ותאריך לידה');
      return;
    }

    if (!editingProfile && !canCreateGuestProfile) {
      EnhancedToast.error('הגעת למגבלת פרופילי האורחים', 'שדרג כדי להוסיף עוד');
      return;
    }

    if (editingProfile) {
      updateProfileMutation.mutate({ id: editingProfile.id, data: formData });
    } else {
      createProfileMutation.mutate(formData);
    }
  };

  const handleEdit = (profile) => {
    setEditingProfile(profile);
    setFormData({
      full_name: profile.full_name,
      relationship: profile.relationship,
      birth_date: profile.birth_date,
      birth_time: profile.birth_time || "",
      birth_place_name: profile.birth_place_name || "",
      birth_place_lat: profile.birth_place_lat,
      birth_place_lon: profile.birth_place_lon,
      gender: profile.gender || "",
      notes: profile.notes || ""
    });
    setShowForm(true);
  };

  const toggleNotes = (profileId) => {
    setExpandedNotes(prev => ({
      ...prev,
      [profileId]: !prev[profileId]
    }));
  };

  if (isLoading) {
    return <LoadingSpinner message="טוען פרופילים..." />;
  }

  const relationshipLabels = {
    partner: "בן/בת זוג",
    child: "ילד/ה",
    parent: "הורה",
    friend: "חבר/ה",
    sibling: "אח/אחות",
    other: "אחר"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <PageHeader
          title="ניהול פרופילים"
          description="נהל פרופילים לניתוחים - שלך ושל אחרים"
          icon={Users}
          iconGradient="from-blue-500 to-purple-500"
        />

        {/* Info Card */}
        <Card className="bg-indigo-900/50 backdrop-blur-xl border-indigo-700/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <StickyNote className="w-6 h-6 text-indigo-300 shrink-0 mt-1" />
              <div>
                <h3 className="text-indigo-200 font-bold text-lg mb-2">למה פרופילים שמורים?</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-2">
                  שמור פרופילים של אנשים שאתה מנתח לעיתים קרובות (משפחה, חברים, לקוחות). 
                  תוכל לטעון אותם בקליק אחד לכל ניתוח, ולהוסיף הערות אישיות על כל אחד.
                </p>
                <p className="text-yellow-200 text-xs font-semibold">
                  💡 טיפ: השתמש בשדה "הערות" לרשום תובנות, התפתחות אישית, או כל דבר שתרצה לזכור
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Status */}
        <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700/30 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-white font-bold text-xl mb-2 flex items-center gap-2">
                  <Crown className="w-6 h-6 text-yellow-400" />
                  {planInfo?.name}
                </h3>
                <p className="text-blue-200">
                  {remainingGuestProfiles === -1 
                    ? '♾️ פרופילי אורחים ללא הגבלה' 
                    : `נותרו ${remainingGuestProfiles} פרופילי אורחים`}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-white">
                  {guestProfiles.length}
                </div>
                <div className="text-blue-300 text-sm">פרופילים פעילים</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Profile Button */}
        {!showForm && (
          <Card className="bg-gray-900/80 border-purple-700/30 mb-6">
            <CardContent className="p-6">
              <Button
                onClick={() => {
                  if (!canCreateGuestProfile) {
                    EnhancedToast.error('הגעת למגבלה', 'שדרג כדי להוסיף עוד');
                    return;
                  }
                  setShowForm(true);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white h-14 text-lg"
              >
                <Plus className="w-5 h-5 ml-2" />
                הוסף פרופיל חדש
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card className="bg-gray-900/80 border-purple-700/30 mb-6">
                <CardHeader>
                  <CardTitle className="text-white">
                    {editingProfile ? 'ערוך פרופיל' : 'פרופיל חדש'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white">שם מלא *</Label>
                        <Input
                          value={formData.full_name}
                          onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                          placeholder="שם האורח"
                          className="bg-gray-800 border-purple-600/50 text-white"
                          dir="rtl"
                        />
                      </div>

                      <div>
                        <Label className="text-white">קשר</Label>
                        <Select 
                          value={formData.relationship} 
                          onValueChange={(value) => setFormData({ ...formData, relationship: value })}
                        >
                          <SelectTrigger className="bg-gray-800 border-purple-600/50 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(relationshipLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white">תאריך לידה *</Label>
                        <Input
                          type="date"
                          value={formData.birth_date}
                          onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                          className="bg-gray-800 border-purple-600/50 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">שעת לידה</Label>
                        <Input
                          type="time"
                          value={formData.birth_time}
                          onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                          className="bg-gray-800 border-purple-600/50 text-white"
                        />
                      </div>

                      <div>
                        <Label className="text-white">מגדר</Label>
                        <Select 
                          value={formData.gender} 
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger className="bg-gray-800 border-purple-600/50 text-white">
                            <SelectValue placeholder="בחר..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">זכר</SelectItem>
                            <SelectItem value="female">נקבה</SelectItem>
                            <SelectItem value="other">אחר</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-white">מקום לידה</Label>
                        <Input
                          value={formData.birth_place_name}
                          onChange={(e) => setFormData({ ...formData, birth_place_name: e.target.value })}
                          placeholder="עיר, מדינה"
                          className="bg-gray-800 border-purple-600/50 text-white"
                          dir="rtl"
                        />
                      </div>
                    </div>

                    {/* Notes Field - New */}
                    <div>
                      <Label className="text-white flex items-center gap-2">
                        <StickyNote className="w-4 h-4" />
                        הערות אישיות
                      </Label>
                      <Textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="רשום כאן כל דבר שתרצה לזכור על האדם הזה - תובנות, התפתחות, מחשבות..."
                        className="bg-gray-800 border-purple-600/50 text-white h-24"
                        dir="rtl"
                      />
                      <p className="text-purple-300 text-xs mt-1">
                        💡 לדוגמה: "בחודש האחרון עבר תהליך של...", "נראה שהשילוב של Life Path + Destiny משפיע על..."
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={resetForm}
                        variant="outline"
                        className="flex-1 border-purple-500 text-purple-300"
                      >
                        ביטול
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                      >
                        {editingProfile ? 'עדכן' : 'הוסף'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profiles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guestProfiles.map((profile) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="bg-gray-900/80 border-purple-700/30 hover:border-purple-500/50 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-lg">{profile.full_name}</h3>
                        <Badge className="bg-purple-600/30 text-purple-200">
                          {relationshipLabels[profile.relationship]}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm mb-4">
                    <div className="text-blue-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(profile.birth_date).toLocaleDateString('he-IL')}
                    </div>
                    {profile.birth_time && (
                      <div className="text-blue-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {profile.birth_time}
                      </div>
                    )}
                    {profile.birth_place_name && (
                      <div className="text-blue-300 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {profile.birth_place_name}
                      </div>
                    )}
                  </div>

                  {/* Notes Section */}
                  {profile.notes && (
                    <div className="mb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleNotes(profile.id)}
                        className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-900/30 w-full justify-start px-2 py-1"
                      >
                        <StickyNote className="w-4 h-4 ml-1" />
                        {expandedNotes[profile.id] ? 'הסתר הערות' : 'הצג הערות'}
                      </Button>
                      <AnimatePresence>
                        {expandedNotes[profile.id] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-yellow-900/20 rounded-lg p-3 mt-2 border border-yellow-700/30"
                          >
                            <p className="text-yellow-100 text-xs leading-relaxed whitespace-pre-wrap">
                              {profile.notes}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleEdit(profile)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      ערוך
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        if (confirm('למחוק פרופיל זה?')) {
                          deleteProfileMutation.mutate(profile.id);
                        }
                      }}
                      variant="outline"
                      className="border-red-500 text-red-300 hover:bg-red-900/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {guestProfiles.length === 0 && !showForm && (
          <Card className="bg-gray-900/50 border-purple-700/30">
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-2">אין פרופילי אורחים</h3>
              <p className="text-purple-300 mb-6">הוסף פרופילים כדי לנתח אנשים נוספים בקלות</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
              >
                <Plus className="w-5 h-5 ml-2" />
                הוסף פרופיל ראשון
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}