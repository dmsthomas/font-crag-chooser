import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CRAGS } from '../data/crags';
import { useForecasts } from '../hooks/useForecasts';
import { scoreCrag } from '../lib/score';
import { CragCard } from '../components/CragCard';
import { DaySelector } from '../components/DaySelector';
import { loadPrefs } from '../lib/storage';
import type { DayChoice } from '../types';

function defaultDay(): DayChoice {
  return new Date().getHours() >= 18 ? 'tomorrow' : 'today';
}

export function ListView() {
  const [day, setDay] = useState<DayChoice>(defaultDay());
  const prefs = loadPrefs();
  const { forecasts, loading, errors, refresh } = useForecasts(CRAGS);

  const ranked = useMemo(() => {
    return CRAGS.map((crag) => {
      const forecast = forecasts[crag.id];
      const breakdown = scoreCrag(crag, forecast ?? null, {
        day,
        kidsInGroup: prefs.kidsInGroup,
      });
      return { crag, forecast, breakdown };
    }).sort((a, b) => b.breakdown.total - a.breakdown.total);
  }, [forecasts, day, prefs.kidsInGroup]);

  const errorCount = Object.keys(errors).length;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-screen-sm mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1">
            <h1 className="text-lg font-bold">Font Crag Chooser</h1>
            <p className="text-xs text-gray-500">From Camping Ile de Boulancourt</p>
          </div>
          <Link
            to="/settings"
            className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200"
            aria-label="Settings"
          >
            ⚙️
          </Link>
        </div>
        <div className="max-w-screen-sm mx-auto px-4 pb-3">
          <DaySelector value={day} onChange={setDay} />
        </div>
      </header>

      <main className="max-w-screen-sm mx-auto px-4 py-4 space-y-3">
        {loading && (
          <p className="text-sm text-gray-500 text-center py-4">Loading forecasts…</p>
        )}
        {!loading && errorCount > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            {errorCount} forecast{errorCount > 1 ? 's' : ''} failed to load.{' '}
            <button onClick={refresh} className="underline">
              Retry
            </button>
          </div>
        )}
        {ranked.map(({ crag, forecast, breakdown }) => (
          <CragCard
            key={crag.id}
            crag={crag}
            forecast={forecast}
            breakdown={breakdown}
            day={day}
          />
        ))}
        <div className="text-center pt-2">
          <button
            onClick={refresh}
            className="text-xs text-gray-500 underline"
            type="button"
          >
            Refresh weather
          </button>
        </div>
      </main>
    </div>
  );
}
