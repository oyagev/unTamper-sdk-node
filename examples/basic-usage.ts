import { UnTamperClient } from '@untamper/sdk-node';

// Initialize the client
const client = new UnTamperClient({
  projectId: 'your-project-id',
  apiKey: 'your-api-key',
  // For development, you can override the base URL
  baseUrl: 'http://localhost:3000',
});

async function basicUsage() {
  try {
    // Log a simple user action
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

    console.log('Log ingested successfully:', response);
    console.log('Ingest ID:', response.ingestId);

    // Check the status of the ingestion
    const status = await client.logs.checkIngestionStatus(response.ingestId!);
    console.log('Ingestion status:', status);

  } catch (error) {
    console.error('Error ingesting log:', error);
  }
}

// Run the example
basicUsage();
