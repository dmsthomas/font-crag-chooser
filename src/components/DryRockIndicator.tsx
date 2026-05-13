import { dotColor, drynessLabel } from '../lib/dryness';

interface Props {
  recentRain48hMm: number;
  dryHours: number;
  verbose?: boolean;
}

export function DryRockIndicator({
  recentRain48hMm,
  dryHours,
  verbose = false,
}: Props) {
  const info = drynessLabel(dryHours, recentRain48hMm);
  const color = dotColor(dryHours, recentRain48hMm);
  const tooltip = `${recentRain48hMm.toFixed(1)}mm in last 48h · dry ${dryHours.toFixed(0)}h`;

  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-gray-700"
      title={tooltip}
    >
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      <span>{info.label}</span>
      {verbose && (
        <span className="text-gray-500">
          · {recentRain48hMm.toFixed(1)}mm/48h
        </span>
      )}
    </span>
  );
}
