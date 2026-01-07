import { ThemeProvider as ThemeContextProvider } from "./ThemeContext";

export default function ThemeProvider({ children }) {
  return (
    <ThemeContextProvider>
      {children}
    </ThemeContextProvider>
  );
}