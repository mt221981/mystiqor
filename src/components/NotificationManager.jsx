import { useEffect } from "react";
import EnhancedToast from "./EnhancedToast";

/**
 * NOTIFICATION MANAGER - ENHANCED STABILITY
 * מנהל התראות עם error handling חזק
 */

let notificationPermission = 'default';

// Safe notification permission check
const checkNotificationSupport = () => {
  return 'Notification' in window && typeof Notification !== 'undefined';
};

export function requestNotificationPermission() {
  if (!checkNotificationSupport()) {
    console.log('Notifications not supported in this browser');
    return;
  }

  try {
    if (Notification.permission === 'default') {
      Notification.requestPermission()
        .then(permission => {
          notificationPermission = permission;
          if (permission === 'granted') {
            EnhancedToast.success('התראות הופעלו!', 'נעדכן אותך על אירועים חשובים');
          }
        })
        .catch(error => {
          console.log('Notification permission request failed:', error);
        });
    }
  } catch (error) {
    console.log('Notification permission error:', error);
  }
}

export function showNotification(title, options = {}) {
  if (!checkNotificationSupport()) {
    return;
  }

  try {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        dir: 'rtl',
        lang: 'he',
        ...options
      });
    }
  } catch (error) {
    console.log('Failed to show notification:', error);
  }
}

export function notifyAnalysisComplete(toolName, confidenceScore) {
  try {
    showNotification(
      `${toolName} הושלם!`,
      {
        body: `הניתוח שלך מוכן עם דיוק של ${confidenceScore}% 🎉`,
        tag: 'analysis-complete',
        requireInteraction: false
      }
    );
  } catch (error) {
    console.log('Analysis notification failed:', error);
  }
}

export function notifyReminderDue(reminderTitle, description) {
  try {
    showNotification(
      `⏰ תזכורת: ${reminderTitle}`,
      {
        body: description,
        tag: 'reminder',
        requireInteraction: true
      }
    );
  } catch (error) {
    console.log('Reminder notification failed:', error);
  }
}

export function notifyDailyInsight(insightTitle, insightContent, actionableTip) {
  try {
    showNotification(
      `✨ ${insightTitle}`,
      {
        body: insightContent + '\n\n💡 ' + actionableTip,
        tag: 'daily-insight',
        requireInteraction: false,
        icon: '/icon-192.png',
        vibrate: [200, 100, 200]
      }
    );
  } catch (error) {
    console.log('Daily insight notification failed:', error);
  }
}

export default function NotificationManager() {
  useEffect(() => {
    if (!checkNotificationSupport()) {
      return;
    }

    try {
      notificationPermission = Notification.permission;

      const timer = setTimeout(() => {
        if (notificationPermission === 'default') {
          EnhancedToast.info(
            'רוצה התראות?',
            'נוכל לעדכן אותך על תזכורות, תובנות יומיות ואירועים אסטרולוגיים',
            {
              duration: 8000,
              action: {
                label: 'הפעל',
                onClick: requestNotificationPermission
              }
            }
          );
        }
      }, 10000);

      return () => clearTimeout(timer);
    } catch (error) {
      console.log('NotificationManager initialization error:', error);
    }
  }, []);

  return null;
}