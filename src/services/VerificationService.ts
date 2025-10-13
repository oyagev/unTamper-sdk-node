import { HttpClient } from '../client/HttpClient';
import { 
  VerifyLogResponse, 
  VerifyRangeRequest,
  VerifyRangeResponse,
} from '../types';

/**
 * Service for handling log verification operations
 */
export class VerificationService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Verifies the cryptographic integrity of a single log
   * 
   * @param logId - The ID of the log to verify
   * @param verifyChain - If true, verify chain integrity (default: false)
   * @param depth - Number of logs to verify in chain (default: 10, max: 100)
   * @returns Verification result with hash, signature, and chain details
   */
  async verifyLog(
    logId: string, 
    verifyChain: boolean = false, 
    depth: number = 10
  ): Promise<VerifyLogResponse> {
    if (!logId || typeof logId !== 'string') {
      throw new Error('logId is required and must be a string');
    }

    const params: Record<string, string> = {
      verifyChain: verifyChain.toString(),
      depth: depth.toString(),
    };

    return this.httpClient.get<VerifyLogResponse>(
      `/api/v1/logs/${encodeURIComponent(logId)}/verify?${new URLSearchParams(params).toString()}`
    );
  }

  /**
   * Verifies the integrity of logs in a date range
   * 
   * @param request - Verification request with optional date range and maxLogs
   * @returns Summary with valid/invalid counts, chain status, and errors
   */
  async verifyRange(request: VerifyRangeRequest = {}): Promise<VerifyRangeResponse> {
    const { startDate, endDate, maxLogs = 100 } = request;

    const payload: Record<string, any> = {
      maxLogs,
    };

    if (startDate) {
      payload.startDate = startDate;
    }

    if (endDate) {
      payload.endDate = endDate;
    }

    // POST will automatically inject projectId
    return this.httpClient.post<VerifyRangeResponse>('/api/v1/logs/verify-range', payload);
  }
}


