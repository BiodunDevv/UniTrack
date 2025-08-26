"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="data-[state=open]:bg-primary/10 data-[state=open]:text-primary hover:bg-primary/10 hover:text-primary group h-auto w-full justify-start p-2 transition-all duration-300"
        >
          <div className="bg-primary text-primary-foreground group-hover:bg-primary/90 flex aspect-square size-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110">
            <activeTeam.logo className="size-4 group-hover:animate-pulse" />
          </div>
          <div className="ml-2 grid flex-1 text-left text-sm leading-tight">
            <span className="group-hover:text-primary truncate font-semibold transition-colors duration-300">
              {activeTeam.name}
            </span>
            <span className="text-muted-foreground group-hover:text-primary/70 truncate text-xs transition-colors duration-300">
              {activeTeam.plan}
            </span>
          </div>
          <ChevronsUpDown className="text-muted-foreground group-hover:text-primary ml-auto size-4 transition-colors duration-300" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="border-border/50 bg-card/95 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg backdrop-blur-sm"
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <DropdownMenuLabel className="text-muted-foreground text-xs">
          Departments
        </DropdownMenuLabel>
        {teams.map((team, index) => (
          <DropdownMenuItem
            key={team.name}
            onClick={() => setActiveTeam(team)}
            className="hover:bg-primary/10 hover:text-primary group gap-2 p-2 transition-all duration-300"
          >
            <div className="border-border/50 bg-primary/10 text-primary group-hover:bg-primary/20 flex size-6 items-center justify-center rounded-sm border transition-all duration-300">
              <team.logo className="size-4 shrink-0" />
            </div>
            <span className="group-hover:text-primary font-medium transition-colors duration-300">
              {team.name}
            </span>
            <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem className="hover:bg-primary/10 hover:text-primary group gap-2 p-2 transition-all duration-300">
          <div className="border-border/50 group-hover:border-primary/50 flex size-6 items-center justify-center rounded-md border border-dashed bg-transparent transition-all duration-300">
            <Plus className="text-muted-foreground group-hover:text-primary size-4 transition-colors duration-300" />
          </div>
          <div className="text-muted-foreground group-hover:text-primary font-medium transition-colors duration-300">
            Add Department
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
