"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Database,
  GraduationCap,
  Shield,
  Trash2,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type SemesterCleanupResponse,
  useAdminStore,
} from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";

export default function SemesterCleanupPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const {
    semesterCleanup,
    isLoadingSemesterCleanup,
    clearSemesterCleanupError,
  } = useAdminStore();

  const [confirmationText, setConfirmationText] = useState("");
  const [cleanupResults, setCleanupResults] =
    useState<SemesterCleanupResponse | null>(null);
  const [showResults, setShowResults] = useState(false);

  const requiredText = "DELETE ALL SEMESTER DATA";

  // Redirect if not admin
  React.useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, user?.role, authLoading, router]);

  // Clear any previous errors on mount
  React.useEffect(() => {
    clearSemesterCleanupError();
  }, [clearSemesterCleanupError]);

  // Handle semester cleanup
  const handleSemesterCleanup = async () => {
    if (confirmationText !== requiredText) {
      toast.error("Please type the exact confirmation text");
      return;
    }

    try {
      const results = await semesterCleanup();
      setCleanupResults(results);
      setShowResults(true);
      setConfirmationText("");
      toast.success("Semester cleanup completed successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to complete semester cleanup",
      );
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Data that will be deleted
  const dataToDelete = [
    {
      icon: Calendar,
      title: "All Lecture Sessions",
      description: "All sessions created by teachers",
      color: "text-red-600",
    },
    {
      icon: CheckCircle,
      title: "All Attendance Records",
      description: "Student attendance data for all sessions",
      color: "text-red-600",
    },
    {
      icon: Shield,
      title: "All Audit Logs",
      description: "System activity and security logs",
      color: "text-red-600",
    },
    {
      icon: Database,
      title: "Email Verification Codes",
      description: "Temporary OTP codes and verification data",
      color: "text-red-600",
    },
    {
      icon: Database,
      title: "Device Fingerprints",
      description: "Security device tracking data",
      color: "text-red-600",
    },
    {
      icon: Users,
      title: "Student Share Requests",
      description: "Temporary student sharing requests",
      color: "text-red-600",
    },
  ];

  // Data that will be preserved
  const dataToPreserve = [
    {
      icon: Users,
      title: "Teacher Accounts",
      description: "All lecturer profiles and credentials",
      color: "text-green-600",
    },
    {
      icon: GraduationCap,
      title: "Student Accounts",
      description: "All student profiles and information",
      color: "text-green-600",
    },
    {
      icon: Shield,
      title: "Admin Accounts",
      description: "Administrative user accounts",
      color: "text-green-600",
    },
    {
      icon: BookOpen,
      title: "Course Information",
      description: "Course structures and details",
      color: "text-green-600",
    },
    {
      icon: Users,
      title: "Course Enrollments",
      description: "Student-course relationships",
      color: "text-green-600",
    },
    {
      icon: Database,
      title: "FAQ Entries",
      description: "Help and support content",
      color: "text-green-600",
    },
  ];

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Semester Cleanup", current: true },
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 md:hidden"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              End of Semester Cleanup
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {getGreeting()}, {user?.name || "Admin"} • Prepare the system for
              a new semester
            </p>
          </div>
        </div>

        {!showResults ? (
          <>
            {/* Warning Banner */}
            <div className="animate-appear opacity-0 delay-200">
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-100 p-2 text-red-700">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-red-800">
                        ⚠️ Critical Action - Read Carefully
                      </CardTitle>
                      <CardDescription className="text-red-700">
                        This action is irreversible and will permanently delete
                        semester data
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-red-800">
                    <p>
                      <strong>This cleanup operation will:</strong>
                    </p>
                    <ul className="list-disc space-y-1 pl-6">
                      <li>
                        Permanently delete all session and attendance data
                      </li>
                      <li>Remove all audit logs and security tracking</li>
                      <li>Clear temporary verification and sharing data</li>
                      <li>Reset the system for a new academic semester</li>
                    </ul>
                    <p className="font-medium">
                      ✅ Account information and course structures will be
                      preserved
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Data Overview */}
            <div className="animate-appear grid gap-6 opacity-0 delay-300 lg:grid-cols-2">
              {/* Data to be Deleted */}
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-800">
                    <Trash2 className="h-5 w-5" />
                    Data to be Deleted
                  </CardTitle>
                  <CardDescription>
                    The following data will be permanently removed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dataToDelete.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="rounded-lg bg-red-100 p-2 text-red-700">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-red-800">
                            {item.title}
                          </p>
                          <p className="text-xs text-red-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Data to be Preserved */}
              <Card className="border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Data to be Preserved
                  </CardTitle>
                  <CardDescription>
                    The following data will remain intact and safe
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {dataToPreserve.map((item, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="rounded-lg bg-green-100 p-2 text-green-700">
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-green-800">
                            {item.title}
                          </p>
                          <p className="text-xs text-green-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Confirmation Section */}
            <div className="animate-appear opacity-0 delay-500">
              <Card className="border-amber-200 bg-amber-50">
                <CardHeader>
                  <CardTitle className="text-amber-800">
                    Confirmation Required
                  </CardTitle>
                  <CardDescription className="text-amber-700">
                    To proceed, please type the exact text below to confirm this
                    action
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmation" className="text-amber-800">
                      Type:{" "}
                      <code className="rounded bg-amber-200 px-2 py-1 text-sm">
                        {requiredText}
                      </code>
                    </Label>
                    <Input
                      id="confirmation"
                      value={confirmationText}
                      onChange={(e) => setConfirmationText(e.target.value)}
                      placeholder="Type the confirmation text here"
                      className="border-amber-300 focus:border-amber-500"
                      disabled={isLoadingSemesterCleanup}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      disabled={isLoadingSemesterCleanup}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSemesterCleanup}
                      disabled={
                        confirmationText !== requiredText ||
                        isLoadingSemesterCleanup
                      }
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isLoadingSemesterCleanup ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                          Processing Cleanup...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Proceed with Cleanup
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* Results Section */
          <div className="animate-appear space-y-6 opacity-0">
            {/* Success Banner */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-green-100 p-2 text-green-700">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-green-800">
                      ✅ Semester Cleanup Completed Successfully
                    </CardTitle>
                    <CardDescription className="text-green-700">
                      The system has been reset and is ready for a new semester
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Cleanup Summary */}
            {cleanupResults && (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Deleted Data Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-800">
                      <Trash2 className="h-5 w-5" />
                      Data Successfully Deleted
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Sessions Deleted</p>
                          <p className="text-2xl font-bold text-red-600">
                            {cleanupResults.cleanup_summary.deleted.sessions_deleted.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Attendance Records</p>
                          <p className="text-2xl font-bold text-red-600">
                            {cleanupResults.cleanup_summary.deleted.attendance_records_deleted.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Audit Logs</p>
                          <p className="text-2xl font-bold text-red-600">
                            {cleanupResults.cleanup_summary.deleted.audit_logs_deleted.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Device Fingerprints</p>
                          <p className="text-2xl font-bold text-red-600">
                            {cleanupResults.cleanup_summary.deleted.device_fingerprints_deleted.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Email OTPs</p>
                          <p className="text-2xl font-bold text-red-600">
                            {cleanupResults.cleanup_summary.deleted.email_otps_deleted.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Share Requests</p>
                          <p className="text-2xl font-bold text-red-600">
                            {cleanupResults.cleanup_summary.deleted.student_share_requests_deleted.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preserved Data Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-green-800">
                      <CheckCircle className="h-5 w-5" />
                      Data Preserved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Teachers</p>
                          <p className="text-2xl font-bold text-green-600">
                            {cleanupResults.cleanup_summary.preserved.teachers.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Students</p>
                          <p className="text-2xl font-bold text-green-600">
                            {cleanupResults.cleanup_summary.preserved.students.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Courses</p>
                          <p className="text-2xl font-bold text-green-600">
                            {cleanupResults.cleanup_summary.preserved.courses.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Enrollments</p>
                          <p className="text-2xl font-bold text-green-600">
                            {cleanupResults.cleanup_summary.preserved.course_enrollments.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Admins</p>
                          <p className="text-2xl font-bold text-green-600">
                            {cleanupResults.cleanup_summary.preserved.admins.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">FAQs</p>
                          <p className="text-2xl font-bold text-green-600">
                            {cleanupResults.cleanup_summary.preserved.faqs.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Next Steps */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Next Steps</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm text-blue-800">
                  <p className="font-medium">{cleanupResults?.next_steps}</p>
                  <div className="space-y-2">
                    <p>What teachers and students can do now:</p>
                    <ul className="list-disc space-y-1 pl-6">
                      <li>
                        Teachers can create new sessions for the new semester
                      </li>
                      <li>Students can mark attendance for new sessions</li>
                      <li>
                        All course structures and enrollments remain intact
                      </li>
                      <li>User accounts and permissions are unchanged</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={() => router.push("/dashboard")}
                className="bg-primary hover:bg-primary/90"
              >
                Return to Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowResults(false);
                  setCleanupResults(null);
                }}
              >
                Perform Another Cleanup
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
