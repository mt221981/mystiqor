/**
 * תג דיוק — מציג אחוז confidence עם צבע דינמי
 */
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';

/** Props של תג דיוק */
export interface ConfidenceBadgeProps {
  /** ערך confidence בין 0 ל-1 */
  confidence: number;
  /** CSS נוסף */
  className?: string;
}

/** תג המציג אחוז דיוק עם צבע דינמי */
export function ConfidenceBadge({ confidence, className }: ConfidenceBadgeProps) {
  const percentage = Math.round(confidence * 100);
  const colorClass = percentage >= 80
    ? 'bg-green-600/80 text-green-100 border-green-500/50'
    : percentage >= 60
      ? 'bg-blue-600/80 text-blue-100 border-blue-500/50'
      : 'bg-yellow-600/80 text-yellow-100 border-yellow-500/50';

  return (
    <Badge className={cn(colorClass, className)}>
      דיוק: {percentage}%
    </Badge>
  );
}
