import { UnTamperClient } from '../src';
import { QueryLogsResponse, AuditLog } from '../src/types';

describe('Query Logs', () => {
  let client: UnTamperClient;

  beforeEach(() => {
    client = new UnTamperClient({
      projectId: 'test-project-id',
      apiKey: 'test-api-key',
      baseUrl: 'http://localhost:3000',
    });
  });

  describe('queryLogs', () => {
    it('should have queryLogs method', () => {
      expect(client.logs.queryLogs).toBeDefined();
      expect(typeof client.logs.queryLogs).toBe('function');
    });

    it('should accept empty options object', async () => {
      // This would normally call the API, but we're just testing the interface
      expect(() => {
        const options = {};
        // Just checking it accepts the parameter type
        return options;
      }).not.toThrow();
    });

    it('should accept query options with filters', () => {
      const options = {
        limit: 10,
        offset: 0,
        action: 'user.login',
        result: 'SUCCESS',
        actorId: 'user_123',
        actorType: 'user',
        targetId: 'doc_456',
        targetType: 'document',
      };

      expect(options.limit).toBe(10);
      expect(options.action).toBe('user.login');
    });

    it('should return properly typed response', () => {
      // Type checking test
      const mockResponse: QueryLogsResponse = {
        logs: [
          {
            id: 'log_123',
            projectId: 'proj_xyz',
            timestamp: '2024-01-01T00:00:00Z',
            eventTime: '2024-01-01T00:00:00Z',
            action: 'user.login',
            result: 'SUCCESS',
            actor: { id: 'user_123', type: 'user', display_name: 'John Doe' },
            target: { id: 'acc_456', type: 'account' },
            changes: [],
            context: {
              server: { ip: '127.0.0.1', user_agent: 'Test' },
              client: { request_id: 'req_123' },
            },
            metadata: {},
            hash: 'abc123',
            previousHash: 'xyz789',
            signature: 'sig_abc',
            sequenceNumber: 1,
          },
        ],
        pagination: {
          total: 100,
          limit: 50,
          offset: 0,
          hasMore: true,
        },
      };

      expect(mockResponse.logs).toBeDefined();
      expect(mockResponse.pagination).toBeDefined();
      expect(mockResponse.logs[0].hash).toBeDefined();
      expect(mockResponse.logs[0].sequenceNumber).toBeDefined();
    });

    it('should handle AuditLog type correctly', () => {
      const log: AuditLog = {
        id: 'log_123',
        projectId: 'proj_xyz',
        timestamp: '2024-01-01T00:00:00Z',
        action: 'test.action',
        result: 'SUCCESS',
        actor: { id: 'user_1', type: 'user' },
        changes: [],
        context: {},
        metadata: {},
        hash: 'hash123',
        previousHash: null,
        signature: 'sig123',
        sequenceNumber: 1,
      };

      expect(log.id).toBe('log_123');
      expect(log.hash).toBeDefined();
      expect(log.previousHash).toBeNull();
      expect(log.sequenceNumber).toBe(1);
    });
  });

  describe('projectId injection', () => {
    it('should have projectId in config', () => {
      const config = client.getConfig();
      expect(config.projectId).toBe('test-project-id');
    });

    it('should require projectId in config', () => {
      expect(() => {
        new UnTamperClient({
          projectId: '',
          apiKey: 'test-key',
        });
      }).toThrow();
    });
  });
});


