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
    // Initialize client (fetch public key for verification)
    console.log('Initializing client...');
    await client.initialize();
    console.log('✓ Client initialized\n');
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

      console.log('\n=== Client-Side Verification Example ===\n');

      // Verify single log using client-side verification
      const verification = await client.verification.verifyLog(log);
      console.log(`Log ${log.id} is valid: ${verification.valid}`);
      console.log(`Hash valid: ${verification.hashValid}`);
      console.log(`Signature valid: ${verification.signatureValid}`);
      if (verification.error) {
        console.log(`Error: ${verification.error}`);
      }

      // Verify multiple logs with chain validation
      console.log('\n=== Chain Verification Example ===\n');
      const chainVerification = await client.verification.verifyLogs([log]);
      console.log(`Chain validation: ${chainVerification.valid}`);
      console.log(`Total logs verified: ${chainVerification.totalLogs}`);
      console.log(`Valid logs: ${chainVerification.validLogs}`);
      console.log(`Invalid logs: ${chainVerification.invalidLogs}`);
      if (chainVerification.errors.length > 0) {
        console.log(`Errors: ${JSON.stringify(chainVerification.errors, null, 2)}`);
      }
    }

    // Verify multiple logs with chain validation
    console.log('\n=== Multiple Logs Chain Verification Example ===\n');
    const multipleLogs = await client.logs.queryLogs({ limit: 5 });
    if (multipleLogs.logs.length > 0) {
      const chainVerification = await client.verification.verifyLogs(multipleLogs.logs);
      console.log(`Chain validation: ${chainVerification.valid}`);
      console.log(`Total logs checked: ${chainVerification.totalLogs}`);
      console.log(`Valid: ${chainVerification.validLogs}`);
      console.log(`Invalid: ${chainVerification.invalidLogs}`);
      if (chainVerification.brokenAt) {
        console.log(`Chain broken at sequence: ${chainVerification.brokenAt}`);
      }
      if (chainVerification.errors.length > 0) {
        console.log(`Errors: ${JSON.stringify(chainVerification.errors, null, 2)}`);
      }
    }

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


