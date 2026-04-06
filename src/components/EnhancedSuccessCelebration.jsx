import { motion } from "framer-motion";
import { CheckCircle, Sparkles, Stars, Trophy } from "lucide-react";

// Enhanced success celebration with animations
export default function EnhancedSuccessCelebration({ 
  title = "הצלחה!",
  message,
  score,
  onContinue 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-purple-500 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: window.innerHeight + 100,
              opacity: 0
            }}
            animate={{
              y: -100,
              opacity: [0, 1, 1, 0],
              scale: [0, 1, 1, 0]
            }}
            transition={{
              duration: Math.random() * 2 + 2,
              delay: Math.random() * 2,
              repeat: Infinity
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200 }}
        className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-xl rounded-3xl p-12 max-w-lg w-full border-2 border-purple-500/50 shadow-2xl relative overflow-hidden"
      >
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 blur-3xl" />

        <div className="relative z-10 text-center">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="relative w-32 h-32 mx-auto mb-8"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 border-4 border-dashed border-yellow-400/50 rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-16 h-16 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, delay: 0.5, repeat: Infinity }}
              className="absolute -bottom-2 -left-2"
            >
              <Stars className="w-8 h-8 text-yellow-400" />
            </motion.div>
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold text-white mb-4"
          >
            {title}
          </motion.h2>

          {/* Message */}
          {message && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-purple-200 text-lg mb-6"
            >
              {message}
            </motion.p>
          )}

          {/* Score badge */}
          {score && (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="inline-flex items-center gap-2 bg-yellow-500/20 border-2 border-yellow-500/50 rounded-full px-6 py-3 mb-8"
            >
              <Trophy className="w-6 h-6 text-yellow-400" />
              <span className="text-white font-bold text-xl">
                דיוק: {score}%
              </span>
            </motion.div>
          )}

          {/* Continue button */}
          {onContinue && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl py-4 rounded-2xl shadow-xl"
            >
              המשך
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Mini success notification
export function MiniSuccess({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 z-50"
    >
      <CheckCircle className="w-5 h-5" />
      <span className="font-semibold">{message}</span>
    </motion.div>
  );
}