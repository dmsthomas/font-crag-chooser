import { formatWindowRange, type RainWindow } from '../lib/rainWindows';

interface Props {
  windows: RainWindow[];
  dense?: boolean;
  maxChips?: number;
}

export function RainForecast({ windows, dense = false, maxChips }: Props) {
  if (windows.length === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-gray-600">
        <span>☀️</span> No rain expected
      </span>
    );
  }

  const shown = maxChips ? windows.slice(0, maxChips) : windows;
  const hidden = windows.length - shown.length;
  const padding = dense ? 'px-1.5 py-0.5' : 'px-2 py-1';

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {shown.map((w) => (
        <span
          key={w.startISO}
          className={`inline-flex items-center gap-1 ${padding} rounded-full bg-blue-50 text-blue-800 text-xs`}
        >
          <span>☔</span>
          <span className="tabular-nums">{formatWindowRange(w)}</span>
          <span className="text-blue-600/70 tabular-nums">· {w.totalMm.toFixed(1)}mm</span>
        </span>
      ))}
      {hidden > 0 && (
        <span className="text-xs text-gray-500">+{hidden} more</span>
      )}
    </div>
  );
}
