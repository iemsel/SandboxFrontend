export default {
  testEnvironment: 'jsdom',
  transform: {},
  moduleNameMapper: {
    '^\\$lib/(.*)$': '<rootDir>/src/lib/$1',
    '^\\$app/(.*)$': '<rootDir>/src/app/$1',
  },
  testMatch: ['**/tests/**/*.test.js', '**/*.test.js'],
  collectCoverageFrom: ['src/**/*.{js,svelte}', '!**/node_modules/**', '!**/.svelte-kit/**'],
};
