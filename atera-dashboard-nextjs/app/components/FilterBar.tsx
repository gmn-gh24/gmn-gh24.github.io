'use client';

import { Search, Grid, List, FolderOpen, RotateCw, X } from 'lucide-react';
import { DeviceFilter, ViewMode, AteraDevice } from '@/app/types/atera';
import { cn } from '@/app/lib/utils';
import { FolderDropdown } from './FolderDropdown';

interface FilterBarProps {
  currentFilter: DeviceFilter;
  viewMode: ViewMode;
  isFolderView: boolean;
  searchQuery: string;
  selectedFolder: string | null;
  devices: AteraDevice[];
  onFilterChange: (filter: DeviceFilter) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onFolderViewToggle: () => void;
  onFolderChange: (folder: string | null) => void;
  onSearchChange: (query: string) => void;
  onRefresh: () => void;
  onReset: () => void;
  isLoading?: boolean;
  deviceCounts: {
    total: number;
    online: number;
    offline: number;
  };
}

export function FilterBar({
  currentFilter,
  viewMode,
  isFolderView,
  searchQuery,
  selectedFolder,
  devices,
  onFilterChange,
  onViewModeChange,
  onFolderViewToggle,
  onFolderChange,
  onSearchChange,
  onRefresh,
  onReset,
  isLoading,
  deviceCounts
}: FilterBarProps) {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-[1200px] mx-auto p-4">
        {/* Status Summary Section */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">{deviceCounts.total}</div>
              <div className="text-sm text-gray-600">Total Devices</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">{deviceCounts.online}</div>
              <div className="text-sm text-gray-600">Online</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-600">{deviceCounts.offline}</div>
              <div className="text-sm text-gray-600">Offline</div>
            </div>
          </div>
        </div>

        {/* Filter Controls in 3-column grid layout like original */}
        <div className="grid grid-cols-3 gap-4 items-center">
          {/* Left Column - Status Filter Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onFilterChange('all')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                currentFilter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              )}
            >
              All
            </button>
            <button
              onClick={() => onFilterChange('online')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                currentFilter === 'online'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              )}
            >
              Online
            </button>
            <button
              onClick={() => onFilterChange('offline')}
              className={cn(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                currentFilter === 'offline'
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              )}
            >
              Offline
            </button>
          </div>

          {/* Center Column - Search and Folder Dropdown */}
          <div className="flex items-center gap-3 justify-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
              />
            </div>
            <FolderDropdown
              devices={devices}
              selectedFolder={selectedFolder}
              onFolderChange={onFolderChange}
            />
          </div>

          {/* Right Column - View Controls and Action Buttons */}
          <div className="flex items-center gap-2 justify-end">
            <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'grid'
                    ? 'bg-white text-blue-500 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title="Grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'list'
                    ? 'bg-white text-blue-500 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onFolderViewToggle}
              className={cn(
                'p-2 rounded-md transition-colors',
                isFolderView
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              )}
              title="Toggle folder view"
            >
              <FolderOpen className="w-4 h-4" />
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm font-medium',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              title="Reload"
            >
              {isLoading ? (
                <RotateCw className="w-4 h-4 animate-spin" />
              ) : (
                'Reload'
              )}
            </button>

            <button
              onClick={onReset}
              className="px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors text-sm font-medium"
              title="Reset view"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}