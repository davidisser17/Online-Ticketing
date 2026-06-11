import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  placeholder?: string;
}

const ChevronDownIcon = (): React.ReactElement => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className="h-4 w-4 text-gray-500 pointer-events-none"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
      clipRule="evenodd"
    />
  </svg>
);

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      helperText,
      wrapperClassName = '',
      id,
      disabled,
      placeholder,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');
    const errorId = `${selectId}-error`;

    const baseClasses =
      'block w-full appearance-none rounded-lg border px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2';

    const stateClasses = error
      ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
      : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500';

    const disabledClasses = disabled
      ? 'bg-gray-50 cursor-not-allowed opacity-75'
      : '';

    return (
      <div className={wrapperClassName}>
        <label
          htmlFor={selectId}
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          {label}
        </label>

        {/* Wrapper for select + chevron icon */}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={error ? errorId : undefined}
            className={[baseClasses, stateClasses, disabledClasses, className]
              .filter(Boolean)
              .join(' ')}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Chevron positioned on the right */}
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDownIcon />
          </span>
        </div>

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

Select.displayName = 'Select';

export default Select;
