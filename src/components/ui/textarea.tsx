import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-lg border bg-slate-900/50 px-3 py-2 text-sm text-slate-100",
          "placeholder:text-slate-500 resize-none",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 focus-visible:ring-offset-slate-900",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "transition-all duration-200",
          error
            ? "border-red-500/70 focus-visible:ring-red-500"
            : "border-slate-700 hover:border-slate-600",
          className
        )}
        ref={ref}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

export { Textarea };
