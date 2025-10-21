import React from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  backUrl?: string;
  headerActions?: React.ReactNode;
  className?: string;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  showBackButton = true,
  backUrl = "/dashboard",
  headerActions,
  className = "",
}: DashboardLayoutProps) {
  const router = useRouter();

  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {showBackButton && (
                <Button
                  variant="outline"
                  className="border-0"
                  onClick={handleBack}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
                {subtitle && (
                  <p className="text-sm text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex items-center space-x-3">{headerActions}</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">{children}</div>
    </div>
  );
}
