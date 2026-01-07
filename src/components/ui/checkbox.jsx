import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const Checkbox = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => {
  return (
    <button
      ref={ref}
      role="checkbox"
      aria-checked={checked}
      type="button"
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded border-2 border-purple-600 ring-offset-background",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-all flex items-center justify-center",
        checked && "bg-purple-600 text-white",
        !checked && "bg-transparent",
        className
      )}
      {...props}
    >
      {checked && <Check className="h-4 w-4" />}
    </button>
  );
});

Checkbox.displayName = "Checkbox";

export { Checkbox };