import { 
  UnTamperClient, 
  computeLogHash, 
  verifyECDSASignature 
} from '../src';

/**
 * Dedicated cryptographic verification example
 * Demonstrates client-side verification capabilities for maximum security
 */
async function verificationExample() {
  const client = new UnTamperClient({
    projectId: process.env.UNTAMPER_PROJECT_ID || 'cmftkqjck000h11q9jwni72n9',
    apiKey: process.env.UNTAMPER_API_KEY || 'al_0636290704f80bf4dbdd61bf300767d2b7b83d891e0ab7fab87f8203dde7902d',
    baseUrl: process.env.UNTAMPER_BASE_URL || 'https://app.untamper.com',
  });

  try {
    console.log('=== Cryptographic Verification Example ===\n');

    // Step 1: Initialize client (REQUIRED for verification)
    console.log('Step 1: Initializing client (fetching public key)...');
    await client.initialize();
    console.log('✓ Client initialized with public key for verification\n');

    // Step 2: Ingest a test log
    console.log('Step 2: Ingesting test log...');
    const ingestResponse = await client.logs.ingestLog({
      action: 'verification.test',
      actor: {
        id: 'test-user',
        type: 'user',
        display_name: 'Test User',
      },
      result: 'SUCCESS',
      context: {
        test: true,
        verification_demo: true,
      },
      metadata: {
        purpose: 'verification_demo',
        timestamp: new Date().toISOString(),
      },
    });
    console.log(`✓ Log ingested: ${ingestResponse.data?.ingestId}\n`);

    // Step 3: Wait for processing
    console.log('Step 3: Waiting for processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('✓ Processing complete\n');

    // Step 4: Query the log
    console.log('Step 4: Querying logs...');
    const queryResponse = await client.logs.queryLogs({
      action: 'verification.test',
      limit: 1,
    });

    if (queryResponse.logs.length === 0) {
      console.log('⚠ No logs found. The log may still be processing.');
      return;
    }

    const log = queryResponse.logs[0];
    console.log(`✓ Found log: ${log.id}`);
    console.log(`  Sequence: ${log.sequenceNumber}`);
    console.log(`  Hash: ${log.hash.substring(0, 20)}...`);
    console.log(`  Previous Hash: ${log.previousHash?.substring(0, 20) || 'null'}...\n`);

    // Step 5: Single log verification
    console.log('Step 5: Verifying single log (client-side)...');
    const verification = await client.verification.verifyLog(log);
    console.log(`✓ Single log verification: ${verification.valid ? 'VALID' : 'INVALID'}`);
    console.log(`  Hash valid: ${verification.hashValid}`);
    console.log(`  Signature valid: ${verification.signatureValid}`);
    if (verification.error) {
      console.log(`  Error: ${verification.error}`);
    }
    console.log('');

    // Step 6: Chain verification (blockchain-style)
    console.log('Step 6: Verifying chain integrity (blockchain-style)...');
    const chainVerification = await client.verification.verifyLogs([log]);
    console.log(`✓ Chain verification: ${chainVerification.valid ? 'VALID' : 'INVALID'}`);
    console.log(`  Total logs: ${chainVerification.totalLogs}`);
    console.log(`  Valid logs: ${chainVerification.validLogs}`);
    console.log(`  Invalid logs: ${chainVerification.invalidLogs}`);
    console.log(`  Chain immutable: ${chainVerification.valid ? 'YES' : 'NO'}`);
    if (chainVerification.brokenAt) {
      console.log(`  Chain broken at sequence: ${chainVerification.brokenAt}`);
    }
    console.log('');

    // Step 7: Multiple logs chain verification
    console.log('Step 7: Verifying multiple logs with chain validation...');
    const multipleLogs = await client.logs.queryLogs({ limit: 5 });
    if (multipleLogs.logs.length > 0) {
      const rangeVerification = await client.verification.verifyLogs(multipleLogs.logs);
      console.log(`✓ Range verification completed`);
      console.log(`  Total logs checked: ${rangeVerification.totalLogs}`);
      console.log(`  Valid: ${rangeVerification.validLogs}`);
      console.log(`  Invalid: ${rangeVerification.invalidLogs}`);
      console.log(`  Chain valid: ${rangeVerification.valid}`);
      if (rangeVerification.brokenAt) {
        console.log(`  Chain broken at sequence: ${rangeVerification.brokenAt}`);
      }
      if (rangeVerification.errors.length > 0) {
        console.log(`  Errors found: ${rangeVerification.errors.length}`);
        rangeVerification.errors.forEach((error, index) => {
          console.log(`    ${index + 1}. ${error}`);
        });
      }
    } else {
      console.log('  No logs found to verify');
    }
    console.log('');

    // Step 8: Crypto utility demonstration
    console.log('Step 8: Demonstrating crypto utilities...');
    
    // Compute hash manually using crypto utility
    const manualHash = computeLogHash(log);
    console.log(`✓ Manual hash computation: ${manualHash.substring(0, 20)}...`);
    console.log(`  Matches log hash: ${manualHash === log.hash ? 'YES' : 'NO'}`);
    
    // Note: ECDSA signature verification requires the public key
    // This is handled internally by the verification service
    console.log('✓ ECDSA signature verification (handled internally)');
    console.log('');

    console.log('=== Verification Benefits ===');
    console.log('✓ Trustless: Verify without trusting the server');
    console.log('✓ Offline: Verify logs without API calls (after fetching public key)');
    console.log('✓ Independent: Third parties can verify logs');
    console.log('✓ Tamper-proof: Mathematical proof using ECDSA signatures');
    console.log('✓ Blockchain-style: Hash chaining detects any tampering');
    console.log('✓ Deterministic: Consistent hashing regardless of property order');

  } catch (error) {
    console.error('❌ Error during verification:', error);
    if (error instanceof Error) {
      console.error('Message:', error.message);
    }
  }
}

// Run the verification example
verificationExample();
