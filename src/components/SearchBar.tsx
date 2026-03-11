"use client";

import { Search, ChevronDown } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFilterContinent: (continent: string) => void;
}

export function SearchBar({ onSearch, onFilterContinent }: SearchBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search cities or countries..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground placeholder:text-gray-400"
        />
      </div>
      <div className="relative">
        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <select
          onChange={(e) => onFilterContinent(e.target.value)}
          className="appearance-none px-4 py-3 pr-10 rounded-xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all text-foreground cursor-pointer"
        >
          <option value="All">All Continents</option>
          <option value="Asia">Asia</option>
          <option value="Europe">Europe</option>
        </select>
      </div>
    </div>
  );
}
