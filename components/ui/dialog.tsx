"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="bg-background/80 fixed inset-0 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      {children}
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps> = ({
  children,
  className,
}) => {
  return (
    <div className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 transform">
      <div
        className={cn(
          "bg-background max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg border p-6 shadow-lg",
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

const DialogHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <div
    className={cn(
      "mb-4 flex flex-col space-y-1.5 text-center sm:text-left",
      className,
    )}
  >
    {children}
  </div>
);

const DialogTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <h2
    className={cn(
      "text-lg leading-none font-semibold tracking-tight",
      className,
    )}
  >
    {children}
  </h2>
);

const DialogDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <p className={cn("text-muted-foreground text-sm", className)}>{children}</p>
);

export { Dialog, DialogContent, DialogDescription,DialogHeader, DialogTitle };
