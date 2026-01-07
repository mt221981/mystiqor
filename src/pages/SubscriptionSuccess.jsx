import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import confetti from "npm:canvas-confetti@1.9.2";

export default function SubscriptionSuccess() {
  useEffect(() => {
    // Celebration confetti
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#9333EA', '#EC4899', '#F59E0B']
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#9333EA', '#EC4899', '#F59E0B']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950/30 to-black flex items-center justify-center p-6">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full"
      >
        <Card className="bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-2 border-purple-500 shadow-2xl">
          <CardContent className="p-12 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
            >
              <CheckCircle className="w-12 h-12 text-white" />
            </motion.div>

            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-5xl font-black text-white mb-4"
            >
              🎉 ברוך הבא למועדון הפרימיום!
            </motion.h1>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-purple-200 mb-8"
            >
              התשלום בוצע בהצלחה והמנוי שלך פעיל כעת
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white/10 rounded-xl p-6 mb-8 backdrop-blur-sm"
            >
              <Sparkles className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
              <h3 className="text-white font-bold text-lg mb-2">
                מה מחכה לך עכשיו?
              </h3>
              <ul className="text-purple-200 space-y-2 text-sm">
                <li>✨ גישה לכל הכלים המיסטיים ללא הגבלה</li>
                <li>🤖 AI Coach מתקדם עם תובנות אישיות</li>
                <li>📊 ניתוחים וחיזויים מתקדמים</li>
                <li>👥 פרופילי אורח ללא הגבלה</li>
                <li>⚡ תמיכה עדיפות</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <Link to={createPageUrl("Home")} className="block">
                <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 text-lg">
                  התחל את המסע שלך! 🚀
                </Button>
              </Link>

              <Link to={createPageUrl("ManageSubscription")} className="block">
                <Button variant="outline" className="w-full border-purple-400 text-purple-200 hover:bg-purple-900/30">
                  נהל את המנוי שלך
                </Button>
              </Link>
            </motion.div>

            <p className="text-gray-400 text-xs mt-6">
              קיבלת אימייל עם פרטי המנוי • 7 ימי ניסיון חינם
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}