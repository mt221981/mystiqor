import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";

export default function MessageRating({ messageId, initialRating }) {
  const [rating, setRating] = useState(initialRating);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (value) => {
    if (isSubmitting || !messageId) return;
    
    setIsSubmitting(true);
    try {
      await base44.entities.Message.update(messageId, {
        metadata: {
          rating: value,
          rated_at: new Date().toISOString()
        }
      });
      
      setRating(value);
    } catch (error) {
      console.error('Failed to rate message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (rating) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2 text-xs text-gray-400 mt-2"
      >
        {rating === 'positive' ? (
          <ThumbsUp className="w-3 h-3 text-green-400" />
        ) : (
          <ThumbsDown className="w-3 h-3 text-red-400" />
        )}
        <span>תודה על המשוב!</span>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleRate('positive')}
        disabled={isSubmitting}
        className="h-7 px-2 text-gray-400 hover:text-green-400 hover:bg-green-900/20"
      >
        <ThumbsUp className="w-3 h-3" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => handleRate('negative')}
        disabled={isSubmitting}
        className="h-7 px-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20"
      >
        <ThumbsDown className="w-3 h-3" />
      </Button>
    </div>
  );
}