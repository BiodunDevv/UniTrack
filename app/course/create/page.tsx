"use client";

import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
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
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";

export default function CreateCoursePage() {
  const router = useRouter();
  const { createCourse, isLoading, error, clearError } = useCourseStore();
  const { user } = useAuthStore();

  const [formData, setFormData] = useState({
    course_code: "",
    title: "",
    level: 100,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "level" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.course_code.trim() || !formData.title.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createCourse({
        course_code: formData.course_code.trim(),
        title: formData.title.trim(),
        level: formData.level,
      });

      toast.success("Course created successfully!");
      router.push("/course");
    } catch (error: unknown) {
      // Handle duplicate course code error
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
      console.error("Failed to create course:", error);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  return (
    <DashboardLayout>
      <div className="flex h-screen flex-col space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb
            items={[
              { label: "Courses", href: "/course" },
              { label: "Create Course", current: true },
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100">
          <Button
            size="sm"
            onClick={handleGoBack}
            className="hover:bg-accent hover:text-accent-foreground w-fit transition-all duration-300 hover:scale-105 md:hidden"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Courses
          </Button>
          <div className="space-y-2">
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Create New Course
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Add a new course to your curriculum and start teaching
            </p>
          </div>
        </div>

        {/* Form Section */}
        <div className="animate-appear max-w-4xl opacity-0 delay-200">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 h-full backdrop-blur-sm transition-all duration-500">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <BookOpen className="h-5 w-5" />
                </div>
                Course Information
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                Enter the basic information for your new course
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              <form
                onSubmit={handleSubmit}
                className="flex flex-1 flex-col space-y-6"
              >
                <div className="grid flex-1 md:grid-cols-2">
                  <div className="animate-appear space-y-2 opacity-0 delay-300">
                    <Label
                      htmlFor="course_code"
                      className="text-sm font-medium lg:text-base"
                    >
                      Course Code
                    </Label>
                    <Input
                      id="course_code"
                      name="course_code"
                      type="text"
                      placeholder="e.g., CS101, MATH201"
                      value={formData.course_code}
                      onChange={handleInputChange}
                      required
                      className="border-border/50 bg-background/50 hover:border-border focus:border-primary font-mono backdrop-blur-sm transition-all duration-300"
                    />
                    <p className="text-muted-foreground text-xs lg:text-sm">
                      A unique identifier for the course (e.g., CS101, MATH201)
                    </p>
                  </div>

                  <div className="animate-appear space-y-2 opacity-0 delay-500">
                    <Label
                      htmlFor="level"
                      className="text-sm font-medium lg:text-base"
                    >
                      Academic Level
                    </Label>
                    <select
                      id="level"
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                      required
                      className="border-border/50 bg-background/50 ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring hover:border-border focus:border-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm backdrop-blur-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value={100}>100 Level (1st Year)</option>
                      <option value={200}>200 Level (2nd Year)</option>
                      <option value={300}>300 Level (3rd Year)</option>
                      <option value={400}>400 Level (4th Year)</option>
                      <option value={500}>500 Level (5th Year)</option>
                      <option value={600}>600 Level (6th Year)</option>
                    </select>
                    <p className="text-muted-foreground text-xs lg:text-sm">
                      The academic level for this course
                    </p>
                  </div>
                </div>

                <div className="animate-appear space-y-2 opacity-0 delay-400">
                  <Label
                    htmlFor="title"
                    className="text-sm font-medium lg:text-base"
                  >
                    Course Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g., Introduction to Computer Science"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="border-border/50 bg-background/50 hover:border-border focus:border-primary backdrop-blur-sm transition-all duration-300"
                  />
                  <p className="text-muted-foreground text-xs lg:text-sm">
                    The full name/title of the course
                  </p>
                </div>

                <div className="animate-appear opacity-0 delay-600">
                  <Card className="border-border/30 bg-muted/30 backdrop-blur-sm">
                    <CardContent className="p-4">
                      <h4 className="mb-2 text-sm font-medium lg:text-base">
                        Course will be assigned to:
                      </h4>
                      <div className="space-y-1">
                        <p className="text-sm font-medium lg:text-base">
                          {user?.name || "Current User"}
                        </p>
                        <p className="text-muted-foreground text-xs lg:text-sm">
                          {user?.email || "current@email.com"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="animate-appear flex flex-col gap-3 pt-6 opacity-0 delay-700 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoBack}
                    disabled={isLoading}
                    className="border-border/50 bg-background/50 hover:bg-accent hover:text-accent-foreground order-2 transition-all duration-300 hover:scale-105 sm:order-1"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="hover:shadow-primary/20 order-1 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg sm:order-2"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isLoading ? "Creating..." : "Create Course"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
