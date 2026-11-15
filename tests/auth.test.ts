import { describe, expect, it } from 'vitest';
import { isBasicAuthValid } from '../server/auth';

describe('basic auth', () => {
  it('accepts the configured username and password', () => {
    const token = Buffer.from('student:secret').toString('base64');
    expect(isBasicAuthValid(`Basic ${token}`, 'student', 'secret')).toBe(true);
  });

  it('rejects missing or incorrect credentials', () => {
    expect(isBasicAuthValid(undefined, 'student', 'secret')).toBe(false);
    const token = Buffer.from('student:wrong').toString('base64');
    expect(isBasicAuthValid(`Basic ${token}`, 'student', 'secret')).toBe(false);
  });
});
