import React from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SearchBar({ value, onChange, placeholder = "חפש..." }) {
  return (
    <div className="relative">
      <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400 pointer-events-none" aria-hidden="true" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-gray-900/50 border-purple-700/50 text-white pr-12 pl-12 h-14 text-lg rounded-xl focus:border-purple-500"
        dir="rtl"
        aria-label="שדה חיפוש"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onChange("")}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-300"
          aria-label="נקה חיפוש"
        >
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}