"use client";

import React, { useEffect, useState } from "react";
import { Search, Command } from "lucide-react";

const GlobalSearchBar: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        const input = document.getElementById("global-search-input");
        input?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-3 max-w-4xl mx-auto">
        <div className="flex items-center gap-2 flex-1 px-4 py-2.5 bg-gray-50 rounded-lg border border-gray-200 focus-within:border-[#0166B0] focus-within:ring-1 focus-within:ring-[#0166B0]/30 transition-all">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search for projects, tasks, documents, vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-[#021422] placeholder:text-gray-400 outline-none"
          />
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-xs font-medium text-gray-500 shrink-0">
            <Command size={12} />
            <span>K</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchBar;
