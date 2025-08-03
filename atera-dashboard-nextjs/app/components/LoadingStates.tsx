'use client';

import { cn } from '../lib/utils';

interface SkeletonProps {
  className?: string;
  children?: React.ReactNode;
}

export function Skeleton({ className, children, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-gray-200 dark:bg-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface DeviceSkeletonProps {
  viewMode: 'grid' | 'list';
  count?: number;
}

export function DeviceSkeleton({ viewMode, count = 8 }: DeviceSkeletonProps) {
  return (
    <div className={cn(
      viewMode === 'grid'
        ? 'grid grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-3 max-w-[1200px] mx-auto'
        : 'flex flex-col gap-2 max-w-[792px] mx-auto'
    )}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="modern-card p-6">
          {viewMode === 'grid' ? (
            <div className="flex flex-col items-center space-y-3">
              <Skeleton className="w-12 h-12 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ) : (
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export function LoadingSpinner({ size = 'medium', className }: { size?: 'small' | 'medium' | 'large'; className?: string }) {
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-8 h-8',
    large: 'w-16 h-16',
  };

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      <div className="absolute inset-0 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      <div className="absolute inset-0 border-4 border-transparent border-r-purple-500 rounded-full animate-spin reverse-spin"></div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center py-16" role="status" aria-live="polite">
      <LoadingSpinner size="large" />
      <div className="mt-6 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Loading devices...</h2>
        <p className="text-gray-600">Fetching the latest device information</p>
      </div>
    </div>
  );
}
