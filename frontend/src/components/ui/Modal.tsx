"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  closeOnOverlayClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-7xl",
  full: "max-w-full mx-4",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "lg",
  closeOnOverlayClick = true,
  showCloseButton = true,
  className,
  headerClassName,
  bodyClassName,
  footerClassName,
}: ModalProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={closeOnOverlayClick ? onClose : undefined}>
      <div
        className={cn(
          "bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-gray-200",
          sizeClasses[size],
          className
        )}
        onClick={(e) => e.stopPropagation()}>
        {/* Header - Fixed */}
        {(title || showCloseButton) && (
          <div
            className={cn(
              "flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200",
              headerClassName
            )}>
            {title &&
              (typeof title === "string" ? (
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              ) : (
                <div className="flex-1">{title}</div>
              ))}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/50 rounded-lg transition-colors ml-auto"
                aria-label="Close modal">
                <X className="h-5 w-5 text-gray-600" />
              </button>
            )}
          </div>
        )}

        {/* Body - Scrollable */}
        <div
          className={cn(
            "p-6 overflow-y-auto max-h-[calc(95vh-200px)] bg-gray-50/30",
            bodyClassName
          )}>
          {children}
        </div>

        {/* Footer - Fixed */}
        {footer && (
          <div
            className={cn(
              "flex items-center justify-between p-6 bg-white border-t border-gray-200",
              footerClassName
            )}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// Convenience components for common modal patterns
export function ModalHeader({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mb-4", className)}>{children}</div>;
}

export function ModalBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("space-y-4", className)}>{children}</div>;
}

export function ModalFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-end gap-3", className)}>
      {children}
    </div>
  );
}
