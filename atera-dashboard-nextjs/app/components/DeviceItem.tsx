'use client';

import { useState } from 'react';
import { Monitor, MoreVertical, Trash2 } from 'lucide-react';
import { AteraDevice } from '@/app/types/atera';
import { DeviceCircle } from './DeviceCircle';
import { cn, getDeviceName, getDeviceStatus, getDeviceInfo, isLongOffline, getDaysOffline } from '@/app/lib/utils';

interface DeviceItemProps {
  device: AteraDevice;
  viewMode: 'grid' | 'list';
  onShowDetails: (device: AteraDevice) => void;
  onDelete?: (device: AteraDevice) => void;
}

export function DeviceItem({ device, viewMode, onShowDetails, onDelete }: DeviceItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const { isOnline, lastSeen } = getDeviceStatus(device);
  const deviceName = getDeviceName(device);
  const info = getDeviceInfo(device, true); // Get extended info for tooltip
  const longOffline = isLongOffline(device);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(device);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="grid grid-cols-[auto_170px_auto_1fr_auto_80px_80px] items-center text-left bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm hover:shadow-md transition-shadow gap-x-2">
        <DeviceCircle 
          status={isOnline ? 'online' : 'offline'} 
          size="small"
          onClick={() => onShowDetails(device)}
        />
        
        <div className="truncate font-medium text-gray-900">{deviceName}</div>
        
        <div className={cn(
          'text-sm',
          isOnline ? 'text-green-600' : 'text-gray-500'
        )}>
          {isOnline ? 'Online' : 'Offline'}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-600 min-w-0">
          <div className="truncate">
            <span className="font-medium">IP:</span> {info.ipAddress}
          </div>
          <div className="truncate">
            <span className="font-medium">User:</span> {info.loggedUser}
          </div>
          <div className="truncate">
            <span className="font-medium">OS:</span> {info.os}
          </div>
        </div>
        
        <div className="text-sm text-gray-500 text-right whitespace-nowrap">
          {!isOnline && lastSeen}
        </div>
        
        <button
          onClick={() => onShowDetails(device)}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Details
        </button>
        
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-gray-600" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                {longOffline && (
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors whitespace-nowrap"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Device
                  </button>
                )}
                <a
                  href={device.AppViewUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Monitor className="w-4 h-4" />
                  Manage in Atera
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-col items-center text-center relative group"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <DeviceCircle 
        status={isOnline ? 'online' : 'offline'}
        onClick={() => onShowDetails(device)}
        className="mb-2"
      />
      
      <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]" title={deviceName}>
        {deviceName}
      </div>
      
      <div className={cn(
        'text-xs mt-1',
        isOnline ? 'text-green-600' : 'text-gray-500'
      )}>
        {isOnline ? 'Online' : 'Offline'}
      </div>
      
      {!isOnline && lastSeen !== 'Unknown' && (
        <div className="text-xs text-gray-400 mt-1">
          {lastSeen}
        </div>
      )}
      
      {showTooltip && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 z-50 shadow-lg min-w-[350px] max-w-[500px]">
          <div className="space-y-1 text-left">
            <div className="tooltip-row"><span className="font-bold text-gray-300">Device:</span> {deviceName}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">Last Reboot:</span> {info.lastReboot}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">Logged User:</span> {info.loggedUser}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">Status:</span> {isOnline ? 'Online' : lastSeen}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">OS:</span> {info.os}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">IP Address:</span> {info.ipAddress}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">Memory:</span> {info.memory}</div>
            {info.extended && (
              <>
                {info.extended.cpu && info.extended.cpu !== 'Unknown Computer' && info.extended.cpu !== 'Unknown Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Processor:</span> {info.extended.cpu}</div>
                )}
                {info.extended.biosInfo !== 'Unknown' && (
                  <div className="tooltip-row">
                    <span className="font-bold text-gray-300">BIOS:</span> 
                    {info.extended.biosDate !== 'Unknown' ? `${info.extended.biosInfo} (${info.extended.biosDate})` : info.extended.biosInfo}
                  </div>
                )}
                {info.extended.vendorModel !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Model:</span> {info.extended.vendorModel}</div>
                )}
                {info.extended.vendorSerial !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Serial:</span> {info.extended.vendorSerial}</div>
                )}
                {info.extended.motherboard !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Motherboard:</span> {info.extended.motherboard}</div>
                )}
                {info.extended.domainName !== 'Not domain joined' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Domain:</span> {info.extended.domainName}</div>
                )}
                {info.extended.macAddresses !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">MAC Address:</span> {info.extended.macAddresses}</div>
                )}
                {info.extended.windowsSerial !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Windows Serial:</span> {info.extended.windowsSerial}</div>
                )}
                {info.extended.reportedFromIP !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Public IP:</span> {info.extended.reportedFromIP}</div>
                )}
              </>
            )}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900" />
        </div>
      )}
    </div>
  );
}