"use client";

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  MapPin,
  TrendingDown,
  TrendingUp,
  User,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
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
import { Pagination } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateStudentAttendanceReportPDF } from "@/lib/pdf-generator";
import { useAuthStore } from "@/store/auth-store";

// Types
interface Student {
  _id: string;
  matric_no: string;
  name: string;
  email: string;
  phone?: string;
  level: number;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Course {
  _id: string;
  teacher_id: string;
  course_code: string;
  title: string;
  level: number;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AttendanceRecord {
  _id: string;
  session_id: {
    _id: string;
    session_code: string;
    start_ts: string;
    expiry_ts: string;
  };
  course_id: string;
  student_id: {
    _id: string;
    matric_no: string;
    name: string;
  };
  matric_no_submitted: string;
  device_fingerprint: string;
  lat: number;
  lng: number;
  accuracy: number;
  status: "present" | "absent" | "rejected";
  reason: string;
  receipt_signature: string;
  submitted_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Statistics {
  totalSessions: number;
  attendedSessions: number;
  missedSessions: number;
  attendanceRate: string;
}

interface AttendanceData {
  student: Student;
  course: Course;
  attendanceRecords: AttendanceRecord[];
  statistics: Statistics;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
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

// API function to fetch attendance data
const fetchAttendanceData = async (
  courseId: string,
  studentId: string,
): Promise<AttendanceData> => {
  const token = getAuthToken();
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

  const response = await fetch(
    `${API_BASE_URL}/courses/${courseId}/students/${studentId}/attendance`,
    {
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    },
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch attendance data");
  }

  return response.json();
};

export default function StudentAttendancePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  const studentId = params.studentId as string;

  // Auth store
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Load attendance data
  useEffect(() => {
    const loadAttendanceData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchAttendanceData(courseId, studentId);
        setAttendanceData(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load attendance data";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId && studentId) {
      loadAttendanceData();
    }
  }, [courseId, studentId]);

  // Format functions
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600 bg-green-50 border-green-200";
      case "absent":
        return "text-red-600 bg-red-50 border-red-200";
      case "rejected":
        return "text-orange-600 bg-orange-50 border-orange-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4" />;
      case "absent":
        return <XCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  // Handle PDF download
  const handleDownloadReport = () => {
    if (!attendanceData) {
      toast.error("No attendance data available to download");
      return;
    }

    try {
      generateStudentAttendanceReportPDF(attendanceData);
      toast.success("Student attendance report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF report");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(
    (attendanceData?.attendanceRecords.length || 0) / recordsPerPage,
  );
  const startIndex = (currentPage - 1) * recordsPerPage;
  const endIndex = startIndex + recordsPerPage;
  const paginatedRecords =
    attendanceData?.attendanceRecords.slice(startIndex, endIndex) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading attendance data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !attendanceData) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <XCircle className="text-destructive mx-auto mb-4 h-12 w-12" />
            <h2 className="mb-2 text-lg font-semibold">Failed to Load Data</h2>
            <p className="text-muted-foreground mb-4">
              {error || "Unable to load student attendance data"}
            </p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { student, course, attendanceRecords, statistics } = attendanceData;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb
            items={
              isAdmin && attendanceData?.course.teacher_id
                ? [
                    { label: "Lecturers", href: "/lecturers" },
                    {
                      label: "Lecturer Profile",
                      href: `/lecturers/${attendanceData.course.teacher_id}`,
                    },
                    { label: course.title, href: `/course/${courseId}` },
                    { label: "Students", href: `/students/${courseId}` },
                    { label: "Attendance History", current: true },
                  ]
                : [
                    { label: "Courses", href: "/course" },
                    { label: course.title, href: `/course/${courseId}` },
                    { label: "Students", href: `/students/${courseId}` },
                    { label: "Attendance History", current: true },
                  ]
            }
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 md:hidden">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/students/${courseId}`)}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Students
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Attendance History
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-sm">
                <User className="mr-1 h-3 w-3" />
                {student.matric_no}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                <BookOpen className="mr-1 h-3 w-3" />
                {course.course_code}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {student.name} • {course.title}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              onClick={() => handleDownloadReport()}
              className="hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              <FileText className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Student & Course Info */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 lg:grid-cols-2">
          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-muted-foreground text-sm">Full Name</p>
                <p className="font-semibold">{student.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Matric Number</p>
                <p className="font-mono font-semibold">{student.matric_no}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Email</p>
                <p className="text-sm">{student.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Level</p>
                <p className="text-sm">{formatLevel(student.level)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-muted-foreground text-sm">Course Title</p>
                <p className="font-semibold">{course.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Course Code</p>
                <p className="font-mono font-semibold">{course.course_code}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Level</p>
                <p className="text-sm">{formatLevel(course.level)}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Course ID</p>
                <p className="text-muted-foreground font-mono text-xs">
                  {course._id}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Statistics Cards */}
        <div className="animate-appear grid gap-4 opacity-0 delay-300 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statistics.totalSessions}
              </div>
              <p className="text-muted-foreground text-xs">
                Sessions conducted
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attended</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {statistics.attendedSessions}
              </div>
              <p className="text-muted-foreground text-xs">Sessions attended</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Missed</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {statistics.missedSessions}
              </div>
              <p className="text-muted-foreground text-xs">Sessions missed</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Attendance Rate
              </CardTitle>
              {parseInt(statistics.attendanceRate) >= 75 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  parseInt(statistics.attendanceRate) >= 75
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {statistics.attendanceRate}
              </div>
              <p className="text-muted-foreground text-xs">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Records */}
        <div className="animate-appear opacity-0 delay-400">
          <Tabs defaultValue="records" className="space-y-4">
            <TabsList>
              <TabsTrigger value="records">Attendance Records</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="records" className="space-y-4">
              <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Attendance Records
                  </CardTitle>
                  <CardDescription>
                    Detailed attendance history for {student.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {attendanceRecords.length > 0 ? (
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
                                    Session
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Date & Time
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Status
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Submitted At
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedRecords.map((record, index) => (
                                  <tr
                                    key={record._id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                  >
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <span className="text-xs font-medium">
                                        #{startIndex + index + 1}
                                      </span>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[100px]">
                                        <Badge
                                          variant="secondary"
                                          className="font-mono text-xs"
                                        >
                                          {record.session_id.session_code}
                                        </Badge>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[140px]">
                                        <p className="truncate text-xs font-medium">
                                          {formatDateTime(
                                            record.session_id.start_ts,
                                          )}
                                        </p>
                                        <p className="text-muted-foreground truncate text-xs">
                                          {formatTime(
                                            record.session_id.expiry_ts,
                                          )}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <Badge
                                        variant="outline"
                                        className={`${getStatusColor(record.status)} flex w-fit items-center gap-1 text-xs`}
                                      >
                                        {getStatusIcon(record.status)}
                                        {record.status.charAt(0).toUpperCase() +
                                          record.status.slice(1)}
                                      </Badge>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="text-muted-foreground truncate text-xs">
                                          {formatDateTime(record.submitted_at)}
                                        </p>
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
                                  Session Time
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Attendance Status
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Submitted At
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Location
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedRecords.map((record, index) => (
                                <tr
                                  key={record._id}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                >
                                  <td className="px-4 py-4">
                                    <span className="text-sm font-medium">
                                      #{startIndex + index + 1}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <Badge
                                      variant="secondary"
                                      className="font-mono"
                                    >
                                      {record.session_id.session_code}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="space-y-1">
                                      <p className="text-sm font-medium">
                                        {formatDateTime(
                                          record.session_id.start_ts,
                                        )}
                                      </p>
                                      <div className="flex items-center gap-1">
                                        <Clock className="h-3 w-3 text-green-500" />
                                        <span className="text-muted-foreground text-xs">
                                          Until:{" "}
                                          {formatTime(
                                            record.session_id.expiry_ts,
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <Badge
                                      variant="outline"
                                      className={`${getStatusColor(record.status)} flex w-fit items-center gap-1`}
                                    >
                                      {getStatusIcon(record.status)}
                                      {record.status.charAt(0).toUpperCase() +
                                        record.status.slice(1)}
                                    </Badge>
                                    {record.reason && (
                                      <p className="text-muted-foreground mt-1 text-xs">
                                        Reason: {record.reason}
                                      </p>
                                    )}
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm">
                                      {formatDateTime(record.submitted_at)}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="space-y-1">
                                      <div className="text-muted-foreground flex items-center gap-1 text-sm">
                                        <MapPin className="h-3 w-3" />
                                        <span className="font-mono text-xs">
                                          {record.lat.toFixed(4)},{" "}
                                          {record.lng.toFixed(4)}
                                        </span>
                                      </div>
                                      <p className="text-muted-foreground text-xs">
                                        Accuracy: {Math.round(record.accuracy)}m
                                      </p>
                                      <p className="text-muted-foreground font-mono text-xs">
                                        Device:{" "}
                                        {record.device_fingerprint.slice(0, 8)}
                                        ...
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={setCurrentPage}
                          totalItems={attendanceRecords.length}
                          itemsPerPage={recordsPerPage}
                          itemName="records"
                        />
                      )}
                    </>
                  ) : (
                    <div className="py-12 text-center">
                      <FileText className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No Attendance Records
                      </h3>
                      <p className="text-muted-foreground">
                        {student.name} has not attended any sessions for this
                        course yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Attendance Summary
                  </CardTitle>
                  <CardDescription>
                    Overview of {student.name}&apos;s attendance performance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Attendance Rate Visualization */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Attendance Rate</h4>
                      <span
                        className={`text-2xl font-bold ${
                          parseInt(statistics.attendanceRate) >= 75
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {statistics.attendanceRate}
                      </span>
                    </div>
                    <div className="bg-muted h-2 rounded-full">
                      <div
                        className={`h-2 rounded-full transition-all duration-1000 ${
                          parseInt(statistics.attendanceRate) >= 75
                            ? "bg-green-600"
                            : "bg-red-600"
                        }`}
                        style={{ width: statistics.attendanceRate }}
                      />
                    </div>
                  </div>

                  <Separator />

                  {/* Detailed Statistics */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="font-semibold">Session Statistics</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Total Sessions:
                          </span>
                          <span className="font-medium">
                            {statistics.totalSessions}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">
                            Sessions Attended:
                          </span>
                          <span className="font-medium text-green-600">
                            {statistics.attendedSessions}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Sessions Missed:</span>
                          <span className="font-medium text-red-600">
                            {statistics.missedSessions}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold">Performance Indicators</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Status:</span>
                          <Badge
                            variant={
                              parseInt(statistics.attendanceRate) >= 75
                                ? "default"
                                : "destructive"
                            }
                          >
                            {parseInt(statistics.attendanceRate) >= 75
                              ? "Good"
                              : "Needs Improvement"}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">
                            Participation:
                          </span>
                          <span className="font-medium">
                            {statistics.attendedSessions > 0
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {parseInt(statistics.attendanceRate) < 75 && (
                    <>
                      <Separator />
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:bg-orange-950/20">
                        <div className="flex items-center gap-2">
                          <TrendingDown className="h-5 w-5 text-orange-600" />
                          <h4 className="font-semibold text-orange-600">
                            Attendance Alert
                          </h4>
                        </div>
                        <p className="mt-2 text-sm text-orange-700 dark:text-orange-300">
                          This student&apos;s attendance rate is below 75%.
                          Consider reaching out to discuss any challenges or
                          support needed.
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
