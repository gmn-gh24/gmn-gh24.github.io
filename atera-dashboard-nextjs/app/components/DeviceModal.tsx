'use client';

import { useEffect } from 'react';
import { X, Monitor, AlertTriangle } from 'lucide-react';
import { AteraDevice } from '@/app/types/atera';
import { cn, getDeviceName, getDeviceInfo, isDeviceOnline, getDaysOffline } from '@/app/lib/utils';

interface DeviceModalProps {
  device: AteraDevice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DeviceModal({ device, isOpen, onClose }: DeviceModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !device) return null;

  const deviceName = getDeviceName(device);
  const info = getDeviceInfo(device, true);
  const isOnline = isDeviceOnline(device);
  const daysOffline = getDaysOffline(device);

  // Build status with warning if applicable
  const hasWarning = daysOffline !== null && daysOffline > 30;

  // Build modal content with specific layout structure
  const ext = info.extended;
  
  // Left Column - Fixed structure
  const leftColumn = [
    { label: 'Device Name', value: deviceName },
    { label: 'Folder', value: device.FolderName || device.CustomerName || 'No folder assigned' },
    { label: 'Motherboard', value: ext?.motherboard !== 'Unknown' ? ext.motherboard : 'Unknown' },
    { label: 'Processor', value: ext?.cpu && ext.cpu !== 'Unknown Computer' && ext.cpu !== 'Unknown Unknown' ? ext.cpu : 'Unknown' },
    { label: 'IP Address', value: info.ipAddress },
    { label: 'Model', value: ext?.vendorModel !== 'Unknown' ? ext.vendorModel : 'Unknown' },
    { label: 'Operating System', value: info.os },
    { label: 'Domain', value: ext?.domainName !== 'Not domain joined' ? ext.domainName : 'Not domain joined' }
  ];

  // Right Column - Fixed structure
  const rightColumn = [
    { label: 'Last Reboot', value: info.lastReboot },
    { 
      label: 'Logged-in User', 
      value: info.loggedUser,
      hasWarning: hasWarning,
      warningText: hasWarning ? `⚠️ (offline for ${daysOffline} days)` : null
    },
    { 
      label: 'BIOS', 
      value: ext?.biosInfo !== 'Unknown' ? 
        (ext.biosDate !== 'Unknown' ? `${ext.biosInfo} (${ext.biosDate})` : ext.biosInfo) : 'Unknown' 
    },
    { label: 'Memory', value: info.memory },
    { label: 'Public IP', value: ext?.reportedFromIP !== 'Unknown' ? ext.reportedFromIP : 'Unknown' },
    { label: 'Serial Number', value: ext?.vendorSerial !== 'Unknown' ? ext.vendorSerial : 'Unknown' },
    { label: 'Windows Key', value: ext?.windowsSerial !== 'Unknown' ? ext.windowsSerial : 'Unknown' },
    { label: 'MAC Addresses', value: ext?.macAddresses !== 'Unknown' ? ext.macAddresses : 'Unknown' }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-[800px] w-[95%] max-h-[95vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="flex items-center justify-between p-5 border-b-2 border-gray-100 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-900">{deviceName}</h2>
            <button
              onClick={onClose}
              className="p-0 w-8 h-8 hover:bg-gray-100 rounded-full transition-colors flex items-center justify-center text-gray-600 hover:text-gray-900"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="flex-1 p-5 text-sm leading-relaxed">
            <div className={cn(
              'flex items-center gap-2 mb-4 p-3 rounded-lg',
              isOnline ? 'bg-green-50' : 'bg-gray-50'
            )}>
              <div className={cn(
                'w-3 h-3 rounded-full',
                isOnline ? 'bg-green-500' : 'bg-gray-400'
              )} />
              <span className={cn(
                'font-medium text-sm',
                isOnline ? 'text-green-700' : 'text-gray-700'
              )}>
                {isOnline ? 'Device is Online' : `Device is Offline (${daysOffline} days)`}
              </span>
              {daysOffline !== null && daysOffline > 30 && (
                <AlertTriangle className="w-4 h-4 text-orange-500 ml-auto" />
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                {leftColumn.map((row, index) => (
                  <div key={index} className="flex flex-col py-1 border-b border-gray-100 last:border-b-0">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-0.5">{row.label}</div>
                    <div className="text-sm text-gray-900 break-words">
                      {row.value}
                      {(row as any).hasWarning && (
                        <span className="text-orange-600 font-medium text-xs ml-1">
                          {(row as any).warningText}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-col gap-1">
                {rightColumn.map((row, index) => (
                  <div key={index} className="flex flex-col py-1 border-b border-gray-100 last:border-b-0">
                    <div className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-0.5">{row.label}</div>
                    <div className="text-sm text-gray-900 break-words">
                      {row.value}
                      {(row as any).hasWarning && (
                        <span className="text-orange-600 font-medium text-xs ml-1">
                          {(row as any).warningText}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-end p-4 border-t bg-gray-50 flex-shrink-0">
            <a
              href={device.AppViewUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              <Monitor className="w-4 h-4" />
              Manage in Atera
            </a>
          </div>
      </div>
    </div>
  );
}