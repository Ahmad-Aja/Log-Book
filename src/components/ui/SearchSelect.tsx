"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, ChevronDown, Loader2 } from "lucide-react";

export interface SearchSelectOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface SearchSelectProps {
  label?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  value: string | number | null;
  onChange: (value: string | number | null, option: SearchSelectOption | null) => void;
  options: SearchSelectOption[];
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSearch: (query: string) => void;
  error?: string;
  disabled?: boolean;
  showMoreLabel?: string;
}

export function SearchSelect({
  label,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  value,
  onChange,
  options,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onSearch,
  error,
  disabled = false,
  showMoreLabel = "Show more",
}: SearchSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.value === value) ?? null;

  const handleOpen = useCallback(() => {
    if (disabled) return;
    setIsOpen(true);
    setQuery("");
    onSearch("");
  }, [disabled, onSearch]);

  const handleSearchSubmit = useCallback(() => {
    onSearch(query);
  }, [onSearch, query]);

  const handleSelect = (option: SearchSelectOption) => {
    onChange(option.value, option);
    setIsOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null, null);
    onSearch("");
  };

  useEffect(() => {
    if (!isOpen) return;
    setTimeout(() => inputRef.current?.focus(), 50);
    const handleClose = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClose);
    return () => document.removeEventListener("mousedown", handleClose);
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="w-full relative group/search-select">
      {label && (
        <label className="text-[13px] text-wheat mb-1 block transition-colors duration-300">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md text-[15px] transition-all duration-300 flex items-center justify-between gap-2 ${
          error ? "border-red-500" : "border-wheat hover:border-wheat-dark"
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "bg-white cursor-pointer"} ${
          isOpen ? "ring-1 ring-forest-light" : ""
        }`}
      >
        <span className={`truncate text-start ${!selectedOption ? "text-gray-400" : "text-gray-900"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <div className="flex items-center gap-1 shrink-0">
          {selectedOption && (
            <span onClick={handleClear} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg flex flex-col z-[9999] animate-in fade-in duration-150">
          {/* Search input */}
          <div className="p-2 border-b border-gray-100">
            <div className="flex items-center gap-2 px-2 py-1.5 border border-gray-200 rounded-md bg-gray-50">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSearchSubmit(); } }}
                placeholder={searchPlaceholder}
                className="flex-1 text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); onSearch(""); }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={handleSearchSubmit}
                className="text-gray-400 hover:text-forest transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            ) : options.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No results found</p>
            ) : (
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-3 py-2 text-start text-sm hover:bg-forest-light/30 transition-colors flex flex-col gap-0.5 ${
                    value === option.value ? "bg-forest-light/20 text-forest font-medium" : "text-gray-900"
                  }`}
                >
                  <span>{option.label}</span>
                  {option.sublabel && (
                    <span className="text-xs text-gray-400">{option.sublabel}</span>
                  )}
                </button>
              ))
            )}
          </div>

          {/* Show more */}
          {hasMore && !isLoading && (
            <button
              type="button"
              onClick={onLoadMore}
              className="w-full px-3 py-2 text-sm text-forest hover:bg-forest-light/20 border-t border-gray-100 transition-colors"
            >
              {showMoreLabel}
            </button>
          )}
        </div>
      )}

      {error && <span className="text-[13px] text-red-600 mt-1 block">{error}</span>}
    </div>
  );
}
