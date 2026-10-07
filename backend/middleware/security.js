import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';

// MemoryStore is suitable for one process. Use a shared store for multiple instances.
export function authLimiter({ limit = 20, windowMs = 15 * 60_000 } = {}) {
  return rateLimit({
    windowMs, limit, standardHeaders: 'draft-8', legacyHeaders: false,
    message: { message: 'Demasiados intentos. Esperá unos minutos antes de reintentar.' },
  });
}
export const securityHeaders = helmet();
