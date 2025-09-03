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
import {
  type BulkCreateLecturerData,
  useAdminStore,
} from "@/store/admin-store";

interface BulkUploadResponse {
  message: string;
  results: {
    created: Array<{
      teacher: {
        name: string;
        email: string;
        _id: string;
      };
      temporary_password: string;
    }>;
    failed: Array<{
      name: string;
      email: string;
      error: string;
    }>;
    total_processed: number;
  };
}

interface BulkLecturerUploadSectionProps {
  onUploadComplete: () => void;
  isDisabled?: boolean;
}

export function BulkLecturerUploadSection({
  onUploadComplete,
  isDisabled = false,
}: BulkLecturerUploadSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<BulkUploadResponse | null>(
    null,
  );
  const [previewData, setPreviewData] = useState<
    BulkCreateLecturerData[] | null
  >(null);
  const [showPreview, setShowPreview] = useState(false);

  // Upload results pagination
  const [createdResultsPage, setCreatedResultsPage] = useState(1);
  const [failedResultsPage, setFailedResultsPage] = useState(1);
  const [previewPage, setPreviewPage] = useState(1);
  const resultsPerPage = 10;

  const { createBulkLecturers } = useAdminStore();

  const resetUploadState = () => {
    setUploadResults(null);
    setPreviewData(null);
    setShowPreview(false);
    setCreatedResultsPage(1);
    setFailedResultsPage(1);
    setPreviewPage(1);

    // Reset file input
    const fileInput = document.getElementById("csv-file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ["name", "email"],
      ["Dr. John Smith", "john.smith@university.edu"],
      ["Prof. Jane Doe", "jane.doe@university.edu"],
      ["Dr. Michael Johnson", "michael.johnson@university.edu"],
      ["Prof. Sarah Wilson", "sarah.wilson@university.edu"],
      ["Dr. David Brown", "david.brown@university.edu"],
      ["Prof. Emily Davis", "emily.davis@university.edu"],
      ["Dr. James Miller", "james.miller@university.edu"],
      ["Prof. Lisa Anderson", "lisa.anderson@university.edu"],
      ["Dr. Robert Taylor", "robert.taylor@university.edu"],
      ["Prof. Jennifer Garcia", "jennifer.garcia@university.edu"],
    ];

    const csvContent = sampleData.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "lecturers_template.csv";
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
        const lecturers = parseCSV(text);
        setPreviewData(lecturers);
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

  const parseCSV = (text: string): BulkCreateLecturerData[] => {
    const lines = text.split("\n").filter((line) => line.trim());
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());

    const requiredHeaders = ["name", "email"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      throw new Error(`Missing required columns: ${missingHeaders.join(", ")}`);
    }

    const lecturers: BulkCreateLecturerData[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim());
      if (values.length < 2) continue;

      const lecturer: BulkCreateLecturerData = {
        name: values[headers.indexOf("name")],
        email: values[headers.indexOf("email")],
      };

      if (!lecturer.name || !lecturer.email) {
        continue;
      }

      lecturers.push(lecturer);
    }

    return lecturers;
  };

  const handleUpload = async () => {
    if (!previewData || previewData.length === 0) {
      toast.error("No lecturers to upload");
      return;
    }

    setIsUploading(true);
    setUploadResults(null);

    try {
      const result = await createBulkLecturers(previewData);
      const response = result as unknown as BulkUploadResponse;
      setUploadResults(response);

      if (response.results.failed.length === 0) {
        if (response.results.created.length > 0) {
          toast.success(
            `Successfully created ${response.results.created.length} lecturers!`,
          );
        }
        onUploadComplete();
        setPreviewData(null);
        setShowPreview(false);
      } else {
        toast.warning(
          `Upload completed with ${response.results.failed.length} errors. Check details below.`,
        );
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to upload lecturers";
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
                <span className="font-mono">name</span> - Full name of the
                lecturer
              </li>
              <li>
                <span className="font-mono">email</span> - Email address (must
                be unique)
              </li>
            </ol>
          </div>
          <p className="text-muted-foreground text-xs">
            Note: Temporary passwords will be automatically generated for all
            lecturers.
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
              <span>Preview Lecturers ({previewData.length})</span>
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
                <div className="min-w-[500px] px-4">
                  <table className="w-full">
                    <thead>
                      <tr className="border-border border-b">
                        <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                          #
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
                        .map((lecturer, index) => {
                          const globalIndex =
                            (previewPage - 1) * resultsPerPage + index + 1;
                          return (
                            <tr
                              key={`${lecturer.email}-${index}`}
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
                                    {lecturer.name}
                                  </p>
                                </div>
                              </td>
                              <td className="px-2 py-3">
                                <div className="min-w-[150px]">
                                  <p className="text-muted-foreground truncate text-xs">
                                    {lecturer.email}
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
                        Lecturer Name
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
                      .map((lecturer, index) => {
                        const globalIndex =
                          (previewPage - 1) * resultsPerPage + index + 1;
                        return (
                          <tr
                            key={`${lecturer.email}-${index}`}
                            className="border-border/50 hover:bg-muted/50 border-b transition-colors"
                          >
                            <td className="px-4 py-4">
                              <span className="text-sm font-medium">
                                #{globalIndex}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-sm font-medium">
                                {lecturer.name}
                              </p>
                            </td>
                            <td className="px-4 py-4">
                              <p className="text-muted-foreground text-sm">
                                {lecturer.email}
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
                itemName="lecturers"
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
                    Creating {previewData.length} Lecturers...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Create {previewData.length} Lecturers
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
              <CardTitle className="text-base">Creation Results</CardTitle>
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
                  {uploadResults.results.total_processed}
                </p>
                <p className="text-green-600">
                  <strong>Created:</strong>{" "}
                  {uploadResults.results.created.length}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-red-600">
                  <strong>Failed:</strong> {uploadResults.results.failed.length}
                </p>
              </div>
            </div>

            {/* Created Lecturers Table */}
            {uploadResults.results.created &&
              uploadResults.results.created.length > 0 && (
                <div className="space-y-4">
                  <h4 className="flex items-center gap-2 font-medium text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Successfully Created Lecturers (
                    {uploadResults.results.created.length})
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
                                Name
                              </th>
                              <th className="text-muted-foreground px-2 py-3 text-left text-xs font-medium whitespace-nowrap">
                                Password
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {uploadResults.results.created
                              .slice(
                                (createdResultsPage - 1) * resultsPerPage,
                                createdResultsPage * resultsPerPage,
                              )
                              .map((result, index) => {
                                const globalIndex =
                                  (createdResultsPage - 1) * resultsPerPage +
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
                                          Created
                                        </span>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[120px]">
                                        <p className="truncate text-xs font-medium">
                                          {result.teacher.name}
                                        </p>
                                      </div>
                                    </td>
                                    <td className="px-2 py-3">
                                      <div className="min-w-[100px]">
                                        <p className="font-mono text-xs">
                                          {result.temporary_password}
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
                              Lecturer Name
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Email Address
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Temporary Password
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadResults.results.created
                            .slice(
                              (createdResultsPage - 1) * resultsPerPage,
                              createdResultsPage * resultsPerPage,
                            )
                            .map((result, index) => {
                              const globalIndex =
                                (createdResultsPage - 1) * resultsPerPage +
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
                                        Successfully Created
                                      </span>
                                    </div>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-sm font-medium">
                                      {result.teacher.name}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="text-muted-foreground text-sm">
                                      {result.teacher.email}
                                    </p>
                                  </td>
                                  <td className="px-4 py-4">
                                    <p className="font-mono text-sm">
                                      {result.temporary_password}
                                    </p>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Pagination for Created Results */}
                  {uploadResults.results.created.length > resultsPerPage && (
                    <Pagination
                      currentPage={createdResultsPage}
                      totalPages={Math.ceil(
                        uploadResults.results.created.length / resultsPerPage,
                      )}
                      onPageChange={setCreatedResultsPage}
                      totalItems={uploadResults.results.created.length}
                      itemsPerPage={resultsPerPage}
                      itemName="created lecturers"
                    />
                  )}
                </div>
              )}

            {/* Failed Lecturers Table */}
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
                                Lecturer
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
                                        {error.name}
                                      </p>
                                      <p className="text-muted-foreground truncate text-xs">
                                        {error.email}
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
                              Lecturer Name
                            </th>
                            <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                              Email Address
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
                                    {error.name}
                                  </p>
                                </td>
                                <td className="px-4 py-4">
                                  <p className="text-muted-foreground text-sm">
                                    {error.email}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
