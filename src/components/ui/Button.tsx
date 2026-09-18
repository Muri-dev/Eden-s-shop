import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "gold" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:pointer-events-none rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C5A880] focus-visible:ring-offset-2";

    const variants = {
      primary:
        "bg-[#241813] text-[#FAF8F5] hover:bg-[#3D2B22] active:scale-[0.99] shadow-sm",
      secondary:
        "bg-[#F4EFE6] text-[#241813] hover:bg-[#ECE5D8] active:scale-[0.99] border border-[#E5DDCF]",
      outline:
        "border border-[#241813] text-[#241813] hover:bg-[#241813] hover:text-[#FAF8F5]",
      gold:
        "bg-[#C5A880] text-[#170F0B] hover:bg-[#DFC8A8] active:scale-[0.99] shadow-sm font-semibold",
      ghost:
        "text-[#241813] hover:bg-[#F4EFE6] active:bg-[#ECE5D8]",
      danger:
        "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.99]",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-xs tracking-wider uppercase",
      md: "h-11 px-5 text-sm",
      lg: "h-13 px-7 text-base tracking-wide",
      icon: "h-10 w-10 p-0",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
