"use client";

import { type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function NavMain({
  items,
  onLinkClick,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
  onLinkClick?: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h2 className="text-muted-foreground/80 text-xs font-medium tracking-wider uppercase">
          UniTrack Platform
        </h2>
      </div>
      <div className="space-y-1">
        {items.map((item) => (
          <Button
            key={item.title}
            variant="ghost"
            asChild
            className={`group hover:bg-primary/10 hover:text-primary h-auto w-full justify-start px-3 py-2 transition-all duration-300 ${
              item.isActive ? "bg-primary/10 text-primary" : ""
            }`}
          >
            <a href={item.url} onClick={onLinkClick}>
              {item.icon && (
                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 mr-2 rounded-lg p-1.5 transition-all duration-300 group-hover:scale-110">
                  <item.icon className="h-4 w-4 group-hover:animate-pulse" />
                </div>
              )}
              <span className="group-hover:text-primary flex-1 text-left transition-colors duration-300">
                {item.title}
              </span>
            </a>
          </Button>
        ))}
      </div>
    </div>
  );
}
