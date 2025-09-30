// Configuration types
export * from './config';

// Request types
export * from './requests';

// Response types
export * from './responses';

// Re-export commonly used types for convenience
export type {
  UnTamperConfig,
} from './config';

export type {
  LogIngestionRequest,
  Actor,
  Target,
  Change,
  ActionResult,
} from './requests';

export type {
  LogIngestionResponse,
  IngestionStatusResponse,
  QueueStatsResponse,
  QueueManagementResponse,
  ErrorResponse,
} from './responses';
