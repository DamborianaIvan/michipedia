import { authLimiter, securityHeaders } from './middleware/security.js';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import { config, validateConfig } from './config.js';
import authRoutes from './routes/auth.js';
import { describeStartupError } from './utils/startup-error.js';

export const app = express();
app.disable('x-powered-by');
app.set('trust proxy', Number(process.env.TRUST_PROXY_HOPS) || false);
app.use(securityHeaders);
app.use((_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
app.use(cors({ origin(origin, callback) {
  if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
  const error = new Error('Origen no permitido.'); error.status = 403; return callback(error);
} }));
app.use('/api/auth/login', authLimiter());
app.use('/api/auth/register', authLimiter({ limit: 5 }));
app.use(express.json({ limit: '16kb', strict: true }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use((error, _req, res, _next) => {
  const status = [400, 403, 413, 415].includes(error.status) ? error.status : 500;
  if (status === 500) console.error('Error interno de API');
  return res.status(status).json({ message: status === 500 ? 'Ocurrió un error en el servidor.' : status === 413 ? 'La solicitud es demasiado grande.' : 'Solicitud inválida o no permitida.' });
});

export async function startServer() {
  validateConfig();
  await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 10_000 });
  await mongoose.model('User').init();
  return app.listen(config.port, () => console.log(`Michipedia API lista en puerto ${config.port}`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error(describeStartupError(error));
    process.exitCode = 1;
  });
}
