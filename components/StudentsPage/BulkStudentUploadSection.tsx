"use client";

import {
  CheckCircle,
  Download,
  Loader2,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { useCourseStore } from "@/store/course-store";

interface BulkUploadResponse {
  message: string;
  summary: {
    total_processed: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  results: {
    successful: Array<{
      matric_no: string;
      name: string;
      email: string;
      student_id: string;
      enrollment_id: string;
    }>;
    failed: Array<{
      matric_no: string;
      name: string;
      email: string;
      error: string;
    }>;
    skipped: Array<{
      matric_no: string;
      name: string;
      reason: string;
    }>;
  };
  course: {
    id: string;
    title: string;
    course_code: string;
  };
}

interface BulkUploadResponse {
  message: string;
  summary: {
    total_processed: number;
    successful: number;
    failed: number;
    skipped: number;
  };
  results: {
    successful: Array<{
      matric_no: string;
      name: string;
      email: string;
      student_id: string;
      enrollment_id: string;
    }>;
    failed: Array<{
      matric_no: string;
      name: string;
      email: string;
      error: string;
    }>;
    skipped: Array<{
      matric_no: string;
      name: string;
      reason: string;
    }>;
  };
  course: {
    id: string;
    title: string;
    course_code: string;
  };
}

interface BulkStudentUploadSectionProps {
  courseId: string;
  courseCode: string;
  courseLevel: number;
  onUploadComplete: () => void;
  isDisabled?: boolean;
}

export function BulkStudentUploadSection({
  courseId,
  courseCode,
  courseLevel,
  onUploadComplete,
  isDisabled = false,
}: BulkStudentUploadSectionProps) {
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
  const [successfulResultsPage, setSuccessfulResultsPage] = useState(1);
  const [failedResultsPage, setFailedResultsPage] = useState(1);
  const [skippedResultsPage, setSkippedResultsPage] = useState(1);
  const [previewPage, setPreviewPage] = useState(1);
  const resultsPerPage = 10;

  const { addBulkStudentsToCourse } = useCourseStore();

  const resetUploadState = () => {
    setUploadResults(null);
    setPreviewData(null);
    setShowPreview(false);
    setSuccessfulResultsPage(1);
    setFailedResultsPage(1);
    setSkippedResultsPage(1);
    setPreviewPage(1);

    // Reset file input
    const fileInput = document.getElementById("csv-file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

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
      ["Bu22csc1011", "William Brown", "william.brown@email.com"],
      ["Bu22csc1012", "Sophia Johnson", "sophia.johnson@email.com"],
      ["Bu22csc1013", "James Wilson", "james.wilson@email.com"],
      ["Bu22csc1014", "Patricia Garcia", "patricia.garcia@email.com"],
      ["Bu22csc1015", "Charles Martinez", "charles.martinez@email.com"],
      ["Bu22csc1016", "Linda Rodriguez", "linda.rodriguez@email.com"],
      ["Bu22csc1017", "Robert Lee", "robert.lee@email.com"],
      ["Bu22csc1018", "Jennifer Walker", "jennifer.walker@email.com"],
      ["Bu22csc1019", "Michael Hall", "michael.hall@email.com"],
      ["Bu22csc1020", "Elizabeth Allen", "elizabeth.allen@email.com"],
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
      const response = result as unknown as BulkUploadResponse;
      setUploadResults(response);

      if (response.summary.failed === 0) {
        if (response.summary.successful > 0) {
          toast.success(
            `Successfully added ${response.summary.successful} students!`,
          );
        } else if (response.summary.skipped > 0) {
          toast.info(
            `${response.summary.skipped} students were already enrolled in the course.`,
          );
        }
        onUploadComplete();
        setPreviewData(null);
        setShowPreview(false);
      } else {
        toast.warning(
          `Upload completed with ${response.summary.failed} errors. Check details below.`,
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

      // Adjust pagination if necessary
      const newTotalPages = Math.ceil(newPreviewData.length / resultsPerPage);
      if (previewPage > newTotalPages && newTotalPages > 0) {
        setPreviewPage(newTotalPages);
      }

      if (newPreviewData.length === 0) {
        setShowPreview(false);
        setPreviewPage(1);
      }
    }
  };

  const clearPreview = () => {
    setPreviewData(null);
    setShowPreview(false);
    setPreviewPage(1);
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
                      {previewData
                        .slice(
                          (previewPage - 1) * resultsPerPage,
                          previewPage * resultsPerPage,
                        )
                        .map((student, index) => {
                          const globalIndex =
                            (previewPage - 1) * resultsPerPage + index + 1;
                          return (
                            <tr
                              key={`${student.matric_no}-${index}`}
                              className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                            >
                              <td className="px-2 py-3 whitespace-nowrap">
                                <span className="text-xs font-medium">
                                  #{globalIndex}
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
                                  onClick={() =>
                                    removeFromPreview(
                                      (previewPage - 1) * resultsPerPage +
                                        index,
                                    )
                                  }
                                  className="h-7 w-7 p-0"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
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
                    {previewData
                      .slice(
                        (previewPage - 1) * resultsPerPage,
                        previewPage * resultsPerPage,
                      )
                      .map((student, index) => {
                        const globalIndex =
                          (previewPage - 1) * resultsPerPage + index + 1;
                        return (
                          <tr
                            key={`${student.matric_no}-${index}`}
                            className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                          >
                            <td className="px-4 py-4">
                              <span className="text-sm font-medium">
                                #{globalIndex}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium">
                                {student.matric_no}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium">
                                {student.name}
                              </p>
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
                                onClick={() =>
                                  removeFromPreview(
                                    (previewPage - 1) * resultsPerPage + index,
                                  )
                                }
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination for Preview */}
            {previewData && previewData.length > resultsPerPage && (
              <Pagination
                currentPage={previewPage}
                totalPages={Math.ceil(previewData.length / resultsPerPage)}
                onPageChange={setPreviewPage}
                totalItems={previewData.length}
                itemsPerPage={resultsPerPage}
                itemName="students"
              />
            )}

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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload Results</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetUploadState}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close upload results</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {uploadResults.message}
            </p>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p>
                  <strong>Total Processed:</strong>{" "}
                  {uploadResults.summary.total_processed}
                </p>
                <p className="text-green-600">
                  <strong>Successful:</strong>{" "}
                  {uploadResults.summary.successful}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-red-600">
                  <strong>Failed:</strong> {uploadResults.summary.failed}
                </p>
                <p className="text-orange-600">
                  <strong>Skipped:</strong> {uploadResults.summary.skipped}
                </p>
              </div>
            </div>

            {/* Successful Students Table */}
            {uploadResults.results.successful &&
              uploadResults.results.successful.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Successfully Added Students (
                    {uploadResults.results.successful.length})
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
                            {uploadResults.results.successful
                              .slice(
                                (successfulResultsPage - 1) * resultsPerPage,
                                successfulResultsPage * resultsPerPage,
                              )
                              .map((result, index) => {
                                const globalIndex =
                                  (successfulResultsPage - 1) * resultsPerPage +
                                  index +
                                  1;
                                return (
                                  <tr
                                    key={index}
                                    className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                  >
                                    <td className="px-2 py-3 whitespace-nowrap">
                                      <span className="text-xs font-medium">
                                        #{globalIndex}
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
                                          {result.matric_no}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="truncate text-xs font-medium">
                                          {result.name}
                                        </p>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
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
                          {uploadResults.results.successful
                            .slice(
                              (successfulResultsPage - 1) * resultsPerPage,
                              successfulResultsPage * resultsPerPage,
                            )
                            .map((result, index) => {
                              const globalIndex =
                                (successfulResultsPage - 1) * resultsPerPage +
                                index +
                                1;
                              return (
                                <tr
                                  key={index}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-4 py-4">
                                    <span className="text-sm font-medium">
                                      #{globalIndex}
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
                                      {result.matric_no}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm font-medium">
                                      {result.name}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground text-sm">
                                      {result.email}
                                    </p>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination for Successful Results */}
                  {uploadResults.results.successful.length > resultsPerPage && (
                    <Pagination
                      currentPage={successfulResultsPage}
                      totalPages={Math.ceil(
                        uploadResults.results.successful.length /
                          resultsPerPage,
                      )}
                      onPageChange={setSuccessfulResultsPage}
                      totalItems={uploadResults.results.successful.length}
                      itemsPerPage={resultsPerPage}
                      itemName="successful students"
                    />
                  )}
                </div>
              )}

            {/* Failed Students Table */}
            {uploadResults.results.failed &&
              uploadResults.results.failed.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-red-600">
                    <XCircle className="h-4 w-4" />
                    Failed ({uploadResults.results.failed.length})
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
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Error
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResults.results.failed
                              .slice(
                                (failedResultsPage - 1) * resultsPerPage,
                                failedResultsPage * resultsPerPage,
                              )
                              .map((error, index) => (
                                <tr
                                  key={`error-${index}`}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <span className="text-xs font-medium">
                                      #{index + 1}
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
                                      <p className="text-muted-foreground truncate text-xs">
                                        {error.name}
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
                              Error Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.results.failed
                            .slice(
                              (failedResultsPage - 1) * resultsPerPage,
                              failedResultsPage * resultsPerPage,
                            )
                            .map((error, index) => (
                              <tr
                                key={`error-${index}`}
                                className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <span className="text-sm font-medium">
                                    #{index + 1}
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
                                  <p className="text-sm font-medium">
                                    {error.name}
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

                  {/* Pagination for Failed Results */}
                  {uploadResults.results.failed.length > resultsPerPage && (
                    <Pagination
                      currentPage={failedResultsPage}
                      totalPages={Math.ceil(
                        uploadResults.results.failed.length / resultsPerPage,
                      )}
                      onPageChange={setFailedResultsPage}
                      totalItems={uploadResults.results.failed.length}
                      itemsPerPage={resultsPerPage}
                      itemName="failed"
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
                                Student
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
                              .map((result, index) => (
                                <tr
                                  key={index}
                                  className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                                >
                                  <td className="px-2 py-3 whitespace-nowrap">
                                    <span className="text-xs font-medium">
                                      #{index + 1}
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
                                    <div className="min-w-[120px]">
                                      <p className="truncate text-xs font-medium">
                                        {result.matric_no}
                                      </p>
                                      <p className="text-muted-foreground truncate text-xs">
                                        {result.name}
                                      </p>
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
                              Matric Number
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Student Name
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
                            .map((result, index) => (
                              <tr
                                key={index}
                                className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                              >
                                <td className="px-4 py-4">
                                  <span className="text-sm font-medium">
                                    #{index + 1}
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
                                  <p className="text-sm font-medium">
                                    {result.matric_no}
                                  </p>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-sm font-medium">
                                    {result.name}
                                  </p>
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
