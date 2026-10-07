import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeEmail, validateRegistration } from '../utils/credentials.js';

test('normaliza nombre y correo al crear cuenta', () => {
  assert.deepEqual(validateRegistration({
    name: '  Iván Damboriana ',
    email: '  IVAN@example.com ',
    password: '12345678',
  }), {
    value: { name: 'Iván Damboriana', email: 'ivan@example.com', password: '12345678' },
  });
});

test('rechaza nombre demasiado corto o demasiado largo', () => {
  assert.match(validateRegistration({ name: 'A', email: 'a@b.com', password: '12345678' }).error, /nombre/);
  assert.match(validateRegistration({ name: 'a'.repeat(81), email: 'a@b.com', password: '12345678' }).error, /nombre/);
});

test('rechaza correo inválido', () => {
  assert.match(validateRegistration({ name: 'Ana', email: 'no-es-email', password: '12345678' }).error, /correo/);
});

test('requiere contraseña de al menos 8 caracteres y compatible con bcrypt', () => {
  assert.match(validateRegistration({ name: 'Ana', email: 'a@b.com', password: '1234567' }).error, /contraseña/);
  assert.match(validateRegistration({ name: 'Ana', email: 'a@b.com', password: 'á'.repeat(37) }).error, /contraseña/);
});

test('normaliza correo en el inicio de sesión', () => {
  assert.equal(normalizeEmail(' ANA@Example.com '), 'ana@example.com');
  assert.equal(normalizeEmail(undefined), '');
});
