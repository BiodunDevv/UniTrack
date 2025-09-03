"use client";

import { BookOpen, GraduationCap, Save, User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { Label } from "@/components/ui/label";
import { LecturerSelectionModal } from "@/components/ui/lecturer-selection-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type Teacher, useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";

export default function CreateCoursePage() {
  const router = useRouter();
  const { createCourse, isLoading, error, clearError } = useCourseStore();
  const { user } = useAuthStore();
  const { getAllTeachers, teachers, isLoadingTeachers } = useAdminStore();

  const [activeTab, setActiveTab] = useState("create");
  const [showLecturerModal, setShowLecturerModal] = useState(false);

  const isAdmin = user?.role === "admin";

  // Course form state
  const [courseForm, setCourseForm] = useState({
    course_code: "",
    title: "",
    level: 100,
  });

  const [selectedLecturer, setSelectedLecturer] = useState<Teacher | null>(
    null,
  );

  // Fetch lecturers when component mounts for admin users
  React.useEffect(() => {
    if (isAdmin) {
      getAllTeachers();
    }
  }, [isAdmin, getAllTeachers]);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.course_code.trim() || !courseForm.title.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if admin has selected a lecturer
    if (isAdmin && !selectedLecturer) {
      toast.error("Please select a lecturer for this course");
      return;
    }

    try {
      const courseData: {
        course_code: string;
        title: string;
        level: number;
        lecturer_id?: string;
      } = {
        course_code: courseForm.course_code.trim(),
        title: courseForm.title.trim(),
        level: courseForm.level,
      };

      // Add lecturer_id if admin is creating the course
      if (isAdmin && selectedLecturer) {
        courseData.lecturer_id = selectedLecturer._id;
      }

      await createCourse(courseData);
      toast.success("Course created successfully!");
      setCourseForm({
        course_code: "",
        title: "",
        level: 100,
      });
      setSelectedLecturer(null);
      router.push("/course");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      if (errorMessage === "Internal server error") {
        toast.error("Course code already exists", {
          description: "Please choose a different course code.",
        });
      } else {
        toast.error("Failed to create course", {
          description: errorMessage || "An unexpected error occurred",
        });
      }
    }
  };

  const handleLecturerSelect = (lecturer: Teacher) => {
    setSelectedLecturer(lecturer);
  };

  const getLevelBadgeColor = (level: number) => {
    const colors = {
      100: "bg-blue-100 text-blue-800 border-blue-200",
      200: "bg-green-100 text-green-800 border-green-200",
      300: "bg-yellow-100 text-yellow-800 border-yellow-200",
      400: "bg-orange-100 text-orange-800 border-orange-200",
      500: "bg-purple-100 text-purple-800 border-purple-200",
      600: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[level as keyof typeof colors] || colors[100];
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

  return (
    <DashboardLayout>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Breadcrumb */}
        <div className="animate-appear ml-2 opacity-0">
          <Breadcrumb
            items={[
              { label: "Courses", href: "/course" },
              { label: "Create Course", current: true },
            ]}
          />
        </div>

        {/* Hero Section */}
        <div className="animate-appear from-primary/10 via-primary/5 rounded-lg bg-gradient-to-r to-transparent p-4 opacity-0 delay-100 sm:p-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
              Create New Course
            </h1>
            <p className="text-muted-foreground text-md mb-6">
              Add a new course to your curriculum and start managing attendance.
              {isAdmin
                ? " As an admin, you can assign courses to specific lecturers."
                : " Create and manage your own courses."}
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="outline" onClick={() => router.push("/course")}>
                <BookOpen className="mr-2 h-4 w-4" />
                View All Courses
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Code</CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courseForm.course_code || "---"}
              </div>
              <p className="text-muted-foreground text-xs">Unique identifier</p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Academic Level
              </CardTitle>
              <GraduationCap className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{courseForm.level}</div>
              <p className="text-muted-foreground text-xs">
                {formatLevel(courseForm.level)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Assigned Lecturer
              </CardTitle>
              <User className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdmin ? (selectedLecturer ? "Selected" : "Pending") : "You"}
              </div>
              <p className="text-muted-foreground text-xs">
                {isAdmin
                  ? selectedLecturer
                    ? selectedLecturer.name
                    : "Select lecturer"
                  : user?.name || "Current user"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Role</CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isAdmin ? "Admin" : "Teacher"}
              </div>
              <p className="text-muted-foreground text-xs">
                {isAdmin ? "Full Access" : "Course Creator"}
              </p>
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
            <TabsList className="grid w-fit grid-cols-2">
              <TabsTrigger value="create">Create Course</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-6">
              {/* Course Creation Form */}
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle>Course Information</CardTitle>
                  <CardDescription>
                    Enter the basic information for your new course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateCourse} className="space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="course-code">Course Code</Label>
                        <Input
                          id="course-code"
                          value={courseForm.course_code}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              course_code: e.target.value,
                            })
                          }
                          placeholder="e.g., CS101, MATH201"
                          required
                        />
                        <p className="text-muted-foreground text-xs">
                          A unique identifier for the course
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="course-level">Academic Level</Label>
                        <Select
                          value={courseForm.level.toString()}
                          onValueChange={(value) =>
                            setCourseForm({
                              ...courseForm,
                              level: parseInt(value),
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="100">
                              100 Level (1st Year)
                            </SelectItem>
                            <SelectItem value="200">
                              200 Level (2nd Year)
                            </SelectItem>
                            <SelectItem value="300">
                              300 Level (3rd Year)
                            </SelectItem>
                            <SelectItem value="400">
                              400 Level (4th Year)
                            </SelectItem>
                            <SelectItem value="500">
                              500 Level (5th Year)
                            </SelectItem>
                            <SelectItem value="600">
                              600 Level (6th Year)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-muted-foreground text-xs">
                          The academic level for this course
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="course-title">Course Title</Label>
                      <Input
                        id="course-title"
                        value={courseForm.title}
                        onChange={(e) =>
                          setCourseForm({
                            ...courseForm,
                            title: e.target.value,
                          })
                        }
                        placeholder="e.g., Introduction to Computer Science"
                        required
                      />
                      <p className="text-muted-foreground text-xs">
                        The full name/title of the course
                      </p>
                    </div>

                    {/* Lecturer Selection for Admin */}
                    {isAdmin && (
                      <div className="space-y-2">
                        <Label>Assign to Lecturer</Label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLecturerModal(true)}
                          className="w-full justify-start"
                        >
                          <User className="mr-2 h-4 w-4" />
                          {selectedLecturer
                            ? `${selectedLecturer.name} (${selectedLecturer.email})`
                            : "Select a lecturer for this course"}
                        </Button>
                        <p className="text-muted-foreground text-xs">
                          Choose the lecturer who will own and manage this
                          course
                        </p>
                      </div>
                    )}

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/course")}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                            Creating...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Create Course
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              {/* Course Preview */}
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle>Course Preview</CardTitle>
                  <CardDescription>
                    Preview how your course will appear once created
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {courseForm.course_code || courseForm.title ? (
                    <div className="space-y-4">
                      <Card className="border-border/30 bg-muted/30 backdrop-blur-sm">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={getLevelBadgeColor(
                                    courseForm.level,
                                  )}
                                >
                                  {formatLevel(courseForm.level)}
                                </Badge>
                              </div>
                              <CardTitle className="text-lg">
                                {courseForm.title || "Course Title"}
                              </CardTitle>
                              <p className="text-muted-foreground font-mono text-sm">
                                {courseForm.course_code || "COURSE_CODE"}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="text-sm">
                                Instructor:{" "}
                                {isAdmin && selectedLecturer
                                  ? selectedLecturer.name
                                  : user?.name || "Current User"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              <span className="text-sm">
                                Level: {formatLevel(courseForm.level)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4" />
                              <span className="text-sm">
                                Status: Ready to create
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="text-muted-foreground mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No Course Data
                      </h3>
                      <p className="text-muted-foreground max-w-md text-center">
                        Fill in the course information in the &quot;Create
                        Course&quot; tab to see a preview
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Lecturer Selection Modal */}
      {isAdmin && (
        <LecturerSelectionModal
          isOpen={showLecturerModal}
          onClose={() => setShowLecturerModal(false)}
          onSelect={handleLecturerSelect}
          selectedLecturer={selectedLecturer}
          lecturers={teachers}
          isLoading={isLoadingTeachers}
        />
      )}
    </DashboardLayout>
  );
}
