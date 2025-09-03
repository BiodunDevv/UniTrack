"use client";

import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Filter,
  MapPin,
  Search,
  Timer,
  Users,
} from "lucide-react";
import { useParams } from "next/navigation";
import * as React from "react";
import { useEffect,useState } from "react";
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
import {useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";

export default function CourseSessionsPage() {
  const params = useParams();
  const lecturerId = params.lecturerId as string;

  const {
    courseInfo,
    courseSessions,
    sessionsPagination,
    isLoadingSessions,
    sessionsError,
    getCourseSessions,
    clearSessionsError,
  } = useAdminStore();

  const { isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Get course ID from URL query params
  const [courseId, setCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      setCourseId(urlParams.get("courseId"));
    }
  }, [lecturerId]);

  // Format date with day of week
  const formatDateWithDay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch sessions on component mount
  useEffect(() => {
    if (isAuthenticated && !authLoading && courseId) {
      getCourseSessions(
        courseId,
        currentPage,
        12,
        statusFilter === "all" ? undefined : statusFilter,
      );
    }
  }, [
    getCourseSessions,
    isAuthenticated,
    authLoading,
    currentPage,
    statusFilter,
    courseId,
  ]);

  useEffect(() => {
    if (sessionsError) {
      toast.error(sessionsError);
      clearSessionsError();
    }
  }, [sessionsError, clearSessionsError]);

  // Reset to first page when search query or filter changes
  useEffect(() => {
    if (searchQuery || statusFilter !== "all") {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter]);

  // Filter sessions based on search query (client-side filtering for search)
  const filteredSessions = searchQuery
    ? courseSessions.filter(
        (session) =>
          session.course_id.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          session.course_id.course_code
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          session.session_code
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
    : courseSessions;

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

  // Format duration
  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));

    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Format time remaining for active sessions
  const formatTimeRemaining = (expiryTime: string, isActive: boolean) => {
    if (!isActive) return "Expired";

    const now = new Date();
    const expiry = new Date(expiryTime);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) return "Expired";

    const minutes = Math.floor(diffMs / (1000 * 60));
    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
  };

  // Get status color
  const getStatusColor = (isActive: boolean, expiryTime: string) => {
    if (!isActive || new Date(expiryTime) <= new Date())
      return "bg-gray-100 text-gray-800 border-gray-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  // Calculate summary stats
  const summary = React.useMemo(() => {
    const totalSessions = sessionsPagination?.totalSessions || 0;
    const activeSessions = courseSessions.filter(
      (session) =>
        session.is_active && new Date(session.expiry_ts) > new Date(),
    ).length;
    const expiredSessions = totalSessions - activeSessions;

    return {
      total_sessions: totalSessions,
      active_sessions: activeSessions,
      expired_sessions: expiredSessions,
    };
  }, [courseSessions, sessionsPagination]);

  if (!courseId) {
    return (
      <DashboardLayout>
        <div className="flex h-96 items-center justify-center">
          <div className="text-center">
            <h3 className="mb-2 text-lg font-semibold">No Course Selected</h3>
            <p className="text-muted-foreground mb-4">
              Please select a course to view its sessions.
            </p>
            <Button href="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
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
              {
                label: courseInfo?.teacher_id.name || "Lecturer",
                href: `/lecturers/${courseInfo?.teacher_id._id}`,
              },
              {
                label: courseInfo?.course_code || "Course",
                href: `/course/${courseId}`,
              },
              { label: `${courseInfo?.course_code} Sessions`, current: true },
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
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 md:hidden"
                href={`/course/${courseId}`}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Course Sessions
            </h1>
            {courseInfo && (
              <div className="space-y-1">
                <p className="text-xl font-semibold">{courseInfo.title}</p>
                <p className="text-muted-foreground text-sm lg:text-base">
                  {courseInfo.course_code} • {formatLevel(courseInfo.level)} •{" "}
                  {courseInfo.teacher_id.name}
                  {!isLoadingSessions &&
                    sessionsPagination &&
                    sessionsPagination.totalPages > 1 &&
                    !searchQuery && (
                      <span className="ml-2">
                        • Page {sessionsPagination.currentPage} of{" "}
                        {sessionsPagination.totalPages}
                      </span>
                    )}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="animate-appear flex flex-col items-start justify-between gap-4 opacity-0 delay-200 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/50 bg-card/50 hover:border-border focus:border-primary pl-9 backdrop-blur-sm transition-all duration-300"
            />
          </div>
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={handleFilterChange}>
              <SelectTrigger>
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="expired">Expired Only</SelectItem>
              </SelectContent>
            </Select>
            {/* Search results counter */}
            {searchQuery && !isLoadingSessions && (
              <div className="text-muted-foreground text-sm">
                {filteredSessions.length} result
                {filteredSessions.length !== 1 ? "s" : ""} found
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="animate-appear grid gap-4 opacity-0 delay-300 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Total Sessions
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Calendar className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {isLoadingSessions ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  summary.total_sessions
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoadingSessions ? "" : "All-time sessions"}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Active Sessions
              </CardTitle>
              <div className="rounded-lg bg-green-100 p-2 text-green-700 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-green-200">
                <Activity className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-green-600">
                {isLoadingSessions ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  summary.active_sessions
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoadingSessions ? "" : "Currently running"}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Expired Sessions
              </CardTitle>
              <div className="rounded-lg bg-gray-100 p-2 text-gray-700 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-gray-200">
                <Timer className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold transition-colors duration-300 group-hover:text-gray-600">
                {isLoadingSessions ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  summary.expired_sessions
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoadingSessions ? "" : "Completed sessions"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Grid */}
        <div className="animate-appear space-y-8 opacity-0 delay-500">
          {isLoadingSessions ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground">Loading sessions...</p>
              </div>
            </div>
          ) : filteredSessions.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
                  <Calendar className="h-12 w-12" />
                </div>
                <h3 className="mb-2 text-lg font-semibold lg:text-xl">
                  {searchQuery ? "No sessions found" : "No sessions yet"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md text-center text-sm lg:text-base">
                  {searchQuery
                    ? "Try adjusting your search terms to find what you're looking for"
                    : "This course hasn't had any attendance sessions yet"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map((session, index) => (
                <Card
                  key={session._id}
                  className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 animate-fade-in-up animate-stagger cursor-pointer backdrop-blur-sm transition-all duration-300"
                  style={
                    {
                      "--stagger-delay": index,
                    } as React.CSSProperties
                  }
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110">
                            <Calendar className="h-4 w-4 group-hover:animate-pulse" />
                          </div>
                          <Badge
                            variant="outline"
                            className="border-border/50 bg-background/50 text-xs backdrop-blur-sm"
                          >
                            {session.session_code}
                          </Badge>
                          <Badge
                            variant="default"
                            className={`text-xs ${getStatusColor(
                              session.is_active,
                              session.expiry_ts,
                            )}`}
                          >
                            {session.is_active &&
                            new Date(session.expiry_ts) > new Date() ? (
                              <>
                                <Activity className="mr-1 h-3 w-3" />
                                Active
                              </>
                            ) : (
                              <>
                                <Timer className="mr-1 h-3 w-3" />
                                Expired
                              </>
                            )}
                          </Badge>
                        </div>
                        <CardTitle className="group-hover:text-primary text-base transition-colors duration-300 lg:text-lg">
                          {session.course_id.title}
                        </CardTitle>
                        <CardDescription className="text-xs lg:text-sm">
                          {session.course_id.course_code} • Session{" "}
                          {session.session_code}
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
                            Present
                          </span>
                          <span className="text-xs font-medium">
                            {session.attendance_stats.present_count}/
                            {session.attendance_stats.total_enrolled} (
                            {session.attendance_stats.attendance_rate}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            Duration
                          </span>
                          <span className="text-xs font-medium">
                            {formatDuration(
                              session.start_ts,
                              session.expiry_ts,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Timer className="h-3 w-3" />
                            Status
                          </span>
                          <span className="text-xs font-medium">
                            {formatTimeRemaining(
                              session.expiry_ts,
                              session.is_active,
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <MapPin className="h-3 w-3" />
                            Radius
                          </span>
                          <span className="text-xs">{session.radius_m}m</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Started
                          </span>
                          <span className="text-xs">
                            {formatDateWithDay(session.start_ts)}{" "}
                            {new Date(session.start_ts).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          href={`/session/${session._id}`}
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
            sessionsPagination &&
            sessionsPagination.totalPages > 1 &&
            !isLoadingSessions && (
              <Pagination
                currentPage={currentPage}
                totalPages={sessionsPagination.totalPages}
                onPageChange={setCurrentPage}
                totalItems={sessionsPagination.totalSessions || 0}
                itemsPerPage={12}
                itemName="sessions"
              />
            )}
        </div>
      </div>
    </DashboardLayout>
  );
}
