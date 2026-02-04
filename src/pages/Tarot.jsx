import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Layers, Shuffle, Sparkles, Info, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import EnhancedToast from "@/components/EnhancedToast";
import SubscriptionGuard from "@/components/SubscriptionGuard";
import useSubscription from "@/components/useSubscription";
import ExplainableInsight from "@/components/ExplainableInsight";
import ConfidenceBadge from "@/components/ConfidenceBadge";

// 78 קלפי טארוט - מוכנים לשימוש
const TAROT_CARDS = [
  // Major Arcana (0-21)
  { card_number: 0, name: "הטיפש", name_en: "The Fool", arcana: "major", suit: "major", element: "air", astrology: "Uranus", numerology: 0, kabbalah: "Aleph", archetype: "התמים", upright_keywords: ["התחלות", "תמימות", "ספונטניות", "רוח חופשית"], reversed_keywords: ["פזיזות", "סיכון", "טיפשות"], upright_meaning: "התחלות חדשות, ספונטניות, אמונה במסע", reversed_meaning: "חוסר אחריות, סיכון מיותר" },
  { card_number: 1, name: "הקוסם", name_en: "The Magician", arcana: "major", suit: "major", element: "air", astrology: "Mercury", numerology: 1, kabbalah: "Beth", archetype: "היוצר", upright_keywords: ["ביטוי", "כוח", "פעולה", "ריכוז"], reversed_keywords: ["מניפולציה", "תכנון גרוע", "פוטנציאל לא ממומש"], upright_meaning: "כוח ביצירה, מיומנות, ריכוז", reversed_meaning: "מניפולציה, כישרון לא ממומש" },
  { card_number: 2, name: "הכהנה הגדולה", name_en: "The High Priestess", arcana: "major", suit: "major", element: "water", astrology: "Moon", numerology: 2, kabbalah: "Gimel", archetype: "המיסטיקנית", upright_keywords: ["אינטואיציה", "ידע קדוש", "תת-מודע"], reversed_keywords: ["סודות", "נסיגה", "שתיקה"], upright_meaning: "אינטואיציה, ידע פנימי, המסתורי", reversed_meaning: "סודות, נסיגה פנימה" },
  { card_number: 3, name: "הקיסרית", name_en: "The Empress", arcana: "major", suit: "major", element: "earth", astrology: "Venus", numerology: 3, kabbalah: "Daleth", archetype: "האם", upright_keywords: ["נשיות", "יופי", "טבע", "שפע"], reversed_keywords: ["תלות", "חנק", "חסימה יצירתית"], upright_meaning: "שפע, יצירתיות, אמהות", reversed_meaning: "תלות, חנק רגשי" },
  { card_number: 4, name: "הקיסר", name_en: "The Emperor", arcana: "major", suit: "major", element: "fire", astrology: "Aries", numerology: 4, kabbalah: "Heh", archetype: "האב", upright_keywords: ["סמכות", "מבנה", "שליטה", "אבהות"], reversed_keywords: ["שליטה", "נוקשות", "חוסר גמישות"], upright_meaning: "סמכות, מבנה, משמעת", reversed_meaning: "שליטה עודפת, נוקשות" },
  { card_number: 5, name: "האפיפיור", name_en: "The Hierophant", arcana: "major", suit: "major", element: "earth", astrology: "Taurus", numerology: 5, kabbalah: "Vav", archetype: "המורה", upright_keywords: ["מסורת", "קונפורמיות", "מוסר", "אתיקה"], reversed_keywords: ["מרד", "חתרנות", "גישות חדשות"], upright_meaning: "מסורת, ערכים, הוראה רוחנית", reversed_meaning: "מרד במסורת, דרכים חדשות" },
  { card_number: 6, name: "המאהבים", name_en: "The Lovers", arcana: "major", suit: "major", element: "air", astrology: "Gemini", numerology: 6, kabbalah: "Zayin", archetype: "האוהב", upright_keywords: ["אהבה", "הרמוניה", "יחסים", "ערכים"], reversed_keywords: ["דיסהרמוניה", "חוסר איזון", "חוסר התאמה"], upright_meaning: "אהבה, התאמה, בחירות חשובות", reversed_meaning: "חוסר הרמוניה, ערכים לא מיושרים" },
  { card_number: 7, name: "המרכבה", name_en: "The Chariot", arcana: "major", suit: "major", element: "water", astrology: "Cancer", numerology: 7, kabbalah: "Cheth", archetype: "הלוחם", upright_keywords: ["שליטה", "כוח רצון", "הצלחה", "נחישות"], reversed_keywords: ["חוסר שליטה", "חוסר כיוון", "תוקפנות"], upright_meaning: "שליטה, נחישות, ניצחון", reversed_meaning: "חוסר שליטה, אגרסיביות" },
  { card_number: 8, name: "הכוח", name_en: "Strength", arcana: "major", suit: "major", element: "fire", astrology: "Leo", numerology: 8, kabbalah: "Teth", archetype: "הגיבור", upright_keywords: ["כוח", "אומץ", "סבלנות", "חמלה"], reversed_keywords: ["חולשה", "ספק עצמי", "חוסר משמעת עצמית"], upright_meaning: "כוח פנימי, אומץ, סבלנות", reversed_meaning: "חולשה, ספק עצמי" },
  { card_number: 9, name: "הנזיר", name_en: "The Hermit", arcana: "major", suit: "major", element: "earth", astrology: "Virgo", numerology: 9, kabbalah: "Yod", archetype: "החכם", upright_keywords: ["חיפוש נפש", "התבוננות פנימית", "הדרכה פנימית"], reversed_keywords: ["בידוד", "בדידות", "נסיגה"], upright_meaning: "חיפוש פנימי, בדידות מבורכת, הדרכה פנימית", reversed_meaning: "בידוד, בדידות כואבת" },
  { card_number: 10, name: "גלגל המזל", name_en: "Wheel of Fortune", arcana: "major", suit: "major", element: "fire", astrology: "Jupiter", numerology: 10, kabbalah: "Kaph", archetype: "הפטליסט", upright_keywords: ["שינוי", "מחזורים", "גורל", "מזל"], reversed_keywords: ["מזל רע", "התנגדות לשינוי", "שבירת מחזורים"], upright_meaning: "שינוי, מזל, מחזוריות", reversed_meaning: "מזל רע, התנגדות לשינוי" },
  { card_number: 11, name: "הצדק", name_en: "Justice", arcana: "major", suit: "major", element: "air", astrology: "Libra", numerology: 11, kabbalah: "Lamed", archetype: "השופט", upright_keywords: ["צדק", "הגינות", "אמת", "חוק"], reversed_keywords: ["חוסר הגינות", "חוסר אחריות", "אי-יושר"], upright_meaning: "צדק, אמת, הגינות", reversed_meaning: "חוסר הגינות, העדר אחריות" },
  { card_number: 12, name: "התלוי", name_en: "The Hanged Man", arcana: "major", suit: "major", element: "water", astrology: "Neptune", numerology: 12, kabbalah: "Mem", archetype: "הקדוש מרצון", upright_keywords: ["עצירה", "כניעה", "שחרור", "נקודת מבט חדשה"], reversed_keywords: ["עיכובים", "התנגדות", "עמידה במקום"], upright_meaning: "עצירה, נקודת מבט חדשה, ויתור", reversed_meaning: "עיכובים, התנגדות" },
  { card_number: 13, name: "המוות", name_en: "Death", arcana: "major", suit: "major", element: "water", astrology: "Scorpio", numerology: 13, kabbalah: "Nun", archetype: "הטרנספורמר", upright_keywords: ["סיומים", "שינוי", "טרנספורמציה", "מעבר"], reversed_keywords: ["התנגדות לשינוי", "טרנספורמציה אישית", "טיהור פנימי"], upright_meaning: "סיום, טרנספורמציה, התחלה חדשה", reversed_meaning: "התנגדות לשינוי, טרנספורמציה פנימית" },
  { card_number: 14, name: "המתינות", name_en: "Temperance", arcana: "major", suit: "major", element: "fire", astrology: "Sagittarius", numerology: 14, kabbalah: "Samekh", archetype: "המרפא", upright_keywords: ["איזון", "מתינות", "סבלנות", "מטרה"], reversed_keywords: ["חוסר איזון", "עודף", "ריפוי עצמי"], upright_meaning: "איזון, מתינות, הרמוניה", reversed_meaning: "חוסר איזון, קיצוניות" },
  { card_number: 15, name: "השטן", name_en: "The Devil", arcana: "major", suit: "major", element: "earth", astrology: "Capricorn", numerology: 15, kabbalah: "Ayin", archetype: "הצל", upright_keywords: ["כבלים", "התמכרות", "מיניות", "חומריות"], reversed_keywords: ["שחרור", "חופש", "ניתוק"], upright_meaning: "תלות, כבלים, חומריות", reversed_meaning: "שחרור, חופש, התנתקות" },
  { card_number: 16, name: "המגדל", name_en: "The Tower", arcana: "major", suit: "major", element: "fire", astrology: "Mars", numerology: 16, kabbalah: "Peh", archetype: "המהפכן", upright_keywords: ["שינוי פתאומי", "מהפך", "כאוס", "גילוי"], reversed_keywords: ["טרנספורמציה אישית", "פחד משינוי", "מניעת אסון"], upright_meaning: "שינוי פתאומי, קריסה, התגלות", reversed_meaning: "טרנספורמציה פנימית, פחד משינוי" },
  { card_number: 17, name: "הכוכב", name_en: "The Star", arcana: "major", suit: "major", element: "air", astrology: "Aquarius", numerology: 17, kabbalah: "Tzaddi", archetype: "החזיונאי", upright_keywords: ["תקווה", "אמונה", "מטרה", "חידוש"], reversed_keywords: ["חוסר אמונה", "ייאוש", "ניתוק"], upright_meaning: "תקווה, אמונה, חידוש", reversed_meaning: "חוסר אמונה, ייאוש" },
  { card_number: 18, name: "הירח", name_en: "The Moon", arcana: "major", suit: "major", element: "water", astrology: "Pisces", numerology: 18, kabbalah: "Qoph", archetype: "החולם", upright_keywords: ["אשליה", "פחד", "חרדה", "תת-מודע"], reversed_keywords: ["שחרור פחדים", "בלבול פנימי", "רגש מודחק"], upright_meaning: "אשליה, פחדים, תת-מודע", reversed_meaning: "שחרור פחדים, בלבול פנימי" },
  { card_number: 19, name: "השמש", name_en: "The Sun", arcana: "major", suit: "major", element: "fire", astrology: "Sun", numerology: 19, kabbalah: "Resh", archetype: "הילד", upright_keywords: ["חיוביות", "כיף", "חום", "הצלחה"], reversed_keywords: ["ילד פנימי", "אופטימיות יתר", "עצב"], upright_meaning: "שמחה, חיוביות, הצלחה", reversed_meaning: "ילד פנימי פצוע, אופטימיות מופרזת" },
  { card_number: 20, name: "השיפוט", name_en: "Judgement", arcana: "major", suit: "major", element: "fire", astrology: "Pluto", numerology: 20, kabbalah: "Shin", archetype: "המתעורר", upright_keywords: ["שיפוט", "לידה מחדש", "קריאה פנימית", "סליחה"], reversed_keywords: ["ספק עצמי", "מבקר פנימי", "התעלמות מהקריאה"], upright_meaning: "שיפוט, לידה מחדש, קריאה פנימית", reversed_meaning: "ספק עצמי, התעלמות מהקריאה" },
  { card_number: 21, name: "העולם", name_en: "The World", arcana: "major", suit: "major", element: "earth", astrology: "Saturn", numerology: 21, kabbalah: "Tav", archetype: "השלם", upright_keywords: ["השלמה", "אינטגרציה", "הישג", "נסיעות"], reversed_keywords: ["חיפוש אחר סגירה", "עיכובים", "לא שלם"], upright_meaning: "השלמה, הישג, שלמות", reversed_meaning: "חיפוש אחר סגירה, עיכובים" },
  
  // Minor Arcana - Wands (22-35) - מטות
  { card_number: 22, name: "אס מטות", name_en: "Ace of Wands", arcana: "minor", suit: "wands", number_value: "ace", element: "fire", astrology: "Fire signs", numerology: 1, archetype: "השראה", upright_keywords: ["השראה", "הזדמנויות חדשות", "צמיחה", "פוטנציאל"], reversed_keywords: ["חוסר כיוון", "הסחות דעת", "עיכובים"], upright_meaning: "התחלה חדשה, השראה, אנרגיה", reversed_meaning: "חוסר כיוון, הסחות דעת" },
  { card_number: 23, name: "שניים במטות", name_en: "Two of Wands", arcana: "minor", suit: "wands", number_value: "2", element: "fire", upright_keywords: ["תכנון", "החלטות", "התקדמות", "גילוי"], reversed_keywords: ["פחד מהלא נודע", "חוסר תכנון", "החלטות גרועות"], upright_meaning: "תכנון, החלטות, התקדמות", reversed_meaning: "פחד מהלא נודע, חוסר תכנון" },
  { card_number: 24, name: "שלושה במטות", name_en: "Three of Wands", arcana: "minor", suit: "wands", number_value: "3", element: "fire", upright_keywords: ["התרחבות", "צפייה קדימה", "מעבר לים", "מנהיגות"], reversed_keywords: ["מכשולים", "עיכובים", "תסכול"], upright_meaning: "התרחבות, צפייה קדימה, הזדמנויות", reversed_meaning: "מכשולים, עיכובים" },
  { card_number: 25, name: "ארבעה במטות", name_en: "Four of Wands", arcana: "minor", suit: "wands", number_value: "4", element: "fire", upright_keywords: ["חגיגה", "שמחה", "הרמוניה", "חזרה הביתה"], reversed_keywords: ["חוסר הרמוניה", "מעבר", "קונפליקט"], upright_meaning: "חגיגה, שמחה, הרמוניה", reversed_meaning: "חוסר הרמוניה, מעבר" },
  { card_number: 26, name: "חמישה במטות", name_en: "Five of Wands", arcana: "minor", suit: "wands", number_value: "5", element: "fire", upright_keywords: ["קונפליקט", "תחרות", "מתח", "גיוון"], reversed_keywords: ["עימות פנימי", "הימנעות מקונפליקט", "שחרור"], upright_meaning: "תחרות, עימות, מתח", reversed_meaning: "עימות פנימי, הימנעות מקונפליקט" },
  { card_number: 27, name: "שישה במטות", name_en: "Six of Wands", arcana: "minor", suit: "wands", number_value: "6", element: "fire", upright_keywords: ["הצלחה", "הכרה ציבורית", "התקדמות", "ביטחון עצמי"], reversed_keywords: ["אגואיזם", "חוסר הכרה", "עונש"], upright_meaning: "הצלחה, הכרה, ניצחון", reversed_meaning: "אגואיזם, חוסר הכרה" },
  { card_number: 28, name: "שבעה במטות", name_en: "Seven of Wands", arcana: "minor", suit: "wands", number_value: "7", element: "fire", upright_keywords: ["אתגר", "תחרות", "התמדה"], reversed_keywords: ["תשישות", "ויתור", "הצפה"], upright_meaning: "עמידה על המשמר, התמדה, הגנה", reversed_meaning: "תשישות, ויתור" },
  { card_number: 29, name: "שמונה במטות", name_en: "Eight of Wands", arcana: "minor", suit: "wands", number_value: "8", element: "fire", upright_keywords: ["תנועה", "מהירות", "התקדמות", "פעולה"], reversed_keywords: ["עיכובים", "תסכול", "התנגדות לשינוי"], upright_meaning: "מהירות, פעולה, התקדמות", reversed_meaning: "עיכובים, תסכול" },
  { card_number: 30, name: "תשעה במטות", name_en: "Nine of Wands", arcana: "minor", suit: "wands", number_value: "9", element: "fire", upright_keywords: ["חוסן", "התמדה", "מבחן", "גבולות"], reversed_keywords: ["פרנויה", "הגנתיות", "סירוב לעזרה"], upright_meaning: "חוסן, התמדה, מבחן", reversed_meaning: "פרנויה, הגנתיות" },
  { card_number: 31, name: "עשרה במטות", name_en: "Ten of Wands", arcana: "minor", suit: "wands", number_value: "10", element: "fire", upright_keywords: ["עומס", "אחריות", "עבודה קשה", "לחץ"], reversed_keywords: ["שחרור", "ויתור", "האצלה"], upright_meaning: "עומס, אחריות, עבודה קשה", reversed_meaning: "שחרור, ויתור, האצלה" },
  { card_number: 32, name: "נסיך מטות", name_en: "Page of Wands", arcana: "minor", suit: "wands", number_value: "page", element: "fire", upright_keywords: ["השראה", "רעיונות", "גילוי", "התלהבות"], reversed_keywords: ["חוסר כיוון", "דחיינות", "חסימות יצירתיות"], upright_meaning: "השראה, רעיונות, גילוי", reversed_meaning: "חוסר כיוון, דחיינות" },
  { card_number: 33, name: "אביר מטות", name_en: "Knight of Wands", arcana: "minor", suit: "wands", number_value: "knight", element: "fire", upright_keywords: ["פעולה", "הרפתקה", "חוסר פחד", "אנרגיה"], reversed_keywords: ["פזיזות", "חיפזון", "תסכול"], upright_meaning: "פעולה, הרפתקה, אומץ", reversed_meaning: "פזיזות, חוסר סבלנות" },
  { card_number: 34, name: "מלכת מטות", name_en: "Queen of Wands", arcana: "minor", suit: "wands", number_value: "queen", element: "fire", upright_keywords: ["אומץ", "נחישות", "עצמאות", "חברתי"], reversed_keywords: ["אנוכיות", "קנאה", "חוסר ביטחון"], upright_meaning: "אומץ, עצמאות, כריזמה", reversed_meaning: "אנוכיות, קנאה" },
  { card_number: 35, name: "מלך מטות", name_en: "King of Wands", arcana: "minor", suit: "wands", number_value: "king", element: "fire", upright_keywords: ["מנהיגות", "חזון", "יזמות", "כבוד"], reversed_keywords: ["אימפולסיביות", "אכזריות", "ציפיות גבוהות"], upright_meaning: "מנהיגות, חזון, יזמות", reversed_meaning: "אימפולסיביות, חוסר רחמים" },
  
  // Minor Arcana - Cups (36-49) - גביעים
  { card_number: 36, name: "אס גביעים", name_en: "Ace of Cups", arcana: "minor", suit: "cups", number_value: "ace", element: "water", upright_keywords: ["אהבה", "יחסים חדשים", "חמלה", "יצירתיות"], reversed_keywords: ["אובדן רגשי", "יצירתיות חסומה", "ריקנות"], upright_meaning: "אהבה חדשה, רגש, יצירתיות", reversed_meaning: "אובדן רגשי, ריקנות" },
  { card_number: 37, name: "שניים בגביעים", name_en: "Two of Cups", arcana: "minor", suit: "cups", number_value: "2", element: "water", upright_keywords: ["אחדות", "שותפות", "קשר", "משיכה"], reversed_keywords: ["חוסר איזון", "תקשורת שבורה", "מתח"], upright_meaning: "שותפות, קשר, משיכה", reversed_meaning: "חוסר איזון, מתח ביחסים" },
  { card_number: 38, name: "שלושה בגביעים", name_en: "Three of Cups", arcana: "minor", suit: "cups", number_value: "3", element: "water", upright_keywords: ["חברות", "קהילה", "אושר", "חגיגה"], reversed_keywords: ["הגזמה", "רכילות", "בידוד"], upright_meaning: "חברות, חגיגה, שמחה", reversed_meaning: "הגזמה, רכילות" },
  { card_number: 39, name: "ארבעה בגביעים", name_en: "Four of Cups", arcana: "minor", suit: "cups", number_value: "4", element: "water", upright_keywords: ["מדיטציה", "התבוננות", "אפתיה", "הערכה מחדש"], reversed_keywords: ["נסיגה", "נסיגה", "בדיקה"], upright_meaning: "אפתיה, חוסר מוטיבציה, הערכה מחדש", reversed_meaning: "נסיגה, בדיקה פנימית" },
  { card_number: 40, name: "חמישה בגביעים", name_en: "Five of Cups", arcana: "minor", suit: "cups", number_value: "5", element: "water", upright_keywords: ["אובדן", "צער", "אכזבה", "חרטה"], reversed_keywords: ["קבלה", "המשך הלאה", "מציאת שלום"], upright_meaning: "אובדן, צער, אכזבה", reversed_meaning: "קבלה, המשך הלאה" },
  { card_number: 41, name: "שישה בגביעים", name_en: "Six of Cups", arcana: "minor", suit: "cups", number_value: "6", element: "water", upright_keywords: ["נוסטלגיה", "זיכרונות", "ילדות", "איחוד"], reversed_keywords: ["תקיעות בעבר", "נאיביות", "עצמאות"], upright_meaning: "נוסטלגיה, זיכרונות, ילדות", reversed_meaning: "תקיעות בעבר, נאיביות" },
  { card_number: 42, name: "שבעה בגביעים", name_en: "Seven of Cups", arcana: "minor", suit: "cups", number_value: "7", element: "water", upright_keywords: ["בחירות", "פנטזיה", "אשליה", "חשיבה משאלת לב"], reversed_keywords: ["בהירות", "יישור ערכים", "קבלת בחירות"], upright_meaning: "בחירות, פנטזיה, אשליה", reversed_meaning: "בהירות, יישור ערכים" },
  { card_number: 43, name: "שמונה בגביעים", name_en: "Eight of Cups", arcana: "minor", suit: "cups", number_value: "8", element: "water", upright_keywords: ["אכזבה", "נטישה", "נסיגה", "בריחה"], reversed_keywords: ["הימנעות", "פחד", "פחד מהתחייבות"], upright_meaning: "נטישה, נסיגה, חיפוש משמעות", reversed_meaning: "הימנעות, פחד מהתחייבות" },
  { card_number: 44, name: "תשעה בגביעים", name_en: "Nine of Cups", arcana: "minor", suit: "cups", number_value: "9", element: "water", upright_keywords: ["שביעות רצון", "סיפוק", "הכרת תודה", "משאלה מתגשמת"], reversed_keywords: ["חמדנות", "חוסר שביעות רצון", "חומריות"], upright_meaning: "שביעות רצון, סיפוק, משאלות מתגשמות", reversed_meaning: "חמדנות, חוסר שביעות רצון" },
  { card_number: 45, name: "עשרה בגביעים", name_en: "Ten of Cups", arcana: "minor", suit: "cups", number_value: "10", element: "water", upright_keywords: ["הרמוניה", "אושר", "התאמה", "משפחה"], reversed_keywords: ["ניתוק", "ערכים לא מיושרים", "בית שבור"], upright_meaning: "הרמוניה, אושר משפחתי, שלווה", reversed_meaning: "ניתוק, ערכים לא מיושרים" },
  { card_number: 46, name: "נסיך גביעים", name_en: "Page of Cups", arcana: "minor", suit: "cups", number_value: "page", element: "water", upright_keywords: ["יצירתיות", "אינטואיציה", "סקרנות", "אפשרות"], reversed_keywords: ["חוסר בגרות", "פגיעות רגשית", "חוסר ביטחון"], upright_meaning: "יצירתיות, אינטואיציה, סקרנות", reversed_meaning: "חוסר בגרות רגשית, פגיעות" },
  { card_number: 47, name: "אביר גביעים", name_en: "Knight of Cups", arcana: "minor", suit: "cups", number_value: "knight", element: "water", upright_keywords: ["רומנטיקה", "קסם", "דמיון", "אידיאליזם"], reversed_keywords: ["מצבי רוח", "אכזבה", "לא ריאליסטי"], upright_meaning: "רומנטיקה, קסם, אידיאליזם", reversed_meaning: "מצבי רוח, אכזבה" },
  { card_number: 48, name: "מלכת גביעים", name_en: "Queen of Cups", arcana: "minor", suit: "cups", number_value: "queen", element: "water", upright_keywords: ["חמלה", "רוגע", "נחמה", "אינטואיציה"], reversed_keywords: ["חוסר ביטחון", "נתינה יתר", "תלות משותפת"], upright_meaning: "חמלה, רגישות, אינטואיציה", reversed_meaning: "חוסר ביטחון, תלות" },
  { card_number: 49, name: "מלך גביעים", name_en: "King of Cups", arcana: "minor", suit: "cups", number_value: "king", element: "water", upright_keywords: ["איזון רגשי", "חמלה", "דיפלומטיה", "שליטה"], reversed_keywords: ["קרירות", "מצבי רוח", "מניפולציה"], upright_meaning: "איזון רגשי, חמלה, דיפלומטיה", reversed_meaning: "קרירות, מניפולציה רגשית" },
  
  // Minor Arcana - Swords (50-63) - חרבות  
  { card_number: 50, name: "אס חרבות", name_en: "Ace of Swords", arcana: "minor", suit: "swords", number_value: "ace", element: "air", upright_keywords: ["פריצת דרך", "בהירות", "שכל חד", "אמת"], reversed_keywords: ["בלבול", "כאוס", "חוסר בהירות"], upright_meaning: "פריצת דרך, בהירות, אמת", reversed_meaning: "בלבול, כאוס" },
  { card_number: 51, name: "שניים בחרבות", name_en: "Two of Swords", arcana: "minor", suit: "swords", number_value: "2", element: "air", upright_keywords: ["בחירות קשות", "מבוי סתום", "הימנעות", "הכחשה"], reversed_keywords: ["חוסר החלטיות", "בלבול", "עומס מידע"], upright_meaning: "החלטה קשה, מבוי סתום, הימנעות", reversed_meaning: "חוסר החלטיות, בלבול" },
  { card_number: 52, name: "שלושה בחרבות", name_en: "Three of Swords", arcana: "minor", suit: "swords", number_value: "3", element: "air", upright_keywords: ["שבירת לב", "צער", "כאב", "בגידה"], reversed_keywords: ["החלמה", "סליחה", "המשך הלאה"], upright_meaning: "שבירת לב, כאב, בגידה", reversed_meaning: "החלמה, סליחה" },
  { card_number: 53, name: "ארבעה בחרבות", name_en: "Four of Swords", arcana: "minor", suit: "swords", number_value: "4", element: "air", upright_keywords: ["מנוחה", "שיקום", "התבוננות", "התאוששות"], reversed_keywords: ["חוסר מנוחה", "שחיקה", "חוסר התקדמות"], upright_meaning: "מנוחה, החלמה, התבוננות", reversed_meaning: "חוסר מנוחה, שחיקה" },
  { card_number: 54, name: "חמישה בחרבות", name_en: "Five of Swords", arcana: "minor", suit: "swords", number_value: "5", element: "air", upright_keywords: ["עימות", "תבוסה", "ניצחון במחיר", "בגידה"], reversed_keywords: ["פיוס", "תיקון", "טינה מהעבר"], upright_meaning: "עימות, תבוסה, ניצחון במחיר", reversed_meaning: "פיוס, תיקון" },
  { card_number: 55, name: "שישה בחרבות", name_en: "Six of Swords", arcana: "minor", suit: "swords", number_value: "6", element: "air", upright_keywords: ["מעבר", "שינוי", "המשך הלאה", "נסיעה"], reversed_keywords: ["התנגדות לשינוי", "עניינים לא גמורים"], upright_meaning: "מעבר, שינוי, נסיעה", reversed_meaning: "התנגדות לשינוי, עניינים לא גמורים" },
  { card_number: 56, name: "שבעה בחרבות", name_en: "Seven of Swords", arcana: "minor", suit: "swords", number_value: "7", element: "air", upright_keywords: ["רמאות", "בגידה", "אסטרטגיה", "ערמומיות"], reversed_keywords: ["הודאה", "שינוי גישה"], upright_meaning: "רמאות, ערמומיות, אסטרטגיה", reversed_meaning: "הודאה, שינוי גישה" },
  { card_number: 57, name: "שמונה בחרבות", name_en: "Eight of Swords", arcana: "minor", suit: "swords", number_value: "8", element: "air", upright_keywords: ["הגבלה", "כלא", "מנטליות קורבן", "חוסר אונים"], reversed_keywords: ["קבלה עצמית", "חופש", "שחרור"], upright_meaning: "הגבלה, תחושת כלא, חוסר אונים", reversed_meaning: "קבלה עצמית, שחרור" },
  { card_number: 58, name: "תשעה בחרבות", name_en: "Nine of Swords", arcana: "minor", suit: "swords", number_value: "9", element: "air", upright_keywords: ["חרדה", "דאגה", "פחד", "סיוטים"], reversed_keywords: ["תקווה", "פנייה לעזרה", "ייאוש"], upright_meaning: "חרדה, דאגה, פחד", reversed_meaning: "תקווה, פנייה לעזרה" },
  { card_number: 59, name: "עשרה בחרבות", name_en: "Ten of Swords", arcana: "minor", suit: "swords", number_value: "10", element: "air", upright_keywords: ["סוף כואב", "בגידה", "אובדן", "משבר"], reversed_keywords: ["התאוששות", "התחדשות", "פחד מחורבן"], upright_meaning: "סוף כואב, בגידה, משבר", reversed_reversed_meaning: "התאוששות, התחדשות" },
  { card_number: 60, name: "נסיך חרבות", name_en: "Page of Swords", arcana: "minor", suit: "swords", number_value: "page", element: "air", upright_keywords: ["סקרנות", "חוסר מנוחה", "אנרגיה מנטלית", "ערנות"], reversed_keywords: ["מניפולציה", "דיבורים ריקים"], upright_meaning: "סקרנות, אנרגיה מנטלית, ערנות", reversed_meaning: "מניפולציה, דיבורים ריקים" },
  { card_number: 61, name: "אביר חרבות", name_en: "Knight of Swords", arcana: "minor", suit: "swords", number_value: "knight", element: "air", upright_keywords: ["פעולה", "אימפולסיביות", "שאפתנות", "חיפזון"], reversed_keywords: ["פזיזות", "חוסר מיקוד"], upright_meaning: "פעולה, אימפולסיביות, שאפתנות", reversed_meaning: "פזיזות, חוסר מיקוד" },
  { card_number: 62, name: "מלכת חרבות", name_en: "Queen of Swords", arcana: "minor", suit: "swords", number_value: "queen", element: "air", upright_keywords: ["עצמאות", "חשיבה בהירה", "תקשורת ישירה"], reversed_keywords: ["קרירות", "אכזריות", "מרירות"], upright_meaning: "עצמאות, חשיבה בהירה, תקשורת ישירה", reversed_meaning: "קרירות, מרירות" },
  { card_number: 63, name: "מלך חרבות", name_en: "King of Swords", arcana: "minor", suit: "swords", number_value: "king", element: "air", upright_keywords: ["בהירות מנטלית", "סמכות", "אמת", "כוח"], reversed_keywords: ["מניפולטיביות", "אכזריות", "חולשה"], upright_meaning: "בהירות מנטלית, סמכות, אמת", reversed_meaning: "מניפולטיביות, אכזריות" },
  
  // Minor Arcana - Pentacles (64-77) - מטבעות
  { card_number: 64, name: "אס מטבעות", name_en: "Ace of Pentacles", arcana: "minor", suit: "pentacles", number_value: "ace", element: "earth", upright_keywords: ["הזדמנות", "שגשוג", "מיזם חדש", "ביטוי"], reversed_keywords: ["הזדמנות אבודה", "חוסר תכנון", "מחסור"], upright_meaning: "הזדמנות, שפע, התחלה חדשה", reversed_meaning: "הזדמנות אבודה, מחסור" },
  { card_number: 65, name: "שניים במטבעות", name_en: "Two of Pentacles", arcana: "minor", suit: "pentacles", number_value: "2", element: "earth", upright_keywords: ["איזון", "הסתגלות", "ניהול זמן", "עדיפויות"], reversed_keywords: ["עומס", "חוסר ארגון", "סדר עדיפויות מחדש"], upright_meaning: "איזון, גמישות, ניהול זמן", reversed_meaning: "עומס, חוסר ארגון" },
  { card_number: 66, name: "שלושה במטבעות", name_en: "Three of Pentacles", arcana: "minor", suit: "pentacles", number_value: "3", element: "earth", upright_keywords: ["עבודת צוות", "שיתוף פעולה", "למידה", "יישום"], reversed_keywords: ["חוסר שיתוף", "התעלמות מכישורים"], upright_meaning: "עבודת צוות, שיתוף פעולה, למידה", reversed_meaning: "חוסר שיתוף, התעלמות מכישורים" },
  { card_number: 67, name: "ארבעה במטבעות", name_en: "Four of Pentacles", arcana: "minor", suit: "pentacles", number_value: "4", element: "earth", upright_keywords: ["שליטה", "יציבות", "ביטחון", "שמרנות"], reversed_keywords: ["חמדנות", "חומריות", "הגנה עצמית"], upright_meaning: "שליטה, יציבות, ביטחון", reversed_meaning: "חמדנות, חומריות" },
  { card_number: 68, name: "חמישה במטבעות", name_en: "Five of Pentacles", arcana: "minor", suit: "pentacles", number_value: "5", element: "earth", upright_keywords: ["אובדן כלכלי", "עוני", "חוסר ביטחון", "בידוד"], reversed_keywords: ["התאוששות", "התגברות על קשיים"], upright_meaning: "קושי כלכלי, חוסר ביטחון, בדידות", reversed_meaning: "התאוששות, התגברות על קשיים" },
  { card_number: 69, name: "שישה במטבעות", name_en: "Six of Pentacles", arcana: "minor", suit: "pentacles", number_value: "6", element: "earth", upright_keywords: ["נדיבות", "צדקה", "שיתוף", "שגשוג"], reversed_keywords: ["חוב", "נתינה עם תנאים", "אי-שוויון"], upright_meaning: "נדיבות, נתינה, שיתוף", reversed_meaning: "חוב, נתינה עם תנאים" },
  { card_number: 70, name: "שבעה במטבעות", name_en: "Seven of Pentacles", arcana: "minor", suit: "pentacles", number_value: "7", element: "earth", upright_keywords: ["ראייה לטווח ארוך", "התמדה", "השקעה", "מאמץ"], reversed_keywords: ["חוסר סבלנות", "חוסר תגמול", "מאמץ לריק"], upright_meaning: "חזון ארוך טווח, השקעה, התמדה", reversed_meaning: "חוסר סבלנות, מאמץ לריק" },
  { card_number: 71, name: "שמונה במטבעות", name_en: "Eight of Pentacles", arcana: "minor", suit: "pentacles", number_value: "8", element: "earth", upright_keywords: ["חניכות", "מיומנות", "פיתוח כישרון", "מאסטריות"], reversed_keywords: ["חוסר מיקוד", "פרפקציוניזם", "חוסר השראה"], upright_meaning: "מסירות, פיתוח כישורים, מקצועיות", reversed_meaning: "חוסר מיקוד, פרפקציוניזם" },
  { card_number: 72, name: "תשעה במטבעות", name_en: "Nine of Pentacles", arcana: "minor", suit: "pentacles", number_value: "9", element: "earth", upright_keywords: ["שפע", "יוקרה", "עצמאות", "כושר עצמי"], reversed_keywords: ["השקעת יתר", "עסקאות מפוקפקות", "חיים מעבר ליכולת"], upright_meaning: "שפע, עצמאות, יוקרה", reversed_meaning: "חיים מעבר ליכולת, עסקאות מפוקפקות" },
  { card_number: 73, name: "עשרה במטבעות", name_en: "Ten of Pentacles", arcana: "minor", suit: "pentacles", number_value: "10", element: "earth", upright_keywords: ["עושר", "ירושה", "משפחה", "מורשת"], reversed_keywords: ["כישלון כלכלי", "בדידות", "סכסוכים משפחתיים"], upright_meaning: "עושר, מורשת, משפחה", reversed_meaning: "כישלון כלכלי, סכסוכים משפחתיים" },
  { card_number: 74, name: "נסיך מטבעות", name_en: "Page of Pentacles", arcana: "minor", suit: "pentacles", number_value: "page", element: "earth", upright_keywords: ["שאפתנות", "רצון", "חריצות", "מטרות"], reversed_keywords: ["חוסר מחויבות", "חמדנות", "עצלות"], upright_meaning: "שאפתנות, חריצות, מטרות", reversed_meaning: "חוסר מחויבות, עצלות" },
  { card_number: 75, name: "אביר מטבעות", name_en: "Knight of Pentacles", arcana: "minor", suit: "pentacles", number_value: "knight", element: "earth", upright_keywords: ["יעילות", "שגרה", "שמרנות", "שיטתיות"], reversed_keywords: ["עצלות", "אובססיביות", "עבודה ללא תגמול"], upright_meaning: "יעילות, שיטתיות, שמרנות", reversed_meaning: "עצלות, אובססיביות" },
  { card_number: 76, name: "מלכת מטבעות", name_en: "Queen of Pentacles", arcana: "minor", suit: "pentacles", number_value: "queen", element: "earth", upright_keywords: ["טיפוח", "מעשיות", "דאגה", "ביטחון"], reversed_keywords: ["הזנחה עצמית", "חוסר איזון בין עבודה לבית"], upright_meaning: "טיפוח, מעשיות, דאגה", reversed_meaning: "הזנחה עצמית, חוסר איזון" },
  { card_number: 77, name: "מלך מטבעות", name_en: "King of Pentacles", arcana: "minor", suit: "pentacles", number_value: "king", element: "earth", upright_keywords: ["עושר", "עסקים", "ביטחון", "משמעת"], reversed_keywords: ["חמדנות", "חומריות יתר", "עקשנות"], upright_meaning: "עושר, עסקים, משמעת", reversed_meaning: "חמדנות, חומריות יתר" }
];

