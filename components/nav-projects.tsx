"use client";

import {
  Folder,
  MoreHorizontal,
  Share,
  Trash2,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function NavProjects({
  projects,
  onLinkClick,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
  onLinkClick?: () => void;
}) {
  return (
    <div className="space-y-1">
      <div className="px-3 py-2">
        <h2 className="text-muted-foreground/80 text-xs font-medium tracking-wider uppercase">
          Quick Actions
        </h2>
      </div>
      <div className="space-y-1">
        {projects.map((item) => (
          <div key={item.name} className="group flex items-center">
            <Button
              variant="ghost"
              asChild
              className="hover:bg-primary/10 hover:text-primary h-auto flex-1 justify-start px-3 py-2 transition-all duration-300"
            >
              <a href={item.url} onClick={onLinkClick}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.name}</span>
              </a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-primary/10 h-8 w-8 p-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">More</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side="right"
                align="start"
              >
                <DropdownMenuItem>
                  <Folder className="text-muted-foreground mr-2 h-4 w-4" />
                  <span>View Details</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Share className="text-muted-foreground mr-2 h-4 w-4" />
                  <span>Share</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ))}
      </div>
    </div>
  );
}
