import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://unitrack-backend-hd9s.onrender.com/api";

// Function to get auth token from localStorage (where zustand stores it)
const getAuthToken = (): string | null => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsed = JSON.parse(authStorage);
      return parsed.state?.token || null;
    }
  } catch (error) {
    console.error("Error getting auth token:", error);
  }
  return null;
};

// Types
interface Course {
  _id: string;
  teacher_id: {
    _id: string;
    name: string;
    email: string;
  };
  course_code: string;
  title: string;
  level: number;
  student_count?: number;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Student {
  _id: string;
  matric_no: string;
  name: string;
  email: string;
  phone: string;
  course_id: string;
  createdAt: string;
  updatedAt: string;
}

interface Session {
  _id: string;
  course_id: string;
  teacher_id: string;
  session_code?: string; // New field from API
  start_time?: string; // New field from API
  expiry_time?: string; // New field from API
  is_active?: boolean; // New field from API
  is_expired?: boolean; // New field from API
  lat: number;
  lng: number;
  radius_m: number;
  duration_minutes: number;
  status: "active" | "ended" | "expired";
  created_at: string;
  expires_at: string;
  qr_code: string;
}

interface AttendanceStats {
  total_sessions: number;
  active_sessions: number;
  total_students: number;
  total_attendance_records: number;
  present_count: number;
  absent_count: number;
  rejected_count: number;
  average_attendance_rate: number;
  last_session: string;
  course_activity: {
    sessions_this_week: number;
    sessions_this_month: number;
  };
  attendance_counts: {
    present: number;
    absent: number;
    rejected: number;
    total_submissions: number;
  };
}

interface StudentsData {
  total: number;
  active: number;
  inactive: number;
  list: Student[];
}

interface SessionsData {
  total: number;
  active: number;
  expired: number;
  recent: Session[];
  active_sessions: Array<{
    _id: string;
    session_code: string;
    start_time: string;
    expiry_time: string;
  }>;
  pending_sessions: any[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCourses?: number;
  totalStudents?: number;
  totalSessions?: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface ApiResponse<T = any> {
  courses?: Course[];
  course?: Course; // For single course responses
  students?: StudentsData | Student[]; // Can be either the new structure or array
  sessions?: SessionsData | Session[]; // Can be either the new structure or array
  session?: Session;
  stats?: AttendanceStats;
  statistics?: AttendanceStats; // API returns statistics field
  recent_activity?: any[]; // API includes this field
  pagination?: Pagination;
  message?: string;
  success?: boolean;
  [key: string]: any;
}

interface CourseState {
  // State
  courses: Course[];
  currentCourse: Course | null;
  students: Student[];
  sessions: Session[];
  currentSession: Session | null;
  stats: AttendanceStats | null;
  pagination: Pagination | null;
  isLoading: boolean;
  isEmailingCSV: boolean;
  isEmailingPDF: boolean;
  error: string | null;

  // Course Management Actions
  createCourse: (courseData: {
    course_code: string;
    title: string;
  }) => Promise<void>;
  getAllCourses: (page?: number, limit?: number) => Promise<void>;
  getCourse: (courseId: string) => Promise<void>;
  updateCourse: (
    courseId: string,
    data: { title?: string; course_code?: string },
  ) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;

  // Student Management Actions
  addStudentToCourse: (
    courseId: string,
    studentData: {
      matric_no: string;
      name: string;
      email: string;
      phone: string;
    },
  ) => Promise<void>;
  getCourseStudents: (
    courseId: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  getStudentAttendanceHistory: (
    courseId: string,
    studentId: string,
  ) => Promise<void>;
  removeStudentFromCourse: (
    courseId: string,
    studentId: string,
  ) => Promise<void>;

  // Session Management Actions
  startAttendanceSession: (
    courseId: string,
    sessionData: {
      lat: number;
      lng: number;
      radius_m: number;
      duration_minutes: number;
    },
  ) => Promise<void>;
  getCourseSessions: (
    courseId: string,
    status?: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  getSessionDetails: (sessionId: string) => Promise<void>;
  getLiveSessionMonitoring: (sessionId: string) => Promise<void>;
  endSessionEarly: (sessionId: string) => Promise<void>;

  // Reports & Analytics Actions
  getCourseStats: (courseId: string) => Promise<void>;
  downloadCSVReport: (
    courseId: string,
    params?: {
      startDate?: string;
      endDate?: string;
      status?: string;
    },
  ) => Promise<void>;
  emailCSVReport: (
    courseId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    },
  ) => Promise<void>;
  downloadPDFReport: (
    courseId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    },
  ) => Promise<void>;
  emailPDFReport: (
    courseId: string,
    params?: {
      startDate?: string;
      endDate?: string;
    },
  ) => Promise<void>;

  // Utility Actions
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentCourse: (course: Course | null) => void;
}

// Helper function to check for success response
const isSuccessResponse = (response: ApiResponse): boolean => {
  // The API returns data directly without a "success" field
  // Check if we have the expected data structure
  return (
    response.success === true ||
    response.message?.toLowerCase().includes("success") ||
    response.message?.toLowerCase().includes("successful") ||
    response.message?.toLowerCase().includes("sent to your email") ||
    Boolean(response.course) || // For single course responses
    Boolean(response.courses) ||
    Boolean(response.students) ||
    Boolean(response.sessions) ||
    Boolean(response.session) ||
    Boolean(response.stats) ||
    Boolean(response.statistics) || // For stats responses
    Boolean(response.recent_activity !== undefined) // For stats responses that might have empty arrays
  );
};

// Helper function for API calls with authentication
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
};

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      // Initial State
      courses: [],
      currentCourse: null,
      students: [],
      sessions: [],
      currentSession: null,
      stats: null,
      pagination: null,
      isLoading: false,
      isEmailingCSV: false,
      isEmailingPDF: false,
      error: null,

