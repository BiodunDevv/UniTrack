"use client";

import {  Clock, Loader2, User, UserCheck, Users } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { Label } from "./label";
import { Textarea } from "./textarea";

interface Student {
  _id: string;
  name: string;
  email: string;
  matric_no: string;
  level: number;
  attendance_status: "present" | "absent" | "rejected" | "manual_present";
  submitted_at: string | null;
  location: {
    latitude: number;
    longitude: number;
  } | null;
  distance_from_session_m: number | null;
  device_info: {
    user_agent: string;
    ip_address: string;
  } | null;
  reason: string | null;
  has_submitted: boolean;
}

interface ManualAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  student: Student | null;
  isLoading: boolean;
  sessionCode: string;
  courseName: string;
}

export function ManualAttendanceModal({
  isOpen,
  onClose,
  onSubmit,
  student,
  isLoading,
  sessionCode,
  courseName,
}: ManualAttendanceModalProps) {
  const [reason, setReason] = React.useState("");
  const [reasonError, setReasonError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate reason
    if (!reason.trim()) {
      setReasonError("Please provide a reason for manual attendance marking");
      return;
    }

    if (reason.trim().length < 10) {
      setReasonError("Reason must be at least 10 characters long");
      return;
    }

    setReasonError(null);

    try {
      await onSubmit(reason.trim());
      handleClose();
    } catch (error) {
      console.error("Failed to submit manual attendance:", error);
    }
  };

  const handleClose = () => {
    setReason("");
    setReasonError(null);
    onClose();
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setReason("");
      setReasonError(null);
    }
  }, [isOpen]);

  // Format current date and time
  const formatCurrentDateTime = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-lg sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-green-600" />
            Manual Attendance Marking
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Context */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Users className="h-4 w-4" />
              Session Context
            </h4>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {courseName}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Session Code: {sessionCode}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  {formatCurrentDateTime()}
                </p>
              </div>
            </div>
          </div>

          {/* Student Information */}
          {student && (
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4" />
                Student Information
              </h4>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-green-900 dark:text-green-100">
                      {student.name}
                    </span>
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                      Level {student.level}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <p className="text-xs text-green-700 dark:text-green-300">
                      <span className="font-medium">Matric:</span> {student.matric_no}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300">
                      <span className="font-medium">Email:</span> {student.email}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-2 w-2 rounded-full bg-orange-500"></div>
                    <span className="text-xs font-medium text-green-800 dark:text-green-200">
                      Currently marked as: {student.attendance_status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reason Section */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Reason for Manual Marking
            </h4>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm">
                Provide a detailed reason for marking this student as present manually
              </Label>
              <Textarea
                id="reason"
                placeholder="e.g., Student arrived late due to previous class running overtime but was present for the session. Verified attendance through roll call."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (reasonError) setReasonError(null);
                }}
                rows={4}
                className={`w-full ${reasonError ? "border-red-500 focus:border-red-500" : ""}`}
              />
              {reasonError && (
                <p className="text-sm text-red-600 dark:text-red-400">
                  {reasonError}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                This reason will be logged for audit purposes. Minimum 10 characters required.
              </p>
            </div>
          </div>

          {/* Warning Notice */}
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950">
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-yellow-500">
                <span className="text-xs font-bold text-white">!</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Manual Attendance Override
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  This action will mark the student as &quot;MANUAL PRESENT&quot; and override their current attendance status.
                  This action is logged and cannot be easily undone.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !reason.trim()}
              className="w-full bg-green-600 hover:bg-green-700 sm:flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Marking Present...
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Mark as Present
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
