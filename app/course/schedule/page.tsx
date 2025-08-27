"use client";

import { Calendar, Clock, MapPin, Users } from "lucide-react";
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

export default function CourseSchedulePage() {
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
              Course Schedule
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              {getGreeting()}, {user?.name || "Lecturer"} • View and manage
              course schedules
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="animate-appear opacity-0 delay-200">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <div className="rounded-lg bg-blue-500/10 p-2 text-blue-600">
                  <Calendar className="h-5 w-5" />
                </div>
                Course Schedule
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                This feature is coming soon. You&apos;ll be able to view and
                manage course schedules here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="animate-appear py-12 text-center opacity-0 delay-300">
                <div className="mb-6 inline-block rounded-full bg-blue-500/10 p-6 text-blue-600">
                  <Calendar className="h-16 w-16" />
                </div>
                <h3 className="mb-3 text-lg font-semibold lg:text-xl">
                  Schedule Management
                </h3>
                <p className="text-muted-foreground mx-auto max-w-2xl text-sm lg:text-base">
                  This feature will allow you to create and manage course
                  schedules, set class times, track session history, and
                  coordinate with students for optimal learning experiences.
                </p>
                <div className="mx-auto mt-6 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="border-border/30 bg-background/30 rounded-lg p-4 text-center">
                    <Calendar className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                    <h4 className="mb-1 font-medium">Class Scheduling</h4>
                    <p className="text-muted-foreground text-xs">
                      Set recurring class times
                    </p>
                  </div>
                  <div className="border-border/30 bg-background/30 rounded-lg p-4 text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-green-600" />
                    <h4 className="mb-1 font-medium">Time Management</h4>
                    <p className="text-muted-foreground text-xs">
                      Track session durations
                    </p>
                  </div>
                  <div className="border-border/30 bg-background/30 rounded-lg p-4 text-center">
                    <MapPin className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                    <h4 className="mb-1 font-medium">Location Setup</h4>
                    <p className="text-muted-foreground text-xs">
                      Set class locations
                    </p>
                  </div>
                  <div className="border-border/30 bg-background/30 rounded-lg p-4 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                    <h4 className="mb-1 font-medium">Student Coordination</h4>
                    <p className="text-muted-foreground text-xs">
                      Notify students of schedules
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
