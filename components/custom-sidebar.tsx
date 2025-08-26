"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Command,
  GalleryVerticalEnd,
  Settings2,
  Users,
  BarChart3,
  FileText,
  Bell,
  UserCheck,
  MapPin,
  Clock,
  Shield,
  Database,
  PanelRightClose,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";

interface CustomSidebarProps {
  onClose?: () => void;
}

// This is sample data for the attendance system
const data = {
  user: {
    name: "UniTrack Admin",
    email: "admin@unitrack.edu",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Computer Science Dept",
      logo: GalleryVerticalEnd,
      plan: "University",
    },
    {
      name: "Mathematics Dept",
      logo: AudioWaveform,
      plan: "University",
    },
    {
      name: "Engineering Dept",
      logo: Command,
      plan: "University",
    },
  ],
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
      url: "/dashboard/courses",
      icon: BookOpen,
      items: [
        {
          title: "All Courses",
          url: "/dashboard/courses/all",
        },
        {
          title: "Create Course",
          url: "/dashboard/courses/create",
        },
        {
          title: "Course Schedule",
          url: "/dashboard/courses/schedule",
        },
        {
          title: "Enrollment",
          url: "/dashboard/courses/enrollment",
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
  projects: [
    {
      name: "Session Management",
      url: "/dashboard/sessions",
      icon: Clock,
    },
    {
      name: "Notifications",
      url: "/dashboard/notifications",
      icon: Bell,
    },
    {
      name: "Security & Fraud",
      url: "/dashboard/security",
      icon: Shield,
    },
    {
      name: "Database Backup",
      url: "/dashboard/backup",
      icon: Database,
    },
    {
      name: "System Settings",
      url: "/dashboard/settings",
      icon: Settings2,
    },
  ],
};

export function CustomSidebar({ onClose }: CustomSidebarProps) {
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
          <div className="p-2">
            <NavMain items={data.navMain} onLinkClick={onClose} />
          </div>
        </div>
        <div className="border-border/30 shrink-0 border-t p-2">
          <NavProjects projects={data.projects} onLinkClick={onClose} />
        </div>
      </div>

      {/* Footer */}
      <div className="border-border/50 shrink-0 border-t">
        <NavUser user={data.user} />
      </div>
    </div>
  );
}
