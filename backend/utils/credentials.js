export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}
export function validateCredentials(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { error: 'Ingresá correo y contraseña.' };
  const email = normalizeEmail(input.email);
  const password = typeof input.password === 'string' ? input.password : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Ingresá un correo válido.' };
  if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72 || password.includes('\0')) return { error: 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.' };
  return { value: { email, password } };
}
export function validateRegistration(input) {
  const credentials = validateCredentials(input);
  if (credentials.error) return credentials;
  const name = typeof input.name === 'string' ? input.name.trim() : '';
  if (name.length < 2 || name.length > 80 || /[\u0000-\u001f\u007f]/.test(name)) return { error: 'Ingresá un nombre de entre 2 y 80 caracteres.' };
  return { value: { name, ...credentials.value } };
}
