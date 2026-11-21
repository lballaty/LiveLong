// File: /Users/liborballaty/LocalProjects/GitHubProjectsDocuments/TestRepo/web-app/jest.setup.js
// Description: Jest test environment setup and global mocks
// Author: Libor Ballaty <libor@arionetworks.com>
// Created: 2025-09-30

import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';

// Import fake IndexedDB implementation
import FDBFactory from 'fake-indexeddb/lib/FDBFactory';
import FDBKeyRange from 'fake-indexeddb/lib/FDBKeyRange';

// Set up fake IndexedDB in global scope
global.indexedDB = new FDBFactory();
global.IDBKeyRange = FDBKeyRange;

// Polyfill for structuredClone in jsdom test environment (preserves Date/Map/Set)
if (typeof structuredClone === 'undefined') {
  const v8 = require('v8');
  global.structuredClone = (obj) => v8.deserialize(v8.serialize(obj));
}

// Mock Web Workers
global.Worker = class Worker {
  constructor(stringUrl) {
    this.url = stringUrl;
    this.onmessage = null;
  }

  postMessage(msg) {
    // Mock implementation
  }

  terminate() {
    // Mock implementation
  }
};

// Mock Notification API
global.Notification = class Notification {
  static permission = 'granted';
  static requestPermission = jest.fn(() => Promise.resolve('granted'));
  constructor(title, options) {
    this.title = title;
    this.options = options;
  }
};

// Mock matchMedia for responsive design tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});