import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceItem } from '../DeviceItem';
import { AteraDevice } from '../../types/atera';

// Mock the utils module
jest.mock('../../lib/utils', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  getDeviceName: jest.fn((device) => device.ComputerName || 'Test Device'),
  getDeviceStatus: jest.fn(() => ({ isOnline: true, lastSeen: 'Online' })),
  getDeviceInfo: jest.fn(() => ({ 
    ipAddress: '192.168.1.1', 
    os: 'Windows 10',
    memory: '8 GB',
    lastReboot: '2024-01-01',
    loggedUser: 'testuser'
  })),
  isLongOffline: jest.fn(() => false),
  getDaysOffline: jest.fn(() => null),
}));

const mockDevice: AteraDevice = {
  DeviceGuid: '123',
  ComputerName: 'Test Device',
  Online: true,
  CustomerName: 'Test Customer',
  Memory: 8192,
  OS: 'Windows 10 Pro',
  LastSeen: '2024-01-01T00:00:00Z',
  IpAddresses: ['192.168.1.1'],
  AgentID: 123,
};

describe('DeviceItem', () => {
  const mockOnShowDetails = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders device name correctly in grid view', () => {
    render(
      <DeviceItem 
        device={mockDevice} 
        viewMode="grid" 
        onShowDetails={mockOnShowDetails} 
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Test Device')).toBeInTheDocument();
  });

  it('renders device name correctly in list view', () => {
    render(
      <DeviceItem 
        device={mockDevice} 
        viewMode="list" 
        onShowDetails={mockOnShowDetails} 
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Test Device')).toBeInTheDocument();
  });

  it('shows online status when device is online', () => {
    render(
      <DeviceItem 
        device={mockDevice} 
        viewMode="grid" 
        onShowDetails={mockOnShowDetails} 
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('calls onShowDetails when View Details button is clicked', () => {
    render(
      <DeviceItem 
        device={mockDevice} 
        viewMode="list" 
        onShowDetails={mockOnShowDetails} 
        onDelete={mockOnDelete}
      />
    );
    
    const viewDetailsButton = screen.getByText('View Details');
    fireEvent.click(viewDetailsButton);
    
    expect(mockOnShowDetails).toHaveBeenCalledWith(mockDevice);
  });

  it('displays device information correctly', () => {
    render(
      <DeviceItem 
        device={mockDevice} 
        viewMode="list" 
        onShowDetails={mockOnShowDetails} 
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/192.168.1.1/)).toBeInTheDocument();
    expect(screen.getByText(/Windows 10/)).toBeInTheDocument();
  });
});
