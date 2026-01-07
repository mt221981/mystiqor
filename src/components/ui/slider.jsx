import * as React from "react";
import { cn } from "@/lib/utils";

const Slider = React.forwardRef(({ 
  className, 
  min = 0, 
  max = 100, 
  step = 1, 
  value = [50], 
  onValueChange,
  disabled = false,
  ...props 
}, ref) => {
  const [internalValue, setInternalValue] = React.useState(value[0] || min);
  const sliderRef = React.useRef(null);

  React.useEffect(() => {
    setInternalValue(value[0] || min);
  }, [value, min]);

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setInternalValue(newValue);
    if (onValueChange) {
      onValueChange([newValue]);
    }
  };

  const percentage = ((internalValue - min) / (max - min)) * 100;

  return (
    <div
      ref={ref}
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <input
        ref={sliderRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={internalValue}
        onChange={handleChange}
        disabled={disabled}
        className="absolute w-full h-2 bg-transparent appearance-none cursor-pointer z-10"
        style={{
          background: 'transparent'
        }}
      />
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-700">
        <div 
          className="absolute h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #9333ea;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.4);
        }
        input[type="range"]::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: 3px solid #9333ea;
          box-shadow: 0 2px 8px rgba(147, 51, 234, 0.4);
        }
        input[type="range"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
});

Slider.displayName = "Slider";

export { Slider };