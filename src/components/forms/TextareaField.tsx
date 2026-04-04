"use client";

import { TextareaHTMLAttributes } from "react";
import { UseFormRegisterReturn } from "react-hook-form";

interface TextareaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  registration?: UseFormRegisterReturn;
}

export function TextareaField({
  label,
  error,
  registration,
  className = "",
  rows = 3,
  ...props
}: TextareaFieldProps) {
  return (
    <div className="w-full">
      <div className="group/textarea">
        {label && (
          <label className="text-[13px] text-wheat group-focus-within/textarea:text-forest-light transition-colors duration-300">
            {label}
          </label>
        )}
        <textarea
          rows={rows}
          className={`mt-0.5 placeholder:text-[14px] outline-none border px-2 focus:px-3 py-2 rounded-md text-[15px] w-full transition-all duration-300 ${
            error
              ? "border-red-500 hover:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-400"
              : "border-wheat hover:border-wheat-dark focus:border-forest-light focus:outline-none focus:ring-1 focus:ring-forest-light"
          } disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
          {...registration}
          {...props}
        />
      </div>
      {error && (
        <span className="text-[13px] text-red-600 mt-1 block">{error}</span>
      )}
    </div>
  );
}
