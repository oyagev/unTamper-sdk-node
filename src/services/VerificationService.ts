import { HttpClient } from '../client/HttpClient';
import { 
  AuditLog,
  VerifyLogResult, 
  ChainVerificationResult,
} from '../types';
import { computeLogHash, verifyECDSASignature } from '../utils/crypto';

/**
 * Service for client-side cryptographic verification of audit logs
 * 
 * This service implements trustless verification that doesn't require
 * trusting the server. All verification is done locally using the
 * public key and cryptographic algorithms.
 */
export class VerificationService {
  private publicKey: string | null = null;
  private initializationPromise: Promise<void> | null = null;

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Initializes the verification service by fetching the public key
   * 
   * This method is safe to call multiple times - it will only fetch
   * the public key once and cache it for subsequent calls.
   * 
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    if (this.publicKey) {
      return; // Already initialized
    }

    if (this.initializationPromise) {
      return this.initializationPromise; // Initialization in progress
    }

    this.initializationPromise = this.fetchPublicKey().then(() => {});
    await this.initializationPromise;
  }

  /**
   * Fetches the ECDSA public key from the server
   * 
   * @returns Promise that resolves to the PEM-encoded public key
   */
  private async fetchPublicKey(): Promise<string> {
    try {
      const response = await this.httpClient.getText('/api/v1/public-key');
      this.publicKey = response;
      return response;
    } catch (error) {
      this.initializationPromise = null; // Reset so we can retry
      throw new Error(`Failed to fetch public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifies a single audit log's cryptographic integrity
   * 
   * @param log - The audit log to verify
   * @returns Promise that resolves to verification result
   */
  async verifyLog(log: AuditLog): Promise<VerifyLogResult> {
    // Ensure public key is loaded
    if (!this.publicKey) {
      await this.initialize();
    }

    // 1. Verify hash computation
    const computedHash = computeLogHash(log);
    const hashValid = computedHash === log.hash;
    
    if (!hashValid) {
      return {
        valid: false,
        hashValid: false,
        signatureValid: false,
        error: 'Hash mismatch - log data tampered'
      };
    }
    
    // 2. Verify ECDSA signature
    const signatureValid = verifyECDSASignature(log.hash, log.signature, this.publicKey!);
    
    if (!signatureValid) {
      return {
        valid: false,
        hashValid: true,
        signatureValid: false,
        error: 'Invalid ECDSA signature'
      };
    }
    
    return {
      valid: true,
      hashValid: true,
      signatureValid: true
    };
  }

  /**
   * Verifies multiple audit logs with blockchain-style chain validation
   * 
   * This method verifies:
   * 1. Each log's hash computation
   * 2. Each log's ECDSA signature
   * 3. Chain integrity (previousHash links)
   * 4. Sequence number continuity
   * 
   * @param logs - Array of audit logs to verify
   * @returns Promise that resolves to chain verification result
   */
  async verifyLogs(logs: AuditLog[]): Promise<ChainVerificationResult> {
    if (!this.publicKey) {
      await this.initialize();
    }
    
    return this.verifyChain(logs, this.publicKey!);
  }

  /**
   * Verifies the blockchain-style hash chain to detect tampering
   * 
   * @param logs - Array of audit logs to verify
   * @param publicKey - The ECDSA public key for signature verification
   * @returns Chain verification result
   */
  private verifyChain(
    logs: AuditLog[],
    publicKey: string
  ): ChainVerificationResult {
    const errors: Array<{ sequenceNumber: number; error: string }> = [];
    let validLogs = 0;
    
    // Sort by sequence number
    const sorted = [...logs].sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    
    for (let i = 0; i < sorted.length; i++) {
      const log = sorted[i];
      
      // 1. Verify hash computation
      const computedHash = computeLogHash(log);
      if (computedHash !== log.hash) {
        errors.push({
          sequenceNumber: log.sequenceNumber,
          error: `Hash mismatch: computed ${computedHash} != stored ${log.hash}`
        });
        continue;
      }
      
      // 2. Verify ECDSA signature
      if (!verifyECDSASignature(log.hash, log.signature, publicKey)) {
        errors.push({
          sequenceNumber: log.sequenceNumber,
          error: 'Invalid ECDSA signature'
        });
        continue;
      }
      
      // 3. Verify chain linkage (except first log)
      if (i > 0) {
        const prevLog = sorted[i - 1];
        
        // Check sequence continuity
        if (log.sequenceNumber !== prevLog.sequenceNumber + 1) {
          errors.push({
            sequenceNumber: log.sequenceNumber,
            error: `Sequence gap: expected ${prevLog.sequenceNumber + 1}`
          });
          continue;
        }
        
        // Check hash chain
        if (log.previousHash !== prevLog.hash) {
          errors.push({
            sequenceNumber: log.sequenceNumber,
            error: 'Chain broken: previousHash mismatch'
          });
          continue;
        }
      } else {
        // First log should have null previousHash
        if (log.sequenceNumber === 1 && log.previousHash !== null) {
          errors.push({
            sequenceNumber: log.sequenceNumber,
            error: 'First log must have previousHash = null'
          });
          continue;
        }
      }
      
      validLogs++;
    }
    
    return {
      valid: errors.length === 0,
      totalLogs: sorted.length,
      validLogs,
      invalidLogs: sorted.length - validLogs,
      brokenAt: errors[0]?.sequenceNumber,
      errors
    };
  }
}