"use client";

import { ArrowLeft, ArrowRight, MailIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import UniTrack from "@/components/logos/unitrack";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Glow from "@/components/ui/glow";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle forgot password logic here
    console.log("Forgot password form submitted:", email);
    setIsSubmitted(true);
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
                We&apos;ve sent a password reset link to{" "}
                <span className="text-foreground font-medium">{email}</span>.
                Click the link in the email to reset your password.
              </p>

              <Card className="animate-in slide-in-from-bottom border-border/50 bg-background/80 p-6 backdrop-blur-sm delay-200 duration-600">
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Didn&apos;t receive the email? Check your spam folder or try
                    again.
                  </p>

                  <Button
                    onClick={() => setIsSubmitted(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Try Different Email
                  </Button>

                  <Button asChild className="w-full">
                    <Link href="/auth/signin">
                      <ArrowLeft className="mr-2 size-4" />
                      Back to Sign In
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
              <Button type="submit" className="w-full" size="lg">
                Send Reset Link
                <ArrowRight className="ml-2 size-4" />
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
