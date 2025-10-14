import { VerificationService } from '../src/services/VerificationService';
import { HttpClient } from '../src/client/HttpClient';
import { AuditLog } from '../src/types';
import { computeLogHash, verifyECDSASignature } from '../src/utils/crypto';

// Mock the HttpClient
jest.mock('../src/client/HttpClient');

describe('VerificationService', () => {
  let verificationService: VerificationService;
  let mockHttpClient: jest.Mocked<HttpClient>;

  const mockPublicKey = `-----BEGIN PUBLIC KEY-----
MFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEAwJYVglMpA6MWsVOy2pcL3uPID6vSiG0
ZRbsYkC8KYnV2gpvn2M2Pkd7qO4TTi0EQAPWwMvXXYfFCayqwYLe5g==
-----END PUBLIC KEY-----`;

  const mockAuditLog: AuditLog = {
    id: 'log_123',
    projectId: 'proj_456',
    timestamp: '2024-01-01T10:00:00Z',
    eventTime: '2024-01-01T10:00:00Z',
    action: 'user.login',
    result: 'SUCCESS',
    actor: {
      id: 'user_123',
      type: 'user',
      display_name: 'John Doe',
    },
    target: {
      id: 'account_456',
      type: 'account',
      display_name: 'Main Account',
    },
    changes: [
      {
        path: 'last_login',
        old_value: null,
        new_value: '2024-01-01T10:00:00Z',
      },
    ],
    context: {
      server: {
        ip: '192.168.1.1',
        user_agent: 'Mozilla/5.0...',
      },
      client: {
        request_id: 'req_123',
        session_id: 'sess_456',
      },
    },
    metadata: {
      version: '1.0.0',
      environment: 'production',
    },
    hash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
    previousHash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    signature: 'base64_encoded_ecdsa_signature_here',
    sequenceNumber: 42,
  };

  beforeEach(() => {
    mockHttpClient = new HttpClient({} as any) as jest.Mocked<HttpClient>;
    verificationService = new VerificationService(mockHttpClient);
  });

  describe('initialize', () => {
    it('should fetch and cache the public key', async () => {
      mockHttpClient.getText.mockResolvedValue(mockPublicKey);

      await verificationService.initialize();

      expect(mockHttpClient.getText).toHaveBeenCalledWith('/api/v1/public-key');
    });

    it('should not fetch public key multiple times', async () => {
      mockHttpClient.getText.mockResolvedValue(mockPublicKey);

      await verificationService.initialize();
      await verificationService.initialize();

      expect(mockHttpClient.getText).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch errors', async () => {
      mockHttpClient.getText.mockRejectedValue(new Error('Network error'));

      await expect(verificationService.initialize()).rejects.toThrow(
        'Failed to fetch public key: Network error'
      );
    });
  });

  describe('verifyLog', () => {
    beforeEach(async () => {
      mockHttpClient.getText.mockResolvedValue(mockPublicKey);
      await verificationService.initialize();
    });

    it('should verify a valid log', async () => {
      // Mock the hash computation to return the expected hash
      const computedHash = computeLogHash(mockAuditLog);
      const mockLogWithCorrectHash = { ...mockAuditLog, hash: computedHash };

      // Mock signature verification to return true
      jest.spyOn(require('../src/utils/crypto'), 'verifyECDSASignature')
        .mockReturnValue(true);

      const result = await verificationService.verifyLog(mockLogWithCorrectHash);

      expect(result.valid).toBe(true);
      expect(result.hashValid).toBe(true);
      expect(result.signatureValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect hash mismatch', async () => {
      const result = await verificationService.verifyLog(mockAuditLog);

      expect(result.valid).toBe(false);
      expect(result.hashValid).toBe(false);
      expect(result.signatureValid).toBe(false);
      expect(result.error).toBe('Hash mismatch - log data tampered');
    });

    it('should detect invalid signature', async () => {
      // Mock the hash computation to return the expected hash
      const computedHash = computeLogHash(mockAuditLog);
      const mockLogWithCorrectHash = { ...mockAuditLog, hash: computedHash };

      // Mock signature verification to return false
      jest.spyOn(require('../src/utils/crypto'), 'verifyECDSASignature')
        .mockReturnValue(false);

      const result = await verificationService.verifyLog(mockLogWithCorrectHash);

      expect(result.valid).toBe(false);
      expect(result.hashValid).toBe(true);
      expect(result.signatureValid).toBe(false);
      expect(result.error).toBe('Invalid ECDSA signature');
    });
  });

  describe('verifyLogs', () => {
    beforeEach(async () => {
      mockHttpClient.getText.mockResolvedValue(mockPublicKey);
      await verificationService.initialize();
    });

    it('should verify a valid chain', async () => {
      const log1 = {
        ...mockAuditLog,
        sequenceNumber: 1,
        previousHash: null,
        hash: 'hash1',
      };
      const log2 = {
        ...mockAuditLog,
        sequenceNumber: 2,
        previousHash: 'hash1',
        hash: 'hash2',
      };

      // Mock hash computation and signature verification
      jest.spyOn(require('../src/utils/crypto'), 'computeLogHash')
        .mockReturnValueOnce('hash1')
        .mockReturnValueOnce('hash2');
      jest.spyOn(require('../src/utils/crypto'), 'verifyECDSASignature')
        .mockReturnValue(true);

      const result = await verificationService.verifyLogs([log1, log2]);

      expect(result.valid).toBe(true);
      expect(result.totalLogs).toBe(2);
      expect(result.validLogs).toBe(2);
      expect(result.invalidLogs).toBe(0);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect broken chain', async () => {
      const log1 = {
        ...mockAuditLog,
        sequenceNumber: 1,
        previousHash: null,
        hash: 'hash1',
      };
      const log2 = {
        ...mockAuditLog,
        sequenceNumber: 2,
        previousHash: 'wrong_hash', // Wrong previous hash
        hash: 'hash2',
      };

      // Mock hash computation and signature verification
      jest.spyOn(require('../src/utils/crypto'), 'computeLogHash')
        .mockReturnValueOnce('hash1')
        .mockReturnValueOnce('hash2');
      jest.spyOn(require('../src/utils/crypto'), 'verifyECDSASignature')
        .mockReturnValue(true);

      const result = await verificationService.verifyLogs([log1, log2]);

      expect(result.valid).toBe(false);
      expect(result.totalLogs).toBe(2);
      expect(result.validLogs).toBe(1);
      expect(result.invalidLogs).toBe(1);
      expect(result.brokenAt).toBe(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Chain broken: previousHash mismatch');
    });

    it('should detect sequence gaps', async () => {
      const log1 = {
        ...mockAuditLog,
        sequenceNumber: 1,
        previousHash: null,
        hash: 'hash1',
      };
      const log2 = {
        ...mockAuditLog,
        sequenceNumber: 3, // Gap in sequence
        previousHash: 'hash1',
        hash: 'hash2',
      };

      // Mock hash computation and signature verification
      jest.spyOn(require('../src/utils/crypto'), 'computeLogHash')
        .mockReturnValueOnce('hash1')
        .mockReturnValueOnce('hash2');
      jest.spyOn(require('../src/utils/crypto'), 'verifyECDSASignature')
        .mockReturnValue(true);

      const result = await verificationService.verifyLogs([log1, log2]);

      expect(result.valid).toBe(false);
      expect(result.totalLogs).toBe(2);
      expect(result.validLogs).toBe(1);
      expect(result.invalidLogs).toBe(1);
      expect(result.brokenAt).toBe(3);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain('Sequence gap: expected 2');
    });

    it('should sort logs by sequence number', async () => {
      const log2 = {
        ...mockAuditLog,
        sequenceNumber: 2,
        previousHash: 'hash1',
        hash: 'hash2',
      };
      const log1 = {
        ...mockAuditLog,
        sequenceNumber: 1,
        previousHash: null,
        hash: 'hash1',
      };

      // Mock hash computation and signature verification
      jest.spyOn(require('../src/utils/crypto'), 'computeLogHash')
        .mockReturnValueOnce('hash1')
        .mockReturnValueOnce('hash2');
      jest.spyOn(require('../src/utils/crypto'), 'verifyECDSASignature')
        .mockReturnValue(true);

      const result = await verificationService.verifyLogs([log2, log1]); // Out of order

      expect(result.valid).toBe(true);
      expect(result.totalLogs).toBe(2);
      expect(result.validLogs).toBe(2);
    });
  });
});

describe('Crypto utilities', () => {
  describe('computeLogHash', () => {
    it('should produce deterministic hashes', () => {
      const log: AuditLog = {
        id: 'log_123',
        projectId: 'proj_456',
        timestamp: '2024-01-01T10:00:00Z',
        eventTime: '2024-01-01T10:00:00Z',
        action: 'user.login',
        result: 'SUCCESS',
        actor: {
          id: 'user_123',
          type: 'user',
        },
        changes: [],
        context: {},
        metadata: {},
        hash: '',
        previousHash: null,
        signature: '',
        sequenceNumber: 1,
      };

      const hash1 = computeLogHash(log);
      const hash2 = computeLogHash(log);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });

    it('should produce different hashes for different data', () => {
      const log1: AuditLog = {
        id: 'log_123',
        projectId: 'proj_456',
        timestamp: '2024-01-01T10:00:00Z',
        eventTime: '2024-01-01T10:00:00Z',
        action: 'user.login',
        result: 'SUCCESS',
        actor: { id: 'user_123', type: 'user' },
        changes: [],
        context: {},
        metadata: {},
        hash: '',
        previousHash: null,
        signature: '',
        sequenceNumber: 1,
      };

      const log2: AuditLog = {
        ...log1,
        action: 'user.logout', // Different action
      };

      const hash1 = computeLogHash(log1);
      const hash2 = computeLogHash(log2);

      expect(hash1).not.toBe(hash2);
    });

    it('should produce same hash regardless of object property order', () => {
      const log1: AuditLog = {
        id: 'log_123',
        projectId: 'proj_456',
        timestamp: '2024-01-01T10:00:00Z',
        eventTime: '2024-01-01T10:00:00Z',
        action: 'user.login',
        result: 'SUCCESS',
        actor: {
          id: 'user_123',
          type: 'user',
          display_name: 'John Doe', // Property order: id, type, display_name
        },
        changes: [],
        context: {
          server: { ip: '192.168.1.1', user_agent: 'Mozilla/5.0' }, // Property order: ip, user_agent
          client: { request_id: 'req_123', session_id: 'sess_456' }, // Property order: request_id, session_id
        },
        metadata: {
          version: '1.0.0',
          environment: 'production',
        },
        hash: '',
        previousHash: null,
        signature: '',
        sequenceNumber: 1,
      };

      // Create the same log but with different property order
      const log2: AuditLog = {
        id: 'log_123',
        projectId: 'proj_456',
        timestamp: '2024-01-01T10:00:00Z',
        eventTime: '2024-01-01T10:00:00Z',
        action: 'user.login',
        result: 'SUCCESS',
        actor: {
          display_name: 'John Doe', // Different order: display_name, id, type
          id: 'user_123',
          type: 'user',
        },
        changes: [],
        context: {
          client: { session_id: 'sess_456', request_id: 'req_123' }, // Different order: session_id, request_id
          server: { user_agent: 'Mozilla/5.0', ip: '192.168.1.1' }, // Different order: user_agent, ip
        },
        metadata: {
          environment: 'production', // Different order: environment, version
          version: '1.0.0',
        },
        hash: '',
        previousHash: null,
        signature: '',
        sequenceNumber: 1,
      };

      const hash1 = computeLogHash(log1);
      const hash2 = computeLogHash(log2);

      // Should produce the same hash despite different property order
      expect(hash1).toBe(hash2);
    });
  });

  describe('verifyECDSASignature', () => {
    it('should be a function that can be called', () => {
      const hash = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
      const signature = 'valid_signature_base64';
      const publicKey = '-----BEGIN PUBLIC KEY-----\nMFYwEAYHKoZIzj0CAQYFK4EEAAoDQgAEAwJYVglMpA6MWsVOy2pcL3uPID6vSiG0\nZRbsYkC8KYnV2gpvn2M2Pkd7qO4TTi0EQAPWwMvXXYfFCayqwYLe5g==\n-----END PUBLIC KEY-----';

      // This should not throw an error
      const result = verifyECDSASignature(hash, signature, publicKey);

      expect(typeof result).toBe('boolean');
    });
  });
});
