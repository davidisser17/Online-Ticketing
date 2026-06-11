// ============================================================
// Vitest global test setup
// Runs before every test suite (configured in vitest.config.ts)
// ============================================================

// 1. Extend Vitest's `expect` with jest-dom matchers so we can write
//    assertions like `expect(el).toBeInTheDocument()`.
import '@testing-library/jest-dom';

// 2. MSW server setup - intercepts fetch/XHR calls during tests.
//    Individual test files import `server` to add request handlers.
import { setupServer } from 'msw/node';

export const server = setupServer();

// Start server before all tests in a suite, clean handlers after
// each test, and close cleanly when done.
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
