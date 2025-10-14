import { UnTamperClient } from '../src';

// Initialize the client
const client = new UnTamperClient({
  projectId: 'cmftkqjck000h11q9jwni72n9',
  apiKey: 'al_0636290704f80bf4dbdd61bf300767d2b7b83d891e0ab7fab87f8203dde7902d',
  // For development, you can override the base URL
  baseUrl: 'https://app.untamper.com',
});

async function basicUsage() {
  try {
    // Step 1: Health check
    console.log('Checking API health...');
    const health = await client.logs.healthCheck();
    console.log('✓ API is healthy:', health.message);
    console.log('  Version:', health.version);
    console.log('  Timestamp:', health.timestamp);
    console.log('');

    // Step 2: Log a simple user action
    console.log('Ingesting audit log...');
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
        client: 'web-app',
        origin: 'https://app.example.com',
      },
      metadata: {
        version: '1.0.0',
        environment: 'production',
      },
    });

    console.log('✓ Log ingested successfully');
    console.log('  Ingest ID:', response.data?.ingestId);
    console.log('  Status:', response.data?.status);
    console.log('  Processing time:', response.processingTime);
    console.log('');

    // Step 3: Check the status of the ingestion
    console.log('Checking ingestion status...');
    const status = await client.logs.checkIngestionStatus(response.data?.ingestId!);
    console.log('✓ Ingestion status:', status.status);
    console.log('  Attempts:', status.attempts);
    console.log('  Created at:', status.createdAt);
    if (status.processedAt) {
      console.log('  Processed at:', status.processedAt);
    }
    if (status.error) {
      console.log('  Error:', status.error);
    }

  } catch (error) {
    console.error('Error ingesting log:', error);
  }
}

// Run the example
basicUsage();
