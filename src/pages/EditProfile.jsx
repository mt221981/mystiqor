import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Save, Calendar, MapPin, Loader2, CheckCircle, Target, Sparkles, Heart } from "lucide-react";
import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const MYSTICAL_DISCIPLINES = [
  { id: "numerology", label: "נומרולוגיה", emoji: "🔢", description: "מספרים וערכים נומריים" },
  { id: "astrology", label: "אסטרולוגיה", emoji: "⭐", description: "כוכבים ומזלות" },
  { id: "palmistry", label: "קריאת כף יד", emoji: "🖐️", description: "קווי היד" },
  { id: "graphology", label: "גרפולוגיה", emoji: "✍️", description: "ניתוח כתב יד" },
  { id: "tarot", label: "טארוט", emoji: "🃏", description: "קלפי טארוט" },
  { id: "drawing_analysis", label: "ניתוח ציורים", emoji: "🎨", description: "ציורים ואמנות" }
];

const FOCUS_AREAS = [
  { id: "career", label: "קריירה", emoji: "💼" },
  { id: "relationships", label: "יחסים", emoji: "💕" },
  { id: "personal_growth", label: "צמיחה אישית", emoji: "🌱" },
  { id: "spirituality", label: "רוחניות", emoji: "🧘" },
  { id: "health", label: "בריאות", emoji: "💪" },
  { id: "creativity", label: "יצירתיות", emoji: "🎨" },
  { id: "life_purpose", label: "תכלית חיים", emoji: "🎯" }
];

