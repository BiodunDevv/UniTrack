"use client";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Hash,
  Loader2,
  MapPin,
  Monitor,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

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
import { useAuthStore } from "@/store/auth-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

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

interface LiveSessionResponse {
  session_info: {
    session_code: string;
    is_active: boolean;
    expires_at: string;
    started_at: string;
  };
  recent_submissions: Array<{
    _id: string;
    session_id: string;
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
    status: string;
    reason: string;
    receipt_signature: string;
    submitted_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  live_stats: {
    total_submissions: number;
    present_count: number;
    rejected_count: number;
    last_submission: string;
    last_updated: string;
    time_window_minutes: number;
  };
  meta: {
    showing_recent: boolean;
    showing_all_recent: boolean;
  };
}

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // Auth store
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [liveData, setLiveData] = React.useState<LiveSessionResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Fetch live session data using the correct API endpoint
  const fetchLiveData = React.useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true);
        else setIsRefreshing(true);

        const token = getAuthToken();

        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(
          `${API_BASE_URL}/sessions/${sessionId}/live`,
          {
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
        console.log("Live session data:", data);
        setLiveData(data);
        setError(null);
      } catch (err) {
        console.error("Live session fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [sessionId],
  );

  // Initial fetch
  React.useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Auto-refresh every 10 seconds
  React.useEffect(() => {
    if (!autoRefresh || !liveData?.session_info.is_active) return;

    const interval = setInterval(() => {
      fetchLiveData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, liveData?.session_info.is_active, fetchLiveData]);

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m remaining`;
    }
    return `${remainingMinutes}m remaining`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-orange-600";
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

  if (error || !liveData) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="mb-4 text-red-500">{error || "Session not found"}</p>
            <Button onClick={() => fetchLiveData()}>Try Again</Button>
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="ml-2"
            >
              Go Back
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { session_info, recent_submissions, live_stats } = liveData;

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
                      label: `Session ${session_info.session_code}`,
                      href: `/session/${sessionId}`,
                    },
                    { label: "Live Monitoring", current: true },
                  ]
                : [
                    { label: "Courses", href: "/course" },
                    {
                      label: "Course",
                      href: `/course`,
                    },
                    {
                      label: `Session ${session_info.session_code}`,
                      href: `/session/${sessionId}`,
                    },
                    { label: "Live Monitoring", current: true },
                  ]
            }
          />
        </div>

        {/* Header */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:justify-between">
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="md:hidden"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Session
            </Button>
            <div>
              <h1 className="flex items-center gap-2 text-2xl font-bold">
                <Activity className="h-6 w-6 text-green-500" />
                Live Session Monitoring
              </h1>
              <p className="text-muted-foreground">
                Session Code:{" "}
                <span className="font-mono font-semibold">
                  {session_info.session_code}
                </span>
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => fetchLiveData(false)}
              disabled={isRefreshing}
            >
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              Auto-refresh {autoRefresh ? "ON" : "OFF"}
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Status
                  </p>
                  <div className="mt-2">
                    {session_info.is_active ? (
                      <Badge className="bg-green-500">
                        <Activity className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Ended</Badge>
                    )}
                  </div>
                </div>
                <Hash className="text-muted-foreground h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Time Remaining
                  </p>
                  <p className="text-2xl font-bold">
                    {formatTimeRemaining(session_info.expires_at)}
                  </p>
                </div>
                <Clock className="text-muted-foreground h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Total Submissions
                  </p>
                  <p className="text-2xl font-bold">
                    {live_stats.total_submissions}
                  </p>
                </div>
                <Users className="text-muted-foreground h-8 w-8" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Present Count
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {live_stats.present_count}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm font-medium">
                    Rejected Count
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {live_stats.rejected_count}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Submissions */}
        <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
                <CardDescription>
                  Live attendance submissions for this session
                </CardDescription>
                <div className="text-muted-foreground mt-2 flex flex-wrap gap-4 text-sm">
                  <span>
                    Last updated: {formatDateTime(live_stats.last_updated)}
                  </span>
                  {live_stats.last_submission && (
                    <span>
                      Last submission:{" "}
                      {formatDateTime(live_stats.last_submission)}
                    </span>
                  )}
                  <span>Window: {live_stats.time_window_minutes} minutes</span>
                </div>
              </div>
              {/* Search Bar */}
              <div className="relative w-full sm:w-80">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  type="text"
                  placeholder="Search by name, matric no..."
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
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {(() => {
              const filteredSubmissions = recent_submissions.filter(
                (submission) => {
                  if (!searchQuery) return true;
                  const query = searchQuery.toLowerCase();
                  return (
                    submission.student_id.name.toLowerCase().includes(query) ||
                    submission.matric_no_submitted
                      .toLowerCase()
                      .includes(query) ||
                    submission.status.toLowerCase().includes(query)
                  );
                },
              );

              if (filteredSubmissions.length === 0) {
                return searchQuery ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No submissions found matching &quot;{searchQuery}&quot;
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSearchQuery("")}
                      className="mt-2"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center">
                    <Users className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                    <p className="text-muted-foreground">No submissions yet</p>
                    <p className="text-muted-foreground mt-2 text-sm">
                      Waiting for students to mark attendance...
                    </p>
                  </div>
                );
              }

              return (
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
                                Location
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Status
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Time
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredSubmissions.map((submission, index) => (
                              <tr
                                key={submission._id}
                                className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                              >
                                <td className="px-2 py-3 whitespace-nowrap">
                                  <span className="text-xs font-medium">
                                    #{index + 1}
                                  </span>
                                </td>
                                <td className="px-2 py-3">
                                  <div className="flex min-w-[120px] items-center gap-2">
                                    {getStatusIcon(submission.status)}
                                    <p className="truncate text-xs font-medium">
                                      {submission.student_id.name}
                                    </p>
                                  </div>
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap">
                                  <p className="text-muted-foreground font-mono text-xs">
                                    {submission.matric_no_submitted}
                                  </p>
                                </td>
                                <td className="px-2 py-3">
                                  <div className="min-w-[120px]">
                                    <div className="flex items-center gap-1">
                                      <MapPin className="text-muted-foreground h-3 w-3" />
                                      <span className="text-muted-foreground text-xs">
                                        {submission.lat.toFixed(4)},{" "}
                                        {submission.lng.toFixed(4)}
                                      </span>
                                    </div>
                                    {submission.accuracy && (
                                      <p className="text-muted-foreground text-xs">
                                        ±{submission.accuracy}m
                                      </p>
                                    )}
                                  </div>
                                </td>
                                <td className="px-2 py-3 whitespace-nowrap">
                                  <Badge
                                    variant="outline"
                                    className={getStatusColor(
                                      submission.status,
                                    )}
                                  >
                                    {submission.status}
                                  </Badge>
                                </td>
                                <td className="px-2 py-3">
                                  <div className="min-w-[100px]">
                                    <p className="text-xs">
                                      {formatDateTime(submission.submitted_at)}
                                    </p>
                                    {submission.reason && (
                                      <p className="text-muted-foreground text-xs italic">
                                        {submission.reason}
                                      </p>
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
                              Location
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Device
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Submitted At
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSubmissions.map((submission, index) => (
                            <tr
                              key={submission._id}
                              className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                            >
                              <td className="px-4 py-4">
                                <span className="text-sm font-medium">
                                  #{index + 1}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-3">
                                  {getStatusIcon(submission.status)}
                                  <p className="text-sm font-medium">
                                    {submission.student_id.name}
                                  </p>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <p className="text-muted-foreground font-mono text-sm">
                                  {submission.matric_no_submitted}
                                </p>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1">
                                  <MapPin className="text-muted-foreground h-3 w-3" />
                                  <span className="text-muted-foreground text-xs">
                                    {submission.lat.toFixed(4)},{" "}
                                    {submission.lng.toFixed(4)}
                                  </span>
                                </div>
                                {submission.accuracy && (
                                  <p className="text-muted-foreground text-xs">
                                    ±{submission.accuracy}m
                                  </p>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-1">
                                  <Monitor className="text-muted-foreground h-3 w-3" />
                                  <span className="text-muted-foreground font-mono text-xs">
                                    {submission.device_fingerprint.substring(
                                      0,
                                      8,
                                    )}
                                    ...
                                  </span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <Badge
                                  variant="outline"
                                  className={getStatusColor(submission.status)}
                                >
                                  {submission.status}
                                </Badge>
                              </td>
                              <td className="px-4 py-4">
                                <div className="text-sm">
                                  <p>
                                    {formatDateTime(submission.submitted_at)}
                                  </p>
                                  {submission.reason && (
                                    <p className="text-muted-foreground text-xs italic">
                                      {submission.reason}
                                    </p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>

        {/* Session expired notice */}
        {!session_info.is_active && (
          <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Session Ended
                  </p>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    This session is no longer accepting attendance submissions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
