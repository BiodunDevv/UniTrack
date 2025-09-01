"use client";

import {
  ArrowLeft,
  BookOpen,
  Copy,
  Eye,
  Loader2,
  Search,
  Trash,
  Trash2,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  AddSingleStudentSection,
  BulkStudentUploadSection,
} from "@/components/StudentsPage";
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
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { CopyStudentsModal } from "@/components/ui/copy-students-modal";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourseStore } from "@/store/course-store";

export default function StudentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const {
    currentCourse,
    students,
    sessions,
    isLoading,
    error,
    getCourse,
    removeStudentFromCourse,
    bulkRemoveStudentsFromCourse,
    removeAllStudentsFromCourse,
    clearError,
    getAllCourses,
  } = useCourseStore();

  const [removingStudentId, setRemovingStudentId] = useState<string | null>(
    null,
  );

  // Confirmation modal state for student removal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Copy students state
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk delete state
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Handle copy completion
  const handleCopyComplete = async () => {
    // Refresh the course data to show newly added students
    await getCourse(courseId);
    // Close the modal
    setShowCopyDialog(false);
  };

  // Fetch course data on mount
  React.useEffect(() => {
    if (courseId) {
      getCourse(courseId);
    }
  }, [courseId, getCourse]);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleRemoveStudent = async (studentId: string) => {
    // Find the student to get their name for the confirmation dialog
    const student = students.find((s) => s._id === studentId);
    const studentName = student?.name || "this student";

    // Set the student to remove and show confirmation modal
    setStudentToRemove({ id: studentId, name: studentName });
    setShowConfirmationModal(true);
  };

  // Confirm student removal
  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;

    setRemovingStudentId(studentToRemove.id);

    // Show optimistic loading toast
    const loadingToast = toast.loading(`Removing ${studentToRemove.name}...`, {
      description: "This action cannot be undone.",
    });

    try {
      await removeStudentFromCourse(courseId, studentToRemove.id);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`${studentToRemove.name} removed successfully!`, {
        description: "The student has been removed from this course.",
        duration: 4000,
      });

      // Refresh the course data to update student count and list
      await getCourse(courseId);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Failed to remove student", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setRemovingStudentId(null);
      setShowConfirmationModal(false);
      setStudentToRemove(null);
    }
  };

  const handleRefresh = () => {
    getCourse(courseId);
  };

  const openCopyDialog = async () => {
    // Show modal immediately
    setShowCopyDialog(true);

    try {
      await getAllCourses();
    } catch {
      toast.error("Failed to load courses");
    }
  };

  // Bulk delete handlers
  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId],
    );
  };

  const handleSelectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student._id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedStudents.length === 0) return;

    setIsBulkDeleting(true);

    // Show optimistic loading toast
    const loadingToast = toast.loading(
      `Removing ${selectedStudents.length} selected student${selectedStudents.length === 1 ? "" : "s"}...`,
      {
        description: "This action cannot be undone.",
      },
    );

    try {
      const result = await bulkRemoveStudentsFromCourse(
        courseId,
        selectedStudents,
      );
      setSelectedStudents([]);
      setShowBulkDeleteModal(false);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(
        `${result.summary.successful} student${result.summary.successful === 1 ? "" : "s"} removed successfully!`,
        {
          description: `The student${result.summary.successful === 1 ? " has" : "s have"} been removed from this course.`,
          duration: 4000,
        },
      );

      // Refresh the course data
      await getCourse(courseId);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to bulk delete students";
      toast.error("Failed to remove students", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    setIsBulkDeleting(true);

    // Show optimistic loading toast
    const loadingToast = toast.loading(
      `Removing all ${students.length} students...`,
      {
        description: "This action cannot be undone.",
      },
    );

    try {
      const result = await removeAllStudentsFromCourse(courseId);
      setShowDeleteAllModal(false);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(
        `All ${result.summary.total_students_removed} students removed successfully!`,
        {
          description: "All students have been removed from this course.",
          duration: 4000,
        },
      );

      // Refresh the course data
      await getCourse(courseId);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to delete all students";
      toast.error("Failed to remove all students", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Format level for display
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

  // Check if there's an active session
  const hasActiveSession =
    sessions?.some(
      (session) => session.is_active || session.status === "active",
    ) || false;

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

  // Pagination logic for filtered students
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset pagination when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading && !currentCourse) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentCourse) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Course not found</p>
            <Button onClick={() => router.push("/course")}>
              Go to Courses
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
            items={[
              { label: "Courses", href: "/course" },
              { label: currentCourse.title, href: `/course/${courseId}` },
              { label: "Manage Students", current: true },
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
                onClick={() => router.push(`/course/${courseId}`)}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 md:hidden"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Manage Students
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-sm">
                <BookOpen className="mr-1 h-3 w-3" />
                {currentCourse.course_code}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {formatLevel(currentCourse.level)}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {currentCourse.title}
              </span>
            </div>
          </div>
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
              <CardTitle className="text-sm font-medium">
                Course Level
              </CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentCourse.level}</div>
              <p className="text-muted-foreground text-xs">
                {formatLevel(currentCourse.level)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Code</CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-lg font-bold">
                {currentCourse.course_code}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="animate-appear opacity-0 delay-400">
          {/* Active Session Warning */}
          {hasActiveSession && (
            <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 mb-2 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <BookOpen className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold">Session in Progress</h4>
                    <p className="text-sm">
                      Student management is disabled while an attendance session
                      is active. Please end the current session to add or remove
                      students.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="student-list" className="space-y-4">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="student-list">Student List</TabsTrigger>
              <TabsTrigger value="add-single" disabled={hasActiveSession}>
                Add Student
              </TabsTrigger>
              <TabsTrigger value="bulk-upload" disabled={hasActiveSession}>
                Bulk Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student-list" className="space-y-4">
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center justify-between">
                        <span>Current Students</span>
                        {!hasActiveSession && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCopyDialog(true)}
                            className="ml-4"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy from Course
                          </Button>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Students currently enrolled in this course
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
                  {!hasActiveSession &&
                    !isLoading &&
                    filteredStudents.length > 0 && (
                      <div className="flex flex-col gap-2 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground text-sm">
                            {selectedStudents.length} of{" "}
                            {filteredStudents.length} selected
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleSelectAllStudents}
                          >
                            {selectedStudents.length === filteredStudents.length
                              ? "Deselect All"
                              : "Select All"}
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowBulkDeleteModal(true)}
                            disabled={
                              selectedStudents.length === 0 || isBulkDeleting
                            }
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete Selected ({selectedStudents.length})
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setShowDeleteAllModal(true)}
                            disabled={isBulkDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete All
                          </Button>
                        </div>
                      </div>
                    )}
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {isLoading && students.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2"></div>
                        <p className="text-muted-foreground text-sm">
                          Loading students...
                        </p>
                      </div>
                    </div>
                  ) : filteredStudents.length > 0 ? (
                    <>
                      {/* Mobile Horizontal Scrollable Table */}
                      <div className="block sm:hidden">
                        <div className="overflow-x-auto">
                          <div className="min-w-[600px] px-4">
                            <table className="w-full">
                              <thead>
                                <tr className="border-border border-b">
                                  {!hasActiveSession && (
                                    <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={
                                          selectedStudents.length ===
                                            filteredStudents.length &&
                                          filteredStudents.length > 0
                                        }
                                        onChange={handleSelectAllStudents}
                                        className="rounded border-gray-300"
                                      />
                                    </th>
                                  )}
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
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedStudents.map((student, index) => (
                                  <tr
                                    key={student._id}
                                    className={`border-border/50 hover:bg-muted/50 border-b transition-all duration-300 ${
                                      removingStudentId === student._id
                                        ? "bg-destructive/5 opacity-50"
                                        : ""
                                    }`}
                                  >
                                    {!hasActiveSession && (
                                      <td className="px-2 py-3 whitespace-nowrap">
                                        <input
                                          type="checkbox"
                                          checked={selectedStudents.includes(
                                            student._id,
                                          )}
                                          onChange={() =>
                                            handleSelectStudent(student._id)
                                          }
                                          className="rounded border-gray-300"
                                        />
                                      </td>
                                    )}
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <span className="text-xs font-medium">
                                        #{startIndex + index + 1}
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
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            router.push(
                                              `/students/${courseId}/${student._id}/attendance`,
                                            )
                                          }
                                          className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                          title="View attendance history"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                        {!hasActiveSession && (
                                          <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                              handleRemoveStudent(student._id)
                                            }
                                            disabled={
                                              removingStudentId === student._id
                                            }
                                            className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                            title={
                                              removingStudentId === student._id
                                                ? "Removing student..."
                                                : "Remove student from course"
                                            }
                                          >
                                            {removingStudentId ===
                                            student._id ? (
                                              <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                              <Trash2 className="h-3 w-3" />
                                            )}
                                          </Button>
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
                                {!hasActiveSession && (
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
                                )}
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
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedStudents.map((student, index) => (
                                <tr
                                  key={student._id}
                                  className={`border-border/50 hover:bg-muted/50 border-b transition-all duration-300 ${
                                    removingStudentId === student._id
                                      ? "bg-destructive/5 opacity-50"
                                      : ""
                                  }`}
                                >
                                  {!hasActiveSession && (
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
                                  )}
                                  <td className="px-4 py-4">
                                    <span className="text-sm font-medium">
                                      #{startIndex + index + 1}
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
                                  <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          router.push(
                                            `/students/${courseId}/${student._id}/attendance`,
                                          )
                                        }
                                        className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                        title="View attendance history"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      {!hasActiveSession && (
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleRemoveStudent(student._id)
                                          }
                                          disabled={
                                            removingStudentId === student._id
                                          }
                                          className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                          title={
                                            removingStudentId === student._id
                                              ? "Removing student..."
                                              : "Remove student from course"
                                          }
                                        >
                                          {removingStudentId === student._id ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-4 w-4" />
                                          )}
                                        </Button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              ))}
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
            </TabsContent>

            <TabsContent value="add-single" className="space-y-4">
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Add Single Student
                      </CardTitle>
                      <CardDescription>
                        Add a new student to {currentCourse.title}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={openCopyDialog}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Students
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AddSingleStudentSection
                    courseId={courseId}
                    courseLevel={currentCourse.level}
                    onAddComplete={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk-upload" className="space-y-4">
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bulk Student Upload
                  </CardTitle>
                  <CardDescription>
                    Upload multiple students using a CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BulkStudentUploadSection
                    courseId={courseId}
                    courseCode={currentCourse.course_code}
                    courseLevel={currentCourse.level}
                    onUploadComplete={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Student Removal Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setStudentToRemove(null);
        }}
        onConfirm={confirmRemoveStudent}
        title="Remove Student from Course"
        description={
          studentToRemove
            ? `Are you sure you want to remove "${studentToRemove.name}" from "${currentCourse.title}"? 

This will:
• Remove the student from this course permanently
• Delete their attendance records for this course
• Cannot be undone

The student will need to be re-enrolled manually if needed.`
            : "Are you sure you want to remove this student from the course?"
        }
        confirmText="Yes, Remove Student"
        cancelText="Cancel"
        variant="destructive"
        isLoading={removingStudentId === studentToRemove?.id}
      />

      {/* Copy Students Modal */}
      <CopyStudentsModal
        isOpen={showCopyDialog}
        onClose={() => setShowCopyDialog(false)}
        currentCourseId={courseId}
        onCopyComplete={handleCopyComplete}
      />

      {/* Bulk Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showBulkDeleteModal}
        onClose={() => setShowBulkDeleteModal(false)}
        onConfirm={handleBulkDelete}
        title="Remove Selected Students"
        description={`Are you sure you want to remove ${selectedStudents.length} selected student${selectedStudents.length === 1 ? "" : "s"} from "${currentCourse?.title}"?

This will:
• Remove the selected students from this course permanently
• Delete their attendance records for this course
• Cannot be undone

The students will need to be re-enrolled manually if needed.`}
        confirmText={`Yes, Remove ${selectedStudents.length} Student${selectedStudents.length === 1 ? "" : "s"}`}
        cancelText="Cancel"
        variant="destructive"
        isLoading={isBulkDeleting}
      />

      {/* Delete All Students Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteAllModal}
        onClose={() => setShowDeleteAllModal(false)}
        onConfirm={handleDeleteAll}
        title="Remove All Students"
        description={`Are you sure you want to remove ALL ${students.length} students from "${currentCourse?.title}"?

This will:
• Remove ALL students from this course permanently
• Delete ALL attendance records for this course
• Cannot be undone

This is a DESTRUCTIVE action that will completely empty the course.`}
        confirmText={`Yes, Remove All ${students.length} Students`}
        cancelText="Cancel"
        variant="destructive"
        isLoading={isBulkDeleting}
      />
    </DashboardLayout>
  );
}
