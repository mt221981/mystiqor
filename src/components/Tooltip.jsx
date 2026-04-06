import React from "react";
import { Info } from "lucide-react";
import { motion } from "framer-motion";

export default function Tooltip({ children, content, position = "top" }) {
  const [isVisible, setIsVisible] = React.useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2"
  };

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || <Info className="w-4 h-4 text-purple-400" />}
      </div>
      
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute z-50 ${positionClasses[position]} pointer-events-none`}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg px-3 py-2 shadow-xl border border-purple-700/30 max-w-xs whitespace-normal">
            {content}
            <div className={`absolute w-2 h-2 bg-gray-900 border-purple-700/30 transform rotate-45 ${
              position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2 border-b border-r' :
              position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2 border-t border-l' :
              position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2 border-r border-t' :
              'left-[-4px] top-1/2 -translate-y-1/2 border-l border-b'
            }`} />
          </div>
        </motion.div>
      )}
    </div>
  );
}