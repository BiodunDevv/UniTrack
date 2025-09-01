import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "localhost:3000";

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
  // New active session fields
  active_sessions_count?: number;
  has_active_session?: boolean;
  active_sessions?: Array<{
    _id: string;
    session_code: string;
    start_ts: string;
    expiry_ts: string;
  }>;
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

interface CopyStudentsResponse {
  message: string;
  addedStudents: Array<{
    _id: string;
    course_id: string;
    student_id: {
      _id: string;
      matric_no: string;
      name: string;
      email: string;
      phone?: string;
      level: number;
    };
    added_by: string;
    added_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  skippedStudents: Array<{
    matric_no: string;
    name: string;
    reason: string;
  }>;
  summary: {
    total_processed: number;
    added: number;
    skipped: number;
  };
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

interface BulkDeleteResponse {
  message: string;
  summary: {
    total_processed: number;
    successful: number;
    not_found: number;
    failed: number;
    course: {
      id: string;
      title: string;
      course_code: string;
    };
  };
  results: {
    successful: Array<{
      student_id: string;
      name: string;
      email: string;
      matric_no: string;
      attendance_records_cleaned: boolean;
    }>;
    not_found: Array<{
      student_id: string;
      reason: string;
    }>;
    failed: Array<{
      student_id: string;
      error: string;
    }>;
  };
}

interface DeleteAllStudentsResponse {
  message: string;
  summary: {
    total_students_removed: number;
    course: {
      id: string;
      title: string;
      course_code: string;
    };
    deleted_students: Array<{
      id: string;
      name: string;
      email: string;
      matric_no: string;
    }>;
    attendance_records_cleaned: boolean;
  };
}

interface BulkAttendanceResponse {
  message: string;
  summary: {
    total_processed: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  results: {
    successful: Array<{
      student_id: string;
      matric_no: string;
      name: string;
      status: "present" | "absent";
      attendance_id: string;
    }>;
    failed: Array<{
      student_id: string;
      error: string;
    }>;
    skipped: Array<{
      student_id: string;
      reason: string;
    }>;
  };
  session: {
    id: string;
    session_code: string;
  };
  course: {
    id: string;
    title: string;
    course_code: string;
  };
}

interface ManualAttendanceResponse {
  message: string;
  student: {
    id: string;
    matric_no: string;
    name: string;
    status: "manual_present";
    attendance_id: string;
  };
  session: {
    id: string;
    session_code: string;
  };
  course: {
    id: string;
    title: string;
    course_code: string;
  };
}

interface AttendanceReportData {
  message: string;
  course: {
    id: string;
    title: string;
    course_code: string;
    level: number;
    created_at: string;
  };
  summary: {
    total_sessions: number;
    total_students: number;
    overall_attendance_rate: number;
    students_meeting_75_percent: number;
    students_below_75_percent: number;
    perfect_attendance_students: number;
  };
  risk_analysis: {
    critical_risk: number;
    high_risk: number;
    medium_risk: number;
    total_at_risk: number;
  };
  insights: {
    best_attended_session: {
      session_id: string;
      session_code: string;
      date: string;
      start_time: string;
      end_time: string;
      total_submissions: number;
      present_count: number;
      absent_count: number;
      attendance_rate: number;
      location: {
        lat: number;
        lng: number;
        radius_m: number;
      };
    };
    worst_attended_session: {
      session_id: string;
      session_code: string;
      date: string;
      start_time: string;
      end_time: string;
      total_submissions: number;
      present_count: number;
      absent_count: number;
      attendance_rate: number;
      location: {
        lat: number;
        lng: number;
        radius_m: number;
      };
    };
    average_session_attendance: number;
    students_with_perfect_attendance: number;
    students_at_risk: number;
  };
  sessions_overview: Array<{
    session_id: string;
    session_code: string;
    date: string;
    start_time: string;
    end_time: string;
    total_submissions: number;
    present_count: number;
    absent_count: number;
    attendance_rate: number;
    location: {
      lat: number;
      lng: number;
      radius_m: number;
    };
  }>;
  students_below_75_percent: Array<{
    id: string;
    name: string;
    email: string;
    matric_no: string;
    level: number;
    attendance_rate: number;
    sessions_attended: number;
    sessions_missed: number;
    sessions_needed_for_75_percent: number;
    risk_level: "critical" | "high" | "medium" | "low";
  }>;
  all_students: Array<{
    student: {
      id: string;
      name: string;
      email: string;
      matric_no: string;
      level: number;
    };
    statistics: {
      total_sessions: number;
      attended_sessions: number;
      missed_sessions: number;
      attendance_rate: number;
      meets_75_percent_requirement: boolean;
      sessions_needed_for_75_percent: number;
    };
    session_details: Array<{
      session_id: string;
      session_code: string;
      date: string;
      status: "present" | "absent" | "rejected";
      submitted_at: string | null;
      distance_m: number | null;
    }>;
  }>;
  generated_at: string;
  report_parameters: {
    minimum_attendance_requirement: number;
    format: string;
  };
}

interface CourseState {
  // State
  courses: Course[];
  allCourses: Course[]; // Store all courses for client-side pagination
  currentCourse: Course | null;
  students: Student[];
  sessions: Session[];
  currentSession: Session | null;
  stats: AttendanceStats | null;
  attendanceReport: AttendanceReportData | null;
  pagination: Pagination | null;
  isLoading: boolean;
  isEmailingCSV: boolean;
  isEmailingPDF: boolean;
  isDownloadingCSV: boolean;
  isDownloadingPDF: boolean;
  error: string | null;
  currentPage: number;
  coursesPerPage: number;
  totalStudents: number; // Total students across all courses
  totalActiveSessions: number; // Total active sessions across all courses

  // Course Management Actions
  createCourse: (courseData: {
    course_code: string;
    title: string;
    level: number;
  }) => Promise<void>;
  getAllCourses: () => Promise<void>; // Updated to remove pagination params
  getCourse: (courseId: string) => Promise<void>;
  updateCourse: (
    courseId: string,
    data: { title?: string; level?: number },
  ) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;

  // Client-side pagination actions
  setCurrentPage: (page: number) => void;
  getDisplayedCourses: () => Course[];
  getTotalPages: () => number;

  // Student Management Actions
  addStudentToCourse: (
    courseId: string,
    studentData: {
      matric_no: string;
      name: string;
      email: string;
      level: number;
    },
  ) => Promise<void>;
  addBulkStudentsToCourse: (
    courseId: string,
    studentsData: Array<{
      course_code: string;
      matric_no: string;
      name: string;
      email: string;
      phone?: string;
      level: number;
    }>,
  ) => Promise<ApiResponse>;
  copyStudentsFromCourse: (
    sourceCourseId: string,
    targetCourseId: string,
  ) => Promise<CopyStudentsResponse>;
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
  bulkRemoveStudentsFromCourse: (
    courseId: string,
    studentIds: string[],
  ) => Promise<BulkDeleteResponse>;
  removeAllStudentsFromCourse: (
    courseId: string,
  ) => Promise<DeleteAllStudentsResponse>;

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

  // Attendance Management Actions
  bulkMarkAttendance: (
    courseId: string,
    sessionId: string,
    students: Array<{
      studentId: string;
      status: "present" | "absent";
      reason: string;
    }>,
  ) => Promise<BulkAttendanceResponse>;
  markStudentAttendance: (
    courseId: string,
    sessionId: string,
    studentId: string,
    status: "present" | "absent",
    reason: string,
  ) => Promise<ManualAttendanceResponse>;

  // Reports & Analytics Actions
  getCourseStats: (courseId: string) => Promise<void>;
  getCourseAttendanceReport: (courseId: string) => Promise<void>;
  downloadCSVReport: (courseId: string) => Promise<void>;
  emailCSVReport: (courseId: string) => Promise<void>;
  downloadPDFReport: (courseId: string) => Promise<void>;
  emailPDFReport: (courseId: string) => Promise<void>;

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
    response.message?.toLowerCase().includes("completed") ||
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
      errorData.error ||
        errorData.message ||
        `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
};

export const useCourseStore = create<CourseState>()(
  persist(
    (set, get) => ({
      // Initial State
      courses: [],
      allCourses: [],
      currentCourse: null,
      students: [],
      sessions: [],
      currentSession: null,
      stats: null,
      attendanceReport: null,
      pagination: null,
      isLoading: false,
      isEmailingCSV: false,
      isEmailingPDF: false,
      isDownloadingCSV: false,
      isDownloadingPDF: false,
      error: null,
      currentPage: 1,
      coursesPerPage: 8,
      totalStudents: 0,
      totalActiveSessions: 0,

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

      getAllCourses: async () => {
        set({ isLoading: true, error: null });
        try {
          // Fetch all courses with a large limit to get all courses
          const response = await apiCall("/courses?limit=1000");

          if (isSuccessResponse(response)) {
            const allCourses = response.courses || [];
            const { currentPage, coursesPerPage } = get();

            // Calculate total students across all courses
            const totalStudents = allCourses.reduce((sum, course) => {
              return sum + (course.student_count || 0);
            }, 0);

            // Calculate total active sessions across all courses
            const totalActiveSessions = allCourses.reduce((sum, course) => {
              return sum + (course.active_sessions_count || 0);
            }, 0);

            // Calculate displayed courses for current page
            const startIndex = (currentPage - 1) * coursesPerPage;
            const endIndex = startIndex + coursesPerPage;
            const displayedCourses = allCourses.slice(startIndex, endIndex);

            set({
              allCourses,
              courses: displayedCourses,
              totalStudents,
              totalActiveSessions,
              pagination: {
                currentPage,
                totalPages: Math.ceil(allCourses.length / coursesPerPage),
                totalCourses: allCourses.length,
                hasNext: endIndex < allCourses.length,
                hasPrev: currentPage > 1,
              },
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

      addBulkStudentsToCourse: async (courseId, studentsData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(`/courses/${courseId}/students/bulk`, {
            method: "POST",
            body: JSON.stringify({ students: studentsData }),
          });

          console.log("Bulk add students response:", response);

          if (isSuccessResponse(response) || response.message) {
            set({ isLoading: false });
            // Return the response for detailed handling in UI
            return response;
          } else {
            throw new Error(response.message || "Failed to add students");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to add students",
            isLoading: false,
          });
          throw error;
        }
      },

      copyStudentsFromCourse: async (sourceCourseId, targetCourseId) => {
        set({ isLoading: true, error: null });
        try {
          const token = getAuthToken();

          // Use direct fetch instead of apiCall to handle 400 status codes specially
          const response = await fetch(
            `${API_BASE_URL}/courses/${targetCourseId}/copy-students/${sourceCourseId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            },
          );

          const responseData = await response.json();

          // Handle 400 status with "No students found to copy" as a special case
          if (!response.ok) {
            if (
              response.status === 400 &&
              responseData.error === "No students found to copy"
            ) {
              set({ isLoading: false });
              return {
                message: "No students to copy from this course",
                summary: {
                  total_processed: 0,
                  added: 0,
                  updated: 0,
                  skipped: 0,
                  errors: 0,
                },
                addedStudents: [],
                skippedStudents: [],
                updatedStudents: [],
                errorStudents: [],
              } as CopyStudentsResponse;
            }

            // For other errors, throw as usual
            throw new Error(
              responseData.message ||
                responseData.error ||
                `HTTP error! status: ${response.status}`,
            );
          }

          set({ isLoading: false });
          return responseData as CopyStudentsResponse;
        } catch (error) {
          // If it's our custom "no students" case, don't set it as an error
          if (
            error instanceof Error &&
            error.message === "No students found to copy"
          ) {
            set({ isLoading: false });
            // Return a mock successful response with zero results
            return {
              message: "No students to copy from this course",
              summary: {
                total_processed: 0,
                added: 0,
                updated: 0,
                skipped: 0,
                errors: 0,
              },
              addedStudents: [],
              skippedStudents: [],
              updatedStudents: [],
              errorStudents: [],
            } as CopyStudentsResponse;
          }

          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to copy students",
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

      bulkRemoveStudentsFromCourse: async (courseId, studentIds) => {
        set({ isLoading: true });

        try {
          const response = await apiCall(`/courses/${courseId}/students/bulk`, {
            method: "DELETE",
            body: JSON.stringify({ student_ids: studentIds }),
          });

          console.log("Bulk remove students response:", response);

          // Check for bulk delete specific success criteria
          const isBulkDeleteSuccess =
            response.summary &&
            response.results &&
            response.summary.successful >= 0 && // Allow 0 successful if all were not found/failed
            typeof response.summary.total_processed === "number";

          if (isSuccessResponse(response) || isBulkDeleteSuccess) {
            // Remove successfully deleted students from local state
            const currentStudents = get().students;
            const deletedStudentIds =
              response.results?.successful?.map((s: any) => s.student_id) || [];
            const updatedStudents = currentStudents.filter(
              (student) => !deletedStudentIds.includes(student._id),
            );
            set({ students: updatedStudents });

            return response as BulkDeleteResponse;
          } else {
            throw new Error(
              response.message || "Failed to bulk remove students",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to bulk remove students",
          });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      removeAllStudentsFromCourse: async (courseId) => {
        set({ isLoading: true });

        try {
          const response = await apiCall(`/courses/${courseId}/students/all`, {
            method: "DELETE",
          });

          // Check for delete all specific success criteria
          const isDeleteAllSuccess =
            response.summary &&
            typeof response.summary.total_students_removed === "number";

          if (isSuccessResponse(response) || isDeleteAllSuccess) {
            // Clear all students from local state
            set({ students: [] });

            return response as DeleteAllStudentsResponse;
          } else {
            throw new Error(
              response.message || "Failed to remove all students",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to remove all students",
          });
          throw error;
        } finally {
          set({ isLoading: false });
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

          console.log("Start Session Response:", response.message);

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

      // Attendance Management Actions
      bulkMarkAttendance: async (courseId, sessionId, students) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/students/bulk-mark`,
            {
              method: "PATCH",
              body: JSON.stringify({
                sessionId,
                students,
              }),
            },
          );

          console.log("Bulk mark attendance response:", response);

          // Check for bulk attendance specific success criteria
          const isBulkAttendanceSuccess =
            response.summary &&
            response.results &&
            typeof response.summary.total_processed === "number" &&
            typeof response.summary.successful === "number";

          if (isSuccessResponse(response) || isBulkAttendanceSuccess) {
            set({ isLoading: false });
            return response as unknown as BulkAttendanceResponse;
          } else {
            throw new Error(response.message || "Failed to mark attendance");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to mark attendance",
            isLoading: false,
          });
          throw error;
        }
      },

      markStudentAttendance: async (
        courseId,
        sessionId,
        studentId,
        status,
        reason,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/students/bulk-mark`,
            {
              method: "PATCH",
              body: JSON.stringify({
                sessionId,
                students: [
                  {
                    studentId,
                    status,
                    reason,
                  },
                ],
              }),
            },
          );

          console.log("Manual mark attendance response:", response);

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
            // Transform bulk response to single manual response format
            const singleResponse = {
              message: response.message || `Student marked as ${status}`,
              student: {
                id: studentId,
                matric_no: response.results?.successful?.[0]?.matric_no || "",
                name: response.results?.successful?.[0]?.name || "",
                status: status === "present" ? "manual_present" : status,
                attendance_id:
                  response.results?.successful?.[0]?.attendance_id || "",
              },
              session: {
                id: response.session?._id || sessionId,
                session_code: response.session?.session_code || "",
              },
              course: {
                id: response.course?._id || courseId,
                title: response.course?.title || "",
                course_code: response.course?.course_code || "",
              },
            };
            return singleResponse as ManualAttendanceResponse;
          } else {
            throw new Error(
              response.message || "Failed to mark student attendance",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to mark student attendance",
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

      getCourseAttendanceReport: async (courseId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall(
            `/courses/${courseId}/attendance-report`,
          );

          if (isSuccessResponse(response)) {
            set({
              attendanceReport: response as unknown as AttendanceReportData,
              isLoading: false,
            });
          } else {
            throw new Error(
              response.message || "Failed to fetch attendance report",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch attendance report",
            isLoading: false,
          });
          throw error;
        }
      },

      downloadCSVReport: async (courseId) => {
        set({ isDownloadingCSV: true, error: null });
        try {
          const token = getAuthToken();
          const response = await fetch(
            `${API_BASE_URL}/attendance/course/${courseId}/report.csv`,
            {
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            },
          );

          if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `comprehensive-attendance-${courseId}-${Date.now()}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            set({ isDownloadingCSV: false });
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to download CSV report");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to download CSV report",
            isDownloadingCSV: false,
          });
          throw error;
        }
      },

      emailCSVReport: async (courseId) => {
        set({ isEmailingCSV: true, error: null });
        try {
          const response = await apiCall(
            `/attendance/course/${courseId}/report.csv?email=true`,
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

      downloadPDFReport: async (courseId) => {
        set({ isDownloadingPDF: true, error: null });
        try {
          const token = getAuthToken();
          const response = await fetch(
            `${API_BASE_URL}/attendance/course/${courseId}/report.pdf`,
            {
              headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            },
          );

          if (response.ok) {
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = `comprehensive-attendance-${courseId}-${Date.now()}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(downloadUrl);
            set({ isDownloadingPDF: false });
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to download PDF report");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to download PDF report",
            isDownloadingPDF: false,
          });
          throw error;
        }
      },

      emailPDFReport: async (courseId) => {
        set({ isEmailingPDF: true, error: null });
        try {
          const response = await apiCall(
            `/attendance/course/${courseId}/report.pdf?email=true`,
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

      // Client-side pagination methods
      setCurrentPage: (page: number) => {
        const { allCourses, coursesPerPage } = get();
        const startIndex = (page - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        const displayedCourses = allCourses.slice(startIndex, endIndex);

        // Calculate total students across all courses
        const totalStudents = allCourses.reduce((sum, course) => {
          return sum + (course.student_count || 0);
        }, 0);

        // Calculate total active sessions across all courses
        const totalActiveSessions = allCourses.reduce((sum, course) => {
          return sum + (course.active_sessions_count || 0);
        }, 0);

        set({
          currentPage: page,
          courses: displayedCourses,
          totalStudents,
          totalActiveSessions,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(allCourses.length / coursesPerPage),
            totalCourses: allCourses.length,
            hasNext: endIndex < allCourses.length,
            hasPrev: page > 1,
          },
        });
      },
      getDisplayedCourses: () => {
        const { allCourses, currentPage, coursesPerPage } = get();
        const startIndex = (currentPage - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        return allCourses.slice(startIndex, endIndex);
      },

      getTotalPages: () => {
        const { allCourses, coursesPerPage } = get();
        return Math.ceil(allCourses.length / coursesPerPage);
      },
    }),
    {
      name: "course-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        courses: state.courses,
        allCourses: state.allCourses,
        currentCourse: state.currentCourse,
        currentPage: state.currentPage,
        coursesPerPage: state.coursesPerPage,
        totalStudents: state.totalStudents,
        totalActiveSessions: state.totalActiveSessions,
      }),
    },
  ),
);
