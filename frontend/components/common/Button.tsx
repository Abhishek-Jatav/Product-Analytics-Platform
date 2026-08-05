import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: "primary" | "ghost";
}

export function Button({ isLoading, variant = "primary", className, children, disabled, ...rest }: ButtonProps) {
  return (
    <button
      className={clsx(
        variant === "primary" && "btn-primary",
        variant === "ghost" && "inline-flex items-center justify-center rounded-lg px-4 py-2 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
        className
      )}
      disabled={disabled || isLoading}
      {...rest}
    >
      {isLoading ? "Please wait…" : children}
    </button>
  );
}
