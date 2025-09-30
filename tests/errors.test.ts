import {
  UnTamperError,
  AuthenticationError,
  ValidationError,
  NetworkError,
  RateLimitError,
  ServerError,
  ConfigurationError,
  createErrorFromResponse,
  createNetworkError,
} from '../src/utils/errors';

describe('Error Classes', () => {
  describe('UnTamperError', () => {
    it('should create error with default values', () => {
      const error = new UnTamperError('Test error');
      
      expect(error.message).toBe('Test error');
      expect(error.name).toBe('UnTamperError');
      expect(error.code).toBe('UNTAMPER_ERROR');
      expect(error.statusCode).toBeUndefined();
      expect(error.details).toBeUndefined();
    });

    it('should create error with custom values', () => {
      const error = new UnTamperError('Test error', 'CUSTOM_CODE', 400, { field: 'test' });
      
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('CUSTOM_CODE');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ field: 'test' });
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError('Invalid API key');
      
      expect(error.message).toBe('Invalid API key');
      expect(error.name).toBe('AuthenticationError');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.statusCode).toBe(401);
    });
  });

  describe('ValidationError', () => {
    it('should create validation error', () => {
      const error = new ValidationError('Invalid request');
      
      expect(error.message).toBe('Invalid request');
      expect(error.name).toBe('ValidationError');
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.statusCode).toBe(400);
    });
  });

  describe('NetworkError', () => {
    it('should create network error', () => {
      const error = new NetworkError('Connection failed');
      
      expect(error.message).toBe('Connection failed');
      expect(error.name).toBe('NetworkError');
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error', () => {
      const error = new RateLimitError('Too many requests');
      
      expect(error.message).toBe('Too many requests');
      expect(error.name).toBe('RateLimitError');
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.statusCode).toBe(429);
    });
  });

  describe('ServerError', () => {
    it('should create server error', () => {
      const error = new ServerError('Internal server error');
      
      expect(error.message).toBe('Internal server error');
      expect(error.name).toBe('ServerError');
      expect(error.code).toBe('SERVER_ERROR');
      expect(error.statusCode).toBe(500);
    });
  });

  describe('ConfigurationError', () => {
    it('should create configuration error', () => {
      const error = new ConfigurationError('Invalid config');
      
      expect(error.message).toBe('Invalid config');
      expect(error.name).toBe('ConfigurationError');
      expect(error.code).toBe('CONFIGURATION_ERROR');
      expect(error.statusCode).toBeUndefined();
    });
  });

  describe('createErrorFromResponse', () => {
    it('should create ValidationError for 400 status', () => {
      const error = createErrorFromResponse(400, { success: false, error: 'Bad request' });
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.statusCode).toBe(400);
    });

    it('should create AuthenticationError for 401 status', () => {
      const error = createErrorFromResponse(401, { success: false, error: 'Unauthorized' });
      
      expect(error).toBeInstanceOf(AuthenticationError);
      expect(error.statusCode).toBe(401);
    });

    it('should create RateLimitError for 429 status', () => {
      const error = createErrorFromResponse(429, { success: false, error: 'Rate limited' });
      
      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.statusCode).toBe(429);
    });

    it('should create ServerError for 500 status', () => {
      const error = createErrorFromResponse(500, { success: false, error: 'Server error' });
      
      expect(error).toBeInstanceOf(ServerError);
      expect(error.statusCode).toBe(500);
    });
  });

  describe('createNetworkError', () => {
    it('should create NetworkError from original error', () => {
      const originalError = new Error('Connection timeout');
      const error = createNetworkError(originalError);
      
      expect(error).toBeInstanceOf(NetworkError);
      expect(error.details).toEqual({ originalError });
    });
  });
});
