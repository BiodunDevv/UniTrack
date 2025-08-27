"use client";

import { BookOpen, UserPlus, Users } from "lucide-react";
import * as React from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/store/auth-store";

export default function CourseEnrollmentPage() {
  const { user } = useAuthStore();

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
        {/* Header Section */}
        <div className="animate-appear opacity-0 delay-100">
          <div className="space-y-2">
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Course Enrollment
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {getGreeting()}, {user?.name || "Lecturer"} • Manage student
              enrollments across courses
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-appear opacity-0 delay-200">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <div className="bg-primary/10 text-primary rounded-lg p-2">
                  <UserPlus className="h-5 w-5" />
                </div>
                Student Enrollment
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                This feature is coming soon. You&apos;ll be able to manage
                student enrollments here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animate-appear py-12 text-center opacity-0 delay-300">
                <div className="bg-primary/10 text-primary mb-6 inline-block rounded-full p-6">
                  <Users className="h-16 w-16" />
                </div>
                <h3 className="mb-3 text-lg font-semibold lg:text-xl">
                  Enrollment Management
                </h3>
                <p className="text-muted-foreground mx-auto max-w-2xl text-sm lg:text-base">
                  This feature will allow you to enroll students in courses,
                  manage bulk enrollments, track enrollment statistics, and
                  handle student course assignments with ease.
                </p>
                <div className="mx-auto mt-6 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="border-border/30 bg-background/30 rounded-lg p-4 text-center">
                    <BookOpen className="text-primary mx-auto mb-2 h-8 w-8" />
                    <h4 className="mb-1 font-medium">Bulk Enrollment</h4>
                    <p className="text-muted-foreground text-xs">
                      Add multiple students at once
                    </p>
                  </div>
                  <div className="border-border/30 bg-background/30 rounded-lg p-4 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8 text-green-600" />
                    <h4 className="mb-1 font-medium">Student Management</h4>
                    <p className="text-muted-foreground text-xs">
                      Track and manage enrollments
                    </p>
                  </div>
                  <div className="border-border/30 bg-background/30 rounded-lg p-4 text-center sm:col-span-2 lg:col-span-1">
                    <UserPlus className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                    <h4 className="mb-1 font-medium">Course Assignment</h4>
                    <p className="text-muted-foreground text-xs">
                      Assign students to courses
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
