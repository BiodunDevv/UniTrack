"use client";

import { useEffect, useState } from "react";

interface PageLoaderProps {
  children: React.ReactNode;
  minLoadTime?: number;
}

export default function PageLoader({
  children,
  minLoadTime = 1000,
}: PageLoaderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated after first render
    setIsHydrated(true);

    // Show loading for all users
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadTime);

    return () => clearTimeout(timer);
  }, [minLoadTime]);

  // Show loading before hydration is complete or during loading time
  if (isLoading || !isHydrated) {
    return (
      <div className="bg-background text-foreground flex min-h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <div className="text-center">
            <h2 className="text-lg font-semibold">Loading UniTrack</h2>
            <p className="text-muted-foreground text-sm">
              Preparing your attendance management system...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
