"use client";

import {
  ArrowRight,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

export default function SignUpForm() {
  const router = useRouter();
  const {
    registerTeacher,
    isLoading,
    error,
    registrationToken,
    clearError,
    isAuthenticated,
    clearTokens,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // Clear any existing tokens when component mounts
  useEffect(() => {
    clearTokens();
  }, [clearTokens]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (registrationToken) {
      toast.success("Registration successful! Please verify your account.");
      router.push(
        `/auth/verify-code?email=${encodeURIComponent(formData.email)}&type=registration`,
      );
    }
  }, [registrationToken, router, formData.email]);

  useEffect(() => {
    if (error) {
      // Handle specific error for existing user
      if (error === "Teacher with this email already exists") {
        toast.info(
          "An account with this email already exists. Redirecting to sign in...",
        );
        setTimeout(() => {
          clearError();
          router.push("/auth/signin");
        }, 2000); // Redirect after 2 seconds
      } else {
        toast.error(error);
        clearError();
      }
    }
  }, [error, clearError, router]);

  // If user is already authenticated, redirect immediately
  if (isAuthenticated) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">
            You are already signed in. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (error) {
      clearError();
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      await registerTeacher({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        password: formData.password,
        role: "teacher",
      });
    } catch {
      // Error is handled by the store and useEffect
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Sign up to get started with UniTrack attendance management"
      badgeText="Join UniTrack"
      showBackButton={true}
      backHref="/"
      backText="Back to home"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Display */}
        {error && (
          <div className="animate-in slide-in-from-top border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm duration-300">
            <div className="flex items-center gap-2">
              <div className="bg-destructive h-1.5 w-1.5 rounded-full"></div>
              <span>
                {error === "Teacher with this email already exists"
                  ? "An account with this email already exists. Redirecting to sign in..."
                  : error}
              </span>
            </div>
          </div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <div className="relative">
              <UserIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="John"
                value={formData.firstName}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <div className="relative">
              <UserIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <MailIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={handleInputChange}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <LockIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="pr-10 pl-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderIcon className="mr-2 size-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Footer */}
      <div className="mt-6 text-center">
        <p className="text-muted-foreground text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
