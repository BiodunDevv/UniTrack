import { create } from "zustand";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Types
interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: "teacher" | "admin";
  created_at: string;
  last_login: string;
  email_verified: boolean;
  // Admin specific fields
  is_super_admin?: boolean;
  status?: string;
  permissions?: string[];
}

interface UpdateProfileData {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ProfileState {
  // State
  profile: ProfileData | null;
  isLoading: boolean;
  error: string | null;
  updateSuccess: boolean;

  // Actions
  getProfile: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || data.error || `HTTP error! status: ${response.status}`,
    );
  }

  return data;
};

export const useProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  profile: null,
  isLoading: false,
  error: null,
  updateSuccess: false,

  // Actions
  getProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiCall<{ success: boolean; data: ProfileData }>(
        "/auth/profile",
      );
      set({
        profile: response.data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Get profile error:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to load profile",
        isLoading: false,
      });
    }
  },

  updateProfile: async (data: UpdateProfileData) => {
    set({ isLoading: true, error: null, updateSuccess: false });
    try {
      const response = await apiCall<{
        success: boolean;
        data: ProfileData;
        message: string;
      }>("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      });

      // Update profile store
      set({
        profile: response.data,
        isLoading: false,
        updateSuccess: true,
      });
    } catch (error) {
      console.error("Update profile error:", error);
      set({
        error:
          error instanceof Error ? error.message : "Failed to update profile",
        isLoading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
  clearSuccess: () => set({ updateSuccess: false }),
}));
