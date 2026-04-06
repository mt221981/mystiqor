import React from "react";
import { motion } from "framer-motion";

/**
 * Micro-interactions for better UX feedback
 */

export const ButtonHover = ({ children, ...props }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    transition={{ duration: 0.15 }}
    {...props}
  >
    {children}
  </motion.button>
);

export const CardHover = ({ children, className = "", ...props }) => (
  <motion.div
    whileHover={{ 
      scale: 1.02,
      boxShadow: '0 10px 40px rgba(168, 85, 247, 0.3)'
    }}
    transition={{ duration: 0.2 }}
    className={className}
    {...props}
  >
    {children}
  </motion.div>
);

export const PulseOnHover = ({ children, ...props }) => (
  <motion.div
    whileHover={{
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.5,
        repeat: Infinity
      }
    }}
    {...props}
  >
    {children}
  </motion.div>
);

export const ShakeOnError = ({ children, shake = false, ...props }) => (
  <motion.div
    animate={shake ? {
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.4 }
    } : {}}
    {...props}
  >
    {children}
  </motion.div>
);

export const FadeInWhenVisible = ({ children, ...props }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.5 }}
    {...props}
  >
    {children}
  </motion.div>
);

export const CounterAnimation = ({ from = 0, to, duration = 1000, render }) => {
  const [count, setCount] = React.useState(from);

  React.useEffect(() => {
    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(from + (to - from) * progress));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [from, to, duration]);

  return render(count);
};