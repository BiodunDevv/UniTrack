"use client";

import {
  Activity,
  BookOpen,
  Calendar,
  Clock,
  GraduationCap,
  Play,
  Plus,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect,useState } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseSelectionModal } from "@/components/ui/course-selection-modal";
import { Separator } from "@/components/ui/separator";
import {
  formatNumber,
  getTimeBasedGreeting,
} from "@/lib/device-utils";
import { useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";
import { useProfileStore } from "@/store/profile-store";
import { useSessionStore } from "@/store/session-store";

export default function DashboardPage() {
  const router = useRouter();
  const [showCourseSelectionModal, setShowCourseSelectionModal] =
    useState(false);

  // Store hooks
  const { user } = useAuthStore();
  const {
    courses,
    getAllCourses,
  } = useCourseStore();
  const {
    sessions,
    getAllSessions,
    summary: sessionSummary,
  } = useSessionStore();
  const { getProfile } = useProfileStore();

  // Admin-specific data
  const {
    teachers,
    getAllTeachers,
    auditLogs,
    getAuditLogs,
  } = useAdminStore();

  const isAdmin = user?.role === "admin";

  // Fetch data on mount
  useEffect(() => {
    if (user) {
      getProfile();
      getAllCourses();

      if (isAdmin) {
        // Admin only fetches teachers and audit logs
        getAllTeachers(1, 10);
        getAuditLogs(1, 20);
      } else {
        // Only teachers can fetch sessions
        getAllSessions(1, 10, "active");
      }
    }
  }, [
    user,
    isAdmin,
    getProfile,
    getAllCourses,
    getAllSessions,
    getAllTeachers,
    getAuditLogs,
  ]);

  // Calculate stats from real data
  const totalCourses = courses.length;
  const activeSessions = sessionSummary?.active_sessions || 0;
  const totalSessions = sessionSummary?.total_sessions || 0;
  const totalStudents = courses.reduce(
    (acc, course) => acc + (course.student_count || 0),
    0,
  );
  const totalTeachers = teachers.length;
  const recentActivities = auditLogs.slice(0, 5);

  // For admin, sessions data might not be available
  const sessionsToday = isAdmin
    ? 0
    : sessions.filter(
        (s) =>
          new Date(s.created_at).toDateString() === new Date().toDateString(),
      ).length;

  // Stats for different user roles
  const adminStats = [
    {
      title: "Total Teachers",
      value: formatNumber(totalTeachers),
      change: "+12%",
      icon: Users,
      changeType: "positive" as const,
    },
    {
      title: "Total Courses",
      value: formatNumber(totalCourses),
      change: "+8%",
      icon: BookOpen,
      changeType: "positive" as const,
    },
    {
      title: "Total Students",
      value: formatNumber(totalStudents),
      change: "+15%",
      icon: GraduationCap,
      changeType: "positive" as const,
    },
    {
      title: "Recent Activities",
      value: formatNumber(recentActivities.length),
      change: `+${recentActivities.length}`,
      icon: Activity,
      changeType: "positive" as const,
    },
  ];

  const teacherStats = [
    {
      title: "My Courses",
      value: formatNumber(totalCourses),
      change: "+2",
      icon: BookOpen,
      changeType: "positive" as const,
    },
    {
      title: "Active Sessions",
      value: formatNumber(activeSessions),
      change: `${activeSessions > 0 ? "+" : ""}${activeSessions}`,
      icon: Clock,
      changeType:
        activeSessions > 0 ? ("positive" as const) : ("neutral" as const),
    },
    {
      title: "Total Students",
      value: formatNumber(totalStudents),
      change: "+25",
      icon: Users,
      changeType: "positive" as const,
    },
    {
      title: "Sessions Today",
      value: formatNumber(sessionsToday),
      change: "+3",
      icon: TrendingUp,
      changeType: "positive" as const,
    },
  ];

  const stats = isAdmin ? adminStats : teacherStats;

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-200 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              {getTimeBasedGreeting()}, {user?.name}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Welcome back to your {isAdmin ? "admin" : "attendance"} dashboard.
              Here&apos;s what&apos;s happening today.
            </p>
          </div>

          {/* Floating Action Buttons */}
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <>
                <Button
                  onClick={() => router.push("/lecturers/create")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="sm"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create Lecturer
                </Button>
                <Button
                  onClick={() => router.push("/course/create")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={() => setShowCourseSelectionModal(true)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="sm"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start Session
                </Button>
                <Button
                  onClick={() => router.push("/course/create")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-300 hover:shadow-xl"
                  size="sm"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Course
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="animate-appear grid gap-4 opacity-0 delay-300 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 animate-appear animate-fade-in-up animate-stagger opacity-0 backdrop-blur-sm transition-all duration-500 hover:shadow-lg"
                style={
                  { "--stagger-delay": 6 + index * 2 } as React.CSSProperties
                } // 300ms base + 100ms increments
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-4 w-4 group-hover:animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                    <span
                      className={
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {stat.change}
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="animate-appear grid gap-4 opacity-0 delay-300 md:gap-6 lg:grid-cols-3 xl:grid-cols-3">
          {/* Recent Activity */}
          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="group-hover:text-primary flex items-center gap-2 text-base transition-colors duration-300 lg:text-lg">
                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110">
                  <Clock className="h-4 w-4 group-hover:animate-pulse lg:h-5 lg:w-5" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                {isAdmin
                  ? "Latest system activities and user actions"
                  : "Latest activities from your courses"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 lg:space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="border-border/30 bg-background/30 hover:bg-background/50 flex flex-col justify-between gap-3 rounded-lg border p-3 transition-all duration-300 sm:flex-row sm:items-center sm:gap-0"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {activity.actor_id
                              ? activity.actor_id.name
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("")
                              : "SYS"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">
                            {activity.actor_id
                              ? activity.actor_id.name
                              : "System"}
                          </p>
                          <p className="text-muted-foreground flex items-center gap-1 text-xs">
                            <Activity className="h-3 w-3" />
                            {activity.action.replace(/_/g, " ")}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="mb-1">
                          {activity.action}
                        </Badge>
                        <p className="text-muted-foreground text-xs">
                          {new Date(activity.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <Activity className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground">
                      No recent activities
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="group-hover:text-primary flex items-center gap-2 text-base transition-colors duration-300 lg:text-lg">
                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110">
                  <Calendar className="h-4 w-4 group-hover:animate-pulse lg:h-5 lg:w-5" />
                </div>
                Today&apos;s Summary
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  {isAdmin ? "Total Teachers" : "My Courses"}
                </span>
                <span className="font-medium">
                  {isAdmin ? totalTeachers : totalCourses}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  {isAdmin ? "Total Courses" : "Active Sessions"}
                </span>
                <span className="font-medium text-green-600">
                  {isAdmin ? totalCourses : activeSessions}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Students
                </span>
                <span className="font-medium">{totalStudents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  {isAdmin ? "Recent Activities" : "Total Sessions"}
                </span>
                <span className="font-medium">
                  {isAdmin ? recentActivities.length : totalSessions}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <span>System Status</span>
                <span className="text-green-600">Active</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Overview */}
        <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
          <CardHeader>
            <CardTitle className="group-hover:text-primary flex items-center gap-2 transition-colors duration-300">
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110">
                <BookOpen className="h-5 w-5 group-hover:animate-pulse" />
              </div>
              {isAdmin ? "All Courses" : "My Courses"}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Overview of all courses in the system"
                : "Your current course assignments"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {courses.length > 0 ? (
                courses.slice(0, 10).map((course) => (
                  <div
                    key={course._id}
                    className="border-border/30 bg-background/30 hover:bg-background/50 flex items-center justify-between rounded-lg border p-3 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {course.course_code.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{course.title}</p>
                        <p className="text-muted-foreground text-sm">
                          {course.course_code} • Level {course.level}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">
                        {course.student_count || 0} students
                      </Badge>
                      {course.has_active_session && (
                        <Badge variant="default" className="ml-2">
                          Active Session
                        </Badge>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center">
                  <BookOpen className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground">No courses found</p>
                  <Button
                    onClick={() => router.push("/course/create")}
                    className="mt-4"
                    variant="outline"
                  >
                    Create Your First Course
                  </Button>
                </div>
              )}
            </div>
            {courses.length > 10 && (
              <div className="mt-6 text-center">
                <Button
                  variant="outline"
                  className="border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/20 hover:text-primary backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  onClick={() => router.push("/course")}
                >
                  View All Courses
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course Selection Modal */}
      <CourseSelectionModal
        isOpen={showCourseSelectionModal}
        onClose={() => setShowCourseSelectionModal(false)}
      />
    </DashboardLayout>
  );
}
