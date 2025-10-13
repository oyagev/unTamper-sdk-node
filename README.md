# unTamper Node.js SDK

[![npm version](https://badge.fury.io/js/%40untamper%2Fsdk-node.svg)](https://badge.fury.io/js/%40untamper%2Fsdk-node)
[![Node.js Version](https://img.shields.io/node/v/@untamper/sdk-node.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Official Node.js SDK for [unTamper](https://untamper.com) - Enterprise audit logging platform for secure, write-once-read-only audit logs.

## Features

- 🚀 **Fast & Reliable**: Optimized for high-performance log ingestion
- 🔒 **Type-Safe**: Full TypeScript support with comprehensive type definitions
- 🔐 **Cryptographic Verification**: Blockchain-style log verification with hash chaining
- 🔍 **Query & Filter**: Powerful querying with multiple filters and pagination
- 🔄 **Auto-Retry**: Built-in retry logic with exponential backoff
- 🛡️ **Error Handling**: Comprehensive error handling with custom error classes
- 📦 **Zero Dependencies**: Minimal footprint with no external runtime dependencies
- 🧪 **Well Tested**: Comprehensive test suite with 100% coverage
- 🔧 **Developer Friendly**: Easy configuration and debugging support

## Installation

```bash
npm install @untamper/sdk-node
```

## Quick Start

```typescript
import { UnTamperClient } from '@untamper/sdk-node';

// Initialize the client
const client = new UnTamperClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  // For development, you can override the base URL
  baseUrl: 'http://localhost:3000',
});

// Log an audit event
const response = await client.logs.ingestLog({
  action: 'user.login',
  actor: {
    id: 'user123',
    type: 'user',
    display_name: 'John Doe',
  },
  result: 'SUCCESS',
  context: {
    request_id: 'req_123456',
    session_id: 'sess_789012',
  },
  metadata: {
    version: '1.0.0',
    environment: 'production',
  },
});

console.log('Log ingested:', response.ingestId);
```

## Configuration

### Required Settings

- `projectId`: Your project identifier
- `apiKey`: Your project API key

### Optional Settings

- `baseUrl`: API base URL (defaults to production, allows dev override)
- `timeout`: Request timeout in milliseconds (default: 30000)
- `retryAttempts`: Number of retry attempts (default: 3)
- `retryDelay`: Delay between retries in milliseconds (default: 1000)

```typescript
const client = new UnTamperClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000', // For development
  timeout: 10000,
  retryAttempts: 5,
  retryDelay: 2000,
});
```

## API Reference

### Log Ingestion

#### `client.logs.ingestLog(request)`

Ingests a single audit log.

**Example:**

```typescript
const response = await client.logs.ingestLog({
  action: 'document.update',
  actor: {
    id: 'user123',
    type: 'user',
    display_name: 'John Doe',
  },
  target: {
    id: 'doc456',
    type: 'document',
    display_name: 'Important Document',
  },
  result: 'SUCCESS',
  changes: [
    {
      path: 'title',
      old_value: 'Old Title',
      new_value: 'New Title',
    },
  ],
  context: {
    request_id: 'req_123',
    client: 'web-app',
  },
  metadata: {
    feature: 'document-editor',
    version: '2.1.0',
  },
});
```

#### `client.logs.ingestLogs(requests)`

Ingests multiple audit logs in batch.

```typescript
const responses = await client.logs.ingestLogs([
  { action: 'user.login', actor: { id: 'user1', type: 'user' } },
  { action: 'user.logout', actor: { id: 'user2', type: 'user' } },
]);
```

#### `client.logs.checkIngestionStatus(ingestId)`

Checks the status of a previously submitted audit log.

```typescript
const status = await client.logs.checkIngestionStatus('ingest_123');
console.log('Status:', status.status); // PENDING, PROCESSING, COMPLETED, FAILED, RETRYING
```

#### `client.logs.waitForCompletion(ingestId, options)`

Waits for an ingestion to complete with polling.

```typescript
const status = await client.logs.waitForCompletion('ingest_123', {
  pollInterval: 1000, // Check every 1 second
  maxWaitTime: 30000, // Wait up to 30 seconds
});
```

#### `client.logs.queryLogs(options)`

Queries audit logs with optional filters and pagination.

**Parameters:**
- `limit` (optional): Number of logs to return (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `action` (optional): Filter by action (case-insensitive)
- `result` (optional): Filter by result (SUCCESS, FAILURE, DENIED, ERROR)
- `actorId` (optional): Filter by actor ID
- `actorType` (optional): Filter by actor type
- `targetId` (optional): Filter by target ID
- `targetType` (optional): Filter by target type

**Example:**

```typescript
// Query all logs
const allLogs = await client.logs.queryLogs();

// Query with filters
const failedLogins = await client.logs.queryLogs({
  action: 'user.login',
  result: 'FAILURE',
  limit: 10,
});

// Query by actor
const userActions = await client.logs.queryLogs({
  actorId: 'user_123',
  actorType: 'user',
});

// Pagination
const page2 = await client.logs.queryLogs({
  limit: 50,
  offset: 50,
});

console.log('Logs:', allLogs.logs);
console.log('Total:', allLogs.pagination.total);
console.log('Has more:', allLogs.pagination.hasMore);
```

### Log Verification

#### `client.verification.verifyLog(logId, verifyChain, depth)`

Verifies the cryptographic integrity of a single log.

**Parameters:**
- `logId` (required): The ID of the log to verify
- `verifyChain` (optional): If true, verify chain integrity (default: false)
- `depth` (optional): Number of logs to verify in chain (default: 10, max: 100)

**Example:**

```typescript
// Verify single log
const verification = await client.verification.verifyLog('log_abc123');
console.log('Valid:', verification.valid);
console.log('Hash:', verification.hash);

// Verify with chain validation (blockchain-style)
const chainVerification = await client.verification.verifyLog('log_abc123', true, 20);
console.log('Chain valid:', chainVerification.chainValid);
console.log('Total verified:', chainVerification.chainDetails?.totalLogsVerified);
console.log('Valid logs:', chainVerification.chainDetails?.validLogs);
console.log('Invalid logs:', chainVerification.chainDetails?.invalidLogs);
```

#### `client.verification.verifyRange(options)`

Verifies the integrity of logs in a date range.

**Parameters:**
- `startDate` (optional): Start date for verification range (ISO8601)
- `endDate` (optional): End date for verification range (ISO8601)
- `maxLogs` (optional): Maximum number of logs to verify (default: 100)

**Example:**

```typescript
// Verify all logs (up to maxLogs)
const fullVerification = await client.verification.verifyRange();

// Verify logs in date range
const rangeVerification = await client.verification.verifyRange({
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-01-31T23:59:59Z',
  maxLogs: 1000,
});

console.log('Summary:', rangeVerification.summary);
console.log('Total checked:', rangeVerification.total);
console.log('Valid:', rangeVerification.valid);
console.log('Invalid:', rangeVerification.invalid);
console.log('Chain valid:', rangeVerification.chainValid);
console.log('Errors:', rangeVerification.errors);
```

### Queue Management

#### `client.queue.getQueueStats()`

Gets queue statistics.

```typescript
const stats = await client.queue.getQueueStats();
console.log('Total items:', stats.data?.total);
console.log('By status:', stats.data?.byStatus);
```

#### `client.queue.triggerQueueProcessing()`

Triggers manual queue processing.

```typescript
const result = await client.queue.triggerQueueProcessing();
console.log('Processing triggered:', result.message);
```

## Error Handling

The SDK provides comprehensive error handling with custom error classes:

```typescript
import { 
  UnTamperError,
  AuthenticationError,
  ValidationError,
  NetworkError,
  RateLimitError,
  ServerError,
  ConfigurationError,
} from '@untamper/sdk-node';

try {
  await client.logs.ingestLog(request);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error('Invalid request:', error.message, error.details);
  } else if (error instanceof AuthenticationError) {
    console.error('Authentication failed:', error.message);
  } else if (error instanceof NetworkError) {
    console.error('Network error:', error.message);
  } else if (error instanceof RateLimitError) {
    console.error('Rate limited:', error.message);
  } else if (error instanceof ServerError) {
    console.error('Server error:', error.message);
  } else if (error instanceof UnTamperError) {
    console.error('unTamper error:', error.message, error.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

The SDK is built with TypeScript and provides full type safety:

```typescript
import { 
  UnTamperClient,
  LogIngestionRequest,
  LogIngestionResponse,
  Actor,
  Target,
  ActionResult,
  AuditLog,
  QueryLogsResponse,
  VerifyLogResponse,
} from '@untamper/sdk-node';

const request: LogIngestionRequest = {
  action: 'user.login',
  actor: {
    id: 'user123',
    type: 'user',
    display_name: 'John Doe',
  },
  result: 'SUCCESS' as ActionResult,
};

// Type-safe responses
const response: LogIngestionResponse = await client.logs.ingestLog(request);
const logs: QueryLogsResponse = await client.logs.queryLogs();
const verification: VerifyLogResponse = await client.verification.verifyLog('log_123');
```

## Examples

### Complete Workflow: Ingest → Query → Verify

```typescript
import { UnTamperClient } from '@untamper/sdk-node';

const client = new UnTamperClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
});

async function completeAuditWorkflow() {
  // 1. Ingest an audit log
  const ingestResponse = await client.logs.ingestLog({
    action: 'user.login',
    actor: {
      id: 'user_123',
      type: 'user',
      display_name: 'John Doe',
    },
    result: 'SUCCESS',
    context: {
      request_id: 'req_abc123',
      session_id: 'sess_xyz789',
    },
    metadata: {
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0...',
    },
  });
  
  console.log('Log ingested:', ingestResponse.data?.ingestId);
  
  // 2. Wait for processing to complete
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. Query logs to find the ingested log
  const queryResponse = await client.logs.queryLogs({
    action: 'user.login',
    actorId: 'user_123',
    limit: 1,
  });
  
  const log = queryResponse.logs[0];
  console.log('Found log:', log.id);
  console.log('Sequence number:', log.sequenceNumber);
  console.log('Hash:', log.hash);
  console.log('Previous hash:', log.previousHash);
  
  // 4. Verify the log's cryptographic integrity
  const verification = await client.verification.verifyLog(log.id, true, 10);
  console.log('Log is valid:', verification.valid);
  console.log('Chain is valid:', verification.chainValid);
  console.log('Logs verified in chain:', verification.chainDetails?.totalLogsVerified);
  
  // 5. Verify range of logs
  const rangeVerification = await client.verification.verifyRange({
    maxLogs: 100,
  });
  
  console.log('Range verification:', rangeVerification.summary);
  console.log('Total logs checked:', rangeVerification.total);
  console.log('All valid:', rangeVerification.valid === rangeVerification.total);
  console.log('Chain integrity:', rangeVerification.chainValid);
}

completeAuditWorkflow().catch(console.error);
```

### Express.js Middleware

```typescript
import express from 'express';
import { UnTamperClient } from '@untamper/sdk-node';

const client = new UnTamperClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
});

function auditLogMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const originalSend = res.send;
  const startTime = Date.now();

  res.send = function(body: any) {
    const duration = Date.now() - startTime;
    
    // Log the request asynchronously
    client.logs.ingestLog({
      action: `${req.method.toLowerCase()}.${req.path}`,
      actor: {
        id: (req as any).user?.id || 'anonymous',
        type: (req as any).user ? 'user' : 'system',
      },
      result: res.statusCode < 400 ? 'SUCCESS' : 'FAILURE',
      context: {
        method: req.method,
        url: req.url,
        status_code: res.statusCode,
        duration_ms: duration,
      },
    }).catch(console.error);

    return originalSend.call(this, body);
  };

  next();
}

