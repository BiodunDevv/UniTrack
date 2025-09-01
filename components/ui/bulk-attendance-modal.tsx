"use client";

import { Check, Loader2, UserCheck, Users, X } from "lucide-react";
import * as React from "react";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
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

interface BulkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    students: Array<{
      studentId: string;
      status: "present" | "absent";
      reason: string;
    }>,
  ) => Promise<void>;
  selectedStudents: Student[];
  isLoading: boolean;
  sessionCode: string;
  courseName: string;
}

export function BulkAttendanceModal({
  isOpen,
  onClose,
  onSubmit,
  selectedStudents,
  isLoading,
  sessionCode,
  courseName,
}: BulkAttendanceModalProps) {
  const [status, setStatus] = React.useState<"present" | "absent">("present");
  const [reason, setReason] = React.useState("Network issues");
  const [reasonError, setReasonError] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    // Validate reason
    if (!reason.trim()) {
      setReasonError("Please provide a reason for bulk attendance marking");
      return;
    }

    if (reason.trim().length < 5) {
      setReasonError("Reason must be at least 5 characters long");
      return;
    }

    setReasonError(null);

    try {
      const studentsData = selectedStudents.map((student) => ({
        studentId: student._id,
        status,
        reason: reason.trim(),
      }));

      await onSubmit(studentsData);
      handleClose();
    } catch (error) {
      console.error("Failed to submit bulk attendance:", error);
    }
  };

  const handleClose = () => {
    setStatus("present");
    setReason("Network issues");
    setReasonError(null);
    onClose();
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStatus("present");
      setReason("Network issues");
      setReasonError(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-h-[95vh] w-[95vw] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Mark Attendance
          </DialogTitle>
          <DialogDescription>
            Mark attendance for {selectedStudents.length} selected students
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Selected Students Preview */}
          <div className="space-y-2">
            <Label>Selected Students ({selectedStudents.length})</Label>
            <div className="bg-muted/20 max-h-32 overflow-y-auto rounded-lg border p-3">
              <div className="space-y-1">
                {selectedStudents.slice(0, 5).map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="font-medium">{student.name}</span>
                    <span className="text-muted-foreground">
                      {student.matric_no}
                    </span>
                  </div>
                ))}
                {selectedStudents.length > 5 && (
                  <div className="text-muted-foreground pt-1 text-xs">
                    ... and {selectedStudents.length - 5} more students
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attendance Status Selection */}
          <div className="space-y-3">
            <Label>Mark students as</Label>
            <Select
              value={status}
              onValueChange={(value: string) =>
                setStatus(value as "present" | "absent")
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select attendance status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    Present
                  </div>
                </SelectItem>
                <SelectItem value="absent">
                  <div className="flex items-center gap-2">
                    <X className="h-4 w-4 text-red-600" />
                    Absent
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reason Section */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Bulk Marking <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="e.g., Network issues, App crash, Late arrival"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                if (reasonError) setReasonError(null);
              }}
              rows={3}
              className={`w-full ${reasonError ? "border-red-500 focus:border-red-500" : ""}`}
            />
            {reasonError && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {reasonError}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              This reason will be logged for all selected students for audit
              purposes.
            </p>
          </div>

          {/* Session Context */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950">
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {courseName}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Session: {sessionCode}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !reason.trim()}
            className={`w-full sm:w-auto ${
              status === "present"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Marking {selectedStudents.length} Students...
              </>
            ) : (
              <>
                <UserCheck className="mr-2 h-4 w-4" />
                Mark {selectedStudents.length} as {status}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
