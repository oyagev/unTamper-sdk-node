import { UnTamperClient } from '../src';

/**
 * Example demonstrating how to query and verify audit logs
 */
async function queryAndVerifyExample() {
  const client = new UnTamperClient({
    projectId: process.env.UNTAMPER_PROJECT_ID || 'your-project-id',
    apiKey: process.env.UNTAMPER_API_KEY || 'your-api-key',
    baseUrl: process.env.UNTAMPER_BASE_URL || 'http://localhost:3000',
  });

  try {
    console.log('=== Query Logs Example ===\n');

    // Query all logs with pagination
    const allLogs = await client.logs.queryLogs({
      limit: 10,
      offset: 0,
    });

    console.log(`Total logs: ${allLogs.pagination.total}`);
    console.log(`Showing: ${allLogs.logs.length} logs`);
    console.log(`Has more: ${allLogs.pagination.hasMore}\n`);

    // Query with filters
    const filteredLogs = await client.logs.queryLogs({
      action: 'user.login',
      result: 'SUCCESS',
      limit: 5,
    });

    console.log(`Filtered logs (user.login + SUCCESS): ${filteredLogs.logs.length}`);
    
    if (filteredLogs.logs.length > 0) {
      const log = filteredLogs.logs[0];
      console.log('\nSample log:');
      console.log(`  ID: ${log.id}`);
      console.log(`  Action: ${log.action}`);
      console.log(`  Result: ${log.result}`);
      console.log(`  Sequence: ${log.sequenceNumber}`);
      console.log(`  Hash: ${log.hash.substring(0, 20)}...`);
      console.log(`  Previous Hash: ${log.previousHash?.substring(0, 20) || 'null'}...`);
      console.log(`  Actor: ${log.actor.display_name || log.actor.id} (${log.actor.type})`);

      console.log('\n=== Verify Log Example ===\n');

      // Verify single log
      const verification = await client.verification.verifyLog(log.id);
      console.log(`Log ${log.id} is valid: ${verification.valid}`);
      console.log(`Hash: ${verification.hash.substring(0, 40)}...`);
      console.log(`Verified at: ${verification.verifiedAt}`);

      // Verify with chain validation
      console.log('\n=== Chain Verification Example ===\n');
      const chainVerification = await client.verification.verifyLog(log.id, true, 10);
      console.log(`Chain validation: ${chainVerification.chainValid}`);
      console.log(`Total logs verified: ${chainVerification.chainDetails?.totalLogsVerified}`);
      console.log(`Valid logs: ${chainVerification.chainDetails?.validLogs}`);
      console.log(`Invalid logs: ${chainVerification.chainDetails?.invalidLogs}`);
    }

    // Verify range
    console.log('\n=== Range Verification Example ===\n');
    const rangeVerification = await client.verification.verifyRange({
      maxLogs: 100,
    });

    console.log(`Summary: ${rangeVerification.summary}`);
    console.log(`Total checked: ${rangeVerification.total}`);
    console.log(`Valid: ${rangeVerification.valid}`);
    console.log(`Invalid: ${rangeVerification.invalid}`);
    console.log(`Chain valid: ${rangeVerification.chainValid}`);
    console.log(`Sequence range: ${rangeVerification.sequenceRange.from} - ${rangeVerification.sequenceRange.to}`);

    // Query by actor
    console.log('\n=== Query by Actor Example ===\n');
    const actorLogs = await client.logs.queryLogs({
      actorType: 'user',
      limit: 5,
    });

    console.log(`Logs by user actors: ${actorLogs.logs.length}`);
    actorLogs.logs.forEach((log, index) => {
      console.log(`  ${index + 1}. ${log.action} by ${log.actor.display_name || log.actor.id}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
queryAndVerifyExample();


