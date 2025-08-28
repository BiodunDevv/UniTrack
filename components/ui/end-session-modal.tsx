"use client";

import { AlertTriangle, Clock, Users } from "lucide-react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Session {
  _id: string;
  session_code?: string;
  start_time?: string;
  created_at: string;
  expiry_time?: string;
  expires_at?: string;
  attendees_count?: number;
  is_active?: boolean;
  status?: string;
}

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  session: Session | null;
  isLoading?: boolean;
}

export function EndSessionModal({
  isOpen,
  onClose,
  onConfirm,
  session,
  isLoading = false,
}: EndSessionModalProps) {
  if (!session) return null;

  const sessionCode = session.session_code || session._id.slice(-6);
  const startTime = new Date(session.start_time || session.created_at);
  const expiryTime =
    session.expiry_time || session.expires_at
      ? new Date(session.expiry_time || session.expires_at || "")
      : null;
  const duration = Math.floor((Date.now() - startTime.getTime()) / (1000 * 60)); // minutes

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:w-full">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <DialogTitle className="text-left">
                End Active Session
              </DialogTitle>
              <DialogDescription className="text-left">
                This action cannot be undone
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Session Details */}
          <div className="bg-muted/50 space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Session {sessionCode}</h4>
              <Badge variant="destructive">Active</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-muted-foreground">{duration} minutes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Users className="text-muted-foreground h-4 w-4" />
                <div>
                  <p className="font-medium">Attendees</p>
                  <p className="text-muted-foreground">
                    {session.attendees_count || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-muted-foreground border-t pt-2 text-xs">
              <p>Started: {startTime.toLocaleString()}</p>
              {expiryTime && <p>Expires: {expiryTime.toLocaleString()}</p>}
            </div>
          </div>

          {/* Warning Message */}
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/10">
            <p className="text-sm text-red-800 dark:text-red-200">
              <strong>Warning:</strong> Ending this session will immediately
              stop accepting new attendance submissions. Students who
              haven&apos;t marked their attendance yet will be marked as absent.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Ending Session..." : "End Session"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
