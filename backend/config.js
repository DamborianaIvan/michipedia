import 'dotenv/config';

export const config = Object.freeze({
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:8081')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
});

export function validateConfig() {
  if (!config.mongoUri) throw new Error('Falta configurar MONGODB_URI.');
  if (!config.jwtSecret || config.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
  }
}
