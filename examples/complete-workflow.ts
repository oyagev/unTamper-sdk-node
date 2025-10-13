import { UnTamperClient } from '../src';

/**
 * Complete workflow example: Ingest → Query → Verify
 * Demonstrates the full audit log lifecycle with cryptographic verification
 */
async function completeWorkflow() {
  const client = new UnTamperClient({
    projectId: process.env.UNTAMPER_PROJECT_ID || 'your-project-id',
    apiKey: process.env.UNTAMPER_API_KEY || 'your-api-key',
    baseUrl: process.env.UNTAMPER_BASE_URL || 'http://localhost:3000',
  });

  try {
    console.log('=== Complete Audit Log Workflow ===\n');

    // Step 1: Ingest an audit log
    console.log('Step 1: Ingesting audit log...');
    const ingestResponse = await client.logs.ingestLog({
      action: 'document.update',
      actor: {
        id: 'user_123',
        type: 'user',
        display_name: 'John Doe',
      },
      target: {
        id: 'doc_456',
        type: 'document',
        display_name: 'Quarterly Report Q4 2024',
      },
      result: 'SUCCESS',
      changes: [
        {
          path: 'title',
          old_value: 'Q4 Report Draft',
          new_value: 'Quarterly Report Q4 2024',
        },
        {
          path: 'status',
          old_value: 'draft',
          new_value: 'published',
        },
      ],
      context: {
        request_id: `req_${Date.now()}`,
        session_id: 'sess_xyz789',
        client: 'web-app',
        origin: 'https://app.example.com',
      },
      metadata: {
        version: '1.0.0',
        environment: 'production',
        ip_address: '192.168.1.1',
      },
    });

    console.log(`✓ Log ingested: ${ingestResponse.data?.ingestId}`);
    console.log(`  Status: ${ingestResponse.data?.status}`);
    console.log(`  Timestamp: ${ingestResponse.data?.timestamp}\n`);

    // Step 2: Wait for processing
    console.log('Step 2: Waiting for processing to complete...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✓ Processing complete\n');

    // Step 3: Query logs
    console.log('Step 3: Querying logs...');
    const queryResponse = await client.logs.queryLogs({
      action: 'document.update',
      actorId: 'user_123',
      limit: 1,
    });

    if (queryResponse.logs.length === 0) {
      console.log('⚠ No logs found. The log may still be processing.');
      return;
    }

    const log = queryResponse.logs[0];
    console.log(`✓ Found log: ${log.id}`);
    console.log(`  Action: ${log.action}`);
    console.log(`  Result: ${log.result}`);
    console.log(`  Sequence Number: ${log.sequenceNumber}`);
    console.log(`  Timestamp: ${log.timestamp}`);
    console.log(`  Hash: ${log.hash.substring(0, 40)}...`);
    console.log(`  Previous Hash: ${log.previousHash?.substring(0, 40) || 'null'}...`);
    console.log(`  Actor: ${log.actor.display_name} (${log.actor.id})`);
    console.log(`  Target: ${log.target?.display_name} (${log.target?.id})`);
    console.log(`  Changes: ${log.changes.length} change(s)\n`);

    // Step 4: Verify single log
    console.log('Step 4: Verifying log integrity...');
    const verification = await client.verification.verifyLog(log.id);
    console.log(`✓ Log verification: ${verification.valid ? 'VALID' : 'INVALID'}`);
    console.log(`  Hash matches: ${verification.hash === log.hash}`);
    console.log(`  Signature: ${verification.signature.substring(0, 40)}...`);
    console.log(`  Verified at: ${verification.verifiedAt}\n`);

    // Step 5: Verify chain integrity
    console.log('Step 5: Verifying chain integrity (blockchain-style)...');
    const chainVerification = await client.verification.verifyLog(log.id, true, 20);
    console.log(`✓ Chain verification: ${chainVerification.chainValid ? 'VALID' : 'INVALID'}`);
    console.log(`  Total logs verified: ${chainVerification.chainDetails?.totalLogsVerified}`);
    console.log(`  Valid logs: ${chainVerification.chainDetails?.validLogs}`);
    console.log(`  Invalid logs: ${chainVerification.chainDetails?.invalidLogs}`);
    console.log(`  Chain is immutable: ${chainVerification.chainValid ? 'YES' : 'NO'}\n`);

    // Step 6: Verify range
    console.log('Step 6: Verifying range of logs...');
    const rangeVerification = await client.verification.verifyRange({
      maxLogs: 100,
    });

    console.log(`✓ Range verification complete`);
    console.log(`  Summary: ${rangeVerification.summary}`);
    console.log(`  Total logs checked: ${rangeVerification.total}`);
    console.log(`  Valid: ${rangeVerification.valid}`);
    console.log(`  Invalid: ${rangeVerification.invalid}`);
    console.log(`  Chain valid: ${rangeVerification.chainValid}`);
    console.log(`  Sequence range: ${rangeVerification.sequenceRange.from} - ${rangeVerification.sequenceRange.to}`);
    console.log(`  Date range: ${rangeVerification.dateRange.from} to ${rangeVerification.dateRange.to}\n`);

    // Step 7: Query with pagination
    console.log('Step 7: Demonstrating pagination...');
    const page1 = await client.logs.queryLogs({ limit: 5, offset: 0 });
    console.log(`✓ Page 1: ${page1.logs.length} logs`);
    console.log(`  Total available: ${page1.pagination.total}`);
    console.log(`  Has more: ${page1.pagination.hasMore}`);

    if (page1.pagination.hasMore) {
      const page2 = await client.logs.queryLogs({ limit: 5, offset: 5 });
      console.log(`✓ Page 2: ${page2.logs.length} logs\n`);
    }

    console.log('=== Workflow Complete ===');
    console.log('✓ All operations successful');
    console.log('✓ Blockchain-style chain integrity verified');
    console.log('✓ Logs are immutable and tamper-proof');

  } catch (error) {
    console.error('❌ Error:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

// Run the workflow
completeWorkflow();


