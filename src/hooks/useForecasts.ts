import { useCallback, useEffect, useState } from 'react';
import type { Crag, Forecast } from '../types';
import { clearWeatherCache, fetchForecast } from '../lib/weather';

export interface ForecastsState {
  forecasts: Record<string, Forecast>;
  loading: boolean;
  errors: Record<string, string>;
  refresh: () => void;
}

export function useForecasts(crags: Crag[]): ForecastsState {
  const [forecasts, setForecasts] = useState<Record<string, Forecast>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all(
      crags.map(async (crag) => {
        try {
          const f = await fetchForecast(crag);
          return { id: crag.id, forecast: f, err: null };
        } catch (e) {
          return { id: crag.id, forecast: null, err: (e as Error).message };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, Forecast> = {};
      const errs: Record<string, string> = {};
      for (const r of results) {
        if (r.forecast) next[r.id] = r.forecast;
        else if (r.err) errs[r.id] = r.err;
      }
      setForecasts(next);
      setErrors(errs);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [crags, refreshToken]);

  const refresh = useCallback(() => {
    clearWeatherCache();
    setRefreshToken((t) => t + 1);
  }, []);

  return { forecasts, loading, errors, refresh };
}
