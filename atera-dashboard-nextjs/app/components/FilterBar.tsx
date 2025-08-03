'use client';

import { useMemo, memo } from 'react';
import { Search, Grid, List, FolderOpen, RefreshCw, Filter, BarChart3, X } from 'lucide-react';
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

function FilterBarComponent({
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
  // Memoize expensive device count calculations for better performance
  const currentCounts = useMemo(() => {
    if (!selectedFolder) {
      return deviceCounts;
    }
    
    const folderDevices = devices.filter(device => {
      try {
        const deviceFolder = device.FolderName || device.CustomerName || 'Uncategorized';
        return deviceFolder === selectedFolder;
      } catch (e) {
        return false;
      }
    });
    
    const onlineCount = folderDevices.filter(device => {
      const isOnline = device.Online === true || device.Online === 'true' || device.Online === 1;
      return isOnline;
    }).length;
    
    return {
      total: folderDevices.length,
      online: onlineCount,
      offline: folderDevices.length - onlineCount
    };
  }, [selectedFolder, devices, deviceCounts]);

  return (
    <div className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm" role="navigation" aria-label="Device filtering and controls">
      <div className="max-w-[1200px] mx-auto p-6">
        {/* Simplified Status Summary Section */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Device Overview{selectedFolder && ` - ${selectedFolder}`}
            </h2>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center bg-gray-50 rounded-lg p-3">
            <div>
              <div className="text-lg font-semibold text-gray-900">{currentCounts.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-emerald-600">{currentCounts.online}</div>
              <div className="text-xs text-gray-600">Online</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-slate-600">{currentCounts.offline}</div>
              <div className="text-xs text-gray-600">Offline</div>
            </div>
          </div>
        </div>

        {/* Enhanced Filter Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Left Column - Status Filter Buttons */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1" role="group" aria-label="Device status filter">
              <button
                onClick={() => onFilterChange('all')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring',
                  currentFilter === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
                aria-pressed={currentFilter === 'all'}
                aria-label={`Show all devices (${currentCounts.total} total)`}
              >
                All
              </button>
              <button
                onClick={() => onFilterChange('online')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring',
                  currentFilter === 'online'
                    ? 'bg-white text-emerald-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
                aria-pressed={currentFilter === 'online'}
                aria-label={`Show online devices (${currentCounts.online} online)`}
              >
                Online
              </button>
              <button
                onClick={() => onFilterChange('offline')}
                className={cn(
                  'px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 focus-ring',
                  currentFilter === 'offline'
                    ? 'bg-white text-slate-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
                aria-pressed={currentFilter === 'offline'}
                aria-label={`Show offline devices (${currentCounts.offline} offline)`}
              >
                Offline
              </button>
            </div>
          </div>

          {/* Center Column - Search and Folder Dropdown */}
          <div className="flex items-center gap-3 justify-center">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search devices..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 w-full"
                aria-label="Search devices by name, IP address, or user"
                aria-describedby="search-help"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors focus-ring"
                  aria-label="Clear search"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
              <div id="search-help" className="sr-only">
                Search by device name, IP address, operating system, or logged user
              </div>
            </div>
            <FolderDropdown
              devices={devices}
              selectedFolder={selectedFolder}
              onFolderChange={onFolderChange}
            />
          </div>

          {/* Right Column - View Controls and Action Buttons */}
          <div className="flex items-center gap-3 justify-end">
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1" role="group" aria-label="View mode selection">
              <button
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  'p-2.5 rounded-md transition-all duration-200 focus-ring',
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
                aria-pressed={viewMode === 'grid'}
                aria-label="Switch to grid view"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onViewModeChange('list')}
                className={cn(
                  'p-2.5 rounded-md transition-all duration-200 focus-ring',
                  viewMode === 'list'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                )}
                aria-pressed={viewMode === 'list'}
                aria-label="Switch to list view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onFolderViewToggle}
              className={cn(
                'p-2.5 rounded-lg transition-all duration-200 focus-ring',
                isFolderView
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              )}
              aria-pressed={isFolderView}
              aria-label={isFolderView ? 'Disable folder view' : 'Enable folder view'}
            >
              <FolderOpen className="w-4 h-4" />
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className={cn(
                'btn-primary px-4 py-2.5 flex items-center gap-2 text-sm font-medium focus-ring',
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
              aria-label={isLoading ? 'Refreshing devices...' : 'Refresh device list'}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </>
              )}
            </button>

            <button
              onClick={onReset}
              className="btn-secondary px-4 py-2.5 text-sm font-medium focus-ring"
              aria-label="Reset all filters and search"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Memoize the component to prevent unnecessary re-renders
export const FilterBar = memo(FilterBarComponent);