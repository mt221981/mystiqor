'use client';

/**
 * דף ניתוח חלומות — תיעוד חלום + ניתוח AI אסינכרוני
 * Pattern: submit → toast מיידי → polling לתוצאה עד שהפרשנות מוכנה
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';
import { Loader2, Plus, X, Moon } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import type { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StandardSectionHeader } from '@/components/layouts/StandardSectionHeader';
import { MysticLoadingText } from '@/components/ui/mystic-loading-text';
import { MYSTIC_LOADING_PHRASES } from '@/lib/constants/mystic-loading-phrases';
import { animations } from '@/lib/animations/presets';
import { DreamInputSchema } from '@/app/api/tools/dream/route';
import { SubscriptionGuard } from '@/components/features/subscription/SubscriptionGuard';
import { useSubscription } from '@/hooks/useSubscription';
import { DREAM_EMOTIONS } from '@/lib/constants/dream-data';
import { cn } from '@/lib/utils/cn';

// ===== טיפוסים =====

/** טיפוס קלט הטופס — כל שדות חובה ברמת הטופס */
interface FormValues {
  title: string;
  description: string;
  dreamDate: string;
  emotions: string[];
  symbols: string[];
  generateImage: boolean;
}

/** תשובת GET polling */
interface DreamPollResponse {
  data: { ai_interpretation: string | null; title: string } | null;
}

/** תשובת POST */
interface DreamPostResponse {
  data?: { dream_id: string; status: 'processing' };
  error?: unknown;
}

// ===== קומפוננטה: הוספת תגיות =====

