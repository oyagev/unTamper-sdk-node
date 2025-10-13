// Main client export
export { UnTamperClient } from './client/UnTamperClient';

// Type exports
export type {
  UnTamperConfig,
  LogIngestionRequest,
  LogIngestionResponse,
  IngestionStatusResponse,
  QueueStatsResponse,
  QueueManagementResponse,
  ErrorResponse,
  Actor,
  Target,
  Change,
  ActionResult,
  AuditLog,
  LogContext,
  QueryLogsOptions,
  QueryLogsResponse,
  PaginationMetadata,
  VerifyLogResponse,
  VerifyRangeRequest,
  VerifyRangeResponse,
  ChainDetails,
} from './types';

// Error exports
export {
  UnTamperError,
  AuthenticationError,
  ValidationError,
  NetworkError,
  RateLimitError,
  ServerError,
  ConfigurationError,
} from './utils/errors';

// Default export
export { UnTamperClient as default } from './client/UnTamperClient';
