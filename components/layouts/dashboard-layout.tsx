"use client";

import {
  Bell,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LogOut,
  PanelRight,
  Search,
  Settings,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

import { AuthGuard } from "@/components/auth-guard";
import { CustomSidebar } from "@/components/custom-sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Glow from "@/components/ui/glow";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { useAuthStore } from "@/store/auth-store";

interface DashboardLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function DashboardLayout({
  children,
  requireAuth = true,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      router.push("/auth/signin");
    } catch {
      toast.error("Failed to logout");
    }
  };

  const content = (
    <div className="from-background via-background to-muted/20 relative min-h-screen bg-gradient-to-br">
      {/* Background Glow Effect */}
      <Glow
        variant="above"
        className="animate-appear-zoom fixed -top-32 left-1/2 z-0 -translate-x-1/2 opacity-0 delay-1000 [&>div]:opacity-15 [&>div]:dark:opacity-60"
      />

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-card/90 border-border/50 fixed top-0 left-0 z-50 h-full w-full max-w-[90vw] transform border-r backdrop-blur-xl transition-transform duration-300 ease-out sm:w-80 sm:max-w-[400px] md:w-72 md:max-w-[350px] lg:w-64 lg:max-w-[280px] xl:w-72 xl:max-w-[320px] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <CustomSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Header */}
        <header className="border-border/50 bg-card/60 sticky top-0 z-30 border-b backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-accent/50"
              >
                <PanelRight className="h-5 w-5" />
              </Button>
              <Separator orientation="vertical" className="bg-border/50 h-6" />
              <div className="flex items-center gap-2">
                <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-lg font-semibold text-transparent">
                  UniTrack
                </h1>
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-xs transition-all duration-300"
                >
                  {user?.role === "admin" ? "Admin" : "Lecturer"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search students, records..."
                  className="border-border/50 bg-background/50 focus:bg-background/80 w-64 pl-9 transition-all duration-300"
                />
              </div>
              <ModeToggle />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hover:bg-accent/50 flex items-center gap-2 rounded-full p-1 transition-all duration-200"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="text-muted-foreground h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="border-border/50 bg-card/95 w-56 backdrop-blur-xl"
                >
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {user?.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("") || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {user?.name || "User"}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {user?.email || "user@example.com"}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="hover:bg-accent/50 cursor-pointer transition-colors duration-200">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-accent/50 cursor-pointer transition-colors duration-200">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-accent/50 cursor-pointer transition-colors duration-200">
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Billing</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-accent/50 cursor-pointer transition-colors duration-200">
                    <Bell className="mr-2 h-4 w-4" />
                    <span>Notifications</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="hover:bg-accent/50 cursor-pointer transition-colors duration-200">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer transition-colors duration-200"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative z-10">{children}</main>
      </div>
    </div>
  );

  if (requireAuth) {
    return <AuthGuard requireAuth={true}>{content}</AuthGuard>;
  }

  return content;
}
