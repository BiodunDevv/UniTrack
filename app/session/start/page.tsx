"use client";

import {
  ArrowLeft,
  Clock,
  Loader2,
  MapPin,
  Play,
  Settings,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Suspense, useState } from "react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useCourseStore } from "@/store/course-store";

function StartSessionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const courseName = searchParams.get("courseName") || "Course";

  const { startAttendanceSession } = useCourseStore();

  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [radius, setRadius] = useState(100);
  const [duration, setDuration] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);


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
        maximumAge: 300000,
      },
    );
  };

  const handleStartSession = async () => {
    if (!location) {
      setLocationError("Please get your location first");
      return;
    }

    if (!courseId) {
      toast.error("Course ID is missing");
      return;
    }

    setIsLoading(true);
    try {
      const loadingToast = toast.loading("Starting attendance session...");

      await startAttendanceSession(courseId, {
        lat: location.lat,
        lng: location.lng,
        radius_m: radius,
        duration_minutes: duration,
      });

      toast.dismiss(loadingToast);
      toast.success("Session started successfully!", {
        description: "Students can now mark their attendance.",
      });

      // Navigate back to course details page on success
      router.push(`/course/${courseId}`);
    } catch (error) {
      console.error("Failed to start session:", error);
      toast.error("Failed to start session", {
        description:
          "Please try again or contact support if the issue persists.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (courseId) {
      router.push(`/course/${courseId}`);
    } else {
      router.push("/dashboard");
    }
  };

  // Remove auto-get location on page load
  // React.useEffect(() => {
  //   getLocation();
  // }, []);

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Breadcrumb */}
        <div className="animate-appear ml-2 opacity-0">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Course", href: `/course/${courseId}` },
              { label: "Start Session", current: true },
            ]}
          />
        </div>

        <div className="flex flex-wrap gap-4 md:hidden">
          <Button variant="outline" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Course
          </Button>
        </div>

        {/* Hero Section */}
        <div className="animate-appear from-primary/10 via-primary/5 rounded-lg bg-gradient-to-r to-transparent p-4 opacity-0 delay-100 sm:p-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
              Start Attendance Session
            </h1>
            <p className="text-muted-foreground text-md mb-6">
              Configure and start a new attendance session for{" "}
              <strong>{courseName}</strong>. Set the location, radius, and
              duration for optimal attendance tracking.
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course</CardTitle>
              <Settings className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="truncate text-lg font-bold">{courseName}</div>
              <p className="text-muted-foreground text-xs">Selected Course</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Radius</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{radius}m</div>
              <p className="text-muted-foreground text-xs">Attendance Range</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Duration</CardTitle>
              <Clock className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{duration}min</div>
              <p className="text-muted-foreground text-xs">Session Length</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location</CardTitle>
              <MapPin className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {location ? "Set" : "Required"}
              </div>
              <p className="text-muted-foreground text-xs">
                {location ? "GPS Coordinates" : "Not Set"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="animate-appear opacity-0 delay-300">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Configuration Panel */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle>Session Configuration</CardTitle>
                  <CardDescription>
                    Set up the parameters for your attendance session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Location Section */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="h-4 w-4" />
                      Location Settings
                    </h4>

                    {!location && !locationError && (
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-sm">
                          Get your current location to set the attendance area.
                        </p>
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
                      </div>
                    )}

                    {location && (
                      <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-950">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-green-700 dark:text-green-300">
                              ✓ Location Set
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {location.lat.toFixed(6)},{" "}
                              {location.lng.toFixed(6)}
                            </p>
                          </div>
                          <Button
                            onClick={getLocation}
                            size="sm"
                            variant="ghost"
                            className="text-green-700 hover:text-green-800"
                          >
                            <MapPin className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {locationError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-950">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">
                              Location Error
                            </p>
                            <p className="text-xs text-red-600 dark:text-red-400">
                              {locationError}
                            </p>
                          </div>
                          <Button
                            onClick={getLocation}
                            size="sm"
                            variant="outline"
                            className="border-red-200 text-red-700 hover:bg-red-100"
                          >
                            Try Again
                          </Button>
                        </div>
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
                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      onClick={handleStartSession}
                      disabled={!location || isLoading}
                      className="w-full"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Starting Session...
                        </>
                      ) : (
                        <>
                          <Play className="mr-2 h-4 w-4" />
                          Start Attendance Session
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="w-full"
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map Preview Panel */}
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle>Location Preview</CardTitle>
                  <CardDescription>
                    Visual representation of the attendance area
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {location ? (
                    <div className="space-y-4">
                      <div className="overflow-hidden rounded-lg border">
                        <iframe
                          src={`https://maps.google.com/maps?q=${location.lat},${location.lng}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                          width="100%"
                          height="400"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Session Location Preview"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-[400px] flex-col items-center justify-center text-center">
                      <MapPin className="text-muted-foreground mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-medium">
                        No Location Set
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-sm">
                        Please acquire your location to see the map preview and
                        start the session
                      </p>
                      {!isGettingLocation && (
                        <Button onClick={getLocation} variant="outline">
                          <MapPin className="mr-2 h-4 w-4" />
                          Get Location
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function StartSessionPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <StartSessionPage />
    </Suspense>
  );
}
