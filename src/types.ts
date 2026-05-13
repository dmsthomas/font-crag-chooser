export type CircuitColor =
  | 'enfants'
  | 'white'
  | 'yellow'
  | 'orange'
  | 'blue'
  | 'red'
  | 'black';

export interface Circuit {
  color: CircuitColor;
  count?: number;
}

export type Approach = 'flat' | 'mostly-flat' | 'some-scramble';

export interface Crag {
  id: string;
  name: string;
  coords: { lat: number; lon: number };
  circuits: Circuit[];
  walkInMinutes: number;
  approach: Approach;
  kidFriendly: 1 | 2 | 3 | 4 | 5;
  shade: 'sunny' | 'mixed' | 'shaded';
  parking: {
    type: 'lot' | 'roadside';
    capacity: 'small' | 'medium' | 'large';
  };
  aspect?: 'N' | 'S' | 'E' | 'W' | 'mixed';
  seepageFactor?: number;
  boolderSlug?: string;
  notes?: string;
}

export interface WeatherDay {
  date: string;
  tMin: number;
  tMax: number;
  precipMm: number;
  precipHours: number;
  precipProbMax: number;
  windKmhMax: number;
  cloudCoverMean: number;
}

export interface Forecast {
  cragId: string;
  fetchedAt: number;
  recentRain48hMm: number;
  dryHours: number;
  days: WeatherDay[];
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation: number[];
    windspeed_10m: number[];
  };
}

export type DayChoice = 'today' | 'tomorrow';

export interface ScoreBreakdown {
  total: number;
  parts: {
    key: string;
    label: string;
    weight: number;
    sub: number;
    weighted: number;
    detail?: string;
  }[];
  reasons: string[];
}
