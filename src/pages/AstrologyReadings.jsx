import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Stars, Plus, Loader2, Calendar, Heart, Briefcase, 
  HelpCircle, TrendingUp, Sparkles, BookOpen, Users
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PageHeader from "@/components/PageHeader";
import AstrologyReadingCard from "@/components/AstrologyReadingCard";
import CompatibilityQuickInput from "@/components/CompatibilityQuickInput";
import EnhancedToast from "@/components/EnhancedToast";
import EnhancedEmptyState from "@/components/EnhancedEmptyState";
import { usePageView, useTimeTracking, trackFeatureUsage } from "@/components/Analytics";

const READING_TYPES = [
  {
    type: 'natal_chart',
    icon: Stars,
    label: 'מפת לידה מלאה',
    description: 'ניתוח מקיף של השמש, הירח, הצועד וכל הכוכבים',
    color: 'from-purple-600 to-indigo-600',
    emoji: '✨'
  },
  {
    type: 'monthly_forecast',
    icon: Calendar,
    label: 'תחזית חודשית',
    description: 'מה צפוי לך החודש לפי המעברים האסטרולוגיים',
    color: 'from-blue-600 to-cyan-600',
    emoji: '📅'
  },
  {
    type: 'yearly_forecast',
    icon: TrendingUp,
    label: 'תחזית שנתית',
    description: 'תחזית מפורטת לשנה שלמה לפי רבעונים ונושאים',
    color: 'from-green-600 to-emerald-600',
    emoji: '📈'
  },
  {
    type: 'transit_report',
    icon: TrendingUp,
    label: 'דוח מעברים',
    description: 'מעברים פלנטריים משמעותיים בתקופה הקרובה',
    color: 'from-teal-600 to-cyan-600',
    emoji: '🌊'
  },
  {
    type: 'compatibility',
    icon: Users,
    label: 'התאמה זוגית',
    description: 'ניתוח מעמיק של ההתאמה בינך לבין אדם אחר',
    color: 'from-pink-600 to-rose-600',
    emoji: '💕'
  },
  {
    type: 'relationship_dynamics',
    icon: Heart,
    label: 'דינמיקות יחסים',
    description: 'איך אתה אוהב, מה אתה צריך, ומי מתאים לך',
    color: 'from-rose-600 to-pink-600',
    emoji: '💖'
  },
  {
    type: 'career_potential',
    icon: Briefcase,
    label: 'פוטנציאל מקצועי',
    description: 'הכיוונים המקצועיים והכישרונות הטבעיים שלך',
    color: 'from-amber-600 to-orange-600',
    emoji: '💼'
  },
  {
    type: 'specific_question',
    icon: HelpCircle,
    label: 'שאלה ספציפית',
    description: 'שאל שאלה ספציפית וקבל תשובה אסטרולוגית',
    color: 'from-violet-600 to-purple-600',
    emoji: '❓'
  }
];

