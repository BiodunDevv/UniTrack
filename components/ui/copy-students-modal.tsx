"use client";

import { Copy, Loader2, Search, X } from "lucide-react";
import * as React from "react";
import { toast } from "sonner";

import { useCourseStore } from "@/store/course-store";

import { Button } from "./button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Input } from "./input";
import { Label } from "./label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface CopyResults {
  message: string;
  summary: {
    total_processed: number;
    added: number;
    skipped: number;
  };
  addedStudents: Array<{
    _id: string;
    course_id: string;
    student_id: {
      _id: string;
      matric_no: string;
      name: string;
      email: string;
      phone?: string;
      level: number;
    };
    added_by: string;
    added_at: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  skippedStudents: Array<{
    matric_no: string;
    name: string;
    reason: string;
  }>;
}

interface CopyStudentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCourseId: string;
  onCopyComplete?: (results: CopyResults) => void;
}

export function CopyStudentsModal({
  isOpen,
  onClose,
  currentCourseId,
  onCopyComplete,
}: CopyStudentsModalProps) {
  const [selectedSourceCourse, setSelectedSourceCourse] =
    React.useState<string>("");
  const [courseSearchQuery, setCourseSearchQuery] = React.useState("");
  const [copyResults, setCopyResults] = React.useState<CopyResults | null>(
    null,
  );
  const [isCopying, setIsCopying] = React.useState(false);

  const {
    allCourses,
    courses,
    getAllCourses,
    copyStudentsFromCourse,
    isLoading: isLoadingCourses,
  } = useCourseStore();

  // Fetch all courses when modal opens
  React.useEffect(() => {
    if (isOpen) {
      getAllCourses();
    }
  }, [isOpen, getAllCourses]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedSourceCourse("");
      setCourseSearchQuery("");
      setCopyResults(null);
      setIsCopying(false);
    }
  }, [isOpen]);

  // Get available courses (exclude current course)
  const availableCoursesForCopy = React.useMemo(() => {
    const coursesToFilter = allCourses?.length ? allCourses : courses;
    const filtered = coursesToFilter.filter(
      (course) => course._id !== currentCourseId,
    );

    if (!courseSearchQuery) return filtered;

    const searchLower = courseSearchQuery.toLowerCase();
    return filtered.filter(
      (course) =>
        course.course_code.toLowerCase().includes(searchLower) ||
        course.title.toLowerCase().includes(searchLower) ||
        course.level.toString().includes(searchLower),
    );
  }, [allCourses, courses, currentCourseId, courseSearchQuery]);

  const handleCopyStudents = async () => {
    if (!selectedSourceCourse) {
      toast.error("Please select a source course");
      return;
    }

    setIsCopying(true);
    try {
      const results = await copyStudentsFromCourse(
        selectedSourceCourse,
        currentCourseId,
      );
      setCopyResults(results);

      if (results.summary?.total_processed === 0) {
        toast.info("No students to copy from the selected course");
      } else {
        toast.success(
          `Successfully copied ${results.summary?.added || 0} students!`,
          {
            description: `${results.summary?.skipped || 0} students were already enrolled.`,
          },
        );
      }

      // Call the callback if provided
      if (onCopyComplete) {
        onCopyComplete(results);
      }
    } catch (error) {
      console.error("Copy students error:", error);
      toast.error("Failed to copy students");
    } finally {
      setIsCopying(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedSourceCourse("");
    setCopyResults(null);
    setCourseSearchQuery("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Copy Students from Another Course</DialogTitle>
          <DialogDescription>
            Select a course to copy students from. Only students not already
            enrolled will be copied.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="source-course">Source Course</Label>
              {!isLoadingCourses && (
                <span className="text-muted-foreground text-xs">
                  {courseSearchQuery
                    ? `${availableCoursesForCopy.length} of ${(allCourses || courses).filter((course) => course._id !== currentCourseId).length} courses`
                    : `${availableCoursesForCopy.length} courses available`}
                </span>
              )}
            </div>

            {/* Always show search bar when there are more than 3 total courses */}
            {!isLoadingCourses &&
              (allCourses || courses).filter(
                (course) => course._id !== currentCourseId,
              ).length > 3 && (
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search by course code, title, or level..."
                    value={courseSearchQuery}
                    onChange={(e) => {
                      const newQuery = e.target.value;
                      setCourseSearchQuery(newQuery);
                    }}
                    className="pl-10"
                    disabled={isCopying}
                  />
                  {courseSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCourseSearchQuery("")}
                      className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            {isLoadingCourses ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground text-sm">
                    Loading courses...
                  </span>
                </div>
              </div>
            ) : (
              <Select
                value={selectedSourceCourse}
                onValueChange={setSelectedSourceCourse}
                disabled={isCopying}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course to copy from" />
                </SelectTrigger>
                <SelectContent
                  className="max-h-[300px] w-full min-w-[300px] overflow-y-auto"
                  position="popper"
                  sideOffset={5}
                >
                  {availableCoursesForCopy.length > 0 ? (
                    availableCoursesForCopy.map((course) => (
                      <SelectItem
                        key={course._id}
                        value={course._id}
                        className="hover:bg-muted/50 cursor-pointer"
                      >
                        <div className="flex w-full flex-col items-start py-1">
                          <div className="flex w-full items-center gap-2">
                            <span className="font-medium">
                              {course.course_code}
                            </span>
                            <span className="bg-primary/10 text-primary rounded px-2 py-0.5 text-xs whitespace-nowrap">
                              Level {course.level}
                            </span>
                          </div>
                          <span className="text-muted-foreground w-full max-w-[350px] truncate text-sm">
                            {course.title}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        {courseSearchQuery
                          ? `No courses found matching "${courseSearchQuery}"`
                          : "No other courses available"}
                      </p>
                      {courseSearchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCourseSearchQuery("")}
                          className="mt-2 h-7 text-xs"
                        >
                          Clear search
                        </Button>
                      )}
                    </div>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {copyResults && (
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <h4 className="font-semibold">Copy Results:</h4>
              {copyResults.summary?.total_processed === 0 ? (
                <div className="text-muted-foreground text-sm">
                  <p>The selected course has no students to copy.</p>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Students copied:</span>
                    <span className="font-medium text-green-600">
                      {copyResults.summary?.added || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Already enrolled:</span>
                    <span className="font-medium text-orange-600">
                      {copyResults.summary?.skipped || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total processed:</span>
                    <span className="font-medium">
                      {copyResults.summary?.total_processed || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
            disabled={isCopying}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCopyStudents}
            disabled={!selectedSourceCourse || isCopying || isLoadingCourses}
            className="w-full sm:w-auto"
          >
            {isCopying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Copying...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy Students
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
