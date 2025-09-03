"use client";

import { Loader2, User, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent } from "./card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  role: "teacher";
  email_verified: boolean;
  otp: string | null;
  otp_expires_at: string | null;
  otp_purpose: string | null;
  pending_email: string | null;
  created_at: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  last_login?: string;
  stats?: {
    total_courses: number;
    total_sessions: number;
    total_students: number;
  };
}

interface Course {
  _id: string;
  course_code: string;
  title: string;
  level: number;
  teacher_id: {
    _id: string;
    name: string;
    email: string;
  };
}

interface CourseReassignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  course: Course;
  lecturers: Teacher[];
  isLoading: boolean;
  onReassign: (lecturerId: string, reason: string) => Promise<void>;
}

export function CourseReassignmentModal({
  isOpen,
  onClose,
  onSuccess,
  course,
  lecturers,
  isLoading,
  onReassign,
}: CourseReassignmentModalProps) {
  const [selectedLecturerId, setSelectedLecturerId] =
    React.useState<string>("");
  const [reason, setReason] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset state when modal closes or opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedLecturerId("");
      setReason("");
      setSearchQuery("");
    }
  }, [isOpen]);

  // Filter lecturers based on search query and exclude current lecturer
  const filteredLecturers = React.useMemo(() => {
    let filtered = lecturers.filter(
      (lecturer) => lecturer._id !== course.teacher_id._id,
    );

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lecturer) =>
          lecturer.name.toLowerCase().includes(searchLower) ||
          lecturer.email.toLowerCase().includes(searchLower),
      );
    }

    return filtered;
  }, [lecturers, searchQuery, course.teacher_id._id]);

  const selectedLecturer = lecturers.find(
    (lecturer) => lecturer._id === selectedLecturerId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedLecturerId) {
      toast.error("Please select a lecturer");
      return;
    }

    setIsSubmitting(true);
    try {
      const finalReason =
        reason.trim() || `Moving Course to ${selectedLecturer?.name}`;
      await onReassign(selectedLecturerId, finalReason);
      toast.success("Course reassigned successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to reassign course",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Reassign Course
          </DialogTitle>
          <DialogDescription>
            Transfer ownership of &quot;{course.title}&quot; to another lecturer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          {/* Current Assignment Info */}
          <div className="bg-muted/50 space-y-3 rounded-lg p-4">
            <h4 className="font-semibold">Current Assignment:</h4>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Course:</span>{" "}
                {course.course_code} - {course.title}
              </p>
              <p className="text-sm">
                <span className="font-medium">Current Lecturer:</span>{" "}
                {course.teacher_id.name} ({course.teacher_id.email})
              </p>
            </div>
          </div>

          {/* Search and Select New Lecturer */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="lecturer-search">Search Lecturers</Label>
              <div className="relative">
                <Input
                  id="lecturer-search"
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery("")}
                    className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              {!isLoading && (
                <span className="text-muted-foreground text-xs">
                  {searchQuery
                    ? `${filteredLecturers.length} of ${lecturers.length - 1} available lecturers`
                    : `${lecturers.length - 1} available lecturers`}
                </span>
              )}
            </div>

            {/* Lecturers List */}
            <div className="space-y-2">
              <Label>Select New Lecturer</Label>
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Loading lecturers...
                    </span>
                  </div>
                </div>
              ) : filteredLecturers.length === 0 ? (
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <CardContent className="p-4 text-center">
                    <User className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {searchQuery
                        ? `No lecturers found matching "${searchQuery}"`
                        : "No other lecturers available for reassignment"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="max-h-60 space-y-2 overflow-y-auto rounded-md border p-2">
                  {filteredLecturers.map((lecturer) => (
                    <div
                      key={lecturer._id}
                      className={`hover:bg-muted/50 cursor-pointer rounded-md border p-3 transition-colors ${
                        selectedLecturerId === lecturer._id
                          ? "border-primary bg-primary/5"
                          : "border-border/50"
                      }`}
                      onClick={() => setSelectedLecturerId(lecturer._id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{lecturer.name}</span>
                            {lecturer.email_verified && (
                              <Badge
                                variant="outline"
                                className="border-green-200 text-green-600"
                              >
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {lecturer.email}
                          </p>
                          {lecturer.stats && (
                            <p className="text-muted-foreground text-xs">
                              {lecturer.stats.total_courses} courses •{" "}
                              {lecturer.stats.total_students} students
                            </p>
                          )}
                          {lecturer.last_login && (
                            <p className="text-muted-foreground text-xs">
                              Last login: {formatDate(lecturer.last_login)}
                            </p>
                          )}
                        </div>
                        {selectedLecturerId === lecturer._id && (
                          <div className="bg-primary text-primary-foreground flex h-5 w-5 items-center justify-center rounded-full">
                            <span className="text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Reassignment (Optional)</Label>
            <Textarea
              id="reason"
              placeholder={
                selectedLecturer
                  ? `Moving Course to ${selectedLecturer.name}`
                  : "Enter reason for reassignment..."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
            />
            <p className="text-muted-foreground text-xs">
              If left empty, a default reason will be used
            </p>
          </div>

          {/* Selected Lecturer Preview */}
          {selectedLecturer && (
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <h4 className="font-semibold">New Assignment:</h4>
              <Card className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{selectedLecturer.name}</h3>
                      {selectedLecturer.email_verified && (
                        <Badge
                          variant="outline"
                          className="border-green-200 text-green-600"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {selectedLecturer.email}
                    </p>
                    {selectedLecturer.stats && (
                      <p className="text-muted-foreground text-sm">
                        Currently managing{" "}
                        {selectedLecturer.stats.total_courses} courses with{" "}
                        {selectedLecturer.stats.total_students} total students
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                !selectedLecturerId ||
                isSubmitting ||
                filteredLecturers.length === 0
              }
              className="w-full sm:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reassigning...
                </>
              ) : (
                "Reassign Course"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
