"use client";

import {
  ArrowLeft,
  BookOpen,
  Save,
  User,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { LecturerSelectionModal } from "@/components/ui/lecturer-selection-modal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { type Teacher, useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";

function ReassignCoursePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const { user } = useAuthStore();
  const { getAllTeachers, teachers, isLoadingTeachers, reassignCourse } =
    useAdminStore();
  const { getCourse, currentCourse, isLoading } = useCourseStore();

  const [activeTab, setActiveTab] = useState("reassign");
  const [showLecturerModal, setShowLecturerModal] = useState(false);

  const isAdmin = user?.role === "admin";

  // Reassignment form state
  const [reassignForm, setReassignForm] = useState({
    reason: "",
  });

  const [selectedLecturer, setSelectedLecturer] = useState<Teacher | null>(
    null,
  );

  // Fetch course and lecturers when component mounts
  React.useEffect(() => {
    // Wait for user to be loaded
    if (!user) return;

    if (!isAdmin) {
      router.push("/dashboard");
      return;
    }

    if (!courseId) {
      router.push("/course");
      return;
    }

    // If we reach here, user is admin and courseId exists
    getCourse(courseId);
    getAllTeachers();
  }, [courseId, isAdmin, user, getCourse, getAllTeachers, router]);

  // Auto-generate reason when lecturer is selected
  React.useEffect(() => {
    if (selectedLecturer) {
      setReassignForm({
        reason: `Moving Course to ${selectedLecturer.name}`,
      });
    }
  }, [selectedLecturer]);

  const handleReassignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLecturer) {
      toast.error("Please select a lecturer to reassign the course to");
      return;
    }

    if (!reassignForm.reason.trim()) {
      toast.error("Please provide a reason for reassignment");
      return;
    }

    if (!courseId) {
      toast.error("Course ID not found");
      return;
    }

    try {
      await reassignCourse(courseId, {
        new_lecturer_id: selectedLecturer._id,
        reason: reassignForm.reason.trim(),
      });
      toast.success("Course reassigned successfully!");
      router.push(`/course/${courseId}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to reassign course", {
        description: errorMessage || "An unexpected error occurred",
      });
    }
  };

  const handleLecturerSelect = (lecturer: Teacher) => {
    setSelectedLecturer(lecturer);
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

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (!courseId) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Course ID not found</p>
            <Button onClick={() => router.push("/course")}>
              Go to Courses
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

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
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Breadcrumb */}
        <div className="animate-appear ml-2 opacity-0">
          <Breadcrumb
            items={[
              { label: "Courses", href: "/course" },
              { label: currentCourse.course_code, href: `/course/${courseId}` },
              { label: "Reassign Course", current: true },
            ]}
          />
        </div>

        {/* Hero Section */}
        <div className="animate-appear from-primary/10 via-primary/5 rounded-lg bg-gradient-to-r to-transparent p-4 opacity-0 delay-100 sm:p-6">
          <div className="max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold lg:text-4xl">
              Reassign Course
            </h1>
            <p className="text-muted-foreground text-md mb-6">
              Transfer course ownership to another lecturer. This will move all
              course data, students, and sessions to the new lecturer. As an
              admin, you can reassign courses between lecturers for better
              management.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(`/course/${courseId}`)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
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
                {currentCourse.course_code}
              </div>
              <p className="text-muted-foreground text-xs">
                {currentCourse.title}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Current Lecturer
              </CardTitle>
              <User className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Assigned</div>
              <p className="text-muted-foreground text-xs">
                {currentCourse.teacher_id?.name || "Unknown Lecturer"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Lecturer
              </CardTitle>
              <UserCheck className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {selectedLecturer ? "Selected" : "Pending"}
              </div>
              <p className="text-muted-foreground text-xs">
                {selectedLecturer ? selectedLecturer.name : "Choose lecturer"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Available Lecturers
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teachers.length}</div>
              <p className="text-muted-foreground text-xs">Total lecturers</p>
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
              <TabsTrigger value="reassign">Reassign Course</TabsTrigger>
              <TabsTrigger value="preview">Preview Changes</TabsTrigger>
            </TabsList>

            <TabsContent value="reassign" className="space-y-6">
              {/* Current Course Information */}
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle>Current Course Information</CardTitle>
                  <CardDescription>
                    Details of the course being reassigned
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Card className="border-border/30 bg-muted/30 backdrop-blur-sm">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge
                                className={getLevelBadgeColor(
                                  currentCourse.level,
                                )}
                              >
                                {formatLevel(currentCourse.level)}
                              </Badge>
                            </div>
                            <CardTitle className="text-lg">
                              {currentCourse.title}
                            </CardTitle>
                            <p className="text-muted-foreground font-mono text-sm">
                              {currentCourse.course_code}
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="text-sm">
                              Current Instructor:{" "}
                              {currentCourse.teacher_id?.name || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            <span className="text-sm">
                              Created:{" "}
                              {new Date(
                                currentCourse.created_at,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Lecturer Selection and Reassignment Form */}
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle>Reassignment Details</CardTitle>
                  <CardDescription>
                    Select a new lecturer and provide a reason for reassignment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReassignCourse} className="space-y-6">
                    <div className="space-y-2">
                      <Label>Select New Lecturer</Label>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowLecturerModal(true)}
                        className="w-full justify-start"
                      >
                        <User className="mr-2 h-4 w-4" />
                        {selectedLecturer
                          ? `${selectedLecturer.name} (${selectedLecturer.email})`
                          : "Choose a lecturer to reassign the course to"}
                      </Button>
                      <p className="text-muted-foreground text-xs">
                        Select the lecturer who will take ownership of this
                        course
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reason">Reason for Reassignment</Label>
                      <Textarea
                        id="reason"
                        rows={4}
                        value={reassignForm.reason}
                        onChange={(e) =>
                          setReassignForm({
                            ...reassignForm,
                            reason: e.target.value,
                          })
                        }
                        placeholder="Provide a reason for this course reassignment..."
                        required
                      />
                      <p className="text-muted-foreground text-xs">
                        Explain why this course is being reassigned (this will
                        be logged)
                      </p>
                    </div>

                    <div className="flex justify-end gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/course/${courseId}`)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={!selectedLecturer || isLoading}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Reassign Course
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              {/* Reassignment Preview */}
              <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                <CardHeader>
                  <CardTitle>Reassignment Preview</CardTitle>
                  <CardDescription>
                    Preview the changes that will be made to the course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedLecturer ? (
                    <div className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Before */}
                        <Card className="border-orange-200/50 bg-orange-50/50">
                          <CardHeader>
                            <CardTitle className="text-orange-800">
                              Before Reassignment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium">Course</p>
                                <p className="text-muted-foreground text-sm">
                                  {currentCourse.course_code} -{" "}
                                  {currentCourse.title}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  Current Lecturer
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  {currentCourse.teacher_id?.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {currentCourse.teacher_id?.email}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        {/* After */}
                        <Card className="border-green-200/50 bg-green-50/50">
                          <CardHeader>
                            <CardTitle className="text-green-800">
                              After Reassignment
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div>
                                <p className="text-sm font-medium">Course</p>
                                <p className="text-muted-foreground text-sm">
                                  {currentCourse.course_code} -{" "}
                                  {currentCourse.title}
                                </p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  New Lecturer
                                </p>
                                <p className="text-muted-foreground text-sm">
                                  {selectedLecturer.name}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {selectedLecturer.email}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {reassignForm.reason && (
                        <Card className="border-border/30 bg-muted/30 backdrop-blur-sm">
                          <CardHeader>
                            <CardTitle className="text-base">
                              Reassignment Reason
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm">{reassignForm.reason}</p>
                          </CardContent>
                        </Card>
                      )}

                      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                        <h4 className="mb-2 font-medium text-blue-800">
                          What will be transferred:
                        </h4>
                        <ul className="space-y-1 text-sm text-blue-700">
                          <li>• Course ownership and management rights</li>
                          <li>• All enrolled students</li>
                          <li>• All attendance sessions and records</li>
                          <li>• Course settings and configurations</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <UserCheck className="text-muted-foreground mb-4 h-12 w-12" />
                      <h3 className="mb-2 text-lg font-semibold">
                        No Lecturer Selected
                      </h3>
                      <p className="text-muted-foreground max-w-md text-center">
                        Select a lecturer in the &quot;Reassign Course&quot; tab
                        to see a preview of the changes
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
      <LecturerSelectionModal
        isOpen={showLecturerModal}
        onClose={() => setShowLecturerModal(false)}
        onSelect={handleLecturerSelect}
        selectedLecturer={selectedLecturer}
        lecturers={teachers}
        isLoading={isLoadingTeachers}
        excludeLecturerId={currentCourse?.teacher_id?._id}
      />
    </DashboardLayout>
  );
}

export default function ReassignCoursePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReassignCoursePageContent />
    </Suspense>
  );
}
