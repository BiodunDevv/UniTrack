"use client";

import { Loader2, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type CreateLecturerData,useAdminStore } from "@/store/admin-store";

interface AddSingleLecturerSectionProps {
  onAddComplete: () => void;
  isDisabled?: boolean;
}

export function AddSingleLecturerSection({
  onAddComplete,
  isDisabled = false,
}: AddSingleLecturerSectionProps) {
  const [formData, setFormData] = useState<CreateLecturerData>({
    name: "",
    email: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const { createLecturer } = useAdminStore();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
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
      const result = await createLecturer({
        name: formData.name.trim(),
        email: formData.email.trim(),
      });

      toast.success("Lecturer created successfully!", {
        description: `Temporary password: ${result.temporary_password}`,
        duration: 10000,
      });

      setFormData({ name: "", email: "" });
      onAddComplete();
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create lecturer";

      if (errorMessage === "Teacher with this email already exists") {
        toast.error("Email already exists", {
          description: "A lecturer with this email address already exists.",
          duration: 4000,
        });
      } else {
        toast.error("Failed to create lecturer", {
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
        <Label htmlFor="name">Full Name *</Label>
        <Input
          id="name"
          name="name"
          type="text"
          placeholder="e.g., Dr. John Smith"
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
          placeholder="e.g., john.smith@university.edu"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
      </div>

      <div className="border-border/50 bg-muted/20 rounded-md border p-3">
        <p className="text-muted-foreground text-sm">
          <strong>Note:</strong> A temporary password will be generated for the
          lecturer. They will need to change it on first login.
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
            Creating Lecturer...
          </>
        ) : (
          <>
            <Plus className="mr-2 h-4 w-4" />
            Create Lecturer
          </>
        )}
      </Button>
    </form>
  );
}
