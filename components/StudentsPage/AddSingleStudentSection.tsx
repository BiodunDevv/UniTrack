"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCourseStore } from "@/store/course-store";

interface AddSingleStudentSectionProps {
  courseId: string;
  courseLevel: number;
  onAddComplete: () => void;
  isDisabled?: boolean;
}

export function AddSingleStudentSection({
  courseId,
  courseLevel,
  onAddComplete,
  isDisabled = false,
}: AddSingleStudentSectionProps) {
  const [formData, setFormData] = useState({
    matric_no: "",
    name: "",
    email: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const { addStudentToCourse } = useCourseStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.matric_no.trim() ||
      !formData.name.trim() ||
      !formData.email.trim()
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsAdding(true);
    try {
      await addStudentToCourse(courseId, {
        matric_no: formData.matric_no.trim(),
        name: formData.name.trim(),
        email: formData.email.trim(),
        level: courseLevel,
      });

      toast.success("Student added successfully!");
      setFormData({ matric_no: "", name: "", email: "" });
      onAddComplete();
    } catch (error: unknown) {
      // Handle specific case where student is already enrolled
      const errorMessage =
        error instanceof Error ? error.message : "Failed to add student";

      if (errorMessage === "Student is already enrolled in this course") {
        toast.info(
          `${formData.name.trim()} is already enrolled in this course`,
          {
            description: "This student is already part of this course.",
            duration: 4000,
          },
        );
        // Clear the form since the student exists
        setFormData({ matric_no: "", name: "", email: "" });
        // Still call onAddComplete to refresh the student list
        onAddComplete();
      } else {
        toast.error("Failed to add student", {
          description: errorMessage,
          duration: 4000,
        });
      }
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="matric_no">Matriculation Number *</Label>
        <Input
          id="matric_no"
          name="matric_no"
          type="text"
          placeholder="e.g., CSC/2024/001"
          value={formData.matric_no}
          onChange={handleInputChange}
          required
          className="font-mono"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., John Doe"
          value={formData.name}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="e.g., john.doe@email.com"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="border-border/50 bg-muted/20 rounded-md border p-3">
        <p className="text-muted-foreground text-sm">
          <strong>Level:</strong> {courseLevel} (inherited from course)
        </p>
      </div>

      <Button
        type="submit"
        disabled={isAdding || isDisabled}
        className="w-full"
      >
        {isAdding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Adding Student...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Add Student
          </>
        )}
      </Button>
    </form>
  );
}
