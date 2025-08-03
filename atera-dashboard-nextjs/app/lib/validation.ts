// Note: Install zod first: npm install zod
// For now, we'll implement validation without zod to avoid build errors

export const apiKeyRegex = /^[A-Za-z0-9\-_.]+$/;
export const searchQueryRegex = /^[A-Za-z0-9\s\-_.@]*$/;

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>\/]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/script/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

export function validateApiKey(apiKey: string): { isValid: boolean; error?: string } {
  if (!apiKey || typeof apiKey !== 'string') {
    return { isValid: false, error: 'API key is required' };
  }
  
  if (apiKey.length < 20) {
    return { isValid: false, error: 'API key must be at least 20 characters' };
  }
  
  if (apiKey.length > 500) {
    return { isValid: false, error: 'API key is too long' };
  }
  
  if (!apiKeyRegex.test(apiKey)) {
    return { isValid: false, error: 'API key contains invalid characters' };
  }
  
  if (apiKey.toLowerCase().includes('script')) {
    return { isValid: false, error: 'Invalid API key format' };
  }
  
  return { isValid: true };
}

export function validateSearchQuery(query: string): { isValid: boolean; error?: string } {
  if (typeof query !== 'string') {
    return { isValid: false, error: 'Search query must be a string' };
  }
  
  if (query.length > 100) {
    return { isValid: false, error: 'Search query too long' };
  }
  
  if (!searchQueryRegex.test(query)) {
    return { isValid: false, error: 'Invalid characters in search query' };
  }
  
  return { isValid: true };
}

export function validateDeviceId(id: string | number): { isValid: boolean; error?: string } {
  if (typeof id === 'string' && id.length > 0) {
    return { isValid: true };
  }
  
  if (typeof id === 'number' && id > 0) {
    return { isValid: true };
  }
  
  return { isValid: false, error: 'Invalid device ID' };
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  
  return text.replace(/[&<>"']/g, (m) => map[m] || m);
}
