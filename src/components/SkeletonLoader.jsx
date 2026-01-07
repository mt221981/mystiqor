import React from "react";
import { motion } from "framer-motion";

export function SkeletonCard({ count = 1 }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-700/50 rounded-full animate-pulse" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-700/50 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-700/50 rounded animate-pulse w-1/2" />
              <div className="h-3 bg-gray-700/50 rounded animate-pulse w-5/6" />
            </div>
          </div>
        </motion.div>
      ))}
    </>
  );
}

export function SkeletonList({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex items-center gap-4 bg-gray-800/30 rounded-lg p-4"
        >
          <div className="w-10 h-10 bg-gray-700/50 rounded-full animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-700/50 rounded animate-pulse w-2/3" />
            <div className="h-2 bg-gray-700/50 rounded animate-pulse w-1/3" />
          </div>
          <div className="w-16 h-8 bg-gray-700/50 rounded animate-pulse" />
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonStats() {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/30"
        >
          <div className="w-12 h-12 bg-gray-700/50 rounded-full animate-pulse mx-auto mb-4" />
          <div className="h-8 bg-gray-700/50 rounded animate-pulse w-16 mx-auto mb-2" />
          <div className="h-3 bg-gray-700/50 rounded animate-pulse w-24 mx-auto" />
        </motion.div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className="h-3 bg-gray-700/50 rounded animate-pulse"
          style={{ width: `${Math.random() * 30 + 70}%` }}
        />
      ))}
    </div>
  );
}

export default {
  Card: SkeletonCard,
  List: SkeletonList,
  Stats: SkeletonStats,
  Text: SkeletonText
};