"use client";

import {
  ArrowRight,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LoaderIcon,
  LockIcon,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/layouts/auth-layout";
import UniTrack from "@/components/logos/unitrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Glow from "@/components/ui/glow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/auth-store";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const { verifyOTPAndResetPassword, isLoading, error, clearError } =
    useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [formData, setFormData] = useState({
    otp: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.otp || !formData.password || !formData.confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      toast.error("Password must contain at least one number");
      return;
    }

    if (!email) {
      toast.error("Email not found. Please go back and try again.");
      return;
    }

    try {
      await verifyOTPAndResetPassword(email, formData.otp, formData.password);
      setIsReset(true);
      toast.success("Password reset successfully!");
      // Auto-redirect to sign in after 3 seconds
      setTimeout(() => {
        router.push("/auth/signin");
      }, 3000);
    } catch {
      // Error is handled by the store and useEffect
    }
  };

  if (isReset) {
    return (
      <div className="bg-background relative flex h-screen items-center justify-center overflow-hidden p-4">
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
            {/* Success Message */}
            <div className="animate-in fade-in text-center duration-500">
              <Badge variant="outline" className="mb-6">
                <UniTrack className="mr-2 size-4" />
                <span className="text-muted-foreground">Success</span>
              </Badge>

              <div className="animate-in zoom-in mb-6 delay-100 duration-700">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                  <CheckCircleIcon className="size-8" />
                </div>
              </div>

              <h1 className="from-foreground to-foreground/80 mb-4 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                Password Reset Successful
              </h1>

              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                Your password has been successfully reset. You will be
                automatically redirected to sign in, or click the button below.
              </p>

              <Card className="animate-in slide-in-from-bottom border-border/50 bg-background/80 p-6 backdrop-blur-sm delay-200 duration-600">
                <div className="space-y-4">
                  <div className="flex items-center justify-center py-2">
                    <LoaderIcon className="text-primary mr-2 h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Redirecting in 3 seconds...
                    </span>
                  </div>
                  <Button asChild className="w-full" size="lg">
                    <Link href="/auth/signin">
                      Continue to Sign In
                      <ArrowRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthLayout
      title="Set New Password"
      subtitle={`Enter the 6-digit code sent to ${email} and your new password`}
      badgeText="Reset Password"
      showBackButton={true}
      backHref="/auth/forgot-password"
      backText="Back to forgot password"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* OTP Field */}
        <div className="space-y-2">
          <Label htmlFor="otp">Verification Code</Label>
          <Input
            id="otp"
            name="otp"
            type="text"
            placeholder="Enter 6-digit code"
            value={formData.otp}
            onChange={handleInputChange}
            maxLength={6}
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <LockIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
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
          <p className="text-muted-foreground text-xs">
            Must be at least 8 characters with at least one number
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <LockIcon className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="pr-10 pl-10"
              required
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-1/2 right-1 h-8 w-8 -translate-y-1/2 p-0"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? (
                <EyeOffIcon className="size-4" />
              ) : (
                <EyeIcon className="size-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Password Requirements */}
        <div className="border-border bg-muted/50 rounded-lg border p-3">
          <p className="text-muted-foreground mb-2 text-xs font-medium">
            Password must contain:
          </p>
          <ul className="text-muted-foreground space-y-1 text-xs">
            <li className="flex items-center gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  formData.password.length >= 8 ? "bg-green-500" : "bg-gray-300"
                }`}
              />
              At least 8 characters
            </li>
            <li className="flex items-center gap-2">
              <div
                className={`h-1.5 w-1.5 rounded-full ${
                  /[0-9]/.test(formData.password)
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              />
              At least one number
            </li>
          </ul>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? (
            <>
              <LoaderIcon className="mr-2 size-4 animate-spin" />
              Resetting Password...
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight className="ml-2 size-4" />
            </>
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
