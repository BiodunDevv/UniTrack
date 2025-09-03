"use client";

import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  Download,
  Filter,
  Search,
  Shield,
  User,
  Users,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

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
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";

const actionIcons = {
  user_logout: User,
  user_login: User,
  session_started: Calendar,
  session_ended: Calendar,
  bulk_attendance_marked: Users,
  manual_attendance_marked: Users,
  course_created: Activity,
  course_updated: Activity,
  student_added_to_course: User,
  student_removed_from_course: User,
  course_attendance_report_generated: BarChart3,
  attendance_report_downloaded: Download,
  DEFAULT: Activity,
};

const actionColors = {
  user_logout: "bg-gray-100 text-gray-800 border-gray-200",
  user_login: "bg-green-100 text-green-800 border-green-200",
  session_started: "bg-blue-100 text-blue-800 border-blue-200",
  session_ended: "bg-purple-100 text-purple-800 border-purple-200",
  bulk_attendance_marked: "bg-indigo-100 text-indigo-800 border-indigo-200",
  manual_attendance_marked: "bg-orange-100 text-orange-800 border-orange-200",
  course_created: "bg-emerald-100 text-emerald-800 border-emerald-200",
  course_updated: "bg-yellow-100 text-yellow-800 border-yellow-200",
  student_added_to_course: "bg-cyan-100 text-cyan-800 border-cyan-200",
  student_removed_from_course: "bg-red-100 text-red-800 border-red-200",
  course_attendance_report_generated:
    "bg-pink-100 text-pink-800 border-pink-200",
  attendance_report_downloaded: "bg-teal-100 text-teal-800 border-teal-200",
  DEFAULT: "bg-gray-100 text-gray-800 border-gray-200",
};

