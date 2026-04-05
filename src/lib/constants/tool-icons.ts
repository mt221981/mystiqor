/**
 * מיפוי סמלי כלים -- מקור אמת יחיד לאייקונים בכל האפליקציה
 * כל כלי מזוהה באייקון Lucide ייחודי
 */

import type { LucideIcon } from 'lucide-react';
import {
  Orbit,
  Layers,
  Hash,
  Moon,
  Hand,
  PenTool,
  Palette,
  Dna,
  Heart,
  Sparkles,
  Brain,
  Compass,
  Users,
  FileSearch,
  Clock,
  Merge,
  Sun,
} from 'lucide-react';

/** מיפוי מזהה כלי לאייקון Lucide -- 17 כלים ייחודיים */
export const TOOL_ICONS: Record<string, LucideIcon> = {
  astrology: Orbit,
  tarot: Layers,
  numerology: Hash,
  dream: Moon,
  palmistry: Hand,
  graphology: PenTool,
  drawing: Palette,
  'human-design': Dna,
  compatibility: Heart,
  coach: Sparkles,
  personality: Brain,
  career: Compass,
  relationships: Users,
  document: FileSearch,
  timing: Clock,
  synthesis: Merge,
  'daily-insights': Sun,
} as const;

/** קבל אייקון לפי מזהה כלי -- עם fallback ל-Sparkles */
export function getToolIcon(toolId: string): LucideIcon {
  return TOOL_ICONS[toolId] ?? Sparkles;
}