export default function AstrologyReadings() {
  const [selectedReadingType, setSelectedReadingType] = useState(null);
  const [specificQuestion, setSpecificQuestion] = useState('');
  const [person2Data, setPerson2Data] = useState({
    name: '',
    birth_date: '',
    birth_time: '',
    birth_place: ''
  });
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  usePageView('AstrologyReadings');
  useTimeTracking('AstrologyReadings');

  // Fetch all readings
  const { data: readings = [], isLoading } = useQuery({
    queryKey: ['astrologyReadings'],
    queryFn: async () => {
      const allReadings = await base44.entities.AstrologyReading.list('-generated_date', 50);
      return allReadings || [];
    },
    staleTime: 2 * 60 * 1000
  });

  // Check if user has natal chart
  const { data: hasNatalChart, isLoading: checkingChart } = useQuery({
    queryKey: ['hasNatalChart'],
    queryFn: async () => {
      const calcs = await base44.entities.AstrologyCalculation.list('', 1);
      return calcs.length > 0;
    }
  });

  // Fetch astrology calculation for birth chart display
  const { data: astrologyCalc } = useQuery({
    queryKey: ['astrologyCalculation'],
    queryFn: async () => {
      const calcs = await base44.entities.AstrologyCalculation.list('-created_date', 1);
      return calcs[0] || null;
    },
    enabled: hasNatalChart,
    staleTime: 5 * 60 * 1000
  });

  // Generate reading mutation
  const generateReadingMutation = useMutation({
    mutationFn: async ({ reading_type, input_question, person2_data, period_start, period_end }) => {
      const result = await base44.functions.invoke('generateAstrologyReading', {
        reading_type,
        input_question: input_question || null,
        person2_data: person2_data || null,
        period_start: period_start || null,
        period_end: period_end || null
      });
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['astrologyReadings'] });
      setIsDialogOpen(false);
      setSelectedReadingType(null);
      setSpecificQuestion('');
      setPerson2Data({ name: '', birth_date: '', birth_time: '', birth_place: '' });
      setPeriodStart('');
      setPeriodEnd('');
      EnhancedToast.success('הקריאה נוצרה! 🌟', 'הקריאה האסטרולוגית שלך מוכנה');
      trackFeatureUsage('astrology_reading_generated', { type: selectedReadingType });
    },
    onError: (error) => {
      EnhancedToast.error('שגיאה ביצירת הקריאה', error.message);
    }
  });

  const handleGenerateReading = async () => {
    // Validation
    if (selectedReadingType === 'specific_question' && !specificQuestion.trim()) {
      EnhancedToast.error('נא להזין שאלה');
      return;
    }

    if (selectedReadingType === 'compatibility') {
      if (!person2Data.name || !person2Data.birth_date) {
        EnhancedToast.error('נא למלא לפחות שם ותאריך לידה של האדם השני');
        return;
      }
    }

    if (selectedReadingType === 'transit_report') {
      if (!periodStart || !periodEnd) {
        EnhancedToast.error('נא לבחור טווח תאריכים');
        return;
      }
    }

    setIsGenerating(true);
    try {
      await generateReadingMutation.mutateAsync({
        reading_type: selectedReadingType,
        input_question: specificQuestion,
        person2_data: selectedReadingType === 'compatibility' ? person2Data : null,
        period_start: selectedReadingType === 'transit_report' ? periodStart : null,
        period_end: selectedReadingType === 'transit_report' ? periodEnd : null
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to set default period (3 months from now)
  const setDefaultPeriod = () => {
    const now = new Date();
    const threeMonthsLater = new Date();
    threeMonthsLater.setMonth(now.getMonth() + 3);
    
    setPeriodStart(now.toISOString().split('T')[0]);
    setPeriodEnd(threeMonthsLater.toISOString().split('T')[0]);
  };

  // Group readings by type
  const natalChartReadings = readings.filter(r => r.reading_type === 'natal_chart');
  const forecastReadings = readings.filter(r => ['monthly_forecast', 'yearly_forecast', 'transit_report'].includes(r.reading_type));
  const themeReadings = readings.filter(r => ['relationship_dynamics', 'career_potential', 'specific_question', 'compatibility'].includes(r.reading_type));

  if (checkingChart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    );
  }

  if (!hasNatalChart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <PageHeader
            title="קריאות אסטרולוגיות"
            description="קריאות מותאמות אישית מה-AI"
            icon={Stars}
            iconGradient="from-indigo-600 to-purple-600"
          />

          <Card className="bg-amber-900/50 border-amber-700">
            <CardContent className="p-8 text-center">
              <Stars className="w-16 h-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-3">נדרשת מפת לידה</h3>
              <p className="text-amber-200 mb-6">
                כדי ליצור קריאות אסטרולוגיות מותאמות אישית, קודם צריך ליצור את מפת הלידה שלך
              </p>
              <Button
                onClick={() => window.location.href = '/astrology'}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Stars className="w-5 h-5 ml-2" />
                צור מפת לידה
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-950 to-indigo-900 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="קריאות אסטרולוגיות 🌟"
          description="קריאות מותאמות אישית בינה מלאכותית מבוססות על מפת הלידה שלך"
          icon={Stars}
          iconGradient="from-indigo-600 to-purple-600"
        />

        {/* New Reading Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 border-0">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white text-2xl font-bold mb-2">
                    צור קריאה אסטרולוגית חדשה
                  </h3>
                  <p className="text-purple-100">
                    בחר מסוגי הקריאות השונים וקבל ניתוח מותאם אישית
                  </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-white text-purple-600 hover:bg-purple-50">
                      <Plus className="w-5 h-5 ml-2" />
                      קריאה חדשה
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>בחר סוג קריאה</DialogTitle>
                      <DialogDescription>
                        איזו קריאה אסטרולוגית תרצה לקבל?
                      </DialogDescription>
                    </DialogHeader>

                    <div className="grid md:grid-cols-2 gap-4 my-4">
                      {READING_TYPES.map((type) => {
                        const TypeIcon = type.icon;
                        const isSelected = selectedReadingType === type.type;

                        return (
                          <motion.div
                            key={type.type}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card
                              className={`cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-gradient-to-r ' + type.color + ' border-2 border-white'
                                  : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                              }`}
                              onClick={() => setSelectedReadingType(type.type)}
                            >
                              <CardContent className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className={`text-3xl`}>{type.emoji}</div>
                                  <div className="flex-1">
                                    <h4 className={`font-bold mb-1 ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                                      {type.label}
                                    </h4>
                                    <p className={`text-sm ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                                      {type.description}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Conditional inputs */}
                    {selectedReadingType === 'specific_question' && (
                      <div className="space-y-2">
                        <Label>השאלה שלך:</Label>
                        <Textarea
                          value={specificQuestion}
                          onChange={(e) => setSpecificQuestion(e.target.value)}
                          placeholder="לדוגמה: מה הכיוון המקצועי הטוב ביותר עבורי השנה?"
                          className="min-h-[100px]"
                        />
                      </div>
                    )}

                    {selectedReadingType === 'compatibility' && (
                      <CompatibilityQuickInput
                        value={person2Data}
                        onChange={setPerson2Data}
                      />
                    )}

                    {selectedReadingType === 'transit_report' && (
                      <div className="space-y-4 bg-teal-900/20 p-4 rounded-lg border border-teal-700/30">
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-bold">טווח תאריכים:</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={setDefaultPeriod}
                          >
                            3 חודשים קדימה
                          </Button>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>תאריך התחלה:</Label>
                            <Input
                              type="date"
                              value={periodStart}
                              onChange={(e) => setPeriodStart(e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>תאריך סיום:</Label>
                            <Input
                              type="date"
                              value={periodEnd}
                              onChange={(e) => setPeriodEnd(e.target.value)}
                            />
                          </div>
                        </div>
                        <p className="text-teal-300 text-xs">
                          💡 מומלץ: 3-6 חודשים לניתוח מעמיק של המעברים המשמעותיים
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsDialogOpen(false);
                          setSelectedReadingType(null);
                          setSpecificQuestion('');
                          setPerson2Data({ name: '', birth_date: '', birth_time: '', birth_place: '' });
                          setPeriodStart('');
                          setPeriodEnd('');
                        }}
                        className="flex-1"
                      >
                        ביטול
                      </Button>
                      <Button
                        onClick={handleGenerateReading}
                        disabled={!selectedReadingType || isGenerating}
                        className="flex-1 bg-purple-600 hover:bg-purple-700"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="w-5 h-5 ml-2 animate-spin" />
                            יוצר קריאה...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5 ml-2" />
                            צור קריאה
                          </>
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Readings Display */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              הכל ({readings.length})
            </TabsTrigger>
            <TabsTrigger value="natal">
              מפת לידה ({natalChartReadings.length})
            </TabsTrigger>
            <TabsTrigger value="forecasts">
              תחזיות ({forecastReadings.length})
            </TabsTrigger>
            <TabsTrigger value="themes">
              נושאים ({themeReadings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 text-white animate-spin" />
              </div>
            ) : readings.length === 0 ? (
              <EnhancedEmptyState
                icon={BookOpen}
                title="עדיין אין קריאות"
                description="צור את הקריאה האסטרולוגית הראשונה שלך"
                actionLabel="צור קריאה"
                onAction={() => setIsDialogOpen(true)}
              />
            ) : (
              <div className="grid gap-6">
                <AnimatePresence>
                  {readings.map((reading) => (
                    <AstrologyReadingCard
                      key={reading.id}
                      reading={reading}
                      astrologyData={reading.reading_type === 'natal_chart' ? astrologyCalc : null}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="natal" className="space-y-6">
            {natalChartReadings.length === 0 ? (
              <EnhancedEmptyState
                icon={Stars}
                title="אין קריאות מפת לידה"
                description="צור קריאה מקיפה של מפת הלידה שלך"
                actionLabel="צור קריאה"
                onAction={() => {
                  setSelectedReadingType('natal_chart');
                  setIsDialogOpen(true);
                }}
              />
            ) : (
              <div className="grid gap-6">
                {natalChartReadings.map((reading) => (
                  <AstrologyReadingCard
                    key={reading.id}
                    reading={reading}
                    astrologyData={astrologyCalc}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="forecasts" className="space-y-6">
            {forecastReadings.length === 0 ? (
              <EnhancedEmptyState
                icon={Calendar}
                title="אין תחזיות"
                description="צור תחזית אסטרולוגית חודשית, שנתית או דוח מעברים"
                actionLabel="צור תחזית"
                onAction={() => {
                  setSelectedReadingType('monthly_forecast');
                  setIsDialogOpen(true);
                }}
              />
            ) : (
              <div className="grid gap-6">
                {forecastReadings.map((reading) => (
                  <AstrologyReadingCard
                    key={reading.id}
                    reading={reading}
                    astrologyData={null}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="themes" className="space-y-6">
            {themeReadings.length === 0 ? (
              <EnhancedEmptyState
                icon={Heart}
                title="אין קריאות נושאיות"
                description="צור קריאה על יחסים, קריירה, התאמה או שאלה ספציפית"
                actionLabel="צור קריאה"
                onAction={() => setIsDialogOpen(true)}
              />
            ) : (
              <div className="grid gap-6">
                {themeReadings.map((reading) => (
                  <AstrologyReadingCard
                    key={reading.id}
                    reading={reading}
                    astrologyData={null}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}