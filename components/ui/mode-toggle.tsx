"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { useEffect, useState } from "react";

import { Button } from "./button";

export function ModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder button to prevent layout shift
    return (
      <Button variant="ghost" size="icon" className="opacity-0">
        <MoonIcon className="size-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="hover:bg-accent transition-colors duration-200"
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {isDark ? (
        <SunIcon className="size-4 scale-100 rotate-0 transition-transform duration-200" />
      ) : (
        <MoonIcon className="size-4 scale-100 rotate-0 transition-transform duration-200" />
      )}
    </Button>
  );
}
