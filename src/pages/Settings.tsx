import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadPrefs, savePrefs } from '../lib/storage';
import { clearWeatherCache } from '../lib/weather';
import { CAMPSITE } from '../config/campsite';

export function Settings() {
  const [prefs, setPrefs] = useState(loadPrefs());
  const [refreshed, setRefreshed] = useState(false);

  function update<K extends keyof typeof prefs>(key: K, value: (typeof prefs)[K]) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    savePrefs(next);
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-screen-sm mx-auto px-4 py-3 flex items-center gap-2">
          <Link to="/" className="p-2 -ml-2 rounded-lg hover:bg-gray-100" aria-label="Back">
            ←
          </Link>
          <h1 className="text-lg font-bold flex-1">Settings</h1>
        </div>
      </header>

      <main className="max-w-screen-sm mx-auto px-4 py-4 space-y-4">
        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-2">Group</h2>
          <label className="flex items-center justify-between py-2">
            <span>Kids in group</span>
            <input
              type="checkbox"
              checked={prefs.kidsInGroup}
              onChange={(e) => update('kidsInGroup', e.target.checked)}
              className="w-5 h-5"
            />
          </label>
          <p className="text-xs text-gray-500">
            When on, kid-friendliness factors into the score.
          </p>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-2">Campsite</h2>
          <p className="text-sm">{CAMPSITE.name}</p>
          <p className="text-xs text-gray-500">
            {CAMPSITE.lat.toFixed(4)}, {CAMPSITE.lon.toFixed(4)}
          </p>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold mb-2">Weather</h2>
          <button
            type="button"
            onClick={() => {
              clearWeatherCache();
              setRefreshed(true);
              setTimeout(() => setRefreshed(false), 2000);
            }}
            className="w-full bg-gray-900 text-white py-2 rounded-lg font-medium"
          >
            {refreshed ? 'Cache cleared — pull to reload' : 'Clear weather cache'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            Forecasts are cached for 1 hour. Stale data is still shown when offline.
          </p>
        </section>

        <p className="text-xs text-gray-400 text-center pt-2">
          Weather: Open-Meteo · No tracking, no accounts.
        </p>
      </main>
    </div>
  );
}
