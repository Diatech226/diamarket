// Test runtime bootstrap for backend node:test suite.
// Keep this file lightweight so missing external diaPay packages do not break test startup.

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.TZ = process.env.TZ || 'UTC';
