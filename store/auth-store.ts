import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL + "/auth" ||
  "http://localhost:5000/auth";

// Types
interface User {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "admin";
  isVerified: boolean;
}

interface AuthState {
  // State
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  registrationToken: string | null;
  verificationToken: string | null;
  isAuthenticated: boolean;

  // Actions
  registerTeacher: (data: RegisterTeacherData) => Promise<void>;
  verifyRegistration: (registrationToken: string, otp: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  requestVerificationCode: (
    email: string,
    verificationToken?: string,
  ) => Promise<void>;
  verifyEmail: (verificationToken: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordResetOTP: (email: string) => Promise<void>;
  verifyOTPAndResetPassword: (
    email: string,
    otp: string,
    newPassword: string,
  ) => Promise<void>;
  clearError: () => void;
  clearTokens: () => void;
  setLoading: (loading: boolean) => void;
}

interface RegisterTeacherData {
  name: string;
  email: string;
  password: string;
  role: "teacher";
}

interface ApiResponse<T = any> {
  message: string;
  data?: T;
  user?: User;
  token?: string;
  registrationToken?: string;
  verificationToken?: string;
  userType?: string;
  success?: boolean; // Optional for backward compatibility
}

// Helper function to check if API response indicates success
const isSuccessResponse = (response: ApiResponse): boolean => {
  return (
    response.success === true ||
    response.message?.toLowerCase().includes("success") ||
    response.message?.toLowerCase().includes("successful") ||
    response.message?.toLowerCase().includes("otp has been sent") ||
    response.message?.toLowerCase().includes("if the email exists") ||
    Boolean(response.token) ||
    Boolean(response.registrationToken) ||
    Boolean(response.verificationToken)
  );
};

// Helper function for API calls
const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> => {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state - set loading to true until hydration completes
      user: null,
      token: null,
      isLoading: true,
      error: null,
      registrationToken: null,
      verificationToken: null,
      isAuthenticated: false,

      // Actions
      registerTeacher: async (data: RegisterTeacherData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/register_teacher", {
            method: "POST",
            body: JSON.stringify(data),
          });

          // Check for success based on message or presence of registration token
          if (
            response.registrationToken ||
            response.message?.includes("success")
          ) {
            set({
              registrationToken: response.registrationToken,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Registration failed");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Registration failed",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyRegistration: async (registrationToken: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/verify_registration", {
            method: "POST",
            body: JSON.stringify({ registrationToken, otp }),
          });

          if (isSuccessResponse(response)) {
            set({
              registrationToken: null,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Verification failed");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
          });
          console.log("Login response:", response);

          // Check if login was successful
          if (isSuccessResponse(response) && response.token && response.user) {
            // User is verified and logged in
            set({
              user: response.user,
              token: response.token,
              isAuthenticated: true,
              isLoading: false,
            });
          } else if (response.verificationToken) {
            // User needs email verification
            set({
              verificationToken: response.verificationToken,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || "Login failed");
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "Login failed",
            isLoading: false,
          });
          throw error;
        }
      },

      requestVerificationCode: async (
        email: string,
        verificationToken?: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/request_verification_code", {
            method: "POST",
            body: JSON.stringify({
              email,
              verificationToken: verificationToken || get().verificationToken,
            }),
          });

          if (isSuccessResponse(response)) {
            set({
              verificationToken:
                response.verificationToken || get().verificationToken,
              isLoading: false,
            });
          } else {
            throw new Error(
              response.message || "Failed to request verification code",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to request verification code",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyEmail: async (verificationToken: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/verify_email", {
            method: "POST",
            body: JSON.stringify({ verificationToken, otp }),
          });

          if (isSuccessResponse(response)) {
            if (response.token && response.user) {
              set({
                user: response.user,
                token: response.token,
                isAuthenticated: true,
                verificationToken: null,
                isLoading: false,
              });
            } else {
              set({
                verificationToken: null,
                isLoading: false,
              });
            }
          } else {
            throw new Error(response.message || "Email verification failed");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Email verification failed",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true, error: null });
        try {
          const token = get().token;
          if (token) {
            await apiCall("/logout", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            registrationToken: null,
            verificationToken: null,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          // Even if logout fails on server, clear local state
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            registrationToken: null,
            verificationToken: null,
            isLoading: false,
            error: null,
          });
        }
      },

      requestPasswordResetOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/request_otp", {
            method: "POST",
            body: JSON.stringify({ email, purpose: "password_reset" }),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
          } else {
            throw new Error(
              response.message || "Failed to request password reset",
            );
          }
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to request password reset",
            isLoading: false,
          });
          throw error;
        }
      },

      verifyOTPAndResetPassword: async (
        email: string,
        otp: string,
        newPassword: string,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiCall("/verify_otp", {
            method: "POST",
            body: JSON.stringify({
              email,
              otp,
              purpose: "password_reset",
              newPassword,
            }),
          });

          if (isSuccessResponse(response)) {
            set({ isLoading: false });
          } else {
            throw new Error(response.message || "Password reset failed");
          }
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Password reset failed",
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      clearTokens: () =>
        set({
          registrationToken: null,
          verificationToken: null,
        }),

      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        // Don't persist isAuthenticated - compute it from user and token
      }),
      onRehydrateStorage: () => (state) => {
        // When store is rehydrated, compute isAuthenticated from persisted data
        if (state) {
          state.isAuthenticated = Boolean(state.user && state.token);
          state.isLoading = false;
        }
      },
    },
  ),
);

// Export types for use in components
export type { User, RegisterTeacherData };
