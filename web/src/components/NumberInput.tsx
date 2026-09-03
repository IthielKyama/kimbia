import type { InputHTMLAttributes, ChangeEvent, ReactNode } from 'react';
import { Plus, Minus } from 'lucide-react';

interface NumberInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  prefixNode?: ReactNode;
}

export function NumberInput({ value, onChange, prefixNode, className = '', ...props }: NumberInputProps) {
  const handleIncrement = () => {
    const num = parseFloat(value as string) || 0;
    const step = parseFloat(props.step as string) || 1;
    triggerChange(num + step);
  };

  const handleDecrement = () => {
    const num = parseFloat(value as string) || 0;
    const step = parseFloat(props.step as string) || 1;
    triggerChange(num - step);
  };

  const triggerChange = (newValue: number) => {
    const event = {
      target: {
        name: props.name,
        value: newValue.toString(),
      }
    } as React.ChangeEvent<HTMLInputElement>;
    onChange(event);
  };

  return (
    <div className={`flex rounded-xl shadow-sm border border-gray-700 bg-background overflow-hidden focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all ${className}`}>
      {prefixNode && (
        <div className="flex items-center px-4 bg-gray-800 text-gray-400 sm:text-sm font-bold border-r border-gray-700">
          {prefixNode}
        </div>
      )}
      <input
        type="number"
        value={value}
        onChange={onChange}
        className="flex-1 min-w-0 block w-full px-4 py-3 focus:outline-none sm:text-sm bg-background text-white placeholder-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        {...props}
      />
      <div className="flex border-l border-gray-700">
        <button
          type="button"
          onClick={handleDecrement}
          className="px-3 flex items-center justify-center hover:bg-gray-800 text-gray-400 hover:text-white transition-colors border-r border-gray-700 focus:outline-none"
        >
          <Minus size={16} />
        </button>
        <button
          type="button"
          onClick={handleIncrement}
          className="px-3 flex items-center justify-center hover:bg-gray-800 text-gray-400 hover:text-white transition-colors focus:outline-none"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
