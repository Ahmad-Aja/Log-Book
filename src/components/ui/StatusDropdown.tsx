"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface StatusOption {
  value: string;
  label: string;
}

interface StatusDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: StatusOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
}

export function StatusDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  error,
  showAllOption = false,
  allOptionLabel = "All",
}: StatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || "Select...";

  useEffect(() => {
    if (!isOpen) return;
    const handleClose = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClose);
    return () => document.removeEventListener("mousedown", handleClose);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="w-full relative group/status-dropdown">
      {label && (
        <label className="text-[11px] sm:text-[13px] text-wheat mb-1 block transition-colors duration-300 group-focus-within/status-dropdown:text-forest-light">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen((o) => !o)}
        disabled={disabled}
        className={`w-full px-3 py-1.5 sm:py-2 border rounded-md text-sm sm:text-[15px] transition-all duration-300 flex items-center justify-between ${
          error
            ? "border-red-500 hover:border-red-600"
            : "border-wheat hover:border-wheat-dark focus:border-forest-light"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "bg-white cursor-pointer"} ${
          isOpen ? "ring-1 ring-forest-light" : ""
        }`}
      >
        <span className={`${!selectedOption && placeholder ? "text-gray-400" : "text-gray-900"}`}>
          {displayValue}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto z-[9999] animate-in fade-in duration-150">
          {showAllOption && (
            <button
              type="button"
              onClick={() => handleSelect("")}
              className="w-full px-3 py-1.5 sm:py-2 text-start text-sm sm:text-[15px] text-gray-900 hover:bg-forest-light/50 transition-colors flex items-center justify-between"
            >
              {allOptionLabel}
              {value === "" && <Check className="w-4 h-4 text-forest shrink-0" />}
            </button>
          )}
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className="w-full px-3 py-2 text-[15px] text-start text-gray-900 hover:bg-forest-light/50 transition-colors flex items-center justify-between"
            >
              {option.label}
              {value === option.value && (
                <Check className="w-4 h-4 text-forest shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {error && (
        <span className="text-[13px] text-red-600 mt-1 block">{error}</span>
      )}
    </div>
  );
}
