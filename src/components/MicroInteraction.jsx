import React, { useState } from "react";
import { motion } from "framer-motion";

export function PulseButton({ children, onClick, className = "", ...props }) {
  const [isPulsing, setIsPulsing] = useState(false);

  const handleClick = (e) => {
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 600);
    onClick?.(e);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={className}
      {...props}
    >
      {isPulsing && (
        <motion.div
          className="absolute inset-0 bg-white rounded-lg"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      )}
      {children}
    </motion.button>
  );
}

export function FloatingAction({ children, className = "" }) {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function CountUp({ from = 0, to, duration = 1000, className = "" }) {
  const [count, setCount] = useState(from);

  React.useEffect(() => {
    let startTime;
    let animationFrame;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(from + (to - from) * progress));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [from, to, duration]);

  return (
    <motion.span
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={className}
    >
      {count}
    </motion.span>
  );
}

export function ShakeOnError({ children, trigger }) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.5 }
      } : {}}
    >
      {children}
    </motion.div>
  );
}

export function SuccessCheck({ size = 64 }) {
  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20
      }}
    >
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-green-500"
      >
        <motion.path
          d="M20 6L9 17l-5-5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
      </motion.svg>
    </motion.div>
  );
}

export default {
  PulseButton,
  FloatingAction,
  CountUp,
  ShakeOnError,
  SuccessCheck
};