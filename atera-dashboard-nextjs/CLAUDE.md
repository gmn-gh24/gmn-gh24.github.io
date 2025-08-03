# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔧 Development Commands

```bash
# Development (uses Turbopack for faster builds)
npm run dev

# Testing
npm run test                # Run all tests
npm run test:watch         # Watch mode for development
npm run test:coverage      # Generate coverage report (70% minimum threshold)

# Type checking and linting
npm run type-check         # TypeScript validation
npm run lint               # Next.js linting

# Production
npm run build              # Build for production
npm run start              # Start production server
```

## 🏗 Architecture Overview

### Data Management Pattern
- **Custom React Query-like System**: `app/hooks/use-devices.ts` implements sophisticated data fetching with automatic polling (30s intervals), retry logic, and memory leak prevention
- **No External State Library**: Uses React's built-in state management with custom hooks
- **API Client**: Singleton `AteraApiClient` class with exponential backoff retry, request timeouts, and error categorization

### Security Architecture
- **API Key Storage**: `app/lib/secure-storage.ts` - singleton pattern with base64 encoding in sessionStorage, automatic migration from localStorage
- **Input Validation**: `app/lib/validation.ts` - regex-based validation for API keys and XSS prevention
- **Security Headers**: Comprehensive CSP and security headers configured in `next.config.ts`

### Design System
- **Theme Management**: `app/hooks/use-theme.ts` - React Context with CSS custom properties for runtime theme switching
- **Design Tokens**: `app/lib/design-tokens.ts` - centralized color, spacing, and typography tokens
- **Utility Function**: `app/lib/utils.ts` contains `cn()` for Tailwind class merging with clsx

### Key Patterns
1. **Error Boundaries**: `app/components/ErrorBoundary.tsx` with development vs production error displays
2. **Loading States**: `app/components/LoadingStates.tsx` with skeleton components for perceived performance
3. **Constants Management**: `app/lib/constants.ts` with typed constants using `as const` assertions
4. **Device Data Normalization**: Handles inconsistent Atera API field names in utility functions

## 🔐 Security Implementation

### API Key Validation Flow
1. Input validation with regex patterns in `validation.ts`
2. Encoding and storage via `SecureStorage` singleton
3. Runtime validation against Atera API endpoints
4. Automatic cleanup on logout/errors

### CSP Configuration
Configured in `next.config.ts` with strict policies:
- `connect-src` limited to `https://app.atera.com`
- `frame-ancestors 'none'` for clickjacking protection
- Comprehensive security headers (X-Frame-Options, X-Content-Type-Options, etc.)

## 🧪 Testing Configuration

### Jest Setup
- **Coverage Threshold**: 70% minimum across all metrics (branches, functions, lines, statements)
- **Path Mapping**: Supports `@/` aliases
- **Test Organization**: `__tests__` directories alongside components
- **Environment**: jsdom for component testing

### Testing Patterns
- Component tests using React Testing Library
- Utility function unit tests
- Custom hook testing patterns
- Error boundary testing

## 📦 Dependencies & Build

### Core Stack
- **Next.js 15**: App Router with React 19
- **TypeScript**: Strict mode with enhanced type checking (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`)
- **Tailwind CSS 4**: Utility-first with CSS custom properties
- **Lucide React**: Icon library

### TypeScript Configuration
- Strict compilation with additional safety options
- Path mapping for `@/*` imports
- Bundle optimization for Next.js

## 🔄 Data Flow Architecture

### Device Management Hook (`use-devices.ts`)
```typescript
// Primary data fetching hook with:
// - 30-second polling with cleanup
// - Error handling and retry logic
// - Loading states management  
// - Memory leak prevention with mountedRef
const { data, loading, error, refetch } = useDevices();
```

### Theme Management (`use-theme.ts`)
```typescript
// Context-based theme with CSS custom properties
const { theme, setTheme } = useTheme();
// Updates CSS custom properties at runtime
```

### API Client Pattern (`atera-api.ts`)
```typescript
// Singleton instance with methods:
// - setApiKey() with validation
// - fetchAllDevices() with pagination
// - deleteDevice() with specific error handling
// - validateApiKey() for runtime checks
```

## 🎨 Design System Usage

### CSS Custom Properties Pattern
```css
/* Defined in globals.css and design-tokens.ts */
:root {
  --primary: #3b82f6;
  --background: #ffffff;
}
.dark {
  --background: #0f172a;
}
```

### Component Patterns
- **Error Boundaries**: Wrap page-level components
- **Loading Skeletons**: Use `DeviceSkeleton` with view modes
- **Utility Classes**: Use `cn()` function for conditional classes

## 🚀 Production Considerations

### Build Optimization
- Tree-shaking friendly imports
- Turbopack support for development
- Static export capabilities
- Bundle size optimization

### Error Handling Strategy
1. Input validation at entry points
2. API error categorization and retry logic
3. Component-level error boundaries
4. User-friendly error messages

---

## Development Notes

- **API Key Management**: Always use `SecureStorage` singleton, never direct localStorage
- **Theme Implementation**: Use CSS custom properties, not Tailwind's dark: modifier
- **Error Handling**: Implement both error boundaries and proper async error handling
- **Testing**: Maintain 70% coverage threshold, test custom hooks and utilities
- **Performance**: Use skeleton loading states and proper cleanup for polling intervals