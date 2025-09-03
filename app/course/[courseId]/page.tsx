"use client";

import {
  Activity,
  ArrowLeft,
  BarChart3,
  BookOpen,
  Clock,
  Download,
  Edit,
  Eye,
  FileText,
  Loader2,
  Mail,
  Play,
  Search,
  Settings,
  Square,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { EndSessionModal } from "@/components/ui/end-session-modal";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpdateCourseModal } from "@/components/ui/update-course-modal";
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000/api";

// Function to get auth token from localStorage
const getAuthToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }
  return null;
};

export default function CoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const {
    currentCourse,
    students,
    sessions,
    stats,
    isLoading,
    isEmailingCSV,
    isEmailingPDF,
    isDownloadingCSV,
    isDownloadingPDF,
    error,
    getCourse,
    updateCourse,
    removeStudentFromCourse,
    downloadCSVReport,
    downloadPDFReport,
    emailCSVReport,
    emailPDFReport,
    clearError,
  } = useCourseStore();

  const { user } = useAuthStore();

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = React.useState("overview");
  const [showEndSessionModal, setShowEndSessionModal] = React.useState(false);
  const [sessionToEnd, setSessionToEnd] = React.useState<{
    _id: string;
    session_code?: string;
    created_at: string;
    course_id: string;
    teacher_id: string;
    start_time?: string;
    expiry_time?: string;
    is_active?: boolean;
    is_expired?: boolean;
    lat: number;
    lng: number;
    radius_m: number;
    duration_minutes: number;
    status: "active" | "ended" | "expired";
    expires_at: string;
    qr_code: string;
  } | null>(null);
  const [isEndingSession, setIsEndingSession] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const sessionsPerPage = 10;

  // Student pagination state
  const [currentStudentPage, setCurrentStudentPage] = React.useState(1);
  const studentsPerPage = 10;

  // Student search state
  const [studentSearchQuery, setStudentSearchQuery] = React.useState("");

  // Student removal loading state
  const [removingStudentId, setRemovingStudentId] = React.useState<
    string | null
  >(null);

  // Update course modal state
  const [showUpdateCourseModal, setShowUpdateCourseModal] =
    React.useState(false);

  // Confirmation modal state for student removal
  const [showConfirmationModal, setShowConfirmationModal] =
    React.useState(false);
  const [studentToRemove, setStudentToRemove] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  // Fetch course data on mount
  React.useEffect(() => {
    if (courseId) {
      getCourse(courseId);
    }
  }, [courseId, getCourse]);

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Format level for display
  const formatLevel = (level: number) => {
    const levelMap: { [key: number]: string } = {
      100: "1st Year",
      200: "2nd Year",
      300: "3rd Year",
      400: "4th Year",
      500: "5th Year",
      600: "6th Year",
    };
    return levelMap[level] || `Level ${level}`;
  };

  // Format date with day of week
  const formatDateWithDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format date and time with day of week
  const formatDateTimeWithDay = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEndSession = async (sessionId: string) => {
    // Find the session to end
    const session = sessions.find((s) => s._id === sessionId);
    if (!session) return;

    // Set the session to end and show modal
    setSessionToEnd(session);
    setShowEndSessionModal(true);
  };

  const confirmEndSession = async () => {
    if (!sessionToEnd) return;

    setIsEndingSession(true);

    try {
      const token = getAuthToken();

      if (!token) {
        toast.error("Authentication token not found");
        return;
      }

      // Show loading toast
      const loadingToast = toast.loading("Ending session...");

      const response = await fetch(
        `${API_BASE_URL}/sessions/${sessionToEnd._id}/end`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data = await response.json();
      console.log("Session ended successfully:", data);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(
        `Session ${data.session?.session_code || sessionToEnd.session_code || sessionToEnd._id.slice(-6)} ended successfully!`,
        {
          description:
            "The session has been terminated and is no longer accepting attendance.",
          duration: 4000,
        },
      );

      // Close modal and refresh course data
      setShowEndSessionModal(false);
      setSessionToEnd(null);
      getCourse(courseId);
    } catch (error) {
      console.error("Failed to end session:", error);
      toast.error("Failed to end session", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        duration: 4000,
      });
    } finally {
      setIsEndingSession(false);
    }
  };

  const handleDownloadReport = async (format: "csv" | "pdf") => {
    try {
      if (format === "csv") {
        await downloadCSVReport(courseId);
        toast.success("CSV report downloaded successfully!");
      } else {
        await downloadPDFReport(courseId);
        toast.success("PDF report downloaded successfully!");
      }
    } catch (error) {
      toast.error(`Failed to download ${format.toUpperCase()} report`);
      console.error("Download report error:", error);
    }
  };

  // Direct email functions without date selection
  const handleEmailCSVReport = async () => {
    try {
      await emailCSVReport(courseId);
      toast.success("CSV report sent to your email successfully!");
    } catch (error) {
      toast.error("Failed to email CSV report");
      console.error("Email CSV report error:", error);
    }
  };

  const handleEmailPDFReport = async () => {
    try {
      await emailPDFReport(courseId);
      toast.success("PDF report sent to your email successfully!");
    } catch (error) {
      toast.error("Failed to email PDF report");
      console.error("Email PDF report error:", error);
    }
  };

  // Student removal function with loading state
  const handleRemoveStudent = async (studentId: string) => {
    // Find the student to get their name for the confirmation dialog
    const student = students.find((s) => s._id === studentId);
    const studentName = student?.name || "this student";

    // Set the student to remove and show confirmation modal
    setStudentToRemove({ id: studentId, name: studentName });
    setShowConfirmationModal(true);
  };

  // Confirm student removal
  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;

    setRemovingStudentId(studentToRemove.id);
    try {
      await removeStudentFromCourse(courseId, studentToRemove.id);
      toast.success("Student removed successfully!");
    } catch {
      toast.error("Failed to remove student");
    } finally {
      setRemovingStudentId(null);
      setShowConfirmationModal(false);
      setStudentToRemove(null);
    }
  };

  // Update course function
  const handleUpdateCourse = async (
    courseId: string,
    data: { title?: string; level?: number },
  ) => {
    try {
      await updateCourse(courseId, data);
      // Refresh course data after update
      getCourse(courseId);
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  const recentSessions = sessions.slice(0, 3);

  // Pagination logic for sessions tab
  const totalPages = Math.ceil(sessions.length / sessionsPerPage);
  const startIndex = (currentPage - 1) * sessionsPerPage;
  const endIndex = startIndex + sessionsPerPage;
  const paginatedSessions = sessions.slice(startIndex, endIndex);

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    if (!studentSearchQuery) return true;
    const query = studentSearchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.matric_no.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  // Pagination logic for students tab
  const totalStudentPages = Math.ceil(
    filteredStudents.length / studentsPerPage,
  );
  const studentStartIndex = (currentStudentPage - 1) * studentsPerPage;
  const studentEndIndex = studentStartIndex + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(
    studentStartIndex,
    studentEndIndex,
  );

  const actualLecturerId = currentCourse?.teacher_id?._id;
  const actualLecturerName = currentCourse?.teacher_id?.name;

  // Reset student pagination when search query changes
  React.useEffect(() => {
    setCurrentStudentPage(1);
  }, [studentSearchQuery]);

  if (isLoading && !currentCourse) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-red-500">{error}</p>
            <Button onClick={() => clearError()}>Try Again</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentCourse) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Course not found</p>
            <Button href="/dashboard">Go to Dashboard</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb
            items={
              isAdmin
                ? [
                    { label: "Lecturers", href: "/lecturers" },
                    {
                      label: actualLecturerName || "Unknown Lecturer",
                      href: `/lecturers/${actualLecturerId}`,
                    },
                    { label: currentCourse.course_code, current: true },
                  ]
                : [
                    { label: "Courses", href: "/course" },
                    { label: currentCourse.course_code, current: true },
                  ]
            }
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                href={isAdmin ? `/lecturers/${actualLecturerId}` : `/course`}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 md:hidden"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                {isAdmin ? "Back to Lecturer" : "Back to Courses"}
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              {currentCourse.title}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {currentCourse.course_code} • {formatLevel(currentCourse.level)} •{" "}
              {getGreeting()}, {user?.name || "Lecturer"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {/* Show View Live Session button for teachers only when there are active sessions */}
            {!isAdmin &&
              sessions.some(
                (session) => session.is_active || session.status === "active",
              ) && (
                <Button
                  onClick={() => {
                    const activeSession = sessions.find(
                      (session) =>
                        session.is_active || session.status === "active",
                    );
                    if (activeSession) {
                      router.push(`/session/${activeSession._id}/live`);
                    }
                  }}
                  className="bg-blue-600 transition-all duration-300 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  View Live Session
                </Button>
              )}

            {/* Show View All Sessions button for admin */}
            {isAdmin && currentCourse?.teacher_id?._id && (
              <Button
                href={`/lecturers/sessions?courseId=${courseId}`}
                variant="outline"
              >
                <Activity className="mr-2 h-4 w-4" />
                View All Sessions
              </Button>
            )}

            {/* Show Reassign Course button for admin only */}
            {isAdmin && currentCourse && (
              <Button
                href={`/course/reassign?courseId=${courseId}`}
                variant="glow"
                className="border-border/50 bg-background/50 transition-all duration-300 hover:bg-orange-600 hover:text-white hover:shadow-lg hover:shadow-orange-600/20"
              >
                <UserCheck className="mr-2 h-4 w-4" />
                Reassign Course
              </Button>
            )}

            {/* Show Stop Session button only for teachers */}
            {!isAdmin &&
              sessions.some(
                (session) => session.is_active || session.status === "active",
              ) && (
                <Button
                  onClick={() => {
                    const activeSession = sessions.find(
                      (session) =>
                        session.is_active || session.status === "active",
                    );
                    if (activeSession) {
                      handleEndSession(activeSession._id);
                    }
                  }}
                  variant="default"
                  className="transition-all duration-300 hover:shadow-lg hover:shadow-red-600/20"
                >
                  <Square className="mr-2 h-4 w-4" />
                  Stop Session
                </Button>
              )}

            {/* Show Students button for both admin and teachers when no active session */}
            {!sessions.some(
              (session) => session.is_active || session.status === "active",
            ) && (
              <Button
                href={`/students/${courseId}`}
                variant="outline"
                className="border-border/50 bg-background/50 transition-all duration-300 hover:bg-purple-600 hover:text-white hover:shadow-lg hover:shadow-purple-600/20"
              >
                <Users className="mr-2 h-4 w-4" />
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : stats?.total_students === 0 || students.length === 0 ? (
                  isAdmin ? (
                    "View Students"
                  ) : (
                    "Add Students"
                  )
                ) : stats?.total_students === 1 || students.length === 1 ? (
                  "View Student"
                ) : (
                  "View Students"
                )}
              </Button>
            )}

            {/* Hide Edit Course and Report buttons when session is active OR when user is admin */}
            {!isAdmin &&
              !sessions.some(
                (session) => session.is_active || session.status === "active",
              ) && (
                <>
                  <Button
                    href={`/course/report?courseId=${courseId}`}
                    variant="outline"
                    className="border-border/50 bg-background/50 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-600/20"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Attendance Report
                  </Button>
                  <Button
                    onClick={() => setShowUpdateCourseModal(true)}
                    variant="outline"
                    className="border-border/50 bg-background/50 transition-all duration-300 hover:bg-orange-600 hover:text-white hover:shadow-lg hover:shadow-orange-600/20"
                    disabled={isLoading}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Course
                  </Button>
                </>
              )}

            {/* Admin gets read-only access to reports */}
            {isAdmin && (
              <Button
                href={`/course/report?courseId=${courseId}`}
                className="transition-all duration-300"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                View Report
              </Button>
            )}

            {/* Start Session button only for teachers */}
            {!isAdmin && (
              <Button
                variant={
                  sessions.some(
                    (session) =>
                      session.is_active || session.status === "active",
                  )
                    ? "destructive"
                    : "default"
                }
                href={
                  !isLoading &&
                  !sessions.some(
                    (session) =>
                      session.is_active || session.status === "active",
                  )
                    ? `/session/start?courseId=${courseId}&courseName=${encodeURIComponent(currentCourse?.title || "Course")}`
                    : undefined
                }
                className="transition-all duration-300"
                disabled={
                  isLoading ||
                  sessions.some(
                    (session) =>
                      session.is_active || session.status === "active",
                  )
                }
              >
                <Play className="mr-2 h-4 w-4" />
                {isLoading
                  ? "Loading..."
                  : sessions.some(
                        (session) =>
                          session.is_active || session.status === "active",
                      )
                    ? "Session Active"
                    : "Start Session"}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Total Students
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Users className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {stats?.total_students || students.length}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                Enrolled in this course
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Active Sessions
              </CardTitle>
              <div className="rounded-lg bg-green-500/10 p-2 text-green-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-green-500/20">
                <Clock className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-green-600/90">
                {stats?.active_sessions || 0}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                Currently running
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Average Attendance
              </CardTitle>
              <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-blue-500/20">
                <BarChart3 className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-blue-600/90">
                {stats?.average_attendance_rate
                  ? Math.round(stats.average_attendance_rate)
                  : 0}
                %
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                Overall attendance rate
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Present Today
              </CardTitle>
              <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-purple-500/20">
                <Users className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-purple-600/90">
                {stats?.present_count || 0}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                Out of {stats?.total_students || 0} students
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Content */}
        <div className="animate-appear opacity-0 delay-400">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="border-border/50 bg-card/50 backdrop-blur-sm">
              <TabsTrigger
                value="overview"
                className="transition-all duration-300"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="transition-all duration-300"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="sessions"
                className="transition-all duration-300"
              >
                Sessions
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="transition-all duration-300"
              >
                Reports
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Course Info */}
                <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Course Information
                    </CardTitle>
                    <CardDescription>
                      Detailed information about this course
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="bg-primary/10 text-primary rounded-md p-1.5">
                            <BookOpen className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Course Code
                            </p>
                            <p className="font-mono text-lg font-bold">
                              {currentCourse.course_code}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-blue-500/10 p-1.5 text-blue-500">
                            <BarChart3 className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Academic Level
                            </p>
                            <p className="text-lg font-bold">
                              {formatLevel(currentCourse.level)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="rounded-md bg-green-500/10 p-1.5 text-green-500">
                            <FileText className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                              Course Title
                            </p>
                            <p className="text-base leading-tight font-semibold">
                              {currentCourse.title}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="rounded-md bg-purple-500/10 p-1.5 text-purple-500">
                              <Users className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Instructor
                              </p>
                              <p className="text-sm font-medium">
                                {currentCourse.teacher_id.name}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="rounded-md bg-orange-500/10 p-1.5 text-orange-500">
                              <Clock className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                                Created
                              </p>
                              <p className="text-sm font-medium">
                                {formatDateWithDay(currentCourse.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Sessions */}
                <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>
                      Latest attendance sessions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    {isLoading ? (
                      <div className="flex items-center justify-center p-8">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-muted-foreground text-sm">
                            Loading recent sessions...
                          </span>
                        </div>
                      </div>
                    ) : recentSessions.length > 0 ? (
                      <>
                        {/* Mobile Horizontal Scrollable Table */}
                        <div className="block sm:hidden">
                          <div className="overflow-x-auto">
                            <div className="min-w-[500px] px-4">
                              <table className="w-full">
                                <thead>
                                  <tr className="border-border border-b">
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      Session
                                    </th>
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      Status
                                    </th>
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      Date
                                    </th>
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {recentSessions.map((session) => (
                                    <tr
                                      key={session._id}
                                      className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                    >
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <p className="text-xs font-medium">
                                          {session.session_code ||
                                            session._id.slice(-6)}
                                        </p>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <Badge
                                          variant={
                                            session.is_active ||
                                            session.status === "active"
                                              ? "default"
                                              : "secondary"
                                          }
                                          className="text-xs"
                                        >
                                          {session.is_active
                                            ? "active"
                                            : session.status || "ended"}
                                        </Badge>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <p className="text-muted-foreground text-xs">
                                          {formatDateWithDay(
                                            session.start_time ||
                                              session.created_at,
                                          )}
                                        </p>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <Button
                                          variant="default"
                                          size="sm"
                                          href={`/session/${session._id}`}
                                          className="h-7 w-7 p-0"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Table */}
                        <div className="hidden sm:block">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-border border-b">
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Session Code
                                  </th>
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Status
                                  </th>
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Date Created
                                  </th>
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {recentSessions.map((session) => (
                                  <tr
                                    key={session._id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                  >
                                    <td className="px-4 py-4">
                                      <p className="text-sm font-medium">
                                        {session.session_code ||
                                          session._id.slice(-6)}
                                      </p>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Badge
                                        variant={
                                          session.is_active ||
                                          session.status === "active"
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {session.is_active
                                          ? "active"
                                          : session.status || "ended"}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                      <p className="text-muted-foreground text-sm">
                                        {formatDateWithDay(
                                          session.start_time ||
                                            session.created_at,
                                        )}
                                      </p>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Button
                                        variant="default"
                                        size="sm"
                                        href={`/session/${session._id}`}
                                        className="h-8 w-8 p-0"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="px-6 py-8 text-center">
                        <p className="text-muted-foreground text-sm">
                          No sessions yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="students" className="space-y-4">
              <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Course Students</CardTitle>
                      <CardDescription>
                        Manage students enrolled in this course
                      </CardDescription>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="Search by name, matric no, or email..."
                        value={studentSearchQuery}
                        onChange={(e) => setStudentSearchQuery(e.target.value)}
                        className="pr-10 pl-10"
                      />
                      {studentSearchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStudentSearchQuery("")}
                          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {filteredStudents.length > 0 ? (
                    <>
                      {/* Mobile Horizontal Scrollable Table */}
                      <div className="block sm:hidden">
                        <div className="overflow-x-auto">
                          <div className="min-w-[600px] px-4">
                            <table className="w-full">
                              <thead>
                                <tr className="border-border border-b">
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    #
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Student
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Matric No
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Email
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedStudents.map((student, index) => (
                                  <tr
                                    key={student._id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                  >
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <span className="text-xs font-medium">
                                        #{studentStartIndex + index + 1}
                                      </span>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="truncate text-xs font-medium">
                                          {student.name}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <p className="text-muted-foreground font-mono text-xs">
                                        {student.matric_no}
                                      </p>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[150px]">
                                        <p className="text-muted-foreground truncate text-xs">
                                          {student.email}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          href={`/students/${courseId}/${student._id}/attendance`}
                                          className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                          title="View attendance history"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                        {!isAdmin && (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                              handleRemoveStudent(student._id)
                                            }
                                            disabled={
                                              removingStudentId === student._id
                                            }
                                            className="h-7 w-7 p-0"
                                          >
                                            {removingStudentId ===
                                            student._id ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-3 w-3" />
                                            )}
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden sm:block">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-border border-b">
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  #
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Student Name
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Matric Number
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Email Address
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedStudents.map((student, index) => (
                                <tr
                                  key={student._id}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-4 py-4">
                                    <span className="text-sm font-medium">
                                      #{studentStartIndex + index + 1}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm font-medium">
                                      {student.name}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground font-mono text-sm">
                                      {student.matric_no}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground text-sm">
                                      {student.email}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        href={`/students/${courseId}/${student._id}/attendance`}
                                        className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                        title="View attendance history"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      {!isAdmin && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleRemoveStudent(student._id)
                                          }
                                          disabled={
                                            removingStudentId === student._id
                                          }
                                          className="h-8 w-8 p-0"
                                        >
                                          {removingStudentId === student._id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Student Pagination */}
                      <Pagination
                        currentPage={currentStudentPage}
                        totalPages={totalStudentPages}
                        onPageChange={setCurrentStudentPage}
                        totalItems={filteredStudents.length}
                        itemsPerPage={studentsPerPage}
                        itemName="students"
                      />
                    </>
                  ) : studentSearchQuery ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No students found matching &quot;{studentSearchQuery}
                        &quot;
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStudentSearchQuery("")}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No students enrolled yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sessions" className="space-y-4">
              <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>Attendance Sessions</CardTitle>
                      <CardDescription>
                        Manage course attendance sessions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {paginatedSessions.length > 0 ? (
                    <>
                      {/* Mobile Horizontal Scrollable Table */}
                      <div className="block sm:hidden">
                        <div className="overflow-x-auto">
                          <div className="min-w-[700px] px-4">
                            <table className="w-full">
                              <thead>
                                <tr className="border-border border-b">
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    #
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Session Code
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Status
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Started
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Expires
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedSessions.map((session, index) => (
                                  <tr
                                    key={session._id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                  >
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <span className="text-xs font-medium">
                                        #{startIndex + index + 1}
                                      </span>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[100px]">
                                        <p className="truncate text-xs font-medium">
                                          {session.session_code ||
                                            session._id.slice(-6)}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <Badge
                                        variant={
                                          session.is_active
                                            ? "default"
                                            : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {session.is_active ? "active" : "ended"}
                                      </Badge>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="text-muted-foreground truncate text-xs">
                                          {formatDateTimeWithDay(
                                            session.start_time ||
                                              session.created_at,
                                          )}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="text-muted-foreground truncate text-xs">
                                          {formatDateTimeWithDay(
                                            session.expiry_time ||
                                              session.expires_at,
                                          )}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <div className="flex gap-1">
                                        {session.is_active && (
                                          <>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              href={`/session/${session._id}/live`}
                                              className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                              title="View live session"
                                            >
                                              <Activity className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() =>
                                                handleEndSession(session._id)
                                              }
                                              className="h-7 w-7 p-0"
                                              title="End session"
                                            >
                                              <Square className="h-3 w-3" />
                                            </Button>
                                          </>
                                        )}
                                        <Button
                                          size="sm"
                                          href={`/session/${session._id}`}
                                          className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                          title="View session details"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden sm:block">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-border border-b">
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  #
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Session Code
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Status
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Started
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Expires
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedSessions.map((session, index) => (
                                <tr
                                  key={session._id}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-4 py-4">
                                    <span className="text-sm font-medium">
                                      #{startIndex + index + 1}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm font-medium">
                                      {session.session_code ||
                                        session._id.slice(-6)}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <Badge
                                      variant={
                                        session.is_active
                                          ? "default"
                                          : "secondary"
                                      }
                                      className="text-xs"
                                    >
                                      {session.is_active ? "active" : "ended"}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground text-sm">
                                      {formatDateTimeWithDay(
                                        session.start_time ||
                                          session.created_at,
                                      )}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground text-sm">
                                      {formatDateTimeWithDay(
                                        session.expiry_time ||
                                          session.expires_at,
                                      )}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                      {session.is_active && (
                                        <>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            href={`/session/${session._id}/live`}
                                            className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                            title="View live session"
                                          >
                                            <Activity className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleEndSession(session._id)
                                            }
                                            className="h-8 w-8 p-0"
                                            title="End session"
                                          >
                                            <Square className="h-4 w-4" />
                                          </Button>
                                        </>
                                      )}
                                      <Button
                                        variant="default"
                                        size="sm"
                                        href={`/session/${session._id}`}
                                        className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                        title="View session details"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Sessions Pagination */}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={sessions.length}
                        itemsPerPage={sessionsPerPage}
                        itemName="sessions"
                      />
                    </>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No sessions created yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              {/* Analytics Overview */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                        <BarChart3 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Total Sessions
                        </p>
                        <p className="text-2xl font-bold">{sessions.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-green-500/10 p-2 text-green-500">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Total Students
                        </p>
                        <p className="text-2xl font-bold">
                          {stats?.total_students || students.length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
                        <Activity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Active Sessions
                        </p>
                        <p className="text-2xl font-bold">
                          {sessions.filter((s) => s.is_active).length}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-orange-500/10 p-2 text-orange-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          This Month
                        </p>
                        <p className="text-2xl font-bold">
                          {
                            sessions.filter((s) => {
                              const sessionDate = new Date(
                                s.start_time || s.created_at,
                              );
                              const now = new Date();
                              return (
                                sessionDate.getMonth() === now.getMonth() &&
                                sessionDate.getFullYear() === now.getFullYear()
                              );
                            }).length
                          }
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reports Section */}
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Reports & Analytics
                  </CardTitle>
                  <CardDescription>
                    Generate and download comprehensive attendance reports
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Download & Email Reports Section */}
                  <div>
                    <h3 className="mb-4 text-lg font-semibold">
                      Get reports via email or directly on here
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
                      {/* CSV Report Card */}
                      <Card className="border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 rounded-lg bg-green-500/10 p-2 text-green-500">
                              <Download className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="mb-1 font-semibold">CSV Report</h4>
                              <p className="text-muted-foreground mb-3 text-sm">
                                Download attendance data in spreadsheet format
                                for analysis
                              </p>
                              <Button
                                onClick={() => handleDownloadReport("csv")}
                                size="sm"
                                className="w-full"
                                disabled={isDownloadingCSV}
                              >
                                {isDownloadingCSV ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Download className="mr-2 h-4 w-4" />
                                )}
                                Download CSV
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* PDF Report Card */}
                      <Card className="border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 rounded-lg bg-red-500/10 p-2 text-red-500">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="mb-1 font-semibold">PDF Report</h4>
                              <p className="text-muted-foreground mb-3 text-sm">
                                Generate formatted PDF report for printing and
                                sharing
                              </p>
                              <Button
                                onClick={() => handleDownloadReport("pdf")}
                                size="sm"
                                className="w-full"
                                disabled={isDownloadingPDF}
                              >
                                {isDownloadingPDF ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <FileText className="mr-2 h-4 w-4" />
                                )}
                                Download PDF
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Email CSV Card */}
                      <Card className="border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 rounded-lg bg-blue-500/10 p-2 text-blue-500">
                              <Mail className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="mb-1 font-semibold">
                                Email CSV Report
                              </h4>
                              <p className="text-muted-foreground mb-3 text-sm">
                                Send CSV report directly to your email address
                              </p>
                              <Button
                                onClick={handleEmailCSVReport}
                                size="sm"
                                className="w-full"
                                disabled={isEmailingCSV}
                              >
                                {isEmailingCSV ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Mail className="mr-2 h-4 w-4" />
                                )}
                                Email CSV
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Email PDF Card */}
                      <Card className="border-border/50 bg-muted/20 hover:bg-muted/40 transition-all duration-300">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 rounded-lg bg-purple-500/10 p-2 text-purple-500">
                              <Mail className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <h4 className="mb-1 font-semibold">
                                Email PDF Report
                              </h4>
                              <p className="text-muted-foreground mb-3 text-sm">
                                Send formatted PDF report to your email address
                              </p>
                              <Button
                                onClick={handleEmailPDFReport}
                                size="sm"
                                className="w-full"
                                disabled={isEmailingPDF}
                              >
                                {isEmailingPDF ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                  <Mail className="mr-2 h-4 w-4" />
                                )}
                                Email PDF
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Email Reports Section */}
                  <div className="border-t pt-6">
                    <h3 className="mb-4 text-lg font-semibold">
                      Email Reports
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3"></div>
                  </div>

                  {/* Report Information */}
                  <div className="border-t pt-6">
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="mb-2 flex items-center gap-2 font-semibold">
                        <Settings className="h-4 w-4" />
                        Report Information
                      </h4>
                      <div className="text-muted-foreground space-y-2 text-sm">
                        <p>
                          • Reports include all attendance sessions for this
                          course
                        </p>
                        <p>
                          • CSV format is ideal for data analysis and Excel
                          integration
                        </p>
                        <p>
                          • PDF format provides a formatted, printable summary
                        </p>
                        <p>
                          • Email reports are sent to your registered email
                          address
                        </p>
                        <p>
                          • Reports are generated in real-time with current data
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* End Session Modal - Only for teachers */}
      {!isAdmin && (
        <EndSessionModal
          isOpen={showEndSessionModal}
          onClose={() => {
            setShowEndSessionModal(false);
            setSessionToEnd(null);
          }}
          onConfirm={confirmEndSession}
          session={sessionToEnd}
          isLoading={isEndingSession}
        />
      )}

      {/* Update Course Modal - Only for teachers */}
      {!isAdmin && currentCourse && (
        <UpdateCourseModal
          isOpen={showUpdateCourseModal}
          onClose={() => setShowUpdateCourseModal(false)}
          onUpdateCourse={handleUpdateCourse}
          course={currentCourse}
          isLoading={isLoading}
        />
      )}

      {/* Student Removal Confirmation Modal - Only for teachers */}
      {!isAdmin && (
        <ConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setStudentToRemove(null);
          }}
          onConfirm={confirmRemoveStudent}
          title="Remove Student"
          description={
            studentToRemove
              ? `Are you sure you want to remove ${studentToRemove.name} from this course? This action cannot be undone.`
              : "Are you sure you want to remove this student?"
          }
          confirmText="Remove Student"
          cancelText="Cancel"
          variant="destructive"
          isLoading={removingStudentId === studentToRemove?.id}
        />
      )}
    </DashboardLayout>
  );
}
