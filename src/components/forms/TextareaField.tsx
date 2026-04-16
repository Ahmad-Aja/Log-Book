"use client";

import { TextareaHTMLAttributes, useCallback } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  registration?: UseFormRegisterReturn;
}

export function TextareaField({
  label,
  error,
  registration,
  className = "",
  rows = 5,
  onChange,
  ...props
}: TextareaFieldProps) {
  const { onChange: registrationOnChange, ...registrationRest } = registration ?? {};

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    registrationOnChange?.(e as unknown as React.ChangeEvent<HTMLInputElement>);
    onChange?.(e);
  }, [registrationOnChange, onChange]);

  return (
    <div className="w-full">
      <div className="group/textarea">
        {label && (
          <label className="text-[11px] sm:text-[13px] text-wheat group-focus-within/textarea:text-forest-light transition-colors duration-300">
            {label}
          </label>
        )}
        <textarea
          rows={rows}
          className={`mt-0.5 placeholder:text-xs sm:placeholder:text-[14px] outline-none border px-2 focus:px-3 py-1.5 sm:py-2 rounded-md text-sm sm:text-[15px] w-full transition-all duration-300 ${
            error
              ? "border-red-500 hover:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-400"
              : "border-wheat hover:border-wheat-dark focus:border-forest-light focus:outline-none focus:ring-1 focus:ring-forest-light"
          } disabled:bg-gray-50 disabled:text-gray-500 resize-none ${className}`}
          onChange={handleChange}
          {...registrationRest}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[13px] text-red-600 mt-1 block">{error}</span>
      )}
    </div>
  );
}