const SPREADS = [
  {
    id: "single_card",
    name: "קלף בודד",
    description: "תובנה מיידית",
    cards: 1,
    positions: ["התובנה"]
  },
  {
    id: "three_card",
    name: "שלושה קלפים",
    description: "עבר, הווה, עתיד",
    cards: 3,
    positions: ["עבר", "הווה", "עתיד"]
  },
  {
    id: "relationship",
    name: "פריסת יחסים",
    description: "5 קלפים על מערכת יחסים",
    cards: 5,
    positions: [
      "המצב שלך",
      "המצב של השני",
      "הקשר ביניכם",
      "האתגרים",
      "הפוטנציאל"
    ]
  },
  {
    id: "celtic_cross",
    name: "הצלב הקלטי",
    description: "פריסה מקיפה של 10 קלפים",
    cards: 10,
    positions: [
      "המצב הנוכחי",
      "האתגר/המכשול",
      "הבסיס/העבר הרחוק",
      "העבר הקרוב",
      "האפשרות הטובה ביותר",
      "העתיד הקרוב",
      "איך אתה רואה את עצמך",
      "איך אחרים רואים אותך",
      "תקוות ופחדים",
      "התוצאה הסופית"
    ]
  }
];

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Tarot() {
  const [activeTab, setActiveTab] = useState('reading'); // 'reading' or 'personal'
  const [selectedSpread, setSelectedSpread] = useState(null);
  const [question, setQuestion] = useState("");
  const [reading, setReading] = useState(null);
  const [isShuffling, setIsShuffling] = useState(false);
  const [shuffleProgress, setShuffleProgress] = useState(0);
  const [allCards] = useState(TAROT_CARDS);
  
  // Personal Card State
  const [birthDate, setBirthDate] = useState("");
  const [personalCard, setPersonalCard] = useState(null);
  const [isGeneratingCard, setIsGeneratingCard] = useState(false);

  const queryClient = useQueryClient();
  const { incrementUsage } = useSubscription();

  // Load existing personal card
  const { data: existingPersonalCard } = useQuery({
    queryKey: ['personalTarot'],
    queryFn: async () => {
      const cards = await base44.entities.PersonalTarot.list('-generated_at', 1);
      return cards[0] || null;
    }
  });

  const generatePersonalCardMutation = useMutation({
    mutationFn: async (date) => {
      setIsGeneratingCard(true);
      
      // 1. Calculate Life Path / Tarot Card
      const dateObj = new Date(date);
      const day = dateObj.getDate();
      const month = dateObj.getMonth() + 1;
      const year = dateObj.getFullYear();
      
      const sumDigits = (n) => String(n).split('').reduce((a, b) => a + parseInt(b), 0);
      
      let sum = sumDigits(day) + sumDigits(month) + sumDigits(year);
      while (sum > 21) {
        sum = sumDigits(sum);
      }
      
      const cardNumber = sum; // 0-21
      const cardData = TAROT_CARDS.find(c => c.card_number === cardNumber && c.arcana === 'major');
      
      if (!cardData) throw new Error("Could not calculate card");

      // 2. Generate Image
      const imageRes = await base44.integrations.Core.GenerateImage({
        prompt: `A mystical, highly detailed Tarot card representing ${cardData.name_en} (${cardData.name}). 
        Style: Ethereal, golden divine light, intricate details, fantasy art, masterpiece. 
        The card represents the soul's journey for someone born on ${date}.`
      });

      // 3. Save
      const newCard = await base44.entities.PersonalTarot.create({
        birth_date: date,
        card_name: cardData.name,
        card_number: cardNumber,
        image_url: imageRes.url,
        interpretation: cardData.upright_meaning,
        generated_at: new Date().toISOString()
      });

      return newCard;
    },
    onSuccess: (data) => {
      setPersonalCard(data);
      queryClient.invalidateQueries(['personalTarot']);
      EnhancedToast.success('הקלף האישי שלך נוצר! ✨');
      setIsGeneratingCard(false);
    },
    onError: (err) => {
      EnhancedToast.error('שגיאה ביצירת הקלף');
      setIsGeneratingCard(false);
    }
  });

  const generateReadingMutation = useMutation({
    mutationFn: async ({ spread, userQuestion, cards }) => {
      if (!cards || cards.length < spread.cards) {
        throw new Error(`לא מספיק קלפים. נדרשים ${spread.cards}, יש ${cards?.length || 0}`);
      }

      setShuffleProgress(10);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const shuffled = [...cards].sort(() => Math.random() - 0.5);
      setShuffleProgress(30);
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const drawn = shuffled.slice(0, spread.cards);
      setShuffleProgress(50);
      
      const drawnCards = drawn.map((card, idx) => ({
        position: idx + 1,
        position_name: spread.positions[idx],
        card_id: card.card_number,
        card_name: card.name,
        card_data: card,
        is_reversed: Math.random() > 0.5,
        arcana: card.arcana,
        suit: card.suit,
        element: card.element,
        astrology: card.astrology,
        numerology: card.numerology,
        kabbalah: card.kabbalah,
        archetype: card.archetype
      }));

      setShuffleProgress(70);

      // Simplified Hebrew prompt
      const prompt = `אתה רייצ'ל פולאק - מומחית הטארוט המובילה בעולם, מחברת "78 Degrees of Wisdom".

⚠️ **חובה לענות בעברית בלבד! כל המילים, כל המשפטים - רק עברית!**

## הקריאה שלך:

**שאלה:** ${userQuestion || "שאלה כללית על החיים"}
**פריסה:** ${spread.name}

**הקלפים שנמשכו:**

${drawnCards.map((c, i) => `
${i + 1}. **${c.position_name}** → ${c.card_name} ${c.is_reversed ? '(הפוך ↓)' : '(זקוף ↑)'}
   • ${c.is_reversed ? c.card_data.reversed_meaning : c.card_data.upright_meaning}
   • מילות מפתח: ${c.is_reversed ? c.card_data.reversed_keywords.join(', ') : c.card_data.upright_keywords.join(', ')}
`).join('\n')}

---

## ההנחיות שלך:

### 1. לכל קלף - פרשנות בעברית (200-300 מילים):

**מבנה:**
- מה הקלף מייצג
- איך זה קשור למיקום בפריסה
- מה זה אומר על המצב
- קשר לשאלה

דוגמה טובה:
"**${drawnCards[0]?.card_name}** במיקום '${drawnCards[0]?.position_name}' ${drawnCards[0]?.is_reversed ? 'בהיפוך' : ''} מדבר על ${drawnCards[0]?.is_reversed ? 'תהליך פנימי של...' : 'התחלה חדשה של...'}. בהקשר של ${userQuestion || 'החיים שלך'}, זה אומר ש..."

### 2. סינתזה כוללת (300-400 מילים בעברית):

- איך כל הקלפים מספרים סיפור אחד
- מה המסר המרכזי
- לאן זה מוביל

### 3. תובנות עמוקות (6-8 insights):

כל insight:
- **title** בעברית
- **content** 200-250 מילים בעברית
- **insight_type**: archetype/pattern/strength/challenge/advice
- **confidence**: 0.8-1.0
- **weight**: 0.6-1.0
- **provenance** עם source_features, rule_description, sources
- **tags** בעברית

### 4. עצות מעשיות (5-7 בעברית):

כל עצה:
- מה לעשות
- איך
- מתי

דוגמה: "כתוב 3 דברים שאתה רוצה לשחרר - עכשיו"

**החזר JSON:**`;

      setShuffleProgress(80);

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            spread_name: { type: "string" },
            question: { type: "string" },
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  position: { type: "string" },
                  card_name: { type: "string" },
                  is_reversed: { type: "boolean" },
                  card_type: { type: "string" },
                  archetype: { type: "string" },
                  interpretation: { type: "string", minLength: 200 },
                  psychological_depth: { type: "string" }
                },
                required: ["position", "card_name", "is_reversed", "interpretation"]
              }
            },
            elemental_balance: {
              type: "object",
              properties: {
                fire: { type: "number" },
                water: { type: "number" },
                air: { type: "number" },
                earth: { type: "number" },
                interpretation: { type: "string" }
              }
            },
            major_arcana_count: { type: "number" },
            reversed_count: { type: "number" },
            overall_synthesis: { type: "string", minLength: 300 },
            central_message: { type: "string" },
            advice: { type: "string" }, // Keeping this as per outline's schema example and rendering logic
            insights: {
              type: "array",
              minItems: 6,
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "string", minLength: 200 },
                  insight_type: { type: "string" },
                  confidence: { type: "number" },
                  weight: { type: "number" },
                  provenance: {
                    type: "object",
                    properties: {
                      source_features: { type: "array", items: { type: "string" } },
                      rule_description: { type: "string" },
                      sources: { type: "array", items: { type: "string" } }
                    }
                  },
                  tags: { type: "array", items: { type: "string" } }
                }
              }
            },
            practical_actions: {
              type: "array",
              minItems: 5,
              items: {
                type: "object",
                properties: {
                  action: { type: "string" },
                  how: { type: "string" },
                  when: { type: "string" }
                }
              }
            },
            confidence_level: { type: "number" }
          }
        }
      });

      setShuffleProgress(100);

      return {
        ...result,
        drawn_cards: drawnCards,
        confidence_level: result.confidence_level || 0.95
      };
    }
  });

  const saveAnalysisMutation = useMutation({
    mutationFn: (data) => base44.entities.Analysis.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
    }
  });

  const handleGenerateReading = async () => {
    if (!selectedSpread) {
      EnhancedToast.error('נא לבחור פריסה', 'בחר אחת מהפריסות כדי להמשיך');
      return;
    }

    if (!allCards || allCards.length < 78) {
      EnhancedToast.error(`יש רק ${allCards?.length || 0} קלפים`, 'נדרשים 78 קלפים');
      return;
    }

    setIsShuffling(true);
    setShuffleProgress(0);

    try {
      const result = await generateReadingMutation.mutateAsync({
        spread: selectedSpread,
        userQuestion: question?.trim() || "",
        cards: allCards
      });

      setReading(result);

      await saveAnalysisMutation.mutateAsync({
        tool_type: "tarot",
        input_data: { 
          spread: selectedSpread.name, 
          question: question?.trim() || "שאלה כללית", 
          cards_count: selectedSpread.cards 
        },
        results: result,
        summary: `קריאה בטארוט - ${selectedSpread.name}${question ? `: ${question.substring(0, 50)}` : ''}`,
        confidence_score: Math.round((result.confidence_level || 0.95) * 100)
      });

      await incrementUsage();

      EnhancedToast.success('הקלפים נפתחו! 🔮');
    } catch (error) {
      if (error.message === 'Usage limit reached') {
        return;
      }
      EnhancedToast.error('אירעה שגיאה', error.message || 'נסה שוב');
      console.error(error);
    } finally {
      setIsShuffling(false);
      setShuffleProgress(0);
    }
  };

  const handleReset = () => {
    setReading(null);
    setQuestion("");
    setSelectedSpread(null);
    setShuffleProgress(0);
  };

  if (isShuffling) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-pink-950 to-purple-900 p-6 md:p-12 flex items-center justify-center">
        <Card className="bg-purple-900/80 backdrop-blur-xl border-purple-700/50 max-w-md w-full">
          <CardContent className="p-12 text-center">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <div className="absolute inset-0 border-8 border-purple-500/30 rounded-full"></div>
              <div 
                className="absolute inset-0 border-8 border-purple-500 border-t-transparent rounded-full animate-spin"
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Shuffle className="w-10 h-10 text-purple-300 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">מערבב את הקלפים...</h3>
            <div className="w-full bg-purple-800/30 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${shuffleProgress}%` }}
              ></div>
            </div>
            <p className="text-purple-300 text-sm">{shuffleProgress}%</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SubscriptionGuard toolName="קלפי טארוט">
      <div className="min-h-screen bg-gradient-to-br from-purple-950 via-pink-950 to-purple-900 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="קלפי טארוט 🔮"
            description="הקלפים מראים לך את הדרך"
            icon={Layers}
            iconGradient="from-purple-600 to-pink-600"
          />

          {/* Tabs */}
          <div className="flex justify-center gap-4 mb-8">
            <Button
              onClick={() => setActiveTab('reading')}
              variant={activeTab === 'reading' ? 'default' : 'outline'}
              className={activeTab === 'reading' ? 'bg-purple-600' : 'border-purple-500 text-purple-200'}
            >
              <Layers className="w-4 h-4 ml-2" />
              קריאה בטארוט
            </Button>
            <Button
              onClick={() => setActiveTab('personal')}
              variant={activeTab === 'personal' ? 'default' : 'outline'}
              className={activeTab === 'personal' ? 'bg-pink-600' : 'border-pink-500 text-pink-200'}
            >
              <Sparkles className="w-4 h-4 ml-2" />
              הקלף האישי שלי
            </Button>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'personal' ? (
              <motion.div
                key="personal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="bg-gradient-to-br from-pink-900/50 to-purple-900/50 border-pink-700/30">
                  <CardContent className="p-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">הקלף האישי שלך 🃏</h2>
                    
                    {existingPersonalCard || personalCard ? (
                      <div className="max-w-md mx-auto">
                        <div className="relative group perspective-1000">
                          <motion.div
                            initial={{ rotateY: 180 }}
                            animate={{ rotateY: 0 }}
                            transition={{ duration: 1 }}
                            className="relative"
                          >
                            <img 
                              src={(personalCard || existingPersonalCard).image_url} 
                              alt="Personal Tarot Card"
                              className="w-full rounded-xl shadow-2xl border-4 border-yellow-500/50"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-xl flex flex-col justify-end p-6">
                              <h3 className="text-3xl font-bold text-yellow-400 mb-2">
                                {(personalCard || existingPersonalCard).card_name}
                              </h3>
                              <p className="text-white text-lg">
                                {(personalCard || existingPersonalCard).interpretation}
                              </p>
                            </div>
                          </motion.div>
                        </div>
                        <Button 
                          className="mt-6 bg-white/10 hover:bg-white/20 text-white"
                          onClick={() => { setPersonalCard(null); /* Reset logic if needed */ }}
                        >
                          חשב מחדש
                        </Button>
                      </div>
                    ) : (
                      <div className="max-w-md mx-auto space-y-6">
                        <p className="text-pink-200 text-lg">
                          גלה איזה קלף טארוט מייצג את נשמתך על פי תאריך הלידה שלך,
                          וקבל יצירת אמנות ייחודית שנוצרה במיוחד בשבילך.
                        </p>
                        <div className="space-y-2 text-right">
                          <Label className="text-white">תאריך לידה</Label>
                          <Input
                            type="date"
                            value={birthDate}
                            onChange={(e) => setBirthDate(e.target.value)}
                            className="bg-black/30 border-pink-500/50 text-white h-12"
                          />
                        </div>
                        <Button
                          onClick={() => generatePersonalCardMutation.mutate(birthDate)}
                          disabled={!birthDate || isGeneratingCard}
                          className="w-full bg-gradient-to-r from-pink-600 to-purple-600 h-14 text-lg"
                        >
                          {isGeneratingCard ? (
                            <>
                              <Sparkles className="w-5 h-5 ml-2 animate-spin" />
                              יוצר קסם...
                            </>
                          ) : (
                            "גלה את הקלף שלי ✨"
                          )}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : !reading ? (
              <motion.div
                key="selection"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                {/* הסבר */}
                <Card className="bg-purple-900/50 border-purple-700/30">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Info className="w-6 h-6 text-purple-300 shrink-0 mt-1" />
                      <div>
                        <h3 className="text-purple-200 font-bold text-lg mb-2">איך זה עובד?</h3>
                        <p className="text-purple-100 text-sm leading-relaxed mb-3">
                          טארוט הוא מערכת סמלים עתיקה שמשלבת קבלה, אסטרולוגיה ופסיכולוגיה יונגיאנית. כל קלף מייצג ארכיטיפ אוניברסלי שיכול לעזור לך להבין את המצב שלך.
                        </p>
                        <div className="flex items-center gap-2 bg-indigo-900/30 rounded-lg p-3">
                          <BookOpen className="w-5 h-5 text-indigo-300" />
                          <p className="text-indigo-200 text-sm">
                            מבוסס על: Waite, Jung, Pollack, Jodorowsky + הקבלה
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Question Input */}
                <Card className="bg-purple-900/50 border-purple-700/30">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">מה השאלה שלך?</h3>
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="אתה יכול לשאול כל שאלה... או להשאיר ריק לקריאה כללית"
                      className="w-full bg-purple-800/30 border border-purple-600/50 rounded-xl p-4 text-white placeholder-purple-300 min-h-[100px]"
                      dir="rtl"
                      maxLength={500}
                    />
                    {question && (
                      <p className="text-purple-300 text-xs mt-2 text-left">
                        {question.length} / 500 תווים
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Spread Selection */}
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 text-center">בחר פריסה</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {SPREADS.map((spread) => (
                      <motion.div key={spread.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Card
                          className={`cursor-pointer transition-all ${
                            selectedSpread?.id === spread.id
                              ? 'bg-gradient-to-r from-purple-600 to-pink-600 border-pink-400 shadow-2xl'
                              : 'bg-purple-900/50 border-purple-700/30 hover:border-purple-500'
                          }`}
                          onClick={() => setSelectedSpread(spread)}
                        >
                          <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                              {spread.name}
                              <Badge className="bg-purple-700 text-white">
                                {spread.cards} 🃏
                              </Badge>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-purple-200 mb-3">{spread.description}</p>
                            <div className="text-purple-300 text-xs space-y-1">
                              {spread.positions.slice(0, 3).map((pos, i) => (
                                <div key={i}>• {pos}</div>
                              ))}
                              {spread.positions.length > 3 && (
                                <div className="text-purple-400">ועוד {spread.positions.length - 3}...</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={handleGenerateReading}
                    disabled={!selectedSpread || allCards.length < 78}
                    className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-xl px-12 py-6 disabled:opacity-50"
                  >
                    <Shuffle className="w-6 h-6 ml-2" />
                    ערבב והגרל
                    <Sparkles className="w-6 h-6 mr-2" />
                  </Button>
                </div>

                {!selectedSpread && (
                  <p className="text-center text-purple-300 text-sm">
                    👆 בחר פריסה כדי להתחיל
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                {/* Main Result */}
                <Card className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl border-purple-700/30">
                  <CardContent className="p-8">
                    <h2 className="text-3xl font-bold text-white mb-4 text-center">
                      🔮 {reading.spread_name || selectedSpread.name} 🔮
                    </h2>
                    {(reading.question || question) && (
                      <p className="text-purple-200 text-lg text-center mb-4">
                        השאלה: "{reading.question || question}"
                      </p>
                    )}
                    
                    <div className="flex justify-center mb-6">
                      <ConfidenceBadge score={(reading.confidence_level || 0.95) * 100} size="large" />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="bg-purple-800/30 rounded-lg p-3 text-center">
                        <p className="text-purple-300 text-sm">Major Arcana</p>
                        <p className="text-white text-2xl font-bold">{reading.major_arcana_count || 0}</p>
                      </div>
                      <div className="bg-pink-800/30 rounded-lg p-3 text-center">
                        <p className="text-pink-300 text-sm">קלפים הפוכים</p>
                        <p className="text-white text-2xl font-bold">{reading.reversed_count || 0}</p>
                      </div>
                      {reading.elemental_balance && (
                        <>
                          <div className="bg-red-800/30 rounded-lg p-3 text-center">
                            <p className="text-red-300 text-sm">🔥 אש</p>
                            <p className="text-white text-xl font-bold">{reading.elemental_balance.fire || 0}</p>
                          </div>
                          <div className="bg-blue-800/30 rounded-lg p-3 text-center">
                            <p className="text-blue-300 text-sm">💧 מים</p>
                            <p className="text-white text-xl font-bold">{reading.elemental_balance.water || 0}</p>
                          </div>
                        </>
                      )}
                    </div>

                    {reading.overall_synthesis && (
                      <div className="bg-purple-800/30 rounded-xl p-6 border border-purple-700/30">
                        <h3 className="text-xl font-bold text-purple-200 mb-3">💫 הסיפור המשולב:</h3>
                        <p className="text-white text-lg leading-relaxed whitespace-pre-line">{reading.overall_synthesis}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Cards */}
                {reading.cards && reading.cards.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-6">🃏 הקלפים שלך</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      {reading.cards.map((card, idx) => (
                        <Card key={idx} className="bg-purple-900/50 border-purple-700/30">
                          <CardHeader>
                            <CardTitle className="text-white flex items-center justify-between">
                              <span>{card.position}</span>
                              {card.is_reversed && (
                                <Badge className="bg-orange-600 text-white">הפוך ↓</Badge>
                              )}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <h4 className="text-2xl font-bold text-purple-200">
                                {card.card_name}
                              </h4>
                              
                              {card.archetype && (
                                <p className="text-purple-300 text-sm italic">
                                  🎭 {card.archetype}
                                </p>
                              )}

                              <div className="bg-purple-800/30 rounded-lg p-4">
                                <p className="text-white leading-relaxed whitespace-pre-line">{card.interpretation}</p>
                              </div>

                              {card.psychological_depth && (
                                <div className="bg-indigo-800/30 rounded-lg p-4">
                                  <p className="text-indigo-200 text-xs font-semibold mb-1">עומק פסיכולוגי:</p>
                                  <p className="text-indigo-100 text-sm leading-relaxed">{card.psychological_depth}</p>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Elemental Balance */}
                {reading.elemental_balance?.interpretation && (
                  <Card className="bg-gradient-to-r from-red-900/30 via-blue-900/30 to-green-900/30 border-purple-700/30">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-white mb-3">⚖️ איזון היסודות</h3>
                      <p className="text-white leading-relaxed">{reading.elemental_balance.interpretation}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Deep Insights */}
                {reading.insights && reading.insights.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-white">💎 תובנות עמוקות</h2>
                    {reading.insights.map((insight, idx) => (
                      <ExplainableInsight key={idx} insight={insight} showProvenance={true} />
                    ))}
                  </div>
                )}

                {/* Central Message */}
                {reading.central_message && (
                  <Card className="bg-gradient-to-r from-pink-900/50 to-purple-900/50 border-pink-700/30">
                    <CardContent className="p-8 text-center">
                      <Sparkles className="w-12 h-12 text-yellow-300 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-pink-200 mb-3">✨ המסר המרכזי</h3>
                      <p className="text-white text-xl leading-relaxed">{reading.central_message}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Practical Actions */}
                {reading.practical_actions && reading.practical_actions.length > 0 && (
                  <Card className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-700/30">
                    <CardHeader>
                      <CardTitle className="text-white text-2xl flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-green-400" />
                        🎯 מה לעשות עכשיו
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {reading.practical_actions.map((action, idx) => (
                        <div key={idx} className="bg-green-800/30 rounded-lg p-4 border border-green-700/30">
                          <h4 className="text-green-200 font-bold mb-2">{idx + 1}. {action.action}</h4>
                          {action.how && (
                            <p className="text-green-100 text-sm mb-1">
                              <span className="font-semibold">איך:</span> {action.how}
                            </p>
                          )}
                          {action.when && (
                            <p className="text-green-100 text-sm">
                              <span className="font-semibold">מתי:</span> {action.when}
                            </p>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* Advice (general string, if returned) */}
                {reading.advice && (
                  <Card className="bg-gradient-to-r from-amber-900/40 to-orange-900/40 border-amber-700/30">
                    <CardContent className="p-8">
                      <h3 className="text-2xl font-bold text-amber-200 mb-3">🌟 העצה</h3>
                      <p className="text-white text-xl leading-relaxed whitespace-pre-line">{reading.advice}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-center">
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-purple-500 text-purple-300 hover:bg-purple-800/30 text-lg px-8 py-4"
                  >
                    קריאה חדשה
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </SubscriptionGuard>
  );
}