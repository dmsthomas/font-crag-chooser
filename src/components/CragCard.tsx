import { Link } from 'react-router-dom';
import type { Crag, Forecast, ScoreBreakdown, DayChoice } from '../types';
import { WeatherBadge } from './WeatherBadge';
import { DryRockIndicator } from './DryRockIndicator';
import { RainForecast } from './RainForecast';
import { CircuitDots } from './CircuitDots';
import { driveMinutesFromCampsite } from '../lib/driveTime';
import { rainWindows } from '../lib/rainWindows';

interface Props {
  crag: Crag;
  forecast?: Forecast;
  breakdown: ScoreBreakdown;
  day: DayChoice;
}

function targetIsoFor(day: DayChoice): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  if (day === 'tomorrow') d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function scoreColor(score: number): string {
  if (score >= 75) return 'text-emerald-600';
  if (score >= 55) return 'text-amber-600';
  return 'text-red-600';
}

export function CragCard({ crag, forecast, breakdown, day }: Props) {
  const targetIso = targetIsoFor(day);
  const wxDay = forecast?.days.find((d) => d.date === targetIso);
  const drive = Math.round(driveMinutesFromCampsite(crag.coords));
  const windows = forecast
    ? rainWindows(
        forecast.hourly,
        targetIso,
        day === 'today' ? Date.now() : null,
      )
    : [];

  return (
    <Link
      to={`/crag/${crag.id}`}
      className="block bg-white rounded-xl shadow-sm border border-gray-200 active:bg-gray-50 transition-colors"
    >
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-base font-semibold truncate">{crag.name}</h2>
            <div className="mt-1">
              <CircuitDots circuits={crag.circuits} />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600">
              <span>🚗 {drive} min</span>
              <span>🥾 {crag.walkInMinutes} min</span>
              <WeatherBadge day={wxDay} />
            </div>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${scoreColor(breakdown.total)}`}>
            {breakdown.total}
          </div>
        </div>

        {forecast && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <DryRockIndicator
              recentRain48hMm={forecast.recentRain48hMm}
              dryHours={forecast.dryHours}
            />
          </div>
        )}

        {forecast && <RainForecast windows={windows} dense maxChips={2} />}

        {breakdown.reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-gray-100">
            {breakdown.reasons.map((r) => (
              <span
                key={r}
                className="text-[11px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full"
              >
                {r}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
