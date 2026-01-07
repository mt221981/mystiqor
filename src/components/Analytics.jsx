import { useEffect } from 'react';
import { base44 } from "@/api/base44Client";
import { useLocation } from 'react-router-dom';

/**
 * ANALYTICS SYSTEM - ENHANCED STABILITY
 * מערכת אנליטיקס מקיפה עם error handling חזק
 * כל הפונקציות כאן הן silent - לעולם לא יכשילו את האפליקציה
 */

// Helper to safely execute analytics without blocking main flow
const safeAnalyticsCall = async (fn, context = '') => {
  try {
    await fn();
  } catch (error) {
    // Silent failure - never break the app for analytics
    console.debug(`Analytics ${context} failed (non-critical):`, error.message);
  }
};

/**
 * Track page views
 */
export function usePageView(pageName) {
  const location = useLocation();
  
  useEffect(() => {
    safeAnalyticsCall(async () => {
      const user = await base44.auth.me().catch(() => null);
      
      await base44.entities.AnalyticsEvent.create({
        event_type: 'page_view',
        event_name: pageName,
        user_id: user?.id || 'anonymous',
        page_path: location.pathname,
        timestamp: new Date().toISOString(),
        metadata: {
          referrer: document.referrer || 'direct',
          user_agent: navigator.userAgent,
          screen_width: window.screen.width,
          screen_height: window.screen.height
        }
      });
    }, 'page_view');
  }, [pageName, location.pathname]);
}

/**
 * Track time spent on page
 */
export function useTimeTracking(pageName) {
  useEffect(() => {
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Only track if spent more than 5 seconds
      if (timeSpent > 5) {
        safeAnalyticsCall(async () => {
          const user = await base44.auth.me().catch(() => null);
          
          await base44.entities.AnalyticsEvent.create({
            event_type: 'time_spent',
            event_name: `${pageName}_time`,
            user_id: user?.id || 'anonymous',
            duration_seconds: timeSpent,
            timestamp: new Date().toISOString(),
            metadata: {
              page_name: pageName
            }
          });
        }, 'time_tracking');
      }
    };
  }, [pageName]);
}

/**
 * Track tool usage
 */
export async function trackToolUsage(toolName, metadata = {}) {
  return safeAnalyticsCall(async () => {
    const user = await base44.auth.me().catch(() => null);
    
    await base44.entities.AnalyticsEvent.create({
      event_type: 'tool_usage',
      event_name: toolName,
      user_id: user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        tool_name: toolName
      }
    });
  }, 'tool_usage');
}

/**
 * Track feature usage
 */
export async function trackFeatureUsage(featureName, metadata = {}) {
  return safeAnalyticsCall(async () => {
    const user = await base44.auth.me().catch(() => null);
    
    await base44.entities.AnalyticsEvent.create({
      event_type: 'feature_usage',
      event_name: featureName,
      user_id: user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        feature_name: featureName
      }
    });
  }, 'feature_usage');
}

/**
 * Track analysis completion
 */
export async function trackAnalysisComplete(analysisType, duration, confidenceScore, metadata = {}) {
  return safeAnalyticsCall(async () => {
    const user = await base44.auth.me().catch(() => null);
    
    await base44.entities.AnalyticsEvent.create({
      event_type: 'analysis_complete',
      event_name: `${analysisType}_analysis`,
      user_id: user?.id || 'anonymous',
      duration_seconds: duration,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        analysis_type: analysisType,
        confidence_score: confidenceScore,
        completion_time: duration
      }
    });
  }, 'analysis_complete');
}

/**
 * Track user errors
 */
export async function trackError(errorType, errorMessage, metadata = {}) {
  return safeAnalyticsCall(async () => {
    const user = await base44.auth.me().catch(() => null);
    
    await base44.entities.AnalyticsEvent.create({
      event_type: 'error',
      event_name: errorType,
      user_id: user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        error_type: errorType,
        error_message: errorMessage,
        user_agent: navigator.userAgent,
        page: window.location.pathname
      }
    });
  }, 'error_tracking');
}

/**
 * Track button clicks
 */
export async function trackButtonClick(buttonName, metadata = {}) {
  return safeAnalyticsCall(async () => {
    const user = await base44.auth.me().catch(() => null);
    
    await base44.entities.AnalyticsEvent.create({
      event_type: 'button_click',
      event_name: buttonName,
      user_id: user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        button_name: buttonName
      }
    });
  }, 'button_click');
}

/**
 * Track custom events
 */
export async function trackCustomEvent(eventName, eventType, metadata = {}) {
  return safeAnalyticsCall(async () => {
    const user = await base44.auth.me().catch(() => null);
    
    await base44.entities.AnalyticsEvent.create({
      event_type: eventType || 'custom',
      event_name: eventName,
      user_id: user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      metadata
    });
  }, 'custom_event');
}