"use client";

import {
  BookOpen,
  Clock,
  Edit,
  Eye,
  GraduationCap,
  Plus,
  Search,
  Trash2,
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
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { UpdateCourseModal } from "@/components/ui/update-course-modal";
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";

export default function CoursesPage() {
  const router = useRouter();
  const {
    courses,
    isLoading,
    error,
    pagination,
    totalStudents,
    totalActiveSessions,
    getAllCourses,
    updateCourse,
    deleteCourse,
    setCurrentCourse,
    setCurrentPage: setCourseStorePage,
    clearError,
  } = useCourseStore();

  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [courseToUpdate, setCourseToUpdate] = useState<
    (typeof courses)[0] | null
  >(null);

  // Fetch courses on component mount
  React.useEffect(() => {
    if (isAuthenticated && !authLoading) {
      getAllCourses();
    }
  }, [getAllCourses, isAuthenticated, authLoading]);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Reset to first page when search query changes
  React.useEffect(() => {
    if (searchQuery) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  // Filter courses based on search query (client-side filtering for search)
  const filteredCourses = searchQuery
    ? courses.filter(
        (course) =>
          course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.course_code
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.level.toString().includes(searchQuery.toLowerCase()),
      )
    : courses;

  const handleCourseClick = (course: (typeof courses)[0]) => {
    setCurrentCourse(course);
    router.push(`/course/${course._id}`);
  };

  const handleDeleteCourse = async (courseId: string, courseTitle: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`,
      )
    ) {
      try {
        await deleteCourse(courseId);
        toast.success("Course deleted successfully");
        // Refresh all courses and maintain current page if possible
        getAllCourses();
      } catch (error) {
        toast.error("Failed to delete course");
        console.error("Failed to delete course:", error);
      }
    }
  };

  const handleEditCourse = (course: (typeof courses)[0]) => {
    setCourseToUpdate(course);
    setShowUpdateModal(true);
  };

  const handleUpdateCourse = async (
    courseId: string,
    data: { title?: string; level?: number },
  ) => {
    try {
      await updateCourse(courseId, data);
      // Refresh courses list after update
      getAllCourses();
    } catch (error) {
      throw error; // Let the modal handle the error
    }
  };

  // Handle pagination change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setCourseStorePage(page);
  };

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
    };
    return levelMap[level] || `Level ${level}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb items={[{ label: "Courses", current: true }]} />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Course Management
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {getGreeting()}, {user?.name || "Lecturer"} • Manage your courses
              and track progress
              {!isLoading &&
                pagination &&
                pagination.totalPages > 1 &&
                !searchQuery && (
                  <span className="ml-2">
                    • Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                )}
            </p>
          </div>
          <Button
            onClick={() => router.push("/course/create")}
            className="border-border/50 bg-primary hover:bg-primary/90 hover:shadow-primary/20 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Course
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="animate-appear flex flex-col items-start justify-between gap-4 opacity-0 delay-200 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/50 bg-card/50 hover:border-border focus:border-primary pl-9 backdrop-blur-sm transition-all duration-300"
            />
          </div>
          {/* Search results counter - only show for search */}
          {searchQuery && !isLoading && (
            <div className="text-muted-foreground text-sm">
              {filteredCourses.length} result
              {filteredCourses.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="animate-appear grid gap-4 opacity-0 delay-300 sm:grid-cols-2 lg:grid-cols-3">
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
                {isLoading ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  pagination?.totalCourses || courses.length
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoading ? "" : "Total courses"}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Total Students
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Users className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {isLoading ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  totalStudents
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoading ? "" : "Enrolled students"}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Active Sessions
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <Clock className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {isLoading ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  totalActiveSessions
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoading ? "" : "Running sessions"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Grid */}
        <div className="animate-appear space-y-8 opacity-0 delay-500">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
                <p className="text-muted-foreground">Loading courses...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
                  <GraduationCap className="h-12 w-12" />
                </div>
                <h3 className="mb-2 text-lg font-semibold lg:text-xl">
                  {searchQuery ? "No courses found" : "No courses yet"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md text-center text-sm lg:text-base">
                  {searchQuery
                    ? "Try adjusting your search terms to find what you're looking for"
                    : "Get started by creating your first course and begin your teaching journey"}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => router.push("/course/create")}
                    className="hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Course
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((course, index) => (
                <Card
                  key={course._id}
                  className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: "fadeInUp 0.4s ease-out forwards",
                    opacity: 0,
                    transform: "translateY(10px)",
                  }}
                  onClick={() => handleCourseClick(course)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-3 flex items-center gap-2">
                          <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500">
                            <GraduationCap className="h-4 w-4 group-hover:animate-pulse" />
                          </div>
                          <Badge
                            variant="outline"
                            className="border-border/50 bg-background/50 text-xs backdrop-blur-sm"
                          >
                            {course.course_code}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {formatLevel(course.level)}
                          </Badge>
                          {course.has_active_session && (
                            <Badge
                              variant="default"
                              className="border-green-200 bg-green-100 text-xs text-green-800"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              Live
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="group-hover:text-primary text-base transition-colors duration-300 lg:text-lg">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="text-xs lg:text-sm">
                          Instructor: {course.teacher_id.name}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Students
                          </span>
                          <span className="text-xs font-medium">
                            {course.student_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Active Sessions
                          </span>
                          <span className="text-xs font-medium">
                            {course.active_sessions_count || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Created
                          </span>
                          <span className="text-xs">
                            {new Date(course.created_at).toLocaleDateString()}
                          </span>
                        </div>
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
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCourse(course);
                          }}
                          className="border-border/50  backdrop-blur-sm transition-all duration-30"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(course._id, course.title);
                          }}
                          className="border-red-200 backdrop-blur-sm transition-all duration-300 hover:border-red-300 hover:bg-red-100 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
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
            pagination.totalPages > 1 &&
            !isLoading && (
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
                totalItems={pagination.totalCourses || 0}
                itemsPerPage={8}
                itemName="courses"
              />
            )}
        </div>
      </div>

      {/* Update Course Modal */}
      {courseToUpdate && (
        <UpdateCourseModal
          isOpen={showUpdateModal}
          onClose={() => {
            setShowUpdateModal(false);
            setCourseToUpdate(null);
          }}
          onUpdateCourse={handleUpdateCourse}
          course={courseToUpdate}
          isLoading={isLoading}
        />
      )}
    </DashboardLayout>
  );
}
