import { UnTamperClient } from '../src/index';

async function testSDK() {
  console.log('🚀 Testing unTamper Node.js SDK...\n');

  // Initialize the client with development settings
  const client = new UnTamperClient({
    projectId: 'test-project-id',
    apiKey: 'test-api-key',
    baseUrl: 'http://localhost:3000', // Your local development server
    timeout: 5000,
    retryAttempts: 2,
  });

  console.log('✅ Client initialized successfully');
  console.log('📋 Configuration:', client.getConfig());

  try {
    // Test log ingestion
    console.log('\n📝 Testing log ingestion...');
    
    const logRequest = {
      action: 'sdk.test',
      actor: {
        id: 'test-user-123',
        type: 'user',
        display_name: 'Test User',
      },
      result: 'SUCCESS' as const,
      context: {
        test_run: true,
        timestamp: new Date().toISOString(),
        sdk_version: '1.0.0',
      },
      metadata: {
        environment: 'development',
        test: true,
      },
    };

    const response = await client.logs.ingestLog(logRequest);
    console.log('✅ Log ingested successfully!');
    console.log('📊 Response:', {
      success: response.success,
      ingestId: response.ingestId,
      status: response.status,
      message: response.message,
    });

    if (response.ingestId) {
      // Test status check
      console.log('\n🔍 Testing status check...');
      const status = await client.logs.checkIngestionStatus(response.ingestId);
      console.log('✅ Status retrieved successfully!');
      console.log('📊 Status:', {
        ingestId: status.ingestId,
        status: status.status,
        attempts: status.attempts,
      });
    }

    // Test queue stats
    console.log('\n📈 Testing queue statistics...');
    const queueStats = await client.queue.getQueueStats();
    console.log('✅ Queue stats retrieved successfully!');
    console.log('📊 Queue Stats:', queueStats.data);

  } catch (error) {
    console.error('❌ Error during testing:', error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      
      if ('code' in error) {
        console.error('Error code:', (error as any).code);
      }
      if ('statusCode' in error) {
        console.error('HTTP status:', (error as any).statusCode);
      }
    }
  }

  console.log('\n🏁 Test completed!');
}

// Run the test
testSDK().catch(console.error);
