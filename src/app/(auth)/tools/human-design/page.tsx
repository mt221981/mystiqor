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
import { GiDna1 } from 'react-icons/gi';
import { motion, useReducedMotion } from 'framer-motion';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader';
import { MysticLoadingText } from '@/components/ui/mystic-loading-text';
import { getLoadingPhrase } from '@/lib/constants/mystic-loading-phrases';
import { LocationSearch } from '@/components/forms/LocationSearch';
import { HumanDesignCenters } from '@/components/features/astrology/HumanDesignCenters';
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard';
import { animations } from '@/lib/animations/presets';
import { useSubscription } from '@/hooks/useSubscription';
import { HumanDesignInputSchema } from '@/lib/validations/human-design';
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
  'Generator': 'bg-tertiary/10 text-tertiary',
  'Manifesting Generator': 'bg-tertiary-container/20 text-on-tertiary-container',
  'Projector': 'bg-secondary-container/20 text-secondary',
  'Manifestor': 'bg-error/10 text-error',
  'Reflector': 'bg-primary-fixed/10 text-on-primary-fixed',
};

// ===== קומפוננטה ראשית =====

/** דף Human Design — טופס לידה + ויזואליזציה + ניתוח */
export default function HumanDesignPage() {
  const [result, setResult] = useState<HDResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [birthPlaceText, setBirthPlaceText] = useState('');
  const { incrementUsage } = useSubscription();
  const shouldReduceMotion = useReducedMotion();

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
        toast.error('שגיאה בחישוב עיצוב אנושי — נסה שנית');
        return;
      }
      if (json.data) {
        setResult(json.data);
        toast.success('ניתוח עיצוב אנושי מוכן!');
        // עדכן שימוש — non-blocking, non-fatal
        void incrementUsage().catch(() => {});
      }
    } catch {
      toast.error('שגיאת רשת — נסה שנית');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <motion.div
      className="space-y-8"
      dir="rtl"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={shouldReduceMotion ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <StandardSectionHeader
        title="עיצוב אנושי"
        description="גלה את מפת האנרגיה האישית שלך"
        icon={<GiDna1 className="h-6 w-6" />}
        breadcrumbs={[{ label: 'כלים', href: '/tools' }, { label: 'עיצוב אנושי' }]}
      />

      {/* טופס קלט */}
      <Card className="border-outline-variant/5 bg-surface-container mystic-hover">
        <CardHeader>
          <CardTitle className="text-primary font-headline">נתוני לידה</CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionGuard feature="analyses">
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
                <><Loader2 className="ms-2 h-4 w-4 animate-spin" /><MysticLoadingText text={getLoadingPhrase('human-design').button} /></>
              ) : (
                'חשב עיצוב אנושי'
              )}
            </Button>
          </form>
          </SubscriptionGuard>
        </CardContent>
      </Card>

      {/* תוצאות */}
      {result && (
        <motion.div {...animations.fadeInUp} transition={{ duration: 0.4 }} className="space-y-6">
          {/* ויזואליזציה */}
          <Card className="border-outline-variant/5 bg-surface-container mystic-hover">
            <CardHeader><CardTitle className="text-primary font-headline">מפת המרכזים</CardTitle></CardHeader>
            <CardContent>
              <HumanDesignCenters
                definedCenters={result.definedCenters}
                openCenters={result.openCenters}
                undefinedCenters={result.undefinedCenters}
              />
            </CardContent>
          </Card>

          {/* טיפוס ואוטוריטה */}
          <Card className="border-outline-variant/5 bg-surface-container">
            <CardContent className="space-y-3 pt-6">
              <div className="flex items-center gap-3 flex-wrap">
                <Badge className={`${TYPE_COLORS[result.type] ?? 'bg-tertiary/10 text-tertiary'} px-3 py-1 rounded-full font-label text-sm font-bold`}>
                  {result.type}
                </Badge>
                <span className="text-sm text-on-surface-variant font-label">פרופיל: {result.profile}</span>
              </div>
              <p className="text-sm text-on-surface font-body"><span className="font-label font-medium">אוטוריטה:</span> {result.authority}</p>
              <p className="text-sm text-on-surface font-body"><span className="font-label font-medium">אסטרטגיה:</span> {result.strategy}</p>
              {result.description && (
                <div className="result-heading-glow prose prose-invert prose-sm max-w-none text-on-surface-variant font-body">
                  <ReactMarkdown>{result.description}</ReactMarkdown>
                </div>
              )}
            </CardContent>
          </Card>

          {/* חוזקות ואתגרים */}
          {(result.strengths.length > 0 || result.challenges.length > 0) && (
            <div className="grid gap-4 sm:grid-cols-2">
              {result.strengths.length > 0 && (
                <Card className="border-outline-variant/5 bg-surface-container">
                  <CardHeader><CardTitle className="text-base font-headline text-tertiary">חוזקות</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {result.strengths.map((s, i) => (
                        <li key={i} className="text-sm font-body text-on-surface flex items-start gap-2">
                          <span className="text-tertiary mt-0.5">✓</span>{s}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
              {result.challenges.length > 0 && (
                <Card className="border-outline-variant/5 bg-surface-container">
                  <CardHeader><CardTitle className="text-base font-headline text-primary">אתגרים</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {result.challenges.map((c, i) => (
                        <li key={i} className="text-sm font-body text-on-surface flex items-start gap-2">
                          <span className="text-primary mt-0.5">△</span>{c}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* גילוי נאות — אזהרת AI */}
          <div className="rounded-xl border border-primary/20 bg-primary-container/10 p-4 flex gap-3 items-start">
            <Info className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-on-surface-variant font-body">{result.disclosure}</p>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
