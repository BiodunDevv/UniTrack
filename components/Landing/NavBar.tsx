"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

import UniTrack from "../logos/unitrack";

const navigation = [
  { name: "Features", href: "#features" },
  { name: "How it Works", href: "#workflow" },
  { name: "Technology", href: "#technology" },
  { name: "FAQ", href: "#faq" },
];

interface NavBarProps {
  className?: string;
}

export default function NavBar({ className }: NavBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-lg"
          : "bg-transparent",
        className
      )}
    >
      <nav className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-bold">
            <div className="flex items-center gap-2">
              <UniTrack />
              <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                UniTrack
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-all duration-300 hover:text-primary focus:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-sm px-2 py-1",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Get Started Button for Desktop */}
            <Button
              asChild
              className="hidden md:inline-flex transition-transform duration-200 hover:scale-105"
              size="sm"
            >
              <Link href="/auth/signup">Get Started</Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Menu className="h-4 w-4 relative z-10 transition-transform group-hover:scale-110" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] xs:w-[320px] sm:w-[380px] md:w-[400px] bg-background/95 backdrop-blur-xl border-l border-border/50 flex flex-col"
              >
                {/* Header Section */}
                <div className="flex flex-col items-center pt-6 sm:pt-8 pb-4 sm:pb-6 border-b border-border/30 shrink-0">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mb-3 sm:mb-4"
                  >
                    <UniTrack className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                  </motion.div>
                  <motion.h3
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="text-base sm:text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent"
                  >
                    UniTrack System
                  </motion.h3>
                  <motion.p
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="text-xs sm:text-sm text-muted-foreground text-center px-2"
                  >
                    Smart Attendance Management
                  </motion.p>
                </div>

                {/* Navigation Links */}
                <nav className="flex flex-col py-4 sm:py-6 flex-1 overflow-y-auto">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ x: 30, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * (index + 1) }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "group flex items-center justify-between p-3 sm:p-4 rounded-lg mb-1 sm:mb-2 transition-all duration-300 hover:bg-primary/5 hover:translate-x-2 active:scale-95",
                          pathname === item.href
                            ? "bg-gradient-to-r from-primary/10 to-purple-600/5 text-primary border-l-4 border-primary"
                            : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        <span className="text-base sm:text-lg font-medium">
                          {item.name}
                        </span>
                        <motion.div
                          className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100"
                          whileHover={{ scale: 1.2 }}
                          transition={{ duration: 0.2 }}
                        />
                      </Link>
                    </motion.div>
                  ))}

                  {/* Get Started Link with Special Styling */}
                  <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                    className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border/30"
                  >
                    <Link
                      href="/auth/signup"
                      onClick={() => setIsOpen(false)}
                      className="group flex items-center justify-between p-3 sm:p-4 rounded-lg transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-purple-600/10 hover:translate-x-2 active:scale-95 text-muted-foreground hover:text-primary"
                    >
                      <div className="flex items-center">
                        <span className="text-base sm:text-lg font-medium">
                          Get Started
                        </span>
                        <motion.span
                          className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded-full"
                          whileHover={{ scale: 1.05 }}
                        >
                          Free
                        </motion.span>
                      </div>
                      <motion.div
                        className="w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.2 }}
                      />
                    </Link>
                  </motion.div>
                </nav>

                {/* Footer Section */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="shrink-0 p-4 sm:p-6"
                >
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground mb-2 px-2">
                      Streamline your attendance management
                    </p>
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                  </div>
                </motion.div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
