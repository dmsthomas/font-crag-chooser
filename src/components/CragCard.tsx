import { Link } from 'react-router-dom';
import type { Crag, Forecast, ScoreBreakdown, DayChoice } from '../types';
import { WeatherBadge } from './WeatherBadge';
import { DryRockIndicator } from './DryRockIndicator';
import { driveMinutesFromCampsite } from '../lib/driveTime';

interface Props {
  crag: Crag;
  forecast?: Forecast;
  breakdown: ScoreBreakdown;
  day: DayChoice;
}

function dayIndexFor(day: DayChoice, forecast?: Forecast): number {
  if (!forecast) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(today.getTime() + (day === 'today' ? 0 : 86400000));
  const iso = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  const idx = forecast.days.findIndex((d) => d.date === iso);
  return idx >= 0 ? idx : day === 'today' ? 0 : 1;
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 55) return 'text-amber-600';
  return 'text-red-600';
}

export function CragCard({ crag, forecast, breakdown, day }: Props) {
  const idx = dayIndexFor(day, forecast);
  const wxDay = forecast?.days[idx];
  const drive = Math.round(driveMinutesFromCampsite(crag.coords));
  const hasEnfants = crag.circuits.some((c) => c.color === 'enfants');

  return (
    <Link
      to={`/crag/${crag.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 active:bg-gray-50 transition-colors"
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold truncate">{crag.name}</h2>
              {hasEnfants && (
                <span className="text-xs bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">
                  👶 enfants
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
              <span>🚗 {drive} min</span>
              <span>🥾 {crag.walkInMinutes} min</span>
              {forecast && (
                <DryRockIndicator
                  recentRain48hMm={forecast.recentRain48hMm}
                  dryHours={forecast.dryHours}
                />
              )}
            </div>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${scoreColor(breakdown.total)}`}>
            {breakdown.total}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <WeatherBadge day={wxDay} />
          <div className="flex flex-wrap gap-1 justify-end">
            {breakdown.reasons.map((r) => (
              <span
                key={r}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
