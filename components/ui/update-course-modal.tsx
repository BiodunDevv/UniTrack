"use client";

import { Edit, Save } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Course {
  _id: string;
  title: string;
  course_code: string;
  level: number;
}

interface UpdateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdateCourse: (
    courseId: string,
    data: { title?: string; level?: number },
  ) => Promise<void>;
  course: Course;
  isLoading?: boolean;
}

export function UpdateCourseModal({
  isOpen,
  onClose,
  onUpdateCourse,
  course,
  isLoading = false,
}: UpdateCourseModalProps) {
  const [formData, setFormData] = useState({
    title: course.title,
    level: course.level,
  });

  // Update form data when course changes
  React.useEffect(() => {
    setFormData({
      title: course.title,
      level: course.level,
    });
  }, [course]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "level" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Course title is required");
      return;
    }

    try {
      const updateData: { title?: string; level?: number } = {};

      // Only include changed fields
      if (formData.title.trim() !== course.title) {
        updateData.title = formData.title.trim();
      }
      if (formData.level !== course.level) {
        updateData.level = formData.level;
      }

      if (Object.keys(updateData).length === 0) {
        toast.info("No changes to save");
        onClose();
        return;
      }

      await onUpdateCourse(course._id, updateData);
      toast.success("Course updated successfully!");
      onClose();
    } catch {
      toast.error("Failed to update course");
      throw new Error("Failed to update course");
    }
  };

  const handleClose = () => {
    setFormData({
      title: course.title,
      level: course.level,
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Update Course
          </DialogTitle>
          <DialogDescription>
            Update the course information for {course.course_code}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_code">Course Code</Label>
            <Input
              id="course_code"
              value={course.course_code}
              disabled
              className="bg-muted font-mono"
            />
            <p className="text-muted-foreground text-xs">
              Course code cannot be changed
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              name="title"
              type="text"
              placeholder="e.g., Introduction to Computer Science"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Academic Level *</Label>
            <select
              id="level"
              name="level"
              value={formData.level}
              onChange={handleInputChange}
              required
              className="border-border/50 bg-background/50 ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring hover:border-border focus:border-primary flex h-10 w-full rounded-md border px-3 py-2 text-sm backdrop-blur-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value={100}>100 Level (1st Year)</option>
              <option value={200}>200 Level (2nd Year)</option>
              <option value={300}>300 Level (3rd Year)</option>
              <option value={400}>400 Level (4th Year)</option>
              <option value={500}>500 Level (5th Year)</option>
              <option value={600}>600 Level (6th Year)</option>
            </select>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-end sm:gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isLoading ? "Updating..." : "Update Course"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
