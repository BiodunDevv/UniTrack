"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        router.push("/auth/signin");
      }
      // Remove the automatic redirect to dashboard for authenticated users on auth pages
      // Let the individual auth pages handle their own redirects
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Don't show loading screen for auth pages - let them handle their own loading
  if (isLoading && requireAuth) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated && !isLoading) {
    return null;
  }

  return <>{children}</>;
}
