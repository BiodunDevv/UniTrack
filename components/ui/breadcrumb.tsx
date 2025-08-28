"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav
      className={cn("hidden items-center space-x-2 text-sm md:flex", className)}
      aria-label="Breadcrumb"
    >
      <Link
        href="/dashboard"
        className="text-muted-foreground hover:text-foreground flex items-center transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="sr-only">Dashboard</span>
      </Link>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="text-muted-foreground h-4 w-4" />
          {item.href && !item.current ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={cn(
                "font-medium",
                item.current ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
