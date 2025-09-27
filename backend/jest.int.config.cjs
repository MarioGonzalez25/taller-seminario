// jest.int.config.cjs — SOLO integración
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/integration'],
  testMatch: ['**/*.test.js'],
  transform: {},
  verbose: true,
  testTimeout: 60000 // ⬅️ importante para la 1ª corrida en Windows
};
