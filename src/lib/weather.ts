import type { Crag, Forecast } from '../types';

const ENDPOINT = 'https://api.open-meteo.com/v1/forecast';

const CACHE_PREFIX = 'fcc:weather:';
const TTL_MS = 60 * 60 * 1000;

function cacheKey(crag: Crag) {
  const hourBucket = new Date();
  hourBucket.setMinutes(0, 0, 0);
  return `${CACHE_PREFIX}${crag.id}:${hourBucket.toISOString()}`;
}

function readCache(crag: Crag): Forecast | null {
  try {
    const raw = localStorage.getItem(cacheKey(crag));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Forecast;
    if (Date.now() - parsed.fetchedAt > TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(crag: Crag, forecast: Forecast) {
  try {
    localStorage.setItem(cacheKey(crag), JSON.stringify(forecast));
  } catch {
    // ignore quota issues
  }
}

function readAnyStaleCache(crag: Crag): Forecast | null {
  try {
    let best: Forecast | null = null;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (!k.startsWith(`${CACHE_PREFIX}${crag.id}:`)) continue;
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as Forecast;
      if (!best || parsed.fetchedAt > best.fetchedAt) best = parsed;
    }
    return best;
  } catch {
    return null;
  }
}

interface OpenMeteoResponse {
  hourly?: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    precipitation_probability: number[];
    windspeed_10m: number[];
    cloudcover: number[];
  };
  daily?: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_sum: number[];
    precipitation_hours: number[];
    precipitation_probability_max?: number[];
    windspeed_10m_max?: number[];
  };
}

function summarise(crag: Crag, data: OpenMeteoResponse): Forecast {
  const hourly = data.hourly ?? {
    time: [],
    temperature_2m: [],
    precipitation: [],
    precipitation_probability: [],
    windspeed_10m: [],
    cloudcover: [],
  };

  const now = Date.now();
  let recentRain48hMm = 0;
  let dryHours = 0;
  let lastWetIndex = -1;
  for (let i = 0; i < hourly.time.length; i++) {
    const t = new Date(hourly.time[i]).getTime();
    if (t > now) continue;
    const mm = hourly.precipitation[i] ?? 0;
    if (now - t <= 48 * 3600 * 1000) recentRain48hMm += mm;
    if (mm > 0.2) lastWetIndex = i;
  }
  if (lastWetIndex >= 0) {
    const lastWetTime = new Date(hourly.time[lastWetIndex]).getTime();
    dryHours = Math.max(0, (now - lastWetTime) / 3600000);
  } else {
    dryHours = 48;
  }

  const daily = data.daily ?? {
    time: [],
    temperature_2m_max: [],
    temperature_2m_min: [],
    precipitation_sum: [],
    precipitation_hours: [],
  };

  const days = daily.time.map((date, i) => ({
    date,
    tMax: daily.temperature_2m_max[i],
    tMin: daily.temperature_2m_min[i],
    precipMm: daily.precipitation_sum[i] ?? 0,
    precipHours: daily.precipitation_hours[i] ?? 0,
    precipProbMax: daily.precipitation_probability_max?.[i] ?? 0,
    windKmhMax: daily.windspeed_10m_max?.[i] ?? 0,
    cloudCoverMean: averageDay(hourly.time, hourly.cloudcover, date),
  }));

  return {
    cragId: crag.id,
    fetchedAt: now,
    recentRain48hMm,
    dryHours,
    days,
    hourly: {
      time: hourly.time,
      temperature_2m: hourly.temperature_2m,
      precipitation: hourly.precipitation,
      windspeed_10m: hourly.windspeed_10m,
    },
  };
}

function averageDay(times: string[], values: number[], dateISO: string): number {
  let sum = 0;
  let n = 0;
  for (let i = 0; i < times.length; i++) {
    if (times[i].startsWith(dateISO)) {
      sum += values[i] ?? 0;
      n++;
    }
  }
  return n > 0 ? sum / n : 0;
}

export async function fetchForecast(crag: Crag): Promise<Forecast> {
  const cached = readCache(crag);
  if (cached) return cached;

  const url = new URL(ENDPOINT);
  url.searchParams.set('latitude', String(crag.coords.lat));
  url.searchParams.set('longitude', String(crag.coords.lon));
  url.searchParams.set(
    'hourly',
    'temperature_2m,precipitation,precipitation_probability,windspeed_10m,cloudcover',
  );
  url.searchParams.set(
    'daily',
    'precipitation_sum,temperature_2m_max,temperature_2m_min,precipitation_hours,precipitation_probability_max,windspeed_10m_max',
  );
  url.searchParams.set('past_days', '2');
  url.searchParams.set('forecast_days', '3');
  url.searchParams.set('timezone', 'Europe/Paris');

  try {
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`weather ${res.status}`);
    const data = (await res.json()) as OpenMeteoResponse;
    const forecast = summarise(crag, data);
    writeCache(crag, forecast);
    return forecast;
  } catch (err) {
    const stale = readAnyStaleCache(crag);
    if (stale) return stale;
    throw err;
  }
}

export function clearWeatherCache() {
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(CACHE_PREFIX)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
}
