import React from 'react';
import { AlertCircle, CheckCircle, Info, X, XCircle } from 'lucide-react';

const Alert = React.forwardRef(({
  children,
  variant = 'info',
  title,
  dismissible = false,
  onDismiss,
  className = '',
  ...props
}, ref) => {
  const variants = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: Info,
      iconColor: 'text-blue-500',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: AlertCircle,
      iconColor: 'text-yellow-500',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
  };

  const { container: containerClasses, icon: IconComponent, iconColor } = variants[variant];

  const classes = [
    'relative p-4 border rounded-lg',
    containerClasses,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} role="alert" {...props}>
      <div className="flex">
        <div className="flex-shrink-0">
          <IconComponent className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <div className="text-sm">{children}</div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <span className="sr-only">Dismiss</span>
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

Alert.displayName = 'Alert';

export default Alert;
