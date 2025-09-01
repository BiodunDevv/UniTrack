"use client";

import {
  AlertCircle,
  BookOpen,
  Calendar,
  Clock,
  Download,
  Filter,
  MapPin,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CourseSelectionModal } from "@/components/ui/course-selection-modal";
import { Separator } from "@/components/ui/separator";

import attendanceData from "./attendance-data.json";

// Type definition for attendance records
interface AttendanceRecord {
  id: number;
  student_name: string;
  student_id: string;
  course: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: "Present" | "Late" | "Absent";
  location: string | null;
}

// Type assertion for the imported data
const typedAttendanceData = attendanceData as AttendanceRecord[];

// Function to get time-based greeting
const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// Dashboard Stats
const stats = [
  {
    title: "Total Students",
    value: "1,234",
    change: "+12%",
    icon: Users,
    changeType: "positive",
  },
  {
    title: "Present Today",
    value: "1,089",
    change: "+5%",
    icon: Clock,
    changeType: "positive",
  },
  {
    title: "Attendance Rate",
    value: "88.2%",
    change: "-2.1%",
    icon: TrendingUp,
    changeType: "negative",
  },
  {
    title: "Late Arrivals",
    value: "23",
    change: "+8",
    icon: AlertCircle,
    changeType: "negative",
  },
];

