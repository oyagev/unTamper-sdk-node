import { HttpClient } from '../client/HttpClient';
import { 
  LogIngestionRequest, 
  LogIngestionResponse, 
  IngestionStatusResponse,
  QueryLogsOptions,
  QueryLogsResponse,
} from '../types';
import { validateLogIngestionRequest, validateIngestId } from '../utils/validation';

/**
 * Service for handling log ingestion operations
 */
export class LogIngestionService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Ingests a single audit log
   */
  async ingestLog(request: LogIngestionRequest): Promise<LogIngestionResponse> {
    validateLogIngestionRequest(request);
    
    return this.httpClient.post<LogIngestionResponse>('/api/v1/ingest', request);
  }

  /**
   * Ingests multiple audit logs in batch
   */
  async ingestLogs(requests: LogIngestionRequest[]): Promise<LogIngestionResponse[]> {
    if (!Array.isArray(requests)) {
      throw new Error('requests must be an array');
    }

    if (requests.length === 0) {
      return [];
    }

    // Validate all requests
    requests.forEach((request, index) => {
      try {
        validateLogIngestionRequest(request);
      } catch (error) {
        throw new Error(`Invalid request at index ${index}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    // Process requests in parallel
    const promises = requests.map(request => this.ingestLog(request));
    return Promise.all(promises);
  }

  /**
   * Checks the status of a previously submitted audit log
   */
  async checkIngestionStatus(ingestId: string): Promise<IngestionStatusResponse> {
    validateIngestId(ingestId);
    
    return this.httpClient.get<IngestionStatusResponse>(`/api/v1/ingest?ingestId=${encodeURIComponent(ingestId)}`);
  }

  /**
   * Waits for an ingestion to complete with polling
   */
  async waitForCompletion(
    ingestId: string, 
    options: {
      pollInterval?: number;
      maxWaitTime?: number;
      timeout?: number;
    } = {}
  ): Promise<IngestionStatusResponse> {
    const {
      pollInterval = 1000,
      maxWaitTime = 30000,
    } = options;

    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const status = await this.checkIngestionStatus(ingestId);
      
      if (status.status === 'COMPLETED' || status.status === 'FAILED') {
        return status;
      }
      
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
    
    throw new Error(`Timeout waiting for ingestion ${ingestId} to complete`);
  }

  /**
   * Queries audit logs with optional filters and pagination
   */
  async queryLogs(options: QueryLogsOptions = {}): Promise<QueryLogsResponse> {
    const {
      limit = 50,
      offset = 0,
      action,
      result,
      actorId,
      actorType,
      targetId,
      targetType,
    } = options;

    // Build query parameters
    const params: Record<string, string> = {
      limit: limit.toString(),
      offset: offset.toString(),
    };

    // Add optional filters
    if (action) params.action = action;
    if (result) params.result = result;
    if (actorId) params.actorId = actorId;
    if (actorType) params.actorType = actorType;
    if (targetId) params.targetId = targetId;
    if (targetType) params.targetType = targetType;

    // Use getWithProject to automatically inject projectId
    return this.httpClient.getWithProject<QueryLogsResponse>('/api/v1/logs', params);
  }
}
