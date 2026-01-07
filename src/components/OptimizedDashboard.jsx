import { lazyLoadComponent } from './LazyLoad';

// Lazy load heavy components
export const PatternDetector = lazyLoadComponent(
  () => import('./PatternDetector'),
  'טוען זיהוי דפוסים...'
);

export const PredictiveInsights = lazyLoadComponent(
  () => import('./PredictiveInsights'),
  'טוען תחזיות...'
);

export const SmartRecommendations = lazyLoadComponent(
  () => import('./SmartRecommendations'),
  'טוען המלצות...'
);

export const AISuggestionsWidget = lazyLoadComponent(
  () => import('./AISuggestionsWidget'),
  'טוען הצעות AI...'
);

export const GoalProgressWidget = lazyLoadComponent(
  () => import('./GoalProgressWidget'),
  'טוען יעדים...'
);

export const AstrologyWidget = lazyLoadComponent(
  () => import('./AstrologyWidget'),
  'טוען אסטרולוגיה...'
);

export const DocumentInsightsWidget = lazyLoadComponent(
  () => import('./DocumentInsightsWidget'),
  'טוען תובנות...'
);

export const UpcomingTrendsWidget = lazyLoadComponent(
  () => import('./UpcomingTrendsWidget'),
  'טוען מגמות...'
);