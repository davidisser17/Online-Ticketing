import React from 'react';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      wrapperClassName = '',
      id,
      disabled,
      className = '',
      ...rest
    },
    ref,
  ) => {
    // Derive a stable id from the label when none is provided
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${inputId}-error`;

    const baseClasses =
      'block w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2';

    const stateClasses = error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

    const disabledClasses = disabled
      ? 'bg-gray-50 cursor-not-allowed opacity-75'
      : '';

    return (
      <div className={wrapperClassName}>
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={[baseClasses, stateClasses, disabledClasses, className]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />

        {error && (
          <p id={errorId} className="mt-1 text-sm text-red-500">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
