'use client';

import { AteraDevice } from '@/app/types/atera';
import { DeviceItem } from './DeviceItem';
import { cn } from '@/app/lib/utils';

interface DeviceGridProps {
  devices: AteraDevice[];
  viewMode: 'grid' | 'list';
  onShowDetails: (device: AteraDevice) => void;
  onDeleteDevice?: (device: AteraDevice) => void;
  className?: string;
}

export function DeviceGrid({ 
  devices, 
  viewMode, 
  onShowDetails, 
  onDeleteDevice,
  className 
}: DeviceGridProps) {
  if (devices.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No devices found
      </div>
    );
  }

  return (
    <div className={cn(
      viewMode === 'grid' 
        ? 'grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3 max-w-[1200px] mx-auto'
        : 'flex flex-col gap-2 max-w-[792px] mx-auto',
      className
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
  );
}