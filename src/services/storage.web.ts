import { emptyCollection, type Collection } from '../domain/model';
function openDB(): Promise<IDBDatabase> { return new Promise((resolve, reject) => { const request = indexedDB.open('michipedia-expo', 1); request.onupgradeneeded = () => request.result.createObjectStore('data'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
async function read<T>(key: string): Promise<T | undefined> { const db = await openDB(); try { return await new Promise((resolve, reject) => { const request = db.transaction('data').objectStore('data').get(key); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); } finally { db.close(); } }
async function write(key: string, value: unknown) { const db = await openDB(); try { await new Promise<void>((resolve, reject) => { const tx = db.transaction('data', 'readwrite'); tx.objectStore('data').put(value, key); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error); }); } finally { db.close(); } }
export async function loadCollection(): Promise<Collection> { return (await read<Collection>('collection')) ?? emptyCollection(); }
export async function saveCollection(collection: Collection) { await write('collection', collection); }
export async function persistPhoto(uri: string, _id: string): Promise<string> {
  if (uri.startsWith('data:')) return uri;
  const response = await fetch(uri); if (!response.ok) throw Error('No pudimos leer la foto.');
  const blob = await response.blob();
  return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(blob); });
}
export async function deletePhoto(_uri: string) { /* La foto está contenida en el registro IndexedDB. */ }
