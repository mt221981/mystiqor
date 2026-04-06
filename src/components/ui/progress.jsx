
import * as React from "react"
import { cn } from "@/lib/utils"

const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-gray-800",
      className
    )}
    {...props}
  >
    <div
      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-500 ease-in-out"
      style={{ width: `${Math.min(Math.max(value || 0, 0), 100)}%` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
