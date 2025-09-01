"use client";

import { AlertCircle, CheckCircle, Copy, Download } from "lucide-react";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AttendanceResult {
  success: boolean;
  message: string;
  record?: {
    course: string;
    matric_no: string;
    receipt: string;
    session_code: string;
    status: string;
    student_name: string;
    submitted_at: string;
  };
  error?: string;
  existing_record?: {
    status: string;
    submitted_at: string;
  };
}

interface AttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AttendanceResult | null;
}

export const AttendanceModal: React.FC<AttendanceModalProps> = ({
  open,
  onOpenChange,
  result,
}) => {
  if (!result) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const takeScreenshot = () => {
    // Use html2canvas or similar screenshot functionality
    if (typeof window !== "undefined") {
      // Simple screenshot by opening print dialog and letting user save as PDF
      window.print();
    }
  };

  const isSuccess = result.success;
  const isAlreadySubmitted = result.error?.includes("already submitted");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isSuccess ? "Attendance Submitted" : "Submission Status"}
          </DialogTitle>
          <DialogDescription>
            {isSuccess
              ? "Your attendance has been successfully recorded"
              : "There was an issue with your attendance submission"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-3">
            {isSuccess ? (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900">
                <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            )}
            <div>
              <p
                className={`font-medium ${isSuccess ? "text-green-700 dark:text-green-400" : "text-orange-700 dark:text-orange-400"}`}
              >
                {isSuccess
                  ? "Success!"
                  : isAlreadySubmitted
                    ? "Already Submitted"
                    : "Failed"}
              </p>
              <p className="text-muted-foreground text-sm">
                {result.message || result.error}
              </p>
            </div>
          </div>

          {/* Success Details */}
          {isSuccess && result.record && (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg border p-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Student:</span>
                    <span className="font-medium">
                      {result.record.student_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Course:</span>
                    <span className="font-medium">{result.record.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Session:</span>
                    <span className="font-mono">
                      {result.record.session_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time:</span>
                    <span className="text-sm">
                      {formatDateTime(result.record.submitted_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Receipt ID</label>
                <div className="flex gap-2">
                  <code className="bg-muted flex-1 rounded border px-3 py-2 text-xs break-all">
                    {result.record.receipt}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.record!.receipt)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Previous Submission Info */}
          {isAlreadySubmitted && result.existing_record && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-3 dark:border-orange-800 dark:bg-orange-950">
              <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                Previous submission found
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Status: {result.existing_record.status} •{" "}
                {formatDateTime(result.existing_record.submitted_at)}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
          {isSuccess && (
            <Button
              onClick={takeScreenshot}
              className="w-full sm:w-auto"
              variant="secondary"
            >
              <Download className="mr-2 h-4 w-4" />
              Screenshot
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
