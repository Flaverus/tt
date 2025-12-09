const path = require('path');

module.exports = {
  rootDir: path.resolve(__dirname),
  testEnvironment: 'jsdom',

  // Configure transformers for Vue, TypeScript, and Babel
  transform: {
    '^.+\\.vue$': '@vue/vue3-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx|mjs|cjs)$': 'babel-jest',
    '\\.(css|sass|scss|png|jpg|gif|svg|jpeg|webp)$': 'jest-transform-stub',
  },

  // Map aliases and mock non-JS assets
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  testMatch: [
    '**/__tests__/**/*.spec.[jt]s?(x)'
  ],

  // Required setting for Jest 29+ with Vue Test Utils to prevent component access errors
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },

  // Setup file for Sinon.js globals
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],

  // TS-Jest specific settings
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json'
    }
  }
};