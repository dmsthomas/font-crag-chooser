import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CRAGS } from '../data/crags';
import { useForecasts } from '../hooks/useForecasts';
import { scoreCrag } from '../lib/score';
import { ScoreBreakdown } from '../components/ScoreBreakdown';
import { DaySelector } from '../components/DaySelector';
import { WeatherBadge } from '../components/WeatherBadge';
import { DryRockIndicator } from '../components/DryRockIndicator';
import { RainForecast } from '../components/RainForecast';
import { driveMinutesFromCampsite } from '../lib/driveTime';
import { loadPrefs } from '../lib/storage';
import { rainWindows } from '../lib/rainWindows';
import type { DayChoice } from '../types';

function defaultDay(): DayChoice {
  return new Date().getHours() >= 18 ? 'tomorrow' : 'today';
}

function dayIso(offset: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const CIRCUIT_LABEL: Record<string, string> = {
  enfants: '👶 Enfants',
  white: '⚪ White',
  yellow: '🟡 Yellow',
  orange: '🟠 Orange',
  blue: '🔵 Blue',
  red: '🔴 Red',
  black: '⚫ Black',
};

const RAIN_THRESHOLD = 0.2;

export function CragDetail() {
  const { id } = useParams<{ id: string }>();
  const crag = CRAGS.find((c) => c.id === id);
  const [day, setDay] = useState<DayChoice>(defaultDay());
  const prefs = loadPrefs();
  const { forecasts } = useForecasts(CRAGS);

  if (!crag) {
    return (
      <div className="p-6 text-center">
        <p>Crag not found.</p>
        <Link to="/" className="text-blue-600 underline">
          Back
        </Link>
      </div>
    );
  }

  const forecast = forecasts[crag.id];
  const breakdown = useMemo(
    () =>
      scoreCrag(crag, forecast ?? null, { day, kidsInGroup: prefs.kidsInGroup }),
    [crag, forecast, day, prefs.kidsInGroup],
  );

  const targetIso = dayIso(day === 'today' ? 0 : 1);
  const dayWeather = forecast?.days.find((d) => d.date === targetIso);
  const drive = Math.round(driveMinutesFromCampsite(crag.coords));

  const windows = forecast
    ? rainWindows(
        forecast.hourly,
        targetIso,
        day === 'today' ? Date.now() : null,
      )
    : [];

  const hourly = forecast?.hourly;
  const climbHours = hourly
    ? hourly.time
        .map((t, i) => ({ t, i }))
        .filter((entry) => {
          if (!entry.t.startsWith(targetIso)) return false;
          const hour = Number(entry.t.slice(11, 13));
          return hour >= 10 && hour <= 18;
        })
    : [];

  const mapsLink = `https://www.google.com/maps/dir/?api=1&destination=${crag.coords.lat},${crag.coords.lon}`;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-screen-sm mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-gray-100" aria-label="Back">
            ←
          </Link>
          <h1 className="text-lg font-bold truncate flex-1">{crag.name}</h1>
          <div className="text-2xl font-bold tabular-nums">{breakdown.total}</div>
        </div>
        <div className="max-w-screen-sm mx-auto px-4 pb-3">
          <DaySelector value={day} onChange={setDay} />
        </div>
      </header>

      <main className="max-w-screen-sm mx-auto px-4 py-4 space-y-4">
        <section className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <WeatherBadge day={dayWeather} />
            <span className="text-xs text-gray-500">
              🚗 {drive} min · 🥾 {crag.walkInMinutes} min
            </span>
          </div>
          {forecast && (
            <>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                  Rock condition
                </div>
                <DryRockIndicator
                  recentRain48hMm={forecast.recentRain48hMm}
                  dryHours={forecast.dryHours}
                  verbose
                />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">
                  Rain {day === 'today' ? 'rest of today' : 'tomorrow'}
                </div>
                <RainForecast windows={windows} />
              </div>
            </>
          )}
          <div className="text-xs text-gray-600 space-y-1 pt-1 border-t border-gray-100">
            <div>
              Approach: {crag.approach} · 🅿️ {crag.parking.type}, {crag.parking.capacity} · Shade: {crag.shade}
            </div>
            {crag.notes && <div className="italic">{crag.notes}</div>}
          </div>
          <div className="flex flex-wrap gap-1">
            {crag.circuits.map((c) => (
              <span
                key={c.color}
                className="text-xs bg-gray-100 px-2 py-0.5 rounded-full"
              >
                {CIRCUIT_LABEL[c.color] ?? c.color}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-2">Score breakdown</h2>
          <ScoreBreakdown breakdown={breakdown} />
        </section>

        {climbHours.length > 0 && hourly && (
          <section className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold mb-2">Climbing window (10:00–18:00)</h2>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="text-xs w-full">
                <thead>
                  <tr className="text-gray-500 text-left">
                    <th className="py-1 pr-3">Hour</th>
                    <th className="py-1 pr-3">°C</th>
                    <th className="py-1 pr-3">mm</th>
                    <th className="py-1">km/h</th>
                  </tr>
                </thead>
                <tbody>
                  {climbHours.map((h) => {
                    const mm = hourly.precipitation[h.i] ?? 0;
                    const wet = mm >= RAIN_THRESHOLD;
                    return (
                      <tr
                        key={h.t}
                        className={`border-t border-gray-100 ${wet ? 'bg-blue-50' : ''}`}
                      >
                        <td className="py-1 pr-3 tabular-nums">{h.t.slice(11, 16)}</td>
                        <td className="py-1 pr-3 tabular-nums">
                          {hourly.temperature_2m[h.i]?.toFixed(0)}
                        </td>
                        <td
                          className={`py-1 pr-3 tabular-nums ${wet ? 'text-blue-800 font-medium' : ''}`}
                        >
                          {mm.toFixed(1)}
                        </td>
                        <td className="py-1 tabular-nums">
                          {hourly.windspeed_10m[h.i]?.toFixed(0)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="grid grid-cols-2 gap-2">
          <a
            href={mapsLink}
            target="_blank"
            rel="noreferrer"
            className="block text-center bg-gray-900 text-white py-3 rounded-xl font-medium"
          >
            Google Maps
          </a>
          <a
            href={`https://www.boolder.com/en/fontainebleau/${crag.boolderSlug ?? ''}`}
            target="_blank"
            rel="noreferrer"
            className="block text-center bg-orange-500 text-white py-3 rounded-xl font-medium"
          >
            Boolder
          </a>
        </div>
      </main>
    </div>
  );
}
