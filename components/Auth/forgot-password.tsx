"use client";

import { ArrowRight, LoaderIcon, MailIcon } from "lucide-react";
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

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { requestPasswordResetOTP, isLoading, error, clearError } =
    useAuthStore();

  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      await requestPasswordResetOTP(email);
      setIsSubmitted(true);
      toast.success("OTP sent successfully!");
      // Auto-navigate to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (error: unknown) {
      // Check if the error message is actually a success message
      const errorMessage = (error as { message?: string })?.message || "";
      if (
        errorMessage.toLowerCase().includes("otp has been sent") ||
        errorMessage.toLowerCase().includes("if the email exists")
      ) {
        // This is actually a success response
        setIsSubmitted(true);
        toast.success("OTP sent successfully!");
        setTimeout(() => {
          router.push(
            `/auth/reset-password?email=${encodeURIComponent(email)}`,
          );
        }, 2000);
      }
      // Otherwise let the useEffect handle the error display
    }
  };

  if (isSubmitted) {
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
                <span className="text-muted-foreground">Email Sent</span>
              </Badge>

              <div className="animate-in zoom-in mb-6 delay-100 duration-700">
                <div className="bg-primary/20 text-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  <MailIcon className="size-8" />
                </div>
              </div>

              <h1 className="from-foreground to-foreground/80 mb-4 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
                Check Your Email
              </h1>

              <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                If the email exists, a 6-digit reset code has been sent to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                You will be redirected to enter the code shortly.
              </p>

              <Card className="animate-in slide-in-from-bottom border-border/50 bg-background/80 p-6 backdrop-blur-sm delay-200 duration-600">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Redirecting you to enter the reset code...
                  </p>

                  <div className="flex items-center justify-center py-4">
                    <LoaderIcon className="text-primary h-6 w-6 animate-spin" />
                  </div>

                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Try Different Email
                  </Button>

                  <Button asChild className="w-full">
                    <Link
                      href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
                    >
                      Continue to Reset Password
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
              Forgot Password?
            </h1>

            <p className="text-muted-foreground text-sm">
              Enter your email address and we&apos;ll send you a link to reset
              your password
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
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
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
                    Sending Code...
                  </>
                ) : (
                  <>
                    Send Reset Code
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground text-sm">
                Remember your password?{" "}
                <Link
                  href="/auth/signin"
                  className="text-primary hover:text-primary/80 font-medium transition-colors hover:underline"
                >
                  Sign in
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
