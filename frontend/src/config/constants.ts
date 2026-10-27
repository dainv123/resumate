// Language and localization constants
export const STORAGE_KEY = "app_language";
export const GEO_DETECTION_KEY = "app_geo_detection_enabled";
export const LOCATION_CACHE_KEY = "app_location_cache";
export const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
export const API_TIMEOUT = 10000; // 10 seconds timeout for API calls

// Geolocation constants
export const GPS_TIMEOUT = 5000; // 5 seconds for GPS timeout
export const GPS_MAX_AGE = 300000; // 5 minutes cache for GPS
export const GPS_HIGH_ACCURACY = false;

// API endpoints
export const IP_API_ENDPOINT = "https://ipapi.co/json/";
export const REVERSE_GEOCODE_API_ENDPOINT = "https://api.bigdatacloud.net/data/reverse-geocode-client";

// Language detection
export const SUPPORTED_LANGUAGES = ["en", "vi"] as const;
export const DEFAULT_LANGUAGE = "en" as const;
export const VIETNAM_COUNTRY_CODE = "VN";
