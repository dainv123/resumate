"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Clock, CheckCircle, Zap } from "lucide-react";

export type ProcessingType = "tailor" | "cover-letter" | "analyze";

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: ProcessingType;
  mutation?: any;
}

const ProcessingModal: React.FC<ProcessingModalProps> = ({
  isOpen,
  onClose,
  type = "tailor",
  mutation,
}) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get steps based on processing type
  const getSteps = () => {
    switch (type) {
      case "cover-letter":
        return [
          t("jobTailor.ux.steps.reading"),
          t("jobTailor.ux.steps.analyzing"),
          t("jobTailor.ux.steps.generating"),
        ];
      case "analyze":
        return [
          t("jobTailor.ux.steps.reading"),
          t("jobTailor.ux.steps.analyzing"),
          t("jobTailor.ux.steps.generating"),
        ];
      case "tailor":
      default:
        return [
          t("jobTailor.ux.steps.reading"),
          t("jobTailor.ux.steps.analyzing"),
          t("jobTailor.ux.steps.tailoring"),
          t("jobTailor.ux.steps.generating"),
        ];
    }
  };

  const steps = getSteps();

  // Get processing title based on type
  const getProcessingTitle = () => {
    switch (type) {
      case "cover-letter":
        return t("jobTailor.generatingCoverLetter");
      case "analyze":
        return t("jobTailor.analyzingCompatibility");
      case "tailor":
      default:
        return t("jobTailor.ux.processingTitle");
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    console.log("ProcessingModal useEffect triggered");

    // Reset state when modal opens
    setCurrentStep(0);
    setIsCompleted(false);
    setIsLoading(true);

    // If we have a mutation, sync with its state
    if (mutation) {
      if (mutation.isSuccess || mutation.isError) {
        // API completed, show completion and close
        setIsLoading(false);
        setIsCompleted(true);
        setTimeout(() => {
          onClose();
        }, 1500);
        return;
      }

      // API is pending, show loading and progress
      const progressInterval = setInterval(() => {
        if (mutation.isSuccess || mutation.isError) {
          setIsLoading(false);
          setIsCompleted(true);
          clearInterval(progressInterval);
          setTimeout(() => {
            onClose();
          }, 1500);
          return;
        }

        // Progress through steps based on time elapsed
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // Change step every 2 seconds

      return () => {
        clearInterval(progressInterval);
      };
    } else {
      // Fallback: no mutation, use loading with steps
      const stepInterval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= steps.length - 1) {
            setIsLoading(false);
            setIsCompleted(true);
            return prev;
          }
          return prev + 1;
        });
      }, 3000); // Change step every 3 seconds

      return () => {
        clearInterval(stepInterval);
      };
    }
  }, [isOpen, steps.length, mutation, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              {isCompleted ? (
                <CheckCircle className="h-16 w-16 text-green-500 animate-pulse" />
              ) : (
                <Zap className="h-16 w-16 text-blue-600 animate-pulse" />
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {isCompleted ? t("jobTailor.ux.completed") : getProcessingTitle()}
            </h3>
            <p className="text-gray-600 text-sm">
              {t("jobTailor.ux.processingSubtitle")}
            </p>
          </div>

          {/* Loading Status */}
          <div className="mb-6">
            {/* <div className="flex items-center justify-center gap-2 mb-2">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
              ) : (
                <Clock className="h-5 w-5 text-blue-600" />
              )}
              <span className="text-sm text-gray-600">
                {isCompleted
                  ? t("jobTailor.ux.completed")
                  : isLoading
                  ? t("jobTailor.ux.processing")
                  : t("jobTailor.ux.ready")}
              </span>
            </div> */}
            {/* <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000 ease-out"
                style={{
                  width: isCompleted
                    ? "100%"
                    : `${((currentStep + 1) / steps.length) * 100}%`,
                }}></div>
            </div> */}
          </div>

          {/* Progress Steps */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center p-3 rounded-lg transition-all duration-300 ${
                  index === currentStep
                    ? "bg-blue-50 border border-blue-200"
                    : index < currentStep
                    ? "bg-green-50 border border-green-200"
                    : "bg-gray-50 border border-gray-200"
                }`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                    index === currentStep
                      ? "bg-blue-600 text-white animate-pulse"
                      : index < currentStep
                      ? "bg-green-600 text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}>
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    index === currentStep
                      ? "text-blue-900"
                      : index < currentStep
                      ? "text-green-900"
                      : "text-gray-600"
                  }`}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                {t("jobTailor.ux.progress", {
                  current: currentStep + 1,
                  total: steps.length,
                })}
              </span>
              <span className="flex items-center gap-2">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>{" "}
                    {t("jobTailor.ux.processing")}
                  </>
                ) : (
                  t("jobTailor.ux.ready")
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Almost Done Message */}
          {/* {currentStep >= steps.length - 1 && isLoading && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800 font-medium">
                {t("jobTailor.ux.almostDone")}
              </p>
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default ProcessingModal;
