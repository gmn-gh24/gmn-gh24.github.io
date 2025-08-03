import { cn } from '@/app/lib/utils';

interface DeviceCircleProps {
  status: 'online' | 'offline';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
}

export function DeviceCircle({ status, size = 'medium', className, onClick }: DeviceCircleProps) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-[60px] h-[60px]',
    large: 'w-20 h-20'
  };

  return (
    <div
      className={cn(
        'rounded-full border-2 relative transition-all duration-300',
        sizeClasses[size],
        status === 'online' 
          ? 'bg-green-500 border-green-600 shadow-[0_0_10px_rgba(76,175,80,0.5)]' 
          : 'bg-gray-400 border-gray-500',
        onClick && 'cursor-pointer hover:scale-110',
        className
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          status === 'online' && 'animate-pulse bg-green-400 opacity-30'
        )}
      />
    </div>
  );
}