import { create } from "zustand";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/admin";

// Types
interface TeacherStats {
  total_courses: number;
  total_sessions: number;
  total_students: number;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: "teacher" | "admin";
  email_verified: boolean;
  active?: boolean;
  otp: string | null;
  otp_expires_at: string | null;
  otp_purpose: string | null;
  pending_email: string | null;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  last_login?: string;
  stats?: TeacherStats;
}

interface TeachersPagination {
  currentPage: number;
  totalPages: number;
  totalTeachers: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TeachersResponse {
  teachers: Teacher[];
  pagination: TeachersPagination;
}

// Teacher Details Types
interface TeacherOverallStats {
  total_courses: number;
  total_students: number;
  total_sessions: number;
  active_courses: number;
}

interface TeacherDetail {
  _id: string;
  name: string;
  email: string;
  role: "teacher";
  email_verified: boolean;
  otp: string | null;
  otp_expires_at: string | null;
  otp_purpose: string | null;
  pending_email: string | null;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  last_login?: string;
  overall_stats: TeacherOverallStats;
}

interface RecentSession {
  _id: string;
  session_code: string;
  start_ts: string;
  expiry_ts: string;
  is_active: boolean;
}

interface TopStudent {
  _id: string;
  total_sessions: number;
  present_sessions: number;
  name: string;
  matric_no: string;
  attendance_rate: number;
}

interface CourseStatistics {
  total_students: number;
  total_sessions: number;
  active_sessions: number;
  total_attendance_records: number;
  present_count: number;
  absent_count: number;
  overall_attendance_rate: number;
}

interface CourseHealth {
  status: "active" | "inactive";
  last_session: string;
  attendance_trend: "good" | "poor" | "average";
}

interface TeacherCourse {
  _id: string;
  teacher_id: string;
  course_code: string;
  title: string;
  level: number;
  created_at: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
  statistics: CourseStatistics;
  health: CourseHealth;
  recent_sessions: RecentSession[];
  top_students: TopStudent[];
}

interface CoursesPagination {
  currentPage: number;
  totalPages: number;
  totalCourses: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface TeacherCoursesResponse {
  teacher: TeacherDetail;
  courses: TeacherCourse[];
  pagination: CoursesPagination;
}

// Course Sessions Types
interface AttendanceStats {
  total_submissions: number;
  present_count: number;
  total_enrolled: number;
  attendance_rate: number;
  is_expired: boolean;
}

interface SessionCourse {
  _id: string;
  course_code: string;
  title: string;
}

interface SessionTeacher {
  _id: string;
  name: string;
  email: string;
}

interface SessionItem {
  _id: string;
  course_id: SessionCourse;
  teacher_id: SessionTeacher;
  session_code: string;
  start_ts: string;
  expiry_ts: string;
  lat: number;
  lng: number;
  radius_m: number;
  nonce: string;
  is_active: boolean;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  attendance_stats: AttendanceStats;
}

interface SessionsPagination {
  currentPage: number;
  totalPages: number;
  totalSessions: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface CourseInfo {
  _id: string;
  teacher_id: SessionTeacher;
  course_code: string;
  title: string;
  level: number;
  created_at: string;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

interface CourseSessionsResponse {
  course: CourseInfo;
  sessions: SessionItem[];
  pagination: SessionsPagination;
  filter: {
    status: string;
  };
}

// Create Lecturer Types
interface CreateLecturerData {
  name: string;
  email: string;
}

interface CreateLecturerResponse {
  message: string;
  teacher: {
    name: string;
    email: string;
    role: "teacher";
    email_verified: boolean;
    otp: string | null;
    otp_expires_at: string | null;
    otp_purpose: string | null;
    pending_email: string | null;
    _id: string;
    created_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  temporary_password: string;
}

interface CreateLecturerError {
  error: string;
}

interface BulkCreateLecturerData {
  name: string;
  email: string;
}

interface BulkCreateLecturerResponse {
  message: string;
  results: Array<{
    success: boolean;
    teacher?: Teacher;
    error?: string;
    email: string;
  }>;
  successCount: number;
  errorCount: number;
}

// Update lecturer types
interface UpdateLecturerData {
  name?: string;
  email?: string;
  role?: "teacher" | "admin";
  active?: boolean;
}

interface UpdateLecturerResponse {
  message: string;
  teacher: Teacher;
}

// Delete lecturer types
interface DeleteLecturerResponse {
  message: string;
  teacher_deleted: {
    name: string;
    email: string;
    role: string;
  };
  deletion_summary: {
    courses_deleted: number;
    sessions_deleted: number;
    attendance_records_deleted: number;
    course_students_removed: number;
    audit_logs_removed: number;
  };
  warning: string;
}

// Course reassignment types
interface CourseReassignmentData {
  new_lecturer_id: string;
  reason?: string;
}

interface CourseReassignmentResponse {
  message: string;
  course: {
    id: string;
    course_code: string;
    title: string;
    level: number;
  };
  reassignment: {
    from: {
      id: string;
      name: string;
      email: string;
    };
    to: {
      id: string;
      name: string;
      email: string;
    };
    reason: string;
    reassigned_at: string;
    reassigned_by: string;
  };
}

// Health types
interface HealthAlert {
  level: "warning" | "error" | "info";
  message: string;
  action: string;
}

interface HealthDatabase {
  status: "connected" | "disconnected";
  host: string;
  connection_state: string;
  database_name: string;
}

interface HealthMemory {
  rss_mb: number;
  heap_used_mb: number;
  heap_total_mb: number;
  external_mb: number;
  heap_usage_percentage: number;
}

interface HealthCpu {
  user: number;
  system: number;
}

interface HealthSystem {
  node_version: string;
  uptime_seconds: number;
  uptime_formatted: string;
  environment: string;
  memory: HealthMemory;
  cpu_usage: HealthCpu;
  platform: string;
  architecture: string;
}

interface HealthSystemLoad {
  current_load: number;
  load_level: "low" | "medium" | "high";
}

interface HealthApplication {
  total_users: number;
  active_sessions: number;
  recent_activity_1h: number;
  recent_errors_24h: number;
  pending_operations: number;
  system_load: HealthSystemLoad;
}

interface HealthCollectionIndex {
  v: number;
  key: { [key: string]: number };
  name: string;
  background?: boolean;
  unique?: boolean;
}

interface HealthCollection {
  collection: string;
  status: "healthy" | "unhealthy";
  document_count: number;
  last_updated: string;
  indexes: HealthCollectionIndex[];
}

interface HealthEmailService {
  status: "configured" | "not_configured";
  details: {
    configured: boolean;
    host: string;
    port: string;
  };
}

interface HealthDatabaseQueries {
  status: "good" | "slow" | "failing";
  ping_time_ms: number;
}

interface HealthFileSystem {
  status: "accessible" | "not_accessible";
  current_directory: string;
  permissions: string;
}

interface HealthExternalDependencies {
  status: "not_applicable" | "good" | "degraded";
  message: string;
}

interface HealthServices {
  email_service: HealthEmailService;
  database_queries: HealthDatabaseQueries;
  file_system: HealthFileSystem;
  external_dependencies: HealthExternalDependencies;
}

interface HealthSecurity {
  failed_login_attempts_24h: number;
  suspicious_activities: number;
  admin_actions_24h: number;
}

interface HealthResponseTimes {
  database_ping: string;
  average_query_time: string;
}

interface HealthThroughput {
  requests_per_hour: number;
  peak_concurrent_sessions: number;
}

interface HealthErrorRates {
  error_rate_24h: number;
  critical_errors: number;
}

interface HealthPerformance {
  response_times: HealthResponseTimes;
  throughput: HealthThroughput;
  error_rates: HealthErrorRates;
}

interface HealthDetailedChecks {
  database_connectivity: string;
  memory_usage: string;
  error_rate: string;
  active_sessions: string;
  recent_activity: string;
}

interface HealthResponse {
  status: "good" | "warning" | "critical";
  health_score: number;
  timestamp: string;
  alerts: HealthAlert[];
  database: HealthDatabase;
  system: HealthSystem;
  application: HealthApplication;
  collections: HealthCollection[];
  services: HealthServices;
  security: HealthSecurity;
  performance: HealthPerformance;
  detailed_checks: HealthDetailedChecks;
  recommendations: string[];
}

// Stats types
interface StatsSystemOverview {
  total_teachers: number;
  total_students: number;
  total_courses: number;
  total_sessions: number;
  total_attendance_records: number;
  active_sessions: number;
  expired_sessions: number;
  total_enrollments: number;
}

interface StatsUserBreakdown {
  teachers: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
  };
  students: {
    total: number;
  };
}

interface StatsGrowthTrends {
  teachers: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
    last_90d: number;
  };
  students: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
    last_90d: number;
  };
  courses: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
    last_90d: number;
  };
  sessions: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
  attendance: {
    last_24h: number;
    last_7d: number;
    last_30d: number;
  };
}

interface StatsCourseStatistics {
  total_courses: number;
  average_students_per_course: number;
  largest_course_size: number;
  smallest_course_size: number;
}

interface StatsAttendanceAnalytics {
  total_submissions: number;
  breakdown: {
    present: number;
    absent: number;
    manual_present: number;
    rejected: number;
  };
  rates: {
    overall_attendance_rate: number;
    present_rate: number;
    manual_present_rate: number;
  };
}

interface StatsPerformanceMetrics {
  average_session_duration_hours: number;
  overall_attendance_rate: number;
  session_utilization_rate: number;
  teacher_activity_rate: number;
}

interface StatsTopPerformers {
  most_active_teachers: Array<{
    _id: string;
    course_count: number;
    name: string;
    email: string;
  }>;
  most_enrolled_courses: Array<{
    _id: string;
    enrollment_count: number;
    course_code: string;
    title: string;
    teacher_name: string;
  }>;
}

interface StatsRiskIndicators {
  inactive_teachers: number;
  courses_without_sessions: number;
  sessions_with_low_attendance: number;
}

interface StatsRecentActivity {
  _id: string;
  actor_id: {
    _id: string;
    name: string;
    email: string;
    role: "teacher" | "admin";
  } | null;
  action: string;
  payload: any;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface StatsResponse {
  generated_at: string;
  system_overview: StatsSystemOverview;
  user_breakdown: StatsUserBreakdown;
  growth_trends: StatsGrowthTrends;
  course_statistics: StatsCourseStatistics;
  attendance_analytics: StatsAttendanceAnalytics;
  performance_metrics: StatsPerformanceMetrics;
  top_performers: StatsTopPerformers;
  risk_indicators: StatsRiskIndicators;
  recent_activity: StatsRecentActivity[];
}

// Audit log types
interface AuditLogActor {
  _id: string;
  name: string;
  email: string;
  role: "teacher" | "admin";
}

interface AuditLogPayload {
  method: string;
  url: string;
  body?: any;
  params?: any;
  query?: any;
  ip: string;
  userAgent: string;
}

interface AuditLog {
  _id: string;
  actor_id: AuditLogActor | null;
  action: string;
  payload: AuditLogPayload;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface AuditLogsPagination {
  currentPage: number;
  totalPages: number;
  totalLogs: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface AuditLogsResponse {
  audit_logs: AuditLog[];
  pagination: AuditLogsPagination;
  analytics?: {
    action_statistics: Array<{
      _id: string;
      count: number;
    }>;
    hourly_activity: Array<{
      _id: {
        year: number;
        month: number;
        day: number;
        hour: number;
      };
      count: number;
    }>;
    top_actors: Array<{
      _id: string;
      action_count: number;
      last_activity: string;
      unique_actions: number;
      actor_name?: string;
      actor_email?: string;
      actor_role?: string;
    }>;
    activity_trends: {
      last_24h: number;
      last_7d: number;
      last_30d: number;
    };
    security_events: AuditLog[];
    error_analysis: any[];
  };
  filters_applied?: any;
  available_categories?: string[];
}

// Semester Cleanup Types
interface SemesterCleanupStats {
  sessions_deleted: number;
  attendance_records_deleted: number;
  audit_logs_deleted: number;
  email_otps_deleted: number;
  device_fingerprints_deleted: number;
  student_share_requests_deleted: number;
}

interface SemesterCleanupPreserved {
  teachers: number;
  students: number;
  courses: number;
  course_enrollments: number;
  admins: number;
  faqs: number;
}

interface SemesterCleanupResponse {
  message: string;
  cleanup_summary: {
    deleted: SemesterCleanupStats;
    preserved: SemesterCleanupPreserved;
  };
  description: {
    deleted: string[];
    preserved: string[];
  };
  warning: string;
  next_steps: string;
}

interface AdminState {
  // Teachers state
  teachers: Teacher[];
  teachersPagination: TeachersPagination | null;
  isLoadingTeachers: boolean;
  teachersError: string | null;

  // Teacher details state
  teacherDetail: TeacherDetail | null;
  teacherCourses: TeacherCourse[];
  coursesPagination: CoursesPagination | null;
  isLoadingTeacherDetails: boolean;
  teacherDetailsError: string | null;

  // Course sessions state
  courseInfo: CourseInfo | null;
  courseSessions: SessionItem[];
  sessionsPagination: SessionsPagination | null;
  isLoadingSessions: boolean;
  sessionsError: string | null;

  // Audit logs state
  auditLogs: AuditLog[];
  auditLogsPagination: AuditLogsPagination | null;
  auditLogsAnalytics: AuditLogsResponse["analytics"] | null;
  isLoadingAuditLogs: boolean;
  auditLogsError: string | null;

  // Health state
  healthData: HealthResponse | null;
  isLoadingHealth: boolean;
  healthError: string | null;

  // Stats state
  statsData: StatsResponse | null;
  isLoadingStats: boolean;
  statsError: string | null;

  // Semester cleanup state
  isLoadingSemesterCleanup: boolean;
  semesterCleanupError: string | null;

  // Actions
  getAllTeachers: (page?: number, limit?: number) => Promise<void>;
  getTeacherCourses: (
    teacherId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  getCourseSessions: (
    courseId: string,
    page?: number,
    limit?: number,
    status?: string,
  ) => Promise<void>;
  getAuditLogs: (page?: number, limit?: number) => Promise<void>;
  getHealthData: () => Promise<void>;
  getStatsData: () => Promise<void>;
  createLecturer: (data: CreateLecturerData) => Promise<CreateLecturerResponse>;
  createBulkLecturers: (
    data: BulkCreateLecturerData[],
  ) => Promise<BulkCreateLecturerResponse>;
  updateLecturer: (
    teacherId: string,
    data: UpdateLecturerData,
  ) => Promise<UpdateLecturerResponse>;
  deleteLecturer: (teacherId: string) => Promise<DeleteLecturerResponse>;
  reassignCourse: (
    courseId: string,
    data: CourseReassignmentData,
  ) => Promise<CourseReassignmentResponse>;
  semesterCleanup: () => Promise<SemesterCleanupResponse>;
  clearTeachersError: () => void;
  clearTeacherDetailsError: () => void;
  clearSessionsError: () => void;
  clearAuditLogsError: () => void;
  clearHealthError: () => void;
  clearStatsError: () => void;
  clearSemesterCleanupError: () => void;
  setLoadingTeachers: (loading: boolean) => void;
  setLoadingTeacherDetails: (loading: boolean) => void;
  setLoadingSessions: (loading: boolean) => void;
  setLoadingAuditLogs: (loading: boolean) => void;
  setLoadingHealth: (loading: boolean) => void;
  setLoadingStats: (loading: boolean) => void;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  try {
    // Try to get from localStorage first (where auth store persists it)
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed?.state?.token || null;
    }

    // Fallback to direct localStorage check
    return localStorage.getItem("auth-token");
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

export const useAdminStore = create<AdminState>((set, get) => ({
  // Teachers state
  teachers: [],
  teachersPagination: null,
  isLoadingTeachers: false,
  teachersError: null,

  // Teacher details state
  teacherDetail: null,
  teacherCourses: [],
  coursesPagination: null,
  isLoadingTeacherDetails: false,
  teacherDetailsError: null,

  // Course sessions state
  courseInfo: null,
  courseSessions: [],
  sessionsPagination: null,
  isLoadingSessions: false,
  sessionsError: null,

  // Audit logs state
  auditLogs: [],
  auditLogsPagination: null,
  auditLogsAnalytics: null,
  isLoadingAuditLogs: false,
  auditLogsError: null,

  // Health state
  healthData: null,
  isLoadingHealth: false,
  healthError: null,

  // Stats state
  statsData: null,
  isLoadingStats: false,
  statsError: null,

  // Semester cleanup state
  isLoadingSemesterCleanup: false,
  semesterCleanupError: null,

  // Actions
  getAllTeachers: async (page = 1, limit = 20) => {
    try {
      set({ isLoadingTeachers: true, teachersError: null });

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/teachers?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data: TeachersResponse = await response.json();

      set({
        teachers: data.teachers,
        teachersPagination: data.pagination,
        isLoadingTeachers: false,
        teachersError: null,
      });
    } catch (error) {
      console.error("Error fetching teachers:", error);
      set({
        teachers: [],
        teachersPagination: null,
        isLoadingTeachers: false,
        teachersError:
          error instanceof Error ? error.message : "Failed to fetch teachers",
      });
    }
  },

  getTeacherCourses: async (teacherId: string, page = 1, limit = 20) => {
    try {
      set({ isLoadingTeacherDetails: true, teacherDetailsError: null });

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/teachers/${teacherId}/courses?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data: TeacherCoursesResponse = await response.json();

      set({
        teacherDetail: data.teacher,
        teacherCourses: data.courses,
        coursesPagination: data.pagination,
        isLoadingTeacherDetails: false,
        teacherDetailsError: null,
      });
    } catch (error) {
      console.error("Error fetching teacher courses:", error);
      set({
        teacherDetail: null,
        teacherCourses: [],
        coursesPagination: null,
        isLoadingTeacherDetails: false,
        teacherDetailsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch teacher details",
      });
    }
  },

  getCourseSessions: async (
    courseId: string,
    page = 1,
    limit = 12,
    status = "all",
  ) => {
    try {
      set({ isLoadingSessions: true, sessionsError: null });

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      let url = `${API_BASE_URL}/admin/courses/${courseId}/sessions?page=${page}&limit=${limit}`;

      if (status && status !== "all") {
        url += `&status=${status}`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data: CourseSessionsResponse = await response.json();

      set({
        courseInfo: data.course,
        courseSessions: data.sessions,
        sessionsPagination: data.pagination,
        isLoadingSessions: false,
        sessionsError: null,
      });
    } catch (error) {
      console.error("Error fetching course sessions:", error);
      set({
        courseInfo: null,
        courseSessions: [],
        sessionsPagination: null,
        isLoadingSessions: false,
        sessionsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch course sessions",
      });
    }
  },

  createLecturer: async (data: CreateLecturerData) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`${API_BASE_URL}/admin/teachers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400 && errorData.error) {
        throw new Error(errorData.error);
      }
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result: CreateLecturerResponse = await response.json();
    return result;
  },

  createBulkLecturers: async (data: BulkCreateLecturerData[]) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`${API_BASE_URL}/admin/teachers/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ teachers: data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result: BulkCreateLecturerResponse = await response.json();
    return result;
  },

  updateLecturer: async (teacherId: string, data: UpdateLecturerData) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/teachers/${teacherId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );

    console.log(response.text);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400 && errorData.error) {
        throw new Error(errorData.error);
      }
      if (response.status === 404) {
        throw new Error("Teacher not found");
      }
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result: UpdateLecturerResponse = await response.json();

    // Update the teacher in the local state
    const currentState = get();
    const updatedTeachers = currentState.teachers.map((teacher) =>
      teacher._id === teacherId ? result.teacher : teacher,
    );
    set({ teachers: updatedTeachers });

    return result;
  },

  deleteLecturer: async (teacherId: string) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      `${API_BASE_URL}/admin/teachers/${teacherId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 400 && errorData.error) {
        throw new Error(errorData.error);
      }
      if (response.status === 404) {
        throw new Error("Teacher not found");
      }
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result: DeleteLecturerResponse = await response.json();

    // Remove the teacher from the local state
    const currentState = get();
    const updatedTeachers = currentState.teachers.filter(
      (teacher) => teacher._id !== teacherId,
    );

    // Update pagination if needed
    const updatedPagination = currentState.teachersPagination
      ? {
          ...currentState.teachersPagination,
          totalTeachers: currentState.teachersPagination.totalTeachers - 1,
        }
      : null;

    set({
      teachers: updatedTeachers,
      teachersPagination: updatedPagination,
    });

    return result;
  },

  reassignCourse: async (courseId: string, data: CourseReassignmentData) => {
    const token = getAuthToken();

    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(
      `${API_BASE_URL}/courses/${courseId}/reassign-lecturer`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`,
      );
    }

    const result: CourseReassignmentResponse = await response.json();
    return result;
  },

  getAuditLogs: async (page = 1, limit = 50) => {
    try {
      set({ isLoadingAuditLogs: true, auditLogsError: null });

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `${API_BASE_URL}/admin/audit-logs?page=${page}&limit=${limit}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data: AuditLogsResponse = await response.json();

      set({
        auditLogs: data.audit_logs,
        auditLogsPagination: data.pagination,
        auditLogsAnalytics: data.analytics || null,
        isLoadingAuditLogs: false,
        auditLogsError: null,
      });
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      set({
        auditLogs: [],
        auditLogsPagination: null,
        auditLogsAnalytics: null,
        isLoadingAuditLogs: false,
        auditLogsError:
          error instanceof Error ? error.message : "Failed to fetch audit logs",
      });
    }
  },

  getHealthData: async () => {
    try {
      set({ isLoadingHealth: true, healthError: null });

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/admin/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data: HealthResponse = await response.json();

      set({
        healthData: data,
        isLoadingHealth: false,
        healthError: null,
      });
    } catch (error) {
      console.error("Error fetching health data:", error);
      set({
        healthData: null,
        isLoadingHealth: false,
        healthError:
          error instanceof Error
            ? error.message
            : "Failed to fetch health data",
      });
    }
  },

  getStatsData: async () => {
    try {
      set({ isLoadingStats: true, statsError: null });

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/admin/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data: StatsResponse = await response.json();

      set({
        statsData: data,
        isLoadingStats: false,
        statsError: null,
      });
    } catch (error) {
      console.error("Error fetching stats data:", error);
      set({
        statsData: null,
        isLoadingStats: false,
        statsError:
          error instanceof Error ? error.message : "Failed to fetch stats data",
      });
    }
  },

  semesterCleanup: async (): Promise<SemesterCleanupResponse> => {
    try {
      set({ isLoadingSemesterCleanup: true, semesterCleanupError: null });

      const token = getAuthToken();

      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(`${API_BASE_URL}/admin/semester-cleanup`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP error! status: ${response.status}`,
        );
      }

      const data: SemesterCleanupResponse = await response.json();

      set({
        isLoadingSemesterCleanup: false,
        semesterCleanupError: null,
      });

      return data;
    } catch (error) {
      console.error("Error performing semester cleanup:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to perform semester cleanup";

      set({
        isLoadingSemesterCleanup: false,
        semesterCleanupError: errorMessage,
      });

      throw error;
    }
  },

