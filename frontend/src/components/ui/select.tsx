"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface SelectValueProps {
  placeholder?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
}

const Select: React.FC<SelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState<string>("");
  const [placeholder, setPlaceholder] = useState<string>("");
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (selectedValue: string, selectedLabel: string) => {
    onValueChange(selectedValue);
    setSelectedLabel(selectedLabel);
    setIsOpen(false);
  };

  return (
    <div ref={selectRef} className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              selectedLabel: selectedLabel || placeholder,
            } as any);
          }
          if (child.type === SelectContent) {
            return React.cloneElement(child, {
              isOpen,
              onSelect: handleSelect,
            } as any);
          }
          if (child.type === SelectValue) {
            setPlaceholder((child.props as any).placeholder || "");
            return null;
          }
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger: React.FC<
  SelectTriggerProps & {
    onClick?: () => void;
    isOpen?: boolean;
    selectedLabel?: string;
  }
> = ({ children, className = "", onClick, isOpen = false, selectedLabel }) => {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-300 rounded-md
        bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}>
      <span className={selectedLabel ? "text-gray-900" : "text-gray-500"}>
        {selectedLabel || "Select an option"}
      </span>
      <ChevronDown
        className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
      />
    </button>
  );
};

const SelectContent: React.FC<
  SelectContentProps & {
    isOpen?: boolean;
    onSelect?: (value: string, label: string) => void;
  }
> = ({ children, isOpen = false, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, { onSelect } as any);
        }
        return child;
      })}
    </div>
  );
};

const SelectItem: React.FC<
  SelectItemProps & { onSelect?: (value: string, label: string) => void }
> = ({ value, children, onSelect }) => {
  const getLabel = (children: React.ReactNode): string => {
    if (typeof children === "string") {
      return children;
    }
    if (React.isValidElement(children) && (children.props as any).children) {
      return getLabel((children.props as any).children);
    }
    return value;
  };

  return (
    <button
      onClick={() => onSelect?.(value, getLabel(children))}
      className="w-full px-3 py-2 text-sm text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none">
      {children}
    </button>
  );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
  return null; // This component doesn't render anything, it's just for structure
};
export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };
