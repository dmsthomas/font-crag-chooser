import type { Forecast } from '../types';

export interface RainWindow {
  startISO: string;
  endISO: string;
  hours: number;
  totalMm: number;
}

const RAIN_THRESHOLD_MM = 0.2;

export function rainWindows(
  hourly: Forecast['hourly'],
  targetDateISO: string,
  fromEpochMs: number | null,
): RainWindow[] {
  const windows: RainWindow[] = [];
  let cur: RainWindow | null = null;

  for (let i = 0; i < hourly.time.length; i++) {
    const t = hourly.time[i];
    if (!t.startsWith(targetDateISO)) continue;
    const epoch = new Date(t).getTime();
    if (fromEpochMs !== null && epoch < fromEpochMs) continue;
    const mm = hourly.precipitation[i] ?? 0;

    if (mm >= RAIN_THRESHOLD_MM) {
      if (!cur) {
        cur = { startISO: t, endISO: t, hours: 1, totalMm: mm };
      } else {
        cur.endISO = t;
        cur.hours += 1;
        cur.totalMm += mm;
      }
    } else if (cur) {
      windows.push(cur);
      cur = null;
    }
  }
  if (cur) windows.push(cur);
  return windows;
}

export function formatWindowRange(w: RainWindow): string {
  const start = w.startISO.slice(11, 16);
  const endHour = Number(w.endISO.slice(11, 13)) + 1;
  const end = `${String(endHour).padStart(2, '0')}:00`;
  return `${start}–${end}`;
}
