"use client";

import {
  ArrowRight,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import UniTrack from "@/components/logos/unitrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Glow from "@/components/ui/glow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Handle reset password logic here
    console.log("Reset password form submitted:", formData);
    setIsReset(true);
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
                Your password has been successfully reset. You can now sign in
                with your new password.
              </p>

              <Card className="animate-in slide-in-from-bottom border-border/50 bg-background/80 p-6 backdrop-blur-sm delay-200 duration-600">
                <Button asChild className="w-full" size="lg">
                  <Link href="/auth/signin">
                    Continue to Sign In
                    <ArrowRight className="ml-2 size-4" />
                  </Link>
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {/* Header */}
          <div className="animate-in fade-in mb-8 text-center duration-500">
            <Badge variant="outline" className="mb-4">
              <UniTrack className="mr-2 size-4" />
              <span className="text-muted-foreground">Reset Password</span>
            </Badge>

            <h1 className="from-foreground to-foreground/80 mb-2 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              Set New Password
            </h1>

            <p className="text-muted-foreground text-sm">
              Enter your new password below to complete the reset process
            </p>
          </div>

          {/* Form Card */}
          <Card className="animate-in slide-in-from-bottom border-border/50 bg-background/80 p-6 backdrop-blur-sm delay-100 duration-600">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  Must be at least 8 characters long
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
                        formData.password.length >= 8
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    At least 8 characters
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        /[A-Z]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    One uppercase letter
                  </li>
                  <li className="flex items-center gap-2">
                    <div
                      className={`h-1.5 w-1.5 rounded-full ${
                        /[0-9]/.test(formData.password)
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    One number
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" size="lg">
                Reset Password
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </form>
          </Card>

          {/* Additional Links */}
          <div className="animate-in fade-in mt-6 text-center delay-300 duration-500">
            <Link
              href="/auth/signin"
              className="text-muted-foreground hover:text-foreground text-sm transition-colors hover:underline"
            >
              ← Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
