"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CollapseProps {
  title: string | React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  icon?: React.ReactNode;
  badge?: string | number;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

export function Collapse({
  title,
  children,
  defaultOpen = false,
  icon,
  badge,
  className,
  headerClassName,
  contentClassName,
}: CollapseProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      className={cn(
        "border border-gray-200 rounded-lg overflow-hidden",
        className
      )}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left",
          headerClassName
        )}>
        <div className="flex items-center gap-3">
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span className="font-medium text-gray-900">{title}</span>
          {badge !== undefined && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {badge}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronRight className="h-5 w-5 text-gray-500" />
          )}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div className={cn("p-4 bg-white animate-expand", contentClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}

// Accordion - Multiple collapse items
export interface AccordionProps {
  items: {
    id: string;
    title: string | React.ReactNode;
    content: React.ReactNode;
    icon?: React.ReactNode;
    badge?: string | number;
    defaultOpen?: boolean;
  }[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  className,
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<string[]>(
    items.filter((item) => item.defaultOpen).map((item) => item.id)
  );

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id)
          ? prev.filter((itemId) => itemId !== id)
          : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {items.map((item) => (
        <div
          key={item.id}
          className="border border-gray-200 rounded-lg overflow-hidden">
          {/* Header */}
          <button
            type="button"
            onClick={() => toggleItem(item.id)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left">
            <div className="flex items-center gap-3">
              {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
              <span className="font-medium text-gray-900">{item.title}</span>
              {item.badge !== undefined && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {item.badge}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {openItems.includes(item.id) ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
            </div>
          </button>

          {/* Content */}
          {openItems.includes(item.id) && (
            <div className="p-4 bg-white border-t border-gray-200 animate-expand">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
