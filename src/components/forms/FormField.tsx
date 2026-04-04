"use client";

import { forwardRef, InputHTMLAttributes, useState } from "react";
import { UseFormRegisterReturn } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  registration?: UseFormRegisterReturn;
  showPasswordToggle?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      registration,
      className = "",
      type,
      showPasswordToggle = false,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    // Force LTR direction for phone numbers
    const shouldForceLTR = type === "tel";

    // Determine actual input type
    const inputType =
      showPasswordToggle && type === "password"
        ? showPassword
          ? "text"
          : "password"
        : type;

    return (
      <div className="w-full">
        <div className="group/input">
          {label && (
            <label className="text-[13px] text-wheat group-focus-within/input:text-forest-light transition-colors duration-300">
              {label}
            </label>
          )}
          <div className="relative">
            <input
              ref={ref}
              type={inputType}
              dir={shouldForceLTR ? "ltr" : undefined}
              className={`mt-0.5 placeholder:text-[14px] outline-none border px-2 focus:px-3 py-1.5 rounded-md text-[15px] w-full transition-all duration-300 ${
                showPasswordToggle ? "ltr:pr-10 rtl:pl-10" : ""
              } ${
                error
                  ? "border-red-500 hover:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-400"
                  : "border-wheat hover:border-wheat-dark focus:border-forest-light focus:outline-none focus:ring-1 focus:ring-forest-light"
              } ${className ?? ""}`}
              {...registration}
              {...props}
            />
            {showPasswordToggle && type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute ltr:right-2 rtl:left-2 top-1/2 -translate-y-1/2 mt-0.25 p-1.5 text-gray-500 hover:text-gray-700 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
        {error && (
          <span className="text-[13px] text-red-600 mt-1 block">{error}</span>
        )}
      </div>
    );
  },
);

FormField.displayName = "FormField";
