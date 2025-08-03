import { STORAGE_KEYS } from './constants';

class SecureStorage {
  private static instance: SecureStorage;
  
  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  async setApiKey(apiKey: string): Promise<void> {
    try {
      // For now, use sessionStorage with simple encoding
      // In production, consider using Web Crypto API for encryption
      const encoded = btoa(apiKey);
      sessionStorage.setItem(STORAGE_KEYS.API_KEY, encoded);
    } catch (error) {
      console.error('Failed to store API key:', error);
      throw new Error('Failed to store API key securely');
    }
  }

  async getApiKey(): Promise<string | null> {
    try {
      const encoded = sessionStorage.getItem(STORAGE_KEYS.API_KEY);
      if (!encoded) return null;
      return atob(encoded);
    } catch (error) {
      console.error('Failed to retrieve API key:', error);
      sessionStorage.removeItem(STORAGE_KEYS.API_KEY);
      return null;
    }
  }

  async removeApiKey(): Promise<void> {
    sessionStorage.removeItem(STORAGE_KEYS.API_KEY);
    // Also remove legacy localStorage key if exists
    localStorage.removeItem('atera_api_key');
  }

  // Fallback method for existing localStorage API keys
  getLegacyApiKey(): string | null {
    return localStorage.getItem('atera_api_key');
  }

  // Migrate from localStorage to secure storage
  async migrateLegacyApiKey(): Promise<void> {
    const legacyKey = this.getLegacyApiKey();
    if (legacyKey) {
      await this.setApiKey(legacyKey);
      localStorage.removeItem('atera_api_key');
    }
  }

  setTheme(theme: string): void {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  }

  getTheme(): string | null {
    return localStorage.getItem(STORAGE_KEYS.THEME);
  }

  setViewMode(viewMode: string): void {
    localStorage.setItem(STORAGE_KEYS.VIEW_MODE, viewMode);
  }

  getViewMode(): string | null {
    return localStorage.getItem(STORAGE_KEYS.VIEW_MODE);
  }

  setFolderView(isFolderView: boolean): void {
    localStorage.setItem(STORAGE_KEYS.FOLDER_VIEW, String(isFolderView));
  }

  getFolderView(): boolean | null {
    const value = localStorage.getItem(STORAGE_KEYS.FOLDER_VIEW);
    return value ? value === 'true' : null;
  }
}

export const secureStorage = SecureStorage.getInstance();
