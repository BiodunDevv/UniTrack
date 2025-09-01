import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { useCourseStore } from "./course-store";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

// Function to get auth token from localStorage
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
interface Teacher {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  _id: string;
  course_code: string;
  title: string;
  level?: number;
  created_at: string;
  student_count: number;
  teacher?: Teacher;
}

interface Student {
  _id: string;
  matric_no: string;
  name: string;
  email: string;
  added_by?: Teacher;
  added_at?: string;
}

interface ShareRequest {
  _id: string;
  requester_id: string | Teacher;
  target_teacher_id: Teacher;
  course_id: Course;
  target_course_id: Course;
  student_ids: Student[];
  message: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  expires_at: string;
  created_at: string;
  response_message?: string;
  createdAt: string;
  updatedAt: string;
}

interface TeacherCoursesResponse {
  courses: Course[];
  total: number;
  teacher: Teacher;
  is_own_courses: boolean;
}

interface StudentListResponse {
  course: Course & { teacher_name: string };
  students: Student[];
  total: number;
}

interface RequestsResponse {
  requests: ShareRequest[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_requests: number;
    per_page: number;
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Store State
interface StudentShareState {
  // Data
  teachers: Teacher[];
  myCourses: Course[];
  teacherCourses: Course[];
  selectedTeacher: Teacher | null;
  selectedCourse: Course | null;
  students: Student[];
  incomingRequests: ShareRequest[];
  outgoingRequests: ShareRequest[];

  // UI State
  isLoading: boolean;
  isLoadingTeachers: boolean;
  isLoadingCourses: boolean;
  isLoadingStudents: boolean;
  isLoadingRequests: boolean;
  error: string | null;

  // Pagination
  incomingPagination: RequestsResponse["pagination"] | null;
  outgoingPagination: RequestsResponse["pagination"] | null;

  // Summary stats
  summary: {
    pending_incoming: number;
    pending_outgoing: number;
    total_incoming: number;
    total_outgoing: number;
  } | null;

  // Actions
  getTeachers: () => Promise<void>;
  getMyCourses: () => Promise<void>;
  getTeacherCourses: (teacherId: string) => Promise<void>;
  getTeacherStudents: (teacherId: string, courseId: string) => Promise<void>;
  requestStudents: (data: {
    target_teacher_id: string;
    target_course_id: string;
    my_course_id: string;
    student_ids: string[];
    message: string;
  }) => Promise<ShareRequest>;
  getIncomingRequests: (
    status?: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  getOutgoingRequests: (
    status?: string,
    page?: number,
    limit?: number,
  ) => Promise<void>;
  respondToRequest: (
    requestId: string,
    action: "approve" | "reject",
    message?: string,
  ) => Promise<void>;
  cancelRequest: (requestId: string) => Promise<void>;
  clearError: () => void;
  clearTeacherData: () => void;
}

// Helper function for API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
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

export const useStudentShareStore = create<StudentShareState>()(
  persist(
    (set, get) => ({
      // Initial State
      teachers: [],
      myCourses: [],
      teacherCourses: [],
      selectedTeacher: null,
      selectedCourse: null,
      students: [],
      incomingRequests: [],
      outgoingRequests: [],
      isLoading: false,
      isLoadingTeachers: false,
      isLoadingCourses: false,
      isLoadingStudents: false,
      isLoadingRequests: false,
      error: null,
      incomingPagination: null,
      outgoingPagination: null,
      summary: null,

      // Actions
      getTeachers: async () => {
        set({ isLoadingTeachers: true, error: null });
        try {
          const response = await apiCall<{
            teachers: Teacher[];
            total: number;
          }>("/student-sharing/teachers");
          set({
            teachers: response.teachers || [],
            isLoadingTeachers: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch teachers",
            isLoadingTeachers: false,
          });
        }
      },

      getMyCourses: async () => {
        set({ isLoadingCourses: true, error: null });
        try {
          // Use the course store to get all courses owned by the current user
          const courseStore = useCourseStore.getState();
          await courseStore.getAllCourses();

          // Get the courses from the course store
          const allCourses = courseStore.courses || [];

          // Transform the courses to match our interface
          const transformedCourses = allCourses.map((course) => ({
            _id: course._id,
            course_code: course.course_code,
            title: course.title,
            level: course.level,
            created_at: course.created_at,
            student_count: course.student_count || 0,
            teacher: course.teacher_id
              ? {
                  _id: course.teacher_id._id,
                  name: course.teacher_id.name,
                  email: course.teacher_id.email,
                }
              : undefined,
          }));

          set({
            myCourses: transformedCourses,
            isLoadingCourses: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch courses",
            isLoadingCourses: false,
          });
        }
      },

      getTeacherCourses: async (teacherId: string) => {
        set({ isLoadingCourses: true, error: null });
        try {
          const response = await apiCall<TeacherCoursesResponse>(
            `/student-sharing/my-courses?teacher_id=${teacherId}`,
          );
          set({
            teacherCourses: response.courses || [],
            selectedTeacher: response.teacher || null,
            isLoadingCourses: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch teacher courses",
            isLoadingCourses: false,
          });
        }
      },

      getTeacherStudents: async (teacherId: string, courseId: string) => {
        set({ isLoadingStudents: true, error: null });
        try {
          const response = await apiCall<StudentListResponse>(
            `/student-sharing/teachers/${teacherId}/courses/${courseId}/students`,
          );
          set({
            students: response.students || [],
            selectedCourse: response.course || null,
            isLoadingStudents: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch students",
            isLoadingStudents: false,
          });
        }
      },

      requestStudents: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall<{
            message: string;
            request: ShareRequest;
          }>("/student-sharing/request", {
            method: "POST",
            body: JSON.stringify(data),
          });
          set({ isLoading: false });

          // Refresh outgoing requests
          get().getOutgoingRequests();

          return response.request;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to send request",
            isLoading: false,
          });
          throw error;
        }
      },

      getIncomingRequests: async (status = "pending", page = 1, limit = 10) => {
        set({ isLoadingRequests: true, error: null });
        try {
          const params = new URLSearchParams({
            status,
            page: page.toString(),
            limit: limit.toString(),
          });

          const response = await apiCall<RequestsResponse>(
            `/student-sharing/incoming?${params.toString()}`,
          );

          set({
            incomingRequests: response.requests || [],
            incomingPagination: response.pagination || null,
            isLoadingRequests: false,
          });

          // Update summary stats
          const currentSummary = get().summary || {
            pending_incoming: 0,
            pending_outgoing: 0,
            total_incoming: 0,
            total_outgoing: 0,
          };

          set({
            summary: {
              ...currentSummary,
              pending_incoming:
                status === "pending"
                  ? response.pagination?.total_requests || 0
                  : currentSummary.pending_incoming,
              total_incoming: response.pagination?.total_requests || 0,
            },
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch incoming requests",
            isLoadingRequests: false,
          });
        }
      },

      getOutgoingRequests: async (status = "all", page = 1, limit = 10) => {
        set({ isLoadingRequests: true, error: null });
        try {
          const params = new URLSearchParams({
            status,
            page: page.toString(),
            limit: limit.toString(),
          });

          const response = await apiCall<RequestsResponse>(
            `/student-sharing/outgoing?${params.toString()}`,
          );

          set({
            outgoingRequests: response.requests || [],
            outgoingPagination: response.pagination || null,
            isLoadingRequests: false,
          });

          // Update summary stats
          const currentSummary = get().summary || {
            pending_incoming: 0,
            pending_outgoing: 0,
            total_incoming: 0,
            total_outgoing: 0,
          };

          const pendingCount =
            response.requests?.filter(
              (req: ShareRequest) => req.status === "pending",
            ).length || 0;

          set({
            summary: {
              ...currentSummary,
              pending_outgoing: pendingCount,
              total_outgoing: response.pagination?.total_requests || 0,
            },
          });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch outgoing requests",
            isLoadingRequests: false,
          });
        }
      },

      respondToRequest: async (
        requestId: string,
        action: "approve" | "reject",
        message = "",
      ) => {
        set({ isLoading: true, error: null });
        try {
          await apiCall(`/student-sharing/${requestId}/respond`, {
            method: "PATCH",
            body: JSON.stringify({
              action,
              response_message: message,
            }),
          });

          set({ isLoading: false });

          // Refresh incoming requests
          get().getIncomingRequests();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : `Failed to ${action} request`,
            isLoading: false,
          });
          throw error;
        }
      },

      cancelRequest: async (requestId: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiCall(`/student-sharing/${requestId}/cancel`, {
            method: "PATCH",
          });

          set({ isLoading: false });

          // Refresh outgoing requests
          get().getOutgoingRequests();
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to cancel request",
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      clearTeacherData: () =>
        set({
          teacherCourses: [],
          selectedTeacher: null,
          selectedCourse: null,
          students: [],
        }),
    }),
    {
      name: "student-share-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist non-sensitive data
        summary: state.summary,
      }),
    },
  ),
);

// Export types for use in components
export type { ShareRequest, Teacher, Course, Student };
