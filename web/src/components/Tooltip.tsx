import { useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

export interface TooltipProps {
  content?: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  className = '',
  delay = 120,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    actualPosition: 'top' | 'bottom' | 'left' | 'right';
  }>({
    top: 0,
    left: 0,
    actualPosition: position,
  });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updatePosition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    let actualPos = position;
    let top = 0;
    let left = 0;

    if (position === 'top' && rect.top < 45) {
      actualPos = 'bottom';
    } else if (position === 'bottom' && window.innerHeight - rect.bottom < 45) {
      actualPos = 'top';
    }

    switch (actualPos) {
      case 'top':
        top = rect.top - 8;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + 8;
        left = rect.left + rect.width / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - 8;
        break;
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + 8;
        break;
    }

    setCoords({ top, left, actualPosition: actualPos });
  }, [position]);

  const showTooltip = () => {
    if (!content) return;
    timeoutRef.current = setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      const handleScrollOrResize = () => {
        setIsVisible(false);
      };
      window.addEventListener('scroll', handleScrollOrResize, { capture: true, passive: true });
      window.addEventListener('resize', handleScrollOrResize, { passive: true });
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, { capture: true });
        window.removeEventListener('resize', handleScrollOrResize);
      };
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!content) {
    return <>{children}</>;
  }

  const getTransform = (pos: 'top' | 'bottom' | 'left' | 'right') => {
    switch (pos) {
      case 'top':
        return 'translate(-50%, -100%)';
      case 'bottom':
        return 'translate(-50%, 0)';
      case 'left':
        return 'translate(-100%, -50%)';
      case 'right':
        return 'translate(0, -50%)';
    }
  };

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={`inline-flex items-center ${className}`}
      >
        {children}
      </span>
      {isVisible &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              transform: getTransform(coords.actualPosition),
              zIndex: 9999,
            }}
            className="pointer-events-none transition-all duration-150 ease-out"
          >
            <div className="relative bg-[#161F30] text-gray-200 text-xs font-medium font-geist px-3 py-1.5 rounded-xl border border-gray-700/80 shadow-2xl shadow-black/80 whitespace-nowrap max-w-xs text-center">
              {content}
              {coords.actualPosition === 'top' && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#161F30] border-r border-b border-gray-700/80 rotate-45" />
              )}
              {coords.actualPosition === 'bottom' && (
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#161F30] border-l border-t border-gray-700/80 rotate-45" />
              )}
              {coords.actualPosition === 'left' && (
                <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#161F30] border-t border-r border-gray-700/80 rotate-45" />
              )}
              {coords.actualPosition === 'right' && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#161F30] border-b border-l border-gray-700/80 rotate-45" />
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
