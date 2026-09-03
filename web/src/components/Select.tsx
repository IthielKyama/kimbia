import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  buttonClassName?: string;
}

export function Select({ options, value, onChange, className = '', buttonClassName = 'px-4 py-3' }: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full bg-background text-white border border-gray-700 rounded-xl flex items-center justify-between focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-sm font-geist ${buttonClassName}`}
      >
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ml-2 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-surface border border-gray-800 rounded-xl shadow-2xl py-1 overflow-hidden font-geist">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center justify-between hover:bg-gray-800 transition-colors"
            >
              <span className={value === option.value ? 'text-primary font-bold' : 'text-gray-300'}>
                {option.label}
              </span>
              {value === option.value && <Check size={16} className="text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
