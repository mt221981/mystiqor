import { motion } from "framer-motion";
import { Loader2, Moon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function MysticalLoader({ message = "טוען..." }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900 p-6 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="relative w-32 h-32 mx-auto mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full opacity-20 blur-xl"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center"
          >
            <Moon className="w-12 h-12 text-white" />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 border-4 border-purple-500/30 rounded-full"
          />
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">{message}</h2>
        <p className="text-purple-300">אנא המתן...</p>
        
        <div className="flex justify-center gap-2 mt-6">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2
              }}
              className="w-3 h-3 bg-purple-500 rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <Card className="bg-gray-900/50 border-gray-700/30">
      <CardContent className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-700 rounded w-5/6"></div>
          <div className="flex gap-2 mt-4">
            <div className="h-6 bg-gray-700 rounded w-20"></div>
            <div className="h-6 bg-gray-700 rounded w-24"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SpinnerLoader({ size = "md", message = "טוען..." }) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24"
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`${sizeClasses[size]} text-purple-500 animate-spin mb-4`} aria-label="טוען" />
      {message && <p className="text-purple-300">{message}</p>}
    </div>
  );
}

export function DotsLoader({ message = "מעבד..." }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="flex gap-2 mb-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ 
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.15
            }}
            className="w-4 h-4 bg-purple-500 rounded-full"
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="text-purple-300">{message}</p>
    </div>
  );
}

export default MysticalLoader;