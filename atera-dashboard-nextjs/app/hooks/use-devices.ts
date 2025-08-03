'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { AteraDevice } from '../types/atera';
import { apiClient } from '../lib/atera-api';
import { APP_CONFIG } from '../lib/constants';

interface UseDevicesOptions {
  enabled?: boolean;
  refetchInterval?: number;
  onError?: (error: Error) => void;
  onSuccess?: (data: AteraDevice[]) => void;
}

interface UseDevicesResult {
  data: AteraDevice[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

export function useDevices(options: UseDevicesOptions = {}): UseDevicesResult {
  const {
    enabled = true,
    refetchInterval = APP_CONFIG.POLLING_INTERVAL,
    onError,
    onSuccess,
  } = options;

  const [data, setData] = useState<AteraDevice[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  const fetchDevices = useCallback(async (): Promise<void> => {
    if (!enabled) return;

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const devices = await apiClient.fetchAllDevices();
      
      if (mountedRef.current) {
        setData(devices);
        setIsError(false);
        setError(null);
        onSuccess?.(devices);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch devices');
      
      if (mountedRef.current) {
        setIsError(true);
        setError(error);
        onError?.(error);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [enabled, onError, onSuccess]);

  const invalidate = useCallback(() => {
    setData(undefined);
  }, []);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchDevices();
    }
  }, [enabled, fetchDevices]);

  // Set up polling
  useEffect(() => {
    if (enabled && refetchInterval > 0) {
      intervalRef.current = setInterval(fetchDevices, refetchInterval);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
    
    return () => {
      // Cleanup function for when polling is disabled
    };
  }, [enabled, refetchInterval, fetchDevices]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    data,
    isLoading,
    isError,
    error,
    refetch: fetchDevices,
    invalidate,
  };
}

// Hook for device operations
export function useDeviceOperations() {
  const deleteDevice = useCallback(async (device: AteraDevice): Promise<void> => {
    const agentId = device.AgentId || device.AgentID;
    const deviceName = device.ComputerName || device.MachineName || device.AgentName || 'Unknown Device';
    
    if (!agentId) {
      throw new Error('Device ID not found');
    }

    const success = await apiClient.deleteDevice(agentId, deviceName);
    if (!success) {
      throw new Error('Failed to delete device');
    }
  }, []);

  return {
    deleteDevice,
  };
}
