import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Fingerprint, Info, Brain, Zap, Shield, Battery, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import EnhancedToast from "@/components/EnhancedToast";
import useSubscription from "@/components/useSubscription";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function HumanDesign() {
  const [formData, setFormData] = useState({ 
    name: "", 
    birthDate: "",
    birthTime: "",
    birthPlace: ""
  });
  const { incrementUsage } = useSubscription();

  const { data: userProfile } = useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.UserProfile.list('', 1);
      return profiles[0] || null;
    }
  });

  // Auto-fill from profile
  React.useEffect(() => {
    if (userProfile && !formData.name) {
      setFormData({
        name: userProfile.full_name_hebrew || userProfile.full_name || "",
        birthDate: userProfile.birth_date || "",
        birthTime: userProfile.birth_time || "",
        birthPlace: userProfile.birth_place_name || ""
      });
    }
  }, [userProfile]);

  const calculateMutation = useMutation({
    mutationFn: async (data) => {
      const response = await base44.functions.invoke('calculateHumanDesign', {
        birth_date: data.birthDate,
        birth_time: data.birthTime,
        birth_place: data.birthPlace,
        name: data.name
      });
      
      if (response.data.error) throw new Error(response.data.error);
      return response.data;
    },
    onSuccess: () => {
      EnhancedToast.success("המפה חושבה בהצלחה!");
      incrementUsage();
    },
    onError: (error) => {
      EnhancedToast.error("שגיאה בחישוב המפה", error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.birthDate || !formData.birthTime) {
      EnhancedToast.error("נא למלא תאריך ושעת לידה");
      return;
    }
    calculateMutation.mutate(formData);
  };

  const result = calculateMutation.data;

  // BodyGraph Visualization (Simplified)
  const Center = ({ active, name, color, icon: Icon, className }) => (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`w-16 h-16 md:w-20 md:h-20 ${active ? color : 'bg-gray-800/50 border-gray-700'} rounded-lg border-2 flex items-center justify-center flex-col gap-1 relative shadow-lg backdrop-blur-sm transition-all duration-500 ${className}`}
    >
      <Icon className={`w-5 h-5 md:w-6 md:h-6 ${active ? 'text-white' : 'text-gray-600'}`} />
      <span className={`text-[10px] md:text-xs font-bold ${active ? 'text-white' : 'text-gray-500'}`}>{name}</span>
      {active && <div className="absolute inset-0 bg-white/10 animate-pulse rounded-lg" />}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />
        <PageHeader
          title="עיצוב אנושי (Human Design) 🧬"
          description="גלה את המדריך למשתמש של הנשמה שלך"
          icon={Fingerprint}
          iconGradient="from-indigo-500 to-purple-500"
        />

        <SubscriptionGuard toolName="Human Design">
          <div className="grid lg:grid-cols-3 gap-8 mt-8">
            {/* Form Section */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-900/60 backdrop-blur-xl border-indigo-500/30 sticky top-8">
                <CardHeader>
                  <CardTitle className="text-white text-lg">הזנת נתונים</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label className="text-indigo-200">שם מלא</Label>
                      <Input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="bg-gray-800/50 border-gray-700 text-white mt-1" 
                      />
                    </div>
                    <div>
                      <Label className="text-indigo-200">תאריך לידה</Label>
                      <Input 
                        type="date" 
                        value={formData.birthDate} 
                        onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        className="bg-gray-800/50 border-gray-700 text-white mt-1" 
                      />
                    </div>
                    <div>
                      <Label className="text-indigo-200">שעת לידה (חשוב לדיוק)</Label>
                      <Input 
                        type="time" 
                        value={formData.birthTime} 
                        onChange={e => setFormData({...formData, birthTime: e.target.value})}
                        className="bg-gray-800/50 border-gray-700 text-white mt-1" 
                      />
                    </div>
                    <div>
                      <Label className="text-indigo-200">מקום לידה</Label>
                      <Input 
                        value={formData.birthPlace} 
                        onChange={e => setFormData({...formData, birthPlace: e.target.value})}
                        className="bg-gray-800/50 border-gray-700 text-white mt-1" 
                        placeholder="עיר, מדינה"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4 shadow-lg shadow-indigo-900/20"
                      disabled={calculateMutation.isPending}
                    >
                      {calculateMutation.isPending ? "מחשב..." : "חשב מפה"}
                      <Sparkles className="w-4 h-4 mr-2" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Results Section */}
            <div className="lg:col-span-2 space-y-6">
              <AnimatePresence mode="wait">
                {!result ? (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-full text-center p-12 bg-gray-900/30 rounded-3xl border-2 border-dashed border-gray-800"
                  >
                    <Fingerprint className="w-24 h-24 text-gray-700 mb-4" />
                    <h3 className="text-2xl font-bold text-gray-500">המפה שלך מחכה להתגלות</h3>
                    <p className="text-gray-600 mt-2 max-w-md">
                      הזן את פרטי הלידה המדויקים שלך כדי לחשוף את הטיפוס האנרגטי שלך, האסטרטגיה לחיים והסמכות הפנימית.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Key Attributes */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card className="bg-gradient-to-br from-indigo-900 to-purple-900 border-none shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-32 bg-purple-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                        <CardContent className="p-8 text-center relative z-10">
                          <Badge className="bg-indigo-500/20 text-indigo-200 mb-2 border-indigo-500/50">הטיפוס שלך</Badge>
                          <h2 className="text-4xl font-bold text-white mb-2">{result.type}</h2>
                          <p className="text-indigo-200 text-sm">{result.interpretation.type_description}</p>
                        </CardContent>
                      </Card>

                      <div className="grid grid-rows-2 gap-4">
                        <Card className="bg-gray-800/60 backdrop-blur border-l-4 border-l-green-500">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-green-500/20 p-3 rounded-full">
                              <Brain className="w-6 h-6 text-green-400" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-bold uppercase">אסטרטגיה</p>
                              <h3 className="text-xl font-bold text-white">{result.strategy}</h3>
                            </div>
                          </CardContent>
                        </Card>
                        <Card className="bg-gray-800/60 backdrop-blur border-l-4 border-l-yellow-500">
                          <CardContent className="p-4 flex items-center gap-4">
                            <div className="bg-yellow-500/20 p-3 rounded-full">
                              <Shield className="w-6 h-6 text-yellow-400" />
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs font-bold uppercase">סמכות פנימית</p>
                              <h3 className="text-xl font-bold text-white">{result.authority}</h3>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Interpretation */}
                    <Card className="bg-gray-900/50 backdrop-blur-xl border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                          <Info className="w-5 h-5 text-indigo-400" />
                          המדריך שלך
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="bg-indigo-950/30 p-4 rounded-xl border border-indigo-900/50">
                          <h4 className="text-indigo-300 font-bold mb-2">💡 איך לקבל החלטות נכונות?</h4>
                          <p className="text-gray-300 leading-relaxed">{result.interpretation.strategy_advice}</p>
                        </div>
                        
                        <div className="bg-purple-950/30 p-4 rounded-xl border border-purple-900/50">
                          <h4 className="text-purple-300 font-bold mb-2">🛡️ הסמכות הפנימית שלך</h4>
                          <p className="text-gray-300 leading-relaxed">{result.interpretation.authority_advice}</p>
                        </div>

                        <div>
                          <h4 className="text-white font-bold mb-2">על הפרופיל שלך ({result.profile})</h4>
                          <p className="text-gray-400 leading-relaxed">{result.interpretation.profile_meaning}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Centers Visual */}
                    <Card className="bg-gray-900/80 border-gray-800 overflow-hidden">
                      <CardHeader>
                        <CardTitle className="text-white text-center">מרכזי האנרגיה שלך</CardTitle>
                      </CardHeader>
                      <CardContent className="p-8">
                        <div className="relative flex flex-col items-center gap-4 max-w-sm mx-auto">
                          {/* Head & Ajna */}
                          <div className="flex flex-col items-center gap-2">
                            <Center active={result.centers.head} name="ראש" color="bg-yellow-500 border-yellow-400" icon={Brain} />
                            <Center active={result.centers.ajna} name="אג'נה" color="bg-green-600 border-green-500" icon={Info} />
                          </div>
                          
                          {/* Throat */}
                          <Center active={result.centers.throat} name="גרון" color="bg-blue-800 border-blue-600" icon={User} />
                          
                          {/* G & Heart */}
                          <div className="flex gap-12">
                            <Center active={result.centers.g_center} name="G" color="bg-yellow-400 border-yellow-300" icon={Fingerprint} />
                            <Center active={result.centers.heart} name="לב" color="bg-red-600 border-red-500" icon={Battery} />
                          </div>

                          {/* Spleen, Sacral, Solar Plexus */}
                          <div className="flex gap-4 items-center">
                            <Center active={result.centers.spleen} name="טחול" color="bg-amber-700 border-amber-600" icon={Shield} />
                            <Center active={result.centers.sacral} name="סקראל" color="bg-red-500 border-red-400" icon={Zap} />
                            <Center active={result.centers.solar_plexus} name="רגש" color="bg-orange-700 border-orange-600" icon={Activity} />
                          </div>

                          {/* Root */}
                          <Center active={result.centers.root} name="שורש" color="bg-orange-900 border-orange-800" icon={Zap} />
                        </div>
                        
                        <div className="mt-8 text-center text-sm text-gray-500">
                          <p>צבוע = מרכז מוגדר (אנרגיה קבועה ושופעת)</p>
                          <p>אפור = מרכז פתוח (רגישות, קליטה ושיקוף הסביבה)</p>
                        </div>
                      </CardContent>
                    </Card>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </SubscriptionGuard>
      </div>
    </div>
  );
}