/** Props לכלי הוספת תגיות (רגשות / סמלים) */
interface TagInputProps {
  label: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

/** רכיב הוספת תגיות — input + כפתור + chips */
function TagInput({ label, values, onAdd, onRemove, placeholder }: TagInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleAdd = useCallback(() => {
    const trimmed = inputValue.trim();
    if (trimmed && values.length < 10) {
      onAdd(trimmed);
      setInputValue('');
    }
  }, [inputValue, values.length, onAdd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  }, [handleAdd]);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          dir="rtl"
          className="flex-1"
        />
        <Button type="button" variant="outline" size="icon" onClick={handleAdd} disabled={values.length >= 10}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">הוסף</span>
        </Button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {values.map((val, i) => (
            <Badge key={i} variant="secondary" className="gap-1">
              {val}
              <button type="button" onClick={() => onRemove(i)} aria-label={`הסר ${val}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== קומפוננטה ראשית =====

/** דף ניתוח חלומות */
export default function DreamPage() {
  const { incrementUsage } = useSubscription();
  const shouldReduceMotion = useReducedMotion();
  const [dreamId, setDreamId] = useState<string | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      title: '',
      description: '',
      dreamDate: new Date().toISOString().split('T')[0],
      emotions: [],
      symbols: [],
      generateImage: false,
    },
  });

  const emotions = watch('emotions') ?? [];
  const symbols = watch('symbols') ?? [];

  /** החלפת מצב רגש — toggle on/off */
  const toggleEmotion = useCallback((value: string) => {
    const next = emotions.includes(value)
      ? emotions.filter((e) => e !== value)
      : [...emotions, value];
    setValue('emotions', next, { shouldValidate: false });
  }, [emotions, setValue]);

  /** הוספת סמל */
  const addSymbol = useCallback((val: string) => {
    setValue('symbols', [...symbols, val], { shouldValidate: false });
  }, [symbols, setValue]);

  /** הסרת סמל */
  const removeSymbol = useCallback((i: number) => {
    setValue('symbols', symbols.filter((_, idx) => idx !== i), { shouldValidate: false });
  }, [symbols, setValue]);

  /** polling לפרשנות AI */
  useEffect(() => {
    if (!dreamId || !isPolling) return;

    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/tools/dream?id=${encodeURIComponent(dreamId)}`);
        const json = await res.json() as DreamPollResponse;
        if (json.data?.ai_interpretation) {
          setInterpretation(json.data.ai_interpretation);
          setIsPolling(false);
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch {
        // שגיאת polling — ממשיכים לנסות
      }
    }, 5000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [dreamId, isPolling]);

  /** שליחת הטופס */
  const onSubmit = useCallback(async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/tools/dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = await res.json() as DreamPostResponse;

      if (!res.ok) {
        toast.error('שגיאה בשמירת החלום — נסה שנית');
        return;
      }

      if (json.data?.dream_id) {
        setDreamId(json.data.dream_id);
        setIsPolling(true);
        setInterpretation(null);
        toast.success('חלומך נשמר! הניתוח יהיה מוכן בקרוב');
        void incrementUsage().catch(() => {});
      }
    } catch {
      toast.error('שגיאת רשת — נסה שנית');
    } finally {
      setIsSubmitting(false);
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
        title="ניתוח חלומות"
        description="תעד את חלומך וקבל פרשנות פסיכולוגית"
        icon={<Moon className="h-5 w-5" />}
        breadcrumbs={[{ label: 'כלים', href: '/tools' }, { label: 'ניתוח חלומות' }]}
      />

      {/* טופס חלום */}
      <Card className="border-outline-variant/10 bg-surface-container rounded-xl mystic-hover">
        <CardHeader><CardTitle className="font-headline text-primary">תיעוד החלום</CardTitle></CardHeader>
        <CardContent>
          <SubscriptionGuard feature="analyses">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* כותרת */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-label text-on-surface-variant">כותרת</Label>
              <Input id="title" {...register('title')} placeholder="שם קצר לחלום" dir="rtl" className="bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40 font-body" />
              {errors.title && <p className="text-sm text-error">{errors.title.message}</p>}
            </div>

            {/* תיאור */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-label text-on-surface-variant">תיאור החלום</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="ספר את החלום בפרטים — מה ראית, מה הרגשת, מה קרה?"
                dir="rtl"
                rows={5}
                className="resize-y bg-surface-container-lowest border-none rounded-lg p-4 text-on-surface placeholder:text-outline/40 focus:ring-1 focus:ring-primary/40 font-body"
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            {/* תאריך */}
            <div className="space-y-2">
              <Label htmlFor="dreamDate">תאריך החלום</Label>
              <Input id="dreamDate" type="date" {...register('dreamDate')} dir="ltr" className="text-start w-auto" />
            </div>

            {/* רגשות — גריד אימוג'י (per D-01, D-02, D-03) */}
            <div className="space-y-2">
              <Label className="font-label text-on-surface-variant">רגשות בחלום</Label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {DREAM_EMOTIONS.map((emotion) => (
                  <button
                    key={emotion.value}
                    type="button"
                    onClick={() => toggleEmotion(emotion.value)}
                    title={emotion.description}
                    aria-pressed={emotions.includes(emotion.value)}
                    className={cn(
                      'flex flex-col items-center gap-1 p-3 rounded-xl border transition-colors font-label text-xs',
                      emotions.includes(emotion.value)
                        ? 'border-primary bg-primary-container/20 text-primary'
                        : 'border-outline-variant/10 bg-surface-container-lowest text-on-surface-variant hover:border-primary/30 hover:text-on-surface'
                    )}
                  >
                    <span className="text-2xl leading-none" style={{ fontFamily: 'emoji' }}>
                      {emotion.emoji}
                    </span>
                    <span>{emotion.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* סמלים */}
            <TagInput
              label="סמלים וחפצים"
              values={symbols}
              onAdd={addSymbol}
              onRemove={removeSymbol}
              placeholder="למשל: מים, בית, ציפור..."
            />

            <Button type="submit" disabled={isSubmitting || isPolling} className="w-full sm:w-auto bg-gradient-to-br from-primary-container to-secondary-container text-white font-headline font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(143,45,230,0.3)] active:scale-95">
              {isSubmitting ? (
                <><Loader2 className="ms-2 h-4 w-4 animate-spin" /><MysticLoadingText text={MYSTIC_LOADING_PHRASES['dream']?.button ?? 'מפענח את החלום...'} /></>
              ) : (
                'שמור ונתח'
              )}
            </Button>
          </form>
          </SubscriptionGuard>
        </CardContent>
      </Card>

      {/* מצב המתנה לניתוח */}
      {isPolling && !interpretation && (
        <motion.div {...animations.fadeIn} className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>הניתוח מוכן בקרוב — בדרך כלל תוך 10-30 שניות</span>
        </motion.div>
      )}

      {/* תוצאת הניתוח */}
      {interpretation && (
        <motion.div {...animations.fadeInUp} transition={{ duration: 0.4 }}>
          <Card className="bg-surface-container rounded-xl border border-outline-variant/5 mystic-hover">
            <CardHeader><CardTitle className="font-headline text-primary">ניתוח החלום</CardTitle></CardHeader>
            <CardContent>
              <div className="result-heading-glow prose prose-sm prose-invert max-w-none font-body text-on-surface-variant">
                <ReactMarkdown>{interpretation}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
