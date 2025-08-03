'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AteraDevice, DeviceFilter, ViewMode } from '@/app/types/atera';
import { apiClient } from '@/app/lib/atera-api';
import { FilterBar } from '@/app/components/FilterBar';
import { DeviceGrid } from '@/app/components/DeviceGrid';
import { FolderView } from '@/app/components/FolderView';
import { DeviceModal } from '@/app/components/DeviceModal';
import { ApiKeyModal } from '@/app/components/ApiKeyModal';
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
    const savedApiKey = localStorage.getItem('atera_api_key');
    if (savedApiKey) {
      apiClient.setApiKey(savedApiKey);
      loadDevices();
      setIsPolling(true);
    } else {
      setShowApiKeyModal(true);
    }
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

  const getFilteredDevices = useCallback(() => {
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

  const filteredDevices = getFilteredDevices();
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
      <header className="bg-white shadow-sm">
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Image
                src="/atera/images/logo.jpg"
                alt="Atera Logo"
                width={162}
                height={48}
                className="object-contain"
              />
              <h1 className="text-2xl font-semibold text-gray-900">
                Device Status Dashboard
              </h1>
            </div>
            {lastUpdated && (
              <div className="text-sm text-gray-600">
                Last updated: {lastUpdated.toLocaleTimeString()}
                {isPolling && !isLoading && (
                  <span className="ml-2 text-blue-600">
                    (next refresh in {countdown}s)
                  </span>
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

      <main className="max-w-[1200px] mx-auto px-4 py-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-3 text-gray-600">Loading devices...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {!isLoading && !error && devices.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg mb-2">No devices found</p>
            <p className="text-sm">Check your API key and try refreshing</p>
          </div>
        )}

        {!isLoading && !error && filteredDevices.length > 0 && (
          isFolderView ? (
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
          )
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
