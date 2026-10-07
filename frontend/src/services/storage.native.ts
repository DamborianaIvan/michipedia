import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Directory, Paths } from 'expo-file-system';
import { emptyCollection, type Collection } from '../domain/model';
const photoDirectory = new Directory(Paths.document, 'michipedia-photos');
export async function loadCollection(userId: string): Promise<Collection> {
  const key = `michipedia.collection.v1.${userId}`;
  let raw = await AsyncStorage.getItem(key);
  if (!raw) {
    // Transfer the existing alpha collection to the first account used on this device.
    raw = await AsyncStorage.getItem('michipedia.collection.v1');
    if (raw) {
      await AsyncStorage.setItem(key, raw);
      await AsyncStorage.removeItem('michipedia.collection.v1');
    }
  }
  if (!raw) return emptyCollection();
  const data = JSON.parse(raw) as Collection;
  if (data.version !== 1 || !Array.isArray(data.cats) || !Array.isArray(data.encounters)) throw Error('Colección local incompatible.');
  return data;
}
export async function saveCollection(collection: Collection, userId: string) { await AsyncStorage.setItem(`michipedia.collection.v1.${userId}`, JSON.stringify(collection)); }
export async function persistPhoto(uri: string, id: string) {
  photoDirectory.create({ intermediates: true, idempotent: true });
  const destination = new File(photoDirectory, `${id}.${uri.split('?')[0].match(/\.([a-zA-Z0-9]{2,5})$/)?.[1] ?? 'jpg'}`);
  new File(uri).copy(destination);
  return destination.uri;
}
export async function deletePhoto(uri: string) { const file = new File(uri); if (file.exists && uri.startsWith(photoDirectory.uri)) file.delete(); }
