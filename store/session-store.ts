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
interface SessionStats {
  total_attendance: number;
  unique_students: number;
  is_currently_active: boolean;
  duration_minutes: number;
  time_remaining: number;
}

interface Session {
  _id: string;
  course_id: {
    _id: string;
    course_code: string;
    title: string;
    level: number;
  };
  teacher_id: string;
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
  stats: SessionStats;
}

interface SessionPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
}

interface SessionSummary {
  total_sessions: number;
  active_sessions: number;
  expired_sessions: number;
}

interface SessionApiResponse {
  success: boolean;
  data: {
    sessions: Session[];
    pagination: SessionPagination;
    summary: SessionSummary;
  };
  message?: string;
}

interface SessionState {
  // State
  sessions: Session[];
  currentSession: Session | null;
  pagination: SessionPagination | null;
  summary: SessionSummary | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getAllSessions: (
    page?: number,
    limit?: number,
    status?: string,
    courseId?: string,
    search?: string,
  ) => Promise<void>;
  getSessionDetails: (sessionId: string) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentSession: (session: Session | null) => void;
}

// Helper function to check for success response
const isSuccessResponse = (response: SessionApiResponse): boolean => {
  return response.success === true && Boolean(response.data);
};

// Helper function for API calls with authentication
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
      errorData.message || `HTTP error! status: ${response.status}`,
    );
  }

  return response.json();
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial State
      sessions: [],
      currentSession: null,
      pagination: null,
      summary: null,
      isLoading: false,
      error: null,

      // Actions
      getAllSessions: async (
        page = 1,
        limit = 20,
        status,
        courseId,
        search,
      ) => {
        set({ isLoading: true, error: null });
        try {
          // Build query parameters
          const params = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
          });

          if (status && status !== "all") {
            params.append("status", status);
          }
          if (courseId) {
            params.append("course_id", courseId);
          }
          if (search) {
            params.append("search", search);
          }

          const response = await apiCall<SessionApiResponse>(
            `/sessions/lecturer/all?${params.toString()}`,
          );

          console.log("Fetched sessions:", response);

          if (isSuccessResponse(response)) {
            set({
              sessions: response.data.sessions || [],
              pagination: response.data.pagination || null,
              summary: response.data.summary || null,
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
          const response = await apiCall<{
            success: boolean;
            data: Session;
            message?: string;
          }>(`/sessions/lecturer/${sessionId}/details`);

          console.log("Session details:", response);

          if (response.success && response.data) {
            set({
              currentSession: response.data,
              isLoading: false,
            });
          } else {
            throw new Error(
              response.message || "Failed to fetch session details",
            );
          }
        } catch (error) {
          console.error("getSessionDetails error:", error);
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

      // Utility Actions
      clearError: () => set({ error: null }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setCurrentSession: (session: Session | null) =>
        set({ currentSession: session }),
    }),
    {
      name: "session-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        currentSession: state.currentSession,
        pagination: state.pagination,
        summary: state.summary,
      }),
    },
  ),
);
