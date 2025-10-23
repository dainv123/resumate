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
import {
  STORAGE_KEY,
  GEO_DETECTION_KEY,
  LOCATION_CACHE_KEY,
  CACHE_DURATION,
  API_TIMEOUT,
  GPS_TIMEOUT,
  GPS_MAX_AGE,
  GPS_HIGH_ACCURACY,
  IP_API_ENDPOINT,
  REVERSE_GEOCODE_API_ENDPOINT,
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  VIETNAM_COUNTRY_CODE,
} from "@/config/constants";

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

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isDetectingLanguage, setIsDetectingLanguage] =
    useState<boolean>(false);
  const [isGeoDetectionEnabled, setIsGeoDetectionEnabledState] =
    useState<boolean>(true);

  // Add ref to track if detection is already in progress
  const detectionInProgressRef = React.useRef(false);
  const initializationRef = React.useRef(false);

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

      // Check if cache is still valid (within 7 days)
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
        timeout: GPS_TIMEOUT,
        enableHighAccuracy: GPS_HIGH_ACCURACY,
        maximumAge: GPS_MAX_AGE,
      });
    });
  };

  const detectLanguageByLocation =
    useCallback(async (): Promise<Language | null> => {
      try {
        // Check cache first
        const cachedData = getCachedLocationData();
        if (cachedData) {
          console.log("Using cached location data");
          return cachedData.language;
        }

        // Prevent multiple simultaneous API calls
        if (detectionInProgressRef.current) {
          console.log("Detection already in progress, skipping...");
          return null;
        }
        detectionInProgressRef.current = true;

        // First try GPS geolocation
        try {
          const position = await getCurrentPosition();
          const { latitude, longitude } = position.coords;

          const response = await fetch(
            `${REVERSE_GEOCODE_API_ENDPOINT}?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
          );

          if (response.ok) {
            const data = await response.json();
            const countryCode = data.countryCode;
            const detectedLanguage =
              countryCode === VIETNAM_COUNTRY_CODE ? "vi" : "en";

            // Cache the result
            cacheLocationData(
              detectedLanguage,
              countryCode,
              latitude,
              longitude
            );
            return detectedLanguage;
          }
        } catch (gpsError) {
          console.log(
            "GPS geolocation failed, trying IP-based detection",
            gpsError
          );
        }

        // Fallback to IP-based geolocation
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

        let ipResponse;
        try {
          ipResponse = await fetch(IP_API_ENDPOINT, {
            cache: "no-cache",
            signal: controller.signal,
          });
        } finally {
          clearTimeout(timeoutId);
        }
        if (ipResponse.ok) {
          const ipData = await ipResponse.json();
          const countryCode = ipData.country_code;
          const detectedLanguage =
            countryCode === VIETNAM_COUNTRY_CODE ? "vi" : "en";

          // Cache the result
          cacheLocationData(detectedLanguage, countryCode);
          return detectedLanguage;
        }

        return null;
      } catch (error) {
        console.error("Location detection error:", error);
        return null;
      } finally {
        // Reset the flag when detection is complete
        detectionInProgressRef.current = false;
      }
    }, []);

  const detectAndSetLanguage = useCallback(async () => {
    // Don't detect if user has explicitly set a language
    const savedLanguage = localStorage.getItem(STORAGE_KEY);
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as any)) {
      return;
    }

    // Don't detect if we have valid cached data
    const cachedData = getCachedLocationData();
    if (cachedData) {
      return;
    }

    // Don't detect if geolocation is disabled
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

    // Prevent multiple simultaneous detection calls
    if (detectionInProgressRef.current) {
      console.log("Language detection already in progress, skipping...");
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
        "Geolocation detection failed, falling back to browser language",
        detectionError
      );
    }

    // Fallback to browser language detection
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("vi")) {
      setLanguageState("vi");
    } else {
      setLanguageState(DEFAULT_LANGUAGE); // Default to English
    }

    setIsDetectingLanguage(false);
  }, [detectLanguageByLocation]);

  // Load language from localStorage on mount
  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }
    initializationRef.current = true;

    // Load geolocation detection preference
    const geoDetectionPreference = localStorage.getItem(GEO_DETECTION_KEY);
    if (geoDetectionPreference === "false") {
      setIsGeoDetectionEnabledState(false);
    }

    const savedLanguage = localStorage.getItem(STORAGE_KEY) as Language;
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as any)) {
      // User has already set a language preference, use it directly
      setLanguageState(savedLanguage);
      return;
    }

    // Check if we have valid cached location data first
    const cachedData = getCachedLocationData();
    if (cachedData) {
      console.log("Using cached location data on page load");
      setLanguageState(cachedData.language);
      return;
    }

    // Only detect language if no saved preference and no valid cache
    detectAndSetLanguage();
  }, [detectAndSetLanguage]);

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
    throw new Error(
      'useLanguage hook must be used within a LanguageProvider component'
    );
  }
  return context;
}
