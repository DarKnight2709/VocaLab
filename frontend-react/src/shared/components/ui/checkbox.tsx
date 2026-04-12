import * as React from "react"
import { cn } from "@/shared/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, checked, ...props }, ref) => (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 cursor-pointer rounded border border-primary accent-primary transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      checked={checked}
      onChange={(e) => {
        onCheckedChange?.(e.target.checked)
      }}
      {...props}
    />
  )
)

Checkbox.displayName = "Checkbox"

export { Checkbox }
