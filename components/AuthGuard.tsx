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

  // Debug logging
  useEffect(() => {
    console.log("AuthGuard state:", {
      requireAuth,
      isAuthenticated,
      isLoading,
      path: window.location.pathname,
    });
  }, [requireAuth, isAuthenticated, isLoading]);

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        console.log("AuthGuard: Redirecting to signin - not authenticated");
        router.push("/auth/signin");
      }
      // Remove the automatic redirect to dashboard for authenticated users on auth pages
      // Let the individual auth pages handle their own redirects
    }
  }, [isAuthenticated, isLoading, requireAuth, router]);

  // Don't show loading screen for auth pages - let them handle their own loading
  if (isLoading && requireAuth) {
    console.log("AuthGuard: Showing loading screen");
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // If auth is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated && !isLoading) {
    console.log("AuthGuard: Not rendering children - not authenticated");
    return null;
  }

  console.log("AuthGuard: Rendering children");
  return <>{children}</>;
}
