/**
 * Configuration interface for the unTamper SDK
 */
export interface UnTamperConfig {
  /** The project identifier */
  projectId: string;
  /** The project API key */
  apiKey: string;
  /** API base URL (defaults to production, allows dev override) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Number of retry attempts (default: 3) */
  retryAttempts?: number;
  /** Delay between retries in milliseconds (default: 1000) */
  retryDelay?: number;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Partial<UnTamperConfig> = {
  baseUrl: 'https://app.untamper.com',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const;
