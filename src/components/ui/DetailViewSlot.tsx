"use client";

import { ReactNode } from "react";

interface DetailViewSlotProps {
  label: string;
  value: ReactNode;
  className?: string;
  fullWidth?: boolean;
  colSpan?: 1 | 2;
  variant?: "default" | "danger";
  multiline?: boolean;
  /** When multiline=true, clamp=true (default) caps the slot height with its own scrollbar.
   *  Set clamp=false to let the slot grow freely and rely on the modal scroll instead. */
  clamp?: boolean;
}

export function DetailViewSlot({
  label,
  value,
  className = "",
  fullWidth = false,
  colSpan,
  variant = "default",
  multiline = false,
  clamp = true,
}: DetailViewSlotProps) {
  const isDanger = variant === "danger";
  const baseClasses = multiline
    ? "group p-2 sm:p-3 border border-gray-300 transition-all duration-200 flex flex-col gap-1"
    : "group p-2 sm:p-3 border border border-gray-300 transition-all duration-200 flex items-center";
  const variantClasses = isDanger
    ? "border-red-200 hover:border-red-300 hover:shadow-sm bg-red-50/30"
    : "hover:shadow-sm bg-white";
  const heightClasses = multiline ? "min-h-[36px] sm:min-h-[44px]" : "min-h-[36px] sm:min-h-[44px] lg:h-[44px]";

  // Use colSpan if provided, otherwise fall back to fullWidth
  const shouldSpanTwo = colSpan === 2 || fullWidth;

  return (
    <div
      className={`rounded-md ${baseClasses} ${variantClasses} ${heightClasses} ${
        shouldSpanTwo ? "md:col-span-2" : ""
      }`}
    >
      <span
        className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
          multiline ? "" : "ltr:mr-2 rtl:ml-2"
        } ${isDanger ? "text-red-600" : "text-wheat"}`}
      >
        {label}:
      </span>
      <span
        className={`text-sm sm:text-base ${
          multiline
            ? `whitespace-pre-wrap break-words ${clamp ? "max-h-24 overflow-y-auto" : ""}`
            : "truncate"
        } ${isDanger ? "text-red-700" : "text-gray-900"} ${className}`}
      >
        {value}
      </span>
    </div>
  );
}
