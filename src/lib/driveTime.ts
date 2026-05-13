import { haversineKm } from './haversine';
import { CAMPSITE } from '../config/campsite';
import { DRIVE_DETOUR, DRIVE_KMH } from '../config/scoring';

export function driveMinutesFromCampsite(coords: {
  lat: number;
  lon: number;
}): number {
  const km = haversineKm(CAMPSITE, coords) * DRIVE_DETOUR;
  return (km / DRIVE_KMH) * 60;
}
