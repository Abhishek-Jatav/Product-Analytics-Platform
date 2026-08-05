/**
 * Mirrors the backend's standard { success, message, data, errors } envelope
 * (see backend/app/core/response.py) so every service can type responses the same way.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
  errors: unknown;
}
