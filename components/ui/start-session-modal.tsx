"use client";

import { Clock, Loader2,MapPin, Users } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Slider } from "./slider";

interface StartSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (params: {
    lat: number;
    lng: number;
    radius_m: number;
    duration_minutes: number;
  }) => Promise<void>;
  courseName: string;
}

export function StartSessionModal({
  isOpen,
  onClose,
  onStartSession,
  courseName,
}: StartSessionModalProps) {
  const [location, setLocation] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radius, setRadius] = React.useState(100);
  const [duration, setDuration] = React.useState(60);
  const [isLoading, setIsLoading] = React.useState(false);
  const [locationError, setLocationError] = React.useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = React.useState(false);

  const getLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError(`Location access denied: ${error.message}`);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      },
    );
  };

  const handleStartSession = async () => {
    if (!location) {
      setLocationError("Please get your location first");
      return;
    }

    setIsLoading(true);
    try {
      await onStartSession({
        lat: location.lat,
        lng: location.lng,
        radius_m: radius,
        duration_minutes: duration,
      });
      onClose();
    } catch (error) {
      console.error("Failed to start session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setLocation(null);
      setLocationError(null);
      setRadius(100);
      setDuration(60);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Start Attendance Session</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h4 className="mb-2 text-sm font-medium">Course</h4>
            <p className="text-muted-foreground text-sm">{courseName}</p>
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" />
              Location
            </h4>

            {!location && !locationError && (
              <Button
                onClick={getLocation}
                disabled={isGettingLocation}
                variant="outline"
                className="w-full"
              >
                {isGettingLocation ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Getting Location...
                  </>
                ) : (
                  <>
                    <MapPin className="mr-2 h-4 w-4" />
                    Get Current Location
                  </>
                )}
              </Button>
            )}

            {location && (
              <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✓ Location acquired: {location.lat.toFixed(6)},{" "}
                  {location.lng.toFixed(6)}
                </p>
              </div>
            )}

            {locationError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                <p className="text-sm text-red-700 dark:text-red-300">
                  {locationError}
                </p>
                <Button
                  onClick={getLocation}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            )}
          </div>

          {/* Radius Section */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Attendance Radius: {radius}m
            </h4>
            <Slider
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
              max={500}
              min={10}
              step={10}
              className="w-full"
            />
            <p className="text-muted-foreground text-xs">
              Students must be within {radius} meters to mark attendance
            </p>
          </div>

          {/* Duration Section */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Session Duration: {duration} minutes
            </h4>
            <Slider
              value={[duration]}
              onValueChange={(value) => setDuration(value[0])}
              max={180}
              min={5}
              step={5}
              className="w-full"
            />
            <p className="text-muted-foreground text-xs">
              Session will automatically end after {duration} minutes
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={!location || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting...
                </>
              ) : (
                "Start Session"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
