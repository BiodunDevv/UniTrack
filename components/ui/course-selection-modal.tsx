"use client";

import { BookOpen, Clock, Loader2, Play, Search, Users, X } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { useCourseStore } from "@/store/course-store";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface CourseSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CourseSelectionModal({
  isOpen,
  onClose,
}: CourseSelectionModalProps) {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = React.useState<string>("");
  const [courseSearchQuery, setCourseSearchQuery] = React.useState("");

  const { allCourses, getAllCourses, isLoading } = useCourseStore();

  // Fetch courses when modal opens
  React.useEffect(() => {
    if (isOpen) {
      getAllCourses();
    }
  }, [isOpen, getAllCourses]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedCourse("");
      setCourseSearchQuery("");
    }
  }, [isOpen]);

  // Filter out courses with active sessions
  const availableCourses = allCourses.filter(
    (course) => !course.has_active_session && !course.active_sessions_count,
  );

  // Filter courses based on search query
  const filteredCourses = React.useMemo(() => {
    if (!courseSearchQuery) return availableCourses;

    const searchLower = courseSearchQuery.toLowerCase();
    return availableCourses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(searchLower) ||
        course.title.toLowerCase().includes(searchLower) ||
        course.level.toString().includes(searchLower),
    );
  }, [availableCourses, courseSearchQuery]);

  const selectedCourseData = allCourses.find(
    (course) => course._id === selectedCourse,
  );

  const handleStartSession = () => {
    if (!selectedCourse) {
      toast.error("Please select a course first");
      return;
    }

    // Check if course already has active session
    if (
      selectedCourseData?.has_active_session ||
      selectedCourseData?.active_sessions_count
    ) {
      toast.error("This course already has an active session");
      return;
    }

    // Navigate to start session page
    router.push(
      `/session/start?courseId=${selectedCourse}&courseName=${encodeURIComponent(selectedCourseData?.title || "Course")}`,
    );
    onClose();
  };

  const formatLevel = (level: number) => {
    const levelMap: { [key: number]: string } = {
      100: "1st Year",
      200: "2nd Year",
      300: "3rd Year",
      400: "4th Year",
      500: "5th Year",
      600: "6th Year",
    };
    return levelMap[level] || `Level ${level}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Start Attendance Session
            </DialogTitle>
            <DialogDescription>
              Select a course to start an attendance session. Only courses
              without active sessions are available.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="course-selection">Select Course</Label>
                {!isLoading && (
                  <span className="text-muted-foreground text-xs">
                    {courseSearchQuery
                      ? `${filteredCourses.length} of ${availableCourses.length} courses`
                      : `${availableCourses.length} courses available`}
                  </span>
                )}
              </div>

              {/* Always show search bar when there are more than 3 total courses */}
              {!isLoading && availableCourses.length > 3 && (
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search by course code, title, or level..."
                    value={courseSearchQuery}
                    onChange={(e) => setCourseSearchQuery(e.target.value)}
                    className="pl-10"
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

              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground text-sm">
                      Loading courses...
                    </span>
                  </div>
                </div>
              ) : availableCourses.length === 0 ? (
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <CardContent className="p-4 text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      All your courses already have active sessions running.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Select
                  value={selectedCourse}
                  onValueChange={setSelectedCourse}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course to start session" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-[300px] w-full min-w-[300px] overflow-y-auto"
                    position="popper"
                    sideOffset={5}
                  >
                    {filteredCourses.length > 0 ? (
                      filteredCourses.map((course) => (
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
                            : "No courses available for new sessions"}
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

            {/* Selected Course Preview */}
            {selectedCourseData && (
              <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                <h4 className="font-semibold">Selected Course:</h4>
                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {selectedCourseData.title}
                        </h3>
                        <Badge variant="outline">
                          {selectedCourseData.course_code}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {formatLevel(selectedCourseData.level)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {selectedCourseData.student_count || 0} students
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStartSession}
              disabled={!selectedCourse || availableCourses.length === 0}
              className="w-full sm:w-auto"
            >
              <Play className="mr-2 h-4 w-4" />
              Continue to Setup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
