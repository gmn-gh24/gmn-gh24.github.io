import { cn } from '@/app/lib/utils';
import { Monitor, MonitorSpeaker, AlertCircle } from 'lucide-react';

interface DeviceCircleProps {
  status: 'online' | 'offline' | 'warning' | 'error';
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  showIcon?: boolean;
  pulseAnimation?: boolean;
}

export function DeviceCircle({ 
  status, 
  size = 'medium', 
  className, 
  onClick, 
  showIcon = false,
  pulseAnimation = true 
}: DeviceCircleProps) {
  const sizeClasses = {
    small: 'w-10 h-10',
    medium: 'w-[60px] h-[60px]',
    large: 'w-20 h-20'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  const getStatusStyles = () => {
    switch (status) {
      case 'online':
        return {
          background: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
          border: 'border-emerald-500',
          shadow: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
          glow: 'bg-emerald-300',
          icon: Monitor
        };
      case 'offline':
        return {
          background: 'bg-gradient-to-br from-slate-400 to-slate-600',
          border: 'border-slate-500',
          shadow: 'shadow-[0_0_10px_rgba(100,116,139,0.3)]',
          glow: 'bg-slate-300',
          icon: MonitorSpeaker
        };
      case 'warning':
        return {
          background: 'bg-gradient-to-br from-amber-400 to-amber-600',
          border: 'border-amber-500',
          shadow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
          glow: 'bg-amber-300',
          icon: AlertCircle
        };
      case 'error':
        return {
          background: 'bg-gradient-to-br from-red-400 to-red-600',
          border: 'border-red-500',
          shadow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]',
          glow: 'bg-red-300',
          icon: AlertCircle
        };
      default:
        return {
          background: 'bg-gradient-to-br from-slate-400 to-slate-600',
          border: 'border-slate-500',
          shadow: 'shadow-[0_0_10px_rgba(100,116,139,0.3)]',
          glow: 'bg-slate-300',
          icon: Monitor
        };
    }
  };

  const statusStyles = getStatusStyles();
  const IconComponent = statusStyles.icon;

  return (
    <div
      className={cn(
        'rounded-full border-2 relative transition-all duration-300 group',
        sizeClasses[size],
        statusStyles.background,
        statusStyles.border,
        statusStyles.shadow,
        onClick && 'cursor-pointer hover:scale-110 hover:rotate-3 active:scale-95',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Animated glow effect */}
      {pulseAnimation && status === 'online' && (
        <div
          className={cn(
            'absolute inset-0 rounded-full opacity-40 animate-pulse-glow',
            statusStyles.glow
          )}
        />
      )}
      
      {/* Rotating ring animation for active states */}
      {status === 'online' && (
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-white/30 animate-spin opacity-60" 
             style={{ animationDuration: '3s' }} />
      )}
      
      {/* Status icon */}
      {showIcon && (
        <div className="absolute inset-0 flex items-center justify-center">
          <IconComponent 
            className={cn(
              iconSizes[size],
              'text-white drop-shadow-sm'
            )} 
          />
        </div>
      )}
      
      {/* Subtle inner shadow for depth */}
      <div className="absolute inset-1 rounded-full bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
      
      {/* Hover effect overlay */}
      {onClick && (
        <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/10 transition-all duration-200 pointer-events-none" />
      )}
    </div>
  );
}