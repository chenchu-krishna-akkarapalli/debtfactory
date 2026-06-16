"use client";

import { Moon, Sun } from "lucide-react";

/** Flip the theme class on <html> directly (and persist). Icon is CSS-driven. */
function toggleTheme(): void {
  const d = document.documentElement;
  const next = d.classList.contains("dark") ? "light" : "dark";
  d.classList.remove("light", "dark");
  d.classList.add(next);
  d.style.colorScheme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {
    /* ignore storage errors (private mode) */
  }
}

export function ThemeToggle() {
  return (
    <button
      type="button"
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className="flex size-8 items-center justify-center rounded-md border border-border bg-surface-2 text-fg-muted transition-colors hover:border-accent/40 hover:text-accent"
    >
      {/* Icon swaps via the .dark class (no JS theme read → no hydration flash). */}
      <Sun size={15} className="hidden dark:block" />
      <Moon size={15} className="block dark:hidden" />
    </button>
  );
}
