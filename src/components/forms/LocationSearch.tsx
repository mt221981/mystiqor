/**
 * חיפוש מיקום עם Nominatim — autocomplete עם debounce
 * תומך ב-RTL, dropdown תוצאות, מצבי טעינה
 */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils/cn';
import { MapPin, Loader2 } from 'lucide-react';

/** תוצאת geocoding */
export interface GeocodingResult {
  display_name: string;
  lat: number;
  lon: number;
  country_code: string;
}

/** Props של חיפוש מיקום */
export interface LocationSearchProps {
  /** ערך נוכחי */
  value: string;
  /** callback לשינוי טקסט */
  onChange: (value: string) => void;
  /** callback לבחירת תוצאה */
  onSelect: (result: GeocodingResult) => void;
  /** טקסט placeholder */
  placeholder?: string;
  /** האם השדה מושבת */
  disabled?: boolean;
  /** תווית */
  label?: string;
}

/**
 * חיפוש מיקום עם debounce של 400ms — מונע עומס על Nominatim API
 */
export function LocationSearch({
  value,
  onChange,
  onSelect,
  placeholder = 'הקלד שם עיר...',
  disabled = false,
  label = 'מקום לידה',
}: LocationSearchProps) {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebounce(value, 400);

  /** שליפת תוצאות מ-API */
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/geocode?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then((data: { results?: GeocodingResult[] }) => {
        if (!cancelled) {
          setResults(data.results ?? []);
          setIsOpen(true);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setResults([]);
          setIsLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [debouncedQuery]);

  /** סגירת dropdown בלחיצה מחוץ */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /** בחירת תוצאה */
  const handleSelect = useCallback((result: GeocodingResult) => {
    onChange(result.display_name);
    onSelect(result);
    setIsOpen(false);
    setResults([]);
  }, [onChange, onSelect]);

  return (
    <div className="relative space-y-2" ref={dropdownRef}>
      <Label className="text-start block text-sm font-medium">{label}</Label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          dir="rtl"
          className="pe-10"
        />
        <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : (
            <MapPin className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((result, index) => (
            <button
              key={`${result.lat}-${result.lon}-${index}`}
              type="button"
              className={cn(
                'w-full text-start px-3 py-2 text-sm hover:bg-accent transition-colors',
                'focus:bg-accent focus:outline-none'
              )}
              onClick={() => handleSelect(result)}
              dir="rtl"
            >
              <span className="flex items-center gap-2">
                <MapPin className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                <span className="truncate">{result.display_name}</span>
              </span>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && !isLoading && debouncedQuery.length >= 2 && (
        <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-md shadow-lg p-3 text-sm text-muted-foreground text-center" dir="rtl">
          לא נמצאו תוצאות
        </div>
      )}
    </div>
  );
}
