import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-blue-600 text-white shadow hover:bg-blue-500 active:scale-[0.98]",
        destructive:
          "bg-red-600 text-white shadow hover:bg-red-500 active:scale-[0.98]",
        outline:
          "border border-slate-700 bg-slate-800/50 text-slate-200 hover:bg-slate-700 hover:text-white",
        secondary:
          "bg-slate-700 text-slate-200 hover:bg-slate-600",
        ghost:
          "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
        link:
          "text-blue-400 underline-offset-4 hover:underline hover:text-blue-300",
        success:
          "bg-emerald-600 text-white shadow hover:bg-emerald-500 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-12 rounded-lg px-6 text-base",
        xl:      "h-14 rounded-xl px-8 text-base font-semibold",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
