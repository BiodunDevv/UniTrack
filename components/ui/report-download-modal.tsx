"use client";

import { CalendarDays, Download, Loader2, Mail } from "lucide-react";
import * as React from "react";

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

interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (startDate: string, endDate: string) => Promise<void>;
  onEmail: (startDate: string, endDate: string) => Promise<void>;
  type: "csv" | "pdf";
  isLoading: boolean;
}

export function ReportDownloadModal({
  isOpen,
  onClose,
  onDownload,
  onEmail,
  type,
  isLoading,
}: ReportDownloadModalProps) {
  const [startDate, setStartDate] = React.useState("");
  const [endDate, setEndDate] = React.useState("");
  const [actionType, setActionType] = React.useState<"download" | "email">(
    "download",
  );

  // Set default dates when modal opens
  React.useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      setStartDate(firstDayOfMonth.toISOString().split("T")[0]);
      setEndDate(lastDayOfMonth.toISOString().split("T")[0]);
    }
  }, [isOpen]);

  const handleSubmit = async (action: "download" | "email") => {
    if (!startDate || !endDate) {
      return;
    }

    setActionType(action);

    try {
      if (action === "download") {
        await onDownload(startDate, endDate);
      } else {
        await onEmail(startDate, endDate);
      }
      onClose();
    } catch {
      // Error handling is done in the parent component
    }
  };

  const isFormValid =
    startDate && endDate && new Date(startDate) <= new Date(endDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            {type.toUpperCase()} Report Date Range
          </DialogTitle>
          <DialogDescription>
            Select the date range for your {type.toUpperCase()} attendance
            report.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate || undefined}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end-date">End Date</Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || undefined}
              className="w-full"
            />
          </div>

          {!isFormValid && startDate && endDate && (
            <p className="text-sm text-red-500">
              End date must be after or equal to start date
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => handleSubmit("email")}
            disabled={!isFormValid || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && actionType === "email" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Email {type.toUpperCase()}
          </Button>

          <Button
            onClick={() => handleSubmit("download")}
            disabled={!isFormValid || isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading && actionType === "download" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download {type.toUpperCase()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
