"use client";

import { BookOpen, Loader2, Search, X } from "lucide-react";
import * as React from "react";

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

interface Course {
  _id: string;
  course_code: string;
  title: string;
  level?: number;
  student_count?: number;
  teacher?: {
    _id: string;
    name: string;
    email: string;
  };
}

interface StudentShareCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCourseSelect: (courseId: string, message: string) => void;
  courses: Course[];
  selectedStudentsCount: number;
  isLoading?: boolean;
}

export function StudentShareCourseModal({
  isOpen,
  onClose,
  onCourseSelect,
  courses,
  selectedStudentsCount,
  isLoading = false,
}: StudentShareCourseModalProps) {
  const [selectedCourse, setSelectedCourse] = React.useState<string>("");
  const [courseSearchQuery, setCourseSearchQuery] = React.useState("");

  const defaultMessage =
    "Hi! I would like to add these students to my course for a joint project. Thank you!";

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedCourse("");
      setCourseSearchQuery("");
    }
  }, [isOpen]);

  // Filter courses based on search query
  const filteredCourses = React.useMemo(() => {
    if (!courseSearchQuery) return courses;

    const searchLower = courseSearchQuery.toLowerCase();
    return courses.filter(
      (course) =>
        course.course_code.toLowerCase().includes(searchLower) ||
        course.title.toLowerCase().includes(searchLower) ||
        (course.level && course.level.toString().includes(searchLower)),
    );
  }, [courses, courseSearchQuery]);

  const selectedCourseData = courses.find(
    (course) => course._id === selectedCourse,
  );

  const handleSelectCourse = () => {
    if (!selectedCourse) return;
    onCourseSelect(selectedCourse, defaultMessage);
  };

  const formatLevel = (level?: number) => {
    if (!level) return "Unknown Level";
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Select Target Course
          </DialogTitle>
          <DialogDescription>
            Choose which course you want to request the {selectedStudentsCount}{" "}
            selected student
            {selectedStudentsCount !== 1 ? "s" : ""} to be added to.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="course-selection">Select Your Course</Label>
              {courses.length > 0 && (
                <span className="text-muted-foreground text-xs">
                  {courseSearchQuery
                    ? `${filteredCourses.length} of ${courses.length} courses`
                    : `${courses.length} courses available`}
                </span>
              )}
            </div>

            {/* Always show search bar when there are more than 3 total courses */}
            {courses.length > 3 && (
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

            {courses.length === 0 ? (
              <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <CardContent className="p-4 text-center">
                  <BookOpen className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    You don&apos;t have any courses yet. Create a course first
                    to request students.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a course to add students to" />
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
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {course.course_code}
                          </span>
                          <span className="text-muted-foreground">
                            - {course.title}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-3 py-6 text-center">
                      <p className="text-muted-foreground text-sm">
                        No courses found matching &quot;{courseSearchQuery}
                        &quot;
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">
                        {selectedCourseData.course_code} -{" "}
                        {selectedCourseData.title}
                      </h3>
                      <Badge variant="outline">
                        {formatLevel(selectedCourseData.level)}
                      </Badge>
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
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSelectCourse}
            disabled={!selectedCourse || courses.length === 0 || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Request...
              </>
            ) : (
              <>
                <BookOpen className="mr-2 h-4 w-4" />
                Request {selectedStudentsCount} Student
                {selectedStudentsCount !== 1 ? "s" : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
