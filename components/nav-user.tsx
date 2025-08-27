"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth-store";

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
  };
}) {
  const { user: authUser } = useAuthStore();

  // Use authenticated user data if available, fallback to props
  const displayUser = {
    name: authUser?.name || user.name,
    email: authUser?.email || user.email,
  };

  return (
    <div className="p-2">
      <div className="flex items-center gap-3 rounded-lg px-3 py-2">
        <Avatar className="h-8 w-8 rounded-lg">
          <AvatarFallback className="rounded-lg">
            {displayUser.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-1 flex-col text-left text-sm leading-tight">
          <span className="truncate font-semibold">{displayUser.name}</span>
          <span className="text-muted-foreground truncate text-xs">
            {displayUser.email}
          </span>
        </div>
      </div>
    </div>
  );
}
