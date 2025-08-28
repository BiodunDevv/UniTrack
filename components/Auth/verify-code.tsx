"use client";

import { ArrowRight, LoaderIcon, RefreshCwIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { AuthLayout } from "@/components/layouts/auth-layout";
import { Button } from "@/components/ui/button";
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
    <AuthLayout
      title="Enter Verification Code"
      subtitle={`We've sent a 6-digit verification code to ${email}`}
      badgeText="Verify Email"
      showBackButton={true}
      backHref="/auth/signin"
      backText="Back to sign in"
    >
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
    </AuthLayout>
  );
}
