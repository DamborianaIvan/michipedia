import type { Encounter, Point } from '../domain/model';
export type MapProps = { point: Point | null; follow: boolean; encounters: Encounter[]; selected: Point | null; onPan: () => void; onPick?: (point: Point) => void; onEncounter: (catId: string) => void };
export const mapStyle = process.env.EXPO_PUBLIC_MAP_STYLE_URL || 'https://tiles.openfreemap.org/styles/liberty';
