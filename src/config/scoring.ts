export interface Weights {
  dryness: number;
  circuits: number;
  temp: number;
  drive: number;
  precip: number;
  kids: number;
  approach: number;
  wind: number;
}

export const WEIGHTS: Weights = {
  dryness: 0.25,
  circuits: 0.2,
  temp: 0.15,
  drive: 0.15,
  precip: 0.1,
  kids: 0.05,
  approach: 0.05,
  wind: 0.05,
};

export type WeightKey = keyof Weights;

export const CIRCUIT_POINTS: Record<string, number> = {
  enfants: 40,
  white: 30,
  yellow: 15,
  orange: 10,
  blue: 5,
  red: 0,
  black: 0,
};

export const APPROACH_POINTS = {
  flat: 100,
  'mostly-flat': 70,
  'some-scramble': 40,
} as const;

export const DRIVE_KMH = 50;
export const DRIVE_DETOUR = 1.3;
export const DRIVE_MAX_MIN = 60;

export const IDEAL_TEMP_C = 10;
export const TEMP_ZERO_LOW = -5;
export const TEMP_ZERO_HIGH = 25;

export const WIND_BAD_KMH = 40;
