"use client";

import { Loader2 }  from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button }   from "@/components/ui/button";

interface ConfirmDialogProps {
  open:          boolean;
  onOpenChange:  (open: boolean) => void;
  title:         string;
  description:   string;
  confirmLabel?: string;
  variant?:      "default" | "danger";
  isLoading?:    boolean;
  onConfirm:     () => void;
  children?:     React.ReactNode;
}

export function ConfirmDialog({
  open, onOpenChange, title, description,
  confirmLabel = "Confirm", variant = "default",
  isLoading = false, onConfirm, children,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">{title}</DialogTitle>
          <DialogDescription className="text-sm text-gray-500">{description}</DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter className="mt-2">
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm"
            variant={variant === "danger" ? "destructive" : "default"}
            className={variant === "default" ? "bg-slate-900 hover:bg-slate-800" : ""}
            disabled={isLoading} onClick={onConfirm}>
            {isLoading && <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
