'use client';

import { useState, useMemo, memo } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import { AteraDevice } from '@/app/types/atera';
import { DeviceItem } from './DeviceItem';
import { cn, getDeviceFolder, isDeviceOnline } from '@/app/lib/utils';

interface FolderViewProps {
  devices: AteraDevice[];
  viewMode: 'grid' | 'list';
  onShowDetails: (device: AteraDevice) => void;
  onDeleteDevice?: (device: AteraDevice) => void;
}

interface FolderSectionProps {
  folderName: string;
  devices: AteraDevice[];
  viewMode: 'grid' | 'list';
  onShowDetails: (device: AteraDevice) => void;
  onDeleteDevice: ((device: AteraDevice) => void) | undefined;
  isNoFolder?: boolean;
}

const FolderSection = memo(function FolderSection({ 
  folderName, 
  devices, 
  viewMode, 
  onShowDetails, 
  onDeleteDevice,
  isNoFolder 
}: FolderSectionProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Memoize device counts for performance
  const { onlineCount, offlineCount } = useMemo(() => {
    const online = devices.filter(isDeviceOnline).length;
    return {
      onlineCount: online,
      offlineCount: devices.length - online
    };
  }, [devices]);

  return (
    <div className="mb-6">
      <div 
        className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        {isExpanded ? <FolderOpen className="w-5 h-5 text-blue-500" /> : <Folder className="w-5 h-5 text-blue-500" />}
        <h3 className="font-medium text-gray-900">
          {isNoFolder ? 'Ungrouped Devices' : folderName}
        </h3>
        <span className="ml-auto text-sm text-gray-600">
          {devices.length} device{devices.length !== 1 ? 's' : ''} 
          ({onlineCount} online, {offlineCount} offline)
        </span>
      </div>
      
      {isExpanded && (
        <div className={cn(
          'mt-3',
          viewMode === 'grid' 
            ? 'grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3'
            : 'space-y-2'
        )}>
          {devices.map((device) => (
            <DeviceItem
              key={device.DeviceGuid || device.AgentID}
              device={device}
              viewMode={viewMode}
              onShowDetails={onShowDetails}
              onDelete={onDeleteDevice}
            />
          ))}
        </div>
      )}
    </div>
  );
});

function FolderViewComponent({ devices, viewMode, onShowDetails, onDeleteDevice }: FolderViewProps) {
  // Memoize expensive grouping operation for better performance
  const devicesByFolder = useMemo(() => {
    return devices.reduce((acc, device) => {
      const folderName = getDeviceFolder(device);
      const key = folderName && folderName.trim() ? folderName.trim() : '__no_folder__';
      
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(device);
      
      return acc;
    }, {} as Record<string, AteraDevice[]>);
  }, [devices]);

  // Memoize sorted folders calculation
  const sortedFolders = useMemo(() => {
    return Object.keys(devicesByFolder)
      .filter(key => key !== '__no_folder__')
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  }, [devicesByFolder]);

  return (
    <div className={cn(
      viewMode === 'list' ? 'max-w-[792px]' : 'max-w-[1200px]',
      'mx-auto'
    )}>
      {sortedFolders.map((folderName) => (
        <FolderSection
          key={folderName}
          folderName={folderName}
          devices={devicesByFolder[folderName] || []}
          viewMode={viewMode}
          onShowDetails={onShowDetails}
          onDeleteDevice={onDeleteDevice}
        />
      ))}
      
      {devicesByFolder['__no_folder__'] && (
        <FolderSection
          folderName="__no_folder__"
          devices={devicesByFolder['__no_folder__']}
          viewMode={viewMode}
          onShowDetails={onShowDetails}
          onDeleteDevice={onDeleteDevice}
          isNoFolder
        />
      )}
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FolderView = memo(FolderViewComponent);