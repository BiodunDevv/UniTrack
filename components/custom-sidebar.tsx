"use client";

import {
  BarChart3,
  BookOpen,
  FileText,
  GraduationCap,
  MapPin,
  PanelRightClose,
  Plus,
  UserCheck,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";

interface CustomSidebarProps {
  onClose?: () => void;
}

export function CustomSidebar({ onClose }: CustomSidebarProps) {
  const { user } = useAuthStore();
  const { courses, getAllCourses, isLoading, error } = useCourseStore();
  const router = useRouter();

  React.useEffect(() => {
    getAllCourses();
  }, [getAllCourses]);

  // Format level for display
  const formatLevel = (level: number) => {
    const levelMap: { [key: number]: string } = {
      100: "1st Year",
      200: "2nd Year",
      300: "3rd Year",
      400: "4th Year",
      500: "5th Year",
    };
    return levelMap[level] || `L${level}`;
  };

  const userData = {
    name: user?.name || "UniTrack User",
    email: user?.email || "user@unitrack.edu",
  };

  // Map courses to teams format for TeamSwitcher - show first 5 courses
  const coursesAsTeams = React.useMemo(() => {
    if (isLoading) {
      return [
        {
          name: "Loading...",
          logo: GraduationCap,
          plan: "Fetching your courses",
          id: "loading",
        },
      ];
    }

    if (error || !courses.length) {
      return [
        {
          name: "Get Started",
          logo: Plus,
          plan: "Create your first course",
          id: "no-courses",
        },
      ];
    }

    // Show first 5 courses
    const limitedCourses = courses.slice(0, 5).map((course) => ({
      name: course.title,
      logo: GraduationCap,
      plan: `${course.course_code} • ${formatLevel(course.level)}`,
      id: course._id,
      url: `/course/${course._id}`,
    }));

    // Add "View More" option if there are more than 5 courses
    if (courses.length > 5) {
      limitedCourses.push({
        name: `View All (${courses.length} courses)`,
        logo: BookOpen,
        plan: "See complete list",
        id: "view-all",
        url: "/course",
      });
    }

    return limitedCourses;
  }, [courses, isLoading, error]);

  const data = {
    user: userData,
    teams: coursesAsTeams,
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
        isActive: true,
        items: [
          {
            title: "Overview",
            url: "/dashboard/overview",
          },
          {
            title: "Analytics",
            url: "/dashboard/analytics",
          },
          {
            title: "Reports",
            url: "/dashboard/reports",
          },
        ],
      },
      {
        title: "Attendance",
        url: "/dashboard/attendance",
        icon: UserCheck,
        items: [
          {
            title: "Live Sessions",
            url: "/dashboard/attendance/live",
          },
          {
            title: "Session History",
            url: "/dashboard/attendance/history",
          },
          {
            title: "Create Session",
            url: "/dashboard/attendance/create",
          },
          {
            title: "QR Codes",
            url: "/dashboard/attendance/qr-codes",
          },
        ],
      },
      {
        title: "Students",
        url: "/dashboard/students",
        icon: Users,
        items: [
          {
            title: "All Students",
            url: "/dashboard/students/all",
          },
          {
            title: "Add Student",
            url: "/dashboard/students/add",
          },
          {
            title: "Import Students",
            url: "/dashboard/students/import",
          },
          {
            title: "Student Groups",
            url: "/dashboard/students/groups",
          },
        ],
      },
      {
        title: "Courses",
        url: "/course",
        icon: BookOpen,
        items: [
          {
            title: "All Courses",
            url: "/course",
          },
          {
            title: "Create Course",
            url: "/course/create",
          },
          {
            title: "Course Schedule",
            url: "/course/schedule",
          },
          {
            title: "Enrollment",
            url: "/course/enrollment",
          },
        ],
      },
      {
        title: "Locations",
        url: "/dashboard/locations",
        icon: MapPin,
        items: [
          {
            title: "Classrooms",
            url: "/dashboard/locations/classrooms",
          },
          {
            title: "Add Location",
            url: "/dashboard/locations/add",
          },
          {
            title: "GPS Settings",
            url: "/dashboard/locations/gps",
          },
        ],
      },
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: FileText,
        items: [
          {
            title: "Attendance Reports",
            url: "/dashboard/reports/attendance",
          },
          {
            title: "Student Performance",
            url: "/dashboard/reports/performance",
          },
          {
            title: "Export Data",
            url: "/dashboard/reports/export",
          },
          {
            title: "Custom Reports",
            url: "/dashboard/reports/custom",
          },
        ],
      },
    ],
  };

  return (
    <div className="border-border/50 bg-card/50 flex h-full w-full flex-col overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="border-border/50 shrink-0 border-b p-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            <TeamSwitcher teams={data.teams} />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 rounded-md p-2 transition-colors"
              aria-label="Close sidebar"
            >
              <PanelRightClose className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-0 overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-2 p-2">
            {/* Create Course Button */}
            <Button
              onClick={() => {
                router.push("/course/create");
                onClose?.();
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground w-full justify-start gap-2"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Create Course
            </Button>

            <NavMain items={data.navMain} onLinkClick={onClose} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-border/50 shrink-0 border-t">
        <NavUser user={data.user} />
      </div>
    </div>
  );
}
