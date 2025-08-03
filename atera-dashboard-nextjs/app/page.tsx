'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { AlertCircle, Monitor } from 'lucide-react';
import { AteraDevice, DeviceFilter, ViewMode } from '@/app/types/atera';
import { apiClient } from '@/app/lib/atera-api';
import { secureStorage } from '@/app/lib/secure-storage';
import { FilterBar } from '@/app/components/FilterBar';
import { DeviceGrid } from '@/app/components/DeviceGrid';
import { FolderView } from '@/app/components/FolderView';
import { DeviceModal } from '@/app/components/DeviceModal';
import { ApiKeyModal } from '@/app/components/ApiKeyModal';
import { PageLoader } from '@/app/components/LoadingStates';
import { getDeviceName, getDeviceFolder, isDeviceOnline, getDeviceId } from '@/app/lib/utils';

export default function Home() {
  const [devices, setDevices] = useState<AteraDevice[]>([]);
  const [currentFilter, setCurrentFilter] = useState<DeviceFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isFolderView, setIsFolderView] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<AteraDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    const initializeApiKey = async () => {
      try {
        // First check for new secure storage
        let apiKey = await secureStorage.getApiKey();
        
        // If not found, check for legacy storage and migrate
        if (!apiKey) {
          const legacyKey = secureStorage.getLegacyApiKey();
          if (legacyKey) {
            await secureStorage.migrateLegacyApiKey();
            apiKey = legacyKey;
          }
        }
        
        if (apiKey) {
          apiClient.setApiKey(apiKey);
          loadDevices();
          setIsPolling(true);
        } else {
          setShowApiKeyModal(true);
        }
      } catch (error) {
        console.error('Failed to initialize API key:', error);
        setShowApiKeyModal(true);
      }
    };
    
    initializeApiKey();
  }, []);

  useEffect(() => {
    let refreshInterval: NodeJS.Timeout;
    let countdownInterval: NodeJS.Timeout;

    if (isPolling && !isLoading) {
      refreshInterval = setInterval(() => {
        loadDevices();
        setCountdown(30);
      }, 30000);

      countdownInterval = setInterval(() => {
        setCountdown(prev => prev > 0 ? prev - 1 : 30);
      }, 1000);
    }

    return () => {
      clearInterval(refreshInterval);
      clearInterval(countdownInterval);
    };
  }, [isPolling, isLoading]);

  const loadDevices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const allDevices = await apiClient.fetchAllDevices();
      setDevices(allDevices);
      setLastUpdated(new Date());
    } catch (err: any) {
      if (err.message.includes('401')) {
        setError('Invalid API key. Please check your credentials.');
        setShowApiKeyModal(true);
      } else {
        setError(`Failed to load devices: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDeleteDevice = async (device: AteraDevice) => {
    const deviceId = getDeviceId(device);
    const deviceName = getDeviceName(device);
    
    if (typeof deviceId !== 'number') {
      alert('Cannot delete this device: Invalid device ID');
      return;
    }
    
    const message = `Are you sure you want to delete "${deviceName}"?\n\nThis action cannot be undone.`;
    
    if (!confirm(message)) {
      return;
    }
    
    try {
      await apiClient.deleteDevice(deviceId, deviceName);
      setDevices(devices.filter(d => getDeviceId(d) !== deviceId));
      alert(`Successfully deleted device: ${deviceName}`);
    } catch (err: any) {
      alert(`Failed to delete device: ${err.message}`);
    }
  };

  // Memoize expensive filtering operation for better performance
  const filteredDevices = useMemo(() => {
    let filtered = [...devices];
    
    if (currentFilter !== 'all') {
      filtered = filtered.filter(device => {
        const isOnline = isDeviceOnline(device);
        return currentFilter === 'online' ? isOnline : !isOnline;
      });
    }
    
    if (selectedFolder) {
      filtered = filtered.filter(device => {
        try {
          const deviceFolder = getDeviceFolder(device);
          return deviceFolder === selectedFolder;
        } catch (e) {
          console.warn('Error filtering by folder for device:', device, e);
          return false;
        }
      });
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(device => {
        try {
          const searchFields = [
            getDeviceName(device),
            device.OS,
            device.IpAddresses?.[0],
            device.CurrentLoggedUsers,
            device.LastLoginUser,
            getDeviceFolder(device)
          ];
          
          return searchFields.some(field => 
            field && field.toLowerCase().includes(query)
          );
        } catch (e) {
          console.warn('Error filtering device in search:', device, e);
          return false;
        }
      });
    }
    
    return filtered.sort((a, b) => {
      const nameA = getDeviceName(a).toLowerCase();
      const nameB = getDeviceName(b).toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }, [devices, currentFilter, selectedFolder, searchQuery]);
  const onlineCount = devices.filter(isDeviceOnline).length;
  const offlineCount = devices.length - onlineCount;

  const handleReset = () => {
    setCurrentFilter('all');
    setSelectedFolder(null);
    setSearchQuery('');
    setViewMode('grid');
    setIsFolderView(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-200" role="banner">
        <div className="max-w-[1200px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Image
                  src="/atera/images/logo.jpg"
                  alt="Atera Logo"
                  width={162}
                  height={48}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-1">
                  Device Status Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Real-time monitoring and management
                </p>
              </div>
            </div>
            {lastUpdated && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
                {isPolling && !isLoading && (
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Next refresh in {countdown}s</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <FilterBar
        currentFilter={currentFilter}
        viewMode={viewMode}
        isFolderView={isFolderView}
        searchQuery={searchQuery}
        selectedFolder={selectedFolder}
        devices={devices || []}
        onFilterChange={setCurrentFilter}
        onViewModeChange={setViewMode}
        onFolderViewToggle={() => setIsFolderView(!isFolderView)}
        onFolderChange={setSelectedFolder}
        onSearchChange={setSearchQuery}
        onRefresh={loadDevices}
        onReset={handleReset}
        isLoading={isLoading}
        deviceCounts={{
          total: devices?.length || 0,
          online: onlineCount,
          offline: offlineCount
        }}
      />

      <main id="main-content" className="max-w-[1200px] mx-auto px-6 py-8" role="main" aria-label="Device dashboard content">
        {isLoading && <PageLoader />}

        {error && (
          <div className="max-w-2xl mx-auto" role="alert" aria-live="assertive">
            <div className="modern-card p-6 border-l-4 border-red-500 bg-red-50 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0" aria-hidden="true">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h2>
                  <p className="text-red-700 mb-4">{error}</p>
                  <button
                    onClick={loadDevices}
                    className="btn-primary bg-red-600 hover:bg-red-700 focus-ring"
                    aria-label="Retry loading devices"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {!isLoading && !error && devices.length === 0 && (
          <div className="text-center py-16" role="status" aria-live="polite">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center" aria-hidden="true">
                <Monitor className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No devices found</h2>
              <p className="text-gray-600 mb-6">
                It looks like there are no devices connected to your account yet.
              </p>
              <button
                onClick={loadDevices}
                className="btn-primary focus-ring"
                aria-label="Refresh device list"
              >
                Refresh Devices
              </button>
            </div>
          </div>
        )}

        {!isLoading && !error && filteredDevices.length > 0 && (
          <div className="animate-fade-in">
            {isFolderView ? (
              <FolderView
                devices={filteredDevices}
                viewMode={viewMode}
                onShowDetails={setSelectedDevice}
                onDeleteDevice={handleDeleteDevice}
              />
            ) : (
              <DeviceGrid
                devices={filteredDevices}
                viewMode={viewMode}
                onShowDetails={setSelectedDevice}
                onDeleteDevice={handleDeleteDevice}
              />
            )}
          </div>
        )}
      </main>

      <DeviceModal
        device={selectedDevice}
        isOpen={!!selectedDevice}
        onClose={() => setSelectedDevice(null)}
      />

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        onSuccess={loadDevices}
      />
    </div>
  );
}
