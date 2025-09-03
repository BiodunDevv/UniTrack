"use client";

import { CheckCircle, Loader2, Search, User, Users, X } from "lucide-react";
import * as React from "react";

import { type Teacher } from "@/store/admin-store";

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

interface LecturerSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lecturer: Teacher) => void;
  selectedLecturer?: Teacher | null;
  lecturers: Teacher[];
  isLoading: boolean;
  excludeLecturerId?: string; // Optional prop to exclude a specific lecturer
}

export function LecturerSelectionModal({
  isOpen,
  onClose,
  onSelect,
  selectedLecturer,
  lecturers,
  isLoading,
  excludeLecturerId,
}: LecturerSelectionModalProps) {
  const [selectedLecturerId, setSelectedLecturerId] =
    React.useState<string>("");
  const [lecturerSearchQuery, setLecturerSearchQuery] = React.useState("");

  // Reset state when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedLecturerId("");
      setLecturerSearchQuery("");
    }
  }, [isOpen]);

  // Set initial selection if selectedLecturer is provided
  React.useEffect(() => {
    if (selectedLecturer) {
      setSelectedLecturerId(selectedLecturer._id);
    }
  }, [selectedLecturer]);

  // Filter out only verified lecturers and exclude specific lecturer if provided
  const verifiedLecturers = lecturers.filter(
    (lecturer) =>
      lecturer.email_verified === true &&
      (!excludeLecturerId || lecturer._id !== excludeLecturerId),
  );

  // Filter lecturers based on search query
  const filteredLecturers = React.useMemo(() => {
    if (!lecturerSearchQuery) return verifiedLecturers;

    const searchLower = lecturerSearchQuery.toLowerCase();
    return verifiedLecturers.filter(
      (lecturer) =>
        lecturer.name.toLowerCase().includes(searchLower) ||
        lecturer.email.toLowerCase().includes(searchLower),
    );
  }, [verifiedLecturers, lecturerSearchQuery]);

  const selectedLecturerData = lecturers.find(
    (lecturer) => lecturer._id === selectedLecturerId,
  );

  const handleSelectLecturer = () => {
    if (!selectedLecturerData) return;
    onSelect(selectedLecturerData);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Lecturer
            </DialogTitle>
            <DialogDescription>
              Choose a verified lecturer to assign as the owner of this course.
              Only verified lecturers are available for selection.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="lecturer-selection">Select Lecturer</Label>
                {!isLoading && (
                  <span className="text-muted-foreground text-xs">
                    {lecturerSearchQuery
                      ? `${filteredLecturers.length} of ${verifiedLecturers.length} verified lecturers`
                      : `${verifiedLecturers.length} verified lecturers available`}
                  </span>
                )}
              </div>

              {/* Always show search bar when there are more than 3 total lecturers */}
              {!isLoading && verifiedLecturers.length > 3 && (
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={lecturerSearchQuery}
                    onChange={(e) => setLecturerSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  {lecturerSearchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setLecturerSearchQuery("")}
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
                      Loading lecturers...
                    </span>
                  </div>
                </div>
              ) : verifiedLecturers.length === 0 ? (
                <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <CardContent className="p-4 text-center">
                    <User className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                    <p className="text-sm text-orange-700 dark:text-orange-300">
                      {excludeLecturerId
                        ? "No other verified lecturers available for reassignment."
                        : "No verified lecturers found in the system."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Select
                  value={selectedLecturerId}
                  onValueChange={setSelectedLecturerId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lecturer for this course" />
                  </SelectTrigger>
                  <SelectContent
                    className="max-h-[300px] w-full min-w-[300px] overflow-y-auto"
                    position="popper"
                    sideOffset={5}
                  >
                    {filteredLecturers.length > 0 ? (
                      filteredLecturers.map((lecturer) => (
                        <SelectItem
                          key={lecturer._id}
                          value={lecturer._id}
                          className="hover:bg-muted/50 cursor-pointer"
                        >
                          <div className="flex w-full flex-col items-start py-1">
                            <div className="flex w-full items-center gap-2">
                              <span className="font-medium">
                                {lecturer.name}
                              </span>
                              <span className="flex items-center gap-1 rounded border-green-200 bg-green-100 px-2 py-0.5 text-xs whitespace-nowrap text-green-800">
                                <CheckCircle className="h-3 w-3" />
                                Verified
                              </span>
                            </div>
                            <span className="text-muted-foreground w-full max-w-[350px] truncate text-sm">
                              {lecturer.email}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-3 py-6 text-center">
                        <p className="text-muted-foreground text-sm">
                          {lecturerSearchQuery
                            ? `No verified lecturers found matching "${lecturerSearchQuery}"`
                            : "No verified lecturers available"}
                        </p>
                        {lecturerSearchQuery && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setLecturerSearchQuery("")}
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

            {/* Selected Lecturer Preview */}
            {selectedLecturerData && (
              <div className="bg-muted/50 space-y-3 rounded-lg p-4">
                <h4 className="font-semibold">Selected Lecturer:</h4>
                <Card className="border-border/50 bg-card/50 hover:border-border hover:bg-card/80 backdrop-blur-sm transition-all duration-300">
                  <CardContent className="p-2">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold">
                          {selectedLecturerData.name}
                        </h3>
                        <Badge className="flex items-center gap-1 border-green-200 bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      </div>
                    </div>
                    <div className="text-muted-foreground flex items-center gap-4 text-sm">
                      {selectedLecturerData.stats && (
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {selectedLecturerData.stats.total_courses} courses
                        </div>
                      )}
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
              onClick={handleSelectLecturer}
              disabled={!selectedLecturerId || verifiedLecturers.length === 0}
              className="w-full sm:w-auto"
            >
              <User className="mr-2 h-4 w-4" />
              Select Lecturer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
