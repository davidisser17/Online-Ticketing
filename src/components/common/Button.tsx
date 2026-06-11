import React from 'react';

// ============================================================
// Button — Variants & Sizes Helper
// ============================================================

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
  secondary:
    'bg-white text-primary-600 border border-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  danger:
    'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
  ghost:
    'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'text-sm px-3 py-1.5',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};

const baseClasses =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

/**
 * Returns the combined Tailwind class string for a button variant + size.
 * Useful for styling non-`<button>` elements (e.g. `<Link>`) as buttons.
 */
export function buttonVariants({
  variant = 'primary',
  size = 'md',
}: {
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
} = {}): string {
  return [baseClasses, variantClasses[variant], sizeClasses[size]].join(' ');
}

// ============================================================
// ButtonProps
// ============================================================

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style of the button. Defaults to `'primary'`. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Size preset. Defaults to `'md'`. */
  size?: 'sm' | 'md' | 'lg';
  /** When true, shows a spinner and disables interaction. */
  isLoading?: boolean;
  children: React.ReactNode;
}

// ============================================================
// Spinner SVG
// ============================================================

const Spinner: React.FC = () => (
  <svg
    className="animate-spin h-4 w-4 shrink-0"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

// ============================================================
// Button Component
// ============================================================

/**
 * Accessible, fully-typed button component with variant, size,
 * loading, and disabled states.
 *
 * @example
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   Beli Tiket
 * </Button>
 *
 * <Button variant="danger" isLoading>
 *   Hapus
 * </Button>
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      className = '',
      children,
      type = 'button',
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    const classes = [
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      isDisabled ? 'opacity-50 cursor-not-allowed' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={isLoading ? 'true' : undefined}
        className={classes}
        {...rest}
      >
        {isLoading && <Spinner />}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;
