import { UnTamperConfig, DEFAULT_CONFIG } from '../types/config';
import { validateConfig } from '../utils/validation';
import { HttpClient } from './HttpClient';
import { LogIngestionService } from '../services/LogIngestionService';
import { QueueService } from '../services/QueueService';
import { VerificationService } from '../services/VerificationService';

/**
 * Main unTamper SDK client
 */
export class UnTamperClient {
  private readonly httpClient: HttpClient;
  public readonly logs: LogIngestionService;
  public readonly queue: QueueService;
  public readonly verification: VerificationService;

  constructor(config: UnTamperConfig) {
    // Validate configuration
    validateConfig(config);

    // Merge with defaults
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };

    // Initialize HTTP client
    this.httpClient = new HttpClient(mergedConfig);

    // Initialize services
    this.logs = new LogIngestionService(this.httpClient);
    this.queue = new QueueService(this.httpClient);
    this.verification = new VerificationService(this.httpClient);
  }

  /**
   * Initializes the client by fetching the public key for verification
   * 
   * This method should be called before performing any verification operations.
   * It's safe to call multiple times - the public key will only be fetched once.
   * 
   * @returns Promise that resolves when initialization is complete
   */
  async initialize(): Promise<void> {
    await this.verification.initialize();
  }

  /**
   * Gets the current configuration (without sensitive data)
   */
  getConfig(): Omit<UnTamperConfig, 'apiKey'> {
    return {
      projectId: this.httpClient['config'].projectId,
      baseUrl: this.httpClient['config'].baseUrl,
      timeout: this.httpClient['config'].timeout,
      retryAttempts: this.httpClient['config'].retryAttempts,
      retryDelay: this.httpClient['config'].retryDelay,
    };
  }
}
