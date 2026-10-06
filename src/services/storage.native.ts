import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Directory, Paths } from 'expo-file-system';
import { emptyCollection, type Collection } from '../domain/model';
const key = 'michipedia.collection.v1';
const photoDirectory = new Directory(Paths.document, 'michipedia-photos');
export async function loadCollection(): Promise<Collection> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return emptyCollection();
  const data = JSON.parse(raw) as Collection;
  if (data.version !== 1 || !Array.isArray(data.cats) || !Array.isArray(data.encounters)) throw Error('Colección local incompatible.');
  return data;
}
export async function saveCollection(collection: Collection) { await AsyncStorage.setItem(key, JSON.stringify(collection)); }
export async function persistPhoto(uri: string, id: string) {
  photoDirectory.create({ intermediates: true, idempotent: true });
  const destination = new File(photoDirectory, `${id}.${uri.split('?')[0].match(/\.([a-zA-Z0-9]{2,5})$/)?.[1] ?? 'jpg'}`);
  new File(uri).copy(destination);
  return destination.uri;
}
export async function deletePhoto(uri: string) { const file = new File(uri); if (file.exists && uri.startsWith(photoDirectory.uri)) file.delete(); }
