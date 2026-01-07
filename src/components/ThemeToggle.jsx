import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "./ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-xl border-2 border-blue-800 dark:border-blue-800 light:border-blue-200 hover:bg-blue-900/40 dark:hover:bg-blue-900/40 light:hover:bg-blue-50"
      aria-label={theme === 'dark' ? 'החלף למצב בהיר' : 'החלף למצב כהה'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-purple-400" />
      )}
    </Button>
  );
}