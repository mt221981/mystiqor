/**
 * כרטיס תוכנית מנוי — מציג שם, מחיר, ותכונות
 */
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  return (
    <Card className={cn(
      'relative transition-all',
      highlighted && 'border-primary shadow-lg shadow-primary/10',
      isCurrentPlan && 'border-green-500/50'
    )}>
      {isCurrentPlan && (
        <Badge className="absolute -top-2 start-4 bg-green-600">התוכנית שלך</Badge>
      )}
      {highlighted && !isCurrentPlan && (
        <Badge className="absolute -top-2 start-4 bg-primary">מומלץ</Badge>
      )}
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{planInfo.name}</CardTitle>
        <p className="text-2xl font-bold text-primary">{PLAN_PRICES[planType]}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <ul className="space-y-2">
          {planInfo.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        {onSelect && !isCurrentPlan && (
          <Button
            onClick={() => onSelect(planType)}
            variant={highlighted ? 'default' : 'outline'}
            className="w-full"
          >
            {planType === 'free' ? 'בחר' : 'שדרג'}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
