'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { AteraDevice } from '@/app/types/atera';
import { getDeviceFolder } from '@/app/lib/utils';

interface FolderDropdownProps {
  devices: AteraDevice[];
  selectedFolder: string | null;
  onFolderChange: (folder: string | null) => void;
}

export function FolderDropdown({ devices, selectedFolder, onFolderChange }: FolderDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get unique folders from devices with error handling
  const folders = Array.from(
    new Set(
      (devices || [])
        .map(device => {
          try {
            return getDeviceFolder(device);
          } catch (e) {
            console.warn('Error getting folder for device:', device, e);
            return null;
          }
        })
        .filter(folder => folder && folder !== 'Unknown' && folder !== null)
    )
  ).sort();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFolderSelect = (folder: string | null) => {
    onFolderChange(folder);
    setIsOpen(false);
  };

  const displayText = selectedFolder || 'All Folders';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 hover:bg-gray-50 transition-colors min-w-[140px] justify-between"
      >
        <span className="truncate text-gray-900">{displayText}</span>
        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 min-w-[200px] max-h-60 overflow-y-auto">
          <button
            onClick={() => handleFolderSelect(null)}
            className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
              !selectedFolder ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
            }`}
          >
            All Folders
          </button>
          {folders.map(folder => (
            <button
              key={folder}
              onClick={() => handleFolderSelect(folder)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                selectedFolder === folder ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}