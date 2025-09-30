// Test setup file
// This file is run before all tests

// Mock fetch for Node.js environments that don't have it
if (!global.fetch) {
  global.fetch = require('node-fetch');
}
