import crypto from 'crypto';
import { AuditLog } from '../types';

/**
 * Deterministic JSON stringify that sorts all object keys recursively
 * This ensures consistent hashing regardless of property order
 */
function deterministicStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  
  if (Array.isArray(obj)) {
    return '[' + obj.map(deterministicStringify).join(',') + ']';
  }
  
  // For objects, sort keys alphabetically and recursively stringify
  const sortedKeys = Object.keys(obj).sort();
  const pairs = sortedKeys.map(key => 
    JSON.stringify(key) + ':' + deterministicStringify(obj[key])
  );
  return '{' + pairs.join(',') + '}';
}

/**
 * Computes the SHA-256 hash of an audit log
 * 
 * CRITICAL: Use deterministic stringification to handle non-deterministic object ordering
 * This ensures consistent hashing regardless of how objects are stored/retrieved
 * 
 * @param log - The audit log to hash
 * @returns Hex-encoded SHA-256 hash
 */
export function computeLogHash(log: AuditLog): string {
  // CRITICAL: Use deterministic stringification to handle non-deterministic object ordering
  // This ensures consistent hashing regardless of how objects are stored/retrieved
  const canonical = deterministicStringify({
    projectId: log.projectId,
    sequenceNumber: log.sequenceNumber,
    previousHash: log.previousHash,
    timestamp: log.timestamp,
    eventTime: log.eventTime || null,
    action: log.action,
    result: log.result,
    actor: log.actor,
    target: log.target || null,
    changes: log.changes,
    context: log.context,
    metadata: log.metadata,
  });
  
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Verifies an ECDSA signature using the public key
 * 
 * @param hash - The hex-encoded hash to verify
 * @param signature - The base64-encoded ECDSA signature
 * @param publicKey - The PEM-encoded ECDSA public key
 * @returns True if signature is valid, false otherwise
 */
export function verifyECDSASignature(
  hash: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const verify = crypto.createVerify('SHA256');
    // Update with the hash string directly (not as hex bytes)
    // This matches the signing algorithm: sign.update(hash)
    verify.update(hash);
    return verify.verify(publicKey, signature, 'base64');
  } catch (error) {
    console.error('Signature verification failed:', error);
    return false;
  }
}