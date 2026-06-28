import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col space-y-1.5 w-full">
        {label && <label className="text-sm font-medium text-content-strong">{label}</label>}
        <input
          ref={ref}
          className={`
            flex h-11 w-full rounded-lg border border-surface-border bg-surface px-3 py-2 text-sm 
            text-content-strong placeholder:text-content-muted 
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:cursor-not-allowed disabled:opacity-50
            transition-all duration-200
            ${error ? 'border-status-danger focus:ring-status-danger' : ''}
            ${className}
          `}
          {...props}
        />
        {error && <span className="text-xs text-status-danger mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
