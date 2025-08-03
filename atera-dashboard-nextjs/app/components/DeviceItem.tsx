'use client';

import { useState, useRef, useEffect, useMemo, memo } from 'react';
import { MoreVertical, Trash2, User, HardDrive, Cpu, ExternalLink } from 'lucide-react';
import { AteraDevice } from '@/app/types/atera';
import { DeviceCircle } from './DeviceCircle';
import { cn, getDeviceName, getDeviceStatus, getDeviceInfo, isLongOffline } from '@/app/lib/utils';

interface DeviceItemProps {
  device: AteraDevice;
  viewMode: 'grid' | 'list';
  onShowDetails: (device: AteraDevice) => void;
  onDelete: ((device: AteraDevice) => void) | undefined;
}

function DeviceItemComponent({ device, viewMode, onShowDetails, onDelete }: DeviceItemProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'top' | 'bottom'>('top');
  const tooltipRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  
  // Memoize expensive computations
  const deviceStatus = useMemo(() => getDeviceStatus(device), [device]);
  const deviceName = useMemo(() => getDeviceName(device), [device]);
  const deviceInfo = useMemo(() => getDeviceInfo(device, true), [device]);
  const longOffline = useMemo(() => isLongOffline(device), [device]);
  
  const { isOnline, lastSeen } = deviceStatus;

  const checkTooltipPosition = () => {
    if (!circleRef.current || !tooltipRef.current) return;
    
    const circleRect = circleRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    // Check if tooltip would be cut off at the top
    const tooltipTop = circleRect.top - tooltipRect.height - 8; // 8px margin
    
    if (tooltipTop < 0) {
      setTooltipPosition('bottom');
    } else {
      setTooltipPosition('top');
    }
  };

  useEffect(() => {
    if (showTooltip) {
      // Small delay to ensure tooltip is rendered before measuring
      const timer = setTimeout(checkTooltipPosition, 10);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [showTooltip]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (onDelete) {
      onDelete(device);
    }
  };

  if (viewMode === 'list') {
    return (
      <div className="modern-card animate-fade-in group hover:scale-[1.01] transition-all duration-200 overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto] items-center px-6 py-4 gap-4">
          {/* Left: Device Status & Basic Info */}
          <div className="flex items-center gap-4">
            <DeviceCircle 
              status={isOnline ? 'online' : 'offline'} 
              size="small"
              onClick={() => onShowDetails(device)}
              showIcon={true}
            />
            
            <div className="space-y-1">
              <div className="font-bold text-gray-900 text-lg">{deviceName}</div>
              <div className="flex items-center gap-2 text-sm">
                <div className={cn(
                  'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                  isOnline 
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                    : 'bg-slate-100 text-slate-900 border border-slate-300'
                )}>
                  {isOnline ? '● Online' : '● Offline'}
                </div>
                {!isOnline && lastSeen !== 'Unknown' && (
                  <span className="text-gray-500 text-xs">• {lastSeen}</span>
                )}
              </div>
            </div>
          </div>
          
          {/* Center: Device Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
              <User className="w-4 h-4 flex-shrink-0" />
              <div className="truncate">
                <span className="font-semibold">User:</span> {deviceInfo.loggedUser}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
              <HardDrive className="w-4 h-4 flex-shrink-0" />
              <div className="truncate">
                <span className="font-semibold">IP:</span> {deviceInfo.ipAddress}
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-700 min-w-0">
              <Cpu className="w-4 h-4 flex-shrink-0" />
              <div className="truncate">
                <span className="font-semibold">OS:</span> {deviceInfo.os}
              </div>
            </div>
          </div>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowDetails(device)}
              className="btn-primary text-sm px-4 py-2 hover:scale-105 transition-transform"
            >
              View Details
            </button>
            
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors focus-ring"
                aria-label="Device options"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
              
              {showMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 min-w-[200px] animate-fade-in">
                    <div className="py-2">
                      <a
                        href={device.AppViewUrl || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="w-4 h-4" />
                        Manage in Atera
                      </a>
                      
                      {longOffline && (
                        <>
                          <div className="border-t border-gray-100 my-2" />
                          <button
                            onClick={handleDelete}
                            className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Device
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200 shadow-sm hover:shadow-md">
      <div className="flex flex-col items-center text-center relative">
        <div
          ref={circleRef}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <DeviceCircle 
            status={isOnline ? 'online' : 'offline'}
            onClick={() => onShowDetails(device)}
            className="mb-2"
            showIcon={true}
          />
        </div>
        
        <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={deviceName}>
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
        <div 
          ref={tooltipRef}
          className={cn(
            "absolute left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg p-3 z-50 shadow-lg min-w-[350px] max-w-[500px]",
            tooltipPosition === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          <div className="space-y-1 text-left">
            <div className="tooltip-row"><span className="font-bold text-gray-300">Device:</span> {deviceName}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">Last Reboot:</span> {deviceInfo.lastReboot}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">Logged User:</span> {deviceInfo.loggedUser}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">Status:</span> {isOnline ? 'Online' : lastSeen}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">OS:</span> {deviceInfo.os}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">IP Address:</span> {deviceInfo.ipAddress}</div>
            <div className="tooltip-row"><span className="font-bold text-gray-300">Memory:</span> {deviceInfo.memory}</div>
            {deviceInfo.extended && (
              <>
                {deviceInfo.extended.cpu && deviceInfo.extended.cpu !== 'Unknown Computer' && deviceInfo.extended.cpu !== 'Unknown Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Processor:</span> {deviceInfo.extended.cpu}</div>
                )}
                {deviceInfo.extended.biosInfo !== 'Unknown' && (
                  <div className="tooltip-row">
                    <span className="font-bold text-gray-300">BIOS:</span> 
                    {deviceInfo.extended.biosDate !== 'Unknown' ? `${deviceInfo.extended.biosInfo} (${deviceInfo.extended.biosDate})` : deviceInfo.extended.biosInfo}
                  </div>
                )}
                {deviceInfo.extended.vendorModel !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Model:</span> {deviceInfo.extended.vendorModel}</div>
                )}
                {deviceInfo.extended.vendorSerial !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Serial:</span> {deviceInfo.extended.vendorSerial}</div>
                )}
                {deviceInfo.extended.motherboard !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Motherboard:</span> {deviceInfo.extended.motherboard}</div>
                )}
                {deviceInfo.extended.domainName !== 'Not domain joined' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Domain:</span> {deviceInfo.extended.domainName}</div>
                )}
                {deviceInfo.extended.macAddresses !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">MAC Address:</span> {deviceInfo.extended.macAddresses}</div>
                )}
                {deviceInfo.extended.windowsSerial !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Windows Serial:</span> {deviceInfo.extended.windowsSerial}</div>
                )}
                {deviceInfo.extended.reportedFromIP !== 'Unknown' && (
                  <div className="tooltip-row"><span className="font-bold text-gray-300">Public IP:</span> {deviceInfo.extended.reportedFromIP}</div>
                )}
              </>
            )}
          </div>
          {/* Dynamic arrow positioning */}
          <div className={cn(
            "absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-transparent",
            tooltipPosition === 'top' 
              ? 'top-full border-t-4 border-t-gray-900' 
              : 'bottom-full border-b-4 border-b-gray-900'
          )} />
        </div>
      )}
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const DeviceItem = memo(DeviceItemComponent);