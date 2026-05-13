import type { WeatherDay } from '../types';

interface Props {
  day?: WeatherDay;
}

function glyph(d: WeatherDay): string {
  if (d.precipMm >= 5) return '🌧️';
  if (d.precipMm >= 1) return '🌦️';
  if (d.cloudCoverMean >= 70) return '☁️';
  if (d.cloudCoverMean >= 30) return '⛅';
  return '☀️';
}

export function WeatherBadge({ day }: Props) {
  if (!day) return <span className="text-xs text-gray-400">no weather</span>;
  return (
    <span className="inline-flex items-center gap-1 text-sm text-gray-700">
      <span className="text-base">{glyph(day)}</span>
      {day.tMin.toFixed(0)}–{day.tMax.toFixed(0)}°
    </span>
  );
}
