import { UnTamperClient } from '../src/client/UnTamperClient';
import { ConfigurationError } from '../src/utils/errors';

describe('UnTamperClient', () => {
  describe('constructor', () => {
    it('should create client with valid configuration', () => {
      const client = new UnTamperClient({
        projectId: 'test-project-id',
        apiKey: 'test-api-key',
      });

      expect(client).toBeInstanceOf(UnTamperClient);
      expect(client.logs).toBeDefined();
      expect(client.queue).toBeDefined();
    });

    it('should throw ConfigurationError for missing projectId', () => {
      expect(() => {
        new UnTamperClient({
          projectId: '',
          apiKey: 'test-api-key',
        });
      }).toThrow(ConfigurationError);
    });

    it('should throw ConfigurationError for missing apiKey', () => {
      expect(() => {
        new UnTamperClient({
          projectId: 'test-project-id',
          apiKey: '',
        });
      }).toThrow(ConfigurationError);
    });

    it('should use default configuration values', () => {
      const client = new UnTamperClient({
        projectId: 'test-project-id',
        apiKey: 'test-api-key',
      });

      const config = client.getConfig();
      expect(config.baseUrl).toBe('https://app.untamper.com');
      expect(config.timeout).toBe(30000);
      expect(config.retryAttempts).toBe(3);
      expect(config.retryDelay).toBe(1000);
    });

    it('should allow custom configuration', () => {
      const client = new UnTamperClient({
        projectId: 'test-project-id',
        apiKey: 'test-api-key',
        baseUrl: 'http://localhost:3000',
        timeout: 5000,
        retryAttempts: 5,
        retryDelay: 2000,
      });

      const config = client.getConfig();
      expect(config.baseUrl).toBe('http://localhost:3000');
      expect(config.timeout).toBe(5000);
      expect(config.retryAttempts).toBe(5);
      expect(config.retryDelay).toBe(2000);
    });
  });
});
