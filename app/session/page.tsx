"use client";

import {
  Activity,
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Eye,
  Filter,
  MapPin,
  Search,
  Timer,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { CourseSelectionModal } from "@/components/ui/course-selection-modal";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/store/auth-store";
import { useSessionStore } from "@/store/session-store";

export default function SessionsPage() {
  const router = useRouter();
  const {
    sessions,
    isLoading,
    error,
    pagination,
    summary,
    getAllSessions,
    clearError,
  } = useSessionStore();

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCourseSelectionModal, setShowCourseSelectionModal] =
    useState(false);

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
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      getAllSessions(
        currentPage,
        10,
        statusFilter === "all" ? undefined : statusFilter,
      );
    }
  }, [getAllSessions, isAuthenticated, authLoading, currentPage, statusFilter]);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Reset to first page when search query or filter changes
  React.useEffect(() => {
    if (searchQuery || statusFilter !== "all") {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter]);

  // Filter sessions based on search query (client-side filtering for search)
  const filteredSessions = searchQuery
    ? sessions.filter(
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
    : sessions;

  const handleSessionClick = (session: (typeof sessions)[0]) => {
    router.push(`/session/${session._id}`);
  };

  const handleFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle session started callback

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

  // Format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Format time remaining
  const formatTimeRemaining = (minutes: number) => {
    if (minutes <= 0) return "Expired";
    if (minutes < 60) return `${minutes}m left`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m left` : `${hours}h left`;
  };

  // Get status color
  const getStatusColor = (isActive: boolean, timeRemaining: number) => {
    if (!isActive || timeRemaining <= 0)
      return "bg-gray-100 text-gray-800 border-gray-200";
    return "bg-green-100 text-green-800 border-green-200";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb items={[{ label: "Sessions", current: true }]} />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/`)}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 md:hidden"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Session Management
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {getGreeting()}, {user?.name || "Lecturer"} • Monitor and manage
              your attendance sessions
              {!isLoading &&
                pagination &&
                pagination.total_pages > 1 &&
                !searchQuery && (
                  <span className="ml-2">
                    • Page {pagination.current_page} of {pagination.total_pages}
                  </span>
                )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCourseSelectionModal(true)}
              className="bg-green-600 transition-all duration-300 hover:scale-105 hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/20"
            >
              <Clock className="mr-2 h-4 w-4" />
              Start Session
            </Button>
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
              <SelectTrigger className="border-border/50 bg-card/50 w-[140px] backdrop-blur-sm">
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
            {searchQuery && !isLoading && (
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
                {isLoading ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  summary?.total_sessions || 0
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoading ? "" : "All-time sessions"}
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
                {isLoading ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  summary?.active_sessions || 0
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoading ? "" : "Currently running"}
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
                {isLoading ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  summary?.expired_sessions || 0
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoading ? "" : "Completed sessions"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Grid */}
        <div className="animate-appear space-y-8 opacity-0 delay-500">
          {isLoading ? (
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
                    : "Start an attendance session from your course dashboard"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => router.push("/course")}
                    className="hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Go to Courses
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSessions.map((session, index) => (
                <Card
                  key={session._id}
                  className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "fadeInUp 0.4s ease-out forwards",
                    opacity: 0,
                    transform: "translateY(10px)",
                  }}
                  onClick={() => handleSessionClick(session)}
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
                              session.stats.time_remaining,
                            )}`}
                          >
                            {session.is_active &&
                            session.stats.time_remaining > 0 ? (
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
                          {session.course_id.course_code} •{" "}
                          {formatLevel(session.course_id.level)}
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
                            Attendance
                          </span>
                          <span className="text-xs font-medium">
                            {session.stats.total_attendance} (
                            {session.stats.unique_students} unique)
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Clock className="h-3 w-3" />
                            Duration
                          </span>
                          <span className="text-xs font-medium">
                            {formatDuration(session.stats.duration_minutes)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Timer className="h-3 w-3" />
                            Status
                          </span>
                          <span className="text-xs font-medium">
                            {formatTimeRemaining(session.stats.time_remaining)}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSessionClick(session);
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
            pagination &&
            pagination.total_pages > 1 &&
            !isLoading && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.total_pages}
                onPageChange={setCurrentPage}
                totalItems={pagination.total_items || 0}
                itemsPerPage={pagination.items_per_page || 10}
                itemName="sessions"
              />
            )}
        </div>
      </div>

      {/* Course Selection Modal */}
      <CourseSelectionModal
        isOpen={showCourseSelectionModal}
        onClose={() => setShowCourseSelectionModal(false)}
      />
    </DashboardLayout>
  );
}
