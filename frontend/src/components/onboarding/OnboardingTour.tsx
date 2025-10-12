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
import { useLanguage } from "@/contexts/LanguageContext";

interface OnboardingTourProps {
  run: boolean;
  onComplete?: () => void;
}

interface TourStep {
  titleKey: string;
  contentKey: string;
  target?: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
}

const steps: TourStep[] = [
  {
    titleKey: "onboarding.welcome.title",
    contentKey: "onboarding.welcome.content",
    placement: "center",
  },
  {
    titleKey: "onboarding.uploadCV.title",
    contentKey: "onboarding.uploadCV.content",
    target: '[data-tour="upload-cv"]',
    placement: "bottom",
  },
  {
    titleKey: "onboarding.viewCV.title",
    contentKey: "onboarding.viewCV.content",
    target: '[data-tour="cv-preview"]',
    placement: "top",
  },
  {
    titleKey: "onboarding.tailorJob.title",
    contentKey: "onboarding.tailorJob.content",
    target: '[data-tour="tailor-button"]',
    placement: "bottom",
  },
  {
    titleKey: "onboarding.export.title",
    contentKey: "onboarding.export.content",
    target: '[data-tour="export-button"]',
    placement: "left",
  },
  {
    titleKey: "onboarding.portfolio.title",
    contentKey: "onboarding.portfolio.content",
    target: '[data-tour="portfolio-nav"]',
    placement: "right",
  },
  {
    titleKey: "onboarding.settings.title",
    contentKey: "onboarding.settings.content",
    target: '[data-tour="settings-nav"]',
    placement: "right",
  },
  {
    titleKey: "onboarding.allSet.title",
    contentKey: "onboarding.allSet.content",
    placement: "center",
  },
];

export default function OnboardingTour({
  run,
  onComplete,
}: OnboardingTourProps) {
  const { t } = useLanguage();
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
          {t("onboarding.finish")}
        </>
      );
    }
    return (
      <>
        {t("onboarding.next")}
        <ArrowRight className="h-4 w-4 ml-1" />
      </>
    );
  }, [currentStep, t]);

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
                    {t(currentStepData.titleKey as any)}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">
                      {t("onboarding.step", {
                        current: currentStep + 1,
                        total: steps.length,
                      })}
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
                {t(currentStepData.contentKey as any)}
              </p>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div>
                  {currentStep > 0 && (
                    <Button variant="outline" size="sm" onClick={handleBack}>
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      {t("onboarding.back")}
                    </Button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleSkip}>
                    {t("onboarding.skipTour")}
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
