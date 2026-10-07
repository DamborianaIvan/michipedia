import { createRequire } from 'node:module';
const backend = createRequire(new URL('../backend/package.json', import.meta.url));
const frontend = createRequire(new URL('../frontend/package.json', import.meta.url));
let failed = false;
for (const [name, check] of [
  ['API: cors, Express y Mongoose', () => { for (const name of ['cors', 'express', 'mongoose']) backend(name); }],
  ['Binario CSS de esta plataforma', () => frontend('lightningcss').transform({ filename: 'check.css', code: Buffer.from('a { color: green }') })],
]) {
  try { check(); console.log(`OK: ${name}`); }
  catch { failed = true; console.error(`Falta instalar: ${name}`); }
}
if (failed) {
  console.error('Desde la raíz del repositorio ejecutá: npm ci --include=optional');
  process.exitCode = 1;
}
