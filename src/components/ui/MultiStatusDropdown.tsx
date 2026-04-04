"use client";

import { Check, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface StatusOption {
  value: string;
  label: string;
}

interface MultiStatusDropdownProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: StatusOption[];
  placeholder?: string;
  disabled?: boolean;
  allOptionLabel?: string;
}

export function MultiStatusDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  allOptionLabel = "All",
}: MultiStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const selectedLabels = options
    .filter((o) => value.includes(o.value))
    .map((o) => o.label);

  const displayValue =
    selectedLabels.length === 0
      ? placeholder || allOptionLabel
      : selectedLabels.join(", ");

  const hasSelection = value.length > 0;

  return (
    <div className="w-full group/multi-dropdown">
      {label && (
        <label className="text-[13px] text-wheat mb-1 block transition-colors duration-300 group-focus-within/multi-dropdown:text-forest-light">
          {label}
        </label>
      )}
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md text-[15px] transition-all duration-300 flex items-center justify-between gap-2 border-wheat hover:border-wheat-dark focus:border-forest-light ${
            disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "bg-white cursor-pointer"
          } ${isOpen ? "ring-1 ring-forest-light" : ""}`}
        >
          <span
            className={`truncate text-start ${!hasSelection ? "text-gray-400" : "text-gray-900"}`}
          >
            {displayValue}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {hasSelection && (
              <span
                onClick={handleClearAll}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
            {options.map((option) => {
              const selected = value.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleToggle(option.value)}
                  className="w-full px-3 py-2 text-[15px] text-start text-gray-900 hover:bg-forest-light/50 transition-colors flex items-center justify-between"
                >
                  {option.label}
                  {selected && (
                    <Check className="w-4 h-4 text-forest shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
