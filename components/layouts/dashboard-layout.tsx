"use client";

import {
  ChevronRight,
  HelpCircle,
  LogOut,
  Moon,
  PanelRightOpen,
  Sun,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ReactNode, useState } from "react";
import { toast } from "sonner";

import { AuthGuard } from "@/components/AuthGuard";
import { CustomSidebar } from "@/components/SideBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Glow from "@/components/ui/glow";
import { NetworkStatus } from "@/components/ui/network-status";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useAuthStore } from "@/store/auth-store";

import UniTrack from "../logos/unitrack";
import { ModeToggle } from "../ui/mode-toggle";

interface DashboardLayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function DashboardLayout({
  children,
  requireAuth = true,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const handleLogout = async () => {
    // Close the settings modal first
    setSettingsOpen(false);

    try {
      // Show loading toast
      const loadingToast = toast.loading("Signing out...");

      await logout();

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
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

      {/* Network Status - Only show on protected routes */}
      <NetworkStatus />

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
        <header className="sticky top-0 z-30 p-2 sm:p-4">
          <div className="mx-auto max-w-full">
            <div className="bg-background/40 border-border/50 flex h-14 items-center justify-between rounded-2xl border px-3 shadow-lg shadow-black/5 backdrop-blur-2xl transition-all duration-300 ease-out sm:h-16 sm:px-4 lg:px-6">
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="hover:bg-accent/50 p-2 transition-transform duration-200 hover:scale-105"
                >
                  <PanelRightOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
                <Separator
                  orientation="vertical"
                  className="bg-border/50 hidden h-6 sm:block"
                />
                <div className="flex items-center gap-1 sm:gap-2">
                  <Link
                    href="/"
                    className="hover:text-primary flex items-center gap-1 text-lg font-bold transition-colors duration-200 sm:gap-2 sm:text-xl"
                  >
                    <UniTrack />
                    <span>UniTrack</span>
                  </Link>
                  <Badge
                    variant="outline"
                    className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 hidden text-xs transition-all duration-300 hover:scale-105 sm:inline-flex"
                  >
                    {user?.role === "admin" ? "Admin" : "Lecturer"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <ModeToggle />
                {/* User Avatar */}
                <Button
                  variant="ghost"
                  onClick={() => setSettingsOpen(true)}
                  className="hover:bg-accent/50 flex items-center gap-1 rounded-full p-1 transition-all duration-200 hover:scale-105 sm:gap-2"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronRight className="text-muted-foreground h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Settings Sidebar */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetContent
            side="right"
            className="border-border/50 bg-background/95 w-[85vw] max-w-sm p-0 backdrop-blur-xl"
          >
            <SheetTitle className="sr-only">Settings Menu</SheetTitle>
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="border-border/20 flex items-center justify-between border-b p-6">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("") || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">
                      {user?.name || "User"}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {user?.email || "user@example.com"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-6">
                  {/* Theme Section */}
                  <div className="space-y-3">
                    <h3 className="text-foreground text-sm font-medium">
                      Appearance
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={theme === "light" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("light")}
                        className="flex h-auto flex-col gap-1 py-3 transition-all duration-200"
                      >
                        <Sun className="h-4 w-4" />
                        <span className="text-xs">Light</span>
                      </Button>
                      <Button
                        variant={theme === "dark" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setTheme("dark")}
                        className="flex h-auto flex-col gap-1 py-3 transition-all duration-200"
                      >
                        <Moon className="h-4 w-4" />
                        <span className="text-xs">Dark</span>
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* User Role Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Role</span>
                    <Badge
                      variant="outline"
                      className="border-primary/20 bg-primary/5 text-primary"
                    >
                      {user?.role === "admin" ? "Admin" : "Lecturer"}
                    </Badge>
                  </div>

                  <Separator />

                  {/* Menu Items */}
                  <div className="space-y-1">
                    <Button
                      variant="ghost"
                      className="hover:bg-accent/50 w-full justify-start transition-colors duration-200"
                      onClick={() => {
                        setSettingsOpen(false);
                        router.push("/profile");
                      }}
                    >
                      <User className="mr-3 h-4 w-4" />
                      Profile Settings
                    </Button>

                    <Button
                      variant="ghost"
                      className="hover:bg-accent/50 w-full justify-start transition-colors duration-200"
                      onClick={() => {
                        setSettingsOpen(false);
                        router.push("/help");
                      }}
                    >
                      <HelpCircle className="mr-3 h-4 w-4" />
                      Help & Support
                    </Button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-border/20 border-t p-6">
                <Button
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full transition-all duration-200 hover:scale-[1.02]"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

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
