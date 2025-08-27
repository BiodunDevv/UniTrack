"use client";

import { ArrowLeft, BookOpen, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
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
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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
      });

      toast.success("Course created successfully!");
      router.push("/course");
    } catch (error) {
      toast.error("Failed to create course");
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
      <div className="space-y-6 p-4 lg:p-6">
        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="hover:bg-accent hover:text-accent-foreground w-fit transition-all duration-300 hover:scale-105"
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
        <div className="animate-appear mx-auto max-w-2xl opacity-0 delay-200">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-500">
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
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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

                <div className="animate-appear opacity-0 delay-500">
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

                <div className="animate-appear flex flex-col gap-3 pt-4 opacity-0 delay-600 sm:flex-row">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="hover:shadow-primary/20 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                  >
                    {isLoading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isLoading ? "Creating..." : "Create Course"}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoBack}
                    disabled={isLoading}
                    className="border-border/50 bg-background/50 hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105"
                  >
                    Cancel
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
