"use client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
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
import { useAuthStore } from "@/store/auth-store";

interface RequestDetails {
  _id: string;
  requester_id: {
    _id: string;
    name: string;
    email: string;
  };
  target_teacher_id: {
    _id: string;
    name: string;
    email: string;
  };
  course_id: {
    _id: string;
    course_code: string;
    title: string;
  };
  target_course_id: {
    _id: string;
    course_code: string;
    title: string;
  };
  student_ids: Array<{
    _id: string;
    name: string;
    level: number;
  }>;
  message: string;
  status: "pending" | "approved" | "declined";
  expires_at: string;
  created_at: string;
  processed_at?: string;
  processed_by?: string;
  response_message?: string;
}

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const requestId = params.requestId as string;

  // Auth store
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const [requestDetails, setRequestDetails] =
    React.useState<RequestDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

  // Fetch request details
  React.useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!requestId) return;

      setIsLoading(true);
      setError(null);

      try {
        const authStorage = localStorage.getItem("auth-storage");
        let token = null;
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token;
        }

        const response = await fetch(
          `${API_BASE_URL}/student-sharing/${requestId}/details`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              errorData.message ||
              `HTTP error! status: ${response.status}`,
          );
        }

        const data = await response.json();
        setRequestDetails(data.request);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch request details";
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [requestId, API_BASE_URL]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge
            variant="outline"
            className="border-yellow-200 bg-yellow-50 text-yellow-800"
          >
            <Clock className="mr-1 h-3 w-3" />
            Pending
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-800"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case "declined":
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-800"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Declined
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading request details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !requestDetails) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <XCircle className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
            <h3 className="mb-2 text-lg font-semibold">Request Not Found</h3>
            <p className="text-muted-foreground mb-4">
              {error ||
                "The request you're looking for doesn't exist or you don't have permission to view it."}
            </p>
            <Button onClick={() => router.push("/share-students")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Requests
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
            items={
              isAdmin
                ? [
                    { label: "Lecturers", href: "/lecturers" },
                    { label: "Share Students", href: "/share-students" },
                    { label: "Request Details", current: true },
                  ]
                : [
                    { label: "Share Students", href: "/share-students" },
                    { label: "Request Details", current: true },
                  ]
            }
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/share-students")}
          className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 md:hidden"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Requests
        </Button>

        {/* Header */}
        <div className="animate-appear flex items-center gap-4 opacity-0 delay-100">
          <div className="flex-1">
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Request Details
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Student sharing request information
            </p>
          </div>
          {getStatusBadge(requestDetails.status)}
        </div>

        {/* Request Overview */}
        <div className="animate-appear grid gap-6 opacity-0 delay-200 lg:grid-cols-2">
          {/* Requester Information */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Requester
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold">
                  {requestDetails.requester_id.name}
                </p>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {requestDetails.requester_id.email}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium">From Course:</p>
                <p className="text-muted-foreground text-sm">
                  {requestDetails.course_id.course_code} -{" "}
                  {requestDetails.course_id.title}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Target Teacher Information */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Target Teacher
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="font-semibold">
                  {requestDetails.target_teacher_id.name}
                </p>
                <p className="text-muted-foreground flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  {requestDetails.target_teacher_id.email}
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm font-medium">Target Course:</p>
                <p className="text-muted-foreground text-sm">
                  {requestDetails.target_course_id.course_code} -{" "}
                  {requestDetails.target_course_id.title}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Requested */}
        <Card className="animate-appear border-border/50 bg-card/50 opacity-0 backdrop-blur-sm delay-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Students Requested ({requestDetails.student_ids.length})
            </CardTitle>
            <CardDescription>
              Students requested to be added to the course
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {requestDetails.student_ids.map((student, index) => (
                <div
                  key={student._id}
                  className="border-border/50 bg-background/50 animate-fade-in-up animate-stagger rounded-lg border p-3 backdrop-blur-sm"
                  style={
                    {
                      "--stagger-delay": index * 2, // Using 2x for 100ms delay instead of 50ms
                    } as React.CSSProperties
                  }
                >
                  <div className="space-y-1">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-muted-foreground text-sm">
                      {formatLevel(student.level)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        {requestDetails.message && (
          <Card className="animate-appear border-border/50 bg-card/50 opacity-0 backdrop-blur-sm delay-400">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Request Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">{requestDetails.message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Response Message */}
        {requestDetails.response_message && (
          <Card className="animate-appear border-border/50 bg-card/50 opacity-0 backdrop-blur-sm delay-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Response Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm">{requestDetails.response_message}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline */}
        <Card className="animate-appear border-border/50 bg-card/50 opacity-0 backdrop-blur-sm delay-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 text-primary rounded-full p-2">
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Request Created</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(requestDetails.created_at)}
                  </p>
                </div>
              </div>

              {requestDetails.processed_at && (
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-full p-2 ${
                      requestDetails.status === "approved"
                        ? "bg-green-100 text-green-600"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {requestDetails.status === "approved" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      Request{" "}
                      {requestDetails.status === "approved"
                        ? "Approved"
                        : "Declined"}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {formatDate(requestDetails.processed_at)}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-orange-100 p-2 text-orange-600">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">Expires</p>
                  <p className="text-muted-foreground text-sm">
                    {formatDate(requestDetails.expires_at)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
