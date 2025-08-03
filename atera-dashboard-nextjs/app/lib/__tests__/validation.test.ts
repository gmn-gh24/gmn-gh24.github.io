import { validateApiKey, validateSearchQuery, sanitizeInput, escapeHtml } from '../validation';

describe('Validation Utilities', () => {
  describe('validateApiKey', () => {
    it('should accept valid API keys', () => {
      const result = validateApiKey('valid_api_key_that_is_long_enough_12345');
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject short API keys', () => {
      const result = validateApiKey('short');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('API key must be at least 20 characters');
    });

    it('should reject API keys with invalid characters', () => {
      const result = validateApiKey('invalid<script>alert("xss")</script>key');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('API key contains invalid characters');
    });

    it('should reject API keys containing script tags', () => {
      const result = validateApiKey('validlengthbutcontainsscripthere');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid API key format');
    });

    it('should reject empty API keys', () => {
      const result = validateApiKey('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('API key is required');
    });
  });

  describe('validateSearchQuery', () => {
    it('should accept valid search queries', () => {
      const result = validateSearchQuery('valid search query');
      expect(result.isValid).toBe(true);
    });

    it('should reject queries with invalid characters', () => {
      const result = validateSearchQuery('invalid<script>query');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Invalid characters in search query');
    });

    it('should reject overly long queries', () => {
      const longQuery = 'a'.repeat(101);
      const result = validateSearchQuery(longQuery);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Search query too long');
    });

    it('should accept empty queries', () => {
      const result = validateSearchQuery('');
      expect(result.isValid).toBe(true);
    });
  });

  describe('sanitizeInput', () => {
    it('should remove dangerous characters', () => {
      const result = sanitizeInput('<script>alert("xss")</script>');
      expect(result).toBe('alert("xss")');
    });

    it('should remove javascript: protocols', () => {
      const result = sanitizeInput('javascript:alert("xss")');
      expect(result).toBe('alert("xss")');
    });

    it('should remove event handlers', () => {
      const result = sanitizeInput('onclick=alert("xss")');
      expect(result).toBe('alert("xss")');
    });

    it('should trim whitespace', () => {
      const result = sanitizeInput('  clean input  ');
      expect(result).toBe('clean input');
    });
  });

  describe('escapeHtml', () => {
    it('should escape HTML entities', () => {
      const result = escapeHtml('<script>alert("xss")</script>');
      expect(result).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    });

    it('should escape quotes', () => {
      const result = escapeHtml('Hello "world" & \'universe\'');
      expect(result).toBe('Hello &quot;world&quot; &amp; &#039;universe&#039;');
    });

    it('should leave clean text unchanged', () => {
      const result = escapeHtml('Clean text without special characters');
      expect(result).toBe('Clean text without special characters');
    });
  });
});
