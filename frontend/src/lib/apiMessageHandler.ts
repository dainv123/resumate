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
    if (response.status === 401) {
      globalToastHandler.showError('Unauthorized. Please login again.');
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    } else if (response.status === 403) {
      globalToastHandler.showError('Access denied.');
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

