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
