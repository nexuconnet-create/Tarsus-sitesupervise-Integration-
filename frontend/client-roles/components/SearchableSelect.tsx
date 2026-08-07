"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  required = false,
  className = "",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!search) return options;
    const q = search.toLowerCase();
    return options.filter(
      (o) =>
        (o.label || o.value).toLowerCase().includes(q) ||
        o.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedLabel = options.find((o) => o.value === value)?.label || value || "";

  const handleSelect = (option: Option) => {
    onChange(option.value);
    setSearch("");
    setIsOpen(false);
  };

  const handleUseCustom = () => {
    onChange(search);
    setSearch("");
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={isOpen ? search : selectedLabel}
          required={required}
          onChange={(e) => {
            setSearch(e.target.value);
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch(value || "");
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          <div className="max-h-56 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 border-b border-gray-50 last:border-b-0 ${
                    value === option.value ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"
                  }`}
                >
                  {option.label || option.value}
                </button>
              ))
            ) : (
              <div className="px-4 py-3">
                {search.trim() ? (
                  <button
                    type="button"
                    onClick={handleUseCustom}
                    className="w-full text-left text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                  >
                    Select &ldquo;{search.trim()}&rdquo;
                  </button>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-2">No options available</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
