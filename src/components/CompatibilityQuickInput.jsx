import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users } from "lucide-react";

/**
 * COMPATIBILITY QUICK INPUT
 * רכיב לקלט מהיר של נתוני אדם שני - עם אפשרות לבחור מפרופילי אורחים
 */

export default function CompatibilityQuickInput({ value, onChange }) {
  const [inputMode, setInputMode] = useState('manual'); // 'manual' or 'guest_profile'
  const [selectedGuestId, setSelectedGuestId] = useState('');

  // Fetch guest profiles
  const { data: guestProfiles = [], isLoading } = useQuery({
    queryKey: ['guestProfiles'],
    queryFn: async () => {
      const profiles = await base44.entities.GuestProfile.list('-created_date', 20);
      return profiles || [];
    }
  });

  const handleGuestSelect = (guestId) => {
    setSelectedGuestId(guestId);
    const guest = guestProfiles.find(g => g.id === guestId);
    if (guest) {
      onChange({
        name: guest.full_name,
        birth_date: guest.birth_date,
        birth_time: guest.birth_time || '',
        birth_place: guest.birth_place_name || ''
      });
    }
  };

  return (
    <div className="space-y-4 bg-pink-900/20 p-4 rounded-lg border border-pink-700/30">
      <div className="flex items-center gap-3 mb-4">
        <Users className="w-5 h-5 text-pink-400" />
        <h4 className="text-white font-bold">פרטי האדם השני:</h4>
      </div>

      {/* Toggle between manual and guest profile */}
      {guestProfiles.length > 0 && (
        <div className="flex gap-2">
          <Button
            variant={inputMode === 'manual' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('manual')}
            className="flex-1"
          >
            הזנה ידנית
          </Button>
          <Button
            variant={inputMode === 'guest_profile' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setInputMode('guest_profile')}
            className="flex-1"
          >
            בחר מפרופילים ({guestProfiles.length})
          </Button>
        </div>
      )}

      {/* Guest profile selection */}
      {inputMode === 'guest_profile' && guestProfiles.length > 0 ? (
        <div className="space-y-2">
          <Label>בחר פרופיל:</Label>
          <Select value={selectedGuestId} onValueChange={handleGuestSelect}>
            <SelectTrigger>
              <SelectValue placeholder="בחר אדם..." />
            </SelectTrigger>
            <SelectContent>
              {guestProfiles.map((guest) => (
                <SelectItem key={guest.id} value={guest.id}>
                  {guest.full_name} ({new Date(guest.birth_date).toLocaleDateString('he-IL')})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedGuestId && (
            <p className="text-pink-300 text-xs">
              ℹ️ הפרטים נטענו מהפרופיל. אפשר לעבור להזנה ידנית לשינויים.
            </p>
          )}
        </div>
      ) : (
        /* Manual input */
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>שם מלא:</Label>
            <Input
              value={value.name}
              onChange={(e) => onChange({...value, name: e.target.value})}
              placeholder="למשל: דני כהן"
            />
          </div>
          <div className="space-y-2">
            <Label>תאריך לידה:</Label>
            <Input
              type="date"
              value={value.birth_date}
              onChange={(e) => onChange({...value, birth_date: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>שעת לידה (אופציונלי):</Label>
            <Input
              type="time"
              value={value.birth_time}
              onChange={(e) => onChange({...value, birth_time: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <Label>מקום לידה:</Label>
            <Input
              value={value.birth_place}
              onChange={(e) => onChange({...value, birth_place: e.target.value})}
              placeholder="למשל: תל אביב, ישראל"
            />
          </div>
        </div>
      )}
    </div>
  );
}