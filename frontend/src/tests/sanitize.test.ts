import { describe, it, expect } from 'vitest';
import { sanitizeInput } from '@/utils/sanitize';

describe('Sanitization escaping Utility', () => {
  it('correctly escapes HTML control character sequences', () => {
    const rawXssPayload = '<script>alert("XSS")</script>';
    const escapedText = sanitizeInput(rawXssPayload);

    expect(escapedText).not.toContain('<script>');
    expect(escapedText).not.toContain('</script>');
    expect(escapedText).toContain('&lt;script&gt;');
  });

  it('handles regular text without modifications', () => {
    const safeText = 'Clean normal textual message';
    expect(sanitizeInput(safeText)).toBe(safeText);
  });
});
