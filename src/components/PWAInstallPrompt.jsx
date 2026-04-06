import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      
      // Show prompt after 30 seconds
      setTimeout(() => {
        const hasShownBefore = localStorage.getItem('pwa-install-prompted');
        if (!hasShownBefore) {
          setShowPrompt(true);
        }
      }, 30000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('משתמש התקין את האפליקציה');
    }
    
    setDeferredPrompt(null);
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompted', 'true');
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompted', 'true');
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-6 md:w-96 z-50"
        >
          <Card className="bg-gradient-to-r from-purple-900 to-pink-900 border-2 border-purple-500 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">
                    📱 התקן את האפליקציה
                  </h3>
                  <p className="text-purple-200 text-sm">
                    קבל גישה מהירה ישירות מהמסך הראשי, בלי דפדפן
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="text-white/70 hover:text-white hover:bg-white/10 -mt-2 -ml-2"
                  aria-label="סגור"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={handleInstall}
                  className="flex-1 bg-white text-purple-900 hover:bg-purple-100"
                >
                  <Download className="w-5 h-5 ml-2" />
                  התקן עכשיו
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  אולי אחר כך
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}