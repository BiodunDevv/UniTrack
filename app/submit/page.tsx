"use client";

import FingerprintJS from "@fingerprintjs/fingerprintjs";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  GraduationCap,
  MapPin,
  Monitor,
  RefreshCw,
  Shield,
  Smartphone,
  Wifi,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

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
import { isMobileOrTablet } from "@/lib/device-utils";

interface LocationData {
  lat: number;
  lng: number;
  accuracy: number;
}

interface DeviceInfo {
  visitorId?: string;
  visitor_id?: string;
  platform: string;
  browser?: string;
  screen_resolution: string;
  timezone: string;
  user_agent: string;
  language: string;
  device_fingerprint: string;
  confidence?: { score: number };
  components?: Record<string, unknown>;
  [key: string]: string | number | boolean | object | undefined;
}

interface SubmissionResult {
  success: boolean;
  message: string;
  error?: string;
  record?: {
    course: string;
    matric_no: string;
    receipt: string;
    session_code: string;
    status: string;
    student_name: string;
    submitted_at: string;
  };
  existing_record?: {
    status: string;
    submitted_at: string;
  };
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
  const [submissionResult, setSubmissionResult] =
    useState<SubmissionResult | null>(null);

  // Device restriction check
  const [isDesktop, setIsDesktop] = useState(false);

  React.useEffect(() => {
    setIsDesktop(!isMobileOrTablet());
  }, []);

