'use client';

/**
 * דף Human Design — קלט לידה + מפת 9 מרכזי אנרגיה + טיפוס + אוטוריטה
 * משתמש בסימולציית LLM עם גילוי נאות מפורש על אי-דיוק
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Loader2, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/layouts/PageHeader';
import { LocationSearch } from '@/components/forms/LocationSearch';
import { HumanDesignCenters } from '@/components/features/astrology/HumanDesignCenters';
import { animations } from '@/lib/animations/presets';
import { HumanDesignInputSchema } from '@/app/api/tools/human-design/route';
import type { GeocodingResult } from '@/components/forms/LocationSearch';

// ===== טיפוסים =====

/** טיפוס קלט הטופס */
type FormValues = z.infer<typeof HumanDesignInputSchema>;

/** תוצאת Human Design מה-API */
interface HDResult {
  type: string;
  profile: string;
  authority: string;
  strategy: string;
  definedCenters: string[];
  undefinedCenters: string[];
  openCenters: string[];
  channels: string[];
  gates: string[];
  description: string;
  strengths: string[];
  challenges: string[];
  disclosure: string;
}

// ===== קבועים =====

/** צבעי badge לפי טיפוס Human Design */
const TYPE_COLORS: Record<string, string> = {
  'Generator': 'bg-green-600',
  'Manifesting Generator': 'bg-teal-600',
  'Projector': 'bg-blue-600',
  'Manifestor': 'bg-red-600',
  'Reflector': 'bg-yellow-600',
};

// ===== קומפוננטה ראשית =====

/** דף Human Design — טופס לידה + ויזואליזציה + ניתוח */
export default function HumanDesignPage() {
  const [result, setResult] = useState<HDResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [birthPlaceText, setBirthPlaceText] = useState('');

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(HumanDesignInputSchema),
  });

  /** טיפול בבחירת מיקום מ-LocationSearch */
  const handleLocationSelect = useCallback((geo: GeocodingResult) => {
    setValue('birthPlace', geo.display_name, { shouldValidate: true });
  }, [setValue]);

  /** שליחת הטופס — קריאה ל-API */
  const onSubmit = useCallback(async (values: FormValues) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tools/human-design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json() as { data?: HDResult; error?: unknown };
      if (!res.ok) {
        toast.error('שגיאה בחישוב Human Design — נסה שנית');
        return;
      }
      if (json.data) {
        setResult(json.data);
        toast.success('ניתוח Human Design מוכן!');
      }
    } catch {
      toast.error('שגיאת רשת — נסה שנית');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="space-y-8" dir="rtl">
      <PageHeader
        title="Human Design"
        description="גלה את מפת האנרגיה האישית שלך"
        breadcrumbs={[{ label: 'כלים', href: '/tools' }, { label: 'Human Design' }]}
      />

      {/* טופס קלט */}
      <Card>
        <CardHeader>
          <CardTitle>נתוני לידה</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="birthDate">תאריך לידה</Label>
                <Input id="birthDate" type="date" {...register('birthDate')} dir="ltr" className="text-start" />
                {errors.birthDate && (
                  <p className="text-sm text-destructive">{errors.birthDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthTime">שעת לידה</Label>
                <Input id="birthTime" type="time" {...register('birthTime')} dir="ltr" className="text-start" />
                {errors.birthTime && (
                  <p className="text-sm text-destructive">{errors.birthTime.message}</p>
                )}
              </div>
            </div>

            <LocationSearch
              value={birthPlaceText}
              onChange={(val) => {
                setBirthPlaceText(val);
                setValue('birthPlace', val, { shouldValidate: false });
              }}
              onSelect={handleLocationSelect}
              label="מקום לידה"
              placeholder="הקלד שם עיר..."
            />
            {errors.birthPlace && (
              <p className="text-sm text-destructive">{errors.birthPlace.message}</p>
            )}

            <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
              {isLoading ? (
                <><Loader2 className="ms-2 h-4 w-4 animate-spin" />מחשב...</>
              ) : (
                'חשב Human Design'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* תוצאות */}
      {result && (
        <motion.div {...animations.fadeInUp} transition={{ duration: 0.4 }} className="space-y-6">
          {/* ויזואליזציה */}
          <Card>
            <CardHeader><CardTitle>מפת המרכזים</CardTitle></CardHeader>
            <CardContent>
              <HumanDesignCenters
                definedCenters={result.definedCenters}
                openCenters={result.openCenters}
                undefinedCenters={result.undefinedCenters}
              />
            </CardContent>
          </Card>

          {/* טיפוס ואוטוריטה */}
          <Card>
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${TYPE_COLORS[result.type] ?? 'bg-purple-600'} text-white text-base px-4 py-1`}>
                  {result.type}
                </Badge>
                <span className="text-sm text-muted-foreground">פרופיל: {result.profile}</span>
              </div>
              <p className="text-sm"><span className="font-medium">אוטוריטה:</span> {result.authority}</p>
              <p className="text-sm"><span className="font-medium">אסטרטגיה:</span> {result.strategy}</p>
              {result.description && (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{result.description}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>

          {/* חוזקות ואתגרים */}
          {(result.strengths.length > 0 || result.challenges.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {result.strengths.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">חוזקות</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {result.challenges.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">אתגרים</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {result.challenges.map((c, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <span className="text-amber-500 mt-0.5">△</span>{c}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* גילוי נאות — אזהרת AI */}
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 flex gap-3 items-start">
            <Info className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-yellow-200">{result.disclosure}</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
