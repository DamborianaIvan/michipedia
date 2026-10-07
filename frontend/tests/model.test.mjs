import test from 'node:test';
import assert from 'node:assert/strict';
import { addEncounter, emptyCollection, removeEncounter, validPoint } from '../src/domain/model.ts';
const point = { latitude: -34, longitude: -58, accuracy: 10, source: 'gps', timestamp: 1 };
const encounter = id => ({ id, catId: 'cat1', photoUri: 'photo.jpg', capturedAt: '2026-10-06T13:00:00Z', point });
test('nuevo gato y reencuentro mantienen un gato con dos encuentros', () => {
  let collection = addEncounter(emptyCollection(), encounter('1'), ' Bigotes ', null);
  collection = addEncounter(collection, encounter('2'), 'otro nombre', 'cat1');
  assert.equal(collection.cats.length, 1); assert.equal(collection.cats[0].name, 'Bigotes'); assert.equal(collection.encounters.length, 2);
});
test('eliminar el último encuentro elimina el gato; conservar uno lo mantiene', () => {
  let collection = addEncounter(emptyCollection(), encounter('1'), '', null);
  collection = addEncounter(collection, encounter('2'), '', 'cat1');
  assert.equal(removeEncounter(collection, '1').cats.length, 1);
  assert.equal(removeEncounter(removeEncounter(collection, '1'), '2').cats.length, 0);
  assert.equal(collection.encounters.length, 2);
});
test('coordenadas vacías, infinitas y fuera de rango son inválidas; cero es válido', () => {
  for (const [lat,lng] of [['','0'],['0',' '],['91','0'],['0','181'],['Infinity','0'],['abc','0']]) assert.equal(validPoint(lat,lng), false);
  assert.equal(validPoint('0','0'), true); assert.equal(validPoint('-34.1','-58.2'), true);
});
test('rechaza reencuentro con un gato que no existe', () => assert.throws(() => addEncounter(emptyCollection(), encounter('1'), '', 'cat1')));
