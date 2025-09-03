"use client";

import { Shield } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function AdminTeamSwitcher() {
  return (
    <Button
      variant="ghost"
      size="lg"
      className="group h-auto w-full cursor-default justify-start p-2 transition-all duration-300"
      disabled
    >
      <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg transition-all duration-300">
        <Shield className="size-4" />
      </div>
      <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">UniTrack Admin</span>
        <span className="text-muted-foreground truncate text-xs">
          Administrator Panel
        </span>
      </div>
    </Button>
  );
}
