export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

export function errorResponse<T>(error: string): ApiResponse<T> {
  return {
    success: false,
    error,
  };
}

export function notFoundResponse<T>(resource: string): ApiResponse<T> {
  return errorResponse(`${resource} not found`);
}

export function badRequestResponse<T>(message: string): ApiResponse<T> {
  return errorResponse(`Bad request: ${message}`);
}

export function internalErrorResponse<T>(message?: string): ApiResponse<T> {
  return errorResponse(message || 'Internal server error');
}
