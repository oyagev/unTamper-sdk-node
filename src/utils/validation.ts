import { UnTamperConfig, LogIngestionRequest, Actor, Target } from '../types';
import { ConfigurationError, ValidationError } from './errors';

/**
 * Validates the SDK configuration
 */
export function validateConfig(config: UnTamperConfig): void {
  if (!config.projectId || typeof config.projectId !== 'string') {
    throw new ConfigurationError('projectId is required and must be a string');
  }

  if (!config.apiKey || typeof config.apiKey !== 'string') {
    throw new ConfigurationError('apiKey is required and must be a string');
  }

  if (config.baseUrl && typeof config.baseUrl !== 'string') {
    throw new ConfigurationError('baseUrl must be a string');
  }

  if (config.timeout !== undefined && (typeof config.timeout !== 'number' || config.timeout <= 0)) {
    throw new ConfigurationError('timeout must be a positive number');
  }

  if (config.retryAttempts !== undefined && (typeof config.retryAttempts !== 'number' || config.retryAttempts < 0)) {
    throw new ConfigurationError('retryAttempts must be a non-negative number');
  }

  if (config.retryDelay !== undefined && (typeof config.retryDelay !== 'number' || config.retryDelay < 0)) {
    throw new ConfigurationError('retryDelay must be a non-negative number');
  }
}

/**
 * Validates an actor object
 */
export function validateActor(actor: Actor): void {
  if (!actor || typeof actor !== 'object') {
    throw new ValidationError('actor is required and must be an object');
  }

  if (!actor.id || typeof actor.id !== 'string') {
    throw new ValidationError('actor.id is required and must be a string');
  }

  if (!actor.type || typeof actor.type !== 'string') {
    throw new ValidationError('actor.type is required and must be a string');
  }

  if (actor.display_name !== undefined && typeof actor.display_name !== 'string') {
    throw new ValidationError('actor.display_name must be a string');
  }
}

/**
 * Validates a target object
 */
export function validateTarget(target: Target): void {
  if (!target || typeof target !== 'object') {
    throw new ValidationError('target must be an object');
  }

  if (!target.id || typeof target.id !== 'string') {
    throw new ValidationError('target.id is required and must be a string');
  }

  if (!target.type || typeof target.type !== 'string') {
    throw new ValidationError('target.type is required and must be a string');
  }

  if (target.display_name !== undefined && typeof target.display_name !== 'string') {
    throw new ValidationError('target.display_name must be a string');
  }
}

/**
 * Validates a log ingestion request
 */
export function validateLogIngestionRequest(request: LogIngestionRequest): void {
  if (!request || typeof request !== 'object') {
    throw new ValidationError('request is required and must be an object');
  }

  if (!request.action || typeof request.action !== 'string' || request.action.trim().length === 0) {
    throw new ValidationError('action is required and must be a non-empty string');
  }

  validateActor(request.actor);

  if (request.target) {
    validateTarget(request.target);
  }

  if (request.projectId !== undefined && typeof request.projectId !== 'string') {
    throw new ValidationError('projectId must be a string');
  }

  if (request.projectSlug !== undefined && typeof request.projectSlug !== 'string') {
    throw new ValidationError('projectSlug must be a string');
  }

  if (request.result !== undefined && !['SUCCESS', 'FAILURE', 'DENIED', 'ERROR'].includes(request.result)) {
    throw new ValidationError('result must be one of: SUCCESS, FAILURE, DENIED, ERROR');
  }

  if (request.eventTime !== undefined && typeof request.eventTime !== 'string') {
    throw new ValidationError('eventTime must be a string');
  }

  if (request.changes !== undefined) {
    if (!Array.isArray(request.changes)) {
      throw new ValidationError('changes must be an array');
    }
    
    request.changes.forEach((change, index) => {
      if (!change || typeof change !== 'object') {
        throw new ValidationError(`changes[${index}] must be an object`);
      }
      if (!change.path || typeof change.path !== 'string') {
        throw new ValidationError(`changes[${index}].path is required and must be a string`);
      }
    });
  }

  if (request.context !== undefined && (typeof request.context !== 'object' || Array.isArray(request.context))) {
    throw new ValidationError('context must be an object');
  }

  if (request.metadata !== undefined && (typeof request.metadata !== 'object' || Array.isArray(request.metadata))) {
    throw new ValidationError('metadata must be an object');
  }
}

/**
 * Validates an ingest ID
 */
export function validateIngestId(ingestId: string): void {
  if (!ingestId || typeof ingestId !== 'string' || ingestId.trim().length === 0) {
    throw new ValidationError('ingestId is required and must be a non-empty string');
  }
}
