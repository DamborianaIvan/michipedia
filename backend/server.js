import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import { pathToFileURL } from 'node:url';
import { config, validateConfig } from './config.js';
import authRoutes from './routes/auth.js';

export const app = express();
app.disable('x-powered-by');
app.use(cors({ origin: config.corsOrigins }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use((error, _req, res, _next) => {
  console.error(error);
  return res.status(500).json({ message: 'Ocurrió un error en el servidor.' });
});

export async function startServer() {
  validateConfig();
  await mongoose.connect(config.mongoUri);
  return app.listen(config.port, () => console.log(`Michipedia API lista en puerto ${config.port}`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error('No se pudo iniciar Michipedia API:', error.message);
    process.exitCode = 1;
  });
}
