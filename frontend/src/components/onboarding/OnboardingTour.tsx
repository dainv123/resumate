"use client";

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";

interface OnboardingTourProps {
  run: boolean;
  onComplete?: () => void;
}

interface TourStep {
  title: string;
  content: string;
  target?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

const steps: TourStep[] = [
  {
    title: "Welcome to Resumate! 🎉",
    content:
      "Let's take a quick tour to help you get started with creating and managing your professional CVs.",
    placement: "center",
  },
  {
    title: "Upload Your CV",
    content:
      "Start by uploading your existing CV (PDF or Word format). Our AI will automatically extract and organize all your information.",
    target: '[data-tour="upload-cv"]',
    placement: "bottom",
  },
  {
    title: "View Your Parsed CV",
    content:
      "Once uploaded, you'll see your CV data beautifully organized. You can edit, duplicate, or export it anytime.",
    target: '[data-tour="cv-preview"]',
    placement: "top",
  },
  {
    title: "Tailor for Jobs",
    content:
      "Customize your CV for specific job descriptions. Our AI will highlight relevant experience and optimize keywords.",
    target: '[data-tour="tailor-button"]',
    placement: "bottom",
  },
  {
    title: "Export Your CV",
    content:
      "Export your CV in multiple formats: PDF (with templates), Word, or ATS-friendly text format.",
    target: '[data-tour="export-button"]',
    placement: "left",
  },
  {
    title: "Create Portfolio",
    content:
      "Generate a beautiful online portfolio from your CV data and share it with potential employers or clients.",
    target: '[data-tour="portfolio-nav"]',
    placement: "right",
  },
  {
    title: "Settings & Preferences",
    content:
      "Customize your experience: change language, enable dark mode, and manage your account.",
    target: '[data-tour="settings-nav"]',
    placement: "right",
  },
  {
    title: "You're All Set! 🚀",
    content:
      "Ready to create amazing CVs? Start by uploading your first CV or explore the features at your own pace.",
    placement: "center",
  },
];

export default function OnboardingTour({
  run,
  onComplete,
}: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const highlightedElementRef = useRef<HTMLElement | null>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize current step data
  const currentStepData = useMemo(() => steps[currentStep], [currentStep]);
  const isCenter = useMemo(
    () => currentStepData.placement === "center" || !currentStepData.target,
    [currentStepData]
  );

  useEffect(() => {
    if (run) {
      setIsVisible(true);
      setCurrentStep(0);
    } else {
      setIsVisible(false);
    }
  }, [run]);

  const removeHighlight = useCallback(() => {
    if (highlightedElementRef.current) {
      highlightedElementRef.current.style.position = "";
      highlightedElementRef.current.style.zIndex = "";
      // highlightedElementRef.current.style.boxShadow = "";
      // highlightedElementRef.current.style.borderRadius = "";
      highlightedElementRef.current = null;
    }
  }, []);

  const highlightElement = useCallback(() => {
    const target = steps[currentStep].target;
    if (!target) {
      removeHighlight();
      return;
    }

    const element = document.querySelector(target) as HTMLElement;
    if (!element) {
      removeHighlight();
      return;
    }

    // Remove previous highlight
    removeHighlight();

    // Scroll element into view
    element.scrollIntoView({ behavior: "smooth", block: "center" });

    // Add highlight styles
    element.style.position = "relative";
    element.style.zIndex = "10000";
    // element.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 0 8px rgba(59, 130, 246, 0.3)";
    // element.style.borderRadius = "8px";
    element.style.transition = "all 0.3s ease";

    // Store reference
    highlightedElementRef.current = element;
  }, [currentStep, removeHighlight]);

  const updatePosition = useCallback(() => {
    const target = steps[currentStep].target;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const tooltipWidth = 384;
    const tooltipHeight = 300;

    // If no target or element not found, center on screen
    if (!target) {
      setPosition({
        top: viewportHeight / 2,
        left: viewportWidth / 2,
      });
      return;
    }

    const element = document.querySelector(target);
    if (!element) {
      // Element not found, center on screen
      setPosition({
        top: viewportHeight / 2,
        left: viewportWidth / 2,
      });
      return;
    }

    if (element) {
      const rect = element.getBoundingClientRect();
      const placement = steps[currentStep].placement || "bottom";
      const padding = 20;

      let top = 0;
      let left = 0;

      switch (placement) {
        case "top":
          top = rect.top - tooltipHeight - padding;
          left = rect.left + rect.width / 2;
          break;
        case "bottom":
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - tooltipWidth - padding;
          break;
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + padding;
          break;
      }

      // Ensure card stays within screen bounds
      // Horizontal constraint (min card width = 384px)
      const minCardWidth = 384;
      const effectiveCardWidth = Math.max(tooltipWidth, minCardWidth);
      const maxLeft = viewportWidth - effectiveCardWidth;
      if (left > maxLeft) {
        left = maxLeft;
      }

      // Vertical constraint (min card height = 300px)
      const minCardHeight = 300;
      const effectiveCardHeight = Math.max(tooltipHeight, minCardHeight);
      const maxTop = viewportHeight - effectiveCardHeight;
      if (top > maxTop) {
        top = maxTop;
      }

      // Calculate actual edges with transform: translate(-50%, -50%)
      const tooltipLeft = left - tooltipWidth / 2;
      const tooltipRight = left + tooltipWidth / 2;
      const tooltipTop = top - tooltipHeight / 2;
      const tooltipBottom = top + tooltipHeight / 2;

      // Fix horizontal overflow
      if (tooltipLeft < padding) {
        // Left edge ra ngoài trái
        const shift = padding - tooltipLeft;
        left += shift;
      } else if (tooltipRight > viewportWidth - padding) {
        // Right edge ra ngoài phải
        const shift = tooltipRight - (viewportWidth - padding);
        left -= shift;
      }

      // Fix vertical overflow
      if (tooltipTop < padding) {
        // Top edge ra ngoài trên
        const shift = padding - tooltipTop;
        top += shift;
      } else if (tooltipBottom > viewportHeight - padding) {
        // Bottom edge ra ngoài dưới
        const shift = tooltipBottom - (viewportHeight - padding);
        top -= shift;
      }

      // Final safety check - clamp values
      left = Math.max(
        tooltipWidth / 2 + padding,
        Math.min(left, viewportWidth - tooltipWidth / 2 - padding)
      );
      top = Math.max(
        tooltipHeight / 2 + padding,
        Math.min(top, viewportHeight - tooltipHeight / 2 - padding)
      );

      setPosition({ top, left });
    }
  }, [currentStep]);

  // Debounced resize handler
  const handleResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      if (isVisible && steps[currentStep].target) {
        updatePosition();
      }
    }, 150); // Debounce 150ms
  }, [isVisible, currentStep, updatePosition]);

  // Effect for positioning and highlighting
  useEffect(() => {
    if (isVisible && steps[currentStep].target) {
      updatePosition();
      highlightElement();
    } else {
      removeHighlight();
    }

    return () => removeHighlight();
  }, [
    currentStep,
    isVisible,
    updatePosition,
    highlightElement,
    removeHighlight,
  ]);

  // Effect for resize listener
  useEffect(() => {
    if (isVisible) {
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
        }
      };
    }
  }, [isVisible, handleResize]);

  const handleComplete = useCallback(() => {
    setIsVisible(false);
    removeHighlight();
    onComplete?.();
  }, [onComplete, removeHighlight]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    handleComplete();
  }, [handleComplete]);

  // Memoize progress percentage
  const progressPercentage = useMemo(
    () => ((currentStep + 1) / steps.length) * 100,
    [currentStep]
  );

  // Memoize animation variants
  const overlayVariants = useMemo(
    () => ({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    }),
    []
  );

  const cardVariants = useMemo(
    () => ({
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.9 },
    }),
    []
  );

  // Memoize card style
  const cardStyle = useMemo(() => {
    if (isCenter) {
      return { pointerEvents: "auto" as const };
    }
    return {
      pointerEvents: "auto" as const,
      top: `${position.top}px`,
      left: `${position.left}px`,
      transform: "translate(-50%, -50%)",
    };
  }, [isCenter, position]);

  // Memoize next button content
  const nextButtonContent = useMemo(() => {
    if (currentStep === steps.length - 1) {
      return (
        <>
          <CheckCircle className="h-4 w-4 mr-1" />
          Finish
        </>
      );
    }
    return (
      <>
        Next
        <ArrowRight className="h-4 w-4 ml-1" />
      </>
    );
  }, [currentStep]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            {...overlayVariants}
            className="fixed inset-0 bg-black/60 z-[9998] mb-0"
            style={{ pointerEvents: "none" }}
          />

          {/* Tour Card */}
          <motion.div
            {...cardVariants}
            className={`fixed z-[9999] ${
              isCenter
                ? "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                : ""
            }`}
            style={cardStyle}>
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {currentStepData.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      Step {currentStep + 1} of {steps.length}
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
                        style={{
                          width: `${progressPercentage}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleSkip}
                  className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6 leading-relaxed">
                {currentStepData.content}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Back
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSkip}>
                    Skip Tour
                  </Button>
                  <Button onClick={handleNext}>{nextButtonContent}</Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
