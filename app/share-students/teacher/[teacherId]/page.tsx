"use client";

import {
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Mail,
  Search,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";

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
import { useStudentShareStore } from "@/store/student-share-store";

export default function TeacherDetailPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.teacherId as string;

  // Auth store
  const { user } = useAuthStore();
  const isAdmin = user?.role === "admin";

  const {
    teachers,
    teacherCourses,
    isLoading,
    isLoadingTeachers,
    isLoadingCourses,
    getTeachers,
    getTeacherCourses,
  } = useStudentShareStore();

  const [searchQuery, setSearchQuery] = React.useState("");

  const teacher = teachers.find((t) => t._id === teacherId);

  // Fetch data
  React.useEffect(() => {
    if (teacherId) {
      getTeachers();
      getTeacherCourses(teacherId);
    }
  }, [teacherId, getTeachers, getTeacherCourses]);

  const handleCourseClick = (courseId: string) => {
    router.push(`/share-students/teacher/${teacherId}/course/${courseId}`);
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

  // Filter courses based on search query
  const filteredCourses = searchQuery
    ? teacherCourses.filter(
        (course) =>
          course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.course_code
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          course.level?.toString().includes(searchQuery),
      )
    : teacherCourses;

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if ((isLoadingTeachers || isLoading) && !teacher) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading teacher details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!teacher) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="bg-primary/10 text-primary mb-4 rounded-full p-4">
              <Users className="h-12 w-12" />
            </div>
            <h3 className="mb-2 text-lg font-semibold lg:text-xl">
              Teacher not found
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md text-center text-sm lg:text-base">
              The teacher you&apos;re looking for doesn&apos;t exist or may have
              been removed.
            </p>
            <Button
              onClick={() => router.push("/share-students")}
              className="hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Teachers
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
                    { label: teacher.name, href: `/lecturers/${teacherId}` },
                    { label: "Share Students", current: true },
                  ]
                : [
                    { label: "Share Students", href: "/share-students" },
                    { label: teacher.name, current: true },
                  ]
            }
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/share-students")}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 md:hidden"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Teachers
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              {teacher.name}&apos;s Courses
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {getGreeting()} • Browse and request students from {teacher.name}
              &apos;s courses
            </p>
            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4" />
              {teacher.email}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-3">
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
                {isLoadingCourses ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  teacherCourses.length
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoadingCourses ? "" : "Available courses"}
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
                {isLoadingCourses ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  teacherCourses.reduce(
                    (total: number, course) =>
                      total + (course.student_count || 0),
                    0,
                  )
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoadingCourses ? "" : "Enrolled students"}
              </p>
            </CardContent>
          </Card>

          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:shadow-lg sm:col-span-2 lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                Available Levels
              </CardTitle>
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                <GraduationCap className="h-4 w-4 group-hover:animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                {isLoadingCourses ? (
                  <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                ) : (
                  new Set(teacherCourses.map((course) => course.level)).size
                )}
              </div>
              <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                {isLoadingCourses ? "" : "Different year levels"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="animate-appear flex flex-col items-start justify-between gap-4 opacity-0 delay-300 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-border/50 bg-card/50 hover:border-border focus:border-primary pl-9 backdrop-blur-sm transition-all duration-300"
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
          {/* Search results counter - only show for search */}
          {searchQuery && !isLoadingCourses && (
            <div className="text-muted-foreground text-sm">
              {filteredCourses.length} result
              {filteredCourses.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>

        {/* Courses Grid */}
        <div className="animate-appear space-y-8 opacity-0 delay-500">
          {isLoadingCourses ? (
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
                  {searchQuery ? "No courses found" : "No courses available"}
                </h3>
                <p className="text-muted-foreground mb-4 max-w-md text-center text-sm lg:text-base">
                  {searchQuery
                    ? `No courses found matching "${searchQuery}"`
                    : `${teacher.name} has no courses available for student sharing at the moment`}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => setSearchQuery("")}
                    className="hover:shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    Clear search
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredCourses.map((course, index) => (
                <Card
                  key={course._id}
                  className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 animate-fade-in-up animate-stagger cursor-pointer backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                  style={
                    {
                      "--stagger-delay": index,
                    } as React.CSSProperties
                  }
                  onClick={() => handleCourseClick(course._id)}
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
                            {formatLevel(course.level || 0)}
                          </Badge>
                        </div>
                        <CardTitle className="group-hover:text-primary text-base transition-colors duration-300 lg:text-lg">
                          {course.title}
                        </CardTitle>
                        <CardDescription className="text-xs lg:text-sm">
                          Instructor: {teacher.name}
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
                            Level
                          </span>
                          <span className="text-xs font-medium">
                            {course.level}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-xs">
                            Code
                          </span>
                          <span className="text-xs">{course.course_code}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCourseClick(course._id);
                          }}
                          className="border-border/50 bg-background/50 hover:bg-primary hover:text-primary-foreground flex-1 backdrop-blur-sm transition-all duration-300"
                        >
                          <Users className="mr-1 h-3 w-3" />
                          View Students
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
