interface Props {
  recentRain48hMm: number;
  dryHours: number;
}

function classify(rain: number, hours: number): { label: string; color: string } {
  if (rain < 0.2 && hours > 24) return { label: 'Bone dry', color: 'bg-emerald-500' };
  if (rain < 2 && hours > 12) return { label: 'Probably dry', color: 'bg-emerald-400' };
  if (rain <= 5 || (hours >= 6 && hours <= 12)) return { label: 'Damp', color: 'bg-amber-500' };
  return { label: 'Seeping', color: 'bg-red-500' };
}

export function DryRockIndicator({ recentRain48hMm, dryHours }: Props) {
  const { label, color } = classify(recentRain48hMm, dryHours);
  return (
    <span
      className="inline-flex items-center gap-1 text-xs text-gray-700"
      title={`${recentRain48hMm.toFixed(1)}mm in last 48h, dry for ${dryHours.toFixed(0)}h`}
    >
      <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}
