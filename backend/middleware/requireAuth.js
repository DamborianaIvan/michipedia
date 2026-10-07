import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  let payload;
  try {
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) return res.status(401).json({ message: 'Iniciá sesión para continuar.' });
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'], issuer: 'michipedia', audience: 'michipedia-app' });
    if (typeof payload.sub !== 'string' || !/^[a-f0-9]{24}$/i.test(payload.sub)) return res.status(401).json({ message: 'La sesión ya no es válida.' });
  } catch {
    return res.status(401).json({ message: 'La sesión ya no es válida.' });
  }
  try {
    const user = await User.findById(payload.sub).select('_id name email');
    if (!user) return res.status(401).json({ message: 'La sesión ya no es válida.' });
    req.user = user;
    return next();
  } catch (error) { return next(error); }
}
