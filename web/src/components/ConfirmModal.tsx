import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          iconBg: 'bg-red-500/10 border-red-500/20 text-red-500',
          buttonBg: 'bg-red-600 hover:bg-red-500 text-white focus:ring-red-500',
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500',
          buttonBg: 'bg-yellow-600 hover:bg-yellow-500 text-white focus:ring-yellow-500',
        };
      default:
        return {
          iconBg: 'bg-primary/10 border-primary/20 text-primary',
          buttonBg: 'bg-primary hover:opacity-90 text-white focus:ring-primary',
        };
    }
  };

  const { iconBg, buttonBg } = getVariantStyles();

  return createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto font-geist"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          onClick={() => !isLoading && onClose()}
        />
        <div className="relative z-10 inline-block align-bottom bg-surface rounded-2xl p-6 text-left overflow-hidden shadow-2xl border border-gray-800 transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="flex items-start gap-4">
            <div className={`flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-2xl border ${iconBg}`}>
              <AlertTriangle className="h-6 w-6" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white font-outfit" id="modal-title">
                {title}
              </h3>
              <div className="mt-2 text-sm text-placeholder leading-relaxed">
                {description}
              </div>
            </div>
            <button
              type="button"
              onClick={() => !isLoading && onClose()}
              disabled={isLoading}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-6 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`w-full inline-flex justify-center rounded-xl border border-transparent shadow-sm px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-surface transition-all disabled:opacity-50 sm:w-auto ${buttonBg}`}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Closing...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-xl border border-gray-700 shadow-sm px-4 py-2.5 bg-background text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white focus:outline-none transition-colors disabled:opacity-50 sm:w-auto"
            >
              {cancelText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
