"use client";

import { AlertCircle, CheckCircle, Copy, PrinterIcon } from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
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
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const isSuccess = result.success;
  const isAlreadySubmitted = result.error?.includes("already submitted");
  const isDeviceUsed = result.error?.includes("device has already been used");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-center">
            {isSuccess ? "Attendance Submitted" : "Submission Status"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Header */}
          <div className="text-center">
            {isSuccess ? (
              <div className="space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">
                    Success!
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {result.message}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
                  <AlertCircle className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">
                    {isAlreadySubmitted
                      ? "Already Submitted"
                      : isDeviceUsed
                        ? "Device Already Used"
                        : "Submission Failed"}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {result.error}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Success Details */}
          {isSuccess && result.record && (
            <div className="space-y-4">
              <div className="bg-muted/50 space-y-4 rounded-lg p-4">
                <h4 className="text-sm font-medium">Submission Details</h4>
                <div className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Student:
                    </span>
                    <span className="font-semibold">
                      {result.record.student_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Matric No:
                    </span>
                    <span className="font-mono">{result.record.matric_no}</span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Course:
                    </span>
                    <span className="font-semibold">
                      {result.record.course}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Session Code:
                    </span>
                    <span className="font-mono">
                      {result.record.session_code}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Status:
                    </span>
                    <span className="font-semibold text-green-600 capitalize">
                      {result.record.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Submitted:
                    </span>
                    <span className="text-sm">
                      {formatDateTime(result.record.submitted_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt Section */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Receipt ID</h4>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <code className="bg-muted flex-1 rounded px-3 py-2 text-xs break-all">
                    {result.record.receipt}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.record!.receipt)}
                    className="shrink-0"
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    Copy
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  Save this receipt ID for your records
                </p>
              </div>
            </div>
          )}

          {/* Error Details for Already Submitted */}
          {isAlreadySubmitted && result.existing_record && (
            <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
              <h4 className="font-medium text-orange-800 dark:text-orange-200">
                Previous Submission Found
              </h4>
              <div className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span>Status:</span>
                  <span className="font-medium capitalize">
                    {result.existing_record.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span>Submitted:</span>
                  <span>
                    {formatDateTime(result.existing_record.submitted_at)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Device Error Details */}
          {isDeviceUsed && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
              <p className="text-sm text-red-700 dark:text-red-300">
                This device has already been used for attendance in this
                session. Each student must use their own device for security
                purposes.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto sm:flex-1"
              variant={isSuccess ? "default" : "outline"}
            >
              {isSuccess ? "Continue" : "Close"}
            </Button>
            {isSuccess && (
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="w-full sm:w-auto sm:flex-1"
              >
                <PrinterIcon className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
