"use client";

import { ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
    id?: string;
    url?: string;
  }[];
}) {
  const router = useRouter();

  // Always show the first team as active, but handle special states
  const getActiveTeam = React.useCallback(() => {
    const firstTeam = teams[0];

    // If it's a special state (loading, no courses), show it
    if (firstTeam?.id === "loading" || firstTeam?.id === "no-courses") {
      return firstTeam;
    }

    // If we have actual courses, show the first one
    if (teams.length > 0) {
      return firstTeam;
    }

    // Fallback
    return {
      name: "UniTrack",
      logo: teams[0]?.logo || ChevronsUpDown,
      plan: "Select a course",
    };
  }, [teams]);

  const [activeTeam, setActiveTeam] = React.useState(getActiveTeam());

  // Update active team when teams change
  React.useEffect(() => {
    setActiveTeam(getActiveTeam());
  }, [teams, getActiveTeam]);

  const handleTeamClick = (team: (typeof teams)[0]) => {
    // Don't update active team for special actions
    if (
      team.id !== "no-courses" &&
      team.id !== "loading" &&
      team.id !== "view-all"
    ) {
      setActiveTeam(team);
    }

    // Handle special cases
    if (team.id === "no-courses") {
      router.push("/course/create");
      return;
    }

    if (team.id === "loading") {
      return; // Don't navigate while loading
    }

    if (team.url) {
      router.push(team.url);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="lg"
          className="data-[state=open]:bg-primary/10 data-[state=open]:text-primary hover:bg-primary/10 hover:text-primary group h-auto w-full justify-start p-2 transition-all duration-300"
        >
          <div
            className={`flex aspect-square size-8 items-center justify-center rounded-lg transition-all duration-300 group-hover:scale-110 ${
              activeTeam.id === "no-courses"
                ? "from-primary/20 to-primary/10 text-primary border-primary/20 border bg-gradient-to-br"
                : "bg-primary text-primary-foreground group-hover:bg-primary/90"
            }`}
          >
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
          {teams[0]?.id === "no-courses"
            ? "Quick Actions"
            : teams[0]?.id === "loading"
              ? "Loading Courses..."
              : teams.length > 1
                ? "Your Courses"
                : "Course"}
        </DropdownMenuLabel>
        {teams.map((team, index) => (
          <DropdownMenuItem
            key={team.id || team.name}
            onClick={() => handleTeamClick(team)}
            disabled={team.id === "loading"}
            className={`hover:bg-primary/10 hover:text-primary group gap-2 p-2 transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 ${
              team.id === "view-all" ? "border-border/50 mt-1 border-t" : ""
            }`}
          >
            <div className="border-border/50 bg-primary/10 text-primary group-hover:bg-primary/20 flex size-6 items-center justify-center rounded-sm border transition-all duration-300">
              <team.logo className="size-4 shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="group-hover:text-primary block truncate font-medium transition-colors duration-300">
                {team.name}
              </span>
              {team.plan && (
                <span className="text-muted-foreground block truncate text-xs">
                  {team.plan}
                </span>
              )}
            </div>
            {team.id !== "no-courses" &&
              team.id !== "loading" &&
              team.id !== "view-all" && (
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem
          onClick={() => router.push("/course/create")}
          className="hover:bg-primary/10 hover:text-primary group gap-2 p-2 transition-all duration-300"
        >
          <div className="border-border/50 group-hover:border-primary/50 flex size-6 items-center justify-center rounded-md border border-dashed bg-transparent transition-all duration-300">
            <Plus className="text-muted-foreground group-hover:text-primary size-4 transition-colors duration-300" />
          </div>
          <div className="flex-1">
            <div className="text-muted-foreground group-hover:text-primary font-medium transition-colors duration-300">
              Create New Course
            </div>
            <div className="text-muted-foreground/70 text-xs">
              Add a new course to get started
            </div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