      // Course Management Actions
      createCourse: async (courseData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/courses", {
            method: "POST",
            body: JSON.stringify(courseData),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Refresh courses list
            get().getAllCourses();
          } else {
            throw new Error(response.message || "Failed to create course");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to create course",
            isLoading: false,
          });
          throw error;
        }
      },

      getAllCourses: async (page = 1, limit = 10) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses?page=${page}&limit=${limit}`,
          );

          console.log("Fetched courses:", response.courses);

          if (isSuccessResponse(response)) {
            set({
              courses: response.courses || [],
              pagination: response.pagination || null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch courses");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch courses",
            isLoading: false,
          });
          throw error;
        }
      },

      getCourse: async (courseId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}`);

          console.log("getCourse response:", response);

          if (isSuccessResponse(response)) {
            // Handle the comprehensive data structure
            const { course, students, sessions, statistics } = response;

            // Check if students is the new format or legacy array
            const studentsList = Array.isArray(students)
              ? students
              : students?.list || [];
            // Check if sessions is the new format or legacy array
            const sessionsList = Array.isArray(sessions)
              ? sessions
              : sessions?.recent || [];

            set({
              currentCourse: course || null,
              students: studentsList,
              sessions: sessionsList,
              stats: statistics
                ? {
                    total_sessions: statistics.total_sessions || 0,
                    active_sessions: statistics.active_sessions || 0,
                    total_students: statistics.total_students || 0,
                    total_attendance_records:
                      statistics.total_attendance_records || 0,
                    present_count: statistics.present_count || 0,
                    absent_count: statistics.absent_count || 0,
                    rejected_count: statistics.rejected_count || 0,
                    average_attendance_rate:
                      statistics.average_attendance_rate || 0,
                    last_session: statistics.last_session || "",
                    course_activity: statistics.course_activity || {
                      sessions_this_week: 0,
                      sessions_this_month: 0,
                    },
                    attendance_counts: {
                      present: statistics.present_count || 0,
                      absent: statistics.absent_count || 0,
                      rejected: statistics.rejected_count || 0,
                      total_submissions:
                        statistics.total_attendance_records || 0,
                    },
                  }
                : null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch course");
          }
        } catch (error) {
          console.error("getCourse error:", error);
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch course",
            isLoading: false,
          });
          throw error;
        }
      },

      updateCourse: async (courseId, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Refresh courses list
            get().getAllCourses();
          } else {
            throw new Error(response.message || "Failed to update course");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update course",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteCourse: async (courseId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}`, {
            method: "DELETE",
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Refresh courses list
            get().getAllCourses();
          } else {
            throw new Error(response.message || "Failed to delete course");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to delete course",
            isLoading: false,
          });
          throw error;
        }
      },

      // Student Management Actions
      addStudentToCourse: async (courseId, studentData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}/students`, {
            method: "POST",
            body: JSON.stringify(studentData),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Refresh students list
            get().getCourseStudents(courseId);
          } else {
            throw new Error(response.message || "Failed to add student");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to add student",
            isLoading: false,
          });
          throw error;
        }
      },

      getCourseStudents: async (courseId, page = 1, limit = 20) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/students?page=${page}&limit=${limit}`,
          );

          if (isSuccessResponse(response)) {
            const studentsList = Array.isArray(response.students)
              ? response.students
              : response.students?.list || [];
            set({
              students: studentsList,
              pagination: response.pagination || null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch students");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch students",
            isLoading: false,
          });
          throw error;
        }
      },

      getStudentAttendanceHistory: async (courseId, studentId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/students/${studentId}/attendance`,
          );

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Handle attendance history data
          } else {
            throw new Error(
              response.message || "Failed to fetch attendance history",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch attendance history",
            isLoading: false,
          });
          throw error;
        }
      },

      removeStudentFromCourse: async (courseId, studentId) => {
        // Optimistic update - remove student from local state first
        const currentStudents = get().students;
        const optimisticStudents = currentStudents.filter(
          (student) => student._id !== studentId,
        );
        set({ students: optimisticStudents });

        try {
          const response = await apiCall(
            `/courses/${courseId}/students/${studentId}`,
            {
              method: "DELETE",
            },
          );

          if (isSuccessResponse(response)) {
            // Student already removed from local state, no need to do anything
          } else {
            // Revert optimistic update on failure
            set({ students: currentStudents });
            throw new Error(response.message || "Failed to remove student");
          }
        } catch (error) {
          // Revert optimistic update on error
          set({ students: currentStudents });
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to remove student",
          });
          throw error;
        }
      },

      // Session Management Actions
      startAttendanceSession: async (courseId, sessionData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}/sessions`, {
            method: "POST",
            body: JSON.stringify(sessionData),
          });

          if (isSuccessResponse(response)) {
            set({
              currentSession: response.session || null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to start session");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to start session",
            isLoading: false,
          });
          throw error;
        }
      },

      getCourseSessions: async (
        courseId,
        status = "active",
        page = 1,
        limit = 20,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/sessions?status=${status}&page=${page}&limit=${limit}`,
          );

          if (isSuccessResponse(response)) {
            const sessionsList = Array.isArray(response.sessions)
              ? response.sessions
              : response.sessions?.recent || [];
            set({
              sessions: sessionsList,
              pagination: response.pagination || null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch sessions");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch sessions",
            isLoading: false,
          });
          throw error;
        }
      },

      getSessionDetails: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/sessions/${sessionId}`);

          if (isSuccessResponse(response)) {
            set({
              currentSession: response.session || null,
              isLoading: false,
            });
          } else {
            throw new Error(
              response.message || "Failed to fetch session details",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch session details",
            isLoading: false,
          });
          throw error;
        }
      },

      getLiveSessionMonitoring: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/sessions/${sessionId}/live`);

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Handle live monitoring data
          } else {
            throw new Error(
              response.message || "Failed to fetch live session data",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch live session data",
            isLoading: false,
          });
          throw error;
        }
      },

      endSessionEarly: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/sessions/${sessionId}/end`, {
            method: "PATCH",
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Refresh session data
            get().getSessionDetails(sessionId);
          } else {
            throw new Error(response.message || "Failed to end session");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to end session",
            isLoading: false,
          });
          throw error;
        }
      },

      // Reports & Analytics Actions
      getCourseStats: async (courseId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/attendance/course/${courseId}/stats`,
          );

          console.log("getCourseStats response:", response);

          if (isSuccessResponse(response)) {
            // The API returns statistics in the "statistics" field
            const statsData = response.statistics || response.stats || null;
            set({
              stats: statsData,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Failed to fetch course stats");
          }
        } catch (error) {
          console.error("getCourseStats error:", error);
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch course stats",
            isLoading: false,
          });
          throw error;
        }
      },

      downloadCSVReport: async (courseId, params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams(params).toString();
          const url = `/attendance/course/${courseId}/report.csv${queryParams ? `?${queryParams}` : ""}`;

          const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `course-${courseId}-report.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            set({ isLoading: false });
          } else {
            throw new Error("Failed to download CSV report");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to download CSV report",
            isLoading: false,
          });
          throw error;
        }
      },

      emailCSVReport: async (courseId, params = {}) => {
        set({ isEmailingCSV: true, error: null });
        try {
          const queryParams = new URLSearchParams({
            ...params,
            email: "true",
          }).toString();
          const response = await apiCall(
            `/attendance/course/${courseId}/report.csv?${queryParams}`,
          );

          if (isSuccessResponse(response)) {
            set({ isEmailingCSV: false });
          } else {
            throw new Error(response.message || "Failed to email CSV report");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to email CSV report",
            isEmailingCSV: false,
          });
          throw error;
        }
      },

      downloadPDFReport: async (courseId, params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const queryParams = new URLSearchParams(params).toString();
          const url = `/attendance/course/${courseId}/report.pdf${queryParams ? `?${queryParams}` : ""}`;

          const response = await fetch(`${API_BASE_URL}${url}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          });

          if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `course-${courseId}-report.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            set({ isLoading: false });
          } else {
            throw new Error("Failed to download PDF report");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to download PDF report",
            isLoading: false,
          });
          throw error;
        }
      },

      emailPDFReport: async (courseId, params = {}) => {
        set({ isEmailingPDF: true, error: null });
        try {
          const queryParams = new URLSearchParams({
            ...params,
            email: "true",
          }).toString();
          const response = await apiCall(
            `/attendance/course/${courseId}/report.pdf?${queryParams}`,
          );

          if (isSuccessResponse(response)) {
            set({ isEmailingPDF: false });
          } else {
            throw new Error(response.message || "Failed to email PDF report");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to email PDF report",
            isEmailingPDF: false,
          });
          throw error;
        }
      },

      // Utility Actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setCurrentCourse: (course: Course | null) =>
        set({ currentCourse: course }),
    }),
    {
      name: "course-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        courses: state.courses,
        currentCourse: state.currentCourse,
      }),
    },
  ),
);
