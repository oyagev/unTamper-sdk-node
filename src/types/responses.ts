/**
 * Log ingestion response data
 */
export interface LogIngestionResponseData {
  /** Unique identifier for this ingestion request */
  ingestId: string;
  /** When the request was processed */
  timestamp: string;
  /** Current processing status */
  status: string;
  /** Human-readable status message */
  message: string;
}

/**
 * Log ingestion response
 */
export interface LogIngestionResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response data */
  data?: LogIngestionResponseData;
  /** Unique identifier for this ingestion request */
  ingestId?: string;
  /** When the request was processed */
  timestamp?: string;
  /** Current processing status */
  status?: string;
  /** Human-readable status message */
  message?: string;
  /** Time taken to process the request */
  processingTime?: string;
}

/**
 * Ingestion status response
 */
export interface IngestionStatusResponse {
  /** Whether the request was successful */
  success: boolean;
  /** The ingest ID */
  ingestId: string;
  /** Current status */
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'RETRYING';
  /** Number of attempts */
  attempts: number;
  /** Error message or success message */
  error?: string;
  /** When the request was processed */
  processedAt?: string;
  /** When the request was created */
  createdAt: string;
  /** When the request was last updated */
  updatedAt: string;
}

/**
 * Queue statistics data
 */
export interface QueueStatsData {
  /** Total number of items in the queue */
  total: number;
  /** Count of items by status */
  byStatus: Record<string, number>;
}

/**
 * Queue statistics response
 */
export interface QueueStatsResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Queue statistics data */
  data?: QueueStatsData;
}

/**
 * Queue management response
 */
export interface QueueManagementResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Response message */
  message: string;
  /** Queue statistics data (when action is "stats") */
  data?: QueueStatsData;
}

/**
 * Error response
 */
export interface ErrorResponse {
  /** Always false for error responses */
  success: false;
  /** Error message */
  error: string;
  /** Additional error details */
  details?: any[];
  /** Time taken before error occurred */
  processingTime?: string;
}

/**
 * Log context structure
 */
export interface LogContext {
  /** Server context */
  server?: {
    /** Server IP address */
    ip?: string;
    /** User agent */
    user_agent?: string;
  };
  /** Client context */
  client?: {
    /** Request ID */
    request_id?: string;
    /** Session ID */
    session_id?: string;
    /** Client identifier */
    client?: string;
    /** Origin */
    origin?: string;
  };
}

/**
 * Audit log structure (from API response)
 */
export interface AuditLog {
  /** Server-generated unique ID */
  id: string;
  /** Project this log belongs to */
  projectId: string;
  /** Server receive time (authoritative) */
  timestamp: string;
  /** Client event time (optional) */
  eventTime?: string;
  /** Action performed (e.g., "user.login") */
  action: string;
  /** Result of the action */
  result: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ERROR';
  /** The entity performing the action */
  actor: {
    id: string;
    type: string;
    display_name?: string;
  };
  /** The entity being acted upon */
  target?: {
    id: string;
    type: string;
    display_name?: string;
  };
  /** List of changes made */
  changes: Array<{
    path: string;
    old_value?: any;
    new_value?: any;
  }>;
  /** Context information */
  context: LogContext;
  /** Additional metadata */
  metadata: Record<string, any>;
  /** SHA-256 hash of log content */
  hash: string;
  /** Hash of previous log (chain link) */
  previousHash: string | null;
  /** HMAC signature of hash */
  signature: string;
  /** Sequential counter per project */
  sequenceNumber: number;
}

/**
 * Pagination metadata
 */
export interface PaginationMetadata {
  /** Total number of logs */
  total: number;
  /** Number of logs in current response */
  limit: number;
  /** Offset for pagination */
  offset: number;
  /** Whether there are more logs to fetch */
  hasMore: boolean;
}

/**
 * Query logs response
 */
export interface QueryLogsResponse {
  /** Array of audit logs */
  logs: AuditLog[];
  /** Pagination information */
  pagination: PaginationMetadata;
}

/**
 * Chain verification details
 */
export interface ChainDetails {
  /** Total number of logs verified in chain */
  totalLogsVerified: number;
  /** Number of valid logs */
  validLogs: number;
  /** Number of invalid logs */
  invalidLogs: number;
}

/**
 * Verify log response
 */
export interface VerifyLogResponse {
  /** Whether the log is valid */
  valid: boolean;
  /** Log ID that was verified */
  logId: string;
  /** SHA-256 hash of the log */
  hash: string;
  /** HMAC signature */
  signature: string;
  /** Sequence number */
  sequenceNumber: number;
  /** Previous log's hash */
  previousHash: string | null;
  /** Whether the chain is valid (if chain verification was requested) */
  chainValid?: boolean;
  /** Chain verification details (if chain verification was requested) */
  chainDetails?: ChainDetails;
  /** When the verification was performed */
  verifiedAt: string;
}

/**
 * Verify range response
 */
export interface VerifyRangeResponse {
  /** Summary message */
  summary: string;
  /** Total number of logs checked */
  total: number;
  /** Number of valid logs */
  valid: number;
  /** Number of invalid logs */
  invalid: number;
  /** Whether the entire chain is valid */
  chainValid: boolean;
  /** Chain verification details */
  chainDetails: {
    /** Total logs in chain */
    totalLogsInChain: number;
    /** Valid logs in chain */
    validInChain: number;
    /** Invalid logs in chain */
    invalidInChain: number;
  };
  /** Any errors encountered */
  errors: any[];
  /** Date range that was verified */
  dateRange: {
    /** Start date */
    from: string;
    /** End date */
    to: string;
  };
  /** Sequence range that was verified */
  sequenceRange: {
    /** First sequence number */
    from: number;
    /** Last sequence number */
    to: number;
  };
  /** When the verification was performed */
  verifiedAt: string;
}
