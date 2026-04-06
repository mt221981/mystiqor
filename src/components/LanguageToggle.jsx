import { useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LanguageToggle() {
  const [language, setLanguage] = useState('he');

  const toggleLanguage = () => {
    const newLang = language === 'he' ? 'en' : 'he';
    setLanguage(newLang);
    
    // TODO: Implement full i18n when needed
    if (newLang === 'en') {
      alert('English version coming soon! 🌍');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleLanguage}
      className="border-purple-600 text-purple-300 hover:bg-purple-900/30 relative"
      aria-label={language === 'he' ? 'עבור לאנגלית' : 'Switch to Hebrew'}
      title={language === 'he' ? 'שפה' : 'Language'}
    >
      <Globe className="w-5 h-5" aria-hidden="true" />
      <Badge className="absolute -top-1 -left-1 bg-purple-600 text-white text-xs px-1 py-0">
        {language === 'he' ? 'עב' : 'EN'}
      </Badge>
    </Button>
  );
}