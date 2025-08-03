import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AteraDevice } from '@/app/types/atera';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDeviceName(device: AteraDevice): string {
  const name = device.MachineName || device.AgentName || device.ComputerName || device.Name;
  return name || 'Unknown Device';
}

export function getDeviceFolder(device: AteraDevice): string | null {
  const folder = device.FolderName || 
    device.CustomerName || 
    (device.CustomerID ? `Customer ${device.CustomerID}` : null);
  return folder && folder.trim() ? folder.trim() : null;
}

export function getDeviceId(device: AteraDevice): string | number {
  const id = device.AgentID || device.AgentId || device.ID || device.DeviceGuid;
  return id || 'unknown';
}


export function formatTimeDifference(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

export function isLongOffline(device: AteraDevice): boolean {
  if (device.LastSeen) {
    try {
      const lastSeenDate = new Date(device.LastSeen);
      const diffMs = Date.now() - lastSeenDate.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return diffDays > 30;
    } catch (e) {
      return false;
    }
  }
  return false;
}

export function getDaysOffline(device: AteraDevice): number | null {
  if (device.LastSeen) {
    try {
      const lastSeenDate = new Date(device.LastSeen);
      const diffMs = Date.now() - lastSeenDate.getTime();
      return Math.floor(diffMs / (1000 * 60 * 60 * 24));
    } catch (e) {
      return null;
    }
  }
  return null;
}

export function isDeviceOnline(device: AteraDevice): boolean {
  if (device.Online === true || device.Online === 1) {
    return true;
  }
  
  if (typeof device.Online === 'string') {
    return device.Online.toLowerCase() === 'true' || device.Online === '1';
  }
  
  return false;
}

export function getDeviceStatus(device: AteraDevice): { isOnline: boolean; lastSeen: string } {
  const isOnline = isDeviceOnline(device);
  let lastSeen = 'Unknown';
  
  if (!isOnline && device.LastSeen) {
    try {
      const lastSeenDate = new Date(device.LastSeen);
      lastSeen = formatTimeDifference(lastSeenDate);
    } catch (e) {
      lastSeen = 'Unknown';
    }
  }
  
  return { isOnline, lastSeen };
}

export function formatDate(dateValue: string | Date | undefined, includeTime = false): string {
  if (!dateValue) return 'Unknown';
  
  try {
    const date = new Date(dateValue);
    if (isNaN(date.getTime())) return 'Unknown';
    
    if (includeTime) {
      return date.toLocaleString();
    }
    return date.toLocaleDateString();
  } catch (e) {
    return 'Unknown';
  }
}

export function getDeviceInfo(device: AteraDevice, extended = false) {
  const lastReboot = device.LastRebootTime || 'Unknown';
  const loggedUser = device.CurrentLoggedUsers || device.LastLoginUser || 'No user logged in';
  const ipAddress = device.IpAddresses?.[0] || 'Unknown';
  const memory = device.Memory ? `${Math.round(device.Memory / 1024)} GB` : 'Unknown';
  
  // Enhanced OS information following original HTML logic
  let osVersion = 'Unknown';
  if (device.OS) {
    osVersion = device.OS;
    // Add OS version details if available
    if ((device as any).OSVersion) {
      osVersion += ` ${(device as any).OSVersion}`;
    }
  } else if ((device as any).OSNum) {
    osVersion = `Windows ${(device as any).OSNum}`;
  }
  
  // Add build info if extended and available
  if (extended && (device as any).OSBuild) {
    osVersion += ` (Build ${(device as any).OSBuild})`;
  }
  
  const cleanLoggedUser = loggedUser?.includes('(Since:') 
    ? loggedUser.split('(Since:')[0].trim()
    : loggedUser;
  
  const result = {
    deviceName: getDeviceName(device),
    os: osVersion,
    ipAddress,
    memory,
    loggedUser: cleanLoggedUser,
    lastReboot: formatDate(lastReboot),
    lastSeen: formatDate(device.LastSeen),
    agentVersion: device.AgentVersion || 'Unknown',
    extended: {} as any
  };
  
  if (extended) {
    // CPU Information - combine processor name and clock speed like in original HTML
    let cpuInfo = device.Processor || `${device.Vendor || 'Unknown'} ${device.VendorBrandModel || 'Computer'}`;
    if (device.ProcessorClock && device.ProcessorClock !== 'Unknown') {
      cpuInfo += ` @ ${device.ProcessorClock}`;
    }
    
    const biosInfo = device.BiosManufacturer && device.BiosVersion ? 
      `${device.BiosManufacturer} ${device.BiosVersion}` : 'Unknown';
    const biosDate = formatDate(device.BiosReleaseDate);
    
    const vendorModel = device.VendorBrandModel || 'Unknown';
    const vendorSerial = device.VendorSerialNumber || 'Unknown';
    const motherboard = device.Motherboard || 'Unknown';
    
    result.extended = {
      cpu: cpuInfo,
      biosInfo,
      biosDate,
      vendorModel,
      vendorSerial,
      motherboard,
      processorCores: device.ProcessorCoresCount || 'Unknown',
      domainName: device.DomainName || 'Not domain joined',
      macAddresses: device.MacAddresses?.join(', ') || 'Unknown',
      windowsSerial: device.WindowsSerialNumber || 'Unknown',
      reportedFromIP: device.ReportedFromIP || 'Unknown'
    };
  }
  
  return result;
}