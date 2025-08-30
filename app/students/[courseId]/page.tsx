"use client";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  Copy,
  Download,
  Eye,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
  User,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { CopyStudentsModal } from "@/components/ui/copy-students-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCourseStore } from "@/store/course-store";

interface BulkUploadResponse {
  message: string;
  summary: {
    total_processed: number;
    added: number;
    updated: number;
    skipped: number;
    errors: number;
  };
  results: {
    added: Array<{
      index: number;
      enrollment: {
        student_id: {
          matric_no: string;
          name: string;
          email: string;
          level: number;
        };
      };
    }>;
    updated: Array<{
      index: number;
      enrollment: {
        student_id: {
          matric_no: string;
          name: string;
          email: string;
        };
      };
    }>;
    skipped: Array<{
      index: number;
      reason: string;
    }>;
    errors: Array<{
      index: number;
      matric_no: string;
      error: string;
    }>;
  };
}

// Enhanced bulk upload component with proper error handling
function BulkStudentUploadSection({
  courseId,
  courseCode,
  courseLevel,
  onUploadComplete,
  isDisabled = false,
}: {
  courseId: string;
  courseCode: string;
  courseLevel: number;
  onUploadComplete: () => void;
  isDisabled?: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<BulkUploadResponse | null>(
    null,
  );
  const [previewData, setPreviewData] = useState<Array<{
    matric_no: string;
    name: string;
    email: string;
    level: number;
    course_code: string;
  }> | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Upload results pagination
  const [addedResultsPage, setAddedResultsPage] = useState(1);
  const [updatedResultsPage, setUpdatedResultsPage] = useState(1);
  const [skippedResultsPage, setSkippedResultsPage] = useState(1);
  const [errorResultsPage, setErrorResultsPage] = useState(1);
  const resultsPerPage = 10;

  const { addBulkStudentsToCourse } = useCourseStore();

  const downloadSampleCSV = () => {
    const sampleData = [
      ["matric_no", "name", "email"],
      ["Bu22csc1001", "John Doe", "john.doe@email.com"],
      ["Bu22csc1002", "Jane Smith", "jane.smith@email.com"],
      ["Bu22csc1003", "Bob Johnson", "bob.johnson@email.com"],
      ["Bu22csc1004", "Alice Brown", "alice.brown@email.com"],
      ["Bu22csc1005", "Michael Davis", "michael.davis@email.com"],
      ["Bu22csc1006", "Sarah Wilson", "sarah.wilson@email.com"],
      ["Bu22csc1007", "David Lee", "david.lee@email.com"],
      ["Bu22csc1008", "Emily Clark", "emily.clark@email.com"],
      ["Bu22csc1009", "James Taylor", "james.taylor@email.com"],
      ["Bu22csc1010", "Olivia Martinez", "olivia.martinez@email.com"],
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${courseCode}_students_template.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }
      setUploadResults(null);

      // Parse and show preview
      try {
        const text = await file.text();
        const students = parseCSV(text);
        setPreviewData(students);
        setShowPreview(true);
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to parse CSV file";
        toast.error(errorMessage);
        setPreviewData(null);
        setShowPreview(false);
      }
    }
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const requiredHeaders = ["matric_no", "name", "email"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const students = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < 3) continue;

      const student = {
        course_code: courseCode,
        matric_no: values[headers.indexOf("matric_no")],
        name: values[headers.indexOf("name")],
        email: values[headers.indexOf("email")],
        level: courseLevel, // Use the course level for all students
      };

      if (!student.matric_no || !student.name || !student.email) {
        continue;
      }

      students.push(student);
    }

    return students;
  };

  const handleUpload = async () => {
    if (!previewData || previewData.length === 0) {
      toast.error("No students to upload");
      return;
    }

    setIsUploading(true);
    setUploadResults(null);

    try {
      const result = await addBulkStudentsToCourse(courseId, previewData);
      setUploadResults(result as BulkUploadResponse);

      if (result.summary?.errors === 0) {
        toast.success(`Successfully added ${result.summary.added} students!`);
        onUploadComplete();
        setPreviewData(null);
        setShowPreview(false);
      } else {
        toast.warning(
          `Upload completed with ${result.summary?.errors} errors. Check details below.`,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload students";
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const removeFromPreview = (index: number) => {
    if (previewData) {
      const newPreviewData = previewData.filter((_, i) => i !== index);
      setPreviewData(newPreviewData);
      if (newPreviewData.length === 0) {
        setShowPreview(false);
      }
    }
  };

  const clearPreview = () => {
    setPreviewData(null);
    setShowPreview(false);
  };

  return (
    <div className="space-y-6">
      {/* CSV Format Information */}
      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-muted-foreground text-sm">
            Your CSV file must contain the following columns (case-insensitive):
          </p>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <ol className="list-inside list-decimal space-y-1">
              <li>
                <span className="font-mono">matric_no</span>
              </li>
              <li>
                <span className="font-mono">name</span>
              </li>
              <li>
                <span className="font-mono">email</span>
              </li>
            </ol>
          </div>
          <p className="text-muted-foreground text-xs">
            Note: All students will be automatically assigned to the course
            level ({courseLevel}).
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadSampleCSV}
            className="mt-2"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Sample CSV
          </Button>
        </CardContent>
      </Card>

      {/* File Upload */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="csv-file">Select CSV File</Label>
          <Input
            id="csv-file"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
        </div>
      </div>

      {/* Preview Table */}
      {showPreview && previewData && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-base">
              <span>Preview Students ({previewData.length})</span>
              <Button variant="outline" size="sm" onClick={clearPreview}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            {/* Mobile Horizontal Scrollable Table */}
            <div className="block sm:hidden">
              <div className="overflow-x-auto">
                <div className="min-w-[600px] px-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                          #
                        </th>
                        <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                          Matric No
                        </th>
                        <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                          Name
                        </th>
                        <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                          Email
                        </th>
                        <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((student, index) => (
                        <tr
                          key={`${student.matric_no}-${index}`}
                          className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                        >
                          <td className="px-2 py-3 whitespace-nowrap">
                            <span className="text-xs font-medium">
                              #{index + 1}
                            </span>
                          </td>
                          <td className="px-2 py-3">
                            <div className="min-w-[120px]">
                              <p className="truncate text-xs font-medium">
                                {student.matric_no}
                              </p>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="min-w-[120px]">
                              <p className="truncate text-xs font-medium">
                                {student.name}
                              </p>
                            </div>
                          </td>
                          <td className="px-2 py-3">
                            <div className="min-w-[150px]">
                              <p className="text-muted-foreground truncate text-xs">
                                {student.email}
                              </p>
                            </div>
                          </td>
                          <td className="px-2 py-3 whitespace-nowrap">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeFromPreview(index)}
                              className="h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden sm:block">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-border border-b">
                      <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                        #
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                        Matric Number
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                        Student Name
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                        Email Address
                      </th>
                      <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((student, index) => (
                      <tr
                        key={`${student.matric_no}-${index}`}
                        className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                      >
                        <td className="px-4 py-4">
                          <span className="text-sm font-medium">
                            #{index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium">
                            {student.matric_no}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm font-medium">{student.name}</p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-muted-foreground text-sm">
                            {student.email}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeFromPreview(index)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Upload Actions */}
            <div className="flex flex-col gap-2 pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={clearPreview}
                disabled={isUploading}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button
                onClick={handleUpload}
                disabled={isUploading || isDisabled}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading {previewData.length} Students...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload {previewData.length} Students
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Results */}
      {uploadResults && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upload Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="mb-4 text-sm">
              <p className="text-muted-foreground">{uploadResults.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p>
                  <strong>Total Processed:</strong>{" "}
                  {uploadResults.summary.total_processed}
                </p>
                <p className="text-green-600">
                  <strong>Added:</strong> {uploadResults.summary.added}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-blue-600">
                  <strong>Updated:</strong> {uploadResults.summary.updated}
                </p>
                <p className="text-orange-600">
                  <strong>Skipped:</strong> {uploadResults.summary.skipped}
                </p>
                <p className="text-red-600">
                  <strong>Errors:</strong> {uploadResults.summary.errors}
                </p>
              </div>
            </div>

            {/* Added Students Table */}
            {uploadResults.results.added &&
              uploadResults.results.added.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Successfully Added Students (
                    {uploadResults.results.added.length})
                  </h4>

                  {/* Mobile Table */}
                  <div className="block sm:hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-[600px] px-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-border border-b">
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                #
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Status
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Matric No
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Student Name
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResults.results.added
                              .slice(
                                (addedResultsPage - 1) * resultsPerPage,
                                addedResultsPage * resultsPerPage,
                              )
                              .map((result) => (
                                <tr
                                  key={result.index}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <span className="text-xs font-medium">
                                      #{result.index}
                                    </span>
                                  </td>
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3 text-green-600" />
                                      <span className="text-xs font-medium text-green-600">
                                        Added
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3">
                                    <div className="min-w-[120px]">
                                      <p className="truncate text-xs font-medium">
                                        {result.enrollment.student_id.matric_no}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3">
                                    <div className="min-w-[120px]">
                                      <p className="truncate text-xs font-medium">
                                        {result.enrollment.student_id.name}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-border border-b">
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              #
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Matric Number
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Student Name
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Email Address
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.results.added
                            .slice(
                              (addedResultsPage - 1) * resultsPerPage,
                              addedResultsPage * resultsPerPage,
                            )
                            .map((result) => (
                              <tr
                                key={result.index}
                                className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <span className="text-sm font-medium">
                                    #{result.index}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-600">
                                      Successfully Added
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm font-medium">
                                    {result.enrollment.student_id.matric_no}
                                  </p>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm font-medium">
                                    {result.enrollment.student_id.name}
                                  </p>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-muted-foreground text-sm">
                                    {result.enrollment.student_id.email}
                                  </p>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination for Added Results */}
                  {uploadResults.results.added.length > resultsPerPage && (
                    <Pagination
                      currentPage={addedResultsPage}
                      totalPages={Math.ceil(
                        uploadResults.results.added.length / resultsPerPage,
                      )}
                      onPageChange={setAddedResultsPage}
                      totalItems={uploadResults.results.added.length}
                      itemsPerPage={resultsPerPage}
                      itemName="added students"
                    />
                  )}
                </div>
              )}

            {/* Error Students Table */}
            {uploadResults.results.errors &&
              uploadResults.results.errors.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-red-600">
                    <XCircle className="h-4 w-4" />
                    Errors ({uploadResults.results.errors.length})
                  </h4>

                  {/* Mobile Table */}
                  <div className="block sm:hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-[600px] px-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-border border-b">
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Row
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Status
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Matric No
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Error
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResults.results.errors
                              .slice(
                                (errorResultsPage - 1) * resultsPerPage,
                                errorResultsPage * resultsPerPage,
                              )
                              .map((error, index) => (
                                <tr
                                  key={`error-${error.index}-${index}`}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <span className="text-xs font-medium">
                                      #{error.index}
                                    </span>
                                  </td>
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <XCircle className="h-3 w-3 text-red-600" />
                                      <span className="text-xs font-medium text-red-600">
                                        Error
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3">
                                    <div className="min-w-[120px]">
                                      <p className="truncate text-xs font-medium">
                                        {error.matric_no}
                                      </p>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3">
                                    <div className="min-w-[200px]">
                                      <p className="truncate text-xs text-red-600">
                                        {error.error}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-border border-b">
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Row
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Matric Number
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Error Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.results.errors
                            .slice(
                              (errorResultsPage - 1) * resultsPerPage,
                              errorResultsPage * resultsPerPage,
                            )
                            .map((error, index) => (
                              <tr
                                key={`error-${error.index}-${index}`}
                                className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <span className="text-sm font-medium">
                                    #{error.index}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-red-600" />
                                    <span className="text-sm font-medium text-red-600">
                                      Failed
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm font-medium">
                                    {error.matric_no}
                                  </p>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm text-red-600">
                                    {error.error}
                                  </p>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination for Error Results */}
                  {uploadResults.results.errors.length > resultsPerPage && (
                    <Pagination
                      currentPage={errorResultsPage}
                      totalPages={Math.ceil(
                        uploadResults.results.errors.length / resultsPerPage,
                      )}
                      onPageChange={setErrorResultsPage}
                      totalItems={uploadResults.results.errors.length}
                      itemsPerPage={resultsPerPage}
                      itemName="errors"
                    />
                  )}
                </div>
              )}

            {/* Updated Students Table */}
            {uploadResults.results.updated &&
              uploadResults.results.updated.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-blue-600">
                    <CheckCircle className="h-4 w-4" />
                    Updated Students ({uploadResults.results.updated.length})
                  </h4>

                  {/* Mobile Table */}
                  <div className="block sm:hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-[600px] px-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-border border-b">
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                #
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Status
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Student
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResults.results.updated
                              .slice(
                                (updatedResultsPage - 1) * resultsPerPage,
                                updatedResultsPage * resultsPerPage,
                              )
                              .map((result) => (
                                <tr
                                  key={result.index}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <span className="text-xs font-medium">
                                      #{result.index}
                                    </span>
                                  </td>
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <CheckCircle className="h-3 w-3 text-blue-600" />
                                      <span className="text-xs font-medium text-blue-600">
                                        Updated
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3">
                                    <div className="min-w-[120px]">
                                      <p className="truncate text-xs font-medium">
                                        Student #{result.index}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-border border-b">
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              #
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.results.updated
                            .slice(
                              (updatedResultsPage - 1) * resultsPerPage,
                              updatedResultsPage * resultsPerPage,
                            )
                            .map((result) => (
                              <tr
                                key={result.index}
                                className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <span className="text-sm font-medium">
                                    #{result.index}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-600">
                                      Successfully Updated
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm">
                                    Student information updated
                                  </p>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination for Updated Results */}
                  {uploadResults.results.updated.length > resultsPerPage && (
                    <Pagination
                      currentPage={updatedResultsPage}
                      totalPages={Math.ceil(
                        uploadResults.results.updated.length / resultsPerPage,
                      )}
                      onPageChange={setUpdatedResultsPage}
                      totalItems={uploadResults.results.updated.length}
                      itemsPerPage={resultsPerPage}
                      itemName="updated students"
                    />
                  )}
                </div>
              )}

            {/* Skipped Students Table */}
            {uploadResults.results.skipped &&
              uploadResults.results.skipped.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-orange-600">
                    <XCircle className="h-4 w-4" />
                    Skipped Students ({uploadResults.results.skipped.length})
                  </h4>

                  {/* Mobile Table */}
                  <div className="block sm:hidden">
                    <div className="overflow-x-auto">
                      <div className="min-w-[600px] px-4">
                        <table className="w-full">
                          <thead>
                            <tr className="border-border border-b">
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                #
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Status
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Reason
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResults.results.skipped
                              .slice(
                                (skippedResultsPage - 1) * resultsPerPage,
                                skippedResultsPage * resultsPerPage,
                              )
                              .map((result) => (
                                <tr
                                  key={result.index}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <span className="text-xs font-medium">
                                      #{result.index}
                                    </span>
                                  </td>
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                      <XCircle className="h-3 w-3 text-orange-600" />
                                      <span className="text-xs font-medium text-orange-600">
                                        Skipped
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-2 py-3">
                                    <div className="min-w-[200px]">
                                      <p className="truncate text-xs text-orange-600">
                                        {result.reason}
                                      </p>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-border border-b">
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              #
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Status
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.results.skipped
                            .slice(
                              (skippedResultsPage - 1) * resultsPerPage,
                              skippedResultsPage * resultsPerPage,
                            )
                            .map((result) => (
                              <tr
                                key={result.index}
                                className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <span className="text-sm font-medium">
                                    #{result.index}
                                  </span>
                                </td>
                                <td className="px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <XCircle className="h-4 w-4 text-orange-600" />
                                    <span className="text-sm font-medium text-orange-600">
                                      Skipped
                                    </span>
                                  </div>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm text-orange-600">
                                    {result.reason}
                                  </p>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination for Skipped Results */}
                  {uploadResults.results.skipped.length > resultsPerPage && (
                    <Pagination
                      currentPage={skippedResultsPage}
                      totalPages={Math.ceil(
                        uploadResults.results.skipped.length / resultsPerPage,
                      )}
                      onPageChange={setSkippedResultsPage}
                      totalItems={uploadResults.results.skipped.length}
                      itemsPerPage={resultsPerPage}
                      itemName="skipped students"
                    />
                  )}
                </div>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Single student form component
function AddSingleStudentSection({
  courseId,
  courseLevel,
  onAddComplete,
  isDisabled = false,
}: {
  courseId: string;
  courseLevel: number;
  onAddComplete: () => void;
  isDisabled?: boolean;
}) {
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
    } catch {
      toast.error("Failed to add student");
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

export default function StudentsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const {
    currentCourse,
    students,
    sessions,
    isLoading,
    error,
    getCourse,
    removeStudentFromCourse,
    clearError,
    getAllCourses,
  } = useCourseStore();

  const [removingStudentId, setRemovingStudentId] = useState<string | null>(
    null,
  );

  // Confirmation modal state for student removal
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [studentToRemove, setStudentToRemove] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Copy students state
  const [showCopyDialog, setShowCopyDialog] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 10;

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Handle copy completion
  const handleCopyComplete = async () => {
    // Refresh the course data to show newly added students
    await getCourse(courseId);
    // Close the modal
    setShowCopyDialog(false);
  };

  // Fetch course data on mount
  React.useEffect(() => {
    if (courseId) {
      getCourse(courseId);
    }
  }, [courseId, getCourse]);

  React.useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  const handleRemoveStudent = async (studentId: string) => {
    // Find the student to get their name for the confirmation dialog
    const student = students.find((s) => s._id === studentId);
    const studentName = student?.name || "this student";

    // Set the student to remove and show confirmation modal
    setStudentToRemove({ id: studentId, name: studentName });
    setShowConfirmationModal(true);
  };

  // Confirm student removal
  const confirmRemoveStudent = async () => {
    if (!studentToRemove) return;

    setRemovingStudentId(studentToRemove.id);

    // Show optimistic loading toast
    const loadingToast = toast.loading(`Removing ${studentToRemove.name}...`, {
      description: "This action cannot be undone.",
    });

    try {
      await removeStudentFromCourse(courseId, studentToRemove.id);

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast);
      toast.success(`${studentToRemove.name} removed successfully!`, {
        description: "The student has been removed from this course.",
        duration: 4000,
      });

      // Refresh the course data to update student count and list
      await getCourse(courseId);
    } catch (error) {
      // Dismiss loading toast and show error
      toast.dismiss(loadingToast);
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error("Failed to remove student", {
        description: errorMessage,
        duration: 4000,
      });
    } finally {
      setRemovingStudentId(null);
      setShowConfirmationModal(false);
      setStudentToRemove(null);
    }
  };

  const handleRefresh = () => {
    getCourse(courseId);
  };

  const openCopyDialog = async () => {
    // Show modal immediately
    setShowCopyDialog(true);

    try {
      await getAllCourses();
    } catch {
      toast.error("Failed to load courses");
    }
  };

  // Format level for display
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

  // Check if there's an active session
  const hasActiveSession =
    sessions?.some(
      (session) => session.is_active || session.status === "active",
    ) || false;

  // Filter students based on search query
  const filteredStudents = students.filter((student) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.matric_no.toLowerCase().includes(query) ||
      student.email.toLowerCase().includes(query)
    );
  });

  // Pagination logic for filtered students
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const endIndex = startIndex + studentsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Reset pagination when search query changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  if (isLoading && !currentCourse) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <div className="border-primary mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2"></div>
            <p className="text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentCourse) {
    return (
      <DashboardLayout>
        <div className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Course not found</p>
            <Button onClick={() => router.push("/course")}>
              Go to Courses
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 p-4 lg:p-6">
        {/* Breadcrumb */}
        <div className="animate-appear opacity-0">
          <Breadcrumb
            items={[
              { label: "Courses", href: "/course" },
              { label: currentCourse.title, href: `/course/${courseId}` },
              { label: "Manage Students", current: true },
            ]}
          />
        </div>

        {/* Header Section */}
        <div className="animate-appear flex flex-col gap-4 opacity-0 delay-100 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push(`/course/${courseId}`)}
                className="hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 md:hidden"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Course
              </Button>
            </div>
            <h1 className="from-foreground to-muted-foreground bg-gradient-to-r bg-clip-text text-3xl font-bold text-transparent lg:text-4xl">
              Manage Students
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="text-sm">
                <BookOpen className="mr-1 h-3 w-3" />
                {currentCourse.course_code}
              </Badge>
              <Badge variant="secondary" className="text-sm">
                {formatLevel(currentCourse.level)}
              </Badge>
              <span className="text-muted-foreground text-sm">
                {currentCourse.title}
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="animate-appear grid gap-4 opacity-0 delay-200 sm:grid-cols-3">
          <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <Users className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="group-hover:text-primary text-2xl font-bold transition-all duration-300">
                {students.length}
              </div>
              <p className="text-muted-foreground text-xs">
                {students.length === 1
                  ? "student enrolled"
                  : "students enrolled"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Course Level
              </CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentCourse.level}</div>
              <p className="text-muted-foreground text-xs">
                {formatLevel(currentCourse.level)}
              </p>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Code</CardTitle>
              <BookOpen className="text-muted-foreground h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="font-mono text-lg font-bold">
                {currentCourse.course_code}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="animate-appear opacity-0 delay-400">
          {/* Active Session Warning */}
          {hasActiveSession && (
            <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <BookOpen className="h-5 w-5" />
                  <div>
                    <h4 className="font-semibold">Session in Progress</h4>
                    <p className="text-sm">
                      Student management is disabled while an attendance session
                      is active. Please end the current session to add or remove
                      students.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="student-list" className="space-y-4">
            <TabsList className="grid w-fit grid-cols-3">
              <TabsTrigger value="student-list">Student List</TabsTrigger>
              <TabsTrigger value="add-single" disabled={hasActiveSession}>
                Add Student
              </TabsTrigger>
              <TabsTrigger value="bulk-upload" disabled={hasActiveSession}>
                Bulk Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="student-list" className="space-y-4">
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center justify-between">
                        <span>Current Students</span>
                        {!hasActiveSession && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCopyDialog(true)}
                            className="ml-4"
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy from Course
                          </Button>
                        )}
                      </CardTitle>
                      <CardDescription>
                        Students currently enrolled in this course
                      </CardDescription>
                    </div>
                    {/* Search Bar */}
                    <div className="relative w-full sm:w-80">
                      <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                      <Input
                        type="text"
                        placeholder="Search by name, matric no, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pr-10 pl-10"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery("")}
                          className="absolute top-1/2 right-1 h-7 w-7 -translate-y-1/2 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {filteredStudents.length > 0 ? (
                    <>
                      {/* Mobile Horizontal Scrollable Table */}
                      <div className="block sm:hidden">
                        <div className="overflow-x-auto">
                          <div className="min-w-[600px] px-4">
                            <table className="w-full">
                              <thead>
                                <tr className="border-border border-b">
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    #
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Student
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Matric No
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Email
                                  </th>
                                  <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {paginatedStudents.map((student, index) => (
                                  <tr
                                    key={student._id}
                                    className={`border-border/50 hover:bg-muted/50 border-b transition-all duration-300 ${
                                      removingStudentId === student._id
                                        ? "bg-destructive/5 opacity-50"
                                        : ""
                                    }`}
                                  >
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <span className="text-xs font-medium">
                                        #{startIndex + index + 1}
                                      </span>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="truncate text-xs font-medium">
                                          {student.name}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <p className="text-muted-foreground font-mono text-xs">
                                        {student.matric_no}
                                      </p>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[150px]">
                                        <p className="text-muted-foreground truncate text-xs">
                                          {student.email}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <div className="flex gap-1">
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            router.push(
                                              `/students/${courseId}/${student._id}/attendance`,
                                            )
                                          }
                                          className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                          title="View attendance history"
                                        >
                                          <Eye className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="destructive"
                                          size="sm"
                                          onClick={() =>
                                            handleRemoveStudent(student._id)
                                          }
                                          disabled={
                                            removingStudentId === student._id
                                          }
                                          className="h-7 w-7 p-0 transition-all duration-200 hover:scale-105"
                                          title={
                                            removingStudentId === student._id
                                              ? "Removing student..."
                                              : "Remove student from course"
                                          }
                                        >
                                          {removingStudentId === student._id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                          ) : (
                                            <Trash2 className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Desktop Table */}
                      <div className="hidden sm:block">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-border border-b">
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  #
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Student Name
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Matric Number
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Email Address
                                </th>
                                <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedStudents.map((student, index) => (
                                <tr
                                  key={student._id}
                                  className={`border-border/50 hover:bg-muted/50 border-b transition-all duration-300 ${
                                    removingStudentId === student._id
                                      ? "bg-destructive/5 opacity-50"
                                      : ""
                                  }`}
                                >
                                  <td className="px-4 py-4">
                                    <span className="text-sm font-medium">
                                      #{startIndex + index + 1}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm font-medium">
                                      {student.name}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground font-mono text-sm">
                                      {student.matric_no}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground text-sm">
                                      {student.email}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        onClick={() =>
                                          router.push(
                                            `/students/${courseId}/${student._id}/attendance`,
                                          )
                                        }
                                        className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                        title="View attendance history"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() =>
                                          handleRemoveStudent(student._id)
                                        }
                                        disabled={
                                          removingStudentId === student._id
                                        }
                                        className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                                        title={
                                          removingStudentId === student._id
                                            ? "Removing student..."
                                            : "Remove student from course"
                                        }
                                      >
                                        {removingStudentId === student._id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Pagination */}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredStudents.length}
                        itemsPerPage={studentsPerPage}
                        itemName="students"
                      />
                    </>
                  ) : searchQuery ? (
                    <div className="px-6 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No students found matching &quot;{searchQuery}&quot;
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchQuery("")}
                        className="mt-2"
                      >
                        Clear search
                      </Button>
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <p className="text-muted-foreground text-sm">
                        No students enrolled yet
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="add-single" className="space-y-4">
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
                <CardHeader>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Add Single Student
                      </CardTitle>
                      <CardDescription>
                        Add a new student to {currentCourse.title}
                      </CardDescription>
                    </div>
                    <Button
                      onClick={openCopyDialog}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Students
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <AddSingleStudentSection
                    courseId={courseId}
                    courseLevel={currentCourse.level}
                    onAddComplete={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk-upload" className="space-y-4">
              <Card className="group border-border/50 bg-card/50 hover:bg-card/80 hover:shadow-primary/5 backdrop-blur-sm transition-all duration-500 lg:col-span-2 xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Bulk Student Upload
                  </CardTitle>
                  <CardDescription>
                    Upload multiple students using a CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <BulkStudentUploadSection
                    courseId={courseId}
                    courseCode={currentCourse.course_code}
                    courseLevel={currentCourse.level}
                    onUploadComplete={handleRefresh}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Student Removal Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setStudentToRemove(null);
        }}
        onConfirm={confirmRemoveStudent}
        title="Remove Student from Course"
        description={
          studentToRemove
            ? `Are you sure you want to remove "${studentToRemove.name}" from "${currentCourse.title}"? 

This will:
• Remove the student from this course permanently
• Delete their attendance records for this course
• Cannot be undone

The student will need to be re-enrolled manually if needed.`
            : "Are you sure you want to remove this student from the course?"
        }
        confirmText="Yes, Remove Student"
        cancelText="Cancel"
        variant="destructive"
        isLoading={removingStudentId === studentToRemove?.id}
      />

      {/* Copy Students Modal */}
      <CopyStudentsModal
        isOpen={showCopyDialog}
        onClose={() => setShowCopyDialog(false)}
        currentCourseId={courseId}
        onCopyComplete={handleCopyComplete}
      />
    </DashboardLayout>
  );
}
