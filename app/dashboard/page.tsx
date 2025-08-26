"use client";

import { useState } from "react";
import { CustomSidebar } from "@/components/custom-sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  Calendar,
  MapPin,
  Download,
  Filter,
  PanelRight,
  Bell,
  Search,
} from "lucide-react";
import attendanceData from "./attendance-data.json";
import { ModeToggle } from "@/components/ui/mode-toggle";

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
    avatar: "/avatars/alice.jpg",
    status: "present",
  },
  {
    id: 2,
    student: "Bob Wilson",
    action: "Checked out",
    time: "5:30 PM",
    location: "Library",
    avatar: "/avatars/bob.jpg",
    status: "absent",
  },
  {
    id: 3,
    student: "Carol Davis",
    action: "Late arrival",
    time: "9:45 AM",
    location: "Science Building",
    avatar: "/avatars/carol.jpg",
    status: "late",
  },
  {
    id: 4,
    student: "David Brown",
    action: "Checked in",
    time: "8:30 AM",
    location: "Main Campus",
    avatar: "/avatars/david.jpg",
    status: "present",
  },
];

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="from-background via-background to-muted/20 min-h-screen bg-gradient-to-br">
      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-card/90 border-border/50 fixed top-0 left-0 z-50 h-full w-full max-w-[90vw] transform border-r backdrop-blur-xl transition-transform duration-300 ease-out sm:w-80 sm:max-w-[400px] md:w-72 md:max-w-[350px] lg:w-64 lg:max-w-[280px] xl:w-72 xl:max-w-[320px] ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} `}
      >
        <CustomSidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main Content */}
      <div className="w-full">
        {/* Header */}
        <header className="border-border/50 bg-card/60 sticky top-0 z-30 border-b backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="hover:bg-accent/50"
              >
                <PanelRight className="h-5 w-5" />
              </Button>
              <Separator orientation="vertical" className="bg-border/50 h-6" />
              <div className="flex items-center gap-2">
                <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-lg font-semibold text-transparent">
                  UniTrack
                </h1>
                <Badge
                  variant="outline"
                  className="border-primary/20 bg-primary/5 text-primary hover:bg-primary/10 text-xs transition-all duration-300"
                >
                  Live
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Search students, records..."
                  className="border-border/50 bg-background/50 focus:bg-background/80 w-64 pl-9 transition-all duration-300"
                />
              </div>
            <ModeToggle />
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatars/admin.jpg" alt="Admin" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  AD
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="space-y-6 p-4 lg:p-6">
          {/* Header Section */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
                Dashboard
              </h1>
              <p className="text-muted-foreground text-sm lg:text-base">
                Welcome back! Here's what's happening with your attendance
                system today.
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={index}
                  className="group border-border/50 bg-card/50 hover:border-border hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-lg"
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

          {/* Main Content Grid */}
          <div className="grid gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-3">
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
                          <AvatarImage
                            src={activity.avatar}
                            alt={activity.student}
                          />
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
                  Today's Summary
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
        </main>
      </div>
    </div>
  );
}
