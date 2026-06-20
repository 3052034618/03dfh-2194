import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/idGenerator';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, size = 'lg', className }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeMap = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full',
          sizeMap[size],
          'max-h-[92vh] flex flex-col rounded-xl border border-ink-600/60 bg-ink-800 shadow-soft overflow-hidden',
          className,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-ink-700/70">
            <div className="text-lg font-serif text-ink-50 font-semibold tracking-wide">{title}</div>
            <button
              onClick={onClose}
              className="btn-ghost p-1.5 rounded hover:bg-ink-50/10 text-ink-200"
              aria-label="关闭"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-auto">{children}</div>
        {footer && (
          <div className="px-6 py-3 border-t border-ink-700/70 bg-ink-900/40 flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
