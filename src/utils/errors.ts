import { ErrorResponse } from '../types/responses';

/**
 * Base error class for all unTamper SDK errors
 */
export class UnTamperError extends Error {
  public readonly code: string;
  public readonly statusCode: number | undefined;
  public readonly details: any;

  constructor(message: string, code: string = 'UNTAMPER_ERROR', statusCode?: number, details?: any) {
    super(message);
    this.name = 'UnTamperError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnTamperError);
    }
  }
}

/**
 * Authentication error - invalid or missing API key
 */
export class AuthenticationError extends UnTamperError {
  constructor(message: string = 'Invalid or missing API key', details?: any) {
    super(message, 'AUTHENTICATION_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

/**
 * Validation error - invalid request format or data
 */
export class ValidationError extends UnTamperError {
  constructor(message: string = 'Invalid request format', details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

/**
 * Network error - connection issues, timeouts, etc.
 */
export class NetworkError extends UnTamperError {
  constructor(message: string = 'Network error occurred', details?: any) {
    super(message, 'NETWORK_ERROR', undefined, details);
    this.name = 'NetworkError';
  }
}

/**
 * Rate limit error - too many requests
 */
export class RateLimitError extends UnTamperError {
  constructor(message: string = 'Rate limit exceeded', details?: any) {
    super(message, 'RATE_LIMIT_ERROR', 429, details);
    this.name = 'RateLimitError';
  }
}

/**
 * Server error - internal server errors
 */
export class ServerError extends UnTamperError {
  constructor(message: string = 'Internal server error', details?: any) {
    super(message, 'SERVER_ERROR', 500, details);
    this.name = 'ServerError';
  }
}

/**
 * Configuration error - invalid SDK configuration
 */
export class ConfigurationError extends UnTamperError {
  constructor(message: string = 'Invalid configuration', details?: any) {
    super(message, 'CONFIGURATION_ERROR', undefined, details);
    this.name = 'ConfigurationError';
  }
}

/**
 * Creates an appropriate error from an HTTP response
 */
export function createErrorFromResponse(
  statusCode: number,
  errorResponse?: ErrorResponse,
  originalError?: Error
): UnTamperError {
  const message = errorResponse?.error || 'Unknown error occurred';
  const details = errorResponse?.details;

  switch (statusCode) {
    case 400:
      return new ValidationError(message, details);
    case 401:
      return new AuthenticationError(message, details);
    case 429:
      return new RateLimitError(message, details);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(message, details);
    default:
      if (originalError) {
        return new NetworkError(originalError.message, { originalError, statusCode });
      }
      return new UnTamperError(message, 'HTTP_ERROR', statusCode, details);
  }
}

/**
 * Creates an error from a network/connection issue
 */
export function createNetworkError(originalError: Error): NetworkError {
  return new NetworkError(originalError.message, { originalError });
}
