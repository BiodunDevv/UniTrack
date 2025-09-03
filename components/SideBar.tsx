"use client";

import {
  Activity,
  BarChart3,
  BookOpen,
  Calendar,
  GraduationCap,
  Heart,
  HelpCircle,
  PanelRightClose,
  Plus,
  Share2,
  Trash2,
  TrendingUp,
  User,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { AdminTeamSwitcher } from "@/components/admin-team-switcher";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import { Button } from "@/components/ui/button";
import { useAdminStore } from "@/store/admin-store";
import { useAuthStore } from "@/store/auth-store";
import { useCourseStore } from "@/store/course-store";

interface CustomSidebarProps {
  onClose?: () => void;
}

export function CustomSidebar({ onClose }: CustomSidebarProps) {
  const { user } = useAuthStore();
  const { courses, getAllCourses, isLoading, error } = useCourseStore();
  const { isLoadingSemesterCleanup } = useAdminStore();
  const router = useRouter();

  React.useEffect(() => {
    // Only fetch courses if user is not an admin
    if (user?.role !== "admin") {
      getAllCourses();
    }
  }, [getAllCourses, user?.role]);

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
    return levelMap[level] || `L${level}`;
  };

  // Handle semester cleanup
  const handleSemesterCleanup = () => {
    router.push("/semester-cleanup");
    onClose?.();
  };

  const userData = {
    name: user?.name || "UniTrack User",
    email: user?.email || "user@unitrack.edu",
  };

  // Define navigation items based on user role
  const getNavItems = () => {
    if (user?.role === "admin") {
      return [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: BarChart3,
        },
        {
          title: "Lecturers",
          url: "/lecturers",
          icon: Users,
        },
        {
          title: "Courses",
          url: "/course",
          icon: BookOpen,
        },
        {
          title: "Audit Log",
          url: "/audit-logs",
          icon: Activity,
        },
        {
          title: "System Statistics",
          url: "/stats",
          icon: TrendingUp,
        },
        {
          title: "Health",
          url: "/health",
          icon: Heart,
        },
        {
          title: "Help & Support",
          url: "/help",
          icon: HelpCircle,
        },
      ];
    }

    // Default navigation for teachers
    return [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: BarChart3,
      },
      {
        title: "Courses",
        url: "/course",
        icon: BookOpen,
      },
      {
        title: "Sessions",
        url: "/session",
        icon: Calendar,
      },
      {
        title: "Share Students",
        url: "/share-students",
        icon: Share2,
      },
      {
        title: "Profile",
        url: "/profile",
        icon: User,
      },
      {
        title: "Help & Support",
        url: "/help",
        icon: HelpCircle,
      },
    ];
  };

  // Map courses to teams format for TeamSwitcher - show first 5 courses (only for non-admin users)
  const coursesAsTeams = React.useMemo(() => {
    // Don't show courses for admin users
    if (user?.role === "admin") {
      return [];
    }

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
  }, [courses, isLoading, error, user?.role]);

  const data = {
    user: userData,
    teams: coursesAsTeams,
    navMain: getNavItems(),
  };

  return (
    <div className="border-border/50 bg-card/50 flex h-full w-full flex-col overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="border-border/50 shrink-0 border-b p-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 pr-2">
            {user?.role === "admin" ? (
              <AdminTeamSwitcher />
            ) : (
              <TeamSwitcher teams={data.teams} />
            )}
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
            {/* Create Course Button - Only show for teachers */}
            {user?.role !== "admin" && (
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
            )}

            <NavMain items={data.navMain} onLinkClick={onClose} />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-border/50 shrink-0 border-t">
        {/* End of Semester Button - Only show for admin users */}
        {user?.role === "admin" && (
          <div className="p-2">
            <Button
              onClick={handleSemesterCleanup}
              disabled={isLoadingSemesterCleanup}
              className="w-full justify-start gap-2 transition-all duration-300"
              size="sm"
            >
              <Trash2 className="h-4 w-4" />
              {isLoadingSemesterCleanup ? "Processing..." : "End of Semester"}
            </Button>
          </div>
        )}
        <NavUser user={data.user} />
      </div>
    </div>
  );
}
