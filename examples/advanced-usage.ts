import { UnTamperClient, UnTamperError, ValidationError } from '@untamper/sdk-node';

// Initialize the client with custom configuration
const client = new UnTamperClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  baseUrl: 'http://localhost:3000', // For development
  timeout: 10000, // 10 second timeout
  retryAttempts: 5, // Retry up to 5 times
  retryDelay: 2000, // 2 second delay between retries
});

async function advancedUsage() {
  try {
    // Batch log multiple events
    const logs = [
      {
        action: 'document.create',
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
        result: 'SUCCESS' as const,
        changes: [
          {
            path: 'title',
            new_value: 'New Document Title',
          },
          {
            path: 'content',
            new_value: 'Document content here...',
          },
        ],
        context: {
          request_id: 'req_001',
          client: 'web-app',
        },
        metadata: {
          feature: 'document-editor',
          version: '2.1.0',
        },
      },
      {
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
        result: 'SUCCESS' as const,
        changes: [
          {
            path: 'title',
            old_value: 'New Document Title',
            new_value: 'Updated Document Title',
          },
        ],
        context: {
          request_id: 'req_002',
          client: 'web-app',
        },
        metadata: {
          feature: 'document-editor',
          version: '2.1.0',
        },
      },
    ];

    // Ingest all logs in parallel
    const responses = await client.logs.ingestLogs(logs);
    console.log('Batch ingestion completed:', responses.length, 'logs processed');

    // Wait for all ingestions to complete
    const statusPromises = responses.map(response => 
      client.logs.waitForCompletion(response.ingestId!, {
        pollInterval: 500, // Check every 500ms
        maxWaitTime: 10000, // Wait up to 10 seconds
      })
    );

    const statuses = await Promise.all(statusPromises);
    console.log('All ingestions completed:', statuses.map(s => s.status));

    // Get queue statistics
    const queueStats = await client.queue.getQueueStats();
    console.log('Queue statistics:', queueStats);

    // Trigger manual queue processing
    const processResult = await client.queue.triggerQueueProcessing();
    console.log('Queue processing triggered:', processResult);

  } catch (error) {
    if (error instanceof ValidationError) {
      console.error('Validation error:', error.message, error.details);
    } else if (error instanceof UnTamperError) {
      console.error('unTamper error:', error.message, error.code, error.statusCode);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Error handling example
async function errorHandlingExample() {
  try {
    // This will throw a ValidationError
    await client.logs.ingestLog({
      action: '', // Empty action will cause validation error
      actor: {
        id: 'user123',
        type: 'user',
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      console.log('Caught validation error:', error.message);
      console.log('Error details:', error.details);
    }
  }
}

// Run the examples
advancedUsage();
errorHandlingExample();
