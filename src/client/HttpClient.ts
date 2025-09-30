import fetch from 'node-fetch';
import { UnTamperConfig, ErrorResponse } from '../types';
import { 
  UnTamperError, 
  NetworkError, 
  createErrorFromResponse, 
  createNetworkError 
} from '../utils/errors';

/**
 * HTTP client for making requests to the unTamper API
 */
export class HttpClient {
  private readonly config: Required<UnTamperConfig>;
  private readonly baseUrl: string;

  constructor(config: UnTamperConfig) {
    this.config = {
      baseUrl: 'https://api.untamper.com',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      ...config,
    };
    this.baseUrl = this.config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  }

  /**
   * Makes an HTTP request with retry logic
   */
  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount: number = 0
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const requestOptions: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`,
        'User-Agent': '@untamper/sdk-node/1.0.0',
        ...options.headers,
      },
    };

    // Add timeout using AbortController for Node.js 16+
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    requestOptions.signal = controller.signal;

    try {
      const response = await fetch(url, requestOptions as any);
      clearTimeout(timeoutId);

      const responseText = await response.text();
      let responseData: any;

      try {
        responseData = responseText ? JSON.parse(responseText) : {};
      } catch (parseError) {
        throw new UnTamperError(
          `Invalid JSON response: ${responseText}`,
          'INVALID_JSON',
          response.status
        );
      }

      if (!response.ok) {
        const error = createErrorFromResponse(
          response.status,
          responseData as ErrorResponse
        );
        
        // Retry on certain errors
        if (this.shouldRetry(response.status, retryCount)) {
          return this.retryRequest(endpoint, options, retryCount);
        }
        
        throw error;
      }

      return responseData as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof UnTamperError) {
        throw error;
      }

      // Handle network errors
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new NetworkError('Request timeout', { timeout: this.config.timeout });
        }
        
        const networkError = createNetworkError(error);
        
        // Retry on network errors
        if (this.shouldRetry(0, retryCount)) {
          return this.retryRequest(endpoint, options, retryCount);
        }
        
        throw networkError;
      }

      throw new UnTamperError('Unknown error occurred', 'UNKNOWN_ERROR');
    }
  }

  /**
   * Makes a GET request
   */
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  /**
   * Makes a POST request
   */
  async post<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const requestOptions: RequestInit = {
      ...options,
      method: 'POST',
    };
    
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
    
    return this.request<T>(endpoint, requestOptions);
  }

  /**
   * Determines if a request should be retried
   */
  private shouldRetry(statusCode: number, retryCount: number): boolean {
    if (retryCount >= this.config.retryAttempts) {
      return false;
    }

    // Don't retry on client errors (4xx) except for rate limiting
    if (statusCode >= 400 && statusCode < 500 && statusCode !== 429) {
      return false;
    }

    // Retry on server errors (5xx) and rate limiting (429)
    return statusCode >= 500 || statusCode === 429;
  }

  /**
   * Retries a request with exponential backoff
   */
  private async retryRequest<T>(
    endpoint: string,
    options: RequestInit,
    retryCount: number
  ): Promise<T> {
    const delay = this.config.retryDelay * Math.pow(2, retryCount);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return this.request<T>(endpoint, options, retryCount + 1);
  }
}
