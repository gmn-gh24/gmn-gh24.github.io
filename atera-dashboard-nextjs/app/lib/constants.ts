export const APP_CONFIG = {
  POLLING_INTERVAL: 30000,
  REQUEST_TIMEOUT: 30000,
  LONG_OFFLINE_THRESHOLD_DAYS: 30,
  MAX_DEVICES_PER_PAGE: 50,
  DEBOUNCE_DELAY: 300,
  RETRY_DELAY: 1000,
  MAX_RETRIES: 3,
} as const;

export const UI_CONSTANTS = {
  GRID_BREAKPOINTS: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
  },
  ANIMATION_DURATION: {
    fast: 150,
    normal: 300,
    slow: 500,
  },
  DEVICE_CIRCLE_SIZES: {
    small: 'w-10 h-10',
    medium: 'w-[60px] h-[60px]',
    large: 'w-20 h-20',
  },
  ICON_SIZES: {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  },
} as const;

export const STORAGE_KEYS = {
  API_KEY: 'atera_api_key_encrypted',
  THEME: 'atera_theme',
  VIEW_MODE: 'atera_view_mode',
  FOLDER_VIEW: 'atera_folder_view',
} as const;

export const API_ENDPOINTS = {
  BASE_URL: 'https://app.atera.com/api/v3',
  DEVICES: '/agents',
  DEVICE_DETAILS: (id: string) => `/agents/${id}`,
} as const;
