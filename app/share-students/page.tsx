"use client";

import {
  ArrowLeft,
  Bell,
  BookOpen,
  CheckCircle,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Search,
  Send,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/auth-store";
import {
  type ShareRequest,
  useStudentShareStore,
} from "@/store/student-share-store";

function ShareStudentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "browse-teachers";
  const { user } = useAuthStore();

  const {
    // State
    teachers,
    myCourses,
    incomingRequests,
    outgoingRequests,
    isLoading,
    isLoadingTeachers,
    isLoadingCourses,
    summary,

    // Actions
    getTeachers,
    getMyCourses,
    getIncomingRequests,
    getOutgoingRequests,
    respondToRequest,
    cancelRequest,
  } = useStudentShareStore();

  const [teacherSearch, setTeacherSearch] = React.useState("");

  // Pagination states
  const [teachersPage, setTeachersPage] = React.useState(1);
  const [incomingPage, setIncomingPage] = React.useState(1);
  const [outgoingPage, setOutgoingPage] = React.useState(1);
  const itemsPerPage = 9;

  // Fetch initial data
  React.useEffect(() => {
    getTeachers();
    getMyCourses();
    getIncomingRequests();
    getOutgoingRequests();
  }, [getTeachers, getMyCourses, getIncomingRequests, getOutgoingRequests]);

  // Reset teachers page when search query changes
  React.useEffect(() => {
    setTeachersPage(1);
  }, [teacherSearch]);

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
      teacher.email.toLowerCase().includes(teacherSearch.toLowerCase()),
  );

  // Pagination calculations
  const totalTeachersPages = Math.ceil(filteredTeachers.length / itemsPerPage);
  const paginatedTeachers = filteredTeachers.slice(
    (teachersPage - 1) * itemsPerPage,
    teachersPage * itemsPerPage,
  );

  const totalIncomingPages = Math.ceil(incomingRequests.length / itemsPerPage);
  const paginatedIncomingRequests = incomingRequests.slice(
    (incomingPage - 1) * itemsPerPage,
    incomingPage * itemsPerPage,
  );

  const totalOutgoingPages = Math.ceil(outgoingRequests.length / itemsPerPage);
  const paginatedOutgoingRequests = outgoingRequests.slice(
    (outgoingPage - 1) * itemsPerPage,
    outgoingPage * itemsPerPage,
  );

  const handleTeacherClick = (teacherId: string) => {
    router.push(`/share-students/teacher/${teacherId}`);
  };

  const handleViewRequestDetails = (requestId: string) => {
    router.push(`/share-students/request/${requestId}`);
  };

  const handleRespondToRequest = async (
    requestId: string,
    status: "accepted" | "rejected",
  ) => {
    try {
      const action = status === "accepted" ? "approve" : "reject";
      await respondToRequest(requestId, action);
      toast.success(`Request ${status} successfully!`);
      getIncomingRequests();
    } catch {
      toast.error(`Failed to ${status} request. Please try again.`);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await cancelRequest(requestId);
      toast.success("Request cancelled successfully!");
      getOutgoingRequests();
    } catch {
      toast.error("Failed to cancel request. Please try again.");
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-800"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb items={[{ label: "Share Students", current: true }]} />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 md:hidden"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Student Sharing
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {getGreeting()}, {user?.name || "Teacher"} • Request and manage
              student sharing between teachers
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Incoming Requests
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Bell className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {isLoading ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  summary?.pending_incoming || 0
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoading ? "" : "Pending approvals"}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Outgoing Requests
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Send className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {isLoading ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  summary?.pending_outgoing || 0
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoading ? "" : "Sent requests"}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Available Teachers
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Users className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {isLoadingTeachers ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  teachers.length
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoadingTeachers ? "" : "Can share students"}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                My Courses
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <BookOpen className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {isLoadingCourses ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  myCourses.length
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoadingCourses ? "" : "Total courses"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="animate-appear space-y-4 opacity-0 delay-300">
          <Tabs defaultValue={activeTab} className="space-y-4">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger
                value="browse-teachers"
                onClick={(e) => {
                  e.preventDefault();
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", "browse-teachers");
                  window.history.replaceState({}, "", url);
                }}
              >
                Teachers
              </TabsTrigger>
              <TabsTrigger
                value="incoming"
                className="relative"
                onClick={(e) => {
                  e.preventDefault();
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", "incoming");
                  window.history.replaceState({}, "", url);
                }}
              >
                Incoming
                {(summary?.pending_incoming || 0) > 0 && (
                  <Badge
                    variant="destructive"
                    className="ml-2 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
                  >
                    {summary?.pending_incoming}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="outgoing"
                onClick={(e) => {
                  e.preventDefault();
                  const url = new URL(window.location.href);
                  url.searchParams.set("tab", "outgoing");
                  window.history.replaceState({}, "", url);
                }}
              >
                Outgoing
              </TabsTrigger>
            </TabsList>

            {/* Browse Teachers Tab */}
            <TabsContent value="browse-teachers" className="space-y-4">
              {/* Search and Filters */}
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div className="relative w-full max-w-md flex-1">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Search teachers by name or email..."
                    value={teacherSearch}
                    onChange={(e) => setTeacherSearch(e.target.value)}
                    className="border-border/50 bg-card/50 hover:border-border focus:border-primary pl-9 backdrop-blur-sm transition-all duration-300"
                  />
                  {teacherSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setTeacherSearch("")}
                      className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                {/* Search results counter - only show for search */}
                {teacherSearch && !isLoadingTeachers && (
                  <div className="text-muted-foreground text-sm">
                    {filteredTeachers.length} result
                    {filteredTeachers.length !== 1 ? "s" : ""} found
                  </div>
                )}
              </div>

              {/* Teachers Grid */}
              <div className="space-y-8">
                {isLoadingTeachers ? (
                  <div className="flex min-h-screen flex-1 items-center justify-center">
                    <div className="text-center">
                      <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                      <p className="text-muted-foreground">
                        Loading teachers...
                      </p>
                    </div>
                  </div>
                ) : filteredTeachers.length === 0 ? (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
                        <Users className="h-12 w-12" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold lg:text-xl">
                        {teacherSearch
                          ? "No teachers found"
                          : "No teachers available"}
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-md text-center text-sm lg:text-base">
                        {teacherSearch
                          ? `No teachers found matching "${teacherSearch}"`
                          : "There are no teachers available for student sharing at the moment"}
                      </p>
                      {teacherSearch && (
                        <Button
                          variant="outline"
                          onClick={() => setTeacherSearch("")}
                          className="hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                        >
                          Clear search
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                      {paginatedTeachers.map((teacher, index) => (
                        <Card
                          key={teacher._id}
                          className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                          style={{
                            animationName: "fadeInUp",
                            animationDuration: "0.4s",
                            animationTimingFunction: "ease-out",
                            animationFillMode: "forwards",
                            animationDelay: `${index * 50}ms`,
                            opacity: 0,
                            transform: "translateY(10px)",
                          }}
                          onClick={() => handleTeacherClick(teacher._id)}
                        >
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="mb-3 flex items-center gap-2">
                                  <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500">
                                    <Users className="h-4 w-4 group-hover:animate-pulse" />
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className="border-border/50 bg-background/50 text-xs backdrop-blur-sm"
                                  >
                                    Teacher
                                  </Badge>
                                </div>
                                <CardTitle className="group-hover:text-primary text-base transition-colors duration-300 lg:text-lg">
                                  {teacher.name}
                                </CardTitle>
                                <CardDescription className="text-xs lg:text-sm">
                                  <Mail className="mr-1 inline h-3 w-3" />
                                  {teacher.email}
                                </CardDescription>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="flex items-center gap-2 pt-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTeacherClick(teacher._id);
                                }}
                                className="border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground flex-1 backdrop-blur-sm transition-all duration-300"
                              >
                                <BookOpen className="mr-1 h-3 w-3" />
                                View Courses
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Teachers Pagination */}
                    {totalTeachersPages > 1 && (
                      <Pagination
                        currentPage={teachersPage}
                        totalPages={totalTeachersPages}
                        onPageChange={setTeachersPage}
                        totalItems={filteredTeachers.length}
                        itemsPerPage={itemsPerPage}
                        itemName="teachers"
                      />
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            {/* Incoming Requests Tab */}
            <TabsContent value="incoming" className="space-y-4">
              <div className="space-y-8">
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                      <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                      <p className="text-muted-foreground">
                        Loading requests...
                      </p>
                    </div>
                  </div>
                ) : incomingRequests.length === 0 ? (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
                        <Bell className="h-12 w-12" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold lg:text-xl">
                        No incoming requests
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-md text-center text-sm lg:text-base">
                        You haven&apos;t received any student sharing requests
                        yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {paginatedIncomingRequests.map(
                        (request: ShareRequest, index) => (
                          <Card
                            key={request._id}
                            className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                            style={{
                              animationName: "fadeInUp",
                              animationDuration: "0.4s",
                              animationTimingFunction: "ease-out",
                              animationFillMode: "forwards",
                              animationDelay: `${index * 50}ms`,
                              opacity: 0,
                              transform: "translateY(10px)",
                            }}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="mb-3 flex items-center gap-2">
                                    <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500">
                                      <Users className="h-4 w-4 group-hover:animate-pulse" />
                                    </div>
                                    {getStatusBadge(request.status)}
                                  </div>
                                  <CardTitle className="group-hover:text-primary text-base transition-colors duration-300 lg:text-lg">
                                    Request from{" "}
                                    {(typeof request.requester_id ===
                                      "object" &&
                                      request.requester_id?.name) ||
                                      "Unknown Teacher"}
                                  </CardTitle>
                                  <CardDescription className="text-xs lg:text-sm">
                                    <Mail className="mr-1 inline h-3 w-3" />
                                    {(typeof request.requester_id ===
                                      "object" &&
                                      request.requester_id?.email) ||
                                      "No email"}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                      Course
                                    </span>
                                    <span className="text-xs font-medium">
                                      {request.course_id?.course_code}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                      Students
                                    </span>
                                    <span className="text-xs font-medium">
                                      {request.student_ids?.length || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                      Requested
                                    </span>
                                    <span className="text-xs">
                                      {formatDateTime(request.created_at)}
                                    </span>
                                  </div>
                                </div>

                                {request.message && (
                                  <div className="bg-muted/50 rounded p-2">
                                    <div className="mb-1 flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      <span className="text-xs font-medium">
                                        Message:
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2 text-xs">
                                      {request.message}
                                    </p>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewRequestDetails(request._id)
                                    }
                                    className="border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground flex-1 backdrop-blur-sm transition-all duration-300"
                                  >
                                    <Eye className="mr-1 h-3 w-3" />
                                    View Details
                                  </Button>
                                  {request.status === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          handleRespondToRequest(
                                            request._id,
                                            "accepted",
                                          )
                                        }
                                        disabled={isLoading}
                                        className="backdrop-blur-sm transition-all duration-300"
                                      >
                                        <CheckCircle className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() =>
                                          handleRespondToRequest(
                                            request._id,
                                            "rejected",
                                          )
                                        }
                                        disabled={isLoading}
                                        className="backdrop-blur-sm transition-all duration-300"
                                      >
                                        <XCircle className="h-3 w-3" />
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </div>

                    {/* Incoming Requests Pagination */}
                    {totalIncomingPages > 1 && (
                      <Pagination
                        currentPage={incomingPage}
                        totalPages={totalIncomingPages}
                        onPageChange={setIncomingPage}
                        totalItems={incomingRequests.length}
                        itemsPerPage={itemsPerPage}
                        itemName="incoming requests"
                      />
                    )}
                  </>
                )}
              </div>
            </TabsContent>

            {/* Outgoing Requests Tab */}
            <TabsContent value="outgoing" className="space-y-4">
              <div className="space-y-8">
                {isLoading ? (
                  <div className="flex flex-1 items-center justify-center">
                    <div className="text-center">
                      <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                      <p className="text-muted-foreground">
                        Loading requests...
                      </p>
                    </div>
                  </div>
                ) : outgoingRequests.length === 0 ? (
                  <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
                        <Send className="h-12 w-12" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold lg:text-xl">
                        No outgoing requests
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-md text-center text-sm lg:text-base">
                        You haven&apos;t sent any student sharing requests yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {paginatedOutgoingRequests.map(
                        (request: ShareRequest, index) => (
                          <Card
                            key={request._id}
                            className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                            style={{
                              animationName: "fadeInUp",
                              animationDuration: "0.4s",
                              animationTimingFunction: "ease-out",
                              animationFillMode: "forwards",
                              animationDelay: `${index * 50}ms`,
                              opacity: 0,
                              transform: "translateY(10px)",
                            }}
                          >
                            <CardHeader className="pb-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="mb-3 flex items-center gap-2">
                                    <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500">
                                      <Send className="h-4 w-4 group-hover:animate-pulse" />
                                    </div>
                                    {getStatusBadge(request.status)}
                                  </div>
                                  <CardTitle className="group-hover:text-primary text-base transition-colors duration-300 lg:text-lg">
                                    Request to{" "}
                                    {request.target_teacher_id?.name ||
                                      "Unknown Teacher"}
                                  </CardTitle>
                                  <CardDescription className="text-xs lg:text-sm">
                                    <Mail className="mr-1 inline h-3 w-3" />
                                    {request.target_teacher_id?.email ||
                                      "No email"}
                                  </CardDescription>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 gap-2 text-sm">
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                      Target Course
                                    </span>
                                    <span className="text-xs font-medium">
                                      {request.target_course_id?.course_code}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                      Students
                                    </span>
                                    <span className="text-xs font-medium">
                                      {request.student_ids?.length || 0}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                      Sent
                                    </span>
                                    <span className="text-xs">
                                      {formatDateTime(request.created_at)}
                                    </span>
                                  </div>
                                </div>

                                {request.message && (
                                  <div className="bg-muted/50 rounded p-2">
                                    <div className="mb-1 flex items-center gap-1">
                                      <MessageSquare className="h-3 w-3" />
                                      <span className="text-xs font-medium">
                                        Message:
                                      </span>
                                    </div>
                                    <p className="text-muted-foreground line-clamp-2 text-xs">
                                      {request.message}
                                    </p>
                                  </div>
                                )}

                                <div className="flex items-center gap-2 pt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleViewRequestDetails(request._id)
                                    }
                                    className="border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground flex-1 backdrop-blur-sm transition-all duration-300"
                                  >
                                    <Eye className="mr-1 h-3 w-3" />
                                    View Details
                                  </Button>
                                  {request.status === "pending" && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() =>
                                        handleCancelRequest(request._id)
                                      }
                                      disabled={isLoading}
                                      className="backdrop-blur-sm transition-all duration-300"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ),
                      )}
                    </div>

                    {/* Outgoing Requests Pagination */}
                    {totalOutgoingPages > 1 && (
                      <Pagination
                        currentPage={outgoingPage}
                        totalPages={totalOutgoingPages}
                        onPageChange={setOutgoingPage}
                        totalItems={outgoingRequests.length}
                        itemsPerPage={itemsPerPage}
                        itemName="outgoing requests"
                      />
                    )}
                  </>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ShareStudentsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShareStudentsContent />
    </Suspense>
  );
}
