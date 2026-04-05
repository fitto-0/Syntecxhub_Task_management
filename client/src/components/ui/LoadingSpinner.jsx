import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({
  size = 'md',
  className = '',
  text,
  overlay = false,
  ...props
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  const containerClasses = overlay
    ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
    : 'flex items-center justify-center';

  const spinnerClasses = [
    'animate-spin',
    sizes[size],
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} {...props}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className={spinnerClasses} />
        {text && (
          <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
