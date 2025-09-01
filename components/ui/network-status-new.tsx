"use client";

import { AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NetworkStatusProps {
  className?: string;
}

export function NetworkStatus({ className }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineAlert(false);
      setReconnectAttempts(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineAlert(true);
    };

    // Add event listeners
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Additional connectivity check using fetch
    const checkConnectivity = async () => {
      try {
        // Try to fetch a small resource to verify actual connectivity
        await fetch("/favicon.svg", {
          method: "HEAD",
          cache: "no-cache",
        });
        if (!isOnline) {
          handleOnline();
        }
      } catch {
        if (isOnline) {
          handleOffline();
        }
      }
    };

    // Check connectivity every 30 seconds
    const connectivityInterval = setInterval(checkConnectivity, 30000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(connectivityInterval);
    };
  }, [isOnline]);

  const handleRetryConnection = async () => {
    setReconnectAttempts((prev) => prev + 1);
    try {
      await fetch("/favicon.svg", {
        method: "HEAD",
        cache: "no-cache",
      });
      setIsOnline(true);
      setShowOfflineAlert(false);
      setReconnectAttempts(0);
    } catch {
      // Connection still failed
    }
  };

  if (!showOfflineAlert) {
    return null;
  }

  return (
    <div
      className={`fixed top-20 left-1/2 z-50 w-full max-w-md -translate-x-1/2 transform px-4 ${className}`}
    >
      <Card className="animate-in slide-in-from-top-2 border-red-200 bg-red-50 text-red-800 backdrop-blur-sm duration-300 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        <CardContent className="p-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-red-100 p-1.5 text-red-600 dark:bg-red-900 dark:text-red-400">
                  <WifiOff className="h-4 w-4" />
                </div>
                <span className="font-medium">No Internet Connection</span>
              </div>
              <Badge variant="destructive" className="text-xs">
                Offline
              </Badge>
            </div>

            <p className="text-sm text-red-600 dark:text-red-300">
              You&apos;re currently offline. Some features may not work properly.
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-200 dark:bg-red-800">
                  <AlertTriangle className="h-3 w-3" />
                </div>
                <span className="text-xs">Connection lost</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetryConnection}
                className="h-8 border-red-300 bg-red-100 text-xs text-red-700 hover:bg-red-200 dark:border-red-700 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
              >
                <Wifi className="mr-1 h-3 w-3" />
                Retry
                {reconnectAttempts > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 text-xs">
                    {reconnectAttempts}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
