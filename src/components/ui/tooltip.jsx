import * as React from "react"
import { cn } from "@/lib/utils"

const TooltipProvider = ({ children }) => <>{children}</>

const Tooltip = ({ children }) => {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (child?.type === TooltipTrigger) {
          return React.cloneElement(child, { setOpen })
        }
        if (child?.type === TooltipContent && open) {
          return child
        }
        return null
      })}
    </div>
  )
}

const TooltipTrigger = React.forwardRef(({ children, className, asChild, setOpen, ...props }, ref) => {
  const handleMouseEnter = () => setOpen?.(true)
  const handleMouseLeave = () => setOpen?.(false)
  
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      ref
    })
  }

  return (
    <div
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("cursor-pointer", className)}
      {...props}
    >
      {children}
    </div>
  )
})
TooltipTrigger.displayName = "TooltipTrigger"

const TooltipContent = React.forwardRef(({ className, sideOffset = 4, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute z-50 overflow-hidden rounded-md bg-gray-800 border border-gray-700 px-3 py-2 text-sm text-white shadow-lg",
      "left-1/2 -translate-x-1/2 bottom-full mb-2",
      "animate-in fade-in-0 zoom-in-95",
      className
    )}
    {...props}
  >
    {children}
    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
  </div>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }