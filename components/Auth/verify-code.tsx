"use client";

import { ArrowRight, LoaderIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import UniTrack from "@/components/logos/unitrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Glow from "@/components/ui/glow";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";

export default function VerifyCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "login"; // 'registration' or 'login'

  const {
    verifyRegistration,
    verifyEmail,
    requestVerificationCode,
    isLoading,
    error,
    isAuthenticated,
    registrationToken,
    verificationToken,
    clearError,
  } = useAuthStore();

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isResending, setIsResending] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      toast.success("Email verified successfully!");
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleInputChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    const newCode = pastedData.split("").concat(Array(6).fill("")).slice(0, 6);
    setCode(newCode);

    // Focus the next empty input or the last input
    const nextEmptyIndex = newCode.findIndex((digit) => !digit);
    const targetIndex = nextEmptyIndex === -1 ? 5 : nextEmptyIndex;
    inputRefs.current[targetIndex]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const verificationCode = code.join("");

    if (verificationCode.length !== 6) {
      toast.error("Please enter the complete 6-digit code");
      return;
    }

    try {
      if (type === "registration" && registrationToken) {
        await verifyRegistration(registrationToken, verificationCode);
        toast.success("Registration verified! Please sign in.");
        router.push("/auth/signin");
      } else if (verificationToken) {
        await verifyEmail(verificationToken, verificationCode);
      } else {
        toast.error("Verification token not found. Please try again.");
      }
    } catch {
      // Error is handled by the store and useEffect
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email not found. Please go back and try again.");
      return;
    }

    setIsResending(true);
    try {
      await requestVerificationCode(email, verificationToken || undefined);
      toast.success("Verification code sent!");
      setTimeLeft(60);
      setCanResend(false);
      setCode(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } catch {
      // Error is handled by the store and useEffect
    } finally {
      setIsResending(false);
    }
  };

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
              <span className="text-muted-foreground">Verify Email</span>
            </Badge>

            <h1 className="from-foreground to-foreground/80 mb-2 bg-gradient-to-r bg-clip-text text-2xl font-bold text-transparent sm:text-3xl">
              Enter Verification Code
            </h1>

            <p className="text-muted-foreground text-sm">
              We&apos;ve sent a 6-digit verification code to{" "}
              <span className="text-foreground font-medium">{email}</span>
            </p>
          </div>

          {/* Form Card */}
          <Card className="animate-in slide-in-from-bottom border-border/50 bg-background/80 p-6 backdrop-blur-sm delay-100 duration-600">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Verification Code Input */}
              <div className="space-y-4">
                <div className="flex justify-center gap-3">
                  {code.map((digit, index) => (
                    <Input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="h-12 w-12 text-center text-lg font-semibold"
                      required
                    />
                  ))}
                </div>

                <p className="text-muted-foreground text-center text-xs">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={code.some((digit) => !digit) || isLoading}
              >
                {isLoading ? (
                  <>
                    <LoaderIcon className="mr-2 size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify Code
                    <ArrowRight className="ml-2 size-4" />
                  </>
                )}
              </Button>
            </form>

            {/* Resend Section */}
            <div className="mt-6 text-center">
              <p className="text-muted-foreground mb-3 text-sm">
                Didn&apos;t receive the code?
              </p>

              {canResend ? (
                <Button
                  variant="outline"
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full"
                >
                  {isResending ? (
                    <>
                      <RefreshCwIcon className="mr-2 size-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      <RefreshCwIcon className="mr-2 size-4" />
                      Resend Code
                    </>
                  )}
                </Button>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Resend available in{" "}
                  <span className="text-primary font-medium">{timeLeft}s</span>
                </p>
              )}
            </div>
          </Card>

          {/* Additional Links */}
          <div className="animate-in fade-in mt-6 space-y-2 text-center delay-300 duration-500">
            <Link
              href="/auth/signin"
              className="text-muted-foreground hover:text-foreground block text-sm transition-colors hover:underline"
            >
              ← Back to sign in
            </Link>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground block text-sm transition-colors hover:underline"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