  // Generate device fingerprint using FingerprintJS
  const generateFingerprint = useCallback(async () => {
    try {
      // Load FingerprintJS
      const fp = await FingerprintJS.load();
      const result = await fp.get();

      // Return the full FingerprintJS result with additional basic info
      const fingerprintData = {
        // FingerprintJS core data
        visitorId: result.visitorId,
        confidence: result.confidence,
        components: result.components,
        version: result.version || "3.x",
        timestamp: Date.now(),

        // Basic device info for display
        platform: getPlatform(),
        browser: getBrowser(),
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        user_agent: navigator.userAgent,
        language: navigator.language,
        device_fingerprint: result.visitorId, // For fallback compatibility
      };

      setDeviceInfo(fingerprintData);
    } catch (error) {
      console.error("Failed to generate fingerprint:", error);
      const fallbackData = {
        platform: getPlatform(),
        browser: getBrowser(),
        screen_resolution: `${screen.width}x${screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        user_agent: navigator.userAgent,
        language: navigator.language,
        device_fingerprint: generateSimpleHash(),
      };
      setDeviceInfo(fallbackData);
    }
  }, []);

  const getPlatform = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Windows")) return "Windows";
    if (userAgent.includes("Mac")) return "macOS";
    if (userAgent.includes("Linux")) return "Linux";
    if (userAgent.includes("Android")) return "Android";
    if (userAgent.includes("iPhone") || userAgent.includes("iPad"))
      return "iOS";
    return "Unknown";
  };

  const getBrowser = (): string => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Unknown";
  };

  const generateSimpleHash = (): string => {
    const data = [
      navigator.userAgent,
      navigator.language,
      screen.width + "x" + screen.height,
      new Date().getTimezoneOffset(),
    ].join("|");

    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  };

  // Get user location
  const getUserLocation = async (): Promise<LocationData | null> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: Math.min(position.coords.accuracy, 10000),
          };

          resolve(locationData);
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
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 60000,
        },
      );
    });
  };

  // Manual location refresh
  const refreshLocation = async () => {
    setLocationError(null);
    setIsLoadingLocation(true);

    try {
      const newLocation = await getUserLocation();
      setLocation(newLocation);
      console.log("📍 Location refreshed:", newLocation);
    } catch (error) {
      setLocationError(
        error instanceof Error ? error.message : "Failed to get location",
      );
      console.error("📍 Location error:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Initialize data on mount (without auto location)
  useEffect(() => {
    const initializeData = async () => {
      // Generate device fingerprint
      await generateFingerprint();

      // Don't automatically get location - user will click button
      setIsLoadingLocation(false);
    };

    initializeData();
  }, [generateFingerprint]);

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
        message: "",
        error: "Please fill in all required fields",
      });
      setModalOpen(true);
      return;
    }

    if (!location) {
      setSubmissionResult({
        success: false,
        message: "",
        error: "Location is required for attendance submission",
      });
      setModalOpen(true);
      return;
    }

    if (!deviceInfo) {
      setSubmissionResult({
        success: false,
        message: "",
        error: "Device information is required",
      });
      setModalOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare the exact format the API expects
      const submissionData = {
        matric_no: formData.matric_no.toUpperCase(),
        session_code: formData.session_code,
        lat: location.lat,
        lng: location.lng,
        accuracy: location.accuracy,
        device_info: deviceInfo, // Send the full FingerprintJS data directly
        level: parseInt(formData.level),
      };

      console.log("📤 Submitting attendance with data:", submissionData);

      const response = await fetch(`${API_BASE_URL}/attendance/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": navigator.userAgent,
        },
        body: JSON.stringify(submissionData),
      });

      const result = await response.json();

      console.log("📥 Attendance submission result:", result);

      if (response.ok) {
        setSubmissionResult(result);
        setFormData({ matric_no: "", session_code: "", level: "" });
      } else {
        setSubmissionResult(result);
      }

      setModalOpen(true);
    } catch (error) {
      console.error("Attendance submission error:", error);
      setSubmissionResult({
        success: false,
        message: "",
        error: "Network error. Please try again.",
      });
      setModalOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background min-h-screen">
      {/* Main Content - Show on all devices but restrict submission */}
      {/* Back Button */}
      <div className="container mx-auto px-4 pt-8">
        <div className="mb-6 flex justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.history.back()}
            className="hover:bg-accent hover:text-accent-foreground transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-4 sm:pt-8">
        <div className="relative container mx-auto px-4 py-4 sm:py-8">
          <div className="mx-auto max-w-4xl text-center">
            {/* Header */}
            <div className="mb-8 space-y-4 sm:mb-12 sm:space-y-6">
              <div className="bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <Smartphone className="h-4 w-4" />
                {isDesktop
                  ? "Attendance System (Preview)"
                  : "Mobile Attendance System"}
              </div>

              <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-xl font-bold text-transparent sm:text-2xl lg:text-4xl">
                Submit Your Attendance
              </h1>

              <p className="text-muted-foreground sm:text-md mx-auto max-w-2xl text-sm">
                Secure, location-verified attendance submission with real-time
                processing and instant confirmation
                {isDesktop && (
                  <span className="mt-1 block font-medium text-orange-600">
                    Preview only - Use mobile device to submit attendance
                  </span>
                )}
              </p>

              {/* Feature highlights */}
              <div className="flex flex-wrap justify-center gap-3 sm:gap-6">
                <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                  <MapPin className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                  GPS Verified
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                  <Shield className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                  Device Secured
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm">
                  <CheckCircle className="text-primary h-3 w-3 sm:h-4 sm:w-4" />
                  Instant Confirmation
                </div>
              </div>
            </div>{" "}
            {/* Main Form Card */}
            <div className="relative mx-auto max-w-2xl">
              <Card className="border-border/50 bg-card/80 relative backdrop-blur-xl">
                <CardHeader className="pb-4 text-center sm:pb-6">
                  <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
                    <GraduationCap className="text-primary h-5 w-5 sm:h-6 sm:w-6" />
                    Student Attendance Portal
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Enter your details and session code to mark attendance
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Student Information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="matric_no"
                        className="text-sm font-medium"
                      >
                        Matric Number
                      </Label>
                      <Input
                        id="matric_no"
                        name="matric_no"
                        type="text"
                        placeholder="e.g., CSC/2021/001"
                        value={formData.matric_no}
                        onChange={handleInputChange}
                        className="border-border/50 bg-background/50 uppercase"
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
                        placeholder="e.g., 300"
                        value={formData.level}
                        onChange={handleInputChange}
                        min="100"
                        max="600"
                        step="100"
                        className="border-border/50 bg-background/50"
                      />
                    </div>
                  </div>

                  {/* Session Code */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="session_code"
                      className="text-sm font-medium"
                    >
                      Session Code
                    </Label>
                    <Input
                      id="session_code"
                      name="session_code"
                      type="text"
                      placeholder="Enter the 4-digit session code"
                      value={formData.session_code}
                      onChange={handleInputChange}
                      className="border-border/50 bg-background/50 text-center font-mono text-lg tracking-widest"
                      maxLength={4}
                    />
                  </div>

                  {/* Device & Location Status */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Device Status */}
                    <Card className="border-border/30 bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-2 ${deviceInfo ? "bg-green-500/20" : "bg-orange-500/20"}`}
                          >
                            <Monitor
                              className={`h-4 w-4 ${deviceInfo ? "text-green-600" : "text-orange-600"}`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">Device Info</p>
                            <p className="text-muted-foreground text-xs">
                              {deviceInfo
                                ? `${deviceInfo.browser || "Unknown"} on ${deviceInfo.platform || "Unknown"}`
                                : "Detecting..."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Location Status */}
                    <Card className="border-border/30 bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`rounded-full p-2 ${
                              location
                                ? "bg-green-500/20"
                                : locationError
                                  ? "bg-red-500/20"
                                  : "bg-orange-500/20"
                            }`}
                          >
                            <MapPin
                              className={`h-4 w-4 ${
                                location
                                  ? "text-green-600"
                                  : locationError
                                    ? "text-red-600"
                                    : "text-orange-600"
                              }`}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              Location Status
                            </p>
                            {location ? (
                              <div className="text-muted-foreground space-y-1 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium">
                                    Coordinates:
                                  </span>
                                  <span className="font-mono text-green-600">
                                    {location.lat.toFixed(6)},{" "}
                                    {location.lng.toFixed(6)}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Accuracy:</span>
                                  <span
                                    className={`font-medium ${
                                      location.accuracy <= 10
                                        ? "text-green-600"
                                        : location.accuracy <= 50
                                          ? "text-yellow-600"
                                          : "text-orange-600"
                                    }`}
                                  >
                                    ±{Math.round(location.accuracy)}m
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span>Quality:</span>
                                  <span
                                    className={`text-xs font-medium ${
                                      location.accuracy <= 10
                                        ? "text-green-600"
                                        : location.accuracy <= 50
                                          ? "text-yellow-600"
                                          : "text-orange-600"
                                    }`}
                                  >
                                    {location.accuracy <= 10
                                      ? "Excellent"
                                      : location.accuracy <= 50
                                        ? "Good"
                                        : "Fair"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-xs">
                                {isLoadingLocation
                                  ? "Getting location..."
                                  : locationError
                                    ? "Location error"
                                    : isDesktop
                                      ? "Click 'Get Location' below to test GPS (preview mode)"
                                      : "Click 'Get Location' below to enable GPS"}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Location Control Buttons */}
                  <div className="flex gap-3">
                    {!location ? (
                      <Button
                        onClick={refreshLocation}
                        disabled={isLoadingLocation}
                        variant="outline"
                        className="flex-1"
                      >
                        {isLoadingLocation ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Getting Location...
                          </>
                        ) : (
                          <>
                            <MapPin className="mr-2 h-4 w-4" />
                            {isDesktop
                              ? "Test Location (Preview)"
                              : "Get Location"}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={refreshLocation}
                        disabled={isLoadingLocation}
                        variant="outline"
                        className="flex-1"
                      >
                        {isLoadingLocation ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {isDesktop
                              ? "Refresh Location (Preview)"
                              : "Refresh Location"}
                          </>
                        )}
                      </Button>
                    )}
                  </div>

                  {/* Location Error */}
                  {locationError && (
                    <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-red-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                              Location Access Required
                            </p>
                            <p className="text-xs text-red-700 dark:text-red-300">
                              {locationError}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Security Features */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                      <Shield className="text-primary h-4 w-4" />
                      Security Features
                    </h3>
                    <div className="text-muted-foreground grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Device fingerprinting
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        GPS verification
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Real-time validation
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        Encrypted submission
                      </div>
                    </div>
                  </div>

                  {/* Submit Button or Desktop Restriction */}
                  {isDesktop ? (
                    <>
                      {/* Desktop Restriction Message */}
                      <div className="border-destructive/50 bg-destructive/5 rounded-lg border p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <Smartphone className="text-destructive h-5 w-5" />
                          <span className="text-destructive font-medium">
                            Mobile Device Required
                          </span>
                        </div>
                        <p className="text-destructive/80 mb-3 text-sm">
                          For security and location accuracy, attendance
                          submission can only be done from mobile devices or
                          tablets.
                        </p>
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-xs">
                            You can preview the form and interface, but to
                            submit attendance please access from:
                          </p>
                          <ul className="text-muted-foreground ml-4 space-y-1 text-xs">
                            <li>• Mobile phone (iOS or Android)</li>
                            <li>• Tablet device</li>
                            <li>• Device with GPS capabilities</li>
                          </ul>
                        </div>
                      </div>
                    </>
                  ) : (
                    <Button
                      onClick={submitAttendance}
                      disabled={
                        isSubmitting ||
                        !formData.matric_no ||
                        !formData.session_code ||
                        !formData.level ||
                        !location
                      }
                      className="group relative h-12 w-full overflow-hidden text-base font-medium"
                    >
                      {/* Button Glow */}
                      <div className="bg-primary/20 absolute inset-0 translate-y-full transition-transform group-hover:translate-y-0" />

                      {isSubmitting ? (
                        <>
                          <Wifi className="mr-2 h-4 w-4 animate-spin" />
                          Submitting Attendance...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Submit Attendance
                        </>
                      )}
                    </Button>
                  )}

                  {/* Help Section */}
                  <Card className="border-border/30 bg-muted/20">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Clock className="text-muted-foreground mt-0.5 h-4 w-4" />
                        <div className="text-muted-foreground text-xs">
                          <p className="mb-1 font-medium">Need Help?</p>
                          <p>
                            Make sure you&apos;re within the designated
                            attendance area and have a stable internet
                            connection. Contact your lecturer if you&apos;re
                            unable to submit attendance.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Result Modal */}
      <AttendanceModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        result={submissionResult}
      />

      {/* Fixed Bottom Glow Effect */}
      <div className="pointer-events-none fixed right-0 bottom-0 left-0 z-0">
        <Glow variant="bottom" className="opacity-60 dark:opacity-80" />
      </div>
    </div>
  );
}
