import { AteraDevice, AteraApiResponse } from '@/app/types/atera';
import { APP_CONFIG, API_ENDPOINTS } from './constants';
import { validateApiKey } from './validation';

const CONFIG = {
  API_BASE_URL: API_ENDPOINTS.BASE_URL,
  ITEMS_PER_PAGE: APP_CONFIG.MAX_DEVICES_PER_PAGE,
  REQUEST_TIMEOUT_MS: APP_CONFIG.REQUEST_TIMEOUT,
  RETRY_DELAY_MS: APP_CONFIG.RETRY_DELAY,
  MAX_RETRIES: APP_CONFIG.MAX_RETRIES,
  REFRESH_INTERVAL_MS: APP_CONFIG.POLLING_INTERVAL,
  REFRESH_COUNTDOWN_INTERVAL_MS: 1000
};

export class AteraApiClient {
  private apiKey: string | null = null;

  setApiKey(apiKey: string): void {
    // Validate the API key before setting it
    const validation = validateApiKey(apiKey);
    if (!validation.isValid) {
      throw new Error(validation.error || 'Invalid API key');
    }
    
    this.apiKey = apiKey;
  }

  getApiKey(): string | null {
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'DELETE' = 'GET',
    options: RequestInit = {},
    retryCount = 0
  ): Promise<Response> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    const url = `${CONFIG.API_BASE_URL}/${endpoint}`;
    const headers = {
      'X-API-KEY': this.apiKey,
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method,
        headers,
        signal: controller.signal,
        ...options
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if ((response.status === 429 || response.status >= 500) && retryCount < CONFIG.MAX_RETRIES) {
          const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, retryCount);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.makeRequest(endpoint, method, options, retryCount + 1);
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      
      if (error.message.includes('fetch') && retryCount < CONFIG.MAX_RETRIES) {
        const delay = CONFIG.RETRY_DELAY_MS * Math.pow(2, retryCount);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.makeRequest(endpoint, method, options, retryCount + 1);
      }
      
      throw error;
    }
  }

  async fetchAllDevices(): Promise<AteraDevice[]> {
    const allDevices: AteraDevice[] = [];
    let page = 1;
    let totalPages = 1;

    do {
      const response = await this.makeRequest(`agents?page=${page}&itemsInPage=${CONFIG.ITEMS_PER_PAGE}`);
      const data: AteraApiResponse<AteraDevice> = await response.json();

      if (data.items) {
        allDevices.push(...data.items);
      }

      totalPages = data.totalPages || 1;
      page++;
    } while (page <= totalPages);

    return allDevices;
  }

  async deleteDevice(agentId: number, _deviceName: string): Promise<boolean> {
    try {
      const response = await this.makeRequest(`agents/${agentId}`, 'DELETE');
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Device not found or already deleted');
        } else if (response.status === 403) {
          throw new Error('Access denied - insufficient permissions');
        } else if (response.status === 405) {
          throw new Error('Delete operation not allowed - device may have dependencies');
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting device:', error);
      throw error;
    }
  }

  async validateApiKey(apiKey: string): Promise<boolean> {
    const tempApiKey = this.apiKey;
    try {
      this.apiKey = apiKey;
      
      const response = await this.makeRequest('agents?page=1&itemsInPage=1');
      const data = await response.json();
      
      this.apiKey = tempApiKey;
      
      return response.ok && data.items !== undefined;
    } catch (error) {
      this.apiKey = tempApiKey;
      return false;
    }
  }
}

export const apiClient = new AteraApiClient();