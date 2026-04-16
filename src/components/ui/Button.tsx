import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  fullWidth?: boolean;
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      fullWidth = false,
      loading = false,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "relative py-1.5 sm:py-2 text-sm sm:text-[15px] rounded-md transition-all duration-150 transform hover:scale-[102%] active:scale-95 focus:scale-[102%] focus:outline-none outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100";

    const variantStyles = {
      primary:
        "bg-wheat hover:bg-wheat-dark focus:bg-wheat-dark text-white shadow-sm shadow-black",
      secondary:
        "bg-white hover:bg-gray-100 focus:bg-gray-100 text-wheat-dark border border-wheat",
    };

    const widthStyles = fullWidth ? "w-full" : "";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${widthStyles} ${className ?? ""}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin inline-block me-2" />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
