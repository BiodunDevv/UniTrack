"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Loader2,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { StudentShareCourseModal } from "@/components/ui/student-share-course-modal";
import { useStudentShareStore } from "@/store/student-share-store";

export default function CourseStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const teacherId = params.teacherId as string;
  const courseId = params.courseId as string;

  const {
    students,
    teacherCourses,
    myCourses,
    isLoadingStudents,
    isLoadingCourses,
    getTeacherStudents,
    getMyCourses,
    requestStudents,
  } = useStudentShareStore();

  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isLoadingMyCourses, setIsLoadingMyCourses] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 10;

  // Get current course data
  const currentCourse = teacherCourses.find(
    (course) => course._id === courseId,
  );

  // Get teacher info from URL or course data
  const teacherName = currentCourse?.teacher?.name || "Unknown Teacher";

  // Fetch students when component mounts
  React.useEffect(() => {
    if (teacherId && courseId) {
      getTeacherStudents(teacherId, courseId);
    }
  }, [teacherId, courseId, getTeacherStudents]);

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.matric_no.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset pagination when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleRequestStudents = async (myCourseId: string, message: string) => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    setIsRequesting(true);

    try {
      await requestStudents({
        target_teacher_id: teacherId, // Teacher whose students we want
        target_course_id: courseId, // Course we want to get students FROM (current course in URL)
        my_course_id: myCourseId, // Course we want to copy students TO (selected in modal)
        student_ids: selectedStudents,
        message: message.trim(),
      });

      toast.success(
        `Successfully requested ${selectedStudents.length} student${selectedStudents.length !== 1 ? "s" : ""}!`,
      );

      // Reset selections and navigate back
      setSelectedStudents([]);
      setShowCourseModal(false);

      // Navigate back to share-students page
      router.push("/share-students");
    } catch (error: unknown) {
      // Extract error message from various possible error formats
      let errorMessage = "";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const errorObj = error as {
          response?: { data?: { error?: string; message?: string } };
        };
        if (errorObj.response?.data?.error) {
          errorMessage = errorObj.response.data.error;
        } else if (errorObj.response?.data?.message) {
          errorMessage = errorObj.response.data.message;
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      } else {
        errorMessage = "Failed to send request";
      }

      // Check for pending request error and show appropriate message
      if (
        errorMessage.toLowerCase().includes("pending request") ||
        errorMessage.includes("already have a pending request")
      ) {
        toast.info(
          "You already have a pending request for this course. Please wait for it to be processed.",
        );
        setShowCourseModal(false);
        return;
      }

      // Show general error toast
      toast.error(errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  const openCourseModal = async () => {
    setIsLoadingMyCourses(true);
    try {
      await getMyCourses();
      setShowCourseModal(true);
    } catch (error) {
      console.error("Failed to load courses:", error);
      toast.error("Failed to load your courses");
    } finally {
      setIsLoadingMyCourses(false);
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

  if (isLoadingStudents && students.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading students...</p>
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
            items={[
              { label: "Share Students", href: "/share-students" },
              {
                label: teacherName,
                href: `/share-students/teacher/${teacherId}`,
              },
              { label: currentCourse?.course_code || "Course", current: true },
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  router.push(`/share-students/teacher/${teacherId}`)
                }
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 md:hidden"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Courses
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Course Students
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-sm">
                <BookOpen className="mr-1 h-3 w-3" />
                {currentCourse?.course_code}
              </Badge>
              {currentCourse?.level && (
                <Badge variant="secondary" className="text-sm">
                  {formatLevel(currentCourse.level)}
                </Badge>
              )}
              <span className="text-muted-foreground text-sm">
                {currentCourse?.title}
              </span>
            </div>
          </div>
          {/* Request Students Button */}
          {selectedStudents.length > 0 && (
            <Button
              onClick={openCourseModal}
              disabled={isRequesting || isLoadingMyCourses}
              className="border-border/50 bg-primary hover:bg-primary/90 hover:shadow-primary/20 cursor-pointer backdrop-blur-sm transition-all duration-300"
            >
              {isLoadingMyCourses ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading Courses...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Request Students ({selectedStudents.length})
                </>
              )}
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <div className="animate-appear flex flex-col items-start justify-between gap-4 opacity-0 delay-200 sm:flex-row sm:items-center">
          <div className="relative w-full max-w-md flex-1">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Search students..."
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
          {searchQuery && !isLoadingStudents && (
            <div className="text-muted-foreground text-sm">
              {filteredStudents.length} result
              {filteredStudents.length !== 1 ? "s" : ""} found
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-3">
          <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary text-2xl font-bold transition-all duration-300">
                {students.length}
              </div>
              <p className="text-muted-foreground text-xs">
                {students.length === 1
                  ? "student enrolled"
                  : "students enrolled"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Selected</CardTitle>
              <CheckCircle className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedStudents.length}
              </div>
              <p className="text-muted-foreground text-xs">
                {selectedStudents.length === 1
                  ? "student selected"
                  : "students selected"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Teacher</CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="truncate text-lg font-bold">{teacherName}</div>
              <p className="text-muted-foreground text-xs">Course instructor</p>
            </CardContent>
          </Card>
        </div>

        {/* Students Table/Content */}
        <div className="space-y-6">
          {isLoadingStudents ? (
            <div className="border-border/50 bg-card/50 rounded-lg border backdrop-blur-sm">
              <div className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="text-primary h-8 w-8 animate-spin" />
                  <p className="text-muted-foreground">Loading students...</p>
                </div>
              </div>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="border-border/50 bg-card/50 rounded-lg border backdrop-blur-sm">
              <div className="p-8">
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                    <Users className="text-muted-foreground h-6 w-6" />
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="font-semibold">
                      {searchQuery
                        ? "No matching students"
                        : "No students found"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {searchQuery
                        ? `No students match "${searchQuery}"`
                        : "This course doesn't have any students yet"}
                    </p>
                    {searchQuery && (
                      <Button
                        onClick={() => setSearchQuery("")}
                        variant="outline"
                        size="sm"
                        className="mt-4"
                      >
                        Clear Search
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="flex items-center justify-between">
                      <span>Current Students</span>
                    </CardTitle>
                    <CardDescription>
                      Select students to request for sharing
                    </CardDescription>
                  </div>
                  {/* Search Bar */}
                  <div className="relative w-full sm:w-80">
                    <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                    <Input
                      type="text"
                      placeholder="Search by name, matric no, or email..."
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

                {/* Bulk Actions */}
                {!isLoadingStudents && filteredStudents.length > 0 && (
                  <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground text-sm">
                        {selectedStudents.length} of {filteredStudents.length}{" "}
                        selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (
                            selectedStudents.length === filteredStudents.length
                          ) {
                            setSelectedStudents([]);
                          } else {
                            setSelectedStudents(
                              filteredStudents.map((s) => s._id),
                            );
                          }
                        }}
                      >
                        {selectedStudents.length === filteredStudents.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent className="p-0 sm:p-6">
                {isLoadingStudents && students.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
                      <p className="text-muted-foreground text-sm">
                        Loading students...
                      </p>
                    </div>
                  </div>
                ) : paginatedStudents.length > 0 ? (
                  <>
                    {/* Mobile Horizontal Scrollable Table */}
                    <div className="block sm:hidden">
                      <div className="overflow-x-auto">
                        <div className="min-w-[600px] px-4">
                          <table className="w-full">
                            <thead>
                              <tr className="border-border border-b">
                                <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                  <input
                                    type="checkbox"
                                    checked={
                                      selectedStudents.length ===
                                        filteredStudents.length &&
                                      filteredStudents.length > 0
                                    }
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedStudents(
                                          filteredStudents.map((s) => s._id),
                                        );
                                      } else {
                                        setSelectedStudents([]);
                                      }
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                </th>
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
                                  Email
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedStudents.map((student, index) => {
                                const globalIndex =
                                  (currentPage - 1) * studentsPerPage +
                                  index +
                                  1;
                                return (
                                  <tr
                                    key={student._id}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                  >
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={selectedStudents.includes(
                                          student._id,
                                        )}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedStudents((prev) => [
                                              ...prev,
                                              student._id,
                                            ]);
                                          } else {
                                            setSelectedStudents((prev) =>
                                              prev.filter(
                                                (id) => id !== student._id,
                                              ),
                                            );
                                          }
                                        }}
                                        className="rounded border-gray-300"
                                      />
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <span className="text-xs font-medium">
                                        #{globalIndex}
                                      </span>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="truncate text-xs font-medium">
                                          {student.name}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <p className="text-muted-foreground font-mono text-xs">
                                        {student.matric_no}
                                      </p>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[150px]">
                                        <p className="text-muted-foreground truncate text-xs">
                                          {student.email}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
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
                              <th className="text-muted-foreground w-12 px-4 py-3 text-left text-sm font-medium">
                                <input
                                  type="checkbox"
                                  checked={
                                    selectedStudents.length ===
                                      filteredStudents.length &&
                                    filteredStudents.length > 0
                                  }
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedStudents(
                                        filteredStudents.map((s) => s._id),
                                      );
                                    } else {
                                      setSelectedStudents([]);
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </th>
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
                                Email Address
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {paginatedStudents.map((student, index) => {
                              const globalIndex =
                                (currentPage - 1) * studentsPerPage + index + 1;
                              return (
                                <tr
                                  key={student._id}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-all duration-300"
                                >
                                  <td className="px-4 py-4">
                                    <input
                                      type="checkbox"
                                      checked={selectedStudents.includes(
                                        student._id,
                                      )}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedStudents((prev) => [
                                            ...prev,
                                            student._id,
                                          ]);
                                        } else {
                                          setSelectedStudents((prev) =>
                                            prev.filter(
                                              (id) => id !== student._id,
                                            ),
                                          );
                                        }
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-4 py-4">
                                    <span className="text-sm font-medium">
                                      #{globalIndex}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm font-medium">
                                      {student.name}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground font-mono text-sm">
                                      {student.matric_no}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground text-sm">
                                      {student.email}
                                    </p>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Pagination */}
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      totalItems={filteredStudents.length}
                      itemsPerPage={studentsPerPage}
                      itemName="students"
                    />
                  </>
                ) : searchQuery ? (
                  <div className="px-6 py-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      No students found matching &quot;{searchQuery}&quot;
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
                    <p className="text-muted-foreground text-sm">
                      No students enrolled yet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Course Selection Modal */}
      <StudentShareCourseModal
        isOpen={showCourseModal}
        onClose={() => setShowCourseModal(false)}
        onCourseSelect={handleRequestStudents}
        courses={myCourses}
        selectedStudentsCount={selectedStudents.length}
        isLoading={isRequesting || isLoadingCourses}
      />
    </DashboardLayout>
  );
}
