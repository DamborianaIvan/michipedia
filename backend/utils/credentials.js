export function validateRegistration({ name, email, password } = {}) {
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanPassword = typeof password === 'string' ? password : '';

  if (cleanName.length < 2 || cleanName.length > 80) return { error: 'Ingresá un nombre de entre 2 y 80 caracteres.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return { error: 'Ingresá un correo válido.' };
  if (cleanPassword.length < 8 || Buffer.byteLength(cleanPassword, 'utf8') > 72) return { error: 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.' };

  return { value: { name: cleanName, email: cleanEmail, password: cleanPassword } };
}

export function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}
