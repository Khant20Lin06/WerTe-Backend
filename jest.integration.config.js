/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/integration/**/*.integration.spec.ts'],
  setupFiles: ['<rootDir>/test/integration/setup-env.ts'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  clearMocks: true,
};
