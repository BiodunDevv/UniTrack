"use client";

import {
  AlertCircle,
  ArrowRightIcon,
  CheckCircle,
  MapPin,
  Monitor,
  Shield,
  Wifi,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import NavBar from "@/components/Landing/NavBar";
import { AttendanceModal } from "@/components/ui/attendance-modal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Glow from "@/components/ui/glow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DeviceInfo {
  platform: string;
  browser: string;
  screen_resolution: string;
  timezone: string;
  user_agent: string;
  language: string;
  device_fingerprint: string;
}

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

export default function SubmitAttendancePage() {
  const [formData, setFormData] = useState({
    matric_no: "",
    session_code: "",
    level: "",
  });
  const [location, setLocation] = useState<LocationData | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    success: boolean;
    message: string;
    record?: {
      course: string;
      matric_no: string;
      receipt: string;
      session_code: string;
      status: string;
      student_name: string;
      submitted_at: string;
    };
  } | null>(null);

  // Generate device fingerprint
  const generateDeviceFingerprint = (): string => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.fillText("Device fingerprint", 2, 2);
    }

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
      navigator.hardwareConcurrency || "unknown",
      (navigator as unknown as { deviceMemory?: number }).deviceMemory ||
        "unknown",
    ].join("|");

    // Simple hash function
    let hash = 0;
    for (let i = 0; i < fingerprint.length; i++) {
      const char = fingerprint.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  };

  // Get device information
  useEffect(() => {
    const detectBrowser = (): string => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Chrome")) return "Chrome";
      if (userAgent.includes("Firefox")) return "Firefox";
      if (userAgent.includes("Safari")) return "Safari";
      if (userAgent.includes("Edge")) return "Edge";
      return "Unknown";
    };

    const detectPlatform = (): string => {
      const userAgent = navigator.userAgent;
      if (userAgent.includes("Windows")) return "Windows";
      if (userAgent.includes("Mac")) return "macOS";
      if (userAgent.includes("Linux")) return "Linux";
      if (userAgent.includes("Android")) return "Android";
      if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
        return "iOS";
      return "Unknown";
    };

    setDeviceInfo({
      platform: detectPlatform(),
      browser: detectBrowser(),
      screen_resolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      user_agent: navigator.userAgent,
      language: navigator.language,
      device_fingerprint: generateDeviceFingerprint(),
    });
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          });
          setIsLoadingLocation(false);
        },
        (error) => {
          let errorMessage = "Location access denied";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location permissions.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out.";
              break;
          }
          setLocationError(errorMessage);
          setIsLoadingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        },
      );
    } else {
      setLocationError("Geolocation is not supported by this browser.");
      setIsLoadingLocation(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitAttendance = async () => {
    if (!formData.matric_no || !formData.session_code || !formData.level) {
      setSubmissionResult({
        success: false,
        message: "Please fill in all required fields",
      });
      setModalOpen(true);
      return;
    }

    if (!location) {
      setSubmissionResult({
        success: false,
        message: "Location is required for attendance submission",
      });
      setModalOpen(true);
      return;
    }

    if (!deviceInfo) {
      setSubmissionResult({
        success: false,
        message: "Device information is required",
      });
      setModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/attendance/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": navigator.userAgent,
        },
        body: JSON.stringify({
          matric_no: formData.matric_no.toUpperCase(),
          session_code: formData.session_code,
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          level: parseInt(formData.level),
          device_info: {
            platform: deviceInfo.platform,
            browser: deviceInfo.browser,
            screen_resolution: deviceInfo.screen_resolution,
            timezone: deviceInfo.timezone,
            user_agent: deviceInfo.user_agent,
            language: deviceInfo.language,
            device_fingerprint: deviceInfo.device_fingerprint,
          },
        }),
      });

      const result = await response.json();

      if (response.ok) {
        // Success response
        setSubmissionResult(result);
        setFormData({ matric_no: "", session_code: "", level: "" });
      } else {
        // Error response
        setSubmissionResult(result);
      }

      setModalOpen(true);
    } catch (error) {
      console.error("Attendance submission error:", error);
      setSubmissionResult({
        success: false,
        message: "Network error. Please try again.",
      });
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="from-background via-background to-background/80 min-h-screen bg-gradient-to-br">
      <NavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pt-24 sm:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="relative z-10 text-center">
            <div className="mx-auto max-w-4xl space-y-8 pb-16">
              <div className="space-y-4">
                <h1 className="animate-appear from-foreground to-foreground/80 bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent sm:text-5xl lg:text-6xl">
                  Submit Your Attendance
                </h1>
                <p className="animate-appear text-muted-foreground mx-auto max-w-2xl text-lg opacity-0 delay-100 sm:text-xl">
                  Quick and secure attendance submission with GPS verification
                  and device fingerprinting
                </p>
              </div>

              {/* Feature highlights */}
              <div className="animate-appear relative z-10 mx-auto flex max-w-3xl flex-wrap justify-center gap-6 opacity-0 delay-200">
                <div className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Shield className="text-primary h-5 w-5" />
                  Secure Verification
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
                  <MapPin className="text-primary h-5 w-5" />
                  GPS Location
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
                  <Monitor className="text-primary h-5 w-5" />
                  Device Fingerprinting
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm sm:text-base">
                  <CheckCircle className="text-primary h-5 w-5" />
                  Instant Receipt
                </div>
              </div>
            </div>
          </div>

          {/* Glow Effect */}
          <div className="absolute inset-0 -z-10">
            <Glow
              variant="top"
              className="animate-appear-zoom opacity-0 delay-500"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="relative px-4">
        <div className="mx-auto max-w-2xl">
          <Card className="animate-appear border-border/50 bg-card/50 hover:bg-card/80 opacity-0 backdrop-blur-sm transition-all delay-300 duration-300">
            <CardHeader className="space-y-2 text-center">
              <CardTitle className="text-xl sm:text-2xl">
                Attendance Submission
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Fill in your details below to submit your attendance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Form Fields */}
              <div className="grid gap-6 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="matric_no" className="text-sm font-medium">
                    Matriculation Number
                  </Label>
                  <Input
                    id="matric_no"
                    name="matric_no"
                    type="text"
                    placeholder="e.g., BU22CSC1016"
                    value={formData.matric_no}
                    onChange={handleInputChange}
                    className="h-11 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session_code" className="text-sm font-medium">
                    Session Code
                  </Label>
                  <Input
                    id="session_code"
                    name="session_code"
                    type="text"
                    placeholder="e.g., 4893"
                    value={formData.session_code}
                    onChange={handleInputChange}
                    className="h-11 text-base sm:text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level" className="text-sm font-medium">
                    Level
                  </Label>
                  <Input
                    id="level"
                    name="level"
                    type="number"
                    placeholder="e.g., 200"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="h-11 text-base sm:text-sm"
                  />
                </div>
              </div>

              {/* Status Cards */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Location Status */}
                <Card
                  className={cn(
                    "border-border/50 transition-all duration-300",
                    location
                      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950"
                      : locationError
                        ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
                        : "bg-muted/30",
                  )}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <MapPin
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        location
                          ? "text-green-600"
                          : locationError
                            ? "text-red-600"
                            : "text-muted-foreground",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {isLoadingLocation
                          ? "Getting Location..."
                          : location
                            ? "Location Acquired"
                            : locationError
                              ? "Location Error"
                              : "Location Required"}
                      </p>
                      {location && (
                        <p className="text-muted-foreground truncate text-xs">
                          {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                        </p>
                      )}
                      {locationError && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          {locationError}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Device Status */}
                <Card
                  className={cn(
                    "border-border/50 transition-all duration-300",
                    deviceInfo
                      ? "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950"
                      : "bg-muted/30",
                  )}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <Monitor
                      className={cn(
                        "h-5 w-5 flex-shrink-0",
                        deviceInfo ? "text-blue-600" : "text-muted-foreground",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {deviceInfo ? "Device Verified" : "Verifying Device..."}
                      </p>
                      {deviceInfo && (
                        <p className="text-muted-foreground truncate text-xs">
                          {deviceInfo.platform} • {deviceInfo.browser}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Submit Button */}
              <Button
                onClick={submitAttendance}
                disabled={isSubmitting || !deviceInfo || !location}
                className="from-primary to-primary/80 h-12 w-full bg-gradient-to-r text-base font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] hover:shadow-xl active:scale-95 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Wifi className="mr-2 h-5 w-5 animate-spin" />
                    Submitting Attendance...
                  </>
                ) : (
                  <>
                    Submit Attendance
                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>

              {/* Help Section */}
              <Card className="border-border/30 bg-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-muted-foreground mt-0.5 h-5 w-5 flex-shrink-0" />
                    <div className="text-muted-foreground space-y-1 text-sm">
                      <p className="font-medium">Need Help?</p>
                      <ul className="space-y-1 text-xs">
                        <li>
                          • Ensure you&apos;re within the designated attendance
                          area
                        </li>
                        <li>• Check that location permissions are enabled</li>
                        <li>• Verify your session code with your lecturer</li>
                        <li>
                          • Contact support if you continue experiencing issues
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Attendance Result Modal */}
      <AttendanceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        result={submissionResult}
      />
    </div>
  );
}
