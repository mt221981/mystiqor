import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone, WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import EnhancedToast from "./EnhancedToast";

/**
 * Enhanced PWA Manager
 * מנהל PWA מתקדם עם offline support, update notifications, and install prompt
 */

export default function EnhancedPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasUpdate, setHasUpdate] = useState(false);
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator).standalone
      || document.referrer.includes('android-app://');
    
    setIsPWA(isStandalone);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show install prompt after 30 seconds if not dismissed
      const hasSeenPrompt = localStorage.getItem('pwa-install-dismissed');
      if (!hasSeenPrompt && !isStandalone) {
        setTimeout(() => setShowInstallPrompt(true), 30000);
      }
    };

    // Listen for online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      EnhancedToast.success('חזרת לאינטרנט! 🌐');
    };

    const handleOffline = () => {
      setIsOnline(false);
      EnhancedToast.warning('אתה במצב לא מקוון', 'חלק מהתכונות עשויות להיות מוגבלות');
    };

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setHasUpdate(true);
            }
          });
        });
      });
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      EnhancedToast.success('תודה!', 'האפליקציה מותקנת...');
    }

    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismissInstall = () => {
    setShowInstallPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
      window.location.reload();
    }
  };

  return (
    <>
      {/* Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-white py-2 px-4 text-center text-sm font-semibold flex items-center justify-center gap-2"
          >
            <WifiOff className="w-4 h-4" />
            אתה במצב לא מקוון - חלק מהתכונות מוגבלות
          </motion.div>
        )}
      </AnimatePresence>

      {/* Update Available Notification */}
      <AnimatePresence>
        {hasUpdate && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <Card className="bg-gradient-to-r from-purple-600 to-pink-600 border-0 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <RefreshCw className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-sm mb-1">עדכון זמין!</h4>
                    <p className="text-purple-100 text-xs">גרסה חדשה של האפליקציה מוכנה</p>
                  </div>
                  <Button
                    onClick={handleUpdate}
                    size="sm"
                    className="bg-white text-purple-600 hover:bg-purple-50"
                  >
                    עדכן
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Install Prompt */}
      <AnimatePresence>
        {showInstallPrompt && !isPWA && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
          >
            <Card className="bg-gradient-to-br from-gray-900 to-purple-900 border-purple-500/50 shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Button
                    onClick={handleDismissInstall}
                    variant="ghost"
                    size="icon"
                    className="text-gray-400 hover:text-white absolute top-2 left-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="text-white font-bold text-base mb-1">התקן את האפליקציה 📱</h4>
                    <p className="text-gray-300 text-sm mb-3">
                      קבל גישה מהירה, התראות, ועבודה לא מקוונת
                    </p>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={handleInstallClick}
                        size="sm"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Download className="w-4 h-4 ml-2" />
                        התקן
                      </Button>
                      <Button
                        onClick={handleDismissInstall}
                        size="sm"
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        אולי מאוחר יותר
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Online Status Indicator (subtle, always visible) */}
      <div className="fixed bottom-4 left-4 z-40 pointer-events-none">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} shadow-lg`}
          title={isOnline ? 'מקוון' : 'לא מקוון'}
        />
      </div>
    </>
  );
}