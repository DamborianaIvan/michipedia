export type Point = { latitude: number; longitude: number; accuracy: number | null; source: 'gps' | 'manual'; timestamp: number };
export type Cat = { id: string; number: number; name: string };
export type Encounter = { id: string; catId: string; photoUri: string; capturedAt: string; point: Point };
export type Collection = { version: 1; cats: Cat[]; encounters: Encounter[] };
export const emptyCollection = (): Collection => ({ version: 1, cats: [], encounters: [] });
export function validPoint(latitude: string, longitude: string): boolean {
  return latitude.trim() !== '' && longitude.trim() !== '' && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude)) && Math.abs(Number(latitude)) <= 90 && Math.abs(Number(longitude)) <= 180;
}
export function addEncounter(collection: Collection, encounter: Encounter, name: string, existing: string | null): Collection {
  if (existing && !collection.cats.some(c => c.id === existing)) throw Error('El michi seleccionado ya no existe.');
  const number = Math.max(0, ...collection.cats.map(c => c.number)) + 1;
  return { version: 1, cats: existing ? collection.cats : [...collection.cats, { id: encounter.catId, number, name: name.trim() || `Michi ${number}` }], encounters: [...collection.encounters, encounter] };
}
export function removeEncounter(collection: Collection, id: string): Collection {
  const encounters = collection.encounters.filter(e => e.id !== id);
  return { version: 1, encounters, cats: collection.cats.filter(c => encounters.some(e => e.catId === c.id)) };
}
