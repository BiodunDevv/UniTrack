"use client";

import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  GraduationCap,
  Search,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  UserX,
  X,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import * as React from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
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
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateCourseAttendanceReportPDF } from "@/lib/pdf-generator";
import { useCourseStore } from "@/store/course-store";

function CourseAttendanceReportPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const {
    attendanceReport,
    currentCourse,
    isLoading,
    error,
    getCourseAttendanceReport,
    getCourse,
    clearError,
  } = useCourseStore();

  const [activeTab, setActiveTab] = React.useState("overview");

  // Pagination state for students below 75%
  const [currentPageBelow75, setCurrentPageBelow75] = useState(1);
  const [searchQueryBelow75, setSearchQueryBelow75] = useState("");

  // Pagination state for all students
  const [currentPageAllStudents, setCurrentPageAllStudents] = useState(1);
  const [searchQueryAllStudents, setSearchQueryAllStudents] = useState("");

  // Pagination state for sessions
  const [currentPageSessions, setCurrentPageSessions] = useState(1);

  const studentsPerPage = 10;
  const sessionsPerPage = 10;

  React.useEffect(() => {
    if (courseId) {
      getCourse(courseId);
      getCourseAttendanceReport(courseId);
    }
  }, [courseId, getCourse, getCourseAttendanceReport]);


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

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-green-100 text-green-800 border-green-200";
    }
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 75) return "text-green-600";
    if (rate >= 50) return "text-orange-600";
    return "text-red-600";
  };

  // Chart data for sessions overview
  const sessionsChartData = React.useMemo(() => {
    if (!attendanceReport?.sessions_overview) return [];

    return attendanceReport.sessions_overview.map((session) => ({
      session: session.session_code,
      present: session.present_count,
      absent: session.absent_count,
      attendance_rate: session.attendance_rate,
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time,
    }));
  }, [attendanceReport?.sessions_overview]);

  // Chart configuration
  const chartConfig = {
    present: {
      label: "Present",
      color: "hsl(142, 76%, 36%)",
    },
    absent: {
      label: "Absent",
      color: "hsl(0, 84%, 60%)",
    },
    attendance_rate: {
      label: "Attendance Rate",
      color: "hsl(220, 70%, 50%)",
    },
  } satisfies ChartConfig;

  const [activeChart, setActiveChart] =
    React.useState<keyof typeof chartConfig>("attendance_rate");

  const handleDownloadReport = () => {
    if (attendanceReport) {
      generateCourseAttendanceReportPDF(attendanceReport);
      toast.success("Report downloaded successfully!");
    }
  };

  // Filter students below 75% based on search query
  const filteredStudentsBelow75 = React.useMemo(() => {
    if (!attendanceReport?.students_below_75_percent) return [];
    if (!searchQueryBelow75) return attendanceReport.students_below_75_percent;

    const query = searchQueryBelow75.toLowerCase();
    return attendanceReport.students_below_75_percent.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.matric_no.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query),
    );
  }, [attendanceReport?.students_below_75_percent, searchQueryBelow75]);

  // Filter all students based on search query
  const filteredAllStudents = React.useMemo(() => {
    if (!attendanceReport?.all_students) return [];
    if (!searchQueryAllStudents) return attendanceReport.all_students;

    const query = searchQueryAllStudents.toLowerCase();
    return attendanceReport.all_students.filter(
      (studentData) =>
        studentData.student.name.toLowerCase().includes(query) ||
        studentData.student.matric_no.toLowerCase().includes(query) ||
        studentData.student.email.toLowerCase().includes(query),
    );
  }, [attendanceReport?.all_students, searchQueryAllStudents]);

  // Pagination logic for students below 75%
  const totalPagesBelow75 = Math.ceil(
    filteredStudentsBelow75.length / studentsPerPage,
  );
  const startIndexBelow75 = (currentPageBelow75 - 1) * studentsPerPage;
  const endIndexBelow75 = startIndexBelow75 + studentsPerPage;
  const paginatedStudentsBelow75 = filteredStudentsBelow75.slice(
    startIndexBelow75,
    endIndexBelow75,
  );

  // Pagination logic for all students
  const totalPagesAllStudents = Math.ceil(
    filteredAllStudents.length / studentsPerPage,
  );
  const startIndexAllStudents = (currentPageAllStudents - 1) * studentsPerPage;
  const endIndexAllStudents = startIndexAllStudents + studentsPerPage;
  const paginatedAllStudents = filteredAllStudents.slice(
    startIndexAllStudents,
    endIndexAllStudents,
  );

  // Pagination logic for sessions
  const totalPagesSessions = Math.ceil(
    (attendanceReport?.sessions_overview?.length || 0) / sessionsPerPage,
  );
  const startIndexSessions = (currentPageSessions - 1) * sessionsPerPage;
  const endIndexSessions = startIndexSessions + sessionsPerPage;
  const paginatedSessions =
    attendanceReport?.sessions_overview?.slice(
      startIndexSessions,
      endIndexSessions,
    ) || [];

  // Reset pagination when search query changes
  React.useEffect(() => {
    setCurrentPageBelow75(1);
  }, [searchQueryBelow75]);

  React.useEffect(() => {
    setCurrentPageAllStudents(1);
  }, [searchQueryAllStudents]);

  if (isLoading && !attendanceReport) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">
              Loading attendance report...
            </p>
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

  if (!attendanceReport || !currentCourse) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              Attendance report not found
            </p>
            <Button onClick={() => router.push("/course")}>
              Go to Courses
            </Button>
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
            items={[
              { label: "Courses", href: "/course" },
              {
                label: currentCourse.title,
                href: `/course/${courseId}`,
              },
              { label: "Attendance Report", current: true },
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
                onClick={() => router.push(`/course/${courseId}`)}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Attendance Report
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-sm">
                <BarChart3 className="mr-1 h-3 w-3" />
                {attendanceReport.course.course_code}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {formatLevel(attendanceReport.course.level)}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {attendanceReport.course.title}
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleDownloadReport}
              className="transition-all duration-300"
            >
              <Download className="mr-2 h-4 w-4" />
              Download course report
            </Button>
          </div>
        </div>

        {/* Summary Stats Cards */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Overall Attendance
              </CardTitle>
              <Target className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div
                className={`group-hover:text-primary text-2xl font-bold transition-all duration-300 ${getAttendanceRateColor(attendanceReport.summary.overall_attendance_rate)}`}
              >
                {attendanceReport.summary.overall_attendance_rate.toFixed(1)}%
              </div>
              <p className="text-muted-foreground text-xs">
                Course average attendance
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Sessions
              </CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendanceReport.summary.total_sessions}
              </div>
              <p className="text-muted-foreground text-xs">
                Sessions conducted
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Students Meeting 75%
              </CardTitle>
              <CheckCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendanceReport.summary.students_meeting_75_percent}
              </div>
              <p className="text-muted-foreground text-xs">
                Out of {attendanceReport.summary.total_students} students
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                At-Risk Students
              </CardTitle>
              <AlertTriangle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {attendanceReport.risk_analysis.total_at_risk}
              </div>
              <p className="text-muted-foreground text-xs">Need improvement</p>
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
                value="sessions"
                className="transition-all duration-300"
              >
                Session
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className="transition-all duration-300"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="insights"
                className="transition-all duration-300"
              >
                Insights
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Risk Analysis Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-red-800">
                      Critical Risk
                    </CardTitle>
                    <div className="rounded-lg bg-red-500/10 p-2 text-red-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-red-500/20">
                      <XCircle className="h-4 w-4 group-hover:animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-700 transition-colors duration-300 group-hover:text-red-600/90">
                      {attendanceReport.risk_analysis.critical_risk}
                    </div>
                    <p className="text-xs text-red-600 transition-colors duration-300 group-hover:text-red-700/80">
                      Students below 50% attendance
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800">
                      High Risk
                    </CardTitle>
                    <div className="rounded-lg bg-orange-500/10 p-2 text-orange-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-orange-500/20">
                      <AlertTriangle className="h-4 w-4 group-hover:animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-700 transition-colors duration-300 group-hover:text-orange-600/90">
                      {attendanceReport.risk_analysis.high_risk}
                    </div>
                    <p className="text-xs text-orange-600 transition-colors duration-300 group-hover:text-orange-700/80">
                      Students 50-65% attendance
                    </p>
                  </CardContent>
                </Card>

                <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-yellow-800">
                      Medium Risk
                    </CardTitle>
                    <div className="rounded-lg bg-yellow-500/10 p-2 text-yellow-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-yellow-500/20">
                      <Clock className="h-4 w-4 group-hover:animate-pulse" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-700 transition-colors duration-300 group-hover:text-yellow-600/90">
                      {attendanceReport.risk_analysis.medium_risk}
                    </div>
                    <p className="text-xs text-yellow-600 transition-colors duration-300 group-hover:text-yellow-700/80">
                      Students 65-74% attendance
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Sessions Overview Chart */}
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 py-4 backdrop-blur-sm transition-all duration-500 sm:py-0">
                <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                  <div className="flex flex-1 flex-col justify-center gap-1 px-6 pb-3 sm:pb-0">
                    <CardTitle className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-blue-500/20">
                        <BarChart3 className="h-4 w-4 group-hover:animate-pulse" />
                      </div>
                      Sessions Attendance Overview
                    </CardTitle>
                    <CardDescription>
                      Attendance trends across all sessions
                    </CardDescription>
                  </div>
                  <div className="flex">
                    {["present", "absent", "attendance_rate"].map((key) => {
                      const chart = key as keyof typeof chartConfig;
                      return (
                        <button
                          key={chart}
                          data-active={activeChart === chart}
                          className="data-[active=true]:bg-muted/50 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6"
                          onClick={() => setActiveChart(chart)}
                        >
                          <span className="text-muted-foreground text-xs">
                            {chartConfig[chart].label}
                          </span>
                          <span className="text-lg leading-none font-bold sm:text-3xl">
                            {chart === "attendance_rate"
                              ? `${(sessionsChartData.length > 0 ? sessionsChartData.reduce((acc, curr) => acc + curr.attendance_rate, 0) / sessionsChartData.length : 0).toFixed(1)}%`
                              : chart === "present"
                                ? sessionsChartData
                                    .reduce(
                                      (acc, curr) => acc + curr.present,
                                      0,
                                    )
                                    .toLocaleString()
                                : sessionsChartData
                                    .reduce((acc, curr) => acc + curr.absent, 0)
                                    .toLocaleString()}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </CardHeader>
                <CardContent className="px-2 sm:p-6">
                  {sessionsChartData.length > 0 ? (
                    <ChartContainer
                      config={chartConfig}
                      className="aspect-auto h-[250px] w-full"
                    >
                      <LineChart
                        accessibilityLayer
                        data={sessionsChartData}
                        margin={{
                          left: 12,
                          right: 12,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="session"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          minTickGap={32}
                          tickFormatter={(value) => {
                            return `S${value.replace("Session ", "")}`;
                          }}
                        />
                        <ChartTooltip
                          content={
                            <ChartTooltipContent
                              className="w-[200px]"
                              nameKey="views"
                              labelFormatter={(value) => {
                                const sessionData = sessionsChartData.find(
                                  (d) => d.session === value,
                                );
                                if (sessionData) {
                                  return formatDateWithDay(sessionData.date);
                                }
                                return value;
                              }}
                            />
                          }
                        />
                        <Line
                          dataKey={activeChart}
                          type="monotone"
                          stroke={chartConfig[activeChart].color}
                          strokeWidth={2}
                          dot={{
                            fill: chartConfig[activeChart].color,
                            strokeWidth: 2,
                            r: 4,
                          }}
                          activeDot={{
                            r: 6,
                            stroke: chartConfig[activeChart].color,
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ChartContainer>
                  ) : (
                    <div className="text-muted-foreground flex h-[250px] items-center justify-center">
                      No session data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sessions Tab */}
            <TabsContent value="sessions" className="space-y-4">
              <div className="grid gap-4 sm:gap-6">
                {/* Best and Worst Sessions */}
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-2">
                  <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm text-green-800 sm:text-base">
                        <div className="rounded-lg bg-green-500/10 p-1.5 text-green-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-green-500/20 sm:p-2">
                          <TrendingUp className="h-3 w-3 group-hover:animate-pulse sm:h-4 sm:w-4" />
                        </div>
                        Best Attended Session
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm font-medium sm:text-base">
                        Session{" "}
                        {
                          attendanceReport.insights.best_attended_session
                            .session_code
                        }
                      </div>
                      <div className="text-muted-foreground text-xs sm:text-sm">
                        {formatDateWithDay(
                          attendanceReport.insights.best_attended_session.date,
                        )}
                      </div>
                      <div className="text-xl font-bold text-green-700 transition-colors duration-300 group-hover:text-green-600/90 sm:text-2xl">
                        {attendanceReport.insights.best_attended_session.attendance_rate.toFixed(
                          1,
                        )}
                        %
                      </div>
                      <div className="text-xs sm:text-sm">
                        {
                          attendanceReport.insights.best_attended_session
                            .present_count
                        }{" "}
                        present,{" "}
                        {
                          attendanceReport.insights.best_attended_session
                            .absent_count
                        }{" "}
                        absent
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-sm text-red-800 sm:text-base">
                        <div className="rounded-lg bg-red-500/10 p-1.5 text-red-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-red-500/20 sm:p-2">
                          <TrendingDown className="h-3 w-3 group-hover:animate-pulse sm:h-4 sm:w-4" />
                        </div>
                        Worst Attended Session
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="text-sm font-medium sm:text-base">
                        Session{" "}
                        {
                          attendanceReport.insights.worst_attended_session
                            .session_code
                        }
                      </div>
                      <div className="text-muted-foreground text-xs sm:text-sm">
                        {formatDateWithDay(
                          attendanceReport.insights.worst_attended_session.date,
                        )}
                      </div>
                      <div className="text-xl font-bold text-red-700 transition-colors duration-300 group-hover:text-red-600/90 sm:text-2xl">
                        {attendanceReport.insights.worst_attended_session.attendance_rate.toFixed(
                          1,
                        )}
                        %
                      </div>
                      <div className="text-xs sm:text-sm">
                        {
                          attendanceReport.insights.worst_attended_session
                            .present_count
                        }{" "}
                        present,{" "}
                        {
                          attendanceReport.insights.worst_attended_session
                            .absent_count
                        }{" "}
                        absent
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* All Sessions Table */}
                <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                          <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                          All Sessions
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Detailed breakdown of each session
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 sm:p-6">
                    {attendanceReport.sessions_overview.length > 0 ? (
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
                                      Date
                                    </th>
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      Time
                                    </th>
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      Present
                                    </th>
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      Absent
                                    </th>
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      Attendance Rate
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {paginatedSessions.map((session, index) => (
                                    <tr
                                      key={session.session_id}
                                      className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                    >
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <span className="text-xs font-medium">
                                          #{startIndexSessions + index + 1}
                                        </span>
                                      </td>
                                      <td className="px-2 py-3">
                                        <div className="min-w-[100px]">
                                          <p className="truncate text-xs font-medium">
                                            Session {session.session_code}
                                          </p>
                                        </div>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <p className="text-muted-foreground text-xs">
                                          {formatDateWithDay(session.date)}
                                        </p>
                                      </td>
                                      <td className="px-2 py-3">
                                        <div className="min-w-[100px]">
                                          <p className="text-muted-foreground text-xs">
                                            {new Date(
                                              session.start_time,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}{" "}
                                            -{" "}
                                            {new Date(
                                              session.end_time,
                                            ).toLocaleTimeString([], {
                                              hour: "2-digit",
                                              minute: "2-digit",
                                            })}
                                          </p>
                                        </div>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <Badge
                                          variant="secondary"
                                          className="bg-green-100 text-xs text-green-800"
                                        >
                                          {session.present_count}
                                        </Badge>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <Badge
                                          variant="secondary"
                                          className="bg-red-100 text-xs text-red-800"
                                        >
                                          {session.absent_count}
                                        </Badge>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <span
                                          className={`text-xs font-semibold ${getAttendanceRateColor(session.attendance_rate)}`}
                                        >
                                          {session.attendance_rate.toFixed(1)}%
                                        </span>
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
                                    Session
                                  </th>
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Date
                                  </th>
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Time
                                  </th>
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Present
                                  </th>
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Absent
                                  </th>
                                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                    Attendance Rate
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedSessions.map((session, index) => (
                                  <tr
                                    key={session.session_id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                  >
                                    <td className="px-4 py-4">
                                      <span className="text-sm font-medium">
                                        #{startIndexSessions + index + 1}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4">
                                      <p className="text-sm font-medium">
                                        Session {session.session_code}
                                      </p>
                                    </td>
                                    <td className="px-4 py-4">
                                      <p className="text-muted-foreground text-sm">
                                        {formatDateWithDay(session.date)}
                                      </p>
                                    </td>
                                    <td className="px-4 py-4">
                                      <p className="text-muted-foreground text-sm">
                                        {new Date(
                                          session.start_time,
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}{" "}
                                        -{" "}
                                        {new Date(
                                          session.end_time,
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </p>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-800"
                                      >
                                        {session.present_count}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Badge
                                        variant="secondary"
                                        className="bg-red-100 text-red-800"
                                      >
                                        {session.absent_count}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                      <span
                                        className={`text-sm font-semibold ${getAttendanceRateColor(session.attendance_rate)}`}
                                      >
                                        {session.attendance_rate.toFixed(1)}%
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Pagination */}
                        <Pagination
                          currentPage={currentPageSessions}
                          totalPages={totalPagesSessions}
                          onPageChange={setCurrentPageSessions}
                          totalItems={attendanceReport.sessions_overview.length}
                          itemsPerPage={sessionsPerPage}
                          itemName="sessions"
                        />
                      </>
                    ) : (
                      <div className="px-6 py-8 text-center">
                        <p className="text-muted-foreground text-sm">
                          No sessions conducted yet
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              {/* Students Below 75% */}
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-red-800">
                        <UserX className="h-5 w-5" />
                        Students Not Meeting 75% Requirement
                      </CardTitle>
                      <CardDescription>
                        Students who need to improve their attendance
                      </CardDescription>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="Search by name, matric no, or email..."
                        value={searchQueryBelow75}
                        onChange={(e) => setSearchQueryBelow75(e.target.value)}
                        className="pr-10 pl-10"
                      />
                      {searchQueryBelow75 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQueryBelow75("")}
                          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {filteredStudentsBelow75.length > 0 ? (
                    <>
                      {/* Mobile Horizontal Scrollable Table */}
                      <div className="block sm:hidden">
                        <div className="overflow-x-auto">
                          <div className="min-w-[800px] px-4">
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
                                    Attendance
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Sessions
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Risk Level
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedStudentsBelow75.map(
                                  (student, index) => (
                                    <tr
                                      key={student.id}
                                      className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                    >
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <span className="text-xs font-medium">
                                          #{startIndexBelow75 + index + 1}
                                        </span>
                                      </td>
                                      <td className="px-2 py-3">
                                        <div className="min-w-[150px]">
                                          <p className="truncate text-xs font-medium">
                                            {student.name}
                                          </p>
                                          <p className="text-muted-foreground truncate text-xs">
                                            {student.email}
                                          </p>
                                        </div>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <p className="text-muted-foreground font-mono text-xs">
                                          {student.matric_no}
                                        </p>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <span
                                          className={`text-xs font-semibold ${getAttendanceRateColor(student.attendance_rate)}`}
                                        >
                                          {student.attendance_rate.toFixed(1)}%
                                        </span>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="flex gap-1">
                                          <Badge
                                            variant="secondary"
                                            className="bg-green-100 text-xs text-green-800"
                                          >
                                            {student.sessions_attended}
                                          </Badge>
                                          <Badge
                                            variant="secondary"
                                            className="bg-red-100 text-xs text-red-800"
                                          >
                                            {student.sessions_missed}
                                          </Badge>
                                        </div>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <Badge
                                          className={`text-xs ${getRiskLevelColor(student.risk_level)}`}
                                        >
                                          {student.risk_level.toUpperCase()}
                                        </Badge>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            router.push(
                                              `/students/${courseId}/${student.id}/attendance`,
                                            )
                                          }
                                          className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                          title="View attendance details"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ),
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
                                  Attendance Rate
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Sessions Attended
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Sessions Missed
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Risk Level
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedStudentsBelow75.map(
                                (student, index) => (
                                  <tr
                                    key={student.id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                  >
                                    <td className="px-4 py-4">
                                      <span className="text-sm font-medium">
                                        #{startIndexBelow75 + index + 1}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4">
                                      <div>
                                        <p className="text-sm font-medium">
                                          {student.name}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                          {student.email}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4">
                                      <p className="text-muted-foreground font-mono text-sm">
                                        {student.matric_no}
                                      </p>
                                    </td>
                                    <td className="px-4 py-4">
                                      <span
                                        className={`text-sm font-semibold ${getAttendanceRateColor(student.attendance_rate)}`}
                                      >
                                        {student.attendance_rate.toFixed(1)}%
                                      </span>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-800"
                                      >
                                        {student.sessions_attended}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Badge
                                        variant="secondary"
                                        className="bg-red-100 text-red-800"
                                      >
                                        {student.sessions_missed}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Badge
                                        className={getRiskLevelColor(
                                          student.risk_level,
                                        )}
                                      >
                                        {student.risk_level.toUpperCase()}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          router.push(
                                            `/students/${courseId}/${student.id}/attendance`,
                                          )
                                        }
                                        className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                        title="View attendance details"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      <Pagination
                        currentPage={currentPageBelow75}
                        totalPages={totalPagesBelow75}
                        onPageChange={setCurrentPageBelow75}
                        totalItems={filteredStudentsBelow75.length}
                        itemsPerPage={studentsPerPage}
                        itemName="students"
                      />
                    </>
                  ) : searchQueryBelow75 ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No students found matching &quot;{searchQueryBelow75}
                        &quot;
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQueryBelow75("")}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        🎉 All students are meeting the 75% attendance
                        requirement!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* All Students Performance */}
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        All Students Performance
                      </CardTitle>
                      <CardDescription>
                        Complete attendance records for all students
                      </CardDescription>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="Search by name, matric no, or email..."
                        value={searchQueryAllStudents}
                        onChange={(e) =>
                          setSearchQueryAllStudents(e.target.value)
                        }
                        className="pr-10 pl-10"
                      />
                      {searchQueryAllStudents && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQueryAllStudents("")}
                          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {filteredAllStudents.length > 0 ? (
                    <>
                      {/* Mobile Horizontal Scrollable Table */}
                      <div className="block sm:hidden">
                        <div className="overflow-x-auto">
                          <div className="min-w-[800px] px-4">
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
                                    Attendance
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Sessions
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Status
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedAllStudents.map(
                                  (studentData, index) => (
                                    <tr
                                      key={studentData.student.id}
                                      className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                    >
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <span className="text-xs font-medium">
                                          #{startIndexAllStudents + index + 1}
                                        </span>
                                      </td>
                                      <td className="px-2 py-3">
                                        <div className="min-w-[150px]">
                                          <p className="truncate text-xs font-medium">
                                            {studentData.student.name}
                                          </p>
                                          <p className="text-muted-foreground truncate text-xs">
                                            {studentData.student.email}
                                          </p>
                                        </div>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <p className="text-muted-foreground font-mono text-xs">
                                          {studentData.student.matric_no}
                                        </p>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <span
                                          className={`text-xs font-semibold ${getAttendanceRateColor(studentData.statistics.attendance_rate)}`}
                                        >
                                          {studentData.statistics.attendance_rate.toFixed(
                                            1,
                                          )}
                                          %
                                        </span>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <div className="flex gap-1">
                                          <Badge
                                            variant="secondary"
                                            className="bg-green-100 text-xs text-green-800"
                                          >
                                            {
                                              studentData.statistics
                                                .attended_sessions
                                            }
                                          </Badge>
                                          <Badge
                                            variant="secondary"
                                            className="bg-red-100 text-xs text-red-800"
                                          >
                                            {
                                              studentData.statistics
                                                .missed_sessions
                                            }
                                          </Badge>
                                        </div>
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        {studentData.statistics
                                          .meets_75_percent_requirement ? (
                                          <Badge className="border-green-200 bg-green-100 text-xs text-green-800">
                                            <CheckCircle className="mr-1 h-3 w-3" />
                                            Meets
                                          </Badge>
                                        ) : (
                                          <Badge className="border-red-200 bg-red-100 text-xs text-red-800">
                                            <XCircle className="mr-1 h-3 w-3" />
                                            Below
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            router.push(
                                              `/students/${courseId}/${studentData.student.id}/attendance`,
                                            )
                                          }
                                          className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                          title="View attendance details"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                      </td>
                                    </tr>
                                  ),
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
                                  Attendance Rate
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Sessions Attended
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Sessions Missed
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Status
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedAllStudents.map(
                                (studentData, index) => (
                                  <tr
                                    key={studentData.student.id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                  >
                                    <td className="px-4 py-4">
                                      <span className="text-sm font-medium">
                                        #{startIndexAllStudents + index + 1}
                                      </span>
                                    </td>
                                    <td className="px-4 py-4">
                                      <div>
                                        <p className="text-sm font-medium">
                                          {studentData.student.name}
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                          {studentData.student.email}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-4 py-4">
                                      <p className="text-muted-foreground font-mono text-sm">
                                        {studentData.student.matric_no}
                                      </p>
                                    </td>
                                    <td className="px-4 py-4">
                                      <span
                                        className={`text-sm font-semibold ${getAttendanceRateColor(studentData.statistics.attendance_rate)}`}
                                      >
                                        {studentData.statistics.attendance_rate.toFixed(
                                          1,
                                        )}
                                        %
                                      </span>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Badge
                                        variant="secondary"
                                        className="bg-green-100 text-green-800"
                                      >
                                        {
                                          studentData.statistics
                                            .attended_sessions
                                        }
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                      <Badge
                                        variant="secondary"
                                        className="bg-red-100 text-red-800"
                                      >
                                        {studentData.statistics.missed_sessions}
                                      </Badge>
                                    </td>
                                    <td className="px-4 py-4">
                                      {studentData.statistics
                                        .meets_75_percent_requirement ? (
                                        <Badge className="border-green-200 bg-green-100 text-green-800">
                                          <CheckCircle className="mr-1 h-3 w-3" />
                                          Meets Requirement
                                        </Badge>
                                      ) : (
                                        <Badge className="border-red-200 bg-red-100 text-red-800">
                                          <XCircle className="mr-1 h-3 w-3" />
                                          Below Requirement
                                        </Badge>
                                      )}
                                    </td>
                                    <td className="px-4 py-4">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          router.push(
                                            `/students/${courseId}/${studentData.student.id}/attendance`,
                                          )
                                        }
                                        className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                        title="View attendance details"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      <Pagination
                        currentPage={currentPageAllStudents}
                        totalPages={totalPagesAllStudents}
                        onPageChange={setCurrentPageAllStudents}
                        totalItems={filteredAllStudents.length}
                        itemsPerPage={studentsPerPage}
                        itemName="students"
                      />
                    </>
                  ) : searchQueryAllStudents ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No students found matching &quot;
                        {searchQueryAllStudents}&quot;
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQueryAllStudents("")}
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

            {/* Insights Tab */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid gap-6">
                {/* Key Insights */}
                <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="rounded-lg bg-purple-500/10 p-2 text-purple-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-purple-500/20">
                        <GraduationCap className="h-4 w-4 group-hover:animate-pulse" />
                      </div>
                      Key Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-muted-foreground text-sm font-medium">
                          Average Session Attendance
                        </div>
                        <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-purple-600/90">
                          {attendanceReport.insights.average_session_attendance.toFixed(
                            1,
                          )}
                          %
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-muted-foreground text-sm font-medium">
                          Students with Perfect Attendance
                        </div>
                        <div className="text-2xl font-bold text-green-600 transition-colors duration-300 group-hover:text-green-500/90">
                          {
                            attendanceReport.insights
                              .students_with_perfect_attendance
                          }
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-medium">Recommendations</h4>
                      <div className="space-y-2 text-sm">
                        {attendanceReport.summary.overall_attendance_rate <
                          50 && (
                          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 text-red-600" />
                            <div>
                              <div className="font-medium text-red-800">
                                Critical Attendance Issue
                              </div>
                              <div className="text-red-700">
                                Course attendance is critically low. Consider
                                implementing immediate interventions.
                              </div>
                            </div>
                          </div>
                        )}

                        {attendanceReport.risk_analysis.total_at_risk > 0 && (
                          <div className="flex items-start gap-2 rounded-lg border border-orange-200 bg-orange-50 p-3">
                            <AlertTriangle className="mt-0.5 h-4 w-4 text-orange-600" />
                            <div>
                              <div className="font-medium text-orange-800">
                                Students Need Support
                              </div>
                              <div className="text-orange-700">
                                {attendanceReport.risk_analysis.total_at_risk}{" "}
                                students are at risk. Consider providing
                                additional support or flexible attendance
                                options.
                              </div>
                            </div>
                          </div>
                        )}

                        {attendanceReport.summary.overall_attendance_rate >=
                          75 && (
                          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
                            <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
                            <div>
                              <div className="font-medium text-green-800">
                                Good Attendance Performance
                              </div>
                              <div className="text-green-700">
                                Course attendance is meeting expectations.
                                Continue current engagement strategies.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Report Information */}
                <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-blue-500/20">
                        <FileText className="h-4 w-4 group-hover:animate-pulse" />
                      </div>
                      Report Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Generated At:
                      </span>
                      <span>
                        {formatDateTimeWithDay(attendanceReport.generated_at)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Report Format:
                      </span>
                      <span className="capitalize">
                        {attendanceReport.report_parameters.format}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Minimum Attendance Requirement:
                      </span>
                      <span>
                        {
                          attendanceReport.report_parameters
                            .minimum_attendance_requirement
                        }
                        %
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function CourseAttendanceReportPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CourseAttendanceReportPage />
    </Suspense>
  );
}
