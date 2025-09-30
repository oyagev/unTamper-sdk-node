/**
 * Actor entity performing the action
 */
export interface Actor {
  /** Unique identifier for the actor */
  id: string;
  /** Type of actor (e.g., user, system) */
  type: string;
  /** Human-readable name for the actor */
  display_name?: string;
}

/**
 * Target entity being acted upon
 */
export interface Target {
  /** Unique identifier for the target */
  id: string;
  /** Type of target (e.g., document, user) */
  type: string;
  /** Human-readable name for the target */
  display_name?: string;
}

/**
 * Change information for audit logs
 */
export interface Change {
  /** Field path that was changed */
  path: string;
  /** Previous value */
  old_value?: any;
  /** New value */
  new_value?: any;
}

/**
 * Result of the action
 */
export type ActionResult = 'SUCCESS' | 'FAILURE' | 'DENIED' | 'ERROR';

/**
 * Log ingestion request payload
 */
export interface LogIngestionRequest {
  /** Project ID for the audit log */
  projectId?: string;
  /** Project slug (alternative to projectId) */
  projectSlug?: string;
  /** The action being performed */
  action: string;
  /** The entity performing the action */
  actor: Actor;
  /** The entity being acted upon */
  target?: Target;
  /** Result of the action */
  result?: ActionResult;
  /** When the event occurred (optional, defaults to now) */
  eventTime?: string;
  /** List of changes made */
  changes?: Change[];
  /** Client-provided context data */
  context?: Record<string, any>;
  /** Additional metadata for the audit log */
  metadata?: Record<string, any>;
}

/**
 * Queue management request
 */
export interface QueueManagementRequest {
  /** The action to perform */
  action: 'process' | 'stats';
}
