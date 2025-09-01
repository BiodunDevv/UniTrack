"use client";

import {
  Activity,
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  FileText,
  Filter,
  Hash,
  MapPin,
  MapPinIcon,
  MoreVertical,
  Search,
  User,
  UserCheck,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { BulkAttendanceModal } from "@/components/ui/bulk-attendance-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ManualAttendanceModal } from "@/components/ui/manual-attendance-modal";
import {
  generateSessionPDF,
  generateSessionSummaryPDF,
} from "@/lib/pdf-generator";
import { useCourseStore } from "@/store/course-store";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";

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

interface Student {
  _id: string;
  name: string;
  email: string;
  matric_no: string;
  level: number;
  attendance_status: "present" | "absent" | "rejected" | "manual_present";
  submitted_at: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  distance_from_session_m: number | null;
  device_info: {
    user_agent: string;
    ip_address: string;
  } | null;
  reason: string | null;
  has_submitted: boolean;
}

interface SessionDetailResponse {
  session: {
    _id: string;
    course_id: {
      _id: string;
      course_code: string;
      title: string;
    };
    teacher_id: {
      _id: string;
      name: string;
      email: string;
    };
    session_code: string;
    start_ts: string;
    expiry_ts: string;
    lat: number;
    lng: number;
    radius_m: number;
    nonce: string;
    is_active: boolean;
    is_expired: boolean;
    created_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  students: {
    all: Student[];
    present: Student[];
    absent: Student[];
  };
  attendance: Array<{
    _id: string;
    session_id: string;
    course_id: string;
    student_id: {
      _id: string;
      matric_no: string;
      name: string;
      email: string;
      level: number;
    };
    matric_no_submitted: string;
    device_fingerprint: string;
    lat: number;
    lng: number;
    accuracy: number;
    status: "present" | "absent";
    reason: string;
    receipt_signature: string;
    submitted_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  statistics: {
    total_enrolled: number;
    total_submissions: number;
    present_count: number;
    absent_count: number;
    attendance_rate: number;
    submission_rate: number;
  };
}

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [sessionData, setSessionData] =
    React.useState<SessionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Manual attendance state
  const [showManualAttendanceModal, setShowManualAttendanceModal] =
    React.useState(false);
  const [selectedStudent, setSelectedStudent] = React.useState<Student | null>(
    null,
  );
  const [manualAttendanceStatus, setManualAttendanceStatus] = React.useState<
    "present" | "absent"
  >("present");
  const [isUpdatingAttendance, setIsUpdatingAttendance] = React.useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "present" | "absent"
  >("all");

  // Bulk attendance state
  const [selectedStudents, setSelectedStudents] = React.useState<string[]>([]);
  const [showBulkAttendanceModal, setShowBulkAttendanceModal] =
    React.useState(false);

  // Course store
  const { bulkMarkAttendance, markStudentAttendance } = useCourseStore();

  // Fetch session details
  React.useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.message || `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();
        console.log("Session details data:", data);
        setSessionData(data);
      } catch (err) {
        console.error("Session details fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId]);

  const calculateDistance = (
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
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

  const getStatusBadge = (isActive: boolean, isExpired: boolean) => {
    if (isExpired) {
      return <Badge variant="secondary">Expired</Badge>;
    }
    if (isActive) {
      return <Badge className="bg-green-500">Active</Badge>;
    }
    return <Badge variant="outline">Ended</Badge>;
  };

  // Manual attendance functions
  const handleManualAttendance = (
    student: Student,
    status: "present" | "absent" = "present",
  ) => {
    setSelectedStudent(student);
    setManualAttendanceStatus(status);
    setShowManualAttendanceModal(true);
  };

  const handleMarkAsPresent = (student: Student) => {
    handleManualAttendance(student, "present");
  };

  const handleMarkAsAbsent = (student: Student) => {
    handleManualAttendance(student, "absent");
  };

  const submitManualAttendance = async (
    status: "present" | "absent",
    reason: string,
  ) => {
    if (!selectedStudent || !sessionData) return;

    setIsUpdatingAttendance(true);

    try {
      const courseId = sessionData.session.course_id._id;
      const studentId = selectedStudent._id;

      // Use the course store function
      await markStudentAttendance(
        courseId,
        sessionId,
        studentId,
        status,
        reason,
      );

      toast.success(`Attendance marked for ${selectedStudent.name}`, {
        description: `Student has been manually marked as ${status}`,
        duration: 4000,
      });

      // Refresh session data to reflect changes
      const token = getAuthToken();
      if (token) {
        const refreshResponse = await fetch(
          `${API_BASE_URL}/sessions/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          setSessionData(refreshedData);
        }
      }

      // Close modal and reset
      setShowManualAttendanceModal(false);
      setSelectedStudent(null);
    } catch (error) {
      console.error("Manual attendance error:", error);
      toast.error("Failed to mark attendance", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        duration: 4000,
      });
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

  // Bulk attendance functions
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  const handleSelectAllStudents = () => {
    const filteredStudents = getFilteredStudents();
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student._id));
    }
  };

  const handleBulkAttendance = () => {
    setShowBulkAttendanceModal(true);
  };

  const submitBulkAttendance = async (
    students: Array<{
      studentId: string;
      status: "present" | "absent";
      reason: string;
    }>,
  ) => {
    if (!sessionData) return;

    setIsUpdatingAttendance(true);

    try {
      const courseId = sessionData.session.course_id._id;

      // Use the course store function
      const result = await bulkMarkAttendance(courseId, sessionId, students);

      toast.success(`Bulk attendance completed`, {
        description: `${result.summary.successful} students marked successfully`,
        duration: 4000,
      });

      // Refresh session data to reflect changes
      const token = getAuthToken();
      if (token) {
        const refreshResponse = await fetch(
          `${API_BASE_URL}/sessions/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (refreshResponse.ok) {
          const refreshedData = await refreshResponse.json();
          setSessionData(refreshedData);
        }
      }

      // Clear selected students and close modal
      setSelectedStudents([]);
      setShowBulkAttendanceModal(false);
    } catch (error) {
      console.error("Bulk attendance error:", error);
      toast.error("Failed to mark bulk attendance", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        duration: 4000,
      });
    } finally {
      setIsUpdatingAttendance(false);
    }
  };

  // Filter and search functions
  const getFilteredStudents = () => {
    if (!sessionData) return [];

    let filtered = sessionData.students.all;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(query) ||
          student.matric_no.toLowerCase().includes(query),
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((student) => {
        if (statusFilter === "present") {
          // Include both "present" and "manual_present" students in present filter
          return (
            student.attendance_status === "present" ||
            student.attendance_status === "manual_present"
          );
        }
        return student.attendance_status === statusFilter;
      });
    }

    // Sort by attendance status (present first), then by name
    return filtered.sort((a, b) => {
      // Helper function to determine if status is considered "present"
      const isPresent = (status: string) =>
        status === "present" || status === "manual_present";

      const aIsPresent = isPresent(a.attendance_status);
      const bIsPresent = isPresent(b.attendance_status);

      if (aIsPresent !== bIsPresent) {
        if (aIsPresent) return -1;
        if (bIsPresent) return 1;
        return 0;
      }
      return a.name.localeCompare(b.name);
    });
  };

  const downloadDetailedPDF = () => {
    if (!sessionData) return;

    try {
      generateSessionPDF({
        session: sessionData.session,
        students: sessionData.students,
        attendance: sessionData.attendance,
        statistics: sessionData.statistics,
      });
    } catch (error) {
      console.error("Failed to generate detailed PDF:", error);
    }
  };

  const downloadSummaryPDF = () => {
    if (!sessionData) return;

    try {
      generateSessionSummaryPDF({
        session: sessionData.session,
        students: sessionData.students,
        attendance: sessionData.attendance,
        statistics: sessionData.statistics,
      });
    } catch (error) {
      console.error("Failed to generate summary PDF:", error);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !sessionData) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-red-500">{error || "Session not found"}</p>
            <div className="flex justify-center gap-2">
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { session, students, attendance, statistics } = sessionData;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb
            items={[
              { label: "Courses", href: "/course" },
              {
                label: session.course_id.title,
                href: `/course/${session.course_id._id}`,
              },
              { label: `Session ${session.session_code}`, current: true },
            ]}
          />
        </div>

        {/* Header */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="md:hidden"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Session Details</h1>
              <p className="text-muted-foreground">
                {session.course_id.course_code} - {session.course_id.title}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {session.is_active && !session.is_expired && (
              <Button
                onClick={() => router.push(`/session/${sessionId}/live`)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Activity className="mr-2 h-4 w-4" />
                View Live
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default">
                  <Download className="mr-2 h-4 w-4" />
                  Download Report
                  <MoreVertical className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={downloadDetailedPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Detailed PDF Report
                </DropdownMenuItem>
                <DropdownMenuItem onClick={downloadSummaryPDF}>
                  <FileText className="mr-2 h-4 w-4" />
                  Summary PDF Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-4">
          {/* Session Info - Takes 3 columns on desktop */}
          <div className="lg:col-span-3">
            <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Session Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium">Session Code</label>
                    <p className="text-primary mt-1 font-mono text-xl font-bold sm:text-2xl">
                      {session.session_code}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(session.is_active, session.is_expired)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Teacher</label>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {session.teacher_id.name}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Start Time</label>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formatDateTimeWithDay(session.start_ts)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {formatDateTimeWithDay(session.expiry_ts)}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Location</label>
                    <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">
                        {session.lat.toFixed(6)}, {session.lng.toFixed(6)}
                      </span>
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Radius: {session.radius_m}m
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar - Takes 1 column on desktop */}
          <div className="lg:col-span-1">
            <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-2 lg:gap-0 lg:space-y-4">
                  <div className="text-center lg:text-left">
                    <div className="text-primary text-xl font-bold sm:text-2xl">
                      {statistics.total_enrolled}
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm">
                      Enrolled
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-xl font-bold text-green-600 sm:text-2xl">
                      {statistics.present_count}
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm">
                      Present
                    </div>
                  </div>
                  <div className="text-center lg:text-left">
                    <div className="text-xl font-bold text-orange-600 sm:text-2xl">
                      {statistics.absent_count}
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm">
                      Absent
                    </div>
                  </div>
                  <div className="text-center lg:pt-4 lg:text-left">
                    <div className="text-primary text-xl font-bold sm:text-2xl">
                      {statistics.attendance_rate}%
                    </div>
                    <div className="text-muted-foreground text-xs sm:text-sm">
                      Rate
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Full Width Attendance Table */}
        <div className="animate-appear opacity-0 delay-300">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 flex-shrink-0" />
                  <span className="truncate">
                    Attendance Records ({getFilteredStudents().length})
                  </span>
                </CardTitle>
                {attendance.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs text-green-600 sm:text-sm"
                    >
                      Present: {statistics.present_count}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs text-orange-600 sm:text-sm"
                    >
                      Absent: {statistics.absent_count}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Search and Filter Controls */}
              {students.all.length > 0 && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  {/* Search Bar */}
                  <div className="relative flex-1 sm:max-w-sm">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Search by name or matric number..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10 pl-10"
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>

                  {/* Status Filter */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Filter className="h-4 w-4" />
                        {statusFilter === "all"
                          ? "All Students"
                          : statusFilter === "present"
                            ? "Present Only"
                            : "Absent Only"}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("all")}
                        className={statusFilter === "all" ? "bg-accent" : ""}
                      >
                        All Students
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("present")}
                        className={
                          statusFilter === "present" ? "bg-accent" : ""
                        }
                      >
                        Present Only
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setStatusFilter("absent")}
                        className={statusFilter === "absent" ? "bg-accent" : ""}
                      >
                        Absent Only
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Bulk Actions */}
              {students.all.length > 0 && (
                <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground text-sm">
                      {selectedStudents.length} of{" "}
                      {getFilteredStudents().length} selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllStudents}
                    >
                      {selectedStudents.length === getFilteredStudents().length
                        ? "Deselect All"
                        : "Select All"}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleBulkAttendance}
                      disabled={selectedStudents.length === 0}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Bulk Mark ({selectedStudents.length})
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0 sm:p-6">
              {students.all.length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Users className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">
                    No students enrolled in this session
                  </p>
                  {session.is_active && (
                    <p className="text-muted-foreground mt-2 text-sm">
                      Students can mark attendance using session code:{" "}
                      <span className="font-mono font-semibold">
                        {session.session_code}
                      </span>
                    </p>
                  )}
                </div>
              ) : getFilteredStudents().length === 0 ? (
                <div className="px-6 py-8 text-center">
                  <Search className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground mb-2">
                    No students found matching your criteria
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Try adjusting your search or filter settings
                  </p>
                  <div className="mt-4 flex justify-center gap-2">
                    {searchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                      >
                        Clear search
                      </Button>
                    )}
                    {statusFilter !== "all" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStatusFilter("all")}
                      >
                        Show all students
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  {/* Mobile Horizontal Scrollable Table */}
                  <div className="block sm:hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-[800px] px-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-border border-b">
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedStudents.length ===
                                      getFilteredStudents().length &&
                                    getFilteredStudents().length > 0
                                  }
                                  onChange={handleSelectAllStudents}
                                  className="rounded border-gray-300"
                                />
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                #
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Student
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Status
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Distance
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Accuracy
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Time
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Location
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredStudents().length > 0 ? (
                              getFilteredStudents().map((student, index) => {
                                // Find matching attendance record if exists
                                const attendanceRecord = attendance.find(
                                  (record) =>
                                    record.student_id._id === student._id,
                                );

                                // Calculate distance if attendance record exists and has location
                                let distance = null;
                                if (
                                  attendanceRecord &&
                                  attendanceRecord.lat &&
                                  attendanceRecord.lng
                                ) {
                                  distance = calculateDistance(
                                    attendanceRecord.lat,
                                    attendanceRecord.lng,
                                    session.lat,
                                    session.lng,
                                  );
                                } else if (
                                  student.distance_from_session_m !== null
                                ) {
                                  // Fallback to student's distance if available
                                  distance = student.distance_from_session_m;
                                }

                                const isWithinRadius = distance
                                  ? distance <= session.radius_m
                                  : false;

                                return (
                                  <tr
                                    key={student._id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                  >
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(
                                          student._id,
                                        )}
                                        onChange={() =>
                                          handleSelectStudent(student._id)
                                        }
                                        className="rounded border-gray-300"
                                      />
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <div className="flex items-center gap-1">
                                        {student.attendance_status ===
                                          "present" ||
                                        student.attendance_status ===
                                          "manual_present" ? (
                                          <CheckCircle className="h-3 w-3 flex-shrink-0 text-green-500" />
                                        ) : (
                                          <XCircle className="h-3 w-3 flex-shrink-0 text-red-500" />
                                        )}
                                        <span className="text-xs font-medium">
                                          #{index + 1}
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="truncate text-xs font-medium">
                                          {student.name}
                                        </p>
                                        <p className="text-muted-foreground truncate text-xs">
                                          {student.matric_no}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <Badge
                                        variant={
                                          student.attendance_status ===
                                            "present" ||
                                          student.attendance_status ===
                                            "manual_present"
                                            ? "default"
                                            : student.attendance_status ===
                                                "rejected"
                                              ? "destructive"
                                              : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {student.attendance_status ===
                                        "manual_present"
                                          ? "MANUAL PRESENT"
                                          : student.attendance_status.toUpperCase()}
                                      </Badge>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      {distance !== null ? (
                                        <span
                                          className={`rounded px-2 py-1 text-xs ${
                                            isWithinRadius
                                              ? "bg-green-100 text-green-700"
                                              : "bg-red-100 text-red-700"
                                          }`}
                                        >
                                          {Math.round(distance)}m
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">
                                          -
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      {attendanceRecord ? (
                                        <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                          ±{attendanceRecord.accuracy}m
                                        </span>
                                      ) : (
                                        <span className="text-muted-foreground text-xs">
                                          -
                                        </span>
                                      )}
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <p className="min-w-[100px] text-xs">
                                        {student.submitted_at
                                          ? formatDateTimeWithDay(
                                              student.submitted_at,
                                            )
                                          : "-"}
                                      </p>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <div className="flex min-w-[100px] items-center gap-1">
                                        <MapPinIcon className="text-muted-foreground h-3 w-3 flex-shrink-0" />
                                        <p className="text-muted-foreground truncate text-xs">
                                          {attendanceRecord
                                            ? `${attendanceRecord.lat.toFixed(4)}, ${attendanceRecord.lng.toFixed(4)}`
                                            : "-"}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <div className="flex gap-1">
                                        {student.attendance_status ===
                                          "absent" && (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() =>
                                              handleMarkAsPresent(student)
                                            }
                                            className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                            title="Mark as present manually"
                                          >
                                            <UserCheck className="h-3 w-3" />
                                          </Button>
                                        )}
                                        {(student.attendance_status ===
                                          "present" ||
                                          student.attendance_status ===
                                            "manual_present") && (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                              handleMarkAsAbsent(student)
                                            }
                                            className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                            title="Mark as absent manually"
                                          >
                                            <X className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })
                            ) : (
                              <tr>
                                <td
                                  colSpan={9}
                                  className="px-4 py-8 text-center"
                                >
                                  <p className="text-muted-foreground text-sm">
                                    {searchQuery || statusFilter !== "all"
                                      ? "No students found matching your search criteria"
                                      : "No students enrolled"}
                                  </p>
                                </td>
                              </tr>
                            )}
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
                            <th className="text-muted-foreground w-12 px-4 py-3 text-left text-sm font-medium">
                              <input
                                type="checkbox"
                                checked={
                                  selectedStudents.length ===
                                    getFilteredStudents().length &&
                                  getFilteredStudents().length > 0
                                }
                                onChange={handleSelectAllStudents}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              #
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Student
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Distance
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Accuracy
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Time
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Location
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredStudents().length > 0 ? (
                            getFilteredStudents().map((student, index) => {
                              // Find matching attendance record if exists
                              const attendanceRecord = attendance.find(
                                (record) =>
                                  record.student_id._id === student._id,
                              );

                              // Calculate distance if attendance record exists and has location
                              let distance = null;
                              if (
                                attendanceRecord &&
                                attendanceRecord.lat &&
                                attendanceRecord.lng
                              ) {
                                distance = calculateDistance(
                                  attendanceRecord.lat,
                                  attendanceRecord.lng,
                                  session.lat,
                                  session.lng,
                                );
                              } else if (
                                student.distance_from_session_m !== null
                              ) {
                                // Fallback to student's distance if available
                                distance = student.distance_from_session_m;
                              }

                              const isWithinRadius = distance
                                ? distance <= session.radius_m
                                : false;

                              return (
                                <tr
                                  key={student._id}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-4 py-4">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(
                                        student._id,
                                      )}
                                      onChange={() =>
                                        handleSelectStudent(student._id)
                                      }
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                      {student.attendance_status ===
                                        "present" ||
                                      student.attendance_status ===
                                        "manual_present" ? (
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                      ) : (
                                        <XCircle className="h-4 w-4 text-red-500" />
                                      )}
                                      <span className="text-sm font-medium">
                                        #{index + 1}
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div>
                                      <p className="text-sm font-medium">
                                        {student.name}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {student.matric_no}
                                      </p>
                                      <p className="text-muted-foreground text-xs">
                                        {student.email}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="space-y-1">
                                      <Badge
                                        variant={
                                          student.attendance_status ===
                                            "present" ||
                                          student.attendance_status ===
                                            "manual_present"
                                            ? "default"
                                            : student.attendance_status ===
                                                "rejected"
                                              ? "destructive"
                                              : "secondary"
                                        }
                                        className="text-xs"
                                      >
                                        {student.attendance_status ===
                                        "manual_present"
                                          ? "MANUAL PRESENT"
                                          : student.attendance_status.toUpperCase()}
                                      </Badge>
                                      {student.reason && (
                                        <p className="text-muted-foreground text-xs italic">
                                          {student.reason}
                                        </p>
                                      )}
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    {distance !== null ? (
                                      <span
                                        className={`rounded px-2 py-1 text-xs ${
                                          isWithinRadius
                                            ? "bg-green-100 text-green-700"
                                            : "bg-red-100 text-red-700"
                                        }`}
                                      >
                                        {Math.round(distance)}m
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">
                                        -
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4">
                                    {attendanceRecord ? (
                                      <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
                                        ±{attendanceRecord.accuracy}m
                                      </span>
                                    ) : (
                                      <span className="text-muted-foreground text-xs">
                                        -
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm">
                                      {student.submitted_at
                                        ? formatDateTimeWithDay(
                                            student.submitted_at,
                                          )
                                        : "-"}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex items-center gap-1">
                                      <MapPinIcon className="text-muted-foreground h-3 w-3" />
                                      <p className="text-muted-foreground text-xs">
                                        {attendanceRecord
                                          ? `${attendanceRecord.lat.toFixed(4)}, ${attendanceRecord.lng.toFixed(4)}`
                                          : "-"}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                      {student.attendance_status ===
                                        "absent" && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                            handleMarkAsPresent(student)
                                          }
                                          className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                          title="Mark as present manually"
                                        >
                                          <UserCheck className="h-4 w-4" />
                                        </Button>
                                      )}
                                      {(student.attendance_status ===
                                        "present" ||
                                        student.attendance_status ===
                                          "manual_present") && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleMarkAsAbsent(student)
                                          }
                                          className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                          title="Mark as absent manually"
                                        >
                                          <X className="h-4 w-4" />
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          ) : (
                            <tr>
                              <td colSpan={9} className="px-4 py-8 text-center">
                                <p className="text-muted-foreground text-sm">
                                  {searchQuery || statusFilter !== "all"
                                    ? "No students found matching your search criteria"
                                    : "No students enrolled"}
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Manual Attendance Modal */}
      <ManualAttendanceModal
        isOpen={showManualAttendanceModal}
        onClose={() => {
          setShowManualAttendanceModal(false);
          setSelectedStudent(null);
        }}
        onSubmit={submitManualAttendance}
        student={selectedStudent}
        isLoading={isUpdatingAttendance}
        sessionCode={sessionData?.session.session_code || ""}
        courseName={
          sessionData
            ? `${sessionData.session.course_id.course_code} - ${sessionData.session.course_id.title}`
            : ""
        }
        defaultStatus={manualAttendanceStatus}
      />

      {/* Bulk Attendance Modal */}
      <BulkAttendanceModal
        isOpen={showBulkAttendanceModal}
        onClose={() => {
          setShowBulkAttendanceModal(false);
          setSelectedStudents([]);
        }}
        onSubmit={submitBulkAttendance}
        selectedStudents={
          sessionData
            ? getFilteredStudents().filter((student) =>
                selectedStudents.includes(student._id),
              )
            : []
        }
        isLoading={isUpdatingAttendance}
        sessionCode={sessionData?.session.session_code || ""}
        courseName={
          sessionData
            ? `${sessionData.session.course_id.course_code} - ${sessionData.session.course_id.title}`
            : ""
        }
      />
    </DashboardLayout>
  );
}
