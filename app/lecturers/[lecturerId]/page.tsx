"use client";

import {
  Activity,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Filter,
  GraduationCap,
  Mail,
  Search,
  Timer,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useParams,useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type TeacherCourse,useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";

export default function LecturerDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const lecturerId = params.lecturerId as string;

  const {
    teacherDetail,
    teacherCourses,
    coursesPagination,
    isLoadingTeacherDetails,
    teacherDetailsError,
    getTeacherCourses,
    clearTeacherDetailsError,
  } = useAdminStore();

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Format date with day of week
  const formatDateWithDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch teacher courses on component mount
  React.useEffect(() => {
    if (
      isAuthenticated &&
      !authLoading &&
      user?.role === "admin" &&
      lecturerId
    ) {
      getTeacherCourses(lecturerId, currentPage, 20);
    }
  }, [
    getTeacherCourses,
    isAuthenticated,
    authLoading,
    lecturerId,
    currentPage,
    user?.role,
  ]);

  React.useEffect(() => {
    if (teacherDetailsError) {
      toast.error(teacherDetailsError);
      clearTeacherDetailsError();
    }
  }, [teacherDetailsError, clearTeacherDetailsError]);

  // Reset to first page when search query or filter changes
  React.useEffect(() => {
    if (searchQuery || statusFilter !== "all") {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter]);

  // Filter courses based on search query (client-side filtering for search)
  const filteredCourses = searchQuery
    ? teacherCourses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.course_code.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : teacherCourses;

  const handleCourseClick = (course: TeacherCourse) => {
    router.push(`/course/${course._id}`);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
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

  // Get status color for course health
  const getHealthStatusColor = (status: string) => {
    if (status === "active")
      return "bg-green-100 text-green-800 border-green-200";
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  // Get attendance trend color
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "good":
        return "text-green-600";
      case "poor":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  if (isLoadingTeacherDetails) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading lecturer details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacherDetail) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">Lecturer Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The lecturer you&apos;re looking for doesn&apos;t exist or has been removed.
            </p>
            <Button onClick={() => router.push("/lecturers")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Lecturers
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
              { label: "Lecturers", href: "/lecturers" },
              { label: teacherDetail.name, current: true },
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3 md:hidden">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/lecturers")}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Lecturers
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              {teacherDetail.name}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 text-sm lg:text-base">
              <Mail className="h-4 w-4" />
              {teacherDetail.email}
              {!isLoadingTeacherDetails &&
                coursesPagination &&
                coursesPagination.totalPages > 1 &&
                !searchQuery && (
                  <span className="ml-2">
                    • Page {coursesPagination.currentPage} of{" "}
                    {coursesPagination.totalPages}
                  </span>
                )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className={`${
                teacherDetail.email_verified
                  ? "border-green-200 bg-green-100 text-green-800"
                  : "border-yellow-200 bg-yellow-100 text-yellow-800"
              }`}
            >
              {teacherDetail.email_verified ? (
                <>
                  <UserCheck className="mr-1 h-3 w-3" />
                  Verified
                </>
              ) : (
                <>
                  <Clock className="mr-1 h-3 w-3" />
                  Pending Verification
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Total Courses
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <BookOpen className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {teacherDetail.overall_stats.total_courses}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                Created courses
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Total Sessions
              </CardTitle>
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-blue-200">
                <Calendar className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-blue-600">
                {teacherDetail.overall_stats.total_sessions}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                Attendance sessions
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Total Students
              </CardTitle>
              <div className="rounded-lg bg-purple-100 p-2 text-purple-700 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-purple-200">
                <Users className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-purple-600">
                {teacherDetail.overall_stats.total_students}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                Enrolled students
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Active Courses
              </CardTitle>
              <div className="rounded-lg bg-green-100 p-2 text-green-700 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-green-200">
                <Activity className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-green-600">
                {teacherDetail.overall_stats.active_courses}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                Currently active
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="animate-appear space-y-6 opacity-0 delay-300">
          <Tabs defaultValue="courses" className="w-full">
            <TabsList className="grid w-fit grid-cols-4">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="account">Account Details</TabsTrigger>
              <TabsTrigger value="activity">Activity Summary</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-md flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-border/50 bg-card/50 hover:border-border focus:border-primary pl-9 backdrop-blur-sm transition-all duration-300"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={statusFilter}
                    onValueChange={handleFilterChange}
                  >
                    <SelectTrigger className="border-border/50 bg-card/50 w-[140px] backdrop-blur-sm">
                      <Filter className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      <SelectItem value="active">Active Only</SelectItem>
                      <SelectItem value="inactive">Inactive Only</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Search results counter */}
                  {searchQuery && !isLoadingTeacherDetails && (
                    <div className="text-muted-foreground text-sm">
                      {filteredCourses.length} result
                      {filteredCourses.length !== 1 ? "s" : ""} found
                    </div>
                  )}
                </div>
              </div>

              {/* Courses Grid */}
              <div className="space-y-8">
                {isLoadingTeacherDetails ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                      <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                      <p className="text-muted-foreground">
                        Loading courses...
                      </p>
                    </div>
                  </div>
                ) : filteredCourses.length === 0 ? (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
                        <BookOpen className="h-12 w-12" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold lg:text-xl">
                        {searchQuery ? "No courses found" : "No courses yet"}
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-md text-center text-sm lg:text-base">
                        {searchQuery
                          ? "Try adjusting your search terms to find what you're looking for"
                          : "This lecturer hasn't created any courses yet"}
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCourses.map((course, index) => (
                      <Card
                        key={course._id}
                        className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 animate-fade-in-up animate-stagger cursor-pointer backdrop-blur-sm transition-all duration-300"
                        style={
                          {
                            "--stagger-delay": index,
                          } as React.CSSProperties
                        }
                        onClick={() => handleCourseClick(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="mb-3 flex items-center gap-2">
                                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110">
                                  <GraduationCap className="h-4 w-4 group-hover:animate-pulse" />
                                </div>
                                <Badge
                                  variant="outline"
                                  className="border-border/50 bg-background/50 text-xs backdrop-blur-sm"
                                >
                                  {course.course_code}
                                </Badge>
                                <Badge
                                  variant="default"
                                  className={`text-xs ${getHealthStatusColor(course.health.status)}`}
                                >
                                  {course.health.status === "active" ? (
                                    <>
                                      <Activity className="mr-1 h-3 w-3" />
                                      Active
                                    </>
                                  ) : (
                                    <>
                                      <Timer className="mr-1 h-3 w-3" />
                                      Inactive
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <CardTitle className="group-hover:text-primary text-base transition-colors duration-300 lg:text-lg">
                                {course.title}
                              </CardTitle>
                              <CardDescription className="text-xs lg:text-sm">
                                {course.course_code} •{" "}
                                {formatLevel(course.level)}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                  <Users className="h-3 w-3" />
                                  Students
                                </span>
                                <span className="text-xs font-medium">
                                  {course.statistics.total_students}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                  <Calendar className="h-3 w-3" />
                                  Sessions
                                </span>
                                <span className="text-xs font-medium">
                                  {course.statistics.total_sessions}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                  <TrendingUp className="h-3 w-3" />
                                  Attendance Rate
                                </span>
                                <span className="text-xs font-medium">
                                  {course.statistics.overall_attendance_rate}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                                  <Activity className="h-3 w-3" />
                                  Trend
                                </span>
                                <span
                                  className={`text-xs font-medium capitalize ${getTrendColor(course.health.attendance_trend)}`}
                                >
                                  {course.health.attendance_trend}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground text-xs">
                                  Created
                                </span>
                                <span className="text-xs">
                                  {formatDateWithDay(course.created_at)}
                                </span>
                              </div>
                              {course.health.last_session && (
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground text-xs">
                                    Last Session
                                  </span>
                                  <span className="text-xs">
                                    {formatDateWithDay(
                                      course.health.last_session,
                                    )}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCourseClick(course);
                                }}
                                className="border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground flex-1 backdrop-blur-sm transition-all duration-300"
                              >
                                <Eye className="mr-1 h-3 w-3" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Pagination Controls */}
                {!searchQuery &&
                  coursesPagination &&
                  coursesPagination.totalPages > 1 &&
                  !isLoadingTeacherDetails && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={coursesPagination.totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={coursesPagination.totalCourses}
                      itemsPerPage={20}
                      itemName="courses"
                    />
                  )}
              </div>
            </TabsContent>

            {/* Account Details Tab */}
            <TabsContent value="account" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Lecturer account details and status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Name</span>
                      <span className="text-muted-foreground text-sm">
                        {teacherDetail.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email</span>
                      <span className="text-muted-foreground text-sm">
                        {teacherDetail.email}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Role</span>
                      <Badge variant="outline">{teacherDetail.role}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Email Status</span>
                      <Badge
                        variant={
                          teacherDetail.email_verified ? "default" : "secondary"
                        }
                      >
                        {teacherDetail.email_verified
                          ? "Verified"
                          : "Unverified"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        Account Created
                      </span>
                      <span className="text-muted-foreground text-sm">
                        {new Date(teacherDetail.created_at).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                    {teacherDetail.last_login && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Last Login</span>
                        <span className="text-muted-foreground text-sm">
                          {new Date(
                            teacherDetail.last_login,
                          ).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Summary Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Activity Summary</CardTitle>
                  <CardDescription>
                    Overview of lecturer&apos;s platform usage
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                          <BookOpen className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Courses Created</p>
                          <p className="text-muted-foreground text-xs">
                            Total courses
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">
                        {teacherDetail.overall_stats.total_courses}
                      </span>
                    </div>

                    <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-green-100 p-2 text-green-700">
                          <Calendar className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Sessions Conducted
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Attendance sessions
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">
                        {teacherDetail.overall_stats.total_sessions}
                      </span>
                    </div>

                    <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-purple-100 p-2 text-purple-700">
                          <Users className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            Students Managed
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Total students
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">
                        {teacherDetail.overall_stats.total_students}
                      </span>
                    </div>

                    <div className="bg-muted/30 flex items-center justify-between rounded-lg p-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-100 p-2 text-orange-700">
                          <Activity className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Active Courses</p>
                          <p className="text-muted-foreground text-xs">
                            Currently active
                          </p>
                        </div>
                      </div>
                      <span className="text-lg font-bold">
                        {teacherDetail.overall_stats.active_courses}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Average Attendance Rate</span>
                        <span className="text-sm font-bold">
                          {teacherCourses.length > 0
                            ? Math.round(
                                teacherCourses.reduce(
                                  (acc, course) =>
                                    acc +
                                    course.statistics.overall_attendance_rate,
                                  0,
                                ) / teacherCourses.length,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Sessions per Course</span>
                        <span className="text-sm font-bold">
                          {teacherDetail.overall_stats.total_courses > 0
                            ? Math.round(
                                teacherDetail.overall_stats.total_sessions /
                                  teacherDetail.overall_stats.total_courses,
                              )
                            : 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Students per Course</span>
                        <span className="text-sm font-bold">
                          {teacherDetail.overall_stats.total_courses > 0
                            ? Math.round(
                                teacherDetail.overall_stats.total_students /
                                  teacherDetail.overall_stats.total_courses,
                              )
                            : 0}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      Course Health Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Active Courses</span>
                        <span className="text-sm font-bold text-green-600">
                          {
                            teacherCourses.filter(
                              (course) => course.health.status === "active",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Inactive Courses</span>
                        <span className="text-sm font-bold text-gray-600">
                          {
                            teacherCourses.filter(
                              (course) => course.health.status === "inactive",
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Good Attendance Trends</span>
                        <span className="text-sm font-bold text-green-600">
                          {
                            teacherCourses.filter(
                              (course) =>
                                course.health.attendance_trend === "good",
                            ).length
                          }
                        </span>
                      </div>
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
