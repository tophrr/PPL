import { describe, expect, test } from '@jest/globals';
import { cn, toneDot, toneSurface } from '@/src/components/kitalaku/primitives';
import { formatDate } from '@/src/utils/helpers';

describe('cn', () => {
  test('should concatenate only truthy class names', () => {
    expect(cn('panel', false, undefined, 'active', null, 'dense')).toBe('panel active dense');
  });
});

describe('toneDot', () => {
  test('should return emerald class for approved tone', () => {
    expect(toneDot('approved')).toContain('--emerald');
  });

  test('should return purple class for review tone', () => {
    expect(toneDot('review')).toContain('--purple');
  });

  test('should return amber class for draft tone', () => {
    expect(toneDot('draft')).toContain('--amber');
  });
});

describe('toneSurface', () => {
  test('should return approved surface classes', () => {
    expect(toneSurface('approved')).toContain('--emerald-soft');
  });

  test('should return review surface classes', () => {
    expect(toneSurface('review')).toContain('124,58,237');
  });

  test('should return draft surface classes', () => {
    expect(toneSurface('draft')).toContain('--amber-soft');
  });
});

describe('formatDate', () => {
  test('should convert a Date to an ISO string', () => {
    expect(formatDate(new Date('2026-04-25T10:15:30.000Z'))).toBe('2026-04-25T10:15:30.000Z');
  });
});
