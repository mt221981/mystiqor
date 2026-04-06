import React, { Suspense, lazy } from 'react';
import { Card, CardContent } from "@/components/ui/card";

/**
 * LAZY LOAD WRAPPER
 * עטיפה לטעינה עצלה של קומפוננטות כבדות
 */

const LoadingFallback = ({ message = "טוען..." }) => (
  <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black p-6 flex items-center justify-center">
    <Card className="bg-purple-900/50 border-purple-700/30">
      <CardContent className="p-12 text-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-xl">{message}</p>
      </CardContent>
    </Card>
  </div>
);

export default function LazyLoadWrapper({ component: Component, fallback, ...props }) {
  return (
    <Suspense fallback={fallback || <LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  );
}

// Pre-configured lazy loaded pages
export const LazyNumerology = lazy(() => import('../pages/Numerology'));
export const LazyAstrology = lazy(() => import('../pages/Astrology'));
export const LazyGraphology = lazy(() => import('../pages/Graphology'));
export const LazyDrawingAnalysis = lazy(() => import('../pages/DrawingAnalysis'));
export const LazyTarot = lazy(() => import('../pages/Tarot'));
export const LazyMysticSynthesis = lazy(() => import('../pages/MysticSynthesis'));
export const LazyAICoach = lazy(() => import('../pages/AICoach'));
export const LazyMyAnalyses = lazy(() => import('../pages/MyAnalyses'));