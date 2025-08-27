"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

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
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <div>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="group hover:bg-primary/10 hover:text-primary data-[state=open]:bg-primary/10 data-[state=open]:text-primary h-auto w-full justify-start px-3 py-2 transition-all duration-300"
                >
                  {item.icon && (
                    <div className="bg-primary/10 text-primary group-hover:bg-primary/20 mr-2 rounded-lg p-1.5 transition-all duration-300 group-hover:scale-110">
                      <item.icon className="h-4 w-4 group-hover:animate-pulse" />
                    </div>
                  )}
                  <span className="group-hover:text-primary flex-1 text-left transition-colors duration-300">
                    {item.title}
                  </span>
                  <ChevronRight className="group-hover:text-primary ml-auto h-4 w-4 transition-transform duration-300 group-data-[state=open]/collapsible:rotate-90" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-1 ml-6 space-y-1">
                  {item.items?.map((subItem) => (
                    <Button
                      key={subItem.title}
                      variant="ghost"
                      asChild
                      className="hover:bg-primary/5 hover:text-primary h-auto w-full justify-start px-3 py-1.5 text-sm transition-all duration-300 hover:translate-x-1"
                    >
                      <a href={subItem.url} onClick={onLinkClick}>
                        <span>{subItem.title}</span>
                      </a>
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </div>
    </div>
  );
}