const app = express();
app.use(auditLogMiddleware);
```

### Batch Processing

```typescript
// Process multiple events
const events = [
  { action: 'user.login', actor: { id: 'user1', type: 'user' } },
  { action: 'user.logout', actor: { id: 'user2', type: 'user' } },
  { action: 'document.create', actor: { id: 'user3', type: 'user' } },
];

const responses = await client.logs.ingestLogs(events);
console.log(`Processed ${responses.length} events`);

// Wait for all to complete
const statuses = await Promise.all(
  responses.map(response => 
    client.logs.waitForCompletion(response.ingestId!)
  )
);
```

## Development

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn

### Setup

```bash
git clone https://github.com/untamper/sdk-node.git
cd sdk-node
npm install
```

### Building

```bash
npm run build
```

### Testing

```bash
npm test
npm run test:coverage
```

### Linting

```bash
npm run lint
npm run lint:fix
```

## Requirements

- **Node.js**: 16.0.0 or higher
- **TypeScript**: 4.0 or higher (for TypeScript projects)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- 📧 Email: support@untamper.com
- 📖 Documentation: [https://docs.untamper.com](https://docs.untamper.com)
- 🐛 Issues: [GitHub Issues](https://github.com/untamper/sdk-node/issues)

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

---

Made with ❤️ by the unTamper team
