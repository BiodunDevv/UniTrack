"use client";

import { AlertCircle, CheckCircle, Copy, X } from "lucide-react";
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
      <DialogContent className="w-[95vw] max-w-md sm:w-full sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {isSuccess ? "Attendance Submitted" : "Submission Status"}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 p-2">
          {/* Header */}
          <div className="text-center">
            {isSuccess ? (
              <div className="space-y-3">
                <CheckCircle className="mx-auto h-16 w-16 text-green-500 sm:h-20 sm:w-20" />
                <h2 className="text-xl font-bold text-green-700 sm:text-2xl">
                  Attendance Submitted Successfully!
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {result.message}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <AlertCircle className="mx-auto h-16 w-16 text-orange-500 sm:h-20 sm:w-20" />
                <h2 className="text-xl font-bold text-orange-700 sm:text-2xl">
                  {isAlreadySubmitted
                    ? "Attendance Already Submitted"
                    : isDeviceUsed
                      ? "Device Already Used"
                      : "Submission Failed"}
                </h2>
                <p className="text-muted-foreground text-sm sm:text-base">
                  {result.error}
                </p>
              </div>
            )}
          </div>

          {/* Success Details */}
          {isSuccess && result.record && (
            <div className="space-y-4">
              <div className="bg-muted/50 space-y-4 rounded-lg p-4 sm:p-6">
                <div className="grid grid-cols-1 gap-3 text-sm sm:text-base">
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Student:
                    </span>
                    <span className="text-right font-semibold">
                      {result.record.student_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Matric No:
                    </span>
                    <span className="text-right font-mono">
                      {result.record.matric_no}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Course:
                    </span>
                    <span className="text-right font-semibold">
                      {result.record.course}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Session Code:
                    </span>
                    <span className="text-right font-mono">
                      {result.record.session_code}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Status:
                    </span>
                    <span className="text-right font-semibold text-green-600 capitalize">
                      {result.record.status}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                    <span className="text-muted-foreground font-medium">
                      Submitted:
                    </span>
                    <span className="text-right text-sm">
                      {formatDateTime(result.record.submitted_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Receipt */}
              <div className="space-y-3">
                <label className="text-sm font-semibold sm:text-base">
                  Receipt ID:
                </label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <code className="bg-muted flex-1 rounded-lg px-3 py-2 text-xs break-all sm:text-sm">
                    {result.record.receipt}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(result.record!.receipt)}
                    className="w-full sm:w-auto"
                  >
                    <Copy className="mr-2 h-3 w-3 sm:mr-1" />
                    <span className="sm:hidden">Copy Receipt</span>
                    <span className="hidden sm:inline">Copy</span>
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs sm:text-sm">
                  Save this receipt ID for your records
                </p>
              </div>
            </div>
          )}

          {/* Error Details for Already Submitted */}
          {isAlreadySubmitted && result.existing_record && (
            <div className="space-y-3 rounded-lg border border-orange-200 bg-orange-50 p-4 sm:p-6 dark:border-orange-800 dark:bg-orange-950">
              <h3 className="font-semibold text-orange-800 sm:text-lg dark:text-orange-200">
                Previous Submission Found
              </h3>
              <div className="space-y-2 text-sm text-orange-700 sm:text-base dark:text-orange-300">
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium">Status:</span>
                  <span className="font-semibold capitalize">
                    {result.existing_record.status}
                  </span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                  <span className="font-medium">Submitted:</span>
                  <span className="text-sm">
                    {formatDateTime(result.existing_record.submitted_at)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Device Error Details */}
          {isDeviceUsed && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 sm:p-6 dark:border-red-800 dark:bg-red-950">
              <p className="text-sm text-red-700 sm:text-base dark:text-red-300">
                This device has already been used for attendance in this
                session. Each student must use their own device for security
                purposes.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full transition-transform duration-200 hover:scale-105 sm:w-auto sm:min-w-[120px]"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
