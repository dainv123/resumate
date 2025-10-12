import { AxiosError, AxiosResponse } from 'axios';

// This will be set by the ToastProvider
let globalToastHandler: {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
} | null = null;

export function setGlobalToastHandler(handler: typeof globalToastHandler) {
  globalToastHandler = handler;
}

export function handleApiResponse(response: AxiosResponse) {
  // Check if server sent a success message
  const message = response.data?.message;
  const status = response.data?.status;
  
  if (message && status === 'success' && globalToastHandler) {
    globalToastHandler.showSuccess(message);
  }
  
  return response;
}

// Store for error modals
let rateLimitCallback: ((data: any) => void) | null = null;
let quotaExceededCallback: ((data: any) => void) | null = null;

export function setRateLimitCallback(callback: (data: any) => void) {
  rateLimitCallback = callback;
}

export function setQuotaExceededCallback(callback: (data: any) => void) {
  quotaExceededCallback = callback;
}

export function handleApiError(error: AxiosError) {
  if (!globalToastHandler) {
    return Promise.reject(error);
  }

  const response = error.response;
  
  if (response) {
    // Extract error message from various possible formats
    const message = 
      (response.data as any)?.message ||
      (response.data as any)?.error ||
      `Request failed with status ${response.status}`;
    
    // Handle different status codes
    if (response.status === 429) {
      // Rate limit exceeded
      const data = response.data as any;
      const retryAfter = data.retryAfter || 60;
      const limit = data.limit || 10;
      
      globalToastHandler.showWarning(
        `Too many requests. Please wait ${retryAfter} seconds.`
      );
      
      // Show rate limit modal if callback exists
      if (rateLimitCallback) {
        rateLimitCallback({ retryAfter, limit, message });
      }
    } else if (response.status === 403) {
      const data = response.data as any;
      
      // Check if it's a quota error
      if (data.usage) {
        // Quota exceeded
        globalToastHandler.showError(
          `Monthly ${data.usage.feature} limit reached. Resets ${new Date(data.usage.resetsAt).toLocaleDateString()}.`
        );
        
        // Show quota exceeded modal if callback exists
        if (quotaExceededCallback) {
          quotaExceededCallback(data);
        }
      } else {
        // Regular access denied
        globalToastHandler.showError('Access denied.');
      }
    } else if (response.status === 401) {
      globalToastHandler.showError('Unauthorized. Please login again.');
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    } else if (response.status === 404) {
      globalToastHandler.showError(message || 'Resource not found.');
    } else if (response.status === 422 || response.status === 400) {
      globalToastHandler.showWarning(message || 'Invalid request data.');
    } else if (response.status >= 500) {
      globalToastHandler.showError(message || 'Server error. Please try again later.');
    } else {
      globalToastHandler.showError(message);
    }
  } else if (error.request) {
    // Request was made but no response received
    globalToastHandler.showError('Network error. Please check your connection.');
  } else {
    // Something else happened
    globalToastHandler.showError('An unexpected error occurred.');
  }
  
  return Promise.reject(error);
}

