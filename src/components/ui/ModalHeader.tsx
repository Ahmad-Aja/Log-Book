"use client";

import { X } from "lucide-react";

interface ModalHeaderProps {
  title: string;
  description?: string;
  onClose: () => void;
  disabled?: boolean;
  sticky?: boolean;
}

export function ModalHeader({
  title,
  description,
  onClose,
  disabled = false,
  sticky = false,
}: ModalHeaderProps) {
  const stickyClasses = sticky
    ? "sticky top-0 bg-white z-10 rounded-t-2xl"
    : "";

  return (
    <div
      className={`border-b border-gray-200 px-6 py-4 flex items-center justify-between ${stickyClasses}`}
    >
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
        disabled={disabled}
      >
        <X className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );
}
