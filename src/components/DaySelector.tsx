import type { DayChoice } from '../types';

interface Props {
  value: DayChoice;
  onChange: (d: DayChoice) => void;
}

export function DaySelector({ value, onChange }: Props) {
  const base =
    'flex-1 py-2 text-sm font-medium rounded-md transition-colors';
  const active = 'bg-gray-900 text-white shadow';
  const inactive = 'text-gray-600';
  return (
    <div className="inline-flex p-1 bg-gray-200 rounded-lg w-full max-w-xs">
      <button
        className={`${base} ${value === 'today' ? active : inactive}`}
        onClick={() => onChange('today')}
        type="button"
      >
        Today
      </button>
      <button
        className={`${base} ${value === 'tomorrow' ? active : inactive}`}
        onClick={() => onChange('tomorrow')}
        type="button"
      >
        Tomorrow
      </button>
    </div>
  );
}
