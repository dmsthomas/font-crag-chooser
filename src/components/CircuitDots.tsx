import type { Circuit, CircuitColor } from '../types';

const ORDER: CircuitColor[] = [
  'enfants',
  'white',
  'yellow',
  'orange',
  'blue',
  'red',
  'black',
];

const DOT_STYLE: Record<Exclude<CircuitColor, 'enfants'>, string> = {
  white: 'bg-white border border-gray-400',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  black: 'bg-gray-900',
};

const LABEL: Record<CircuitColor, string> = {
  enfants: 'Enfants',
  white: 'White',
  yellow: 'Yellow',
  orange: 'Orange',
  blue: 'Blue',
  red: 'Red',
  black: 'Black',
};

interface Props {
  circuits: Circuit[];
  size?: 'sm' | 'md';
}

export function CircuitDots({ circuits, size = 'sm' }: Props) {
  const present = new Set(circuits.map((c) => c.color));
  const dotSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  const babySize = size === 'sm' ? 'text-sm' : 'text-base';

  return (
    <div className="flex items-center gap-1">
      {ORDER.filter((c) => present.has(c)).map((c) =>
        c === 'enfants' ? (
          <span
            key={c}
            className={`${babySize} leading-none`}
            title={LABEL[c]}
            aria-label={LABEL[c]}
          >
            👶
          </span>
        ) : (
          <span
            key={c}
            className={`${dotSize} rounded-full ${DOT_STYLE[c]}`}
            title={LABEL[c]}
            aria-label={LABEL[c]}
          />
        ),
      )}
    </div>
  );
}
