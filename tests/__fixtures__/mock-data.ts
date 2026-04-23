/**
 * General mock data fixtures
 */

export const mockTimestamps = {
  past: '2024-01-01T00:00:00Z',
  recent: '2024-03-01T12:00:00Z',
  future: '2025-01-01T00:00:00Z',
};

export const mockIds = {
  valid: ['clh1a2b3c4d5e6f7g8h9i0j1', 'clh2a2b3c4d5e6f7g8h9i0j2', 'clh3a2b3c4d5e6f7g8h9i0j3'],
  invalid: ['invalid-id', '123', ''],
};

export const mockStrings = {
  short: 'ab',
  medium: 'Hello World',
  long: 'A'.repeat(100),
  empty: '',
  withSpecialChars: 'Test@123!#$%',
  withEmoji: '🚀 Rocket Test',
};

export const mockNumbers = {
  zero: 0,
  positive: 42,
  negative: -42,
  float: 3.14,
  large: 999999999,
};

export const mockBooleans = {
  true: true,
  false: false,
};
