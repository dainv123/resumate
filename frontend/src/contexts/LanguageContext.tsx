"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

type Language = "en" | "vi";

type TranslationKey = string;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (
    key: TranslationKey,
    variables?: Record<string, string | number>
  ) => string;
  languages: { code: Language; name: string; nativeName: string }[];
  isDetectingLanguage: boolean;
  isGeoDetectionEnabled: boolean;
  setGeoDetectionEnabled: (enabled: boolean) => void;
  redetectLanguage: () => Promise<void>;
}

const translations = {
  en,
  vi,
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

const STORAGE_KEY = "app_language";
const GEO_DETECTION_KEY = "app_geo_detection_enabled";
const LOCATION_CACHE_KEY = "app_location_cache";
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [isDetectingLanguage, setIsDetectingLanguage] =
    useState<boolean>(false);
  const [isGeoDetectionEnabled, setIsGeoDetectionEnabledState] =
    useState<boolean>(true);

  const detectAndSetLanguage = useCallback(async () => {
    // Check if geolocation detection is enabled
    const geoDetectionEnabled = localStorage.getItem(GEO_DETECTION_KEY);
    if (geoDetectionEnabled === "false") {
      // Skip geolocation detection, use browser language only
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("vi")) {
        setLanguageState("vi");
      } else {
        setLanguageState("en");
      }
      return;
    }

    setIsDetectingLanguage(true);

    try {
      // First try geolocation detection
      const detectedLang = await detectLanguageByLocation();
      if (detectedLang) {
        setLanguageState(detectedLang);
        setIsDetectingLanguage(false);
        return;
      }
    } catch (detectionError) {
      console.log(
        "Geolocation detection failed, falling back to browser language"
      );
    }

    // Fallback to browser language detection
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("vi")) {
      setLanguageState("vi");
    } else {
      setLanguageState("en"); // Default to English
    }

    setIsDetectingLanguage(false);
  }, []);

  // Load language from localStorage on mount
  useEffect(() => {
    // Load geolocation detection preference
    const geoDetectionPreference = localStorage.getItem(GEO_DETECTION_KEY);
    if (geoDetectionPreference === "false") {
      setIsGeoDetectionEnabledState(false);
    }

    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language;
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "vi")) {
      setLanguageState(savedLanguage);
    } else {
      // Detect language based on browser and geolocation
      detectAndSetLanguage();
    }
  }, [detectAndSetLanguage]);

  const detectLanguageByLocation = async (): Promise<Language | null> => {
    try {
      // Check cache first
      const cachedData = getCachedLocationData();
      if (cachedData) {
        console.log("Using cached location data");
        return cachedData.language;
      }

      // First try GPS geolocation
      try {
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;

        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );

        if (response.ok) {
          const data = await response.json();
          const countryCode = data.countryCode;
          const detectedLanguage = countryCode === "VN" ? "vi" : "en";

          // Cache the result
          cacheLocationData(detectedLanguage, countryCode, latitude, longitude);
          return detectedLanguage;
        }
      } catch (gpsError) {
        console.log("GPS geolocation failed, trying IP-based detection");
      }

      // Fallback to IP-based geolocation
      const ipResponse = await fetch("https://ipapi.co/json/", {
        cache: "no-cache",
      });
      if (ipResponse.ok) {
        const ipData = await ipResponse.json();
        const countryCode = ipData.country_code;
        const detectedLanguage = countryCode === "VN" ? "vi" : "en";

        // Cache the result
        cacheLocationData(detectedLanguage, countryCode);
        return detectedLanguage;
      }

      return null;
    } catch (error) {
      console.error("Location detection error:", error);
      return null;
    }
  };

  const getCachedLocationData = (): {
    language: Language;
    countryCode: string;
    timestamp: number;
  } | null => {
    try {
      const cached = localStorage.getItem(LOCATION_CACHE_KEY);
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid (within 24 hours)
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem(LOCATION_CACHE_KEY);
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error reading cached location data:", error);
      return null;
    }
  };

  const cacheLocationData = (
    language: Language,
    countryCode: string,
    latitude?: number,
    longitude?: number
  ) => {
    try {
      const cacheData = {
        language,
        countryCode,
        latitude,
        longitude,
        timestamp: Date.now(),
      };
      localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error caching location data:", error);
    }
  };

  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 5000,
        enableHighAccuracy: false,
        maximumAge: 300000, // 5 minutes cache
      });
    });
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  const setGeoDetectionEnabled = (enabled: boolean) => {
    setIsGeoDetectionEnabledState(enabled);
    localStorage.setItem(GEO_DETECTION_KEY, enabled.toString());
  };

  const redetectLanguage = async () => {
    // Clear saved language and location cache to force detection
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(LOCATION_CACHE_KEY);
    await detectAndSetLanguage();
  };

  const t = (
    key: TranslationKey,
    variables?: Record<string, string | number>
  ): string => {
    const keys = key.split(".");
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        // Fallback to English if key not found
        let fallback: any = translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === "object" && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key itself if not found
          }
        }
        value = fallback;
        break;
      }
    }

    let result = typeof value === "string" ? value : key;

    // Replace variables in the format {{variable}}
    if (variables) {
      Object.entries(variables).forEach(([varKey, varValue]) => {
        result = result.replace(
          new RegExp(`\\{\\{${varKey}\\}\\}`, "g"),
          String(varValue)
        );
      });
    }

    return result;
  };

  const languages = [
    { code: "en" as Language, name: "English", nativeName: "English" },
    { code: "vi" as Language, name: "Vietnamese", nativeName: "Tiếng Việt" },
  ];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages,
        isDetectingLanguage,
        isGeoDetectionEnabled,
        setGeoDetectionEnabled,
        redetectLanguage,
      }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
