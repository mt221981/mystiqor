import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function OptimizedImage({ 
  src, 
  alt, 
  className = "",
  fallback = "/placeholder.svg",
  lazy = true,
  ...props 
}) {
  const [imageSrc, setImageSrc] = useState(lazy ? null : src);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "50px" }
    );

    const element = document.getElementById(`img-${src}`);
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, [src, lazy]);

  if (hasError) {
    return (
      <div className={`bg-gray-800 flex items-center justify-center ${className}`}>
        <span className="text-gray-500 text-sm">תמונה לא זמינה</span>
      </div>
    );
  }

  return (
    <div id={`img-${src}`} className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-gray-800 animate-pulse ${className}`} />
      )}
      <motion.img
        src={imageSrc || fallback}
        alt={alt}
        className={className}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.3 }}
        {...props}
      />
    </div>
  );
}