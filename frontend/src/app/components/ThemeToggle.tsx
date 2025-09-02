"use client";
import { useTheme } from "../theme/ThemeProvider";

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1.5 text-xs font-medium transition border rounded-md border-dark-700 bg-dark-900 text-dark-200 hover:bg-dark-800"
      title="Toggle theme"
    >
      {resolvedTheme === "dark" ? "Light" : "Dark"} mode
    </button>
  );
}


