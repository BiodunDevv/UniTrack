"use client";

import { Bell, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";

export function SiteHeader() {
  return (
    <header className="border-border/50 bg-background/50 flex h-16 shrink-0 items-center gap-2 border-b backdrop-blur-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="hover:bg-primary/10 hover:text-primary -ml-1 transition-all duration-300" />
        <Separator orientation="vertical" className="bg-border/50 mr-2 h-4" />
        <div className="flex items-center gap-2">
          <h1 className="from-foreground to-foreground dark:to-muted-foreground bg-linear-to-r bg-clip-text text-lg font-semibold text-transparent">
            UniTrack
          </h1>
          <Badge
            variant="outline"
            className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-xs transition-all duration-300"
          >
            Live
          </Badge>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-2 px-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search students, courses..."
            className="border-border/50 bg-card/50 focus:border-primary/20 focus:ring-primary/20 w-64 pl-8 backdrop-blur-sm transition-all duration-300"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 hover:text-primary relative transition-all duration-300 hover:scale-105"
        >
          <Bell className="h-4 w-4" />
          <Badge className="bg-primary text-primary-foreground absolute -top-1 -right-1 h-5 w-5 animate-pulse rounded-full p-0 text-xs">
            3
          </Badge>
        </Button>
      </div>
    </header>
  );
}
