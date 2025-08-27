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

import UniTrack from "@/components/logos/unitrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Glow from "@/components/ui/glow";
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
  } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Welcome back!");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (verificationToken) {
      toast.info("Please verify your email to continue");
      router.push(
        `/auth/verify-code?email=${encodeURIComponent(formData.email)}`,
      );
    }
  }, [verificationToken, router, formData.email]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

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
      router.push("/dashboard");
    } catch {
      // Error is handled by the store and useEffect
    }
  };

  return (
    <div className="bg-background relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Background Glow Effect - positioned at bottom behind everything */}
      <div className="absolute right-0 bottom-0 left-0 z-0">
        <Glow
          variant="top"
          className="animate-appear-zoom opacity-0 delay-1000"
        />
      </div>

      {/* Content Container */}
      <div className="relative z-20 w-full max-w-full">
        <div className="mx-auto w-full max-w-md">
          {/* Header */}
          <div className="animate-in fade-in mb-8 text-center duration-500">
            <Badge variant="outline" className="mb-4">
              <UniTrack className="mr-2 size-4" />
              <span className="text-muted-foreground">Welcome Back</span>
            </Badge>

            <h1 className="from-foreground to-foreground/80 mb-2 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              Sign In
            </h1>

            <p className="text-muted-foreground text-sm">
              Access your UniTrack attendance dashboard
            </p>
          </div>

          {/* Form Card */}
          <Card className="animate-in slide-in-from-bottom border-border/50 bg-background/80 p-6 backdrop-blur-sm delay-100 duration-600">
            <form onSubmit={handleSubmit} className="space-y-4">
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

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="text-primary focus:ring-primary h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="rememberMe" className="text-sm">
                  Remember me for 30 days
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isLoading}
              >
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
              <span className="text-muted-foreground bg-background px-4 text-sm">
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
          </Card>

          {/* Additional Links */}
          <div className="animate-in fade-in mt-6 text-center delay-300 duration-500">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
