"use client";

import { Menu } from "lucide-react";
import { ReactNode, useEffect, useState } from "react";

import { cn } from "@/lib/utils";

import UniTrack from "../logos/unitrack";
import { Button, type ButtonProps } from "../ui/button";
import { ModeToggle } from "../ui/mode-toggle";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "../ui/sheet";

interface NavbarLink {
  text: string;
  href: string;
}

interface NavbarActionProps {
  text: string;
  href: string;
  variant?: ButtonProps["variant"];
  icon?: ReactNode;
  iconRight?: ReactNode;
  isButton?: boolean;
}

interface NavBarProps {
  className?: string;
}

export default function NavBar({ className }: NavBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 50); // Show effect after scrolling 50px
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLinkClick = () => {
    setIsSidebarOpen(false);
  };

  const mobileLinks: NavbarLink[] = [
    { text: "Features", href: "#features" },
    { text: "How it Works", href: "#workflow" },
    { text: "Technology", href: "#technology" },
    { text: "FAQ", href: "#faq" },
  ];

  const actions: NavbarActionProps[] = [
    { text: "Get Started", href: "/auth/signup", isButton: true },
  ];

  return (
    <header className={cn("fixed top-0 right-0 left-0 z-50 p-4", className)}>
      <div className="mx-auto max-w-7xl">
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl border border-transparent px-4 py-3 transition-all duration-300 ease-out",
            isScrolled
              ? "bg-background/40 border-border/50 shadow-lg shadow-black/5 backdrop-blur-2xl"
              : "bg-transparent",
          )}
        >
          {/* Left section - Logo and Navigation */}
          <div className="flex items-center gap-8">
            <a href="#" className="flex items-center gap-2 text-xl font-bold">
              <UniTrack />
              UniTrack
            </a>
            <nav className="hidden items-center gap-6 md:flex">
              <a
                href="#features"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200 hover:scale-105"
              >
                Features
              </a>
              <a
                href="#workflow"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200 hover:scale-105"
              >
                How it Works
              </a>
              <a
                href="#technology"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200 hover:scale-105"
              >
                Technology
              </a>
              <a
                href="#faq"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors duration-200 hover:scale-105"
              >
                FAQ
              </a>
            </nav>
          </div>

          {/* Right section - Actions and Theme Toggle */}
          <div className="flex items-center gap-3">
            {actions.map((action, index) =>
              action.isButton ? (
                <Button
                  key={index}
                  variant={action.variant || "default"}
                  asChild
                  className="hidden transition-transform duration-200 hover:scale-105 md:inline-flex"
                  size="sm"
                >
                  <a href={action.href}>
                    {action.icon}
                    {action.text}
                    {action.iconRight}
                  </a>
                </Button>
              ) : (
                <a
                  key={index}
                  href={action.href}
                  className="text-muted-foreground hover:text-foreground hidden text-sm transition-colors md:block"
                >
                  {action.text}
                </a>
              ),
            )}
            <ModeToggle />

            {/* Mobile Menu */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 transition-transform duration-200 hover:scale-105 md:hidden"
                >
                  <Menu className="size-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="border-border/50 bg-background/95 backdrop-blur-xl"
              >
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex h-full flex-col">
                  {/* Header */}
                  <div className="border-border/20 mb-8 border-b pb-6">
                    <a
                      href="#"
                      onClick={handleLinkClick}
                      className="hover:text-primary flex items-center gap-3 text-xl font-bold transition-colors"
                    >
                      <UniTrack />
                      <span>UniTrack</span>
                    </a>
                  </div>

                  {/* Navigation Links */}
                  <div className="flex-1 space-y-2">
                    {mobileLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.href}
                        onClick={handleLinkClick}
                        className="group text-muted-foreground hover:bg-primary/10 hover:text-foreground relative flex items-center rounded-lg px-4 py-3 text-lg font-medium transition-all duration-300 hover:translate-x-1"
                      >
                        <span className="relative z-10">{link.text}</span>
                        <div className="from-primary/5 absolute inset-0 rounded-lg bg-gradient-to-r to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      </a>
                    ))}
                  </div>

                  {/* Footer Section */}
                  <div className="border-border/20 space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground text-sm font-medium">
                        Theme Mode
                      </span>
                      <ModeToggle />
                    </div>
                    <Button
                      variant="default"
                      asChild
                      className="from-primary to-primary/80 w-full bg-gradient-to-r shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                      onClick={handleLinkClick}
                    >
                      <a href="/auth/signup">Get Started</a>
                    </Button>
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
