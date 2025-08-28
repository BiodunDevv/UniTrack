"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

import UniTrack from "@/components/logos/unitrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Glow from "@/components/ui/glow";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  badgeText?: string;
  showBackButton?: boolean;
  backHref?: string;
  backText?: string;
  maxWidth?: "sm" | "md" | "lg";
}

export function AuthLayout({
  children,
  title,
  subtitle,
  badgeText = "UniTrack",
  showBackButton = true,
  backHref = "/",
  backText = "Back to home",
  maxWidth = "md",
}: AuthLayoutProps) {
  const router = useRouter();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
  };

  const handleBackClick = () => {
    if (backHref === "back") {
      router.back();
    } else {
      router.push(backHref);
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background Glow Effect */}
      <div className="absolute inset-0 z-0">
        <Glow
          variant="bottom"
        className="animate-appear-zoom fixed bottom-50 left-1/2 z-0 -translate-x-1/2 opacity-0 delay-1000 [&>div]:opacity-15 [&>div]:dark:opacity-60"
        />
      </div>

      {/* Back Button - Fixed Position */}
      {showBackButton && (
        <div className="fixed top-6 left-6 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="hover:bg-background/80 bg-background/60 backdrop-blur-sm transition-all duration-200 hover:scale-105"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            {backText === "← Back to home" ? "Back" : backText}
          </Button>
        </div>
      )}

      {/* Content Container */}
      <div className="relative z-10 w-full">
        <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]}`}>
          {/* Header */}
          <div className="animate-fade-in mb-8 text-center">
            <Badge variant="outline" className="mb-4">
              <UniTrack className="mr-2 size-4" />
              <span className="text-muted-foreground">{badgeText}</span>
            </Badge>

            <h1 className="from-foreground to-foreground/80 mb-2 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              {title}
            </h1>

            <p className="text-muted-foreground text-sm">{subtitle}</p>
          </div>

          {/* Form Card */}
          <Card className="animate-fade-in border-border/50 bg-background/80 p-6 backdrop-blur-sm">
            {children}
          </Card>

          {/* Navigation Links */}
          <div className="animate-fade-in mt-6 text-center">
            <AuthNavigation />
          </div>
        </div>
      </div>
    </div>
  );
}

// Navigation component for common auth links
function AuthNavigation() {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        <Link
          href="/auth/signin"
          className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
        >
          Sign In
        </Link>
        <div className="text-muted-foreground">•</div>
        <Link
          href="/auth/signup"
          className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
        >
          Sign Up
        </Link>
        <div className="text-muted-foreground">•</div>
        <Link
          href="/auth/forgot-password"
          className="text-muted-foreground hover:text-foreground transition-colors hover:underline"
        >
          Forgot Password
        </Link>
      </div>
    </div>
  );
}
