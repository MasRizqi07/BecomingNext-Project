interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="group"
      className={`inline-flex rounded-xl border border-white/10 bg-white/5 p-1 backdrop-blur-md ${className}`.trim()}
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        const paddingClass = size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-xs sm:text-sm';

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(opt.value)}
            className={`font-display rounded-lg font-medium transition-all duration-150 ${paddingClass} ${
              isSelected
                ? 'bg-cyan-400 text-black shadow-md font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
