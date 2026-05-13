import type { Crag, DayChoice, Forecast, ScoreBreakdown } from '../types';
import {
  APPROACH_POINTS,
  CIRCUIT_POINTS,
  DRIVE_MAX_MIN,
  IDEAL_TEMP_C,
  TEMP_ZERO_HIGH,
  TEMP_ZERO_LOW,
  WEIGHTS,
  WIND_BAD_KMH,
} from '../config/scoring';
import { driveMinutesFromCampsite } from './driveTime';

export interface ScoreOptions {
  day: DayChoice;
  kidsInGroup: boolean;
  weights?: Partial<typeof WEIGHTS>;
}

function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

function dryness(forecast: Forecast, seepageFactor: number): {
  score: number;
  detail: string;
} {
  const rain = forecast.recentRain48hMm;
  const hours = forecast.dryHours;
  let base: number;
  if (rain < 0.2 && hours > 24) base = 100;
  else if (rain < 2 && hours > 12) base = 70;
  else if (rain <= 5 || (hours >= 6 && hours <= 12)) base = 40;
  else base = 10;
  const penalty = (100 - base) * seepageFactor;
  const score = clamp(100 - penalty);
  return {
    score,
    detail: `${rain.toFixed(1)}mm in last 48h, dry for ${hours.toFixed(0)}h`,
  };
}

function tempScore(tMax: number, tMin: number): { score: number; detail: string } {
  const mid = (tMax + tMin) / 2;
  let s: number;
  if (mid <= TEMP_ZERO_LOW || mid >= TEMP_ZERO_HIGH) s = 0;
  else if (mid <= IDEAL_TEMP_C) {
    s = 100 * ((mid - TEMP_ZERO_LOW) / (IDEAL_TEMP_C - TEMP_ZERO_LOW));
  } else {
    s = 100 * (1 - (mid - IDEAL_TEMP_C) / (TEMP_ZERO_HIGH - IDEAL_TEMP_C));
  }
  return {
    score: clamp(s),
    detail: `${tMin.toFixed(0)}–${tMax.toFixed(0)}°C`,
  };
}

function precipScore(precipMm: number, probMax: number): {
  score: number;
  detail: string;
} {
  const mmPart = clamp(100 - precipMm * 20);
  const probPart = clamp(100 - probMax);
  return {
    score: Math.round((mmPart + probPart) / 2),
    detail: `${precipMm.toFixed(1)}mm, ${probMax}% chance`,
  };
}

function windScore(windKmh: number): { score: number; detail: string } {
  const s = clamp(100 - (windKmh / WIND_BAD_KMH) * 100);
  return { score: s, detail: `${windKmh.toFixed(0)} km/h max` };
}

function driveScore(minutes: number): { score: number; detail: string } {
  const s = clamp(100 - (minutes / DRIVE_MAX_MIN) * 100);
  return { score: s, detail: `${minutes.toFixed(0)} min` };
}

function circuitsScore(crag: Crag): { score: number; detail: string } {
  let total = 0;
  const seen: string[] = [];
  for (const c of crag.circuits) {
    const pts = CIRCUIT_POINTS[c.color] ?? 0;
    if (pts > 0) {
      total += pts;
      seen.push(c.color);
    }
  }
  return { score: clamp(total), detail: seen.length ? seen.join(', ') : 'none easy' };
}

function approachScore(crag: Crag): { score: number; detail: string } {
  return {
    score: APPROACH_POINTS[crag.approach],
    detail: `${crag.approach}, ${crag.walkInMinutes} min walk`,
  };
}

function kidsScore(crag: Crag): { score: number; detail: string } {
  return { score: crag.kidFriendly * 20, detail: `${crag.kidFriendly}/5` };
}

export function scoreCrag(
  crag: Crag,
  forecast: Forecast | null,
  options: ScoreOptions,
): ScoreBreakdown {
  const weights = { ...WEIGHTS, ...(options.weights ?? {}) };
  if (!options.kidsInGroup) weights.kids = 0;

  const targetDayIndex = options.day === 'today' ? findDayIndex(forecast, 0) : findDayIndex(forecast, 1);

  const day = forecast?.days[targetDayIndex];
  const seepage = crag.seepageFactor ?? 1.0;

  const parts = [
    {
      key: 'dryness',
      label: 'Dry rock',
      weight: weights.dryness,
      ...(forecast
        ? dryness(forecast, seepage)
        : { score: 50, detail: 'no data' }),
    },
    {
      key: 'circuits',
      label: 'Easy circuits',
      weight: weights.circuits,
      ...circuitsScore(crag),
    },
    {
      key: 'temp',
      label: 'Temperature',
      weight: weights.temp,
      ...(day ? tempScore(day.tMax, day.tMin) : { score: 50, detail: 'no data' }),
    },
    {
      key: 'drive',
      label: 'Drive from camp',
      weight: weights.drive,
      ...driveScore(driveMinutesFromCampsite(crag.coords)),
    },
    {
      key: 'precip',
      label: 'Rain forecast',
      weight: weights.precip,
      ...(day
        ? precipScore(day.precipMm, day.precipProbMax)
        : { score: 50, detail: 'no data' }),
    },
    {
      key: 'kids',
      label: 'Kid-friendly',
      weight: weights.kids,
      ...kidsScore(crag),
    },
    {
      key: 'approach',
      label: 'Approach',
      weight: weights.approach,
      ...approachScore(crag),
    },
    {
      key: 'wind',
      label: 'Wind',
      weight: weights.wind,
      ...(day ? windScore(day.windKmhMax) : { score: 50, detail: 'no data' }),
    },
  ];

  const totalWeighted = parts.reduce((acc, p) => acc + (p.score * p.weight), 0);
  const weightSum = parts.reduce((acc, p) => acc + p.weight, 0);
  const total = weightSum > 0 ? totalWeighted / weightSum : 0;

  const enriched = parts.map((p) => ({
    ...p,
    sub: Math.round(p.score),
    weighted: +(p.score * p.weight).toFixed(1),
  }));

  const reasons = topReasons(enriched, crag);

  return {
    total: Math.round(total),
    parts: enriched,
    reasons,
  };
}

function findDayIndex(forecast: Forecast | null, offset: number): number {
  if (!forecast) return 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(today.getTime() + offset * 86400000);
  const targetISO = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}-${String(target.getDate()).padStart(2, '0')}`;
  const idx = forecast.days.findIndex((d) => d.date === targetISO);
  return idx >= 0 ? idx : Math.min(offset, forecast.days.length - 1);
}

function topReasons(
  parts: { key: string; label: string; sub: number; weight: number }[],
  crag: Crag,
): string[] {
  const sorted = [...parts]
    .filter((p) => p.weight > 0)
    .sort((a, b) => b.sub * b.weight - a.sub * a.weight);
  const reasons: string[] = [];
  const enfants = crag.circuits.some((c) => c.color === 'enfants');
  const white = crag.circuits.some((c) => c.color === 'white');
  if (enfants) reasons.push('👶 enfants circuit');
  if (white && !enfants) reasons.push('⚪ white circuit');
  for (const p of sorted) {
    if (reasons.length >= 3) break;
    if (p.sub >= 60) reasons.push(`${p.label.toLowerCase()} ${p.sub}`);
  }
  return reasons.slice(0, 3);
}
