# Atera API Documentation

Complete documentation based on practical implementation and testing for device monitoring dashboard.

## Table of Contents

- [API Basics](#api-basics)
- [Authentication](#authentication)
- [Available Endpoints](#available-endpoints)
- [API Rate Limits](#api-rate-limits)
- [Data Fields Reference](#data-fields-reference)
- [Device Identification](#device-identification)
- [API Limitations](#api-limitations)
- [Code Examples](#code-examples)
- [Best Practices](#best-practices)

## API Basics

**Base URL**: `https://app.atera.com/api/v3/`
**Documentation**: Available at `https://app.atera.com/apidocs`
**API Standard**: RESTful API using Swagger V3

### Supported Operations

- **GET**: Retrieve information from components
- **POST**: Input data into Atera (create tickets, monitoring devices)
- **PUT**: Update existing entries
- **DELETE**: Remove specific entries

## Authentication

```javascript
headers: {
    'X-API-KEY': 'your_api_key_here',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache'
}
```

**Security Notes:**

- API key must be kept secret and secure
- Key exposes access to all contacts and devices
- Can be reset from Atera admin panel if compromised
- No support provided by Atera for API development/troubleshooting

## Available Endpoints

### Agents (Managed Devices)

```http
GET /api/v3/agents?page={page}&itemsInPage={count}      # List all agents
GET /api/v3/agents/customer/{customerId}                # Get agents by customer
GET /api/v3/agents/{AgentID}                           # Get specific agent
GET /api/v3/agents/machine/{MachineName}               # Get agent by machine name
DELETE /api/v3/agents/{AgentID}                        # Delete agent
```

**Agent Deletion Notes:**

- Requires integer `AgentID` (not `DeviceGuid`)
- Deletion is permanent and cannot be undone
- Only removes from Atera portal; agent software remains on machine
- Agent reappears if software is still installed and checks in
- Fully decommission by uninstalling agent locally
- HTTP 204 response on success

**Common Error Responses:**

- `401 Unauthorized`: Invalid API key
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Agent ID not found
- `405 Method Not Allowed`: Device has dependencies

### Network Devices (SNMP, HTTP, TCP Monitoring)

```http
# SNMP Devices
GET /api/v3/devices/snmpdevices                        # List SNMP devices
POST /api/v3/devices/snmpdevice/v3                     # Create SNMP v3 device
DELETE /api/v3/devices/snmpdevice/{id}                 # Remove SNMP device

# HTTP Monitoring
GET /api/v3/devices/httpdevices                        # List HTTP monitors
POST /api/v3/devices/httpdevice                        # Create HTTP monitor
DELETE /api/v3/devices/httpdevice/{id}                 # Remove HTTP monitor

# TCP Monitoring
GET /api/v3/devices/tcpdevices                         # List TCP monitors
POST /api/v3/devices/tcpdevice                         # Create TCP monitor
DELETE /api/v3/devices/tcpdevice/{id}                  # Remove TCP monitor

# Generic Devices
GET /api/v3/devices/genericdevices                     # List generic monitors
POST /api/v3/devices/genericdevice                     # Create generic monitor
DELETE /api/v3/devices/genericdevice/{id}              # Remove generic monitor
```

### Alerts

```http
GET /api/v3/alerts                                     # List all alerts
POST /api/v3/alerts                                    # Create new alert
DELETE /api/v3/alerts/{alertId}                        # Resolve/archive alert
```

**Required Alert Fields:**

- `Title`: Short alert title
- `Severity`: Information, Warning, Critical

**Optional Alert Fields:**

- `AlertMessage`: Detailed description
- `CustomerID`: Associated customer ID
- `AgentID`: Associated device ID
- `Source`: Source system identifier
- `Code`: Custom alert code

### Tickets (Helpdesk/PSA)

```http
GET /api/v3/tickets                                    # List tickets (supports filtering)
GET /api/v3/tickets/{ticketId}                         # Get specific ticket
POST /api/v3/tickets                                   # Create new ticket
PUT /api/v3/tickets/{ticketId}                         # Update ticket
DELETE /api/v3/tickets/{ticketId}                      # Delete ticket

# Ticket Sub-Resources
GET /api/v3/tickets/{ticketId}/comments                # Get ticket comments
GET /api/v3/tickets/{ticketId}/workhoursrecords        # Get time entries
GET /api/v3/tickets/statusmodified                     # Recently modified tickets
```

**Query Parameters:**

- `CustomerId`: Filter by customer
- `ticketStatus`: Filter by status (Open, Pending, Resolved, Closed)

**Required Ticket Fields:**

- `CustomerID`: Customer organization ID
- `TicketTitle`: Ticket subject

**Common Ticket Fields:**

- `ContactID`: End-user contact ID
- `TicketDescription`: Detailed description
- `TicketPriority`: Low, Medium, High, Critical
- `TicketType`: Incident, Request, Problem
- `TicketStatus`: Open, Pending, Resolved, Closed
- `TechnicianContactID`: Assign to technician
- `ResolutionDescription`: Resolution notes

### Customers & Contacts

```http
# Customer Management
GET /api/v3/customers                                  # List all customers
GET /api/v3/customers/{id}                             # Get specific customer
POST /api/v3/customers                                 # Create customer
PUT /api/v3/customers/{id}                             # Update customer
POST /api/v3/customers/folders                         # Create customer folder
POST /api/v3/customers/attachments                     # Attach files to customer

# Contact Management
GET /api/v3/contacts                                   # List contacts
GET /api/v3/contacts/{id}                              # Get specific contact
POST /api/v3/contacts                                  # Create contact
PUT /api/v3/contacts/{id}                              # Update contact
DELETE /api/v3/contacts/{id}                           # Delete contact
```

### Billing & Financial

```http
# Contracts
GET /api/v3/contracts                                  # List contracts
GET /api/v3/contracts/{id}                             # Get specific contract
GET /api/v3/contracts/customer/{customerId}           # Customer contracts

# Billing & Invoices
GET /api/v3/billing/invoices                           # List invoices
GET /api/v3/billing/invoice/{invoiceNumber}            # Get specific invoice

# Products & Rates
GET /api/v3/rates/products                             # List billable products
POST /api/v3/rates/products                            # Create product
PUT /api/v3/rates/products/{id}                        # Update product
DELETE /api/v3/rates/products/{id}                     # Delete product

GET /api/v3/rates/expenses                             # List expense types
POST /api/v3/rates/expenses                            # Create expense type
PUT /api/v3/rates/expenses/{id}                        # Update expense type
DELETE /api/v3/rates/expenses/{id}                     # Delete expense type
```

### Custom Fields

```http
GET /api/v3/customvalues/customerfield/{customerId}/{fieldName}
GET /api/v3/customvalues/agentfield/{agentId}/{fieldName}
GET /api/v3/customvalues/contactfield/{contactId}/{fieldName}
GET /api/v3/customvalues/ticketfield/{ticketId}/{fieldName}
PUT /api/v3/customvalues/ticketfield/{ticketId}/{fieldName}/{value}
```

**Custom Field Types:**

- `ValueAsString`: String values
- `ValueAsDecimal`: Decimal values  
- `ValueAsBoolean`: Boolean values

### Knowledge Base

```http
GET /api/v3/knowledgebases                             # List KB articles
```

### Response Format

```javascript
{
    "items": [...],           // Array of objects
    "page": 1,               // Current page number
    "itemsInPage": 50,       // Items per page
    "totalItemCount": 125,   // Total items
    "totalPages": 3,         // Total pages available
    "nextLink": "...",       // Next page URL
    "prevLink": "..."        // Previous page URL
}
```

## API Rate Limits

### Request Limits by Subscription Tier

**Critical**: All endpoints share the same rate limit pool.

| Subscription Tier | Requests per Minute | Recommended Usage |
|-------------------|-------------------|------------------|
| **Entry-level** | 400 RPM | Poll device inventory once per minute |
| **Expert** | 2,000 RPM | Poll every 10-30 seconds if needed |
| **Master** | 4,000 RPM | Multiple frequent calls, use batching wisely |

### Rate Limit Enforcement

- **Time Window**: 1-hour rolling window
- **Exceeded Response**: HTTP 429 "Too Many Requests"
- **Consequences**: Temporary throttling or access suspension for remainder of hour
- **Aggregate Limits**: All endpoints count toward same limit

### Best Practices

1. **Implement Throttling**: Space requests evenly across time periods
2. **Use Pagination**: Retrieve 50 items per request (maximum recommended)
3. **Cache Responses**: Store results locally to reduce API calls
4. **Monitor Usage**: Track API consumption to stay within limits
5. **Handle 429 Errors**: Implement exponential backoff for rate limit responses

## Data Fields Reference

### Key Device Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `AgentID` | Number | Unique agent identifier (required for DELETE) | `29` |
| `DeviceGuid` | String | Unique device GUID | `"038093b6-d6a6-4507-84af-4630c3bf13d6"` |
| `MachineName` | String | Computer name | `"PURPLE-TAV1"` |
| `Online` | Boolean | Current online status | `true` |
| `CustomerID` | Number | Customer identifier | `1` |
| `CustomerName` | String | Customer/company name | `"Yupix"` |
| `Memory` | Number | Total RAM in MB | `7896` |
| `OS` | String | Operating system name | `"Windows 11 Pro"` |
| `LastSeen` | String | Last agent contact | `"2025-08-02T04:32:07Z"` |
| `LastRebootTime` | String | Last system reboot | `"2024-07-17T21:26:09Z"` |
| `AppViewUrl` | String | Direct device management link | `"https://app.atera.com/Admin#/rmm/device/{guid}/agent"` |

### Additional Available Fields

**Hardware**: `Vendor`, `VendorBrandModel`, `VendorSerialNumber`, `BiosManufacturer`, `BiosVersion`
**Network**: `IpAddresses`, `MacAddresses`, `DomainName`, `ReportedFromIP`
**User**: `CurrentLoggedUsers`, `LastLoginUser`
**System**: `ProcessorCoresCount`, `WindowsSerialNumber`, `AgentVersion`

## Device Identification

Use this priority order for reliable device identification:

1. **`AgentID`** (integer) - Primary identifier, required for DELETE operations
2. **`AgentId`** (integer) - Alternative casing of AgentID  
3. **`ID`** (varies) - Generic ID field
4. **`DeviceGuid`** (string) - GUID identifier (not suitable for DELETE)

```javascript
function getDeviceId(device) {
    return device.AgentID || device.AgentId || device.ID || device.DeviceGuid;
}

// For deletion, specifically get the integer ID
function getAgentIdForDeletion(device) {
    return device.AgentID || device.AgentId;
}
```

## API Limitations

### Missing Real-Time Data

- **CPU Usage**: No current CPU load percentage
- **Memory Usage**: No free/used memory breakdown
- **Disk Usage**: No storage capacity or free space information
- **Network Activity**: No current bandwidth usage
- **Temperature**: No hardware temperature readings

### Missing Device Control Actions

- **Reboot/Restart**: Cannot trigger via API - managed in Atera UI only
- **Shutdown**: Cannot shutdown via API - use UI or Automation Profiles
- **Remote Control**: No remote desktop initiation via API
- **Script Execution**: Cannot run scripts via API - use Automation Profiles in UI

### Device Control Workarounds

1. **Automation Profiles (UI Configuration)**
   - Upload PowerShell scripts to Atera's script library via UI
   - Create profiles with "Reboot if needed" option
   - Schedule custom scripts to run on target devices

2. **API-Triggered Workflows**
   - Use API to detect issues (offline devices, outdated patches)
   - Create tickets/alerts via API to notify technicians
   - Trigger manual or scheduled remediation

3. **External Tools**
   - Use PowerShell Remoting or other tools outside Atera
   - Combine API device discovery with external execution

### Data Availability Issues

- **Inconsistent Fields**: Not all fields available on all devices
- **Hardware Detection**: Some hardware info may be missing
- **Agent Dependency**: Data quality depends on agent version

## Code Examples

### Basic Device Retrieval with Pagination

```javascript
async function fetchAllDevices() {
    const allDevices = [];
    let page = 1;
    let totalPages = 1;
    
    do {
        const response = await fetch(`https://app.atera.com/api/v3/agents?page=${page}&itemsInPage=50`, {
            method: 'GET',
            headers: {
                'X-API-KEY': apiKey,
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.items) {
            allDevices.push(...data.items);
        }
        
        totalPages = data.totalPages || 1;
        page++;
        
    } while (page <= totalPages);
    
    return allDevices;
}
```

### Device Deletion with Error Handling

```javascript
async function deleteDevice(agentId, deviceName) {
    try {
        const response = await fetch(`https://app.atera.com/api/v3/agents/${agentId}`, {
            method: 'DELETE',
            headers: {
                'X-API-KEY': apiKey,
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Device not found or already deleted');
            } else if (response.status === 403) {
                throw new Error('Access denied - insufficient permissions');
            } else if (response.status === 405) {
                throw new Error('Delete operation not allowed - device may have dependencies');
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        }
        
        console.log(`Successfully deleted device: ${deviceName}`);
        return true;
    } catch (error) {
        console.error('Error deleting device:', error);
        throw error;
    }
}
```

### Rate-Limited API Helper

```javascript
class AteraApiClient {
    constructor(apiKey, maxRpm = 400) {
        this.apiKey = apiKey;
        this.requestDelay = Math.ceil(60000 / maxRpm);
        this.lastRequest = 0;
    }
    
    async makeRequest(endpoint, method = 'GET', options = {}) {
        // Throttle requests
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        if (timeSinceLastRequest < this.requestDelay) {
            await new Promise(resolve => setTimeout(resolve, this.requestDelay - timeSinceLastRequest));
        }
        
        const url = `https://app.atera.com/api/v3/${endpoint}`;
        const headers = {
            'X-API-KEY': this.apiKey,
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            ...options.headers
        };
        
        this.lastRequest = Date.now();
        
        return fetch(url, {
            method,
            headers,
            ...options
        });
    }
}
```

### Using API Within PowerShell Scripts

```powershell
# PowerShell script running on an Atera-managed device
$AteraAPIKey = 'YOUR_API_KEY'    # Store securely in production
$fieldName   = 'License Key'     # Custom field name

$headers = @{ 
    "X-API-KEY" = $AteraAPIKey
    "Accept" = "application/json" 
}

try {
    # Get this device's CustomerID
    $hostname = $env:COMPUTERNAME
    $agentUri = "https://app.atera.com/api/v3/agents/machine/$hostname"
    $thisAgent = Invoke-RestMethod -Uri $agentUri -Headers $headers -Method GET
    $customerId = $thisAgent.items[0].CustomerID
    
    # Retrieve custom field value
    $fieldUri = "https://app.atera.com/api/v3/customvalues/customerfield/$customerId/$([Uri]::EscapeDataString($fieldName))"
    $customFieldValue = Invoke-RestMethod -Uri $fieldUri -Headers $headers -Method GET
    $licenseKey = $customFieldValue.ValueAsString
    
    Write-Host "Retrieved license key: $licenseKey"
    
    # Use license key in your logic...
    
    # Report success
    $successAlert = @{
        Title = "Script Success: License Applied"
        Severity = "Information"
        AlertMessage = "Successfully applied license key on $hostname"
        CustomerID = $customerId
        Source = "PowerShellScript"
    }
    Invoke-RestMethod -Uri "https://app.atera.com/api/v3/alerts" -Headers $headers -Method POST -Body ($successAlert | ConvertTo-Json)
    
} catch {
    Write-Error "Script failed: $($_.Exception.Message)"
    exit 1
}
```

## Implementation Best Practices

### Performance

1. **Use Pagination**: Always implement proper pagination for large datasets
2. **Cache Results**: Cache device data to reduce API calls
3. **Respect Rate Limits**: Implement throttling based on subscription tier
4. **Batch Operations**: Group related operations when possible

### Error Handling

1. **Validate API Key**: Check for authentication errors (401)
2. **Handle Network Issues**: Implement retry logic for network failures
3. **Graceful Degradation**: Handle missing data fields gracefully
4. **User Feedback**: Provide meaningful error messages

### Security

1. **API Key Protection**: Never expose keys in client-side code
2. **HTTPS Only**: Always use HTTPS for API requests
3. **Input Validation**: Validate all user inputs
4. **HTML Escaping**: Escape user data when generating HTML

### Dashboard Implementation

1. **Polling Intervals**: 20-30 second intervals for real-time monitoring
2. **Countdown Timers**: Show users when next refresh occurs
3. **Manual Refresh**: Allow manual device list refresh
4. **State Management**: Reset timers after manual operations
5. **Local Storage**: Persist API keys securely for convenience

### DELETE Operations

1. **Confirmation Dialogs**: Always require user confirmation
2. **Agent ID Validation**: Verify integer AgentID exists before deletion
3. **Comprehensive Error Handling**: Handle all HTTP status codes
4. **Polling Reset**: Restart polling intervals after successful deletions
5. **Dependency Checks**: Handle devices with monitoring dependencies

## Common Pitfalls

1. **Agent ID vs GUID Confusion**: Use integer `AgentID` for DELETE, not `DeviceGuid`
2. **Polling Timer Drift**: Call `startPolling()` after manual operations
3. **HTML Injection**: Use `escapeHtml()` for user-generated content
4. **Rate Limit Violations**: Implement proper throttling and 429 error handling

---

**Alternative**: Consider the community-developed **PSAtera PowerShell module** for cmdlet-based interaction.

**Last Updated**: August 2025 | **API Version**: v3  
**Implementation Status**: Production-ready with comprehensive dashboard integration
