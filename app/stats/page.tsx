"use client";

import {
  Activity,
  AlertTriangle,
  BookOpen,
  Clock,
  GraduationCap,
  RefreshCw,
  TrendingDown,
  Users,
} from "lucide-react";
import React, { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";

export default function StatsPage() {
  const { user } = useAuthStore();
  const {
    statsData,
    isLoadingStats,
    statsError,
    getStatsData,
    clearStatsError,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("30d");

  const isAdmin = user?.role === "admin";

  // Fetch data on component mount
  React.useEffect(() => {
    if (user && isAdmin) {
      getStatsData();
    }
  }, [user, isAdmin, getStatsData]);

  // Auto-refresh every 5 minutes
  React.useEffect(() => {
    if (!isAdmin) return;

    const interval = setInterval(
      () => {
        getStatsData();
      },
      5 * 60 * 1000,
    ); // 5 minutes

    return () => clearInterval(interval);
  }, [isAdmin, getStatsData]);

  const handleRefresh = async () => {
    try {
      await getStatsData();
      toast.success("Stats refreshed successfully!");
    } catch {
      toast.error("Failed to refresh stats");
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };


  const getRiskColor = (level: "low" | "medium" | "high") => {
    const colors = {
      low: "bg-green-100 text-green-800 border-green-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      high: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[level];
  };

  const getActivityTypeColor = (action: string) => {
    const colors: { [key: string]: string } = {
      user_login: "bg-blue-100 text-blue-800",
      user_logout: "bg-gray-100 text-gray-800",
      session_started: "bg-green-100 text-green-800",
      session_ended: "bg-orange-100 text-orange-800",
      course_created: "bg-purple-100 text-purple-800",
      attendance_marked: "bg-teal-100 text-teal-800",
      bulk_attendance_marked: "bg-indigo-100 text-indigo-800",
      course_attendance_report_generated: "bg-cyan-100 text-cyan-800",
    };
    return colors[action] || "bg-gray-100 text-gray-800";
  };

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="animate-appear ml-2 opacity-0">
            <Breadcrumb items={[{ label: "Statistics", current: true }]} />
          </div>
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">Access Restricted</h3>
              <p className="text-muted-foreground text-center">
                You need admin privileges to view system statistics.
              </p>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Breadcrumb */}
        <div className="animate-appear ml-2 opacity-0">
          <Breadcrumb items={[{ label: "Statistics", current: true }]} />
        </div>

        {/* Hero Section */}
        <div className="animate-appear from-primary/10 via-primary/5 rounded-lg bg-gradient-to-r to-transparent p-4 opacity-0 delay-100 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-3xl">
              <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
                System Statistics
              </h1>
              <p className="text-muted-foreground text-md mb-4">
                Comprehensive analytics and insights into your UniTrack system
                performance, user activity, and attendance metrics.
              </p>
              {statsData && (
                <p className="text-muted-foreground text-sm">
                  Last updated:{" "}
                  {new Date(statsData.generated_at).toLocaleString()}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24h</SelectItem>
                  <SelectItem value="7d">Last 7d</SelectItem>
                  <SelectItem value="30d">Last 30d</SelectItem>
                  <SelectItem value="90d">Last 90d</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoadingStats}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${isLoadingStats ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingStats && !statsData && (
          <div className="animate-appear flex items-center justify-center py-12 opacity-0 delay-200">
            <div className="text-center">
              <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
              <p className="text-muted-foreground">Loading statistics...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {statsError && (
          <div className="animate-appear opacity-0 delay-200">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <p className="text-red-800">Failed to load statistics</p>
                  <p className="text-sm text-red-600">{statsError}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    clearStatsError();
                    getStatsData();
                  }}
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stats Content */}
        {statsData && (
          <div className="animate-appear opacity-0 delay-300">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-fit grid-cols-5">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="growth">Growth</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* System Overview Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Teachers
                      </CardTitle>
                      <GraduationCap className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(statsData.system_overview.total_teachers)}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {formatNumber(statsData.user_breakdown.teachers.active)}{" "}
                        active
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Students
                      </CardTitle>
                      <Users className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(statsData.system_overview.total_students)}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {formatNumber(
                          statsData.system_overview.total_enrollments,
                        )}{" "}
                        enrolled
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Courses
                      </CardTitle>
                      <BookOpen className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(statsData.system_overview.total_courses)}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Avg{" "}
                        {Math.round(
                          statsData.course_statistics
                            .average_students_per_course,
                        )}{" "}
                        students/course
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Total Sessions
                      </CardTitle>
                      <Activity className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatNumber(statsData.system_overview.total_sessions)}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {formatNumber(
                          statsData.system_overview.active_sessions,
                        )}{" "}
                        active
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Analytics */}
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Attendance Overview</CardTitle>
                      <CardDescription>
                        Overall attendance metrics and breakdown
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Overall Attendance Rate
                        </span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatPercentage(
                            statsData.attendance_analytics.rates
                              .overall_attendance_rate,
                          )}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Present</span>
                          <span className="font-medium">
                            {formatNumber(
                              statsData.attendance_analytics.breakdown.present,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Manual Present</span>
                          <span className="font-medium">
                            {formatNumber(
                              statsData.attendance_analytics.breakdown
                                .manual_present,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Absent</span>
                          <span className="font-medium">
                            {formatNumber(
                              statsData.attendance_analytics.breakdown.absent,
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Rejected</span>
                          <span className="font-medium">
                            {formatNumber(
                              statsData.attendance_analytics.breakdown.rejected,
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Top Performing Courses</CardTitle>
                      <CardDescription>
                        Courses with highest enrollment numbers
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {statsData.top_performers.most_enrolled_courses
                          .slice(0, 5)
                          .map((course) => (
                            <div
                              key={course._id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {course.course_code}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {course.title}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {formatNumber(course.enrollment_count)}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  students
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Growth Tab */}
              <TabsContent value="growth" className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Teachers Growth
                      </CardTitle>
                      <GraduationCap className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        +{statsData.growth_trends.teachers.last_30d}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Last 30 days
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Students Growth
                      </CardTitle>
                      <Users className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        +{statsData.growth_trends.students.last_30d}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Last 30 days
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Courses Growth
                      </CardTitle>
                      <BookOpen className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        +{statsData.growth_trends.courses.last_30d}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Last 30 days
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Sessions Growth
                      </CardTitle>
                      <Activity className="text-muted-foreground h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        +{statsData.growth_trends.sessions.last_30d}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        Last 30 days
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Performance Metrics</CardTitle>
                      <CardDescription>
                        Key performance indicators for the system
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Session Utilization Rate
                        </span>
                        <span className="text-lg font-semibold">
                          {formatPercentage(
                            statsData.performance_metrics
                              .session_utilization_rate,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Teacher Activity Rate</span>
                        <span className="text-lg font-semibold">
                          {formatPercentage(
                            statsData.performance_metrics.teacher_activity_rate,
                          )}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Avg Session Duration (hrs)
                        </span>
                        <span className="text-lg font-semibold">
                          {statsData.performance_metrics.average_session_duration_hours.toFixed(
                            1,
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader>
                      <CardTitle>Most Active Teachers</CardTitle>
                      <CardDescription>
                        Teachers with the highest course count
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {statsData.top_performers.most_active_teachers.map(
                          (teacher) => (
                            <div
                              key={teacher._id}
                              className="flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {teacher.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {teacher.email}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">
                                  {teacher.course_count}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  courses
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Risk Tab */}
              <TabsContent value="risks" className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-3">
                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Inactive Teachers
                      </CardTitle>
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">
                        {formatNumber(
                          statsData.risk_indicators.inactive_teachers,
                        )}
                      </div>
                      <Badge
                        className={getRiskColor(
                          statsData.risk_indicators.inactive_teachers > 0
                            ? "medium"
                            : "low",
                        )}
                      >
                        {statsData.risk_indicators.inactive_teachers > 0
                          ? "Medium Risk"
                          : "Low Risk"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Courses Without Sessions
                      </CardTitle>
                      <BookOpen className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatNumber(
                          statsData.risk_indicators.courses_without_sessions,
                        )}
                      </div>
                      <Badge
                        className={getRiskColor(
                          statsData.risk_indicators.courses_without_sessions > 2
                            ? "high"
                            : statsData.risk_indicators
                                  .courses_without_sessions > 0
                              ? "medium"
                              : "low",
                        )}
                      >
                        {statsData.risk_indicators.courses_without_sessions > 2
                          ? "High Risk"
                          : statsData.risk_indicators.courses_without_sessions >
                              0
                            ? "Medium Risk"
                            : "Low Risk"}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        Low Attendance Sessions
                      </CardTitle>
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {formatNumber(
                          statsData.risk_indicators
                            .sessions_with_low_attendance,
                        )}
                      </div>
                      <Badge
                        className={getRiskColor(
                          statsData.risk_indicators
                            .sessions_with_low_attendance > 50
                            ? "high"
                            : statsData.risk_indicators
                                  .sessions_with_low_attendance > 20
                              ? "medium"
                              : "low",
                        )}
                      >
                        {statsData.risk_indicators
                          .sessions_with_low_attendance > 50
                          ? "High Risk"
                          : statsData.risk_indicators
                                .sessions_with_low_attendance > 20
                            ? "Medium Risk"
                            : "Low Risk"}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity" className="space-y-6">
                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardHeader>
                    <CardTitle>Recent System Activity</CardTitle>
                    <CardDescription>
                      Latest user actions and system events
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {statsData.recent_activity
                        .slice(0, 10)
                        .map((activity) => (
                          <div
                            key={activity._id}
                            className="border-border/50 flex items-start gap-3 border-b pb-3 last:border-0"
                          >
                            <div className="mt-1">
                              <Clock className="text-muted-foreground h-4 w-4" />
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getActivityTypeColor(
                                    activity.action,
                                  )}
                                >
                                  {activity.action.replace(/_/g, " ")}
                                </Badge>
                                <span className="text-muted-foreground text-xs">
                                  {new Date(
                                    activity.created_at,
                                  ).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">
                                {activity.actor_id ? (
                                  <>
                                    <span className="font-medium">
                                      {activity.actor_id.name}
                                    </span>{" "}
                                    ({activity.actor_id.email})
                                  </>
                                ) : (
                                  "System"
                                )}
                              </p>
                              {activity.payload.url && (
                                <p className="text-muted-foreground text-xs">
                                  {activity.payload.method}{" "}
                                  {activity.payload.url}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
