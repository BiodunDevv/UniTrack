"use client";

import {
  Activity,
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Hash,
  Loader2,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://unitrack-backend-hd9s.onrender.com/api";

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
    course_id?: string;
  };
  recent_submissions: Array<{
    student_id: string;
    student_name: string;
    student_email: string;
    status: string;
    timestamp: string;
    location?: {
      lat: number;
      lng: number;
    };
  }>;
  live_stats: {
    total_submissions: number;
    present_count: number;
    last_updated: string;
  };
}

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [liveData, setLiveData] = React.useState<LiveSessionResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(true);

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
            items={[
              { label: "Courses", href: "/course" },
              {
                label: "Course",
                href: session_info.course_id
                  ? `/course/${session_info.course_id}`
                  : "/course",
              },
              {
                label: `Session ${session_info.session_code}`,
                href: `/session/${sessionId}`,
              },
              { label: "Live Monitoring", current: true },
            ]}
          />
        </div>

        {/* Header */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <Button variant="default" size="sm" onClick={() => router.back()}>
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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        </div>

        {/* Recent Submissions */}
        <Card className="animate-appear border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Submissions
              </span>
              <span className="text-muted-foreground text-sm font-normal">
                Last updated: {formatDateTime(live_stats.last_updated)}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recent_submissions.length === 0 ? (
              <div className="py-8 text-center">
                <Users className="text-muted-foreground/50 mx-auto mb-4 h-12 w-12" />
                <p className="text-muted-foreground">No submissions yet</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Waiting for students to mark attendance...
                </p>
              </div>
            ) : (
              <div className="max-h-96 space-y-3 overflow-y-auto">
                {recent_submissions.map((submission, index) => (
                  <div
                    key={index}
                    className="bg-muted/50 flex items-center justify-between rounded-lg p-4"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(submission.status)}
                      <div>
                        <p className="font-medium">{submission.student_name}</p>
                        <p className="text-muted-foreground text-sm">
                          {submission.student_email}
                        </p>
                        {submission.location && (
                          <p className="text-muted-foreground text-xs">
                            Location: {submission.location.lat.toFixed(6)},{" "}
                            {submission.location.lng.toFixed(6)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={getStatusColor(submission.status)}
                      >
                        {submission.status}
                      </Badge>
                      <p className="text-muted-foreground mt-1 text-sm">
                        {formatDateTime(submission.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
