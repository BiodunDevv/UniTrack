"use client";

import {
  ArrowRight,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  LockIcon,
  MailIcon,
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

export default function SignInForm() {
  const router = useRouter();
  const {
    login,
    isLoading,
    error,
    isAuthenticated,
    verificationToken,
    clearError,
    clearTokens,
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    clearTokens();
  }, [clearTokens]);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (verificationToken) {
      router.push(
        `/auth/verify-code?email=${encodeURIComponent(formData.email)}&type=login`,
      );
    }
  }, [verificationToken, router, formData.email]);

  useEffect(() => {
    if (error) {
      if (error === "Email not verified") {
        toast.info(
          "Please verify your email to continue. A new verification code has been sent.",
        );
      }
    }
  }, [error]);

  // If user is already authenticated, redirect immediately
  if (isAuthenticated) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
          <p className="text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    // Clear error when user starts typing
    if (error) {
      clearError();
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await login(formData.email, formData.password);
      // Don't redirect here - let the useEffect handle it based on the response
    } catch (error: unknown) {
      // Error handling is now done in useEffect to properly handle verification scenarios
      console.log("Login error:", error);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access your UniTrack attendance dashboard"
      badgeText="Welcome Back"
      showBackButton={true}
      backHref="/"
      backText="Back to home"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Error Display */}
        {error && error !== "Email not verified" && (
          <div className="animate-in slide-in-from-top border-destructive/20 bg-destructive/10 text-destructive rounded-lg border p-3 text-sm duration-100">
            <div className="flex items-center gap-2">
              <div className="bg-destructive h-1.5 w-1.5 rounded-full"></div>
              <span>
                {error === "Invalid credentials"
                  ? "Username or password incorrect. Please try again."
                  : error}
              </span>
            </div>
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/auth/forgot-password"
              className="text-primary hover:text-primary/80 text-sm transition-colors hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center">
        <div className="border-border flex-1 border-t"></div>
        <span className="text-muted-foreground bg-background rounded-full px-4 text-sm">
          or
        </span>
        <div className="border-border flex-1 border-t"></div>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
