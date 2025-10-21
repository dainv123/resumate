"use client";

import React, { useState } from 'react';

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ defaultValue, children, className = "" }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);

  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === TabsList) {
            return React.cloneElement(child, { 
              activeTab, 
              setActiveTab 
            } as any);
          }
          if (child.type === TabsContent) {
            return React.cloneElement(child, { 
              activeTab 
            } as any);
          }
        }
        return child;
      })}
    </div>
  );
};

const TabsList: React.FC<TabsListProps & { activeTab?: string; setActiveTab?: (tab: string) => void }> = ({ 
  children, 
  className = "",
  activeTab,
  setActiveTab
}) => {
  return (
    <div className={`flex border-b border-gray-200 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === TabsTrigger) {
          return React.cloneElement(child, { 
            activeTab, 
            setActiveTab 
          } as any);
        }
        return child;
      })}
    </div>
  );
};

const TabsTrigger: React.FC<TabsTriggerProps & { activeTab?: string; setActiveTab?: (tab: string) => void }> = ({ 
  value, 
  children, 
  className = "",
  activeTab,
  setActiveTab
}) => {
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab?.(value)}
      className={`
        px-4 py-2 text-sm font-medium border-b-2 transition-colors
        ${isActive 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<TabsContentProps & { activeTab?: string }> = ({ 
  value, 
  children, 
  className = "",
  activeTab
}) => {
  if (activeTab !== value) return null;

  return (
    <div className={`mt-4 ${className}`}>
      {children}
    </div>
  );
};
export { Tabs, TabsList, TabsTrigger, TabsContent };