import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex h-12 w-full min-w-0 rounded-xl border-2 border-gray-200 bg-transparent text-base shadow-xs transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:border-orange-400 focus:ring-orange-400/20 pl-4",
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        "dark:text-white w-full h-12 rounded-xl border-2 border-orange-400/50 dark:border-gray-600 focus:border-orange-400 dark:focus:border-orange-500 outline-none pl-4 dark:bg-gray-800 mt-2",
        className
      )}
      {...props}
    />
  )
}

export { Input }