export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  const [formData, setFormData] = useState({
    full_name_hebrew: "",
    birth_date: "",
    birth_time: "",
    birth_place_name: "",
    birth_place_lat: null,
    birth_place_lon: null,
    gender: "",
    timezone_offset: 2,
    preferred_disciplines: [],
    personal_goals: [],
    focus_areas: [],
    ai_suggestions_enabled: true
  });

  const [newGoal, setNewGoal] = useState("");

  // Load existing profile data
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        full_name_hebrew: userProfile.full_name_hebrew || "",
        birth_date: userProfile.birth_date || "",
        birth_time: userProfile.birth_time || "",
        birth_place_name: userProfile.birth_place_name || "",
        birth_place_lat: userProfile.birth_place_lat || null,
        birth_place_lon: userProfile.birth_place_lon || null,
        gender: userProfile.gender || "",
        timezone_offset: userProfile.timezone_offset || 2,
        preferred_disciplines: userProfile.preferred_disciplines || [],
        personal_goals: userProfile.personal_goals || [],
        focus_areas: userProfile.focus_areas || [],
        ai_suggestions_enabled: userProfile.ai_suggestions_enabled !== false
      });
    }
  }, [userProfile]);

  const updateProfileMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.UserProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      EnhancedToast.success('הפרופיל עודכן בהצלחה! ✅');
      setTimeout(() => {
        navigate(createPageUrl('Home'));
      }, 1500);
    },
    onError: (error) => {
      EnhancedToast.error('אירעה שגיאה בעדכון הפרופיל');
      console.error(error);
    }
  });

  const createProfileMutation = useMutation({
    mutationFn: (data) => base44.entities.UserProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      EnhancedToast.success('הפרופיל נוצר בהצלחה! ✅');
      setTimeout(() => {
        navigate(createPageUrl('Home'));
      }, 1500);
    },
    onError: (error) => {
      EnhancedToast.error('אירעה שגיאה ביצירת הפרופיל');
      console.error(error);
    }
  });

  const handleLocationSearch = async () => {
    if (!formData.birth_place_name) {
      EnhancedToast.error('נא להזין שם מיקום');
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(formData.birth_place_name)}&format=json&limit=1`
      );
      const data = await response.json();
      
      if (data && data.length > 0) {
        setFormData({
          ...formData,
          birth_place_lat: parseFloat(data[0].lat),
          birth_place_lon: parseFloat(data[0].lon)
        });
        EnhancedToast.success('מיקום נמצא בהצלחה! 📍');
      } else {
        EnhancedToast.error('לא נמצא מיקום. נסה שם אחר.');
      }
    } catch (error) {
      EnhancedToast.error('שגיאה בחיפוש מיקום');
      console.error(error);
    }
  };

  const toggleDiscipline = (disciplineId) => {
    setFormData(prev => ({
      ...prev,
      preferred_disciplines: prev.preferred_disciplines.includes(disciplineId)
        ? prev.preferred_disciplines.filter(d => d !== disciplineId)
        : [...prev.preferred_disciplines, disciplineId]
    }));
  };

  const toggleFocusArea = (areaId) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.includes(areaId)
        ? prev.focus_areas.filter(a => a !== areaId)
        : [...prev.focus_areas, areaId]
    }));
  };

  const addGoal = () => {
    if (newGoal.trim()) {
      setFormData(prev => ({
        ...prev,
        personal_goals: [...prev.personal_goals, newGoal.trim()]
      }));
      setNewGoal("");
    }
  };

  const removeGoal = (index) => {
    setFormData(prev => ({
      ...prev,
      personal_goals: prev.personal_goals.filter((_, i) => i !== index)
    }));
  };

  const calculateCompletionScore = () => {
    const fields = [
      formData.full_name_hebrew,
      formData.birth_date,
      formData.birth_time,
      formData.birth_place_name,
      formData.gender,
      formData.preferred_disciplines.length > 0,
      formData.focus_areas.length > 0,
      formData.personal_goals.length > 0
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.full_name_hebrew || !formData.birth_date) {
      EnhancedToast.error('נא למלא שם ותאריך לידה');
      return;
    }

    setIsSaving(true);

    try {
      const submissionData = {
        ...formData,
        last_calculation_date: new Date().toISOString(),
        profile_completion_score: calculateCompletionScore(),
        onboarding_completed: true
      };

      if (userProfile) {
        await updateProfileMutation.mutateAsync({ id: userProfile.id, data: submissionData });
      } else {
        await createProfileMutation.mutateAsync(submissionData);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="טוען פרופיל..." />;
  }

  const completionScore = calculateCompletionScore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950/30 to-black p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="הפרופיל המיסטי שלך ✨"
          description="ככל שנדע יותר עליך, כך נוכל להציע תובנות מדויקות יותר"
          icon={User}
          iconGradient="from-indigo-500 to-purple-500"
        />

        {/* Completion Score */}
        <Card className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-xl border-purple-700/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-400" />
                <h3 className="text-white font-bold text-lg">שלמות הפרופיל</h3>
              </div>
              <span className="text-2xl font-black text-white">{completionScore}%</span>
            </div>
            <div className="w-full bg-indigo-950/50 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionScore}%` }}
              ></div>
            </div>
            <p className="text-purple-200 text-sm mt-2">
              {completionScore === 100 
                ? "🎉 פרופיל מושלם! עכשיו נוכל לתת לך את התובנות הכי מדויקות"
                : "השלם את הפרופיל כדי לקבל המלצות AI מותאמות אישית"}
            </p>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-indigo-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white">מידע בסיסי</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name_hebrew" className="text-white text-lg">
                  שם מלא *
                </Label>
                <Input
                  id="full_name_hebrew"
                  value={formData.full_name_hebrew}
                  onChange={(e) => setFormData({ ...formData, full_name_hebrew: e.target.value })}
                  placeholder="לדוגמה: דוד כהן"
                  className="bg-gray-800 border-indigo-700 text-white text-lg h-14"
                  dir="rtl"
                />
              </div>

              {/* Birth Date */}
              <div className="space-y-2">
                <Label htmlFor="birth_date" className="text-white text-lg flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  תאריך לידה *
                </Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="bg-gray-800 border-indigo-700 text-white text-lg h-14"
                />
              </div>

              {/* Birth Time */}
              <div className="space-y-2">
                <Label htmlFor="birth_time" className="text-white text-lg">
                  שעת לידה 🌟
                </Label>
                <Input
                  id="birth_time"
                  type="time"
                  value={formData.birth_time}
                  onChange={(e) => setFormData({ ...formData, birth_time: e.target.value })}
                  className="bg-gray-800 border-indigo-700 text-white text-lg h-14"
                />
                <p className="text-yellow-300 text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  שעת לידה מדויקת חיונית לאסטרולוגיה מדויקת ומפת לידה נכונה
                </p>
              </div>

              {/* Birth Place */}
              <div className="space-y-2">
                <Label htmlFor="birth_place_name" className="text-white text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  מקום לידה
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="birth_place_name"
                    value={formData.birth_place_name}
                    onChange={(e) => setFormData({ ...formData, birth_place_name: e.target.value })}
                    placeholder="לדוגמה: תל אביב, ישראל"
                    className="bg-gray-800 border-indigo-700 text-white text-lg h-14 flex-1"
                    dir="rtl"
                  />
                  <Button
                    type="button"
                    onClick={handleLocationSearch}
                    className="bg-blue-600 hover:bg-blue-700 h-14 px-6"
                  >
                    חפש
                  </Button>
                </div>
                {formData.birth_place_lat && formData.birth_place_lon && (
                  <p className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    מיקום נמצא: {formData.birth_place_lat.toFixed(4)}, {formData.birth_place_lon.toFixed(4)}
                  </p>
                )}
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <Label htmlFor="gender" className="text-white text-lg">מגדר</Label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full bg-gray-800 border-indigo-700 text-white text-lg h-14 rounded-lg px-4"
                >
                  <option value="">בחר...</option>
                  <option value="male">זכר</option>
                  <option value="female">נקבה</option>
                  <option value="other">אחר</option>
                  <option value="prefer_not_to_say">מעדיף/ה לא לציין</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Mystical Preferences */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-purple-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-purple-400" />
                העולם המיסטי שלך
              </CardTitle>
              <p className="text-purple-300 text-sm mt-2">
                בחר את התחומים שמעניינים אותך - זה יעזור לנו להציע ניתוחים מותאמים
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preferred Disciplines */}
              <div>
                <Label className="text-white text-lg mb-4 block">תחומים מועדפים</Label>
                <div className="grid md:grid-cols-2 gap-4">
                  {MYSTICAL_DISCIPLINES.map(discipline => (
                    <div
                      key={discipline.id}
                      onClick={() => toggleDiscipline(discipline.id)}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.preferred_disciplines.includes(discipline.id)
                          ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50'
                          : 'bg-gray-800 border-gray-700 hover:border-purple-500'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{discipline.emoji}</span>
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-1">{discipline.label}</h4>
                          <p className="text-gray-300 text-xs">{discipline.description}</p>
                        </div>
                        {formData.preferred_disciplines.includes(discipline.id) && (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Focus Areas */}
              <div>
                <Label className="text-white text-lg mb-4 block">תחומי מיקוד בחיים</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {FOCUS_AREAS.map(area => (
                    <div
                      key={area.id}
                      onClick={() => toggleFocusArea(area.id)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                        formData.focus_areas.includes(area.id)
                          ? 'bg-indigo-600 border-indigo-400'
                          : 'bg-gray-800 border-gray-700 hover:border-indigo-500'
                      }`}
                    >
                      <div className="text-2xl mb-1">{area.emoji}</div>
                      <div className="text-white text-sm font-semibold">{area.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Goals */}
          <Card className="bg-gray-900/80 backdrop-blur-xl border-2 border-pink-800 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-3">
                <Target className="w-7 h-7 text-pink-400" />
                המטרות האישיות שלך
              </CardTitle>
              <p className="text-pink-300 text-sm mt-2">
                מה אתה רוצה להשיג? ה-AI ישתמש במידע הזה כדי לתת המלצות מותאמות
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="לדוגמה: להבין את ייעוד החיים שלי"
                  className="bg-gray-800 border-pink-700 text-white h-12 flex-1"
                  dir="rtl"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                />
                <Button
                  type="button"
                  onClick={addGoal}
                  className="bg-pink-600 hover:bg-pink-700 h-12 px-6"
                >
                  הוסף
                </Button>
              </div>

              {formData.personal_goals.length > 0 && (
                <div className="space-y-2">
                  {formData.personal_goals.map((goal, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 bg-pink-900/30 rounded-lg p-3 border border-pink-700/50"
                    >
                      <Heart className="w-5 h-5 text-pink-400 shrink-0" />
                      <span className="text-white flex-1">{goal}</span>
                      <Button
                        type="button"
                        onClick={() => removeGoal(index)}
                        variant="ghost"
                        size="sm"
                        className="text-pink-300 hover:text-pink-100 h-8 w-8 p-0"
                      >
                        ✕
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* AI Suggestions Toggle */}
          <Card className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 backdrop-blur-xl border-amber-700/50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  id="ai_suggestions"
                  checked={formData.ai_suggestions_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, ai_suggestions_enabled: checked })}
                  className="mt-1"
                />
                <div className="flex-1">
                  <label htmlFor="ai_suggestions" className="text-white font-bold text-lg cursor-pointer block mb-1">
                    אפשר המלצות AI מותאמות אישית 🤖
                  </label>
                  <p className="text-amber-200 text-sm">
                    ה-AI ינתח את הפרופיל שלך ויציע ניתוחים ותובנות שהכי מתאימים לך בהתבסס על העדפות, מטרות ותחומי המיקוד שלך
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              onClick={() => navigate(createPageUrl('Home'))}
              variant="outline"
              className="flex-1 border-indigo-500 text-indigo-300 hover:bg-indigo-900/30 h-14"
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white h-14 text-lg"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                  שומר...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 ml-2" />
                  שמור שינויים
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}