  clearTeachersError: () => set({ teachersError: null }),

  clearTeacherDetailsError: () => set({ teacherDetailsError: null }),

  clearSessionsError: () => set({ sessionsError: null }),

  clearAuditLogsError: () => set({ auditLogsError: null }),

  clearHealthError: () => set({ healthError: null }),

  clearStatsError: () => set({ statsError: null }),

  clearSemesterCleanupError: () => set({ semesterCleanupError: null }),

  setLoadingTeachers: (loading: boolean) => set({ isLoadingTeachers: loading }),

  setLoadingTeacherDetails: (loading: boolean) =>
    set({ isLoadingTeacherDetails: loading }),

  setLoadingSessions: (loading: boolean) => set({ isLoadingSessions: loading }),

  setLoadingAuditLogs: (loading: boolean) =>
    set({ isLoadingAuditLogs: loading }),

  setLoadingHealth: (loading: boolean) => set({ isLoadingHealth: loading }),

  setLoadingStats: (loading: boolean) => set({ isLoadingStats: loading }),
}));

// Export types for use in components
export type {
  Teacher,
  TeacherStats,
  TeachersPagination,
  TeachersResponse,
  TeacherDetail,
  TeacherOverallStats,
  TeacherCourse,
  CourseStatistics,
  CourseHealth,
  RecentSession,
  TopStudent,
  CoursesPagination,
  TeacherCoursesResponse,
  SessionItem,
  AttendanceStats,
  SessionsPagination,
  CourseInfo,
  CourseSessionsResponse,
  SessionCourse,
  SessionTeacher,
  CreateLecturerData,
  CreateLecturerResponse,
  CreateLecturerError,
  BulkCreateLecturerData,
  BulkCreateLecturerResponse,
  UpdateLecturerData,
  UpdateLecturerResponse,
  DeleteLecturerResponse,
  CourseReassignmentData,
  CourseReassignmentResponse,
  AuditLog,
  AuditLogActor,
  AuditLogPayload,
  AuditLogsPagination,
  AuditLogsResponse,
  HealthResponse,
  HealthAlert,
  HealthDatabase,
  HealthSystem,
  HealthApplication,
  HealthCollection,
  HealthServices,
  HealthSecurity,
  HealthPerformance,
  HealthDetailedChecks,
  StatsResponse,
  StatsSystemOverview,
  StatsUserBreakdown,
  StatsGrowthTrends,
  StatsCourseStatistics,
  StatsAttendanceAnalytics,
  StatsPerformanceMetrics,
  StatsTopPerformers,
  StatsRiskIndicators,
  StatsRecentActivity,
  SemesterCleanupStats,
  SemesterCleanupPreserved,
  SemesterCleanupResponse,
};
