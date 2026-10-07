import type { Feature, Polygon } from 'geojson';
import type { Point } from './model';
/** Círculo geodésico de precisión GPS en metros; no representa el recorrido. */
export function accuracyArea(point: Point): Feature<Polygon> {
  const lat = point.latitude * Math.PI / 180;
  const lng = point.longitude * Math.PI / 180;
  const angular = Math.max(0, point.accuracy ?? 0) / 6371008.8;
  const ring = Array.from({ length: 65 }, (_, i) => {
    const bearing = (i % 64) * 2 * Math.PI / 64;
    const nextLat = Math.asin(Math.sin(lat) * Math.cos(angular) + Math.cos(lat) * Math.sin(angular) * Math.cos(bearing));
    const nextLng = lng + Math.atan2(Math.sin(bearing) * Math.sin(angular) * Math.cos(lat), Math.cos(angular) - Math.sin(lat) * Math.sin(nextLat));
    return [nextLng * 180 / Math.PI, nextLat * 180 / Math.PI];
  });
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [ring] } };
}
