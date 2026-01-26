// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock console.error to reduce noise in tests
global.console = {
  ...console,
  error: jest.fn(),
}

// Polyfill for TextEncoder/TextDecoder (required by undici)
if (typeof globalThis.TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util')
  globalThis.TextEncoder = TextEncoder
  globalThis.TextDecoder = TextDecoder
}

// Polyfill for ReadableStream (required by undici)
if (typeof globalThis.ReadableStream === 'undefined') {
  const { ReadableStream } = require('stream/web')
  globalThis.ReadableStream = ReadableStream
}

// Polyfill for Web APIs (Request, Response) in Jest environment
// Node.js 18+ has built-in fetch, but Request/Response need to be available globally for Jest
if (typeof globalThis.Request === 'undefined') {
  const { Request, Response, Headers } = require('undici')
  globalThis.Request = Request
  globalThis.Response = Response
  globalThis.Headers = Headers
}
