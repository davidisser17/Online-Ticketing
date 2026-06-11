import React from 'react';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      wrapperClassName = '',
      id,
      disabled,
      rows = 4,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const textareaId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${textareaId}-error`;

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
          htmlFor={textareaId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          rows={rows}
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

Textarea.displayName = 'Textarea';

export default Textarea;