// Recent activity
const recentActivity = [
  {
    id: 1,
    student: "Alice Johnson",
    action: "Checked in",
    time: "9:15 AM",
    location: "Main Campus",
    status: "present",
  },
  {
    id: 2,
    student: "Bob Wilson",
    action: "Checked out",
    time: "5:30 PM",
    location: "Library",
    status: "absent",
  },
  {
    id: 3,
    student: "Carol Davis",
    action: "Late arrival",
    time: "9:45 AM",
    location: "Science Building",
    status: "late",
  },
  {
    id: 4,
    student: "David Brown",
    action: "Checked in",
    time: "8:30 AM",
    location: "Main Campus",
    status: "present",
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [showCourseSelectionModal, setShowCourseSelectionModal] =
    useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              {getTimeBasedGreeting()}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base">
              Welcome back to your attendance dashboard. Here&apos;s what&apos;s
              happening today.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-border/50 bg-card/50 hover:bg-card/80 backdrop-blur-sm"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-border/50 bg-card/50 hover:bg-card/80 backdrop-blur-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 animate-appear opacity-0 backdrop-blur-sm transition-all duration-500 hover:shadow-lg"
                style={{ animationDelay: `${300 + index * 100}ms` }}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="group-hover:text-primary text-sm font-medium transition-colors duration-300">
                    {stat.title}
                  </CardTitle>
                  <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-4 w-4 group-hover:animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="group-hover:text-primary/90 text-2xl font-bold transition-colors duration-300">
                    {stat.value}
                  </div>
                  <p className="text-muted-foreground group-hover:text-foreground/80 text-xs transition-colors duration-300">
                    <span
                      className={
                        stat.changeType === "positive"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {stat.change}
                    </span>{" "}
                    from last month
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="animate-appear opacity-0 delay-500">
          <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-base lg:text-lg">
                Quick Actions
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Button
                  onClick={() => router.push("/course/create")}
                  className="flex h-auto flex-col gap-2 p-4 text-left"
                  variant="outline"
                >
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Create Course</div>
                    <div className="text-muted-foreground text-xs">
                      Add a new course
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => setShowCourseSelectionModal(true)}
                  className="flex h-auto flex-col gap-2 p-4 text-left"
                  variant="outline"
                >
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Start Session</div>
                    <div className="text-muted-foreground text-xs">
                      Begin attendance
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => router.push("/dashboard/students/add")}
                  className="flex h-auto flex-col gap-2 p-4 text-left"
                  variant="outline"
                >
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Add Students</div>
                    <div className="text-muted-foreground text-xs">
                      Enroll students
                    </div>
                  </div>
                </Button>

                <Button
                  onClick={() => router.push("/dashboard/reports")}
                  className="flex h-auto flex-col gap-2 p-4 text-left"
                  variant="outline"
                >
                  <div className="bg-primary/10 text-primary rounded-lg p-2">
                    <Download className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">Generate Report</div>
                    <div className="text-muted-foreground text-xs">
                      Export data
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="animate-appear grid gap-4 opacity-0 delay-700 md:gap-6 lg:grid-cols-3 xl:grid-cols-3">
          {/* Recent Activity */}
          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="group-hover:text-primary flex items-center gap-2 text-base transition-colors duration-300 lg:text-lg">
                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110">
                  <Clock className="h-4 w-4 group-hover:animate-pulse lg:h-5 lg:w-5" />
                </div>
                Recent Activity
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                Latest check-ins and check-outs from your students
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 lg:space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="border-border/30 bg-background/30 hover:bg-background/50 flex flex-col justify-between gap-3 rounded-lg border p-3 transition-all duration-300 sm:flex-row sm:items-center sm:gap-0"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback>
                          {activity.student
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {activity.student}
                        </p>
                        <p className="text-muted-foreground flex items-center gap-1 text-xs">
                          <MapPin className="h-3 w-3" />
                          {activity.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          activity.status === "present"
                            ? "default"
                            : activity.status === "late"
                              ? "destructive"
                              : "secondary"
                        }
                        className="mb-1"
                      >
                        {activity.action}
                      </Badge>
                      <p className="text-muted-foreground text-xs">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="group-hover:text-primary flex items-center gap-2 text-base transition-colors duration-300 lg:text-lg">
                <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110">
                  <Calendar className="h-4 w-4 group-hover:animate-pulse lg:h-5 lg:w-5" />
                </div>
                Today&apos;s Summary
              </CardTitle>
              <CardDescription className="text-xs lg:text-sm">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Total Check-ins
                </span>
                <span className="font-medium">1,089</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Late Arrivals
                </span>
                <span className="font-medium text-orange-600">23</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">
                  Early Departures
                </span>
                <span className="font-medium text-red-600">8</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Absent</span>
                <span className="font-medium text-red-600">145</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between font-medium">
                <span>Attendance Rate</span>
                <span className="text-green-600">88.2%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Student Records */}
        <Card className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
          <CardHeader>
            <CardTitle className="group-hover:text-primary flex items-center gap-2 transition-colors duration-300">
              <div className="bg-primary/10 text-primary group-hover:bg-primary/20 rounded-lg p-2 transition-all duration-500 group-hover:scale-110">
                <Users className="h-5 w-5 group-hover:animate-pulse" />
              </div>
              Student Attendance Records
            </CardTitle>
            <CardDescription>
              Recent attendance records from your students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {typedAttendanceData.slice(0, 10).map((record) => (
                <div
                  key={record.id}
                  className="border-border/30 bg-background/30 hover:bg-background/50 flex flex-col justify-between gap-4 rounded-lg border p-4 transition-all duration-300 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {record.student_name
                          ? record.student_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                          : "N/A"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {record.student_name || "Unknown Student"}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        ID: {record.student_id || "N/A"} •{" "}
                        {record.course || "No Course"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <div className="text-left sm:text-right">
                      <p className="text-sm font-medium">
                        {record.date || "No Date"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {record.check_in_time || "No check-in"} -{" "}
                        {record.check_out_time || "Still in"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        record.status === "Present"
                          ? "default"
                          : record.status === "Late"
                            ? "destructive"
                            : "secondary"
                      }
                      className="w-fit"
                    >
                      {record.status || "Unknown"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                className="border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/20 hover:text-primary backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                View All Records
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Selection Modal */}
      <CourseSelectionModal
        isOpen={showCourseSelectionModal}
        onClose={() => setShowCourseSelectionModal(false)}
      />
    </DashboardLayout>
  );
}
