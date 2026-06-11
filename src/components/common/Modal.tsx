import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  /** Whether clicking the backdrop closes the modal. Defaults to true. */
  closeOnBackdrop?: boolean;
}

// ---------------------------------------------------------------------------
// Size map
// ---------------------------------------------------------------------------

const SIZE_CLASSES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

// ---------------------------------------------------------------------------
// Focusable element selector used by the focus trap
// ---------------------------------------------------------------------------

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

export function ModalHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 pr-6">
      {children}
    </div>
  );
}

export function ModalBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4">
      {children}
    </div>
  );
}

export function ModalFooter({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 flex justify-end gap-2">
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Modal component
// ---------------------------------------------------------------------------

export function Modal({
  isOpen,
  onClose,
  title,
  size = 'md',
  children,
  closeOnBackdrop = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`).current;

  // --- Scroll lock ---------------------------------------------------------
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOpen]);

  // --- ESC key close -------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap on Tab / Shift+Tab
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
        ).filter((el) => !el.closest('[aria-hidden="true"]'));

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: if focus is on first element, cycle to last
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          // Tab: if focus is on last element, cycle to first
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // --- Focus first focusable element on open --------------------------------
  useEffect(() => {
    if (!isOpen || !dialogRef.current) return;

    // Defer so the portal is fully rendered before we attempt focus
    const id = requestAnimationFrame(() => {
      if (!dialogRef.current) return;
      const first = dialogRef.current.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      if (first) {
        first.focus();
      } else {
        // Fallback: focus the dialog itself
        dialogRef.current.focus();
      }
    });

    return () => cancelAnimationFrame(id);
  }, [isOpen]);

  // --- Backdrop click -------------------------------------------------------
  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdrop) onClose();
  }, [closeOnBackdrop, onClose]);

  // --- Stop propagation from panel to backdrop ------------------------------
  const handlePanelClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Don't render anything when closed
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        aria-hidden="true"
        onClick={handleBackdropClick}
      />

      {/* Panel wrapper — centred column */}
      <div
        className="fixed inset-0 z-50 overflow-y-auto"
        onClick={handleBackdropClick}
      >
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          className={`relative bg-white rounded-xl shadow-xl p-6 mx-auto mt-20 w-full ${SIZE_CLASSES[size]}`}
          onClick={handlePanelClick}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 rounded"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Title */}
          {title && (
            <h2
              id={titleId}
              className="text-lg font-semibold text-gray-900 mb-4 pr-6"
            >
              {title}
            </h2>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    </>,
    document.body,
  );
}

export default Modal;
