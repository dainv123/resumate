"use client";

import { useEffect } from "react";

export default function PerformanceOptimizer() {
  useEffect(() => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalFonts = [
        "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
        "https://fonts.googleapis.com/css2?family=Karla:wght@300;400;500;600;700&display=swap",
      ];

      criticalFonts.forEach((font) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = font;
        link.as = "style";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
      });
    };

    // Optimize scroll performance
    const optimizeScroll = () => {
      let ticking = false;

      const updateScrollPosition = () => {
        // Add any scroll-based optimizations here
        ticking = false;
      };

      const onScroll = () => {
        if (!ticking) {
          requestAnimationFrame(updateScrollPosition);
          ticking = true;
        }
      };

      window.addEventListener("scroll", onScroll, { passive: true });

      return () => {
        window.removeEventListener("scroll", onScroll);
      };
    };

    // Optimize resize performance
    const optimizeResize = () => {
      let resizeTimeout: NodeJS.Timeout;

      const onResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
          // Add any resize-based optimizations here
        }, 250);
      };

      window.addEventListener("resize", onResize, { passive: true });

      return () => {
        window.removeEventListener("resize", onResize);
        clearTimeout(resizeTimeout);
      };
    };

    // Initialize optimizations
    preloadCriticalResources();
    const cleanupScroll = optimizeScroll();
    const cleanupResize = optimizeResize();

    // Cleanup on unmount
    return () => {
      cleanupScroll();
      cleanupResize();
    };
  }, []);

  return null;
}
