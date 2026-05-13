export interface DrynessLabel {
  kind: 'long' | 'since';
  label: string;
  sinceISO?: string;
  hours: number;
  rainMm: number;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function drynessLabel(
  dryHours: number,
  recentRain48hMm: number,
  now = new Date(),
): DrynessLabel {
  if (dryHours >= 48) {
    return {
      kind: 'long',
      label: 'Dry > 48h',
      hours: dryHours,
      rainMm: recentRain48hMm,
    };
  }
  const since = new Date(now.getTime() - dryHours * 3600_000);
  const hh = String(since.getHours()).padStart(2, '0');
  const mm = String(since.getMinutes()).padStart(2, '0');
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const sinceDay = new Date(since);
  sinceDay.setHours(0, 0, 0, 0);
  const diffDays = Math.round((today.getTime() - sinceDay.getTime()) / 86_400_000);

  let dayLabel: string;
  if (diffDays === 0) dayLabel = 'today';
  else if (diffDays === 1) dayLabel = 'yesterday';
  else dayLabel = WEEKDAYS[sinceDay.getDay()];

  return {
    kind: 'since',
    label: `Dry since ${dayLabel} ${hh}:${mm}`,
    sinceISO: since.toISOString(),
    hours: dryHours,
    rainMm: recentRain48hMm,
  };
}

export function dotColor(
  dryHours: number,
  recentRain48hMm: number,
): string {
  if (recentRain48hMm < 0.2 && dryHours > 24) return 'bg-emerald-500';
  if (recentRain48hMm < 2 && dryHours > 12) return 'bg-emerald-400';
  if (recentRain48hMm <= 5 || (dryHours >= 6 && dryHours <= 12)) return 'bg-amber-500';
  return 'bg-red-500';
}
