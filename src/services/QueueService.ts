import { HttpClient } from '../client/HttpClient';
import { 
  QueueStatsResponse, 
  QueueManagementRequest, 
  QueueManagementResponse 
} from '../types';

/**
 * Service for handling queue management operations
 */
export class QueueService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Gets queue statistics
   */
  async getQueueStats(): Promise<QueueStatsResponse> {
    return this.httpClient.get<QueueStatsResponse>('/api/queue');
  }

  /**
   * Triggers manual queue processing
   */
  async triggerQueueProcessing(): Promise<QueueManagementResponse> {
    const request: QueueManagementRequest = { action: 'process' };
    return this.httpClient.post<QueueManagementResponse>('/api/queue', request);
  }

  /**
   * Gets queue statistics via POST request
   */
  async getQueueStatsPost(): Promise<QueueManagementResponse> {
    const request: QueueManagementRequest = { action: 'stats' };
    return this.httpClient.post<QueueManagementResponse>('/api/queue', request);
  }
}
