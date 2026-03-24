/**
 * כרטיס תוכנית מנוי — מציג שם, מחיר, ותכונות
 */
'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { PlanInfo, PlanType } from '@/types/subscription';

/** מחירים לפי תוכנית */
const PLAN_PRICES: Record<PlanType, string> = {
  free: '₪0',
  basic: '₪49/חודש',
  premium: '₪99/חודש',
  enterprise: 'מותאם אישית',
};

/** Props של כרטיס תוכנית */
export interface PlanCardProps {
  planType: PlanType;
  planInfo: PlanInfo;
  isCurrentPlan?: boolean;
  onSelect?: (plan: PlanType) => void;
  highlighted?: boolean;
}

/** כרטיס תוכנית עם תכונות ו-CTA */
export function PlanCard({ planType, planInfo, isCurrentPlan, onSelect, highlighted }: PlanCardProps) {
  /** פרימיום — כרטיס גרדיאנט בולט */
  if (planType === 'premium') {
    return (
      <div className={cn('relative bg-gradient-to-br from-primary-container to-secondary-container rounded-xl p-6 celestial-glow', isCurrentPlan && 'ring-2 ring-tertiary')}>
        {isCurrentPlan && (
          <span className="absolute -top-2 start-4 bg-tertiary/10 text-tertiary font-label text-xs px-3 py-1 rounded-full border border-tertiary/30">
            התוכנית שלך
          </span>
        )}
        {!isCurrentPlan && (
          <span className="absolute -top-2 start-4 bg-tertiary/10 text-tertiary font-label text-xs px-3 py-1 rounded-full border border-tertiary/30">
            הכי פופולרי
          </span>
        )}
        <div className="text-center mb-4">
          <h3 className="font-headline font-bold text-xl text-white">{planInfo.name}</h3>
          <p className="font-headline font-black text-4xl text-white mt-2">{PLAN_PRICES[planType]}</p>
        </div>
        <ul className="space-y-2 mb-6">
          {planInfo.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 font-body text-sm text-white/90">
              <Check className="h-4 w-4 text-tertiary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {onSelect && !isCurrentPlan && (
          <Button
            onClick={() => onSelect(planType)}
            className="w-full bg-white text-primary-container font-headline font-bold rounded-xl py-3 hover:bg-white/90 active:scale-95"
          >
            שדרג
          </Button>
        )}
      </div>
    );
  }

  /** בסיסי — כרטיס עם גבול primary */
  if (planType === 'basic') {
    return (
      <div className={cn('relative bg-surface-container rounded-xl p-6 border border-primary/20 glow-soft', isCurrentPlan && 'ring-2 ring-primary/50')}>
        {isCurrentPlan && (
          <span className="absolute -top-2 start-4 bg-primary-container/20 text-primary font-label text-xs px-3 py-1 rounded-full border border-primary/30">
            התוכנית שלך
          </span>
        )}
        {highlighted && !isCurrentPlan && (
          <span className="absolute -top-2 start-4 bg-primary-container/20 text-primary font-label text-xs px-3 py-1 rounded-full border border-primary/30">
            מומלץ
          </span>
        )}
        <div className="text-center mb-4">
          <h3 className="font-headline font-bold text-xl text-on-surface">{planInfo.name}</h3>
          <p className="font-headline font-black text-4xl text-primary mt-2">{PLAN_PRICES[planType]}</p>
        </div>
        <ul className="space-y-2 mb-6">
          {planInfo.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 font-body text-sm text-on-surface-variant">
              <Check className="h-4 w-4 text-tertiary flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {onSelect && !isCurrentPlan && (
          <Button
            onClick={() => onSelect(planType)}
            className="w-full bg-primary-container text-on-primary-container rounded-xl py-3 font-headline font-bold hover:bg-primary-container/80 active:scale-95"
          >
            שדרג
          </Button>
        )}
      </div>
    );
  }

  /** חינם — כרטיס רגיל */
  return (
    <div className={cn('relative bg-surface-container rounded-xl p-6 border border-outline-variant/10', isCurrentPlan && 'ring-2 ring-tertiary/30')}>
      {isCurrentPlan && (
        <span className="absolute -top-2 start-4 bg-tertiary/10 text-tertiary font-label text-xs px-3 py-1 rounded-full border border-tertiary/30">
          התוכנית שלך
        </span>
      )}
      <div className="text-center mb-4">
        <h3 className="font-headline font-bold text-xl text-on-surface">{planInfo.name}</h3>
        <p className="font-headline font-black text-4xl text-on-surface mt-2">{PLAN_PRICES[planType]}</p>
      </div>
      <ul className="space-y-2 mb-6">
        {planInfo.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2 font-body text-sm text-on-surface-variant">
            <Check className="h-4 w-4 text-tertiary flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      {onSelect && !isCurrentPlan && (
        <Button
          onClick={() => onSelect(planType)}
          className="w-full border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high rounded-xl py-3 font-headline bg-transparent"
          variant="outline"
        >
          בחר
        </Button>
      )}
    </div>
  );
}
