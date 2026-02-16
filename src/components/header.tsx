"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Hydration safety: prevent flash of incorrect theme icon
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            className="text-green-600 dark:text-green-400"
          >
            <path
              d="M14 2L3 8v12l11 6 11-6V8L14 2z"
              fill="currentColor"
              opacity="0.15"
            />
            <path
              d="M14 2L3 8v12l11 6 11-6V8L14 2z"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M9 14l3 3 7-7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-lg font-bold tracking-tight">SafetyScore</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Home
          </Link>
          <Link
            href="/compare"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Compare
          </Link>
          <Link
            href="/quiz"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Quiz
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Methodology
          </Link>
          <Link
            href="/changelog"
            className="text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            Changelog
          </Link>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 text-muted transition-colors hover:bg-muted-bg hover:text-foreground"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
