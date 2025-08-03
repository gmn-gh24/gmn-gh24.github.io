export interface AteraDevice {
  AgentID?: number;
  AgentId?: number;
  ID?: number | string;
  DeviceGuid?: string;
  MachineName?: string;
  AgentName?: string;
  ComputerName?: string;
  Name?: string;
  Online?: boolean | string | number;
  CustomerID?: number;
  CustomerName?: string;
  FolderName?: string;
  Memory?: number;
  OS?: string;
  LastSeen?: string;
  LastRebootTime?: string;
  CurrentLoggedUsers?: string;
  LastLoginUser?: string;
  IpAddresses?: string[];
  MacAddresses?: string[];
  DomainName?: string;
  ProcessorCoresCount?: number;
  Processor?: string;
  ProcessorClock?: string;
  AgentVersion?: string;
  AppViewUrl?: string;
  Vendor?: string;
  VendorBrandModel?: string;
  VendorSerialNumber?: string;
  BiosManufacturer?: string;
  BiosVersion?: string;
  BiosReleaseDate?: string;
  Motherboard?: string;
  WindowsSerialNumber?: string;
  ReportedFromIP?: string;
}

export interface AteraApiResponse<T> {
  items: T[];
  page: number;
  itemsInPage: number;
  totalItemCount: number;
  totalPages: number;
  nextLink?: string;
  prevLink?: string;
}

export type DeviceFilter = 'all' | 'online' | 'offline';
export type ViewMode = 'grid' | 'list';

export interface AppState {
  devices: AteraDevice[];
  folders: Set<string>;
  currentFilter: DeviceFilter;
  currentFolder: string | null;
  viewMode: ViewMode;
  isFolderView: boolean;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}