export default function AuditLogsPage() {
  const { user } = useAuthStore();
  const {
    auditLogs,
    auditLogsPagination,
    auditLogsAnalytics,
    isLoadingAuditLogs,
    auditLogsError,
    getAuditLogs,
  } = useAdminStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("logs");

  // Check if user is admin and redirect if not
  useEffect(() => {
    if (user && user.role !== "admin") {
      window.location.href = "/dashboard";
    }
  }, [user]);

  // Fetch data on component mount
  useEffect(() => {
    if (user && user.role === "admin") {
      getAuditLogs(currentPage, 50);
    }
  }, [user, currentPage, getAuditLogs]);

  if (!user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
      </div>
    );
  }

  // Filter logs based on search and action type
  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.actor_id &&
        log.actor_id.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.actor_id &&
        log.actor_id.email.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filterAction === "all" || log.action === filterAction;

    return matchesSearch && matchesFilter;
  });

  const uniqueActions = [...new Set(auditLogs.map((log) => log.action))];

  // Chart config
  const chartConfig = {
    activities: {
      label: "Activities",
      color: "var(--chart-1)",
    },
    logins: {
      label: "Logins",
      color: "var(--chart-2)",
    },
  } satisfies ChartConfig;

  // Prepare hourly activity chart data
  const hourlyChartData =
    auditLogsAnalytics?.hourly_activity?.map((item) => ({
      time: `${item._id.hour}:00`,
      activities: item.count,
      logins: auditLogs.filter(
        (log) =>
          log.action === "user_login" &&
          new Date(log.created_at).getHours() === item._id.hour,
      ).length,
    })) || [];

  // Calculate stats
  const totalLogs = auditLogsPagination?.totalLogs || 0;
  const todayLogs = auditLogs.filter(
    (log) =>
      new Date(log.created_at).toDateString() === new Date().toDateString(),
  ).length;
  const uniqueUsers = new Set(
    auditLogs.filter((log) => log.actor_id).map((log) => log.actor_id!._id),
  ).size;

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Breadcrumb */}
        <div className="animate-appear ml-2 opacity-0">
          <Breadcrumb items={[{ label: "Audit Logs", current: true }]} />
        </div>

        {/* Hero Section */}
        <div className="animate-appear from-primary/10 via-primary/5 rounded-lg bg-gradient-to-r to-transparent p-4 opacity-0 delay-100 sm:p-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">Audit Logs</h1>
            <p className="text-muted-foreground text-md mb-6">
              Monitor and track all system activities, user actions, and
              security events. Comprehensive logging helps maintain system
              security and compliance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Logs
              </Button>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Advanced Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <Activity className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalLogs.toLocaleString()}
              </div>
              <p className="text-muted-foreground text-xs">
                All time activities
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today&apos;s Activity
              </CardTitle>
              <Calendar className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayLogs}</div>
              <p className="text-muted-foreground text-xs">Activities today</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueUsers}</div>
              <p className="text-muted-foreground text-xs">Unique users</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Security Events
              </CardTitle>
              <Shield className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  auditLogs.filter(
                    (log) =>
                      log.action.includes("logout") ||
                      log.action.includes("login"),
                  ).length
                }
              </div>
              <p className="text-muted-foreground text-xs">Auth events</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="animate-appear opacity-0 delay-300">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="logs">Activity Logs</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="logs" className="space-y-6">
              {/* Search and Filters */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative max-w-md flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search logs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {uniqueActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Logs List */}
              {isLoadingAuditLogs ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">
                      Loading audit logs...
                    </p>
                  </div>
                </div>
              ) : auditLogsError ? (
                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
                    <h3 className="mb-2 text-lg font-semibold text-red-600">
                      Error Loading Logs
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md text-center">
                      {auditLogsError}
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => getAuditLogs(currentPage, 50)}
                    >
                      Retry
                    </Button>
                  </CardContent>
                </Card>
              ) : filteredLogs.length === 0 ? (
                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Activity className="text-muted-foreground mb-4 h-12 w-12" />
                    <h3 className="mb-2 text-lg font-semibold">
                      No Logs Found
                    </h3>
                    <p className="text-muted-foreground max-w-md text-center">
                      {searchQuery || filterAction !== "all"
                        ? "Try adjusting your search or filter criteria"
                        : "No audit logs available at the moment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.map((log) => {
                    const Icon =
                      actionIcons[log.action as keyof typeof actionIcons] ||
                      actionIcons.DEFAULT;
                    const colorClass =
                      actionColors[log.action as keyof typeof actionColors] ||
                      actionColors.DEFAULT;

                    return (
                      <Card
                        key={log._id}
                        className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300"
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div
                                  className={cn(
                                    "rounded-full p-1.5",
                                    colorClass,
                                  )}
                                >
                                  <Icon className="h-3 w-3" />
                                </div>
                                <Badge className={colorClass}>
                                  {log.action.replace(/_/g, " ")}
                                </Badge>
                                <span className="text-muted-foreground text-sm">
                                  {formatDistanceToNow(
                                    new Date(log.created_at),
                                    { addSuffix: true },
                                  )}
                                </span>
                              </div>
                              {log.actor_id && (
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {log.actor_id.name}
                                  </span>
                                  <span className="text-muted-foreground text-sm">
                                    {log.actor_id.email}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {log.actor_id.role}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {log.payload && (
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">
                                    Method:
                                  </span>{" "}
                                  {log.payload.method}
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    IP:
                                  </span>{" "}
                                  {log.payload.ip}
                                </div>
                              </div>
                              <div className="text-sm">
                                <span className="text-muted-foreground">
                                  URL:
                                </span>{" "}
                                {log.payload.url}
                              </div>
                              {log.payload.userAgent && (
                                <details className="text-xs">
                                  <summary className="text-muted-foreground cursor-pointer">
                                    View User Agent
                                  </summary>
                                  <pre className="bg-muted mt-2 rounded p-2 text-xs whitespace-pre-wrap">
                                    {log.payload.userAgent}
                                  </pre>
                                </details>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {auditLogsPagination && auditLogsPagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={
                      auditLogsPagination.currentPage === 1 ||
                      isLoadingAuditLogs
                    }
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: Math.min(5, auditLogsPagination.totalPages) },
                      (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <Button
                            key={pageNum}
                            variant={
                              pageNum === auditLogsPagination.currentPage
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            disabled={isLoadingAuditLogs}
                          >
                            {pageNum}
                          </Button>
                        );
                      },
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          auditLogsPagination?.totalPages || 1,
                          prev + 1,
                        ),
                      )
                    }
                    disabled={
                      auditLogsPagination.currentPage ===
                        auditLogsPagination.totalPages || isLoadingAuditLogs
                    }
                  >
                    Next
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardHeader>
                    <CardTitle>Activity Trends</CardTitle>
                    <CardDescription>
                      Hourly activity distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    {hourlyChartData.length > 0 ? (
                      <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[250px] w-full"
                      >
                        <AreaChart data={hourlyChartData}>
                          <defs>
                            <linearGradient
                              id="fillActivities"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="var(--color-activities)"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--color-activities)"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                            <linearGradient
                              id="fillLogins"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="var(--color-logins)"
                                stopOpacity={0.8}
                              />
                              <stop
                                offset="95%"
                                stopColor="var(--color-logins)"
                                stopOpacity={0.1}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} />
                          <XAxis
                            dataKey="time"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                          />
                          <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent indicator="dot" />}
                          />
                          <Area
                            dataKey="logins"
                            type="natural"
                            fill="url(#fillLogins)"
                            stroke="var(--color-logins)"
                            stackId="a"
                          />
                          <Area
                            dataKey="activities"
                            type="natural"
                            fill="url(#fillActivities)"
                            stroke="var(--color-activities)"
                            stackId="a"
                          />
                          <ChartLegend content={<ChartLegendContent />} />
                        </AreaChart>
                      </ChartContainer>
                    ) : (
                      <div className="text-muted-foreground flex h-[250px] items-center justify-center">
                        No analytics data available
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardHeader>
                    <CardTitle>Top Actions</CardTitle>
                    <CardDescription>Most frequent activities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {uniqueActions.slice(0, 5).map((action) => {
                        const count = auditLogs.filter(
                          (log) => log.action === action,
                        ).length;
                        const percentage = Math.round(
                          (count / auditLogs.length) * 100,
                        );
                        return (
                          <div
                            key={action}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm font-medium">
                              {action.replace(/_/g, " ")}
                            </span>
                            <div className="flex items-center gap-2">
                              <div className="bg-muted h-2 w-20 rounded-full">
                                <div
                                  className="bg-primary h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-muted-foreground w-8 text-sm">
                                {count}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle>Security Events</CardTitle>
                  <CardDescription>
                    Authentication and security-related activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {auditLogs
                      .filter(
                        (log) =>
                          log.action.includes("logout") ||
                          log.action.includes("login"),
                      )
                      .slice(0, 10)
                      .map((log) => (
                        <div
                          key={log._id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <Shield className="h-4 w-4 text-amber-600" />
                            <div>
                              <div className="text-sm font-medium">
                                {log.action.replace(/_/g, " ")}
                              </div>
                              {log.actor_id && (
                                <div className="text-muted-foreground text-xs">
                                  {log.actor_id.name} - {log.actor_id.email}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-muted-foreground text-xs">
                              {formatDistanceToNow(new Date(log.created_at), {
                                addSuffix: true,
                              })}
                            </div>
                            <div className="text-muted-foreground text-xs">
                              {log.payload?.ip}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
